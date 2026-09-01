import { create } from 'zustand';
import { TurretType, Turret, Enemy, DefensePhase } from '../types/defense.types';
import { TURRET_CONFIGS, createTurret, spawnWaveEnemies } from '../engine/defense/defenseEngine';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

interface DefenseState {
  phase: DefensePhase;
  wave: number;
  coreHealth: number;
  maxCoreHealth: number;
  energy: number;
  turrets: Record<string, Turret>; // key: "row,col"
  selectedTurretType: TurretType;
  enemies: Enemy[];
  score: number;

  // Actions
  initGame: () => void;
  setSelectedTurretType: (type: TurretType) => void;
  placeTurret: (row: number, col: number) => void;
  upgradeTurret: (row: number, col: number) => void;
  sellTurret: (row: number, col: number) => void;
  startWave: () => void;
  tickGame: () => void;
}

export const useDefenseStore = create<DefenseState>()((set, get) => ({
  phase: 'planning',
  wave: 1,
  coreHealth: 100,
  maxCoreHealth: 100,
  energy: 150,
  turrets: {},
  selectedTurretType: 'pulse',
  enemies: [],
  score: 0,

  initGame: () => {
    set({
      phase: 'planning',
      wave: 1,
      coreHealth: 100,
      energy: 150,
      turrets: {},
      selectedTurretType: 'pulse',
      enemies: [],
      score: 0,
    });
  },

  setSelectedTurretType: (type: TurretType) => {
    sound.playButtonClick();
    set({ selectedTurretType: type });
  },

  placeTurret: (row: number, col: number) => {
    const { turrets, energy, selectedTurretType, phase } = get();
    const key = `${row},${col}`;
    if (turrets[key] || phase === 'game-over') return;

    const cost = TURRET_CONFIGS[selectedTurretType].cost;
    if (energy < cost) {
      sound.playBust();
      return;
    }

    sound.playButtonClick();
    const newTurret = createTurret(selectedTurretType, row, col);
    set({
      turrets: { ...turrets, [key]: newTurret },
      energy: energy - cost,
    });
  },

  upgradeTurret: (row: number, col: number) => {
    const { turrets, energy } = get();
    const key = `${row},${col}`;
    const t = turrets[key];
    if (!t) return;

    const upgradeCost = Math.round(TURRET_CONFIGS[t.type].cost * 0.8 * t.level);
    if (energy < upgradeCost) {
      sound.playBust();
      return;
    }

    sound.playButtonClick();
    set({
      energy: energy - upgradeCost,
      turrets: {
        ...turrets,
        [key]: {
          ...t,
          level: t.level + 1,
          damage: Math.round(t.damage * 1.5),
          fireRate: Number((t.fireRate * 1.15).toFixed(1)),
        },
      },
    });
  },

  sellTurret: (row: number, col: number) => {
    const { turrets, energy } = get();
    const key = `${row},${col}`;
    const t = turrets[key];
    if (!t) return;

    sound.playChipToss();
    const refund = Math.round(TURRET_CONFIGS[t.type].cost * 0.5 * t.level);
    const updated = { ...turrets };
    delete updated[key];

    set({
      energy: energy + refund,
      turrets: updated,
    });
  },

  startWave: () => {
    const { wave, phase } = get();
    if (phase === 'wave-active') return;

    sound.playLaserShot();
    const newEnemies = spawnWaveEnemies(wave);
    set({
      phase: 'wave-active',
      enemies: newEnemies,
    });
  },

  tickGame: () => {
    const { phase, enemies, turrets, coreHealth, energy, wave, score } = get();
    if (phase !== 'wave-active') return;

    let updatedEnergy = energy;
    let updatedCoreHealth = coreHealth;
    let updatedScore = score;

    // 1. Move and hit core
    const activeEnemies: Enemy[] = [];
    for (const e of enemies) {
      const newY = e.y + e.speed * (e.isFrozen ? 0.5 : 1);
      if (newY >= 100) {
        sound.playExplosion();
        updatedCoreHealth = Math.max(0, updatedCoreHealth - (e.type === 'boss' ? 30 : e.type === 'tank' ? 15 : 8));
      } else {
        activeEnemies.push({ ...e, y: newY });
      }
    }

    if (updatedCoreHealth <= 0) {
      sound.playBust();
      set({
        phase: 'game-over',
        coreHealth: 0,
        enemies: [],
      });
      return;
    }

    // 2. Turret auto-fire on enemies within range
    const turretList = Object.values(turrets);
    for (const t of turretList) {
      const inRangeEnemies = activeEnemies.filter((e) => e.y >= 0 && Math.abs(e.lane - t.col) <= 1.5 && Math.abs(e.y - t.row * 25) <= t.range);
      if (inRangeEnemies.length > 0) {
        sound.playLaserShot();
        const target = inRangeEnemies[0];
        target.health -= t.damage;
        if (t.type === 'cryo') target.isFrozen = true;
      }
    }

    // 3. Remove dead enemies & award energy
    const livingEnemies: Enemy[] = [];
    for (const e of activeEnemies) {
      if (e.health <= 0) {
        sound.playExplosion();
        const scrap = e.type === 'boss' ? 80 : e.type === 'tank' ? 30 : 15;
        updatedEnergy += scrap;
        updatedScore += scrap * 10;
      } else {
        livingEnemies.push(e);
      }
    }

    // Check if wave is cleared
    if (livingEnemies.length === 0) {
      sound.playWinFanfare();
      const nextWave = wave + 1;
      const waveBonus = wave * 25;
      updatedEnergy += waveBonus;

      if (wave % 5 === 0) {
        useBankrollStore.getState().addChips(250);
      }

      set({
        phase: 'planning',
        wave: nextWave,
        energy: updatedEnergy,
        coreHealth: Math.min(100, updatedCoreHealth + 10),
        enemies: [],
        score: updatedScore,
      });
    } else {
      set({
        enemies: livingEnemies,
        coreHealth: updatedCoreHealth,
        energy: updatedEnergy,
        score: updatedScore,
      });
    }
  },
}));
