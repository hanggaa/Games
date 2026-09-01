import { create } from 'zustand';
import { Card } from '../types/card.types';
import { PokerPlayer, HoldemPhase, EvaluatedPokerHand } from '../types/poker.types';
import { createDeck } from '../engine/core/shoe';
import { evaluate7CardHand } from '../engine/poker/holdemEvaluator';
import { getBotDecision } from '../engine/poker/botAI';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

interface PokerHoldemState {
  phase: HoldemPhase;
  deck: Card[];
  communityCards: Card[];
  players: PokerPlayer[];
  activePlayerIndex: number;
  dealerButtonIndex: number;
  currentHighestBet: number;
  pot: number;
  minRaise: number;
  smallBlind: number;
  bigBlind: number;
  winnerSummary: string | null;
  playerHandEvaluation: EvaluatedPokerHand | null;

  // Actions
  initGame: () => void;
  startNewHand: () => void;
  playerCheck: () => void;
  playerCall: () => void;
  playerRaise: (amount: number) => void;
  playerFold: () => void;
}

const INITIAL_BOTS: PokerPlayer[] = [
  {
    id: 'player-user',
    name: 'You',
    avatar: '😎',
    isBot: false,
    chips: 1000,
    currentBet: 0,
    totalBetThisRound: 0,
    cards: [],
    status: 'active',
  },
  {
    id: 'bot-elena',
    name: 'Elena',
    avatar: '👩🏼‍💼',
    isBot: true,
    chips: 1000,
    currentBet: 0,
    totalBetThisRound: 0,
    cards: [],
    status: 'active',
    personality: 'tight',
  },
  {
    id: 'bot-viktor',
    name: 'Viktor',
    avatar: '🧔🏻',
    isBot: true,
    chips: 1000,
    currentBet: 0,
    totalBetThisRound: 0,
    cards: [],
    status: 'active',
    personality: 'aggressive',
  },
];

