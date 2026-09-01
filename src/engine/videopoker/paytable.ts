import { PaytableRow } from '../../types/poker.types';

export const JACKS_OR_BETTER_PAYTABLE: PaytableRow[] = [
  { rank: 'ROYAL_FLUSH', name: 'Royal Flush', multipliers: [250, 500, 750, 1000, 4000] },
  { rank: 'STRAIGHT_FLUSH', name: 'Straight Flush', multipliers: [50, 100, 150, 200, 250] },
  { rank: 'FOUR_OF_A_KIND', name: 'Four of a Kind', multipliers: [25, 50, 75, 100, 125] },
  { rank: 'FULL_HOUSE', name: 'Full House', multipliers: [9, 18, 27, 36, 45] },
  { rank: 'FLUSH', name: 'Flush', multipliers: [6, 12, 18, 24, 30] },
  { rank: 'STRAIGHT', name: 'Straight', multipliers: [4, 8, 12, 16, 20] },
  { rank: 'THREE_OF_A_KIND', name: 'Three of a Kind', multipliers: [3, 6, 9, 12, 15] },
  { rank: 'TWO_PAIR', name: 'Two Pair', multipliers: [2, 4, 6, 8, 10] },
  { rank: 'JACKS_OR_BETTER', name: 'Jacks or Better', multipliers: [1, 2, 3, 4, 5] },
];
