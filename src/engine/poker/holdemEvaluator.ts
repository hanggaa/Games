import { Card } from '../../types/card.types';
import { EvaluatedPokerHand, PokerHandRank } from '../../types/poker.types';

function getRankNumeric(rank: string): number {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank, 10);
}

const RANK_BASE_SCORE: Record<PokerHandRank, number> = {
  ROYAL_FLUSH: 90000000,
  STRAIGHT_FLUSH: 80000000,
  FOUR_OF_A_KIND: 70000000,
  FULL_HOUSE: 60000000,
  FLUSH: 50000000,
  STRAIGHT: 40000000,
  THREE_OF_A_KIND: 30000000,
  TWO_PAIR: 20000000,
  ONE_PAIR: 10000000,
  HIGH_CARD: 0,
};

export function evaluate5Cards(cards: Card[]): EvaluatedPokerHand {
  if (cards.length !== 5) {
    return {
      rank: 'HIGH_CARD',
      score: 0,
      displayName: 'High Card',
      bestFiveCards: cards,
    };
  }

  const sortedCards = [...cards].sort((a, b) => getRankNumeric(b.rank) - getRankNumeric(a.rank));
  const rankValues = sortedCards.map((c) => getRankNumeric(c.rank));

  const suitCounts: Record<string, number> = {};
  const rankCounts: Record<number, number> = {};

  sortedCards.forEach((c) => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    const num = getRankNumeric(c.rank);
    rankCounts[num] = (rankCounts[num] || 0) + 1;
  });

  const isFlush = Object.values(suitCounts).some((count) => count === 5);

  let isStraight = false;
  let straightHigh = 0;

  // Check unique ranks for straight
  const uniqueRanks = Array.from(new Set(rankValues)).sort((a, b) => b - a);
  if (uniqueRanks.length === 5) {
    if (uniqueRanks[0] - uniqueRanks[4] === 4) {
      isStraight = true;
      straightHigh = uniqueRanks[0];
    } else if (
      uniqueRanks[0] === 14 &&
      uniqueRanks[1] === 5 &&
      uniqueRanks[2] === 4 &&
      uniqueRanks[3] === 3 &&
      uniqueRanks[4] === 2
    ) {
      // 5-high straight (wheel)
      isStraight = true;
      straightHigh = 5;
    }
  }

  const countEntries = Object.entries(rankCounts).map(([r, count]) => ({
    rank: Number(r),
    count,
  }));
  countEntries.sort((a, b) => b.count - a.count || b.rank - a.rank);

  // 1. Royal Flush & Straight Flush
  if (isStraight && isFlush) {
    if (straightHigh === 14) {
      return {
        rank: 'ROYAL_FLUSH',
        score: RANK_BASE_SCORE.ROYAL_FLUSH,
        displayName: 'Royal Flush 👑',
        bestFiveCards: sortedCards,
      };
    }
    return {
      rank: 'STRAIGHT_FLUSH',
      score: RANK_BASE_SCORE.STRAIGHT_FLUSH + straightHigh,
      displayName: `Straight Flush (${straightHigh} High) 🔥`,
      bestFiveCards: sortedCards,
    };
  }

  // 2. Four of a Kind
  if (countEntries[0].count === 4) {
    const quadRank = countEntries[0].rank;
    const kicker = countEntries[1].rank;
    return {
      rank: 'FOUR_OF_A_KIND',
      score: RANK_BASE_SCORE.FOUR_OF_A_KIND + quadRank * 100 + kicker,
      displayName: `Four of a Kind (${quadRank}s) 💎`,
      bestFiveCards: sortedCards,
    };
  }

  // 3. Full House
  if (countEntries[0].count === 3 && countEntries[1].count === 2) {
    const tripRank = countEntries[0].rank;
    const pairRank = countEntries[1].rank;
    return {
      rank: 'FULL_HOUSE',
      score: RANK_BASE_SCORE.FULL_HOUSE + tripRank * 100 + pairRank,
      displayName: `Full House (${tripRank}s full of ${pairRank}s) 🏠`,
      bestFiveCards: sortedCards,
    };
  }

  // 4. Flush
  if (isFlush) {
    const kickerScore =
      rankValues[0] * 10000 +
      rankValues[1] * 1000 +
      rankValues[2] * 100 +
      rankValues[3] * 10 +
      rankValues[4];
    return {
      rank: 'FLUSH',
      score: RANK_BASE_SCORE.FLUSH + kickerScore,
      displayName: `Flush (${rankValues[0]} High) 🌊`,
      bestFiveCards: sortedCards,
    };
  }

  // 5. Straight
  if (isStraight) {
    return {
      rank: 'STRAIGHT',
      score: RANK_BASE_SCORE.STRAIGHT + straightHigh,
      displayName: `Straight (${straightHigh} High) ⚡`,
      bestFiveCards: sortedCards,
    };
  }

  // 6. Three of a Kind
  if (countEntries[0].count === 3) {
    const tripRank = countEntries[0].rank;
    const k1 = countEntries[1].rank;
    const k2 = countEntries[2].rank;
    return {
      rank: 'THREE_OF_A_KIND',
      score: RANK_BASE_SCORE.THREE_OF_A_KIND + tripRank * 1000 + k1 * 10 + k2,
      displayName: `Three of a Kind (${tripRank}s) 🎯`,
      bestFiveCards: sortedCards,
    };
  }

  // 7. Two Pair
  if (countEntries[0].count === 2 && countEntries[1].count === 2) {
    const highPair = Math.max(countEntries[0].rank, countEntries[1].rank);
    const lowPair = Math.min(countEntries[0].rank, countEntries[1].rank);
    const kicker = countEntries[2].rank;
    return {
      rank: 'TWO_PAIR',
      score: RANK_BASE_SCORE.TWO_PAIR + highPair * 1000 + lowPair * 100 + kicker,
      displayName: `Two Pair (${highPair}s and ${lowPair}s) ✌️`,
      bestFiveCards: sortedCards,
    };
  }

  // 8. One Pair
  if (countEntries[0].count === 2) {
    const pairRank = countEntries[0].rank;
    const k1 = countEntries[1].rank;
    const k2 = countEntries[2].rank;
    const k3 = countEntries[3].rank;
    return {
      rank: 'ONE_PAIR',
      score: RANK_BASE_SCORE.ONE_PAIR + pairRank * 10000 + k1 * 100 + k2 * 10 + k3,
      displayName: `Pair of ${pairRank === 14 ? 'Aces' : pairRank === 13 ? 'Kings' : pairRank === 12 ? 'Queens' : pairRank === 11 ? 'Jacks' : pairRank + 's'} 🃏`,
      bestFiveCards: sortedCards,
    };
  }

  // 9. High Card
  const kickerScore =
    rankValues[0] * 10000 +
    rankValues[1] * 1000 +
    rankValues[2] * 100 +
    rankValues[3] * 10 +
    rankValues[4];
  return {
    rank: 'HIGH_CARD',
    score: RANK_BASE_SCORE.HIGH_CARD + kickerScore,
    displayName: `High Card (${rankValues[0] === 14 ? 'Ace' : rankValues[0] === 13 ? 'King' : rankValues[0]})`,
    bestFiveCards: sortedCards,
  };
}

// Generate all combinations of k elements from array
function getCombinations<T>(array: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (array.length === 0) return [];
  const head = array[0];
  const tail = array.slice(1);
  const withHead = getCombinations(tail, k - 1).map((combo) => [head, ...combo]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

export function evaluate7CardHand(cards: Card[]): EvaluatedPokerHand {
  if (cards.length < 5) {
    return evaluate5Cards(cards);
  }

  const combinations = getCombinations(cards, 5);
  let bestHand: EvaluatedPokerHand | null = null;

  for (const combo of combinations) {
    const currentHand = evaluate5Cards(combo);
    if (!bestHand || currentHand.score > bestHand.score) {
      bestHand = currentHand;
    }
  }

  return bestHand || evaluate5Cards(cards.slice(0, 5));
}
