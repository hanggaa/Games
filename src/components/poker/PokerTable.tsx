import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { usePokerStore } from '../../store/usePokerStore';
import { CardView } from '../common/CardView';
import { Button } from '../common/Button';

export const PokerTable: React.FC = () => {
  const {
    phase,
    communityCards,
    players,
    activePlayerIndex,
    currentHighestBet,
    pot,
    minRaise,
    winnerSummary,
    playerHandEvaluation,
    initGame,
    startNewHand,
    playerCheck,
    playerCall,
    playerRaise,
    playerFold,
  } = usePokerStore();

  const [raiseAmount, setRaiseAmount] = useState(40);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (winnerSummary && winnerSummary.includes('You won') && phase === 'showdown') {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  }, [winnerSummary, phase]);

  const user = players.find((p) => !p.isBot)!;
  const bots = players.filter((p) => p.isBot);
  const isUserTurn = players[activePlayerIndex]?.id === 'player-user' && phase !== 'betting' && phase !== 'showdown' && phase !== 'hand-ended';

  const callAmount = currentHighestBet - user.currentBet;
  const canCheck = callAmount === 0;

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP SECTION: Bot Opponents */}
      <div className="grid grid-cols-2 gap-3 z-10">
        {bots.map((bot) => {
          const isTurn = players[activePlayerIndex]?.id === bot.id && phase !== 'betting' && phase !== 'showdown' && phase !== 'hand-ended';
          return (
            <div
              key={bot.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
                isTurn
                  ? 'bg-[#141414] border-2 border-white shadow-sm'
                  : 'bg-[#141414] border border-[#242424]'
              } ${bot.status === 'folded' ? 'opacity-30' : 'opacity-100'}`}
            >
              {/* Bot Avatar & Badges */}
              <div className="relative">
                <div className="w-8 h-8 rounded bg-[#1C1C1C] border border-[#2D2D2D] flex items-center justify-center text-xs font-mono-meta font-bold text-[#EDEDED]">
                  {bot.name[0]}
                </div>
                {bot.isDealer && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#0A0A0A] font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono-meta shadow">
                    D
                  </span>
                )}
              </div>

              {/* Bot Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#EDEDED] truncate">{bot.name}</span>
                  <span className="text-[11px] font-mono-meta text-[#8E8E93]">${bot.chips}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  {bot.lastAction ? (
                    <span className="text-[9px] font-mono-meta font-semibold text-[#EDEDED] bg-[#1C1C1C] px-1 rounded border border-[#2A2A2A] truncate">
                      {bot.lastAction}
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#555555]">Waiting...</span>
                  )}
                  {bot.currentBet > 0 && (
                    <span className="text-[9px] font-mono-meta text-[#FBBF24] font-bold">Bet: ${bot.currentBet}</span>
                  )}
                </div>
              </div>

              {/* Bot Cards */}
              <div className="flex -space-x-3">
                {bot.cards.map((c) => (
                  <CardView key={c.id} card={c} className="!w-8 !h-12 sm:!w-10 sm:!h-15" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MIDDLE SECTION: Pot, Community Cards, and Outcome Banner */}
      <div className="flex flex-col items-center justify-center z-10 space-y-2 py-2">
        {/* Pot Badge */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#242424] px-3 py-1 rounded-md shadow-sm text-xs font-mono-meta">
          <span className="text-[#8E8E93]">POT:</span>
          <span className="font-bold text-[#FBBF24] text-sm">${pot}</span>
        </div>

        {/* Community Cards */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-h-[95px] sm:min-h-[120px]">
          <AnimatePresence>
            {communityCards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </AnimatePresence>
          {communityCards.length === 0 && (
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-15 h-22 sm:w-18 sm:h-26 rounded-lg border border-dashed border-[#282828] flex items-center justify-center text-[#555555] text-xs font-mono-meta"
                >
                  {i < 3 ? 'Flop' : i === 3 ? 'Turn' : 'River'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Winner / Status Banner */}
        {winnerSummary && (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-1.5 px-3 rounded-md bg-[#141414] border border-[#333333] shadow-sm"
          >
            <span className="font-serif-editorial font-bold text-xs sm:text-sm text-[#EDEDED]">
              {winnerSummary}
            </span>
          </motion.div>
        )}
      </div>

      {/* BOTTOM SECTION: Player Hole Cards & Hand Strength */}
      <div className="flex flex-col items-center z-10 space-y-1.5">
        {user.cards.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#242424] px-2.5 py-0.5 rounded text-xs">
            <span className="text-[#8E8E93]">Your Hand:</span>
            <span className="font-bold text-[#EDEDED] font-serif-editorial">
              {playerHandEvaluation?.displayName || 'Pair / High Card'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2.5">
          {user.cards.map((c) => (
            <CardView key={c.id} card={c} className="border-2 border-white" />
          ))}
          {user.cards.length === 0 && (
            <div className="flex gap-2">
              <div className="w-15 h-22 sm:w-18 sm:h-26 rounded-lg border border-dashed border-[#282828] flex items-center justify-center text-[#555555] text-xs font-mono-meta">
                Card 1
              </div>
              <div className="w-15 h-22 sm:w-18 sm:h-26 rounded-lg border border-dashed border-[#282828] flex items-center justify-center text-[#555555] text-xs font-mono-meta">
                Card 2
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM ACTION CONTROLS */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 z-20">
        {phase === 'betting' || phase === 'showdown' || phase === 'hand-ended' ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold"
            onClick={startNewHand}
          >
            DEAL NEXT HAND (Blinds $10 / $20) →
          </Button>
        ) : (
          <div className="space-y-2">
            {isUserTurn && (
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[#8E8E93] font-mono-meta">Quick Raise:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const min = currentHighestBet + minRaise;
                      setRaiseAmount(min);
                      playerRaise(min);
                    }}
                    className="px-2 py-0.5 rounded bg-[#181818] text-[#EDEDED] border border-[#2A2A2A] font-mono-meta text-xs font-semibold active:scale-95 cursor-pointer"
                  >
                    Min (${currentHighestBet + minRaise})
                  </button>
                  <button
                    onClick={() => {
                      const potBet = currentHighestBet + Math.max(minRaise, pot);
                      setRaiseAmount(potBet);
                      playerRaise(potBet);
                    }}
                    className="px-2 py-0.5 rounded bg-[#181818] text-[#EDEDED] border border-[#2A2A2A] font-mono-meta text-xs font-semibold active:scale-95 cursor-pointer"
                  >
                    Pot (${currentHighestBet + Math.max(minRaise, pot)})
                  </button>
                  <button
                    onClick={() => {
                      playerRaise(user.chips + user.currentBet);
                    }}
                    className="px-2 py-0.5 rounded bg-[#2A1416] text-[#F87171] border border-[#4D2024] font-mono-meta text-xs font-semibold active:scale-95 cursor-pointer"
                  >
                    All-in (${user.chips})
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="danger"
                size="md"
                disabled={!isUserTurn}
                onClick={playerFold}
                className="font-bold text-xs"
              >
                FOLD
              </Button>

              {canCheck ? (
                <Button
                  variant="secondary"
                  size="md"
                  disabled={!isUserTurn}
                  onClick={playerCheck}
                  className="font-bold text-xs"
                >
                  CHECK
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!isUserTurn}
                  onClick={playerCall}
                  className="font-bold text-xs"
                >
                  CALL (${callAmount})
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                disabled={!isUserTurn || user.chips <= callAmount}
                onClick={() => playerRaise(Math.max(currentHighestBet + minRaise, raiseAmount))}
                className="font-bold text-xs font-mono-meta"
              >
                RAISE (${Math.max(currentHighestBet + minRaise, raiseAmount)})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
