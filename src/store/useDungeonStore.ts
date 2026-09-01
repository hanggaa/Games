import { create } from 'zustand';
import { HeroClass, DungeonTile, DungeonGameStatus } from '../types/dungeon.types';
import { generateDungeonRow } from '../engine/dungeon/dungeonEngine';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

interface DungeonState {
  status: DungeonGameStatus;
  heroClass: HeroClass;
  floor: number;
  health: number;
  maxHealth: number;
  armor: number;
  attack: number;
  gold: number;
  grid: DungeonTile[][]; // 3 rows of 3 tiles
  playerLane: number; // 0, 1, 2
  logMessage: string;

  // Actions
  initGame: () => void;
  selectClass: (chosenClass: HeroClass) => void;
  stepToTile: (colIndex: number) => void;
  restartRun: () => void;
}

export const useDungeonStore = create<DungeonState>()((set, get) => ({
  status: 'class-select',
  heroClass: 'knight',
  floor: 1,
  health: 20,
  maxHealth: 20,
  armor: 3,
  attack: 4,
  gold: 0,
  grid: [],
  playerLane: 1,
  logMessage: 'Choose your hero class to descend into the dungeon.',

  initGame: () => {
    set({ status: 'class-select' });
  },

  selectClass: (chosenClass: HeroClass) => {
    sound.playButtonClick();
    let hp = 22;
    let atk = 4;
    let arm = 4;

    if (chosenClass === 'rogue') {
      hp = 18;
      atk = 6;
      arm = 2;
    } else if (chosenClass === 'mage') {
      hp = 16;
      atk = 7;
      arm = 1;
    }

    const row0 = generateDungeonRow(1, 0);
    const row1 = generateDungeonRow(1, 1);
    const row2 = generateDungeonRow(1, 2);

    set({
      status: 'playing',
      heroClass: chosenClass,
      floor: 1,
      health: hp,
      maxHealth: hp,
      armor: arm,
      attack: atk,
      gold: 0,
      grid: [row0, row1, row2],
      playerLane: 1,
      logMessage: `Floor 1: Choose an adjacent path to step forward.`,
    });
  },

  stepToTile: (colIndex: number) => {
    const { status, grid, playerLane, health, maxHealth, armor, attack, gold, floor } = get();
    if (status !== 'playing' || grid.length === 0) return;

    // Allowed to move only to adjacent lanes (|target - current| <= 1)
    if (Math.abs(colIndex - playerLane) > 1) {
      sound.playButtonClick();
      set({ logMessage: 'You can only move to an adjacent lane!' });
      return;
    }

    const targetTile = grid[2][colIndex];
    let newHealth = health;
    let newArmor = armor;
    let newAttack = attack;
    let newGold = gold;
    let newFloor = floor;
    let msg = '';

    if (targetTile.type === 'monster' || targetTile.type === 'boss') {
      sound.playSwordSlash();
      // Monster deals damage reduced by armor
      const damageTaken = Math.max(0, targetTile.value - newArmor);
      newHealth -= damageTaken;
      newArmor = Math.max(0, newArmor - Math.min(newArmor, targetTile.value));
      newGold += Math.round(targetTile.value * 2);
      msg = `Struck ${targetTile.name} for ${newAttack} damage! Took ${damageTaken} damage.`;
    } else if (targetTile.type === 'weapon') {
      sound.playButtonClick();
      newAttack = Math.max(newAttack, targetTile.value);
      msg = `Equipped ${targetTile.name} (+${targetTile.value} Attack)!`;
    } else if (targetTile.type === 'shield') {
      sound.playButtonClick();
      newArmor += targetTile.value;
      msg = `Donned ${targetTile.name} (+${targetTile.value} Armor)!`;
    } else if (targetTile.type === 'potion') {
      sound.playPotionDrink();
      newHealth = Math.min(maxHealth, newHealth + targetTile.value);
      msg = `Drank ${targetTile.name} (+${targetTile.value} HP)!`;
    } else if (targetTile.type === 'chest') {
      sound.playWinFanfare();
      newGold += targetTile.value;
      msg = `Opened ${targetTile.name} (+${targetTile.value} Gold)!`;
    }

    // Check Death
    if (newHealth <= 0) {
      sound.playBust();
      set({
        status: 'game-over',
        health: 0,
        logMessage: `Defeated on Floor ${floor} by ${targetTile.name}.`,
      });
      return;
    }

    // Check Victory (Floor 20 Boss beaten)
    if (floor >= 20 && targetTile.type === 'boss') {
      sound.playWinFanfare();
      useBankrollStore.getState().addChips(500);
      set({
        status: 'victory',
        health: newHealth,
        gold: newGold + 500,
        logMessage: `DUNGEON CONQUERED! Floor 20 Boss vanquished. Reward: +$500 Bankroll! 🏆`,
      });
      return;
    }

    // Advance Grid: shift rows down and generate fresh row at top
    newFloor = floor + 1;
    const newTopRow = generateDungeonRow(newFloor, 0);
    const updatedGrid = [newTopRow, grid[0], grid[1]];

    set({
      health: newHealth,
      armor: newArmor,
      attack: newAttack,
      gold: newGold,
      floor: newFloor,
      grid: updatedGrid,
      playerLane: colIndex,
      logMessage: msg,
    });
  },

  restartRun: () => {
    get().selectClass(get().heroClass);
  },
}));
