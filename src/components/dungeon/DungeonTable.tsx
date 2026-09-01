import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Shield, Sword, Coins, Footprints, Skull, Trophy } from '@phosphor-icons/react';
import { useDungeonStore } from '../../store/useDungeonStore';
import { HeroClass } from '../../types/dungeon.types';
import { Button } from '../common/Button';

export const DungeonTable: React.FC = () => {
  const {
    status,
    heroClass,
    floor,
    health,
    maxHealth,
    armor,
    attack,
    gold,
    grid,
    playerLane,
    logMessage,
    initGame,
    selectClass,
    stepToTile,
    restartRun,
  } = useDungeonStore();

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (status === 'victory') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  }, [status]);

  const classes: { id: HeroClass; name: string; icon: string; desc: string }[] = [
    { id: 'knight', name: 'Iron Knight', icon: '🛡️', desc: 'High starting HP (22) & Balanced Armor' },
    { id: 'rogue', name: 'Shadow Rogue', icon: '🗡️', desc: 'High Attack (6) & Fast Criticals' },
    { id: 'mage', name: 'Rune Mage', icon: '🔮', desc: 'Devastating Attack (7) & Glass Cannon' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP HEADER: Hero Stats Bar */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 grid grid-cols-4 gap-2 text-xs z-10">
        {/* Health */}
        <div className="flex items-center gap-1.5 bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <Heart size={16} weight="fill" className="text-[#F87171]" />
          <div>
            <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">HP</div>
            <div className="font-mono-meta font-bold text-xs sm:text-sm text-[#EDEDED]">
              {health}/{maxHealth}
            </div>
          </div>
        </div>

        {/* Armor */}
        <div className="flex items-center gap-1.5 bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <Shield size={16} weight="fill" className="text-[#60A5FA]" />
          <div>
            <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Armor</div>
            <div className="font-mono-meta font-bold text-xs sm:text-sm text-[#60A5FA]">
              +{armor}
            </div>
          </div>
        </div>

        {/* Attack */}
        <div className="flex items-center gap-1.5 bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <Sword size={16} weight="fill" className="text-[#FBBF24]" />
          <div>
            <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Attack</div>
            <div className="font-mono-meta font-bold text-xs sm:text-sm text-[#FBBF24]">
              {attack}
            </div>
          </div>
        </div>

        {/* Floor & Gold */}
        <div className="flex items-center justify-between bg-[#181818] p-2 rounded-lg border border-[#262626]">
          <div>
            <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Floor</div>
            <div className="font-mono-meta font-bold text-xs sm:text-sm text-[#EDEDED]">{floor}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase font-mono-meta text-[#8E8E93]">Gold</div>
            <div className="font-mono-meta font-bold text-xs sm:text-sm text-[#FBBF24] flex items-center gap-0.5 justify-end">
              <Coins size={12} weight="fill" />
              <span>{gold}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: THE 3x3 DUNGEON GRID OR CLASS SELECT */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 z-10 py-1">
        {status === 'class-select' ? (
          <div className="w-full max-w-md space-y-3">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122416] text-[#4ADE80] border border-[#1E3A24] text-[11px] font-mono-meta">
                <Footprints size={12} weight="fill" />
                <span>MICRO DUNGEON ROGUELIKE</span>
              </div>
              <h2 className="text-2xl font-serif-editorial font-bold text-[#EDEDED]">Select Hero Class</h2>
              <p className="text-xs text-[#8E8E93]">Descend the 20 floors of the dark tower.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {classes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectClass(c.id)}
                  className="bg-[#141414] hover:bg-[#1A1A1A] border border-[#242424] hover:border-white p-3.5 rounded-xl cursor-pointer transition active:scale-95 space-y-1.5 text-center"
                >
                  <div className="text-3xl my-1">{c.icon}</div>
                  <div className="font-bold text-xs text-[#EDEDED]">{c.name}</div>
                  <div className="text-[10px] text-[#8E8E93] leading-tight">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-2">
            {/* Dungeon 3x3 Grid Vertical Scroll */}
            <div className="grid grid-cols-3 gap-2">
              <AnimatePresence>
                {grid.map((row, rowIdx) =>
                  row.map((tile, colIdx) => {
                    const isNextRow = rowIdx === 2;
                    const isAdjacent = Math.abs(colIdx - playerLane) <= 1;
                    const canStep = isNextRow && isAdjacent;

                    return (
                      <motion.button
                        key={tile.id}
                        disabled={!canStep}
                        onClick={() => stepToTile(colIdx)}
                        whileTap={canStep ? { scale: 0.95 } : undefined}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between h-24 sm:h-28 transition-all ${
                          canStep
                            ? 'bg-[#181818] hover:bg-[#222222] border-white shadow-lg cursor-pointer'
                            : isNextRow
                            ? 'bg-[#141414] border-[#262626] opacity-60'
                            : 'bg-[#101010] border-[#1C1C1C] opacity-40'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{tile.icon}</span>
                        <div className="text-center min-w-0 w-full">
                          <div className="font-bold text-[10px] sm:text-xs text-[#EDEDED] truncate">
                            {tile.name}
                          </div>
                          <div className="text-[9px] font-mono-meta text-[#8E8E93] mt-0.5">
                            {tile.type === 'monster' || tile.type === 'boss'
                              ? `Atk ${tile.value}`
                              : tile.type === 'potion'
                              ? `+${tile.value} HP`
                              : tile.type === 'shield'
                              ? `+${tile.value} Arm`
                              : tile.type === 'weapon'
                              ? `+${tile.value} Atk`
                              : `+${tile.value} Gold`}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Player Avatar Position Indicator */}
            <div className="grid grid-cols-3 gap-2 px-1">
              {[0, 1, 2].map((col) => (
                <div key={`hero-lane-${col}`} className="flex justify-center">
                  {col === playerLane ? (
                    <div className="w-8 h-8 rounded-full bg-white text-[#0A0A0A] font-bold text-xs flex items-center justify-center shadow-lg font-mono-meta">
                      {heroClass === 'knight' ? '🛡️' : heroClass === 'rogue' ? '🗡️' : '🔮'}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-dashed border-[#242424]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action / Event Log Ticker */}
        {status !== 'class-select' && (
          <div className="w-full max-w-sm text-center py-2 px-3 bg-[#141414] border border-[#242424] rounded-lg">
            <span className="font-mono-meta text-xs text-[#EDEDED] leading-relaxed">
              {logMessage}
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 z-20">
        {status === 'game-over' ? (
          <Button variant="danger" size="lg" className="w-full font-bold flex items-center justify-center gap-2" onClick={restartRun}>
            <Skull size={18} weight="bold" />
            <span>FALLEN HERO — RETRY DUNGEON</span>
          </Button>
        ) : status === 'victory' ? (
          <Button variant="gold" size="lg" className="w-full font-bold flex items-center justify-center gap-2" onClick={restartRun}>
            <Trophy size={18} weight="bold" />
            <span>CLAIM $500 REWARD & PLAY AGAIN</span>
          </Button>
        ) : (
          <div className="flex items-center justify-between text-xs font-mono-meta text-[#8E8E93]">
            <span>Tap highlighted tile to step forward</span>
            <span className="text-[#EDEDED] font-bold">Floor {floor}/20</span>
          </div>
        )}
      </div>
    </div>
  );
};
