import React from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { CopyButton } from "./CopyButton";
import { generateAssignmentLink, generateCSV } from "../utils/links";
import { Participant } from "../types";
import { GeneratedPairs, generateGenerationHash } from "../utils/generatePairs";

interface SecretSantaLinksProps {
  assignments: GeneratedPairs;
  instructions?: string;
  participants: Record<string, Participant>;
  onGeneratePairs: () => void;
}

export function SecretSantaLinks({ assignments, instructions, participants, onGeneratePairs }: SecretSantaLinksProps) {
  const { t } = useTranslation();

  const currentHash = generateGenerationHash(participants);
  const hasChanged = currentHash !== assignments.hash;

  const adjustedPairings = assignments.pairings.map(({giver, receiver}): [string, string, string | undefined] => [
    participants[giver.id]?.name ?? giver.name,
    participants[receiver.id]?.name ?? receiver.name,
    participants[receiver.id]?.hint,
  ]);

  adjustedPairings.sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });

  const handleExportCSV = async () => {
    const linksData: [string, string][] = await Promise.all(
      adjustedPairings.map(async ([giver, receiver, hint]) => {
        const link = await generateAssignmentLink(giver, receiver, hint, instructions);
        return [giver, link];
      })
    );
    
    const csvContent = generateCSV(linksData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'secret-santa-links.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return <>
    {hasChanged && (
      <div className="sidebar-90s mb-4">
        <p className="text-sm font-bold mb-2">
          ⚠️ {t('links.warningParticipantsChanged')}
        </p>
        <button
          className="button-90s w-full"
          style={{ background: '#FF00FF', color: '#FFFF00', fontWeight: 'bold' }}
          onClick={onGeneratePairs}
        >
          {t('links.resetAssignments')}
        </button>
      </div>
    )}
    <div className="content-box-90s">
      <div style={{ padding: '12px' }}>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <p className="text-sm flex-1 min-w-[200px]">
          {t('links.shareInstructions')}
        </p>
        <button
          onClick={handleExportCSV}
          className="button-90s flex flex-none items-center gap-2"
          style={{ background: '#00FF00', color: '#000', fontWeight: 'bold' }}
        >
          <DownloadSimple size={20} weight="bold" />
          {t('links.exportCSV')}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(100px,auto)_1fr] gap-3">
        {adjustedPairings.map(([giver, receiver, hint]) => (
          <React.Fragment key={giver}>
            <span className="font-bold self-center">
              {giver}:
            </span>
            <CopyButton
              textToCopy={() => generateAssignmentLink(giver, receiver, hint, instructions)}
              className="button-90s flex items-center justify-center gap-2"
              style={{ background: '#0000FF', color: '#FFFF00', fontWeight: 'bold' }}
            >
              {t('links.copySecretLink')}
            </CopyButton>
          </React.Fragment>
        ))}
      </div>
      </div>
    </div>
  </>;
}