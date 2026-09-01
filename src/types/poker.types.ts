import { Card } from './card.types';

export type PokerHandRank =
  | 'ROYAL_FLUSH'
  | 'STRAIGHT_FLUSH'
  | 'FOUR_OF_A_KIND'
  | 'FULL_HOUSE'
  | 'FLUSH'
  | 'STRAIGHT'
  | 'THREE_OF_A_KIND'
  | 'TWO_PAIR'
  | 'ONE_PAIR'
  | 'HIGH_CARD';

export interface EvaluatedPokerHand {
  rank: PokerHandRank;
  score: number; // Numeric score for precise tie-breaking
  displayName: string;
  bestFiveCards: Card[];
}

export type BotPersonality = 'aggressive' | 'tight' | 'balanced';

export interface PokerPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  chips: number;
  currentBet: number;
  totalBetThisRound: number;
  cards: Card[];
  status: 'active' | 'folded' | 'all-in';
  lastAction?: string;
  personality?: BotPersonality;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
}

export type HoldemPhase =
  | 'betting'      // Waiting to start hand / configure blinds
  | 'preflop'      // 2 cards dealt to each player
  | 'flop'         // 3 community cards dealt
  | 'turn'         // 4th community card dealt
  | 'river'        // 5th community card dealt
  | 'showdown'     // Comparing cards and awarding pot
  | 'hand-ended';  // Hand finished, ready for next hand

export interface PotState {
  mainPot: number;
  winners: { playerId: string; amount: number; handName: string }[];
}
