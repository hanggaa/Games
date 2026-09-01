import React from 'react';
import { useBankrollStore } from '../../store/useBankrollStore';
import { Button } from '../common/Button';

export const StatsModal: React.FC = () => {
  const {
    chips,
    totalWon,
    totalLost,
    handsPlayed,
    bjWins,
    bjLosses,
    bjPushes,
    bjBlackjacks,
    vpWins,
    vpLosses,
    vpRoyalFlushes,
    trainerDecisionsTotal,
    trainerDecisionsCorrect,
    resetBankroll,
  } = useBankrollStore();

  const netProfit = totalWon - totalLost;
  const winRate = handsPlayed > 0 ? Math.round(((bjWins + vpWins) / handsPlayed) * 100) : 0;
  const trainerAccuracy =
    trainerDecisionsTotal > 0
      ? Math.round((trainerDecisionsCorrect / trainerDecisionsTotal) * 100)
      : 0;

  return (
    <div className="space-y-4 text-slate-200">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Current Chips</div>
          <div className="text-lg font-bold text-amber-300 font-mono">${chips.toLocaleString()}</div>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Net Profit</div>
          <div className={`text-lg font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netProfit >= 0 ? `+$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
          </div>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Hands Played</div>
          <div className="text-lg font-bold text-slate-100 font-mono">{handsPlayed}</div>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Win Rate</div>
          <div className="text-lg font-bold text-sky-400 font-mono">{winRate}%</div>
        </div>
      </div>

      {/* Blackjack & Trainer Stats */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-serif-luxury font-bold text-sm text-amber-300">Blackjack Performance</span>
          <span className="text-xs text-slate-400">{bjWins}W - {bjLosses}L - {bjPushes}P</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between bg-slate-900/60 p-2 rounded border border-slate-800/60">
            <span className="text-slate-400">Natural Blackjacks:</span>
            <span className="font-bold text-amber-400 font-mono">{bjBlackjacks}</span>
          </div>
          <div className="flex justify-between bg-slate-900/60 p-2 rounded border border-slate-800/60">
            <span className="text-slate-400">Strategy Accuracy:</span>
            <span className={`font-bold font-mono ${trainerAccuracy >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {trainerAccuracy}% ({trainerDecisionsCorrect}/{trainerDecisionsTotal})
            </span>
          </div>
        </div>
      </div>

      {/* Video Poker Stats */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-serif-luxury font-bold text-sm text-amber-300">Video Poker</span>
          <span className="text-xs text-slate-400">{vpWins} Wins / {vpLosses} Losses</span>
        </div>
        <div className="flex justify-between bg-slate-900/60 p-2 rounded border border-slate-800/60 text-xs">
          <span className="text-slate-400">Royal Flushes Hit:</span>
          <span className="font-bold text-amber-400 font-mono">{vpRoyalFlushes} 👑</span>
        </div>
      </div>

      {/* Bankroll Reload */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
        <span className="text-xs text-slate-400">Broke? Reset to $500 chips</span>
        <Button variant="secondary" size="sm" onClick={resetBankroll}>
          Reset Chips to $500
        </Button>
      </div>
    </div>
  );
};
