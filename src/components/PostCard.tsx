import christmasWreath from '../../static/christmas-wreath.svg';
import giftBox from '../../static/gift-box.svg';

interface PostCardProps {
  children: React.ReactNode;
  className?: string;
}

export function PostCard({ children, className = "" }: PostCardProps) {
  return (
    <div className={`shadow-md relative z-10 transform rotate-2 transition-transform duration-300 p-3 bg-postcard rounded-lg ${className}`}>
      <div className="relative p-8 bg-white">
        <div className="absolute -top-4 -left-4 w-8 h-8 sm:-top-6 sm:-left-6 sm:w-12 sm:h-12 bg-[#5CC48A] rounded-full flex items-center justify-center transform -rotate-12">
          <img className={`w-full h-full`} src={christmasWreath} />
        </div>
        
        {children}
        
        <div className="absolute -bottom-4 -right-4 w-8 h-8 sm:-bottom-6 sm:-right-6 sm:w-12 sm:h-12 bg-[#EF3D3D] rounded-full flex items-center justify-center transform rotate-12">
          <img className={`w-full h-full`} src={giftBox} />
        </div>
      </div>
    </div>
  );
}
