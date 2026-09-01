import { create } from 'zustand';
import { ShellType, BuckshotItem, BuckshotPhase } from '../types/buckshot.types';
import {
  ROUND_CONFIGS,
  generateMagazine,
  createRandomItem,
} from '../engine/buckshot/buckshotEngine';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

const MAX_ITEMS = 8;

interface BuckshotState {
  phase: BuckshotPhase;
  roundNumber: number;
  maxHealth: number;
  playerHealth: number;
  dealerHealth: number;
  magazine: ShellType[];
  initialLiveCount: number;
  initialBlankCount: number;
  playerItems: BuckshotItem[];
  dealerItems: BuckshotItem[];
  isSawedOff: boolean;
  isPlayerHandcuffed: boolean;
  isDealerHandcuffed: boolean;
  inspectedCurrentShell: ShellType | null;
  phoneHint: string | null;
  logMessage: string;
  screenShake: boolean;

  // Actions
  startNewGame: () => void;
  loadMagazineForRound: () => void;
  playerShootSelf: () => void;
  playerShootDealer: () => void;
  playerUseItem: (itemId: string) => void;
  proceedToNextRound: () => void;
}

export const useBuckshotStore = create<BuckshotState>()((set, get) => ({
  phase: 'intro',
  roundNumber: 1,
  maxHealth: 3,
  playerHealth: 3,
  dealerHealth: 3,
  magazine: [],
  initialLiveCount: 0,
  initialBlankCount: 0,
  playerItems: [],
  dealerItems: [],
  isSawedOff: false,
  isPlayerHandcuffed: false,
  isDealerHandcuffed: false,
  inspectedCurrentShell: null,
  phoneHint: null,
  logMessage: 'The shotgun rests on the metal table. Enter the chamber.',
  screenShake: false,

  startNewGame: () => {
    sound.playRackSlide();
    const config = ROUND_CONFIGS[1];
    set({
      phase: 'intro',
      roundNumber: 1,
      maxHealth: config.maxHealth,
      playerHealth: config.maxHealth,
      dealerHealth: config.maxHealth,
      playerItems: [],
      dealerItems: [],
      magazine: [],
      isSawedOff: false,
      isPlayerHandcuffed: false,
      isDealerHandcuffed: false,
      inspectedCurrentShell: null,
      phoneHint: null,
      logMessage: 'Round 1: Initial charges loaded. Ready to begin.',
    });
    useBankrollStore.getState().setLastActiveGame('blackjack');
  },

  loadMagazineForRound: () => {
    const { roundNumber, playerItems, dealerItems } = get();
    sound.playRackSlide();
    const newMag = generateMagazine(roundNumber);
    const liveCount = newMag.filter((s) => s === 'live').length;
    const blankCount = newMag.filter((s) => s === 'blank').length;

    // Distribute random items
    const config = ROUND_CONFIGS[roundNumber] || ROUND_CONFIGS[3];
    const newPlayerItems = [...playerItems];
    const newDealerItems = [...dealerItems];

    for (let i = 0; i < config.itemsPerLoad; i++) {
      if (newPlayerItems.length < MAX_ITEMS) newPlayerItems.push(createRandomItem());
      if (newDealerItems.length < MAX_ITEMS) newDealerItems.push(createRandomItem());
    }

    set({
      phase: 'loading',
      magazine: newMag,
      initialLiveCount: liveCount,
      initialBlankCount: blankCount,
      playerItems: newPlayerItems,
      dealerItems: newDealerItems,
      isSawedOff: false,
      inspectedCurrentShell: null,
      phoneHint: null,
      logMessage: `Chamber loaded: ${liveCount} Live, ${blankCount} Blank. In unknown sequence.`,
    });

    setTimeout(() => {
      set({ phase: 'player-turn', logMessage: 'Your turn. Shoot yourself or the Dealer.' });
    }, 2400);
  },

  playerShootSelf: () => {
    const {
      phase,
      magazine,
      playerHealth,
      isSawedOff,
    } = get();

    if (phase !== 'player-turn' || magazine.length === 0) return;

    const activeMag = [...magazine];
    const currentShell = activeMag.shift()!;
    const damage = isSawedOff ? 2 : 1;

    set({ inspectedCurrentShell: null });

    if (currentShell === 'live') {
      sound.playShotgunBlast();
      triggerShake();
      const newHealth = Math.max(0, playerHealth - damage);

      if (newHealth <= 0) {
        sound.playBust();
        set({
          phase: 'game-over',
          playerHealth: 0,
          magazine: activeMag,
          isSawedOff: false,
          logMessage: `BANG! Live round struck you for ${damage} damage. Defibrillator Flatline.`,
        });
        return;
      }

      set({
        playerHealth: newHealth,
        magazine: activeMag,
        isSawedOff: false,
        logMessage: `BANG! Live round hit you (-${damage} Charge). Turn passes to Dealer.`,
      });

      checkMagAndNextTurn(false);
    } else {
      // BLANK shell on Self: Free turn!
      sound.playDryClick();
      set({
        magazine: activeMag,
        isSawedOff: false,
        logMessage: '*CLICK* Blank shell! You take no damage and keep your turn.',
      });

      if (activeMag.length === 0) {
        setTimeout(() => get().loadMagazineForRound(), 1200);
      } else {
        set({ phase: 'player-turn' });
      }
    }
  },

  playerShootDealer: () => {
    const {
      phase,
      magazine,
      dealerHealth,
      isSawedOff,
      roundNumber,
    } = get();

    if (phase !== 'player-turn' || magazine.length === 0) return;

    const activeMag = [...magazine];
    const currentShell = activeMag.shift()!;
    const damage = isSawedOff ? 2 : 1;

    set({ inspectedCurrentShell: null });

    if (currentShell === 'live') {
      sound.playShotgunBlast();
      triggerShake();
      const newDealerHealth = Math.max(0, dealerHealth - damage);

      if (newDealerHealth <= 0) {
        sound.playWinFanfare();
        if (roundNumber >= 3) {
          useBankrollStore.getState().addChips(1000);
          set({
            phase: 'victory',
            dealerHealth: 0,
            magazine: activeMag,
            isSawedOff: false,
            logMessage: `BANG! Dealer took ${damage} damage and collapsed! VICTORY: +$1,000 Wager Prize! 🏆`,
          });
        } else {
          set({
            phase: 'round-won',
            dealerHealth: 0,
            magazine: activeMag,
            isSawedOff: false,
            logMessage: `BANG! Dealer took ${damage} damage and flatlined. Round ${roundNumber} complete!`,
          });
        }
        return;
      }

      set({
        dealerHealth: newDealerHealth,
        magazine: activeMag,
        isSawedOff: false,
        logMessage: `BANG! Dealer took ${damage} damage. Turn passes to Dealer.`,
      });

      checkMagAndNextTurn(false);
    } else {
      sound.playDryClick();
      set({
        magazine: activeMag,
        isSawedOff: false,
        logMessage: '*CLICK* Blank shell fired at Dealer. Turn passes.',
      });

      checkMagAndNextTurn(false);
    }
  },

  playerUseItem: (itemId: string) => {
    const { phase, playerItems, magazine, playerHealth, maxHealth, isDealerHandcuffed } = get();
    if (phase !== 'player-turn') return;

    const item = playerItems.find((i) => i.id === itemId);
    if (!item || magazine.length === 0) return;

    sound.playButtonClick();
    const remainingItems = playerItems.filter((i) => i.id !== itemId);

    if (item.type === 'magnifier') {
      const current = magazine[0];
      set({
        playerItems: remainingItems,
        inspectedCurrentShell: current,
        logMessage: `Magnifier: Current chamber holds a ${current.toUpperCase()} shell.`,
      });
    } else if (item.type === 'handsaw') {
      sound.playSawSound();
      set({
        playerItems: remainingItems,
        isSawedOff: true,
        logMessage: 'Handsaw: Barrel sawed off. Next live shot deals DOUBLE damage (2x).',
      });
    } else if (item.type === 'cigarette') {
      const healed = Math.min(maxHealth, playerHealth + 1);
      set({
        playerItems: remainingItems,
        playerHealth: healed,
        logMessage: `Cigarette: Smoked to soothe nerves (+1 Health charge: ${healed}/${maxHealth}).`,
      });
    } else if (item.type === 'beer') {
      sound.playRackSlide();
      const activeMag = [...magazine];
      const ejected = activeMag.shift()!;
      set({
        playerItems: remainingItems,
        magazine: activeMag,
        inspectedCurrentShell: null,
        logMessage: `Beer: Racked slide and safely ejected a ${ejected.toUpperCase()} shell.`,
      });
      if (activeMag.length === 0) {
        setTimeout(() => get().loadMagazineForRound(), 1200);
      }
    } else if (item.type === 'handcuffs') {
      if (isDealerHandcuffed) {
        set({ logMessage: 'Dealer is already handcuffed!' });
        return;
      }
      set({
        playerItems: remainingItems,
        isDealerHandcuffed: true,
        logMessage: 'Handcuffs: Dealer is handcuffed and will skip their next turn.',
      });
    } else if (item.type === 'inverter') {
      const activeMag = [...magazine];
      const current = activeMag[0];
      const inverted: ShellType = current === 'live' ? 'blank' : 'live';
      activeMag[0] = inverted;
      set({
        playerItems: remainingItems,
        magazine: activeMag,
        inspectedCurrentShell: inverted,
        logMessage: `Inverter: Current shell polarity flipped (${current.toUpperCase()} -> ${inverted.toUpperCase()}).`,
      });
    } else if (item.type === 'burner_phone') {
      if (magazine.length <= 1) {
        set({
          playerItems: remainingItems,
          logMessage: 'Burner Phone: No future shells to inspect.',
        });
        return;
      }
      const randomIdx = 1 + Math.floor(Math.random() * (magazine.length - 1));
      const targetShell = magazine[randomIdx];
      const hint = `Shell #${randomIdx + 1} is ${targetShell.toUpperCase()}`;
      set({
        playerItems: remainingItems,
        phoneHint: hint,
        logMessage: `Burner Phone: Mysterious voice whispers: "${hint}".`,
      });
    }
  },

  proceedToNextRound: () => {
    const { roundNumber } = get();
    const nextRound = roundNumber + 1;
    const config = ROUND_CONFIGS[nextRound] || ROUND_CONFIGS[3];

    set({
      roundNumber: nextRound,
      maxHealth: config.maxHealth,
      playerHealth: config.maxHealth,
      dealerHealth: config.maxHealth,
      isSawedOff: false,
      isPlayerHandcuffed: false,
      isDealerHandcuffed: false,
      inspectedCurrentShell: null,
      phoneHint: null,
      logMessage: `Entering Round ${nextRound} (${config.maxHealth} Health Charges).`,
    });

    get().loadMagazineForRound();
  },
}));

