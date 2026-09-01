export interface Joker {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  cost: number;
  description: string;
  effectType: 'add_mult' | 'add_chips' | 'suit_mult' | 'discard_chips' | 'x_mult';
  value: number;
  conditionSuit?: string;
  conditionRank?: string;
}

export interface Blind {
  name: string;
  targetScore: number;
  rewardDollars: number;
}

export type BalatroPhase = 'playing' | 'scoring' | 'round-won' | 'game-over' | 'shop';

export interface BalatroRoundScoring {
  baseChips: number;
  baseMult: number;
  cardChips: number;
  jokerChips: number;
  jokerMult: number;
  totalChips: number;
  totalMult: number;
  totalScore: number;
  handRankName: string;
}