export const usePokerStore = create<PokerHoldemState>()((set, get) => ({
  phase: 'betting',
  deck: createDeck(),
  communityCards: [],
  players: INITIAL_BOTS,
  activePlayerIndex: 0,
  dealerButtonIndex: 0,
  currentHighestBet: 20,
  pot: 0,
  minRaise: 20,
  smallBlind: 10,
  bigBlind: 20,
  winnerSummary: null,
  playerHandEvaluation: null,

  initGame: () => {
    const userChips = useBankrollStore.getState().chips;
    const updatedPlayers = INITIAL_BOTS.map((p) =>
      p.id === 'player-user' ? { ...p, chips: userChips } : p
    );

    set({
      phase: 'betting',
      deck: createDeck(),
      communityCards: [],
      players: updatedPlayers,
      activePlayerIndex: 0,
      dealerButtonIndex: 0,
      pot: 0,
      winnerSummary: null,
      playerHandEvaluation: null,
    });
    useBankrollStore.getState().setLastActiveGame('videopoker');
  },

  startNewHand: () => {
    const state = get();
    const userChips = useBankrollStore.getState().chips;

    // Check if user has chips
    if (userChips < state.bigBlind) {
      sound.playBust();
      set({ winnerSummary: 'Not enough chips! Reset bankroll to continue.' });
      return;
    }

    sound.playShuffle();
    const newDeck = createDeck();
    const nextDealerIdx = (state.dealerButtonIndex + 1) % state.players.length;

    // Rotate Blinds
    const sbIdx = (nextDealerIdx + 1) % state.players.length;
    const bbIdx = (nextDealerIdx + 2) % state.players.length;

    let pot = 0;
    const players: PokerPlayer[] = state.players.map((p, idx) => {
      const isUser = p.id === 'player-user';
      let chips = isUser ? userChips : Math.max(200, p.chips); // reload bot if busted
      let currentBet = 0;

      if (idx === sbIdx) {
        const sbAmt = Math.min(chips, state.smallBlind);
        chips -= sbAmt;
        currentBet = sbAmt;
        pot += sbAmt;
      } else if (idx === bbIdx) {
        const bbAmt = Math.min(chips, state.bigBlind);
        chips -= bbAmt;
        currentBet = bbAmt;
        pot += bbAmt;
      }

      if (isUser) {
        useBankrollStore.getState().deductChips(currentBet);
      }

      // Deal 2 hole cards
      const c1 = { ...newDeck.pop()!, faceUp: isUser }; // Face up for user, face down for bots
      const c2 = { ...newDeck.pop()!, faceUp: isUser };

      return {
        ...p,
        chips,
        currentBet,
        totalBetThisRound: currentBet,
        cards: [c1, c2],
        status: 'active',
        lastAction: idx === sbIdx ? `SB $${state.smallBlind}` : idx === bbIdx ? `BB $${state.bigBlind}` : undefined,
        isDealer: idx === nextDealerIdx,
        isSmallBlind: idx === sbIdx,
        isBigBlind: idx === bbIdx,
      };
    });

    const userPlayer = players.find((p) => !p.isBot)!;
    const initialEval = evaluate7CardHand(userPlayer.cards);

    // Preflop first to act is after Big Blind
    const firstActorIdx = (bbIdx + 1) % players.length;

    set({
      phase: 'preflop',
      deck: newDeck,
      communityCards: [],
      players,
      activePlayerIndex: firstActorIdx,
      dealerButtonIndex: nextDealerIdx,
      currentHighestBet: state.bigBlind,
      minRaise: state.bigBlind,
      pot,
      winnerSummary: null,
      playerHandEvaluation: initialEval,
    });

    sound.playCardSlide();

    // If first actor is a bot, trigger turn
    if (players[firstActorIdx].isBot) {
      setTimeout(() => processNextTurn(), 600);
    }
  },

  playerCheck: () => {
    const { players, activePlayerIndex, currentHighestBet } = get();
    const user = players[activePlayerIndex];
    if (user.isBot || user.currentBet < currentHighestBet) return;

    sound.playButtonClick();
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = { ...user, lastAction: 'Check' };

    set({ players: updatedPlayers });
    advanceTurn();
  },

  playerCall: () => {
    const { players, activePlayerIndex, currentHighestBet, pot } = get();
    const user = players[activePlayerIndex];
    if (user.isBot) return;

    const callAmount = currentHighestBet - user.currentBet;
    const actualPay = Math.min(user.chips, callAmount);

    useBankrollStore.getState().deductChips(actualPay);
    sound.playChipToss();

    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = {
      ...user,
      chips: user.chips - actualPay,
      currentBet: user.currentBet + actualPay,
      totalBetThisRound: user.totalBetThisRound + actualPay,
      status: user.chips - actualPay === 0 ? 'all-in' : 'active',
      lastAction: `Call $${actualPay}`,
    };

    set({
      players: updatedPlayers,
      pot: pot + actualPay,
    });

    advanceTurn();
  },

  playerRaise: (raiseToTotal: number) => {
    const { players, activePlayerIndex, pot, currentHighestBet } = get();
    const user = players[activePlayerIndex];
    if (user.isBot) return;

    const addAmount = raiseToTotal - user.currentBet;
    const actualPay = Math.min(user.chips, addAmount);

    useBankrollStore.getState().deductChips(actualPay);
    sound.playChipToss();

    const updatedPlayers = [...players];
    const newBet = user.currentBet + actualPay;
    updatedPlayers[activePlayerIndex] = {
      ...user,
      chips: user.chips - actualPay,
      currentBet: newBet,
      totalBetThisRound: user.totalBetThisRound + actualPay,
      status: user.chips - actualPay === 0 ? 'all-in' : 'active',
      lastAction: `Raise to $${newBet}`,
    };

    const newHighest = Math.max(currentHighestBet, newBet);
    const newMinRaise = newHighest - currentHighestBet > 0 ? newHighest - currentHighestBet : get().bigBlind;

    set({
      players: updatedPlayers,
      pot: pot + actualPay,
      currentHighestBet: newHighest,
      minRaise: newMinRaise,
    });

    advanceTurn();
  },

  playerFold: () => {
    const { players, activePlayerIndex } = get();
    const user = players[activePlayerIndex];
    if (user.isBot) return;

    sound.playBust();
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = {
      ...user,
      status: 'folded',
      lastAction: 'Fold',
    };

    set({ players: updatedPlayers });

    // Check if only 1 active player remains
    const activeRemaining = updatedPlayers.filter((p) => p.status !== 'folded');
    if (activeRemaining.length === 1) {
      endHandEarly(activeRemaining[0]);
    } else {
      advanceTurn();
    }
  },
}));

