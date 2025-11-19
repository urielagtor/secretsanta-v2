import "@fontsource/dancing-script/700.css";
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { decryptText } from '../utils/crypto';
import { PostCard } from '../components/PostCard';
import { Trans, useTranslation } from 'react-i18next';
import { MenuItem, SideMenu } from '../components/SideMenu';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, Info } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { Layout } from "../components/Layout";
import { ReceiverData } from "../types";

async function loadPairing(searchParams: URLSearchParams): Promise<[string, ReceiverData]> {
  // Legacy pairings, not generated anymore; remove after 2025-01-01
  if (searchParams.has(`name`) && searchParams.has(`key`) && searchParams.has(`pairing`)) {
    const name = searchParams.get(`name`)!;
    const key = searchParams.get(`key`)!;
    const pairing = searchParams.get(`pairing`)!;

    return [name, {name: CryptoJS.AES.decrypt(pairing, key).toString(CryptoJS.enc.Utf8)}];
  }

  if (searchParams.has(`to`)) {
    const from = searchParams.get('from')!;
    const to = searchParams.get('to')!;
    const decrypted = await decryptText(to);

    try {
      // Try to parse as JSON first (new format with hint)
      const data = JSON.parse(decrypted) as ReceiverData;
      return [from, data];
    } catch {
      // If parsing fails, it's the old format (just the name)
      return [from, {name: decrypted, hint: undefined} as ReceiverData];
    }
  }

  throw new Error(`Missing key or to parameter in search params`);
}

export function Pairing() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<[string, ReceiverData] | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [nameRevealed, setNameRevealed] = useState(false);

  useEffect(() => {
    const decryptReceiver = async () => {
      try {
        setAssignment(await loadPairing(searchParams));
        setInstructions(searchParams.get('info'));
      } catch (err) {
        console.error('Decryption error:', err);
        setError(t('pairing.error'));
      } finally {
        setLoading(false);
      }
    };

    decryptReceiver();
  }, [searchParams, t]);

  useEffect(() => {
    if (assignment && !loading && !revealing) {
      setRevealing(true);
      const timer = setTimeout(() => {
        setNameRevealed(true);
      }, 2000); // 2 second delay before revealing the name
      
      return () => clearTimeout(timer);
    }
  }, [assignment, loading, revealing]);

  if (error) {
    return (
      <div className="min-h-screen bg-red-700 flex items-center justify-center">
        <div className="text-xl text-white">{error}</div>
      </div>
    );
  }

  const menuItems: React.ReactNode[] = [];

  return (
    <Layout menuItems={menuItems}>
      <div>
        {!loading && assignment && (
          <motion.div
            initial={{ rotateZ: -360 * 1, scale: 0 }}
            animate={{ rotateZ: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: `easeIn`, duration: .6 }}
          >
            <PostCard>
              <h1 className="text-3xl font-bold mb-6 text-center text-red-700">
                {t('pairing.title')}
              </h1>
              <p className="mb-6 text-center text-gray-600">
                <Trans
                  i18nKey="pairing.assignment"
                  components={{
                    name: <span className="font-semibold">{assignment![0]}</span>
                  }}
                />
              </p>
              <div className="text-8xl font-bold text-center p-6 font-dancing-script min-h-[120px] flex items-center justify-center">
                {nameRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {assignment[1].name}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-400 text-2xl text-center"
                  >
                    <div className="space-y-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        🎁
                      </motion.div>
                      <div className="text-sm">Revealing your Secret Santa...</div>
                    </div>
                  </motion.div>
                )}
              </div>
              {(instructions || assignment[1].hint) && (
                <div className="mt-6 flex p-4 bg-gray-50 rounded-lg leading-6 text-gray-600 whitespace-pre-wrap">
                  <div className="mr-4">
                    <Info size={24}/>
                  </div>
                  <div className="space-y-2">
                    {assignment[1].hint && <p>{assignment[1].hint}</p>}
                    {instructions && <p>{instructions}</p>}
                  </div>
                </div>
              )}
            </PostCard>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
