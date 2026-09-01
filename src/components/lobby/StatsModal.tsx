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
    <div className="space-y-4 text-[#EDEDED]">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#181818] p-3 rounded-lg border border-[#262626] text-center">
          <div className="text-[10px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Current Chips</div>
          <div className="text-lg font-bold text-[#EDEDED] font-mono-meta">${chips.toLocaleString()}</div>
        </div>
        <div className="bg-[#181818] p-3 rounded-lg border border-[#262626] text-center">
          <div className="text-[10px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Net Result</div>
          <div className={`text-lg font-bold font-mono-meta ${netProfit >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
            {netProfit >= 0 ? `+$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
          </div>
        </div>
        <div className="bg-[#181818] p-3 rounded-lg border border-[#262626] text-center">
          <div className="text-[10px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Hands Played</div>
          <div className="text-lg font-bold text-[#EDEDED] font-mono-meta">{handsPlayed}</div>
        </div>
        <div className="bg-[#181818] p-3 rounded-lg border border-[#262626] text-center">
          <div className="text-[10px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Win Rate</div>
          <div className="text-lg font-bold text-[#60A5FA] font-mono-meta">{winRate}%</div>
        </div>
      </div>

      {/* Blackjack & Trainer Stats */}
      <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-serif-editorial font-bold text-sm text-[#EDEDED]">Blackjack 3-Deck Continuous</span>
          <span className="text-xs font-mono-meta text-[#8E8E93]">{bjWins}W / {bjLosses}L / {bjPushes}P</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between bg-[#121212] p-2 rounded border border-[#222222]">
            <span className="text-[#8E8E93]">Natural Blackjacks:</span>
            <span className="font-bold text-[#EDEDED] font-mono-meta">{bjBlackjacks}</span>
          </div>
          <div className="flex justify-between bg-[#121212] p-2 rounded border border-[#222222]">
            <span className="text-[#8E8E93]">Counting Accuracy:</span>
            <span className="font-bold font-mono-meta text-[#4ADE80]">
              {trainerAccuracy}% ({trainerDecisionsCorrect}/{trainerDecisionsTotal})
            </span>
          </div>
        </div>
      </div>

      {/* Poker Stats */}
      <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-serif-editorial font-bold text-sm text-[#EDEDED]">Texas Hold'em Poker</span>
          <span className="text-xs font-mono-meta text-[#8E8E93]">{vpWins} Won / {vpLosses} Lost</span>
        </div>
      </div>

      {/* Bankroll Reload */}
      <div className="pt-2 flex items-center justify-between border-t border-[#262626]">
        <span className="text-xs text-[#8E8E93]">Reset balance to default</span>
        <Button variant="secondary" size="sm" onClick={resetBankroll}>
          Reset Chips ($500)
        </Button>
      </div>
    </div>
  );
};
