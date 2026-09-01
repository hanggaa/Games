import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Lightning, Warning, Crosshair, User, ShieldCheck } from '@phosphor-icons/react';
import { useBuckshotStore } from '../../store/useBuckshotStore';
import { Button } from '../common/Button';

export const BuckshotTable: React.FC = () => {
  const {
    phase,
    roundNumber,
    maxHealth,
    playerHealth,
    dealerHealth,
    magazine,
    playerItems,
    dealerItems,
    isSawedOff,
    isPlayerHandcuffed,
    isDealerHandcuffed,
    inspectedCurrentShell,
    phoneHint,
    logMessage,
    screenShake,
    startNewGame,
    loadMagazineForRound,
    playerShootSelf,
    playerShootDealer,
    playerUseItem,
    proceedToNextRound,
  } = useBuckshotStore();

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (phase === 'victory') {
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
  }, [phase]);

  const liveRemaining = magazine.filter((s) => s === 'live').length;
  const blankRemaining = magazine.filter((s) => s === 'blank').length;
  const isUserTurn = phase === 'player-turn';

  return (
    <div
      className={`w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3 transition-transform ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* TOP: THE DEALER */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 space-y-2.5 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1C1C1C] border border-[#2D2D2D] flex items-center justify-center text-base font-bold font-mono-meta text-[#EDEDED]">
              💀
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-editorial font-bold text-sm text-[#EDEDED]">The Dealer</span>
                {isDealerHandcuffed && (
                  <span className="bg-[#2A1416] text-[#F87171] border border-[#4D2024] text-[9px] font-mono-meta px-1.5 py-0.2 rounded font-bold">
                    HANDCUFFED
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#8E8E93] font-mono-meta">Round {roundNumber} of 3</div>
            </div>
          </div>

          {/* Dealer Health Meter */}
          <div className="flex items-center gap-1">
            {Array.from({ length: maxHealth }).map((_, i) => (
              <div
                key={`dealer-hp-${i}`}
                className={`w-5 h-6 rounded flex items-center justify-center border transition-all ${
                  i < dealerHealth
                    ? 'bg-[#2A1416] border-[#4D2024] text-[#F87171]'
                    : 'bg-[#121212] border-[#222222] text-[#333333]'
                }`}
              >
                <Lightning size={14} weight={i < dealerHealth ? 'fill' : 'bold'} />
              </div>
            ))}
          </div>
        </div>

        {/* Dealer Items Shelf */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 border-t border-[#1F1F1F]">
          <span className="text-[9px] font-mono-meta text-[#8E8E93] uppercase shrink-0">Dealer Items:</span>
          {dealerItems.length === 0 ? (
            <span className="text-[10px] text-[#555555] font-mono-meta">Empty Shelf</span>
          ) : (
            dealerItems.map((item) => (
              <div
                key={item.id}
                title={`${item.name}: ${item.description}`}
                className="bg-[#1C1C1C] border border-[#2A2A2A] px-2 py-0.5 rounded text-xs shrink-0 flex items-center gap-1"
              >
                <span>{item.icon}</span>
                <span className="text-[10px] text-[#EDEDED] font-mono-meta">{item.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MIDDLE: THE SHOTGUN TABLE & CHAMBER MONITOR */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-2 z-10">
        {/* Intro Phase Start Screen */}
        {phase === 'intro' ? (
          <div className="text-center space-y-3 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A1416] text-[#F87171] border border-[#4D2024] text-xs font-mono-meta font-semibold">
              <Warning size={14} weight="fill" />
              <span>12-GAUGE TABLETOP ROULETTE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#EDEDED]">
              Buckshot Roulette
            </h2>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Live rounds vs Blank rounds in unknown order. Shoot the Dealer or shoot yourself for a free turn. Survive 3 rounds to win $1,000.
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={loadMagazineForRound}>
              LOAD CHAMBER →
            </Button>
          </div>
        ) : (
          <>
            {/* 12-Gauge Shotgun Visual Representation */}
            <div className="relative w-full max-w-xs flex flex-col items-center justify-center p-4 bg-[#141414] border border-[#242424] rounded-2xl">
              {/* Sawed-Off Status Badge */}
              {isSawedOff && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-3 bg-[#2A1416] text-[#F87171] border border-[#4D2024] text-[10px] font-mono-meta font-bold px-2 py-0.5 rounded-full shadow"
                >
                  🪚 SAWED-OFF (2X DAMAGE)
                </motion.div>
              )}

              {/* Shotgun Icon Graphic */}
              <div className="text-5xl sm:text-6xl my-1 filter drop-shadow">
                {isSawedOff ? '🪚' : '💥'}
              </div>
              <div className="text-xs font-mono-meta font-bold text-[#EDEDED] uppercase tracking-wider">
                12-Gauge Pump Shotgun
              </div>

              {/* Chamber Status Info */}
              <div className="flex items-center gap-2 mt-2 text-[11px] font-mono-meta">
                <span className="bg-[#1F1F1F] text-[#EDEDED] px-2 py-0.5 rounded border border-[#2A2A2A]">
                  {magazine.length} shells loaded
                </span>
                <span className="text-[#F87171] font-bold">
                  {liveRemaining} Live 🔴
                </span>
                <span className="text-[#8E8E93]">
                  {blankRemaining} Blank ⚪
                </span>
              </div>
            </div>

            {/* Special Inspection Hints (Magnifier / Burner Phone) */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {inspectedCurrentShell && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#122416] text-[#4ADE80] border border-[#1E3A24] px-2.5 py-1 rounded-md font-mono-meta font-bold"
                >
                  🔍 CURRENT CHAMBER: {inspectedCurrentShell.toUpperCase()}
                </motion.div>
              )}
              {phoneHint && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#0E2338] text-[#60A5FA] border border-[#173A5E] px-2.5 py-1 rounded-md font-mono-meta font-bold"
                >
                  📱 {phoneHint}
                </motion.div>
              )}
            </div>

            {/* Tension Log Announcer */}
            <div className="w-full text-center py-2 px-3 bg-[#141414] border border-[#242424] rounded-lg">
              <span className="font-mono-meta text-xs text-[#EDEDED] leading-relaxed">
                {logMessage}
              </span>
            </div>
          </>
        )}
      </div>

      {/* BOTTOM: THE PLAYER (HEALTH, ITEMS, HIGH-STAKES ACTIONS) */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 space-y-3 z-10">
        {/* Player Header & Health Meter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] border border-[#2D2D2D] flex items-center justify-center text-xs font-mono-meta font-bold text-[#EDEDED]">
              <User size={16} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-editorial font-bold text-sm text-[#EDEDED]">You</span>
                {isPlayerHandcuffed && (
                  <span className="bg-[#2A1416] text-[#F87171] border border-[#4D2024] text-[9px] font-mono-meta px-1.5 py-0.2 rounded font-bold">
                    HANDCUFFED
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#8E8E93] font-mono-meta">
                {playerHealth}/{maxHealth} Charges
              </div>
            </div>
          </div>

          {/* Health Charges */}
          <div className="flex items-center gap-1">
            {Array.from({ length: maxHealth }).map((_, i) => (
              <div
                key={`player-hp-${i}`}
                className={`w-5 h-6 rounded flex items-center justify-center border transition-all ${
                  i < playerHealth
                    ? 'bg-[#122416] border-[#1E3A24] text-[#4ADE80]'
                    : 'bg-[#121212] border-[#222222] text-[#333333]'
                }`}
              >
                <Lightning size={14} weight={i < playerHealth ? 'fill' : 'bold'} />
              </div>
            ))}
          </div>
        </div>

        {/* Player Interactive Item Inventory */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8E8E93] font-mono-meta uppercase">
            <span>Your Inventory ({playerItems.length}/8):</span>
            <span>Tap item to use on your turn</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {playerItems.map((item) => (
              <button
                key={item.id}
                disabled={!isUserTurn}
                onClick={() => playerUseItem(item.id)}
                title={`${item.name}: ${item.description}`}
                className="bg-[#181818] hover:bg-[#222222] disabled:opacity-40 border border-[#2A2A2A] p-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition active:scale-95 cursor-pointer"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-[9px] font-mono-meta text-[#EDEDED] truncate w-full text-center">
                  {item.name.split(' ')[0]}
                </span>
              </button>
            ))}

            {Array.from({ length: Math.max(0, 8 - playerItems.length) }).map((_, i) => (
              <div
                key={`empty-inv-${i}`}
                className="border border-dashed border-[#242424] rounded-lg p-2 flex items-center justify-center text-[10px] text-[#444444] font-mono-meta"
              >
                Empty
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-1">
          {phase === 'round-won' ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={proceedToNextRound}
            >
              NEXT ROUND ({roundNumber + 1}) →
            </Button>
          ) : phase === 'game-over' ? (
            <Button
              variant="danger"
              size="lg"
              className="w-full font-bold"
              onClick={startNewGame}
            >
              DEFIBRILLATOR FLATLINE — TRY AGAIN 💀
            </Button>
          ) : phase === 'victory' ? (
            <Button
              variant="gold"
              size="lg"
              className="w-full font-bold"
              onClick={startNewGame}
            >
              CLAIM $1,000 & PLAY AGAIN 🏆
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="lg"
                disabled={!isUserTurn}
                onClick={playerShootSelf}
                className="font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm py-3"
              >
                <ShieldCheck size={18} weight="bold" />
                <span>SHOOT SELF (Free turn if blank)</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                disabled={!isUserTurn}
                onClick={playerShootDealer}
                className="font-bold flex items-center justify-center gap-1.5 text-xs sm:text-sm py-3"
              >
                <Crosshair size={18} weight="bold" />
                <span>SHOOT DEALER</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
