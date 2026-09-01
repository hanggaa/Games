import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GameKey = 'blackjack' | 'blackjack-pro' | 'videopoker';

export interface BankrollState {
  chips: number;
  totalWon: number;
  totalLost: number;
  handsPlayed: number;
  bjWins: number;
  bjLosses: number;
  bjPushes: number;
  bjBlackjacks: number;
  vpWins: number;
  vpLosses: number;
  vpRoyalFlushes: number;
  trainerDecisionsTotal: number;
  trainerDecisionsCorrect: number;
  lastActiveGame: GameKey | null;

  // Actions
  addChips: (amount: number) => void;
  deductChips: (amount: number) => boolean;
  recordHand: (wonAmount: number, betAmount: number, game: GameKey, extra?: { isBJ?: boolean; isRoyal?: boolean; isPush?: boolean }) => void;
  recordTrainerDecision: (isOptimal: boolean) => void;
  resetBankroll: () => void;
  setLastActiveGame: (game: GameKey) => void;
}

export const useBankrollStore = create<BankrollState>()(
  persist(
    (set, get) => ({
      chips: 1000,
      totalWon: 0,
      totalLost: 0,
      handsPlayed: 0,
      bjWins: 0,
      bjLosses: 0,
      bjPushes: 0,
      bjBlackjacks: 0,
      vpWins: 0,
      vpLosses: 0,
      vpRoyalFlushes: 0,
      trainerDecisionsTotal: 0,
      trainerDecisionsCorrect: 0,
      lastActiveGame: null,

      addChips: (amount: number) => {
        set((s) => ({ chips: s.chips + amount }));
      },

      deductChips: (amount: number) => {
        if (get().chips < amount) return false;
        set((s) => ({ chips: s.chips - amount }));
        return true;
      },

      recordHand: (wonAmount, betAmount, game, extra) => {
        set((s) => {
          const netWin = wonAmount - betAmount;
          const isWin = netWin > 0;
          const isPush = extra?.isPush || wonAmount === betAmount;

          const isBJ = game === 'blackjack' || game === 'blackjack-pro';
          const isVP = game === 'videopoker';

          return {
            chips: s.chips + wonAmount,
            totalWon: wonAmount > 0 ? s.totalWon + wonAmount : s.totalWon,
            totalLost: wonAmount === 0 ? s.totalLost + betAmount : s.totalLost,
            handsPlayed: s.handsPlayed + 1,
            lastActiveGame: game,

            bjWins: isBJ && isWin ? s.bjWins + 1 : s.bjWins,
            bjLosses: isBJ && !isWin && !isPush ? s.bjLosses + 1 : s.bjLosses,
            bjPushes: isBJ && isPush ? s.bjPushes + 1 : s.bjPushes,
            bjBlackjacks: isBJ && extra?.isBJ ? s.bjBlackjacks + 1 : s.bjBlackjacks,

            vpWins: isVP && isWin ? s.vpWins + 1 : s.vpWins,
            vpLosses: isVP && !isWin ? s.vpLosses + 1 : s.vpLosses,
            vpRoyalFlushes: isVP && extra?.isRoyal ? s.vpRoyalFlushes + 1 : s.vpRoyalFlushes,
          };
        });
      },

      recordTrainerDecision: (isOptimal: boolean) => {
        set((s) => ({
          trainerDecisionsTotal: s.trainerDecisionsTotal + 1,
          trainerDecisionsCorrect: isOptimal ? s.trainerDecisionsCorrect + 1 : s.trainerDecisionsCorrect,
        }));
      },

      resetBankroll: () => {
        set({ chips: 500 });
      },

      setLastActiveGame: (game: GameKey) => {
        set({ lastActiveGame: game });
      },
    }),
    {
      name: 'hanggaa-bankroll-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
