import { create } from 'zustand';
import { OrbitalLevel, OrbitalPhase, Point } from '../types/orbital.types';
import { ORBITAL_LEVELS, calculateGravity } from '../engine/orbital/orbitalEngine';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

interface OrbitalState {
  phase: OrbitalPhase;
  currentLevelIndex: number;
  level: OrbitalLevel;
  probePos: Point;
  probeVel: Point;
  trail: Point[];
  dragStart: Point | null;
  dragCurrent: Point | null;
  beaconsCollected: number;
  totalBeacons: number;

  // Actions
  initGame: () => void;
  startAiming: (pos: Point) => void;
  updateAiming: (pos: Point) => void;
  releaseLaunch: () => void;
  tickPhysics: () => void;
  resetCurrentLevel: () => void;
  nextLevel: () => void;
}

export const useOrbitalStore = create<OrbitalState>()((set, get) => ({
  phase: 'aiming',
  currentLevelIndex: 0,
  level: ORBITAL_LEVELS[0],
  probePos: ORBITAL_LEVELS[0].startPos,
  probeVel: { x: 0, y: 0 },
  trail: [],
  dragStart: null,
  dragCurrent: null,
  beaconsCollected: 0,
  totalBeacons: ORBITAL_LEVELS[0].beacons.length,

  initGame: () => {
    const lvl = ORBITAL_LEVELS[0];
    set({
      phase: 'aiming',
      currentLevelIndex: 0,
      level: lvl,
      probePos: { ...lvl.startPos },
      probeVel: { x: 0, y: 0 },
      trail: [],
      dragStart: null,
      dragCurrent: null,
      beaconsCollected: 0,
      totalBeacons: lvl.beacons.length,
    });
  },

  startAiming: (pos: Point) => {
    const { phase } = get();
    if (phase !== 'aiming') return;
    set({ dragStart: pos, dragCurrent: pos });
  },

  updateAiming: (pos: Point) => {
    const { phase, dragStart } = get();
    if (phase !== 'aiming' || !dragStart) return;
    set({ dragCurrent: pos });
  },

  releaseLaunch: () => {
    const { dragStart, dragCurrent, phase } = get();
    if (phase !== 'aiming' || !dragStart || !dragCurrent) return;

    sound.playOrbitalThruster();
    const vx = (dragStart.x - dragCurrent.x) * 0.08;
    const vy = (dragStart.y - dragCurrent.y) * 0.08;

    set({
      phase: 'in-flight',
      probeVel: { x: vx, y: vy },
      dragStart: null,
      dragCurrent: null,
    });
  },

  tickPhysics: () => {
    const { phase, probePos, probeVel, level, trail, beaconsCollected } = get();
    if (phase !== 'in-flight') return;

    const gravity = calculateGravity(probePos, level.planets);
    const newVx = probeVel.x + gravity.x;
    const newVy = probeVel.y + gravity.y;

    const newX = probePos.x + newVx;
    const newY = probePos.y + newVy;
    const newPos = { x: newX, y: newY };

    // Check collisions with planets (Crash)
    for (const p of level.planets) {
      const dx = p.x - newX;
      const dy = p.y - newY;
      if (Math.sqrt(dx * dx + dy * dy) <= p.radius) {
        sound.playExplosion();
        set({ phase: 'crashed' });
        return;
      }
    }

    // Check boundary out of bounds
    if (newX < -20 || newX > 370 || newY < -20 || newY > 440) {
      sound.playBust();
      set({ phase: 'crashed' });
      return;
    }

    // Check beacon collection
    let collectedCount = beaconsCollected;
    const updatedBeacons = level.beacons.map((b) => {
      if (!b.collected) {
        const dx = b.x - newX;
        const dy = b.y - newY;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          sound.playHackerBeep(true);
          collectedCount += 1;
          return { ...b, collected: true };
        }
      }
      return b;
    });

    // Check Warp Gate arrival (Win)
    const targetDx = level.targetPos.x - newX;
    const targetDy = level.targetPos.y - newY;
    if (Math.sqrt(targetDx * targetDx + targetDy * targetDy) < 22) {
      sound.playWinFanfare();
      useBankrollStore.getState().addChips(150);
      set({
        phase: 'level-cleared',
        beaconsCollected: collectedCount,
        level: { ...level, beacons: updatedBeacons },
      });
      return;
    }

    // Append to trail
    const newTrail = trail.length > 50 ? [...trail.slice(1), newPos] : [...trail, newPos];

    set({
      probePos: newPos,
      probeVel: { x: newVx, y: newVy },
      trail: newTrail,
      beaconsCollected: collectedCount,
      level: { ...level, beacons: updatedBeacons },
    });
  },

  resetCurrentLevel: () => {
    const { currentLevelIndex } = get();
    const lvl = ORBITAL_LEVELS[currentLevelIndex];
    set({
      phase: 'aiming',
      level: { ...lvl, beacons: lvl.beacons.map((b) => ({ ...b, collected: false })) },
      probePos: { ...lvl.startPos },
      probeVel: { x: 0, y: 0 },
      trail: [],
      dragStart: null,
      dragCurrent: null,
      beaconsCollected: 0,
    });
  },

  nextLevel: () => {
    const { currentLevelIndex } = get();
    const nextIdx = (currentLevelIndex + 1) % ORBITAL_LEVELS.length;
    const lvl = ORBITAL_LEVELS[nextIdx];

    set({
      phase: 'aiming',
      currentLevelIndex: nextIdx,
      level: { ...lvl, beacons: lvl.beacons.map((b) => ({ ...b, collected: false })) },
      probePos: { ...lvl.startPos },
      probeVel: { x: 0, y: 0 },
      trail: [],
      dragStart: null,
      dragCurrent: null,
      beaconsCollected: 0,
      totalBeacons: lvl.beacons.length,
    });
  },
}));
