export type ShellType = 'live' | 'blank';

export type ItemType =
  | 'magnifier'
  | 'handsaw'
  | 'cigarette'
  | 'beer'
  | 'handcuffs'
  | 'inverter'
  | 'burner_phone';

export interface BuckshotItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
}

export type BuckshotPhase =
  | 'intro'
  | 'loading'
  | 'player-turn'
  | 'dealer-turn'
  | 'round-won'
  | 'game-over'
  | 'victory';

export interface RoundConfig {
  roundNumber: number;
  maxHealth: number;
  itemsPerLoad: number;
}