function triggerShake() {
  useBuckshotStore.setState({ screenShake: true });
  setTimeout(() => useBuckshotStore.setState({ screenShake: false }), 400);
}

function checkMagAndNextTurn(isFromDealer: boolean) {
  const store = useBuckshotStore.getState();
  const { magazine, isDealerHandcuffed, isPlayerHandcuffed } = store;

  if (magazine.length === 0) {
    setTimeout(() => store.loadMagazineForRound(), 1200);
    return;
  }

  if (isFromDealer) {
    // Turn passes to Player (unless Player is handcuffed)
    if (isPlayerHandcuffed) {
      useBuckshotStore.setState({
        isPlayerHandcuffed: false,
        phase: 'dealer-turn',
        logMessage: 'You are handcuffed! Turn skipped back to Dealer.',
      });
      setTimeout(executeDealerAI, 1200);
    } else {
      useBuckshotStore.setState({ phase: 'player-turn' });
    }
  } else {
    // Turn passes to Dealer (unless Dealer is handcuffed)
    if (isDealerHandcuffed) {
      useBuckshotStore.setState({
        isDealerHandcuffed: false,
        phase: 'player-turn',
        logMessage: 'Dealer is handcuffed! Turn skipped back to You.',
      });
    } else {
      useBuckshotStore.setState({ phase: 'dealer-turn' });
      setTimeout(executeDealerAI, 1100);
    }
  }
}