function advanceTurn() {
  const store = usePokerStore.getState();
  const { players, activePlayerIndex, currentHighestBet } = store;

  // Check if only 1 non-folded player left
  const nonFolded = players.filter((p) => p.status !== 'folded');
  if (nonFolded.length === 1) {
    endHandEarly(nonFolded[0]);
    return;
  }

  // Find next active player
  let nextIdx = (activePlayerIndex + 1) % players.length;
  let loops = 0;
  while (
    (players[nextIdx].status === 'folded' || players[nextIdx].status === 'all-in') &&
    loops < players.length
  ) {
    nextIdx = (nextIdx + 1) % players.length;
    loops++;
  }

  // Check if betting round is complete (all active players matched the highest bet and had a chance to act)
  const activeUnfolded = players.filter((p) => p.status === 'active');
  const allMatched = activeUnfolded.every(
    (p) => p.currentBet === currentHighestBet && p.lastAction !== undefined
  );

  if (allMatched || activeUnfolded.length <= 1) {
    // Proceed to next phase (Flop -> Turn -> River -> Showdown)
    proceedToNextPhase();
  } else {
    usePokerStore.setState({ activePlayerIndex: nextIdx });
    if (players[nextIdx].isBot) {
      setTimeout(processNextTurn, 650);
    }
  }
}

function processNextTurn() {
  const store = usePokerStore.getState();
  const { players, activePlayerIndex, phase, communityCards, currentHighestBet, minRaise, pot } = store;
  const bot = players[activePlayerIndex];

  if (!bot || !bot.isBot || bot.status !== 'active') {
    return;
  }

  const callAmount = currentHighestBet - bot.currentBet;
  const decision = getBotDecision(
    bot,
    phase,
    communityCards,
    callAmount,
    minRaise,
    pot
  );

  const updatedPlayers = [...players];

  if (decision.action === 'fold') {
    sound.playCardSlide();
    updatedPlayers[activePlayerIndex] = { ...bot, status: 'folded', lastAction: 'Fold' };
    usePokerStore.setState({ players: updatedPlayers });

    const nonFolded = updatedPlayers.filter((p) => p.status !== 'folded');
    if (nonFolded.length === 1) {
      endHandEarly(nonFolded[0]);
      return;
    }
  } else if (decision.action === 'check') {
    sound.playButtonClick();
    updatedPlayers[activePlayerIndex] = { ...bot, lastAction: 'Check' };
    usePokerStore.setState({ players: updatedPlayers });
  } else if (decision.action === 'call') {
    sound.playChipToss();
    const actualPay = Math.min(bot.chips, callAmount);
    updatedPlayers[activePlayerIndex] = {
      ...bot,
      chips: bot.chips - actualPay,
      currentBet: bot.currentBet + actualPay,
      totalBetThisRound: bot.totalBetThisRound + actualPay,
      status: bot.chips - actualPay === 0 ? 'all-in' : 'active',
      lastAction: `Call $${actualPay}`,
    };
    usePokerStore.setState({ players: updatedPlayers, pot: pot + actualPay });
  } else if (decision.action === 'raise') {
    sound.playChipToss();
    const raiseTarget = (decision.amount || minRaise) + currentHighestBet;
    const addAmt = raiseTarget - bot.currentBet;
    const actualPay = Math.min(bot.chips, addAmt);
    const newBet = bot.currentBet + actualPay;

    updatedPlayers[activePlayerIndex] = {
      ...bot,
      chips: bot.chips - actualPay,
      currentBet: newBet,
      totalBetThisRound: bot.totalBetThisRound + actualPay,
      status: bot.chips - actualPay === 0 ? 'all-in' : 'active',
      lastAction: `Raise $${actualPay}`,
    };

    usePokerStore.setState({
      players: updatedPlayers,
      pot: pot + actualPay,
      currentHighestBet: Math.max(currentHighestBet, newBet),
      minRaise: Math.max(minRaise, newBet - currentHighestBet),
    });
  }

  advanceTurn();
}

