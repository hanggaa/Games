import { Card } from '../../types/card.types';
import { PokerPlayer, HoldemPhase } from '../../types/poker.types';
import { evaluate7CardHand } from './holdemEvaluator';

export function getBotDecision(
  bot: PokerPlayer,
  phase: HoldemPhase,
  communityCards: Card[],
  currentCallAmount: number, // amount bot needs to pay to match highest bet
  minRaiseAmount: number,
  potSize: number
): { action: 'fold' | 'check' | 'call' | 'raise'; amount?: number; label: string } {
  const callCost = currentCallAmount;
  const personality = bot.personality || 'balanced';

  // If check is free
  const canCheck = callCost === 0;

  // Preflop Heuristics
  if (phase === 'preflop') {
    const card1 = bot.cards[0];
    const card2 = bot.cards[1];
    if (!card1 || !card2) return { action: 'fold', label: 'Fold' };

    const val1 = getRankNum(card1.rank);
    const val2 = getRankNum(card2.rank);
    const isPair = val1 === val2;
    const isSuited = card1.suit === card2.suit;
    const maxVal = Math.max(val1, val2);
    const minVal = Math.min(val1, val2);
    const isHighCards = maxVal >= 11 && minVal >= 10; // AK, AQ, AJ, KQ, etc.

    // Premium hands: High Pairs (AA, KK, QQ, JJ, 10-10) or AK suited
    if ((isPair && val1 >= 10) || (maxVal === 14 && minVal === 13 && isSuited)) {
      if (personality === 'aggressive' || Math.random() > 0.3) {
        const raiseAmount = Math.min(bot.chips, minRaiseAmount * 2);
        return { action: 'raise', amount: raiseAmount, label: `Raise to $${raiseAmount}` };
      }
      return { action: 'call', label: `Call $${callCost}` };
    }

    // Medium hands: Mid pairs, suited connectors, high cards
    if (isPair || isHighCards || (isSuited && maxVal >= 10) || (maxVal - minVal <= 2 && isSuited)) {
      if (callCost <= bot.chips * 0.2) {
        if (canCheck) return { action: 'check', label: 'Check' };
        return { action: 'call', label: `Call $${callCost}` };
      }
      if (personality === 'tight') return { action: 'fold', label: 'Fold' };
      return { action: 'call', label: `Call $${callCost}` };
    }

    // Weak hands
    if (canCheck) return { action: 'check', label: 'Check' };
    if (callCost <= 10 && bot.chips > 100) return { action: 'call', label: `Call $${callCost}` };
    return { action: 'fold', label: 'Fold' };
  }

  // Postflop / Turn / River Evaluation
  const allCards = [...bot.cards, ...communityCards];
  const evalHand = evaluate7CardHand(allCards);

  // Hand rank strength threshold (0 to 90M)
  const strength = evalHand.score;

  // Very strong hands (Full house, Flush, Straight, Trips+)
  if (strength >= 30000000) {
    if (personality === 'aggressive' || Math.random() > 0.4) {
      const raiseAmt = Math.min(bot.chips, Math.max(minRaiseAmount, Math.round(potSize * 0.6)));
      return { action: 'raise', amount: raiseAmt, label: `Raise $${raiseAmt}` };
    }
    return canCheck ? { action: 'check', label: 'Check' } : { action: 'call', label: `Call $${callCost}` };
  }

  // Decent hands (Two Pair, One Pair)
  if (strength >= 10000000) {
    if (canCheck) {
      if (personality === 'aggressive' && Math.random() > 0.5) {
        const raiseAmt = Math.min(bot.chips, minRaiseAmount);
        return { action: 'raise', amount: raiseAmt, label: `Bet $${raiseAmt}` };
      }
      return { action: 'check', label: 'Check' };
    }
    // If call cost is modest compared to pot
    if (callCost <= potSize * 0.5 || callCost <= bot.chips * 0.15) {
      return { action: 'call', label: `Call $${callCost}` };
    }
    if (personality === 'tight') return { action: 'fold', label: 'Fold' };
    return Math.random() > 0.4 ? { action: 'call', label: `Call $${callCost}` } : { action: 'fold', label: 'Fold' };
  }

  // Weak / High card
  if (canCheck) return { action: 'check', label: 'Check' };
  if (callCost <= 10 && Math.random() > 0.5) return { action: 'call', label: `Call $${callCost}` };
  return { action: 'fold', label: 'Fold' };
}

function getRankNum(rank: string): number {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank, 10);
}
