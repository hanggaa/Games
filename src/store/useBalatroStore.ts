import { create } from 'zustand';
import { Card } from '../types/card.types';
import { Joker, Blind, BalatroPhase, BalatroRoundScoring } from '../types/balatro.types';
import { createDeck } from '../engine/core/shoe';
import {
  getBlindForAnte,
  calculateBalatroHandScore,
  JOKER_CATALOG,
} from '../engine/balatro/balatroEngine';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

const HAND_SIZE = 8;
const MAX_JOKERS = 5;

interface BalatroState {
  phase: BalatroPhase;
  ante: number;
  blindType: 'small' | 'big' | 'boss';
  currentBlind: Blind;
  roundScore: number;
  runCash: number;
  handsLeft: number;
  discardsLeft: number;
  deck: Card[];
  handCards: Card[];
  selectedCardIds: string[];
  jokers: Joker[];
  shopJokers: Joker[];
  lastScoreBreakdown: BalatroRoundScoring | null;

  // Actions
  startNewRun: () => void;
  toggleSelectCard: (cardId: string) => void;
  playHand: () => void;
  discardSelected: () => void;
  goToNextBlind: () => void;
  buyJoker: (joker: Joker) => void;
  sellJoker: (jokerId: string) => void;
  rerollShop: () => void;
}

