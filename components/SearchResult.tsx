import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResultProps {
  siteName: string;
  url: string;
  isLoading: boolean;
  isNsfw: boolean;
}

const NsfwBadge: React.FC = () => (
  <span className="text-[red] font-bold text-[7pt] px-1 py-0.5 rounded-md border-2 border-[red] font-medium ml-3 opacity-[60%]">NSFW</span>
);

const SearchResult: React.FC<SearchResultProps> = ({ siteName, url, isLoading, isNsfw }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex w-full"
    >
      {isLoading ? (
        <div className="w-full h-9 mb-[20px] flex flex-row items-center">
          <Skeleton className="w-[32px] h-[32px] rounded-[10px] mr-6" />
          <div className='w-full flex flex-col justify-center'>
            <Skeleton className="h-[13pt] w-[25%] mb-2 rounded-md" />
            <Skeleton className="h-[12pt] w-[50%] rounded-md" />
          </div>
        </div>
      ) : (
        <div className='flex flex-row items-center mb-[20px] w-full'>
          <div className="w-[32px] h-[32px] mr-6 flex-shrink-0">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={`https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(url).hostname}`}
                alt={`${siteName} favicon`}
                width={32}
                height={32}
                className="rounded-[10px] object-contain"
              />
            </Link>
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <div id='website-name-container' className='flex flex-row items-center w-full'>
              <span className="truncate mr-2">{siteName}</span>
              {isNsfw && <NsfwBadge />}
            </div>
            <Link 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[12pt] text-blue-500 hover:underline block w-full truncate"
              title={url}
            >
              {url}
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchResult;