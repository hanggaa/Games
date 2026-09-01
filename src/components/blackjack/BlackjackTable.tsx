import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowsClockwise, Stack } from '@phosphor-icons/react';
import { useBlackjackStore } from '../../store/useBlackjackStore';
import { calculateScore, canSplit, canDouble } from '../../engine/blackjack/blackjackLogic';
import { getBasicStrategyRecommendation } from '../../engine/blackjack/basicStrategy';
import { CardView } from '../common/CardView';
import { ChipBadge } from '../common/ChipBadge';
import { Button } from '../common/Button';
import { TrainerHud } from './TrainerHud';

interface BlackjackTableProps {
  isPro?: boolean;
}

export const BlackjackTable: React.FC<BlackjackTableProps> = ({ isPro = false }) => {
  const {
    phase,
    shoe,
    dealerCards,
    playerHands,
    activeHandIndex,
    currentBet,
    counting,
    lastFeedback,
    roundMessage,
    cutCardReached,
    initGame,
    setBet,
    dealHand,
    hit,
    stand,
    doubleDown,
    split,
    nextRound,
    reshuffleShoe,
  } = useBlackjackStore();

  useEffect(() => {
    initGame(isPro);
  }, [isPro, initGame]);

  const dealerScore = calculateScore(dealerCards);
  const activeHand = playerHands[activeHandIndex];
  const dealerUpcard = dealerCards.length > 0 ? dealerCards[0] : null;

  const currentAdvice =
    activeHand && phase === 'player-turn'
      ? getBasicStrategyRecommendation(activeHand, dealerUpcard).reason
      : undefined;

  const canSplitActive = activeHand && canSplit(activeHand);
  const canDoubleActive = activeHand && canDouble(activeHand);

  return (
    <div className="w-full flex-1 flex flex-col justify-between felt-surface p-3 sm:p-5 relative overflow-hidden min-h-[calc(100dvh-57px)]">
      {/* Decorative Casino Felt Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-serif-luxury text-8xl sm:text-9xl font-bold tracking-widest text-amber-200">
          21
        </span>
      </div>

      {/* TOP HEADER: Physical 3-Deck Shoe Status & Dealer Area */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between z-10 px-1">
        {/* Physical 3-Deck Shoe Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl shadow text-xs">
          <Stack size={16} className="text-amber-400" />
          <div className="flex flex-col text-[10px] leading-tight">
            <span className="text-slate-400 font-semibold">3-Deck Shoe</span>
            <span className="font-mono font-bold text-amber-300">
              {shoe.length} / 156 cards
            </span>
          </div>
          {cutCardReached && (
            <span className="bg-rose-950 text-rose-300 font-bold text-[8px] px-1 py-0.5 rounded border border-rose-800">
              CUT CARD
            </span>
          )}
          {phase === 'betting' && (
            <button
              onClick={reshuffleShoe}
              title="Reshuffle 3-Deck Shoe"
              className="text-slate-400 hover:text-amber-300 transition active:scale-95 ml-1 p-0.5"
            >
              <ArrowsClockwise size={13} />
            </button>
          )}
        </div>

        {/* Dealer Score Badge */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3 py-1 rounded-full text-xs text-slate-300 shadow">
          <span className="font-serif-luxury font-bold text-amber-400">DEALER</span>
          {dealerCards.length > 0 && dealerCards.some((c) => c.faceUp) && (
            <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-amber-300">
              {dealerCards.every((c) => c.faceUp)
                ? dealerScore.isBlackjack
                  ? 'BLACKJACK'
                  : dealerScore.isBust
                  ? `BUST (${dealerScore.total})`
                  : dealerScore.total
                : dealerCards[0].value === 11
                ? '11 / 1'
                : dealerCards[0].value}
            </span>
          )}
        </div>
      </div>

      {/* DEALER CARDS */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-center gap-1.5 sm:gap-2.5 min-h-[105px] sm:min-h-[135px] py-1 z-10">
        <AnimatePresence>
          {dealerCards.map((card) => (
            <CardView key={card.id} card={card} />
          ))}
        </AnimatePresence>
        {dealerCards.length === 0 && (
          <div className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl border-2 border-dashed border-emerald-500/20 flex items-center justify-center text-emerald-500/30 text-xs font-serif-luxury">
            Dealer
          </div>
        )}
      </div>

      {/* MIDDLE SECTION: Round Outcome Banner & Trainer HUD */}
      <div className="w-full max-w-md mx-auto z-10 space-y-2 py-1">
        {/* Round Outcome Banner */}
        {roundMessage && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-1.5 px-4 rounded-xl bg-slate-950/90 border border-amber-400/50 shadow-xl"
          >
            <span className="font-serif-luxury font-bold text-xs sm:text-sm text-amber-300">
              {roundMessage}
            </span>
          </motion.div>
        )}

        {/* Trainer HUD (in Pro Mode) */}
        {isPro && (
          <TrainerHud
            counting={counting}
            lastFeedback={lastFeedback}
            currentAdvice={currentAdvice}
          />
        )}
      </div>

      {/* BOTTOM SECTION: Player Hands */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center z-10 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          {playerHands.map((hand, idx) => {
            const isActive = idx === activeHandIndex && phase === 'player-turn';
            return (
              <div
                key={hand.id}
                className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-slate-950/80 ring-2 ring-amber-400 ring-offset-2 ring-offset-emerald-950 shadow-2xl'
                    : 'bg-slate-950/40 border border-slate-800/60'
                }`}
              >
                {/* Score & Bet Pill */}
                <div className="flex items-center gap-2 mb-1.5 text-xs">
                  <span className="font-serif-luxury font-bold text-slate-200">
                    {playerHands.length > 1 ? `Hand ${idx + 1}` : 'Player'}
                  </span>
                  <span className="font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                    {hand.score.isBlackjack
                      ? 'BLACKJACK 👑'
                      : hand.score.isBust
                      ? `BUST (${hand.score.total})`
                      : hand.score.total}
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">
                    ${hand.bet}
                  </span>
                </div>

                {/* Player Cards */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <AnimatePresence>
                    {hand.cards.map((card) => (
                      <CardView key={card.id} card={card} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {playerHands.length === 0 && (
            <div className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl border-2 border-dashed border-emerald-500/20 flex items-center justify-center text-emerald-500/30 text-xs font-serif-luxury">
              Player
            </div>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM ACTION CONTROLS (One-Handed Mobile Thumb Zone) */}
      <div className="w-full max-w-lg mx-auto bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-2xl z-20 mt-2">
        {phase === 'betting' || phase === 'round-over' ? (
          <div className="space-y-3">
            {/* Chip Selection Row */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-400 font-medium">Select Bet:</span>
              <div className="flex items-center gap-2 sm:gap-3">
                {[5, 25, 50, 100, 500].map((amount) => (
                  <ChipBadge
                    key={amount}
                    amount={amount}
                    isSelected={currentBet === amount}
                    onClick={() => setBet(amount)}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {phase === 'round-over' ? (
                <>
                  <Button variant="gold" size="lg" className="flex-1" onClick={nextRound}>
                    New Round
                  </Button>
                  <Button variant="secondary" size="lg" onClick={dealHand}>
                    Re-bet ${currentBet}
                  </Button>
                </>
              ) : (
                <Button variant="gold" size="lg" className="w-full" onClick={dealHand}>
                  DEAL (${currentBet})
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Player Decision Action Sheet */
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="md"
              disabled={!canDoubleActive || phase !== 'player-turn'}
              onClick={doubleDown}
              className="text-xs font-bold"
            >
              DOUBLE
            </Button>
            <Button
              variant="outline"
              size="md"
              disabled={!canSplitActive || phase !== 'player-turn'}
              onClick={split}
              className="text-xs font-bold"
            >
              SPLIT
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={phase !== 'player-turn'}
              onClick={stand}
              className="text-xs font-bold"
            >
              STAND
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={phase !== 'player-turn'}
              onClick={hit}
              className="text-xs font-bold"
            >
              HIT
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
