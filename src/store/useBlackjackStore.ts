import { create } from 'zustand';
import { Card } from '../types/card.types';
import { PlayerHand, BlackjackPhase, CountingMetrics, StrategyFeedback } from '../types/blackjack.types';
import { createShoe } from '../engine/core/shoe';
import { calculateScore, evaluateHandOutcome, canSplit, canDouble } from '../engine/blackjack/blackjackLogic';
import { calculateCountingMetrics } from '../engine/blackjack/cardCounting';
import { getBasicStrategyRecommendation } from '../engine/blackjack/basicStrategy';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

const TOTAL_DECKS = 3; // 3-deck physical bridge shoe (156 cards)
const TOTAL_CARDS = TOTAL_DECKS * 52;
const CUT_CARD_REMAINING = 39; // Cut card inserted at ~75% penetration (39 cards left)

interface BlackjackState {
  isProMode: boolean;
  phase: BlackjackPhase;
  shoe: Card[];
  dealtCards: Card[];
  dealerCards: Card[];
  playerHands: PlayerHand[];
  activeHandIndex: number;
  currentBet: number;
  counting: CountingMetrics;
  lastFeedback: StrategyFeedback | null;
  roundMessage: string | null;
  cutCardReached: boolean;

  // Actions
  initGame: (isPro: boolean) => void;
  setBet: (amount: number) => void;
  dealHand: () => void;
  hit: () => void;
  stand: () => void;
  doubleDown: () => void;
  split: () => void;
  nextRound: () => void;
  reshuffleShoe: () => void;
}

