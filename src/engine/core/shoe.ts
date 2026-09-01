import { Card, Suit, Rank } from '../../types/card.types';

export function createDeck(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      let value = parseInt(rank, 10);
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      if (rank === 'A') value = 11;
      deck.push({
        id: `${suit}-${rank}-${Math.random().toString(36).slice(2, 7)}`,
        suit,
        rank,
        value,
        faceUp: true,
      });
    }
  }
  return shuffle(deck);
}

export function createShoe(deckCount = 6): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const shoe: Card[] = [];

  for (let d = 0; d < deckCount; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        let value = parseInt(rank, 10);
        if (['J', 'Q', 'K'].includes(rank)) value = 10;
        if (rank === 'A') value = 11;
        shoe.push({
          id: `d${d}-${suit}-${rank}-${Math.random().toString(36).slice(2, 7)}`,
          suit,
          rank,
          value,
          faceUp: true,
        });
      }
    }
  }
  return shuffle(shoe);
}

export function shuffle(deck: Card[]): Card[] {
  const array = [...deck];
  for (let i = array.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
