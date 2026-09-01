import { Card } from '../../types/card.types';
import { CountingMetrics } from '../../types/blackjack.types';

export function getHiLoValue(card: Card): number {
  if (!card.faceUp) return 0;
  if (['2', '3', '4', '5', '6'].includes(card.rank)) return +1;
  if (['7', '8', '9'].includes(card.rank)) return 0;
  return -1; // 10, J, Q, K, A
}

export function calculateCountingMetrics(
  dealtCards: Card[],
  totalDecks = 6
): CountingMetrics {
  let runningCount = 0;
  for (const card of dealtCards) {
    runningCount += getHiLoValue(card);
  }

  const totalCards = totalDecks * 52;
  const cardsDealtCount = dealtCards.length;
  const cardsRemaining = Math.max(1, totalCards - cardsDealtCount);
  const decksRemaining = Math.max(0.5, Math.round((cardsRemaining / 52) * 10) / 10);
  const rawTrueCount = runningCount / decksRemaining;
  const trueCount = Math.round(rawTrueCount * 10) / 10;
  const penetrationPct = Math.min(100, Math.round((cardsDealtCount / totalCards) * 100));

  return {
    runningCount,
    trueCount,
    decksRemaining,
    cardsDealt: cardsDealtCount,
    totalCards,
    penetrationPct,
  };
}
