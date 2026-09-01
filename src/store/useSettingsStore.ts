import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sound } from '../engine/audio/soundEngine';

interface SettingsState {
  isMuted: boolean;
  showTrainerHud: boolean;
  autoCheckStrategy: boolean;
  toggleMute: () => void;
  toggleTrainerHud: () => void;
  toggleAutoCheckStrategy: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isMuted: false,
      showTrainerHud: true,
      autoCheckStrategy: true,

      toggleMute: () => {
        set((s) => {
          const newMuted = !s.isMuted;
          sound.setMuted(newMuted);
          return { isMuted: newMuted };
        });
      },

      toggleTrainerHud: () => {
        set((s) => ({ showTrainerHud: !s.showTrainerHud }));
      },

      toggleAutoCheckStrategy: () => {
        set((s) => ({ autoCheckStrategy: !s.autoCheckStrategy }));
      },
    }),
    {
      name: 'hanggaa-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