export const useBalatroStore = create<BalatroState>()((set, get) => ({
  phase: 'playing',
  ante: 1,
  blindType: 'small',
  currentBlind: getBlindForAnte(1, 'small'),
  roundScore: 0,
  runCash: 4,
  handsLeft: 4,
  discardsLeft: 3,
  deck: createDeck(),
  handCards: [],
  selectedCardIds: [],
  jokers: [JOKER_CATALOG[0]], // start with basic Joker (+4 mult)
  shopJokers: [],
  lastScoreBreakdown: null,

  startNewRun: () => {
    sound.playShuffle();
    const newDeck = createDeck();
    const initialHand = newDeck.splice(0, HAND_SIZE);

    set({
      phase: 'playing',
      ante: 1,
      blindType: 'small',
      currentBlind: getBlindForAnte(1, 'small'),
      roundScore: 0,
      runCash: 4,
      handsLeft: 4,
      discardsLeft: 3,
      deck: newDeck,
      handCards: initialHand,
      selectedCardIds: [],
      jokers: [JOKER_CATALOG[0]],
      shopJokers: [],
      lastScoreBreakdown: null,
    });
  },

  toggleSelectCard: (cardId: string) => {
    const { selectedCardIds, phase } = get();
    if (phase !== 'playing') return;

    sound.playButtonClick();
    if (selectedCardIds.includes(cardId)) {
      set({ selectedCardIds: selectedCardIds.filter((id) => id !== cardId) });
    } else {
      if (selectedCardIds.length < 5) {
        set({ selectedCardIds: [...selectedCardIds, cardId] });
      }
    }
  },

  playHand: () => {
    const {
      handCards,
      selectedCardIds,
      jokers,
      discardsLeft,
      handsLeft,
      roundScore,
      currentBlind,
      deck,
      runCash,
    } = get();

    if (selectedCardIds.length === 0 || handsLeft <= 0) return;

    const playedCards = handCards.filter((c) => selectedCardIds.includes(c.id));
    const breakdown = calculateBalatroHandScore(playedCards, jokers, discardsLeft);

    sound.playWinFanfare();
    const newRoundScore = roundScore + breakdown.totalScore;
    const remainingHandCards = handCards.filter((c) => !selectedCardIds.includes(c.id));

    // Draw replacements up to HAND_SIZE
    const needed = HAND_SIZE - remainingHandCards.length;
    const activeDeck = [...deck];
    const drawn = activeDeck.splice(0, needed);
    const newHand = [...remainingHandCards, ...drawn];
    const newHandsLeft = handsLeft - 1;

    // Check if won
    if (newRoundScore >= currentBlind.targetScore) {
      sound.playWinFanfare();
      const earned = currentBlind.rewardDollars + (discardsLeft > 0 ? discardsLeft : 0);
      useBankrollStore.getState().addChips(earned * 10);

      // Generate random shop
      const shopChoices = [...JOKER_CATALOG].sort(() => Math.random() - 0.5).slice(0, 3);

      set({
        phase: 'shop',
        roundScore: newRoundScore,
        runCash: runCash + earned,
        handsLeft: newHandsLeft,
        deck: activeDeck,
        handCards: newHand,
        selectedCardIds: [],
        lastScoreBreakdown: breakdown,
        shopJokers: shopChoices,
      });
    } else if (newHandsLeft <= 0) {
      // Game Over
      sound.playBust();
      set({
        phase: 'game-over',
        roundScore: newRoundScore,
        handsLeft: 0,
        lastScoreBreakdown: breakdown,
        selectedCardIds: [],
      });
    } else {
      set({
        roundScore: newRoundScore,
        handsLeft: newHandsLeft,
        deck: activeDeck,
        handCards: newHand,
        selectedCardIds: [],
        lastScoreBreakdown: breakdown,
      });
    }
  },

  discardSelected: () => {
    const { handCards, selectedCardIds, discardsLeft, deck, phase } = get();
    if (phase !== 'playing' || discardsLeft <= 0 || selectedCardIds.length === 0) return;

    sound.playCardSlide();
    const remainingHandCards = handCards.filter((c) => !selectedCardIds.includes(c.id));
    const needed = HAND_SIZE - remainingHandCards.length;
    const activeDeck = [...deck];
    const drawn = activeDeck.splice(0, needed);
    const newHand = [...remainingHandCards, ...drawn];

    set({
      discardsLeft: discardsLeft - 1,
      deck: activeDeck,
      handCards: newHand,
      selectedCardIds: [],
    });
  },

  goToNextBlind: () => {
    const { ante, blindType, jokers } = get();
    sound.playShuffle();

    let nextAnte = ante;
    let nextType: 'small' | 'big' | 'boss' = 'small';

    if (blindType === 'small') nextType = 'big';
    else if (blindType === 'big') nextType = 'boss';
    else {
      nextType = 'small';
      nextAnte = ante + 1;
    }

    const newDeck = createDeck();
    const initialHand = newDeck.splice(0, HAND_SIZE);
    const nextBlind = getBlindForAnte(nextAnte, nextType);

    set({
      phase: 'playing',
      ante: nextAnte,
      blindType: nextType,
      currentBlind: nextBlind,
      roundScore: 0,
      handsLeft: 4,
      discardsLeft: 3,
      deck: newDeck,
      handCards: initialHand,
      selectedCardIds: [],
      jokers,
      lastScoreBreakdown: null,
    });
  },

  buyJoker: (joker: Joker) => {
    const { runCash, jokers, shopJokers } = get();
    if (runCash < joker.cost || jokers.length >= MAX_JOKERS) {
      sound.playBust();
      return;
    }

    sound.playChipToss();
    set({
      runCash: runCash - joker.cost,
      jokers: [...jokers, joker],
      shopJokers: shopJokers.filter((j) => j.id !== joker.id),
    });
  },

  sellJoker: (jokerId: string) => {
    const { jokers, runCash } = get();
    const joker = jokers.find((j) => j.id === jokerId);
    if (!joker) return;

    sound.playChipToss();
    const sellValue = Math.max(1, Math.floor(joker.cost / 2));
    set({
      runCash: runCash + sellValue,
      jokers: jokers.filter((j) => j.id !== jokerId),
    });
  },

  rerollShop: () => {
    const { runCash } = get();
    if (runCash < 5) {
      sound.playBust();
      return;
    }

    sound.playButtonClick();
    const shopChoices = [...JOKER_CATALOG].sort(() => Math.random() - 0.5).slice(0, 3);
    set({
      runCash: runCash - 5,
      shopJokers: shopChoices,
    });
  },
}));