function proceedToNextPhase() {
  const store = usePokerStore.getState();
  const { phase, deck, communityCards, players, dealerButtonIndex } = store;

  // Reset bets for new street
  const resetPlayers = players.map((p) => ({
    ...p,
    currentBet: 0,
    lastAction: p.status === 'folded' ? 'Fold' : undefined,
  }));

  const activeDeck = [...deck];
  let nextPhase: HoldemPhase = phase;
  let newCommunity = [...communityCards];

  if (phase === 'preflop') {
    // Deal Flop (3 cards)
    sound.playCardSlide();
    newCommunity = [
      { ...activeDeck.pop()!, faceUp: true },
      { ...activeDeck.pop()!, faceUp: true },
      { ...activeDeck.pop()!, faceUp: true },
    ];
    nextPhase = 'flop';
  } else if (phase === 'flop') {
    // Deal Turn (1 card)
    sound.playCardSlide();
    newCommunity.push({ ...activeDeck.pop()!, faceUp: true });
    nextPhase = 'turn';
  } else if (phase === 'turn') {
    // Deal River (1 card)
    sound.playCardSlide();
    newCommunity.push({ ...activeDeck.pop()!, faceUp: true });
    nextPhase = 'river';
  } else if (phase === 'river') {
    // Showdown!
    showdown();
    return;
  }

  // Update user hand evaluation with new community cards
  const user = resetPlayers.find((p) => !p.isBot)!;
  const userEval = evaluate7CardHand([...user.cards, ...newCommunity]);

  // First actor postflop is player after dealer button
  let firstActor = (dealerButtonIndex + 1) % resetPlayers.length;
  while (resetPlayers[firstActor].status === 'folded' || resetPlayers[firstActor].status === 'all-in') {
    firstActor = (firstActor + 1) % resetPlayers.length;
  }

  usePokerStore.setState({
    phase: nextPhase,
    deck: activeDeck,
    communityCards: newCommunity,
    players: resetPlayers,
    currentHighestBet: 0,
    activePlayerIndex: firstActor,
    playerHandEvaluation: userEval,
  });

  if (resetPlayers[firstActor].isBot) {
    setTimeout(processNextTurn, 650);
  }
}

function showdown() {
  const store = usePokerStore.getState();
  const { communityCards, players, pot } = store;

  // Reveal all bot cards
  const revealedPlayers = players.map((p) => ({
    ...p,
    cards: p.cards.map((c) => ({ ...c, faceUp: true })),
  }));

  const activeContenders = revealedPlayers.filter((p) => p.status !== 'folded');
  const evaluatedContenders = activeContenders.map((p) => ({
    player: p,
    evaluation: evaluate7CardHand([...p.cards, ...communityCards]),
  }));

  evaluatedContenders.sort((a, b) => b.evaluation.score - a.evaluation.score);

  const bestScore = evaluatedContenders[0].evaluation.score;
  const winners = evaluatedContenders.filter((e) => e.evaluation.score === bestScore);
  const winShare = Math.floor(pot / winners.length);

  const userWon = winners.some((w) => w.player.id === 'player-user');
  if (userWon) {
    sound.playWinFanfare();
    useBankrollStore.getState().recordHand(winShare, 0, 'videopoker', { isRoyal: winners[0].evaluation.rank === 'ROYAL_FLUSH' });
  } else {
    sound.playBust();
  }

  const finalPlayers = revealedPlayers.map((p) => {
    if (winners.some((w) => w.player.id === p.id)) {
      return { ...p, chips: p.chips + winShare, lastAction: `Won $${winShare}! 🏆` };
    }
    return p;
  });

  const winnerNames = winners.map((w) => `${w.player.name} (${w.evaluation.displayName})`).join(' & ');

  usePokerStore.setState({
    phase: 'showdown',
    players: finalPlayers,
    pot: 0,
    winnerSummary: `Winner: ${winnerNames} — Pot $${pot}`,
  });
}

function endHandEarly(winner: PokerPlayer) {
  const store = usePokerStore.getState();
  const { pot, players } = store;

  const isUser = winner.id === 'player-user';
  if (isUser) {
    sound.playWinFanfare();
    useBankrollStore.getState().recordHand(pot, 0, 'videopoker');
  } else {
    sound.playButtonClick();
  }

  const updatedPlayers = players.map((p) =>
    p.id === winner.id ? { ...p, chips: p.chips + pot, lastAction: `Won $${pot}! 🏆` } : p
  );

  usePokerStore.setState({
    phase: 'hand-ended',
    players: updatedPlayers,
    pot: 0,
    winnerSummary: `${winner.name} won $${pot} (All opponents folded)`,
  });
}
