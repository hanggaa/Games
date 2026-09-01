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
    <div className="w-full bg-slate-950/70 border border-amber-400/30 rounded-xl p-2.5 shadow-lg backdrop-blur-sm space-y-2">
      {/* Top Header & Toggle */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <Brain size={16} weight="fill" />
          <span className="font-serif-luxury tracking-wide">Card Counting & Strategy Trainer</span>
        </div>
        <button
          onClick={toggleTrainerHud}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 transition"
        >
          {showTrainerHud ? <EyeSlash size={14} /> : <Eye size={14} />}
          <span>{showTrainerHud ? 'Hide Stats' : 'Show Stats'}</span>
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
            <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Running Count</div>
              <div className={`text-base font-bold font-mono ${counting.runningCount > 0 ? 'text-emerald-400' : counting.runningCount < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {counting.runningCount > 0 ? `+${counting.runningCount}` : counting.runningCount}
              </div>
            </div>

            <div className="bg-slate-900/90 p-1.5 rounded-lg border border-amber-400/40">
              <div className="text-[10px] text-amber-400 font-semibold uppercase">True Count</div>
              <div className={`text-base font-bold font-mono ${counting.trueCount > 0 ? 'text-amber-300' : counting.trueCount < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {counting.trueCount > 0 ? `+${counting.trueCount}` : counting.trueCount}
              </div>
            </div>

            <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Decks Left</div>
              <div className="text-base font-bold text-slate-100 font-mono">
                {counting.decksRemaining} <span className="text-[10px] text-slate-400 font-normal">({counting.penetrationPct}%)</span>
              </div>
            </div>
          </div>

          {/* Current Live Advice */}
          {currentAdvice && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 flex items-center justify-between text-xs text-amber-200">
              <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">Strategy Advisor:</span>
              <span className="font-medium text-right text-xs">{currentAdvice}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Decision Feedback Toast */}
      <AnimatePresence>
        {lastFeedback && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
              lastFeedback.isOptimal
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`}
          >
            {lastFeedback.isOptimal ? (
              <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
            ) : (
              <WarningCircle size={18} weight="fill" className="text-rose-400 shrink-0" />
            )}
            <div className="leading-tight">
              <span className="font-bold">
                {lastFeedback.isOptimal ? 'Optimal Move!' : `Suboptimal (${lastFeedback.playerAction}):`}
              </span>{' '}
              <span className="text-[11px] opacity-90">{lastFeedback.reason}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
