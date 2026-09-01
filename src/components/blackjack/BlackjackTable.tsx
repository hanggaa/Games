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
    <div className="w-full flex-1 flex flex-col justify-between bg-[#0A0A0A] p-3 sm:p-5 min-h-[calc(100dvh-57px)] max-w-4xl mx-auto space-y-3">
      {/* TOP HEADER: Shoe Status & Dealer Score */}
      <div className="w-full flex items-center justify-between z-10 px-1">
        {/* 3-Deck Continuous Shoe Status */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#242424] px-2.5 py-1 rounded-md text-xs font-mono-meta">
          <Stack size={14} weight="bold" className="text-[#EDEDED]" />
          <span className="text-[#EDEDED]">
            {shoe.length} / 156 cards
          </span>
          {cutCardReached && (
            <span className="bg-[#2A1416] text-[#F87171] border border-[#4D2024] text-[9px] font-bold px-1.5 py-0.2 rounded">
              CUT CARD
            </span>
          )}
          {phase === 'betting' && (
            <button
              onClick={reshuffleShoe}
              title="Reshuffle 3-Deck Shoe"
              className="text-[#8E8E93] hover:text-[#EDEDED] transition active:scale-95 ml-1 cursor-pointer"
            >
              <ArrowsClockwise size={12} weight="bold" />
            </button>
          )}
        </div>

        {/* Dealer Score Badge */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#242424] px-3 py-1 rounded-md text-xs">
          <span className="font-serif-editorial font-bold text-[#EDEDED]">DEALER</span>
          {dealerCards.length > 0 && dealerCards.some((c) => c.faceUp) && (
            <span className="font-mono-meta font-bold text-[#EDEDED] bg-[#1C1C1C] px-2 py-0.5 rounded border border-[#2A2A2A]">
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

      {/* DEALER CARDS CONTAINER */}
      <div className="w-full flex items-center justify-center gap-2 min-h-[95px] sm:min-h-[120px] py-1 z-10">
        <AnimatePresence>
          {dealerCards.map((card) => (
            <CardView key={card.id} card={card} />
          ))}
        </AnimatePresence>
        {dealerCards.length === 0 && (
          <div className="w-15 h-22 sm:w-18 sm:h-26 rounded-lg border border-dashed border-[#282828] flex items-center justify-center text-[#555555] text-xs font-mono-meta">
            Dealer
          </div>
        )}
      </div>

      {/* MIDDLE SECTION: Round Outcome Banner & Trainer HUD */}
      <div className="w-full max-w-md mx-auto z-10 space-y-2 py-1">
        {roundMessage && (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-1.5 px-3 rounded-md bg-[#141414] border border-[#333333] shadow-sm"
          >
            <span className="font-serif-editorial font-bold text-xs sm:text-sm text-[#EDEDED]">
              {roundMessage}
            </span>
          </motion.div>
        )}

        {isPro && (
          <TrainerHud
            counting={counting}
            lastFeedback={lastFeedback}
            currentAdvice={currentAdvice}
          />
        )}
      </div>

      {/* BOTTOM SECTION: Player Hands */}
      <div className="w-full flex flex-col items-center z-10 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {playerHands.map((hand, idx) => {
            const isActive = idx === activeHandIndex && phase === 'player-turn';
            return (
              <div
                key={hand.id}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#141414] border-2 border-white shadow-sm'
                    : 'bg-[#141414] border border-[#242424]'
                }`}
              >
                {/* Score & Bet Pill */}
                <div className="flex items-center gap-2 mb-1.5 text-xs">
                  <span className="font-serif-editorial font-bold text-[#EDEDED]">
                    {playerHands.length > 1 ? `Hand ${idx + 1}` : 'Player'}
                  </span>
                  <span className="font-mono-meta font-bold bg-[#1C1C1C] text-[#EDEDED] px-2 py-0.5 rounded border border-[#2A2A2A]">
                    {hand.score.isBlackjack
                      ? 'BLACKJACK'
                      : hand.score.isBust
                      ? `BUST (${hand.score.total})`
                      : hand.score.total}
                  </span>
                  <span className="text-[11px] text-[#8E8E93] font-mono-meta font-semibold">
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
            <div className="w-15 h-22 sm:w-18 sm:h-26 rounded-lg border border-dashed border-[#282828] flex items-center justify-center text-[#555555] text-xs font-mono-meta">
              Player
            </div>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM ACTION CONTROLS */}
      <div className="w-full bg-[#141414] border border-[#242424] rounded-xl p-3 z-20">
        {phase === 'betting' || phase === 'round-over' ? (
          <div className="space-y-2.5">
            {/* Chip Selection Row */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-[#8E8E93] font-mono-meta uppercase font-semibold">Bet Amount:</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
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
                  <Button variant="primary" size="lg" className="flex-1" onClick={nextRound}>
                    New Round
                  </Button>
                  <Button variant="secondary" size="lg" onClick={dealHand}>
                    Re-bet ${currentBet}
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="lg" className="w-full" onClick={dealHand}>
                  DEAL (${currentBet})
                </Button>
              )}
            </div>
          </div>
        ) : (
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
