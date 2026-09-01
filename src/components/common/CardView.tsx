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
  spades: 'text-slate-900',
  clubs: 'text-slate-900',
  hearts: 'text-rose-600',
  diamonds: 'text-rose-600',
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
      initial={{ scale: 0.8, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      onClick={onClick}
      className={`relative w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl cursor-pointer perspective-1000 select-none transition-all duration-200 ${
        isWinning ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-emerald-950 scale-105' : ''
      } ${isHeld ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950 -translate-y-2' : ''} ${className}`}
    >
      <div
        className={`w-full h-full relative preserve-3d transition-transform duration-500 ${
          card.faceUp ? '' : 'rotate-y-180'
        }`}
      >
        {/* Card Face (Front) */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-lg sm:rounded-xl p-1 sm:p-2 flex flex-col justify-between backface-hidden border border-slate-200 shadow-inner">
          {/* Top Left Rank & Suit */}
          <div className={`flex flex-col items-start leading-none ${SUIT_COLORS[card.suit]}`}>
            <span className="font-bold text-xs sm:text-base md:text-lg font-mono">{card.rank}</span>
            <span className="text-xs sm:text-sm md:text-base">{symbol}</span>
          </div>

          {/* Center Suit / Art */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={`text-2xl sm:text-3xl md:text-5xl opacity-90 ${SUIT_COLORS[card.suit]}`}
            >
              {symbol}
            </span>
          </div>

          {/* Bottom Right Rank & Suit (Inverted) */}
          <div
            className={`flex flex-col items-end leading-none rotate-180 ${SUIT_COLORS[card.suit]}`}
          >
            <span className="font-bold text-xs sm:text-base md:text-lg font-mono">{card.rank}</span>
            <span className="text-xs sm:text-sm md:text-base">{symbol}</span>
          </div>
        </div>

        {/* Card Back (Hidden) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-900 via-rose-950 to-slate-950 rounded-lg sm:rounded-xl p-1 backface-hidden rotate-y-180 border-2 border-amber-400/40 shadow-xl flex items-center justify-center">
          <div className="w-full h-full rounded border border-amber-400/30 flex items-center justify-center bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:8px_8px] opacity-90">
            <span className="text-amber-400/80 font-serif-luxury font-bold text-[10px] sm:text-xs tracking-widest">
              HG
            </span>
          </div>
        </div>
      </div>

      {/* Held Badge Indicator */}
      {isHeld && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md tracking-wider">
          HELD
        </div>
      )}
    </motion.div>
  );
};
