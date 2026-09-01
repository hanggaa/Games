import { TurretType, Turret, Enemy } from '../../types/defense.types';

export const TURRET_CONFIGS: Record<TurretType, { name: string; cost: number; damage: number; range: number; fireRate: number; icon: string }> = {
  pulse: { name: 'Pulse Laser', cost: 50, damage: 15, range: 45, fireRate: 2.2, icon: '⚡' },
  cryo: { name: 'Cryo Emitter', cost: 75, damage: 6, range: 35, fireRate: 1.5, icon: '❄️' },
  arc: { name: 'Chain Arc', cost: 100, damage: 25, range: 40, fireRate: 1.2, icon: '🌐' },
  mortar: { name: 'Kinetic Mortar', cost: 125, damage: 45, range: 50, fireRate: 0.8, icon: '💥' },
};

export function spawnWaveEnemies(wave: number): Enemy[] {
  const enemies: Enemy[] = [];
  const count = 4 + wave * 2;

  for (let i = 0; i < count; i++) {
    const lane = Math.floor(Math.random() * 4);
    const isBoss = wave % 5 === 0 && i === count - 1;
    const isTank = !isBoss && Math.random() < 0.25;
    const isSpeeder = !isBoss && !isTank && Math.random() < 0.35;

    let type: Enemy['type'] = 'drone';
    let hp = 30 + wave * 12;
    let speed = 0.5 + Math.random() * 0.2;

    if (isBoss) {
      type = 'boss';
      hp = 250 + wave * 60;
      speed = 0.3;
    } else if (isTank) {
      type = 'tank';
      hp = 80 + wave * 25;
      speed = 0.35;
    } else if (isSpeeder) {
      type = 'speeder';
      hp = 20 + wave * 6;
      speed = 0.9;
    }

    enemies.push({
      id: `enemy-${wave}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      health: hp,
      maxHealth: hp,
      speed,
      y: -(i * 12 + Math.random() * 5),
      lane,
    });
  }

  return enemies;
}

export function createTurret(type: TurretType, row: number, col: number): Turret {
  const conf = TURRET_CONFIGS[type];
  return {
    id: `turret-${row}-${col}-${Date.now()}`,
    type,
    level: 1,
    damage: conf.damage,
    range: conf.range,
    fireRate: conf.fireRate,
    lastFired: 0,
    row,
    col,
  };
}
