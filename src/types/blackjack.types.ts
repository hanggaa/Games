import { Card, HandScore } from './card.types';

export type BlackjackPhase =
  | 'betting'
  | 'dealing'
  | 'player-turn'
  | 'dealer-turn'
  | 'round-over';

export type StrategyAction = 'H' | 'S' | 'D' | 'P'; // Hit, Stand, Double, Split

export interface PlayerHand {
  id: string;
  cards: Card[];
  bet: number;
  status: 'active' | 'stood' | 'busted' | 'blackjack' | 'doubled';
  score: HandScore;
  isSplit: boolean;
  result?: 'win' | 'loss' | 'push' | 'blackjack';
  payout?: number;
}

export interface CountingMetrics {
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  cardsDealt: number;
  totalCards: number;
  penetrationPct: number;
}

export interface StrategyFeedback {
  recommendedAction: StrategyAction;
  playerAction?: StrategyAction;
  isOptimal: boolean;
  reason: string;
}
