import React from 'react';
import { motion } from 'motion/react';
import { Card, Suit } from '../../types/card.types';

interface CardViewProps {
  card: Card;
  isWinning?: boolean;
  isHeld?: boolean;
  onClick?: () => void;
  className?: string;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const SUIT_COLORS: Record<Suit, string> = {
  spades: 'text-[#111111]',
  clubs: 'text-[#111111]',
  hearts: 'text-[#DC2626]',
  diamonds: 'text-[#DC2626]',
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  isWinning = false,
  isHeld = false,
  onClick,
  className = '',
}) => {
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={`relative w-15 h-22 sm:w-18 sm:h-26 md:w-22 md:h-32 rounded-lg cursor-pointer perspective-1000 select-none transition-all duration-150 ${
        isWinning ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0A]' : ''
      } ${isHeld ? 'ring-1.5 ring-white -translate-y-2' : ''} ${className}`}
    >
      <div
        className={`w-full h-full relative preserve-3d transition-transform duration-300 ${
          card.faceUp ? '' : 'rotate-y-180'
        }`}
      >
        {/* Card Face (Front) - Off-White Surface with Crisp Edge */}
        <div className="absolute inset-0 w-full h-full bg-[#FAFAFA] rounded-lg p-1.5 sm:p-2 flex flex-col justify-between backface-hidden border border-[#E5E5E5] shadow-sm">
          {/* Top Rank & Suit */}
          <div className={`flex flex-col items-start leading-none ${SUIT_COLORS[card.suit]}`}>
            <span className="font-bold text-xs sm:text-sm md:text-base font-mono-meta">{card.rank}</span>
            <span className="text-[10px] sm:text-xs">{symbol}</span>
          </div>

          {/* Center Suit */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`text-xl sm:text-2xl md:text-4xl ${SUIT_COLORS[card.suit]} opacity-80`}>
              {symbol}
            </span>
          </div>

          {/* Bottom Rank & Suit */}
          <div className={`flex flex-col items-end leading-none rotate-180 ${SUIT_COLORS[card.suit]}`}>
            <span className="font-bold text-xs sm:text-sm md:text-base font-mono-meta">{card.rank}</span>
            <span className="text-[10px] sm:text-xs">{symbol}</span>
          </div>
        </div>

        {/* Card Back (Hidden) - Matte Dark Geometric */}
        <div className="absolute inset-0 w-full h-full bg-[#181818] rounded-lg p-1 backface-hidden rotate-y-180 border border-[#2D2D2D] flex items-center justify-center">
          <div className="w-full h-full rounded border border-[#242424] flex items-center justify-center bg-[radial-gradient(#333333_1px,transparent_1px)] [background-size:6px_6px]">
            <span className="text-[#555555] font-mono-meta text-[9px] font-bold tracking-widest uppercase">
              HG
            </span>
          </div>
        </div>
      </div>

      {/* Held Badge */}
      {isHeld && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-[#0A0A0A] font-mono-meta text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider shadow">
          HELD
        </div>
      )}
    </motion.div>
  );
};
