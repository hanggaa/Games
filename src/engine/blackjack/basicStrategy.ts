import { StrategyFeedback, PlayerHand } from '../../types/blackjack.types';
import { Card } from '../../types/card.types';

export function getBasicStrategyRecommendation(
  playerHand: PlayerHand,
  dealerUpcard: Card | null
): StrategyFeedback {
  if (!dealerUpcard) {
    return { recommendedAction: 'H', isOptimal: true, reason: 'Awaiting dealer upcard' };
  }

  const upcardVal = dealerUpcard.value === 11 ? 11 : dealerUpcard.value;
  const cards = playerHand.cards;
  const total = playerHand.score.total;
  const isSoft = playerHand.score.isSoft;
  const isPair = cards.length === 2 && (cards[0].rank === cards[1].rank || cards[0].value === cards[1].value);

  // Pair Splitting (P)
  if (isPair && cards.length === 2) {
    const pairRank = cards[0].rank;
    if (pairRank === 'A' || pairRank === '8') {
      return { recommendedAction: 'P', isOptimal: true, reason: `Always split pair of ${pairRank}'s against any dealer card.` };
    }
    if (['10', 'J', 'Q', 'K'].includes(pairRank)) {
      return { recommendedAction: 'S', isOptimal: true, reason: 'Never split 10s (Total 20 is already a winning hand).' };
    }
    if (pairRank === '9') {
      if ((upcardVal >= 2 && upcardVal <= 6) || (upcardVal >= 8 && upcardVal <= 9)) {
        return { recommendedAction: 'P', isOptimal: true, reason: 'Split 9s against dealer 2-6 and 8-9 (Stand on 7, 10, A).' };
      }
      return { recommendedAction: 'S', isOptimal: true, reason: 'Stand on 9,9 against dealer 7, 10, or Ace.' };
    }
    if (pairRank === '7') {
      if (upcardVal <= 7) return { recommendedAction: 'P', isOptimal: true, reason: 'Split 7s against dealer 2 through 7.' };
      return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 7,7 against dealer 8 or higher.' };
    }
    if (pairRank === '6') {
      if (upcardVal >= 2 && upcardVal <= 6) return { recommendedAction: 'P', isOptimal: true, reason: 'Split 6s against dealer bust cards 2-6.' };
      return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 6,6 against dealer 7 or higher.' };
    }
    if (pairRank === '5') {
      if (upcardVal <= 9) return { recommendedAction: 'D', isOptimal: true, reason: 'Double 5,5 (Total 10) against dealer 2 through 9.' };
      return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 5,5 against dealer 10 or Ace.' };
    }
    if (pairRank === '4') {
      if (upcardVal === 5 || upcardVal === 6) return { recommendedAction: 'P', isOptimal: true, reason: 'Split 4s only against dealer 5 and 6.' };
      return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 4,4 against other dealer cards.' };
    }
    if (pairRank === '2' || pairRank === '3') {
      if (upcardVal <= 7) return { recommendedAction: 'P', isOptimal: true, reason: `Split ${pairRank}s against dealer 2 through 7.` };
      return { recommendedAction: 'H', isOptimal: true, reason: `Hit ${pairRank}s against dealer 8 or higher.` };
    }
  }

  // Soft Totals (A,x)
  if (isSoft) {
    if (total >= 20) return { recommendedAction: 'S', isOptimal: true, reason: `Stand on Soft ${total} (A,9+).` };
    if (total === 19) {
      if (upcardVal === 6 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: 'Double Soft 19 (A,8) vs dealer 6, otherwise Stand.' };
      return { recommendedAction: 'S', isOptimal: true, reason: 'Stand on Soft 19.' };
    }
    if (total === 18) {
      if (upcardVal >= 2 && upcardVal <= 6 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: 'Double Soft 18 vs dealer 2-6.' };
      if (upcardVal <= 8) return { recommendedAction: 'S', isOptimal: true, reason: 'Stand on Soft 18 vs dealer 7 or 8.' };
      return { recommendedAction: 'H', isOptimal: true, reason: 'Hit Soft 18 vs dealer 9, 10, or Ace.' };
    }
    if (total === 17) {
      if (upcardVal >= 3 && upcardVal <= 6 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: 'Double Soft 17 vs dealer 3-6.' };
      return { recommendedAction: 'H', isOptimal: true, reason: 'Hit Soft 17.' };
    }
    if (total === 15 || total === 16) {
      if (upcardVal >= 4 && upcardVal <= 6 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: `Double Soft ${total} vs dealer 4-6.` };
      return { recommendedAction: 'H', isOptimal: true, reason: `Hit Soft ${total}.` };
    }
    if (total === 13 || total === 14) {
      if (upcardVal >= 5 && upcardVal <= 6 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: `Double Soft ${total} vs dealer 5-6.` };
      return { recommendedAction: 'H', isOptimal: true, reason: `Hit Soft ${total}.` };
    }
  }

  // Hard Totals
  if (total >= 17) return { recommendedAction: 'S', isOptimal: true, reason: `Always Stand on Hard ${total}.` };
  if (total >= 13 && total <= 16) {
    if (upcardVal >= 2 && upcardVal <= 6) return { recommendedAction: 'S', isOptimal: true, reason: `Stand on Hard ${total} vs dealer bust cards 2-6.` };
    return { recommendedAction: 'H', isOptimal: true, reason: `Hit Hard ${total} vs dealer strong card ${upcardVal === 11 ? 'A' : upcardVal}.` };
  }
  if (total === 12) {
    if (upcardVal >= 4 && upcardVal <= 6) return { recommendedAction: 'S', isOptimal: true, reason: 'Stand on 12 vs dealer 4, 5, 6.' };
    return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 12 vs dealer 2, 3 or 7+.' };
  }
  if (total === 11) {
    if (cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: 'Always Double on 11.' };
    return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 11.' };
  }
  if (total === 10) {
    if (upcardVal <= 9 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: 'Double 10 vs dealer 2 through 9.' };
    return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 10 vs dealer 10 or Ace.' };
  }
  if (total === 9) {
    if (upcardVal >= 3 && upcardVal <= 6 && cards.length === 2) return { recommendedAction: 'D', isOptimal: true, reason: 'Double 9 vs dealer 3 through 6.' };
    return { recommendedAction: 'H', isOptimal: true, reason: 'Hit 9.' };
  }

  return { recommendedAction: 'H', isOptimal: true, reason: `Always Hit on Hard ${total}.` };
}
