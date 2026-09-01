export type HeroClass = 'knight' | 'rogue' | 'mage';

export type TileType = 'monster' | 'weapon' | 'shield' | 'potion' | 'chest' | 'trap' | 'boss';

export interface DungeonTile {
  id: string;
  type: TileType;
  name: string;
  value: number; // Attack for monsters/weapons, Armor for shields, Heal for potions, Gold for chests
  maxVal?: number;
  icon: string;
  description: string;
}

export type DungeonGameStatus = 'class-select' | 'playing' | 'game-over' | 'victory';
