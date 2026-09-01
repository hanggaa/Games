import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkle, ArrowRight, ShieldCheck, Terminal, Rocket, Sword, Crosshair, Cards } from '@phosphor-icons/react';
import { ExtendedView } from '../layout/Header';
import { Button } from '../common/Button';

interface LobbyViewProps {
  onSelectGame: (game: ExtendedView) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onSelectGame }) => {
  const [tab, setTab] = useState<'all' | 'strategy' | 'tabletop'>('all');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122416] text-[#4ADE80] border border-[#1E3A24] text-[11px] font-mono-meta font-medium">
          <Sparkle size={12} weight="fill" />
          <span>PORTRAIT SOLO ARCADE & STRATEGY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-editorial font-bold text-[#EDEDED] tracking-tight">
          Hanggaa Arcade Suite
        </h1>
        <p className="text-xs sm:text-sm text-[#8E8E93] max-w-xl leading-relaxed">
          Tactical roguelikes, tower defenses, gravity physics puzzles, and tabletop showdowns designed for one-handed portrait mobile play.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-2 font-mono-meta text-xs">
        <button
          onClick={() => setTab('all')}
          className={`px-3 py-1 rounded-md transition cursor-pointer ${
            tab === 'all' ? 'bg-white text-[#0A0A0A] font-bold' : 'text-[#8E8E93] hover:text-[#EDEDED]'
          }`}
        >
          All Games (8)
        </button>
        <button
          onClick={() => setTab('strategy')}
          className={`px-3 py-1 rounded-md transition cursor-pointer ${
            tab === 'strategy' ? 'bg-white text-[#0A0A0A] font-bold' : 'text-[#8E8E93] hover:text-[#EDEDED]'
          }`}
        >
          Strategy & Arcades
        </button>
        <button
          onClick={() => setTab('tabletop')}
          className={`px-3 py-1 rounded-md transition cursor-pointer ${
            tab === 'tabletop' ? 'bg-white text-[#0A0A0A] font-bold' : 'text-[#8E8E93] hover:text-[#EDEDED]'
          }`}
        >
          Tabletop & Cards
        </button>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* === NON-CASINO STRATEGY GAMES === */}
        {(tab === 'all' || tab === 'strategy') && (
          <>
            {/* 1. Dungeon Crawl */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#122416] text-[#4ADE80] border border-[#1E3A24] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sword size={12} weight="bold" />
                    <span>MICRO ROGUELIKE</span>
                  </span>
                  <span className="text-[11px] font-mono-meta text-[#8E8E93]">20 Floors</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Dungeon Crawl</h3>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    Turn-based 3x3 path crawler. Battle cave monsters, discover enchanted swords and tower shields, drink elixirs, and vanquish the floor 20 dragon boss.
                  </p>
                </div>
              </div>
              <Button variant="primary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('dungeon')}>
                <span>Enter Dungeon</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>

            {/* 2. Core Defense */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#0E2338] text-[#60A5FA] border border-[#173A5E] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} weight="bold" />
                    <span>TOWER DEFENSE</span>
                  </span>
                  <span className="text-[11px] font-mono-meta text-[#8E8E93]">Wave Defense</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Core Defense</h3>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    Protect the base core against descending drone swarms. Place and upgrade Pulse Lasers, Cryo Slow Emitters, Chain Arcs, and Mortars.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('defense')}>
                <span>Deploy Turrets</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>

            {/* 3. Cyber Infiltration */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#2A2210] text-[#FBBF24] border border-[#4A3B18] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Terminal size={12} weight="bold" />
                    <span>TERMINAL HACKER</span>
                  </span>
                  <span className="text-[11px] font-mono-meta text-[#8E8E93]">Security Nodes</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Cyber Infiltration</h3>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    Breach corporate datavaults. Decrypt memory buffer sequences across alternating row/column matrices before trace lock. Deploy ICE Breakers and Proxy Hops.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('cyber')}>
                <span>Access Terminal</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>

            {/* 4. Lunar Orbital */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#142318] text-[#4ADE80] border border-[#1E3A24] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Rocket size={12} weight="bold" />
                    <span>GRAVITY PHYSICS</span>
                  </span>
                  <span className="text-[11px] font-mono-meta text-[#8E8E93]">Orbital Puzzle</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Lunar Orbital</h3>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    Slingshot space probes across planetary gravitational fields. Collect cosmic data beacons and enter destination warp gates at 60 FPS.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('orbital')}>
                <span>Launch Probe</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>
          </>
        )}

        {/* === TABLETOP & CARDS === */}
        {(tab === 'all' || tab === 'tabletop') && (
          <>
            {/* 5. Buckshot Roulette */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#381B1E] hover:border-[#F87171] rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#2A1416] text-[#F87171] border border-[#4D2024] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crosshair size={12} weight="bold" />
                    <span>12-GAUGE TABLETOP</span>
                  </span>
                  <span className="text-[11px] font-mono-meta text-[#FBBF24]">Prize: $1,000</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif-editorial font-bold text-[#EDEDED]">Buckshot Roulette</h3>
                  <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                    High-stakes 1v1 duel against The Dealer. Live vs Blank shells, tactical item shelf (Magnifier, Handsaw, Cigarettes, Beer, Handcuffs, Inverter), and 3 rounds.
                  </p>
                </div>
              </div>
              <Button variant="danger" size="md" className="w-full flex items-center justify-between font-bold" onClick={() => onSelectGame('buckshot')}>
                <span>Enter Duel</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>

            {/* 6. Balatro-lite */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#0E2338] text-[#60A5FA] border border-[#173A5E] px-2 py-0.5 rounded-full">
                    POKER DECKBUILDER
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
              <Button variant="primary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('balatro')}>
                <span>Play Roguelike</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>

            {/* 7. Blackjack Pro Trainer */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
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
              <Button variant="secondary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('blackjack-pro')}>
                <span>Train 3-Deck Shoe</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>

            {/* 8. Texas Hold'em vs AI Bots */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#141414] border border-[#242424] hover:border-white rounded-xl p-5 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono-meta font-bold bg-[#142318] text-[#4ADE80] border border-[#1E3A24] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Cards size={12} weight="bold" />
                    <span>HEADS-UP TABLE</span>
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
              <Button variant="secondary" size="md" className="w-full flex items-center justify-between" onClick={() => onSelectGame('videopoker')}>
                <span>Play Poker vs Bots</span>
                <ArrowRight size={14} weight="bold" />
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
