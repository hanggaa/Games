import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle, WarningCircle, Eye, EyeSlash } from '@phosphor-icons/react';
import { CountingMetrics, StrategyFeedback } from '../../types/blackjack.types';
import { useSettingsStore } from '../../store/useSettingsStore';

interface TrainerHudProps {
  counting: CountingMetrics;
  lastFeedback: StrategyFeedback | null;
  currentAdvice?: string;
}

export const TrainerHud: React.FC<TrainerHudProps> = ({
  counting,
  lastFeedback,
  currentAdvice,
}) => {
  const { showTrainerHud, toggleTrainerHud } = useSettingsStore();

  return (
    <div className="w-full bg-[#141414] border border-[#242424] rounded-lg p-2.5 space-y-2">
      {/* Top Header & Toggle */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#EDEDED] font-mono-meta text-[11px] uppercase">
          <Brain size={15} weight="bold" className="text-[#FBBF24]" />
          <span>Card Counting Metrics</span>
        </div>
        <button
          onClick={toggleTrainerHud}
          className="text-[#8E8E93] hover:text-[#EDEDED] flex items-center gap-1 text-[10px] font-mono-meta bg-[#181818] px-2 py-0.5 rounded border border-[#2A2A2A] transition cursor-pointer"
        >
          {showTrainerHud ? <EyeSlash size={12} weight="bold" /> : <Eye size={12} weight="bold" />}
          <span>{showTrainerHud ? 'Hide' : 'Show'}</span>
        </button>
      </div>

      {showTrainerHud && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {/* Counting Metric Badges */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-[#181818] p-1.5 rounded border border-[#262626]">
              <div className="text-[9px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Running Count</div>
              <div className="text-sm font-bold font-mono-meta text-[#EDEDED]">
                {counting.runningCount > 0 ? `+${counting.runningCount}` : counting.runningCount}
              </div>
            </div>

            <div className="bg-[#2A2210] p-1.5 rounded border border-[#4A3B18]">
              <div className="text-[9px] text-[#FBBF24] font-semibold uppercase font-mono-meta">True Count</div>
              <div className="text-sm font-bold font-mono-meta text-[#FBBF24]">
                {counting.trueCount > 0 ? `+${counting.trueCount}` : counting.trueCount}
              </div>
            </div>

            <div className="bg-[#181818] p-1.5 rounded border border-[#262626]">
              <div className="text-[9px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Decks Left</div>
              <div className="text-sm font-bold text-[#EDEDED] font-mono-meta">
                {counting.decksRemaining} <span className="text-[9px] text-[#8E8E93] font-normal">({counting.penetrationPct}%)</span>
              </div>
            </div>
          </div>

          {/* Current Live Advice */}
          {currentAdvice && (
            <div className="bg-[#122416] border border-[#1E3A24] rounded p-2 flex items-center justify-between text-xs text-[#4ADE80]">
              <span className="text-[10px] font-mono-meta font-bold uppercase tracking-wider">Advisor:</span>
              <span className="font-medium text-right text-xs leading-tight">{currentAdvice}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Decision Feedback Toast */}
      <AnimatePresence>
        {lastFeedback && (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className={`p-2 rounded text-xs flex items-center gap-2 border ${
              lastFeedback.isOptimal
                ? 'bg-[#122416] border-[#1E3A24] text-[#4ADE80]'
                : 'bg-[#2A1416] border-[#4D2024] text-[#F87171]'
            }`}
          >
            {lastFeedback.isOptimal ? (
              <CheckCircle size={16} weight="fill" className="shrink-0 text-[#4ADE80]" />
            ) : (
              <WarningCircle size={16} weight="fill" className="shrink-0 text-[#F87171]" />
            )}
            <div className="leading-tight">
              <span className="font-bold font-mono-meta text-[11px]">
                {lastFeedback.isOptimal ? 'Optimal Strategy:' : `Suboptimal (${lastFeedback.playerAction}):`}
              </span>{' '}
              <span className="text-[11px]">{lastFeedback.reason}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
