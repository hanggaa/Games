export type TurretType = 'pulse' | 'cryo' | 'arc' | 'mortar';

export interface Turret {
  id: string;
  type: TurretType;
  level: number;
  damage: number;
  range: number;
  fireRate: number; // shots per sec
  lastFired: number;
  row: number;
  col: number;
}

export interface Enemy {
  id: string;
  type: 'drone' | 'speeder' | 'tank' | 'boss';
  health: number;
  maxHealth: number;
  speed: number;
  y: number; // 0 to 100 percentage down lane
  lane: number; // 0, 1, 2, 3
  isFrozen?: boolean;
}

export type DefensePhase = 'planning' | 'wave-active' | 'wave-cleared' | 'game-over';
