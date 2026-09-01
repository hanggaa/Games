import { ShellType, ItemType, BuckshotItem, RoundConfig } from '../../types/buckshot.types';

export const ROUND_CONFIGS: Record<number, RoundConfig> = {
  1: { roundNumber: 1, maxHealth: 3, itemsPerLoad: 1 },
  2: { roundNumber: 2, maxHealth: 4, itemsPerLoad: 2 },
  3: { roundNumber: 3, maxHealth: 5, itemsPerLoad: 3 },
};

export const ITEM_CATALOG: Record<ItemType, Omit<BuckshotItem, 'id'>> = {
  magnifier: {
    type: 'magnifier',
    name: 'Magnifying Glass',
    description: 'Inspect the currently loaded shell in the chamber.',
    icon: '🔍',
  },
  handsaw: {
    type: 'handsaw',
    name: 'Handsaw',
    description: 'Saw off barrel. Next live shot deals 2 damage.',
    icon: '🪚',
  },
  cigarette: {
    type: 'cigarette',
    name: 'Cigarette',
    description: 'Regain 1 charge of health.',
    icon: '🚬',
  },
  beer: {
    type: 'beer',
    name: 'Beer Can',
    description: 'Racks the slide and ejects the current shell.',
    icon: '🍺',
  },
  handcuffs: {
    type: 'handcuffs',
    name: 'Handcuffs',
    description: 'Restrains opponent. They skip their next turn.',
    icon: '⛓️',
  },
  inverter: {
    type: 'inverter',
    name: 'Inverter',
    description: 'Reverses the current shell: Live becomes Blank, Blank becomes Live.',
    icon: '🔄',
  },
  burner_phone: {
    type: 'burner_phone',
    name: 'Burner Phone',
    description: 'Reveals the exact shell type at a random position in the magazine.',
    icon: '📱',
  },
};

export function createRandomItem(): BuckshotItem {
  const types: ItemType[] = ['magnifier', 'handsaw', 'cigarette', 'beer', 'handcuffs', 'inverter', 'burner_phone'];
  const chosenType = types[Math.floor(Math.random() * types.length)];
  const info = ITEM_CATALOG[chosenType];
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...info,
  };
}

export function generateMagazine(roundNumber: number): ShellType[] {
  let liveCount = 2;
  let blankCount = 2;

  if (roundNumber === 1) {
    const presets = [
      { live: 1, blank: 2 },
      { live: 2, blank: 1 },
      { live: 2, blank: 2 },
    ];
    const picked = presets[Math.floor(Math.random() * presets.length)];
    liveCount = picked.live;
    blankCount = picked.blank;
  } else if (roundNumber === 2) {
    const presets = [
      { live: 3, blank: 2 },
      { live: 2, blank: 3 },
      { live: 3, blank: 3 },
      { live: 4, blank: 2 },
    ];
    const picked = presets[Math.floor(Math.random() * presets.length)];
    liveCount = picked.live;
    blankCount = picked.blank;
  } else {
    const presets = [
      { live: 4, blank: 3 },
      { live: 3, blank: 4 },
      { live: 4, blank: 4 },
      { live: 5, blank: 3 },
    ];
    const picked = presets[Math.floor(Math.random() * presets.length)];
    liveCount = picked.live;
    blankCount = picked.blank;
  }

  const shells: ShellType[] = [
    ...Array<ShellType>(liveCount).fill('live'),
    ...Array<ShellType>(blankCount).fill('blank'),
  ];

  // Cryptographically secure Fisher-Yates
  const array = new Uint32Array(shells.length);
  window.crypto.getRandomValues(array);
  for (let i = shells.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [shells[i], shells[j]] = [shells[j], shells[i]];
  }

  return shells;
}