export const useBlackjackStore = create<BlackjackState>()((set, get) => ({
  isProMode: false,
  phase: 'betting',
  shoe: createShoe(TOTAL_DECKS),
  dealtCards: [],
  dealerCards: [],
  playerHands: [],
  activeHandIndex: 0,
  currentBet: 25,
  counting: {
    runningCount: 0,
    trueCount: 0,
    decksRemaining: TOTAL_DECKS,
    cardsDealt: 0,
    totalCards: TOTAL_CARDS,
    penetrationPct: 0,
  },
  lastFeedback: null,
  roundMessage: null,
  cutCardReached: false,

  initGame: (isPro: boolean) => {
    // Keep existing shoe if already initialized to maintain counting continuity, or create 3-deck shoe
    const currentShoe = get().shoe.length > 0 ? get().shoe : createShoe(TOTAL_DECKS);
    set({
      isProMode: isPro,
      phase: 'betting',
      shoe: currentShoe,
      dealerCards: [],
      playerHands: [],
      activeHandIndex: 0,
      lastFeedback: null,
      roundMessage: null,
    });
    useBankrollStore.getState().setLastActiveGame(isPro ? 'blackjack-pro' : 'blackjack');
  },

  setBet: (amount: number) => {
    sound.playChipToss();
    set({ currentBet: Math.max(5, amount) });
  },

  reshuffleShoe: () => {
    sound.playShuffle();
    const newShoe = createShoe(TOTAL_DECKS);
    set({
      shoe: newShoe,
      dealtCards: [],
      counting: calculateCountingMetrics([], TOTAL_DECKS),
      cutCardReached: false,
      roundMessage: '3-Deck Shoe Reshuffled! 🔀',
    });
  },

  dealHand: () => {
    const { currentBet, shoe, isProMode, cutCardReached } = get();
    const bankroll = useBankrollStore.getState();

    // Check balance
    if (bankroll.chips < currentBet) {
      sound.playBust();
      set({ roundMessage: 'Not enough chips! Tap reload.' });
      return;
    }

    let activeShoe = [...shoe];
    let dealt = [...get().dealtCards];

    // If cut card was reached in previous round or shoe is low, trigger shuffle now
    if (cutCardReached || activeShoe.length <= CUT_CARD_REMAINING) {
      sound.playShuffle();
      activeShoe = createShoe(TOTAL_DECKS);
      dealt = [];
      set({ cutCardReached: false });
    }

    bankroll.deductChips(currentBet);
    sound.playChipToss();

    // Deal one-by-one from the physical 3-deck shoe
    const pCard1 = { ...activeShoe.pop()!, faceUp: true };
    const dCard1 = { ...activeShoe.pop()!, faceUp: true }; // Upcard
    const pCard2 = { ...activeShoe.pop()!, faceUp: true };
    const dCard2 = { ...activeShoe.pop()!, faceUp: false }; // Hole card

    const newDealt = [...dealt, pCard1, dCard1, pCard2, dCard2];

    const initialPlayerHand: PlayerHand = {
      id: 'hand-0',
      cards: [pCard1, pCard2],
      bet: currentBet,
      status: 'active',
      score: calculateScore([pCard1, pCard2]),
      isSplit: false,
    };

    const initialDealerCards = [dCard1, dCard2];
    const initialDealerScore = calculateScore(initialDealerCards);

    sound.playCardSlide();

    // Counting update on revealed cards
    const visibleCards = newDealt.filter((c) => c.faceUp);
    const counting = calculateCountingMetrics(visibleCards, TOTAL_DECKS);
    const isCutHit = activeShoe.length <= CUT_CARD_REMAINING;

    set({
      shoe: activeShoe,
      dealtCards: newDealt,
      dealerCards: initialDealerCards,
      playerHands: [initialPlayerHand],
      activeHandIndex: 0,
      phase: 'player-turn',
      counting,
      lastFeedback: null,
      roundMessage: isCutHit ? 'Cut card reached — Reshuffling after this round' : null,
      cutCardReached: isCutHit,
    });

    // Check immediate Natural Blackjack
    if (initialPlayerHand.score.isBlackjack || initialDealerScore.isBlackjack) {
      setTimeout(() => {
        const revealedDealer = [dCard1, { ...dCard2, faceUp: true }];
        const fullCounting = calculateCountingMetrics(newDealt, TOTAL_DECKS);
        const finalDealerScore = calculateScore(revealedDealer);
        const outcome = evaluateHandOutcome(initialPlayerHand, finalDealerScore);

        if (outcome.result === 'blackjack') {
          sound.playWinFanfare();
          bankroll.recordHand(outcome.payout, currentBet, isProMode ? 'blackjack-pro' : 'blackjack', { isBJ: true });
          set({
            dealerCards: revealedDealer,
            counting: fullCounting,
            phase: 'round-over',
            playerHands: [{ ...initialPlayerHand, status: 'blackjack', result: 'blackjack', payout: outcome.payout }],
            roundMessage: 'BLACKJACK! Pays 3:2 👑',
          });
        } else if (outcome.result === 'push') {
          sound.playCardFlip();
          bankroll.recordHand(outcome.payout, currentBet, isProMode ? 'blackjack-pro' : 'blackjack', { isPush: true });
          set({
            dealerCards: revealedDealer,
            counting: fullCounting,
            phase: 'round-over',
            playerHands: [{ ...initialPlayerHand, status: 'stood', result: 'push', payout: outcome.payout }],
            roundMessage: 'Push! Both have Blackjack 🤝',
          });
        } else {
          sound.playBust();
          bankroll.recordHand(0, currentBet, isProMode ? 'blackjack-pro' : 'blackjack');
          set({
            dealerCards: revealedDealer,
            counting: fullCounting,
            phase: 'round-over',
            playerHands: [{ ...initialPlayerHand, status: 'busted', result: 'loss', payout: 0 }],
            roundMessage: 'Dealer has Blackjack! ♠️',
          });
        }
      }, 600);
    }
  },

  hit: () => {
    const { phase, playerHands, activeHandIndex, shoe, dealtCards, dealerCards, isProMode } = get();
    if (phase !== 'player-turn' || !playerHands[activeHandIndex]) return;

    const currentHand = playerHands[activeHandIndex];
    if (currentHand.status !== 'active') return;

    const recommendation = getBasicStrategyRecommendation(currentHand, dealerCards[0]);
    const isOptimal = recommendation.recommendedAction === 'H';
    const feedback: StrategyFeedback = {
      recommendedAction: recommendation.recommendedAction,
      playerAction: 'H',
      isOptimal,
      reason: recommendation.reason,
    };
    useBankrollStore.getState().recordTrainerDecision(isOptimal);

    sound.playCardSlide();
    const activeShoe = [...shoe];
    const newCard = { ...activeShoe.pop()!, faceUp: true };
    const newDealt = [...dealtCards, newCard];

    const updatedCards = [...currentHand.cards, newCard];
    const updatedScore = calculateScore(updatedCards);

    const updatedHands = [...playerHands];
    let nextPhase: BlackjackPhase = phase;
    let nextActiveIndex = activeHandIndex;
    let roundMsg = get().roundMessage;

    if (updatedScore.isBust) {
      sound.playBust();
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        score: updatedScore,
        status: 'busted',
        result: 'loss',
      };

      if (activeHandIndex < playerHands.length - 1) {
        nextActiveIndex = activeHandIndex + 1;
      } else {
        const allBusted = updatedHands.every((h) => h.status === 'busted');
        if (allBusted) {
          const revealedDealer = dealerCards.map((c) => ({ ...c, faceUp: true }));
          nextPhase = 'round-over';
          roundMsg = 'Bust! Dealer wins.';
          useBankrollStore.getState().recordHand(0, currentHand.bet, isProMode ? 'blackjack-pro' : 'blackjack');
          set({ dealerCards: revealedDealer });
        } else {
          setTimeout(() => executeDealerTurn(), 400);
        }
      }
    } else if (updatedScore.total === 21) {
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        score: updatedScore,
        status: 'stood',
      };
      if (activeHandIndex < playerHands.length - 1) {
        nextActiveIndex = activeHandIndex + 1;
      } else {
        setTimeout(() => executeDealerTurn(), 400);
      }
    } else {
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        score: updatedScore,
      };
    }

    const counting = calculateCountingMetrics(newDealt.filter((c) => c.faceUp), TOTAL_DECKS);
    const isCutHit = activeShoe.length <= CUT_CARD_REMAINING;

    set({
      shoe: activeShoe,
      dealtCards: newDealt,
      playerHands: updatedHands,
      activeHandIndex: nextActiveIndex,
      phase: nextPhase,
      counting,
      lastFeedback: feedback,
      roundMessage: roundMsg,
      cutCardReached: get().cutCardReached || isCutHit,
    });
  },

  stand: () => {
    const { phase, playerHands, activeHandIndex, dealerCards } = get();
    if (phase !== 'player-turn' || !playerHands[activeHandIndex]) return;

    const currentHand = playerHands[activeHandIndex];
    const recommendation = getBasicStrategyRecommendation(currentHand, dealerCards[0]);
    const isOptimal = recommendation.recommendedAction === 'S';
    const feedback: StrategyFeedback = {
      recommendedAction: recommendation.recommendedAction,
      playerAction: 'S',
      isOptimal,
      reason: recommendation.reason,
    };
    useBankrollStore.getState().recordTrainerDecision(isOptimal);
    sound.playButtonClick();

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = { ...currentHand, status: 'stood' };

    if (activeHandIndex < playerHands.length - 1) {
      set({
        playerHands: updatedHands,
        activeHandIndex: activeHandIndex + 1,
        lastFeedback: feedback,
      });
    } else {
      set({
        playerHands: updatedHands,
        lastFeedback: feedback,
      });
      setTimeout(() => executeDealerTurn(), 300);
    }
  },

  doubleDown: () => {
    const { phase, playerHands, activeHandIndex, shoe, dealtCards, dealerCards, isProMode } = get();
    if (phase !== 'player-turn' || !playerHands[activeHandIndex]) return;

    const currentHand = playerHands[activeHandIndex];
    if (!canDouble(currentHand)) return;

    const bankroll = useBankrollStore.getState();
    if (bankroll.chips < currentHand.bet) {
      sound.playBust();
      set({ roundMessage: 'Not enough chips to double!' });
      return;
    }

    bankroll.deductChips(currentHand.bet);
    sound.playChipToss();

    const recommendation = getBasicStrategyRecommendation(currentHand, dealerCards[0]);
    const isOptimal = recommendation.recommendedAction === 'D';
    const feedback: StrategyFeedback = {
      recommendedAction: recommendation.recommendedAction,
      playerAction: 'D',
      isOptimal,
      reason: recommendation.reason,
    };
    bankroll.recordTrainerDecision(isOptimal);

    sound.playCardSlide();
    const activeShoe = [...shoe];
    const newCard = { ...activeShoe.pop()!, faceUp: true };
    const newDealt = [...dealtCards, newCard];

    const updatedCards = [...currentHand.cards, newCard];
    const updatedScore = calculateScore(updatedCards);
    const updatedBet = currentHand.bet * 2;

    const updatedHands = [...playerHands];
    if (updatedScore.isBust) {
      sound.playBust();
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        bet: updatedBet,
        score: updatedScore,
        status: 'busted',
        result: 'loss',
      };
    } else {
      updatedHands[activeHandIndex] = {
        ...currentHand,
        cards: updatedCards,
        bet: updatedBet,
        score: updatedScore,
        status: 'doubled',
      };
    }

    const counting = calculateCountingMetrics(newDealt.filter((c) => c.faceUp), TOTAL_DECKS);
    const isCutHit = activeShoe.length <= CUT_CARD_REMAINING;

    if (activeHandIndex < playerHands.length - 1) {
      set({
        shoe: activeShoe,
        dealtCards: newDealt,
        playerHands: updatedHands,
        activeHandIndex: activeHandIndex + 1,
        counting,
        lastFeedback: feedback,
        cutCardReached: get().cutCardReached || isCutHit,
      });
    } else {
      set({
        shoe: activeShoe,
        dealtCards: newDealt,
        playerHands: updatedHands,
        counting,
        lastFeedback: feedback,
        cutCardReached: get().cutCardReached || isCutHit,
      });

      const allBusted = updatedHands.every((h) => h.status === 'busted');
      if (allBusted) {
        const revealedDealer = dealerCards.map((c) => ({ ...c, faceUp: true }));
        set({
          dealerCards: revealedDealer,
          phase: 'round-over',
          roundMessage: 'Bust on Double Down!',
        });
        bankroll.recordHand(0, updatedBet, isProMode ? 'blackjack-pro' : 'blackjack');
      } else {
        setTimeout(() => executeDealerTurn(), 400);
      }
    }
  },

  split: () => {
    const { phase, playerHands, activeHandIndex, shoe, dealtCards, dealerCards } = get();
    if (phase !== 'player-turn' || !playerHands[activeHandIndex]) return;

    const currentHand = playerHands[activeHandIndex];
    if (!canSplit(currentHand) || playerHands.length >= 3) return;

    const bankroll = useBankrollStore.getState();
    if (bankroll.chips < currentHand.bet) {
      sound.playBust();
      set({ roundMessage: 'Not enough chips to split!' });
      return;
    }

    bankroll.deductChips(currentHand.bet);
    sound.playChipToss();

    const recommendation = getBasicStrategyRecommendation(currentHand, dealerCards[0]);
    const isOptimal = recommendation.recommendedAction === 'P';
    const feedback: StrategyFeedback = {
      recommendedAction: recommendation.recommendedAction,
      playerAction: 'P',
      isOptimal,
      reason: recommendation.reason,
    };
    bankroll.recordTrainerDecision(isOptimal);

    const activeShoe = [...shoe];
    const cardForHand1 = { ...activeShoe.pop()!, faceUp: true };
    const cardForHand2 = { ...activeShoe.pop()!, faceUp: true };
    const newDealt = [...dealtCards, cardForHand1, cardForHand2];

    const hand1Cards = [currentHand.cards[0], cardForHand1];
    const hand2Cards = [currentHand.cards[1], cardForHand2];

    const hand1: PlayerHand = {
      id: `${currentHand.id}-1`,
      cards: hand1Cards,
      bet: currentHand.bet,
      score: calculateScore(hand1Cards),
      status: 'active',
      isSplit: true,
    };

    const hand2: PlayerHand = {
      id: `${currentHand.id}-2`,
      cards: hand2Cards,
      bet: currentHand.bet,
      score: calculateScore(hand2Cards),
      status: 'active',
      isSplit: true,
    };

    sound.playCardSlide();
    const updatedHands = [...playerHands];
    updatedHands.splice(activeHandIndex, 1, hand1, hand2);

    const counting = calculateCountingMetrics(newDealt.filter((c) => c.faceUp), TOTAL_DECKS);
    const isCutHit = activeShoe.length <= CUT_CARD_REMAINING;

    set({
      shoe: activeShoe,
      dealtCards: newDealt,
      playerHands: updatedHands,
      counting,
      lastFeedback: feedback,
      roundMessage: 'Hands Split! 🔀',
      cutCardReached: get().cutCardReached || isCutHit,
    });
  },

  nextRound: () => {
    set({
      phase: 'betting',
      dealerCards: [],
      playerHands: [],
      activeHandIndex: 0,
      lastFeedback: null,
      roundMessage: get().cutCardReached ? 'Cut card reached — Shoe will reshuffle on deal!' : null,
    });
  },
}));