function executeDealerAI() {
  const store = useBuckshotStore.getState();
  const {
    phase,
    magazine,
    dealerItems,
    dealerHealth,
    maxHealth,
    playerHealth,
    isSawedOff,
    isPlayerHandcuffed,
  } = store;

  if (phase !== 'dealer-turn' || magazine.length === 0 || dealerHealth <= 0 || playerHealth <= 0) {
    return;
  }

  let activeDealerItems = [...dealerItems];
  let activeMag = [...magazine];
  let knownCurrent: ShellType | null = null;
  let currentSawed = isSawedOff;

  // 1. Check if Dealer has Cigarette and needs healing
  const cigIdx = activeDealerItems.findIndex((i) => i.type === 'cigarette');
  if (cigIdx !== -1 && dealerHealth < maxHealth) {
    sound.playButtonClick();
    activeDealerItems.splice(cigIdx, 1);
    const healed = Math.min(maxHealth, dealerHealth + 1);
    useBuckshotStore.setState({
      dealerHealth: healed,
      dealerItems: activeDealerItems,
      logMessage: 'Dealer smoked a cigarette (+1 Health Charge).',
    });
    setTimeout(executeDealerAI, 900);
    return;
  }

  // 2. Check if Dealer has Magnifying Glass
  const magIdx = activeDealerItems.findIndex((i) => i.type === 'magnifier');
  if (magIdx !== -1 && !knownCurrent && activeMag.length > 1) {
    sound.playButtonClick();
    activeDealerItems.splice(magIdx, 1);
    knownCurrent = activeMag[0];
    useDealerItem(activeDealerItems, 'Dealer inspected the chamber with a Magnifying Glass.');
    setTimeout(executeDealerAI, 900);
    return;
  }

  // 3. Check if Dealer has Handcuffs
  const cuffIdx = activeDealerItems.findIndex((i) => i.type === 'handcuffs');
  if (cuffIdx !== -1 && !isPlayerHandcuffed) {
    sound.playButtonClick();
    activeDealerItems.splice(cuffIdx, 1);
    useBuckshotStore.setState({
      dealerItems: activeDealerItems,
      isPlayerHandcuffed: true,
      logMessage: 'Dealer handcuffed you! You will skip your next turn.',
    });
    setTimeout(executeDealerAI, 900);
    return;
  }

  // Calculate live probability
  const liveCount = activeMag.filter((s) => s === 'live').length;
  const liveProb = liveCount / activeMag.length;

  // 4. Check if Dealer should use Handsaw
  const sawIdx = activeDealerItems.findIndex((i) => i.type === 'handsaw');
  if (sawIdx !== -1 && !currentSawed && (knownCurrent === 'live' || liveProb >= 0.6)) {
    sound.playSawSound();
    activeDealerItems.splice(sawIdx, 1);
    currentSawed = true;
    useBuckshotStore.setState({
      dealerItems: activeDealerItems,
      isSawedOff: true,
      logMessage: 'Dealer sawed off the barrel with a Handsaw (2x Damage).',
    });
    setTimeout(executeDealerAI, 900);
    return;
  }

  // DECISION: Shoot Player or Shoot Self
  const shell = activeMag.shift()!;
  const damage = currentSawed ? 2 : 1;

  let willShootSelf = false;
  if (knownCurrent === 'blank' || liveCount === 0) {
    willShootSelf = true;
  } else if (knownCurrent === 'live') {
    willShootSelf = false;
  } else {
    willShootSelf = liveProb <= 0.45;
  }

  if (willShootSelf) {
    // Dealer shoots Self
    if (shell === 'live') {
      sound.playShotgunBlast();
      triggerShake();
      const newDHealth = Math.max(0, dealerHealth - damage);

      if (newDHealth <= 0) {
        sound.playWinFanfare();
        const r = store.roundNumber;
        if (r >= 3) {
          useBankrollStore.getState().addChips(1000);
          useBuckshotStore.setState({
            phase: 'victory',
            dealerHealth: 0,
            magazine: activeMag,
            isSawedOff: false,
            logMessage: `BANG! Dealer shot himself for ${damage} damage and collapsed! VICTORY: +$1,000 Wager Prize! 🏆`,
          });
        } else {
          useBuckshotStore.setState({
            phase: 'round-won',
            dealerHealth: 0,
            magazine: activeMag,
            isSawedOff: false,
            logMessage: `BANG! Dealer shot himself for ${damage} damage and flatlined. Round ${r} Won!`,
          });
        }
        return;
      }

      useBuckshotStore.setState({
        dealerHealth: newDHealth,
        magazine: activeMag,
        isSawedOff: false,
        logMessage: `BANG! Dealer miscalculated and shot himself with a LIVE round (-${damage} Charge).`,
      });

      checkMagAndNextTurn(true);
    } else {
      sound.playDryClick();
      useBuckshotStore.setState({
        magazine: activeMag,
        isSawedOff: false,
        logMessage: '*CLICK* Dealer shot himself with a BLANK and retains the turn!',
      });

      if (activeMag.length === 0) {
        setTimeout(() => useBuckshotStore.getState().loadMagazineForRound(), 1200);
      } else {
        setTimeout(executeDealerAI, 1000);
      }
    }
  } else {
    // Dealer shoots Player
    if (shell === 'live') {
      sound.playShotgunBlast();
      triggerShake();
      const newPHealth = Math.max(0, playerHealth - damage);

      if (newPHealth <= 0) {
        sound.playBust();
        useBuckshotStore.setState({
          phase: 'game-over',
          playerHealth: 0,
          magazine: activeMag,
          isSawedOff: false,
          logMessage: `BANG! Dealer shot you with a LIVE round for ${damage} damage! Defibrillator Flatline.`,
        });
        return;
      }

      useBuckshotStore.setState({
        playerHealth: newPHealth,
        magazine: activeMag,
        isSawedOff: false,
        logMessage: `BANG! Dealer shot you for ${damage} damage. Turn passes to You.`,
      });

      checkMagAndNextTurn(true);
    } else {
      sound.playDryClick();
      useBuckshotStore.setState({
        magazine: activeMag,
        isSawedOff: false,
        logMessage: '*CLICK* Dealer shot at you with a BLANK shell. Turn passes to You.',
      });

      checkMagAndNextTurn(true);
    }
  }
}

function useDealerItem(dealerItems: BuckshotItem[], message: string) {
  useBuckshotStore.setState({
    dealerItems,
    logMessage: message,
  });
}
