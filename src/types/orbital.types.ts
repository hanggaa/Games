export interface Point {
  x: number;
  y: number;
}

export interface Planet {
  x: number;
  y: number;
  radius: number;
  mass: number;
  name: string;
}

export interface Beacon {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface OrbitalLevel {
  levelNumber: number;
  name: string;
  startPos: Point;
  targetPos: Point;
  planets: Planet[];
  beacons: Beacon[];
}

export type OrbitalPhase = 'aiming' | 'in-flight' | 'level-cleared' | 'crashed';
