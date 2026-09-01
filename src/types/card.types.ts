export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // 2-10, 10 for J/Q/K, 11 for Ace (soft)
  faceUp: boolean;
}

export interface HandScore {
  total: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBust: boolean;
}