function executeDealerTurn() {
  const store = useBlackjackStore.getState();
  const { shoe, dealtCards, dealerCards } = store;

  sound.playCardFlip();
  let currentDealer = dealerCards.map((c) => ({ ...c, faceUp: true }));
  let activeShoe = [...shoe];
  let newDealt = [...dealtCards];

  let dScore = calculateScore(currentDealer);

  const dealerStep = () => {
    dScore = calculateScore(currentDealer);
    const mustHit = dScore.total < 17 || (dScore.total === 17 && dScore.isSoft);

    if (mustHit && activeShoe.length > 0) {
      sound.playCardSlide();
      const nextCard = { ...activeShoe.pop()!, faceUp: true };
      currentDealer = [...currentDealer, nextCard];
      newDealt = [...newDealt, nextCard];

      useBlackjackStore.setState({
        dealerCards: currentDealer,
        shoe: activeShoe,
        dealtCards: newDealt,
        counting: calculateCountingMetrics(newDealt, TOTAL_DECKS),
      });

      setTimeout(dealerStep, 500);
    } else {
      finalizeRound(currentDealer, dScore);
    }
  };

  useBlackjackStore.setState({
    phase: 'dealer-turn',
    dealerCards: currentDealer,
    counting: calculateCountingMetrics(newDealt, TOTAL_DECKS),
  });

  setTimeout(dealerStep, 500);
}

