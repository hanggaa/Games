import React from 'react';
import { motion } from 'motion/react';
import { Play, Sparkle, Brain, Cards, Trophy } from '@phosphor-icons/react';
import { useBankrollStore, GameKey } from '../../store/useBankrollStore';
import { Button } from '../common/Button';

interface LobbyViewProps {
  onSelectGame: (game: GameKey) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onSelectGame }) => {
  const { lastActiveGame } = useBankrollStore();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider"
        >
          <Sparkle size={14} weight="fill" />
          <span>SOLO CARD & CASINO SUITE</span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-bold tracking-tight text-slate-100">
          HANGGAA <span className="text-amber-400">ARCADE</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Ad-free, one-handed portrait card games. Play for relaxation, manage virtual bankrolls, and sharpen card counting strategy.
        </p>
      </div>

      {/* Quick Resume Button */}
      {lastActiveGame && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Play size={20} weight="fill" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Quick Resume</div>
              <div className="font-serif-luxury font-bold text-slate-100 text-sm sm:text-base capitalize">
                {lastActiveGame === 'blackjack-pro' ? 'Blackjack Pro Trainer' : lastActiveGame === 'videopoker' ? 'Video Poker 9/6' : 'Blackjack Classic'}
              </div>
            </div>
          </div>
          <Button variant="gold" size="sm" onClick={() => onSelectGame(lastActiveGame)}>
            Resume Game
          </Button>
        </motion.div>
      )}

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Blackjack Classic */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Cards size={22} weight="bold" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                6-Deck Vegas
              </span>
            </div>
            <div>
              <h3 className="text-lg font-serif-luxury font-bold text-slate-100">Blackjack Classic</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Authentic Vegas rules vs Dealer AI. Dealer hits soft 17, 3:2 Blackjack payout, Split & Double Down.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full mt-4"
            onClick={() => onSelectGame('blackjack')}
          >
            Play Classic
          </Button>
        </motion.div>

        {/* 2. Blackjack Pro (Trainer) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-slate-900/90 border border-amber-400/40 hover:border-amber-400 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition relative overflow-hidden group ring-1 ring-amber-400/20"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Brain size={22} weight="bold" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                PRO TRAINER
              </span>
            </div>
            <div>
              <h3 className="text-lg font-serif-luxury font-bold text-amber-300">Blackjack Pro Trainer</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sharpen your edge with real-time **Hi-Lo Running & True Count HUD** plus instant Basic Strategy decision feedback.
              </p>
            </div>
          </div>
          <Button
            variant="gold"
            className="w-full mt-4"
            onClick={() => onSelectGame('blackjack-pro')}
          >
            Train Counting
          </Button>
        </motion.div>

        {/* 3. Video Poker */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Trophy size={22} weight="bold" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                9/6 Full Pay
              </span>
            </div>
            <div>
              <h3 className="text-lg font-serif-luxury font-bold text-slate-100">Video Poker (Jacks+)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Classic 5-card draw with 800x Royal Flush jackpot. Hold winning pairs, draw replacements, and maximize payouts.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full mt-4 hover:border-purple-400/60"
            onClick={() => onSelectGame('videopoker')}
          >
            Play Video Poker
          </Button>
        </motion.div>
      </div>

      {/* Future Expansion Teaser (Balatro-lite) */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
            🃏
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-200">Roadmap: Balatro-lite (Poker Roguelike)</div>
            <div className="text-[11px] text-slate-400">Joker card modifiers, score multipliers, and escalating blinds coming in v2.0!</div>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-full">
          In Development
        </span>
      </div>
    </div>
  );
};
