import { Card } from '../../types/card.types';
import { Joker, Blind, BalatroRoundScoring } from '../../types/balatro.types';
import { evaluate5Cards } from '../poker/holdemEvaluator';

export const BASE_HAND_SCORING: Record<string, { chips: number; mult: number }> = {
  ROYAL_FLUSH: { chips: 100, mult: 10 },
  STRAIGHT_FLUSH: { chips: 100, mult: 8 },
  FOUR_OF_A_KIND: { chips: 60, mult: 7 },
  FULL_HOUSE: { chips: 40, mult: 4 },
  FLUSH: { chips: 35, mult: 4 },
  STRAIGHT: { chips: 30, mult: 4 },
  THREE_OF_A_KIND: { chips: 30, mult: 3 },
  TWO_PAIR: { chips: 20, mult: 2 },
  ONE_PAIR: { chips: 10, mult: 2 },
  HIGH_CARD: { chips: 5, mult: 1 },
};

export const JOKER_CATALOG: Joker[] = [
  {
    id: 'joker-basic',
    name: 'Joker',
    rarity: 'common',
    cost: 4,
    description: '+4 Mult',
    effectType: 'add_mult',
    value: 4,
  },
  {
    id: 'joker-sly',
    name: 'Sly Joker',
    rarity: 'common',
    cost: 4,
    description: '+50 Chips if hand contains a Pair',
    effectType: 'add_chips',
    value: 50,
  },
  {
    id: 'joker-greedy',
    name: 'Greedy Joker',
    rarity: 'common',
    cost: 5,
    description: 'Played Diamond cards give +4 Mult',
    effectType: 'suit_mult',
    conditionSuit: 'diamonds',
    value: 4,
  },
  {
    id: 'joker-lusty',
    name: 'Lusty Joker',
    rarity: 'common',
    cost: 5,
    description: 'Played Heart cards give +4 Mult',
    effectType: 'suit_mult',
    conditionSuit: 'hearts',
    value: 4,
  },
  {
    id: 'joker-wrathful',
    name: 'Wrathful Joker',
    rarity: 'common',
    cost: 5,
    description: 'Played Spade cards give +4 Mult',
    effectType: 'suit_mult',
    conditionSuit: 'spades',
    value: 4,
  },
  {
    id: 'joker-gluttonous',
    name: 'Gluttonous Joker',
    rarity: 'common',
    cost: 5,
    description: 'Played Club cards give +4 Mult',
    effectType: 'suit_mult',
    conditionSuit: 'clubs',
    value: 4,
  },
  {
    id: 'joker-banner',
    name: 'Banner',
    rarity: 'uncommon',
    cost: 6,
    description: '+30 Chips for each remaining Discard',
    effectType: 'discard_chips',
    value: 30,
  },
  {
    id: 'joker-popcorn',
    name: 'Popcorn',
    rarity: 'uncommon',
    cost: 6,
    description: '+15 Mult',
    effectType: 'add_mult',
    value: 15,
  },
  {
    id: 'joker-cavendish',
    name: 'Cavendish',
    rarity: 'rare',
    cost: 8,
    description: 'X3 Mult to final score',
    effectType: 'x_mult',
    value: 3,
  },
];

export function getBlindForAnte(ante: number, blindType: 'small' | 'big' | 'boss'): Blind {
  const baseAnteScore = [0, 300, 800, 2000, 5000, 11000, 20000, 35000, 60000][ante] || ante * 25000;
  if (blindType === 'small') {
    return { name: `Ante ${ante} — Small Blind`, targetScore: baseAnteScore, rewardDollars: 3 + ante };
  } else if (blindType === 'big') {
    return { name: `Ante ${ante} — Big Blind`, targetScore: Math.round(baseAnteScore * 1.5), rewardDollars: 4 + ante };
  } else {
    return { name: `Ante ${ante} — Boss Blind`, targetScore: baseAnteScore * 2, rewardDollars: 6 + ante };
  }
}

export function calculateBalatroHandScore(
  playedCards: Card[],
  equippedJokers: Joker[],
  discardsLeft: number
): BalatroRoundScoring {
  const evaluated = evaluate5Cards(playedCards);
  const base = BASE_HAND_SCORING[evaluated.rank] || BASE_HAND_SCORING.HIGH_CARD;

  let baseChips = base.chips;
  let baseMult = base.mult;

  // 1. Add chips from each played card's rank value
  let cardChips = 0;
  for (const card of playedCards) {
    if (card.rank === 'A') cardChips += 11;
    else if (['K', 'Q', 'J', '10'].includes(card.rank)) cardChips += 10;
    else cardChips += parseInt(card.rank, 10);
  }

  // 2. Add Joker modifiers
  let jokerChips = 0;
  let jokerMult = 0;
  let xMult = 1;

  for (const joker of equippedJokers) {
    if (joker.effectType === 'add_mult') {
      jokerMult += joker.value;
    } else if (joker.effectType === 'add_chips') {
      if (evaluated.rank !== 'HIGH_CARD') {
        jokerChips += joker.value;
      }
    } else if (joker.effectType === 'suit_mult') {
      const matchSuitCount = playedCards.filter((c) => c.suit === joker.conditionSuit).length;
      jokerMult += matchSuitCount * joker.value;
    } else if (joker.effectType === 'discard_chips') {
      jokerChips += discardsLeft * joker.value;
    } else if (joker.effectType === 'x_mult') {
      xMult *= joker.value;
    }
  }

  const totalChips = baseChips + cardChips + jokerChips;
  const totalMult = Math.round((baseMult + jokerMult) * xMult);
  const totalScore = totalChips * totalMult;

  return {
    baseChips,
    baseMult,
    cardChips,
    jokerChips,
    jokerMult,
    totalChips,
    totalMult,
    totalScore,
    handRankName: evaluated.displayName,
  };
}