function finalizeRound(dealerCards: Card[], dealerScore: { total: number; isBlackjack: boolean; isBust: boolean }) {
  const store = useBlackjackStore.getState();
  const bankroll = useBankrollStore.getState();
  const { playerHands, isProMode } = store;

  let totalWon = 0;
  let totalBet = 0;
  let wonCount = 0;
  let lossCount = 0;

  const settledHands = playerHands.map((hand) => {
    totalBet += hand.bet;
    if (hand.status === 'busted') {
      lossCount += 1;
      return { ...hand, result: 'loss' as const, payout: 0 };
    }

    const outcome = evaluateHandOutcome(hand, { ...dealerScore, isSoft: false });
    totalWon += outcome.payout;

    if (outcome.result === 'win' || outcome.result === 'blackjack') wonCount += 1;
    if (outcome.result === 'loss') lossCount += 1;

    return {
      ...hand,
      status: hand.status,
      result: outcome.result,
      payout: outcome.payout,
    };
  });

  if (totalWon > totalBet) {
    sound.playWinFanfare();
  } else if (totalWon === 0) {
    sound.playBust();
  } else {
    sound.playButtonClick();
  }

  const gameKey = isProMode ? 'blackjack-pro' : 'blackjack';
  bankroll.recordHand(totalWon, totalBet, gameKey);

  let message = 'Round Finished';
  if (dealerScore.isBust) {
    message = 'Dealer BUSTED! 🎉';
  } else if (wonCount > lossCount) {
    message = 'You Won! 💰';
  } else if (wonCount < lossCount) {
    message = 'Dealer Wins ♠️';
  } else {
    message = 'Push / Tied Hand 🤝';
  }

  useBlackjackStore.setState({
    phase: 'round-over',
    dealerCards,
    playerHands: settledHands,
    roundMessage: message,
    counting: calculateCountingMetrics(useBlackjackStore.getState().dealtCards, TOTAL_DECKS),
  });
}
