import { Card } from '../../types/card.types';
import { PokerEvaluationResult } from '../../types/poker.types';

function getRankNumeric(rank: string): number {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank, 10);
}

export function evaluate5CardPoker(cards: Card[], coinsBet = 1): PokerEvaluationResult {
  if (cards.length !== 5) {
    return { rank: 'HIGH_CARD', payoutMultiplier: 0, displayName: 'No Win', winningCardIndices: [] };
  }

  const rankValues = cards.map((c) => getRankNumeric(c.rank)).sort((a, b) => a - b);
  const suitCounts: Record<string, number> = {};
  const rankCounts: Record<number, number> = {};

  cards.forEach((c) => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    const num = getRankNumeric(c.rank);
    rankCounts[num] = (rankCounts[num] || 0) + 1;
  });

  const isFlush = Object.values(suitCounts).some((count) => count === 5);

  let isStraight = false;
  let isRoyal = false;

  if (new Set(rankValues).size === 5) {
    const isStandardStraight = rankValues[4] - rankValues[0] === 4;
    const isWheelStraight =
      rankValues[0] === 2 &&
      rankValues[1] === 3 &&
      rankValues[2] === 4 &&
      rankValues[3] === 5 &&
      rankValues[4] === 14;

    isStraight = isStandardStraight || isWheelStraight;
    isRoyal = isFlush && isStraight && rankValues[0] === 10 && rankValues[4] === 14;
  }

  const countEntries = Object.entries(rankCounts).map(([r, count]) => ({ rank: Number(r), count }));
  countEntries.sort((a, b) => b.count - a.count || b.rank - a.rank);

  if (isRoyal) {
    const mult = coinsBet === 5 ? 800 : 250;
    return { rank: 'ROYAL_FLUSH', payoutMultiplier: mult, displayName: 'Royal Flush! 👑', winningCardIndices: [0, 1, 2, 3, 4] };
  }
  if (isStraight && isFlush) {
    return { rank: 'STRAIGHT_FLUSH', payoutMultiplier: 50, displayName: 'Straight Flush 🔥', winningCardIndices: [0, 1, 2, 3, 4] };
  }
  if (countEntries[0].count === 4) {
    const targetRank = countEntries[0].rank;
    const indices = cards.map((c, i) => (getRankNumeric(c.rank) === targetRank ? i : -1)).filter((i) => i !== -1);
    return { rank: 'FOUR_OF_A_KIND', payoutMultiplier: 25, displayName: 'Four of a Kind 💎', winningCardIndices: indices };
  }
  if (countEntries[0].count === 3 && countEntries[1].count === 2) {
    return { rank: 'FULL_HOUSE', payoutMultiplier: 9, displayName: 'Full House 🏠', winningCardIndices: [0, 1, 2, 3, 4] };
  }
  if (isFlush) {
    return { rank: 'FLUSH', payoutMultiplier: 6, displayName: 'Flush 🌊', winningCardIndices: [0, 1, 2, 3, 4] };
  }
  if (isStraight) {
    return { rank: 'STRAIGHT', payoutMultiplier: 4, displayName: 'Straight ⚡', winningCardIndices: [0, 1, 2, 3, 4] };
  }
  if (countEntries[0].count === 3) {
    const targetRank = countEntries[0].rank;
    const indices = cards.map((c, i) => (getRankNumeric(c.rank) === targetRank ? i : -1)).filter((i) => i !== -1);
    return { rank: 'THREE_OF_A_KIND', payoutMultiplier: 3, displayName: 'Three of a Kind 🎯', winningCardIndices: indices };
  }
  if (countEntries[0].count === 2 && countEntries[1].count === 2) {
    const pairRanks = [countEntries[0].rank, countEntries[1].rank];
    const indices = cards.map((c, i) => (pairRanks.includes(getRankNumeric(c.rank)) ? i : -1)).filter((i) => i !== -1);
    return { rank: 'TWO_PAIR', payoutMultiplier: 2, displayName: 'Two Pair ✌️', winningCardIndices: indices };
  }
  if (countEntries[0].count === 2) {
    const pairRank = countEntries[0].rank;
    if (pairRank >= 11) {
      // Jacks or better
      const indices = cards.map((c, i) => (getRankNumeric(c.rank) === pairRank ? i : -1)).filter((i) => i !== -1);
      return { rank: 'JACKS_OR_BETTER', payoutMultiplier: 1, displayName: 'Jacks or Better 🃏', winningCardIndices: indices };
    }
  }

  return { rank: 'HIGH_CARD', payoutMultiplier: 0, displayName: 'No Win', winningCardIndices: [] };
}
