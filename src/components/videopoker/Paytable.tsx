import React from 'react';
import { JACKS_OR_BETTER_PAYTABLE } from '../../engine/videopoker/paytable';
import { PokerHandRank } from '../../types/poker.types';

interface PaytableProps {
  coinsBet: number;
  winningRank?: PokerHandRank;
}

export const Paytable: React.FC<PaytableProps> = ({ coinsBet, winningRank }) => {
  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl overflow-hidden shadow-xl text-[10px] sm:text-xs">
      <div className="grid grid-cols-6 bg-slate-900/90 font-bold border-b border-slate-800 text-slate-300 py-1 px-2 text-center">
        <span className="text-left col-span-1 sm:col-span-1 truncate">HAND</span>
        {[1, 2, 3, 4, 5].map((col) => (
          <span
            key={col}
            className={`${
              coinsBet === col
                ? 'bg-amber-400 text-slate-950 rounded font-black py-0.5'
                : 'text-slate-400'
            }`}
          >
            {col} BET
          </span>
        ))}
      </div>

      <div className="divide-y divide-slate-800/40">
        {JACKS_OR_BETTER_PAYTABLE.map((row) => {
          const isWinning = winningRank === row.rank;
          return (
            <div
              key={row.rank}
              className={`grid grid-cols-6 py-1 px-2 text-center transition-colors ${
                isWinning ? 'bg-amber-400/20 text-amber-300 font-bold' : 'text-slate-300'
              }`}
            >
              <span className="text-left col-span-1 truncate font-medium">{row.name}</span>
              {row.multipliers.map((mult, idx) => (
                <span
                  key={idx}
                  className={`font-mono ${
                    coinsBet === idx + 1
                      ? isWinning
                        ? 'text-amber-300 font-extrabold'
                        : 'text-amber-400 font-bold bg-amber-950/30 rounded'
                      : 'opacity-70'
                  }`}
                >
                  {mult}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
