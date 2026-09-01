import { Card, HandScore } from '../../types/card.types';
import { PlayerHand } from '../../types/blackjack.types';

export function calculateScore(cards: Card[]): HandScore {
  const visibleCards = cards.filter((c) => c.faceUp);
  if (visibleCards.length === 0) {
    return { total: 0, isSoft: false, isBlackjack: false, isBust: false };
  }

  let total = 0;
  let aceCount = 0;

  for (const card of visibleCards) {
    if (card.rank === 'A') {
      aceCount += 1;
      total += 11;
    } else {
      total += card.value;
    }
  }

  let isSoft = false;
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  if (aceCount > 0 && total <= 21) {
    isSoft = true;
  }

  const isBlackjack = visibleCards.length === 2 && total === 21;
  const isBust = total > 21;

  return { total, isSoft, isBlackjack, isBust };
}

export function canSplit(hand: PlayerHand): boolean {
  if (hand.cards.length !== 2) return false;
  const rank1 = hand.cards[0].rank;
  const rank2 = hand.cards[1].rank;
  const val1 = hand.cards[0].value;
  const val2 = hand.cards[1].value;
  return rank1 === rank2 || val1 === val2;
}

export function canDouble(hand: PlayerHand): boolean {
  return hand.cards.length === 2 && hand.status === 'active';
}

export function evaluateHandOutcome(
  playerHand: PlayerHand,
  dealerScore: HandScore
): { result: 'win' | 'loss' | 'push' | 'blackjack'; payout: number } {
  const pScore = playerHand.score;
  const bet = playerHand.bet;

  // Player Busted
  if (pScore.isBust) {
    return { result: 'loss', payout: 0 };
  }

  // Player Blackjack (Natural)
  if (pScore.isBlackjack && !playerHand.isSplit) {
    if (dealerScore.isBlackjack) {
      return { result: 'push', payout: bet }; // Push returns original bet
    }
    // 3:2 payout = bet + 1.5 * bet
    return { result: 'blackjack', payout: bet + bet * 1.5 };
  }

  // Dealer Blackjack
  if (dealerScore.isBlackjack) {
    return { result: 'loss', payout: 0 };
  }

  // Dealer Busted
  if (dealerScore.isBust) {
    return { result: 'win', payout: bet * 2 };
  }

  // Numerical comparison
  if (pScore.total > dealerScore.total) {
    return { result: 'win', payout: bet * 2 };
  } else if (pScore.total < dealerScore.total) {
    return { result: 'loss', payout: 0 };
  } else {
    return { result: 'push', payout: bet };
  }
}
