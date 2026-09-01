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
          particleCount: 100,
          spread: 70,
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
    <div className="w-full flex-1 flex flex-col justify-between felt-surface p-3 sm:p-5 relative overflow-hidden min-h-[calc(100dvh-57px)]">
      {/* Table Felt Ambient Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-serif-luxury text-7xl sm:text-9xl font-bold tracking-widest text-amber-200">
          HOLD'EM
        </span>
      </div>

      {/* TOP SECTION: Bot Opponents */}
      <div className="w-full max-w-lg mx-auto grid grid-cols-2 gap-3 z-10">
        {bots.map((bot) => {
          const isTurn = players[activePlayerIndex]?.id === bot.id && phase !== 'betting' && phase !== 'showdown' && phase !== 'hand-ended';
          return (
            <div
              key={bot.id}
              className={`flex items-center gap-2 p-2.5 rounded-2xl transition-all ${
                isTurn
                  ? 'bg-slate-950/90 ring-2 ring-amber-400 shadow-xl'
                  : 'bg-slate-950/60 border border-slate-800/80'
              } ${bot.status === 'folded' ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* Bot Avatar & Badges */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow">
                  {bot.avatar}
                </div>
                {bot.isDealer && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    D
                  </span>
                )}
                {bot.isSmallBlind && (
                  <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white font-bold text-[8px] px-1 rounded shadow">
                    SB
                  </span>
                )}
                {bot.isBigBlind && (
                  <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white font-bold text-[8px] px-1 rounded shadow">
                    BB
                  </span>
                )}
              </div>

              {/* Bot Info & Last Action */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 truncate">{bot.name}</span>
                  <span className="text-[11px] font-mono font-bold text-amber-300">${bot.chips}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  {bot.lastAction ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 truncate">
                      {bot.lastAction}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Waiting...</span>
                  )}
                  {bot.currentBet > 0 && (
                    <span className="text-[10px] font-mono text-amber-400">Bet: ${bot.currentBet}</span>
                  )}
                </div>
              </div>

              {/* Bot Cards */}
              <div className="flex -space-x-4">
                {bot.cards.map((c) => (
                  <CardView key={c.id} card={c} className="!w-9 !h-14 sm:!w-11 sm:!h-16" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MIDDLE SECTION: Pot, Community Cards, and Outcome Banner */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center z-10 space-y-2 py-2">
        {/* Pot Badge */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-400/40 px-4 py-1.5 rounded-full shadow-xl">
          <span className="text-amber-400 text-sm">🪙</span>
          <span className="text-xs text-slate-300 font-medium">TOTAL POT:</span>
          <span className="font-mono font-black text-base text-amber-300">${pot}</span>
        </div>

        {/* Community Cards */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 min-h-[105px] sm:min-h-[135px]">
          <AnimatePresence>
            {communityCards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </AnimatePresence>
          {communityCards.length === 0 && (
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl border-2 border-dashed border-emerald-500/20 flex items-center justify-center text-emerald-500/30 text-xs font-serif-luxury"
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-1.5 px-4 rounded-xl bg-slate-950/90 border border-amber-400 shadow-2xl"
          >
            <span className="font-serif-luxury font-bold text-xs sm:text-sm text-amber-300">
              {winnerSummary}
            </span>
          </motion.div>
        )}
      </div>

      {/* BOTTOM SECTION: Player Hole Cards & Hand Strength */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center z-10 space-y-1.5">
        {/* Hand Strength Indicator */}
        {user.cards.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full text-xs">
            <span className="text-slate-400">Your Hand:</span>
            <span className="font-bold text-amber-300 font-serif-luxury">
              {playerHandEvaluation?.displayName || 'Pair / High Card'}
            </span>
          </div>
        )}

        {/* Player Hole Cards */}
        <div className="flex items-center justify-center gap-3">
          {user.cards.map((c) => (
            <CardView key={c.id} card={c} className="shadow-2xl ring-2 ring-emerald-500/40" />
          ))}
          {user.cards.length === 0 && (
            <div className="flex gap-2">
              <div className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-emerald-500/40 text-xs font-serif-luxury">
                Card 1
              </div>
              <div className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-emerald-500/40 text-xs font-serif-luxury">
                Card 2
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM ACTION CONTROLS (One-Handed Mobile Thumb Zone) */}
      <div className="w-full max-w-lg mx-auto bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-2xl z-20 mt-2">
        {phase === 'betting' || phase === 'showdown' || phase === 'hand-ended' ? (
          <Button
            variant="gold"
            size="lg"
            className="w-full font-extrabold tracking-wider"
            onClick={startNewHand}
          >
            DEAL NEXT HAND (Blinds $10 / $20) ⚡
          </Button>
        ) : (
          <div className="space-y-2.5">
            {/* Quick Raise Buttons */}
            {isUserTurn && (
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">Raise:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const min = currentHighestBet + minRaise;
                      setRaiseAmount(min);
                      playerRaise(min);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold active:scale-95"
                  >
                    Min (${currentHighestBet + minRaise})
                  </button>
                  <button
                    onClick={() => {
                      const potBet = currentHighestBet + Math.max(minRaise, pot);
                      setRaiseAmount(potBet);
                      playerRaise(potBet);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 font-bold active:scale-95"
                  >
                    Pot (${currentHighestBet + Math.max(minRaise, pot)})
                  </button>
                  <button
                    onClick={() => {
                      playerRaise(user.chips + user.currentBet);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold active:scale-95"
                  >
                    ALL-IN (${user.chips})
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
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
                variant="gold"
                size="md"
                disabled={!isUserTurn || user.chips <= callAmount}
                onClick={() => playerRaise(Math.max(currentHighestBet + minRaise, raiseAmount))}
                className="font-bold text-xs"
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
