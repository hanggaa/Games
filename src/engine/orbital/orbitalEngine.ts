import { OrbitalLevel, Point, Planet } from '../../types/orbital.types';

export const ORBITAL_LEVELS: OrbitalLevel[] = [
  {
    levelNumber: 1,
    name: 'Orbital Insertion',
    startPos: { x: 50, y: 350 },
    targetPos: { x: 300, y: 80 },
    planets: [
      { x: 175, y: 220, radius: 24, mass: 900, name: 'Ares-1' },
    ],
    beacons: [
      { id: 'b1', x: 175, y: 130, collected: false },
      { id: 'b2', x: 240, y: 160, collected: false },
    ],
  },
  {
    levelNumber: 2,
    name: 'Binary Slingshot',
    startPos: { x: 50, y: 350 },
    targetPos: { x: 300, y: 350 },
    planets: [
      { x: 120, y: 180, radius: 20, mass: 750, name: 'Twin Alpha' },
      { x: 230, y: 180, radius: 20, mass: 750, name: 'Twin Beta' },
    ],
    beacons: [
      { id: 'b1', x: 175, y: 90, collected: false },
      { id: 'b2', x: 175, y: 270, collected: false },
    ],
  },
  {
    levelNumber: 3,
    name: 'Lagrange Corridor',
    startPos: { x: 40, y: 200 },
    targetPos: { x: 310, y: 200 },
    planets: [
      { x: 175, y: 100, radius: 26, mass: 1100, name: 'Jupiter Titan' },
      { x: 175, y: 300, radius: 26, mass: 1100, name: 'Saturn Core' },
    ],
    beacons: [
      { id: 'b1', x: 175, y: 200, collected: false },
      { id: 'b2', x: 110, y: 200, collected: false },
      { id: 'b3', x: 240, y: 200, collected: false },
    ],
  },
];

const G = 0.8;

export function calculateGravity(pos: Point, planets: Planet[]): Point {
  let ax = 0;
  let ay = 0;

  for (const p of planets) {
    const dx = p.x - pos.x;
    const dy = p.y - pos.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist > p.radius) {
      const force = (G * p.mass) / distSq;
      ax += (force * dx) / dist;
      ay += (force * dy) / dist;
    }
  }

  return { x: ax, y: ay };
}
