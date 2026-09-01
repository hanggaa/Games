import React from 'react';
import { motion } from 'motion/react';
import { Play, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { useBankrollStore, GameKey } from '../../store/useBankrollStore';
import { Button } from '../common/Button';

type ExtendedGameKey = GameKey | 'balatro';

interface LobbyViewProps {
  onSelectGame: (game: ExtendedGameKey) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onSelectGame }) => {
  const { lastActiveGame } = useBankrollStore();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122416] text-[#4ADE80] border border-[#1E3A24] text-[11px] font-mono-meta font-medium">
          <Sparkle size={12} weight="fill" />
          <span>ZERO-FRICTION CARD ARCADE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-editorial font-bold text-[#EDEDED] tracking-tight">
          Hanggaa Card Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#8E8E93] max-w-xl leading-relaxed">
          A minimalist single-player card workspace designed for focused portrait play. Real 3-deck continuous shoe Blackjack, Texas Hold'em against AI bots, and Roguelike Poker Deckbuilding.
        </p>
      </div>

      {/* Quick Resume Hero Bar */}
      {lastActiveGame && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#141414] border border-[#262626] rounded-lg p-3.5 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1C1C1C] border border-[#2D2D2D] flex items-center justify-center text-[#EDEDED]">
              <Play size={16} weight="fill" />
            </div>
            <div>
              <div className="text-[10px] text-[#8E8E93] font-semibold uppercase font-mono-meta">Resume Session</div>
              <div className="font-serif-editorial font-bold text-[#EDEDED] text-sm capitalize">
                {lastActiveGame === 'blackjack-pro' ? 'Blackjack 3-Deck Trainer' : lastActiveGame === 'videopoker' ? "Texas Hold'em vs Bots" : 'Blackjack Classic'}
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => onSelectGame(lastActiveGame)}>
            Resume
          </Button>
        </motion.div>
      )}

      {/* Bento Grid Layout (Dark Minimalist) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Balatro-lite Roguelike Deckbuilder */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#141414] border border-[#242424] hover:border-[#383838] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#0E2338] text-[#60A5FA] border border-[#173A5E] px-2 py-0.5 rounded-full">
                ROGUELIKE DECKBUILDER
              </span>
              <span className="text-[11px] font-mono-meta text-[#8E8E93]">8 Antes</span>
            </div>
            <div>
              <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Balatro-lite</h3>
              <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                Play poker hands to beat escalating Blinds. Collect and equip Jokers to multiply chips and craft synergistic deck strategies.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full flex items-center justify-between"
            onClick={() => onSelectGame('balatro')}
          >
            <span>Play Roguelike Run</span>
            <ArrowRight size={14} weight="bold" />
          </Button>
        </motion.div>

        {/* 2. Blackjack Card Counting Pro (3-Deck Shoe) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#141414] border border-[#242424] hover:border-[#383838] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#2A2210] text-[#FBBF24] border border-[#4A3B18] px-2 py-0.5 rounded-full">
                3-DECK CONTINUOUS SHOE
              </span>
              <span className="text-[11px] font-mono-meta text-[#8E8E93]">Hi-Lo Trainer</span>
            </div>
            <div>
              <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Blackjack Pro Trainer</h3>
              <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                Authentic 156-card shoe that persists across rounds. Live Running Count (RC), True Count (TC), and Basic Strategy Advisor.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="w-full flex items-center justify-between"
            onClick={() => onSelectGame('blackjack-pro')}
          >
            <span>Train 3-Deck Shoe</span>
            <ArrowRight size={14} weight="bold" />
          </Button>
        </motion.div>

        {/* 3. Texas Hold'em vs AI Bots */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#141414] border border-[#242424] hover:border-[#383838] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#2D1214] text-[#F87171] border border-[#4D1C20] px-2 py-0.5 rounded-full">
                HEADS-UP TABLE
              </span>
              <span className="text-[11px] font-mono-meta text-[#8E8E93]">Elena & Viktor</span>
            </div>
            <div>
              <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Texas Hold'em Poker</h3>
              <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                Solo poker against distinct bot personalities. Preflop, Flop, Turn, River, blinds rotation, and 7-card showdown.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="w-full flex items-center justify-between"
            onClick={() => onSelectGame('videopoker')}
          >
            <span>Play Texas Hold'em</span>
            <ArrowRight size={14} weight="bold" />
          </Button>
        </motion.div>

        {/* 4. Blackjack Classic */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#141414] border border-[#242424] hover:border-[#383838] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#122416] text-[#4ADE80] border border-[#1E3A24] px-2 py-0.5 rounded-full">
                STANDARD VEGAS
              </span>
              <span className="text-[11px] font-mono-meta text-[#8E8E93]">Casual Play</span>
            </div>
            <div>
              <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Blackjack Classic</h3>
              <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                Vegas rules dealer AI with double down and pair splitting. Pure, peaceful card playing without trainer overlays.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="w-full flex items-center justify-between"
            onClick={() => onSelectGame('blackjack')}
          >
            <span>Play Casual Blackjack</span>
            <ArrowRight size={14} weight="bold" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
