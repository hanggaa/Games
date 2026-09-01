import { DungeonTile, TileType } from '../../types/dungeon.types';

export function generateDungeonRow(floor: number, rowIndex: number): DungeonTile[] {
  const isBossRow = floor % 5 === 0 && rowIndex === 0;

  if (isBossRow) {
    const bossNames = ['Minotaur Warden', 'Crypt Lich', 'Abyssal Dragon', 'Dungeon Overlord'];
    const bossName = bossNames[Math.min(bossNames.length - 1, Math.floor(floor / 5) - 1)];
    const bossPower = floor * 6 + 10;
    return [
      createTile('potion', 'Greater Elixir', floor * 4, '🧪', 'Restores health'),
      createTile('boss', bossName, bossPower, '👑', `Dungeon Boss (Power ${bossPower})`),
      createTile('chest', 'Gilded Chest', floor * 25, '📦', 'Valuable treasure'),
    ];
  }

  const tiles: DungeonTile[] = [];
  for (let col = 0; col < 3; col++) {
    const roll = Math.random();
    let type: TileType = 'monster';

    if (roll < 0.45) {
      type = 'monster';
    } else if (roll < 0.65) {
      type = 'shield';
    } else if (roll < 0.80) {
      type = 'weapon';
    } else if (roll < 0.92) {
      type = 'potion';
    } else {
      type = 'chest';
    }

    tiles.push(createRandomTileForType(type, floor));
  }
  return tiles;
}

function createRandomTileForType(type: TileType, floor: number): DungeonTile {
  if (type === 'monster') {
    const monsterNames = ['Cave Goblin', 'Skeleton Guard', 'Venom Spider', 'Dark Orc', 'Gargoyle', 'Shadow Fiend'];
    const name = monsterNames[Math.floor(Math.random() * monsterNames.length)];
    const power = Math.max(2, Math.round(floor * 1.8 + Math.random() * 3));
    return createTile('monster', name, power, '👹', `Monster (Attack ${power})`);
  } else if (type === 'weapon') {
    const weaponNames = ['Iron Dagger', 'Broadsword', 'Rune Blade', 'War Axe', 'Flamebrand'];
    const name = weaponNames[Math.floor(Math.random() * weaponNames.length)];
    const power = Math.round(floor * 1.5 + 2);
    return createTile('weapon', name, power, '🗡️', `Weapon (+${power} Attack)`);
  } else if (type === 'shield') {
    const shieldNames = ['Wooden Buckler', 'Kite Shield', 'Tower Shield', 'Aegis Barrier'];
    const name = shieldNames[Math.floor(Math.random() * shieldNames.length)];
    const armor = Math.round(floor * 1.2 + 2);
    return createTile('shield', name, armor, '🛡️', `Shield (+${armor} Armor)`);
  } else if (type === 'potion') {
    const heal = Math.round(floor * 2 + 5);
    return createTile('potion', 'Health Potion', heal, '🧪', `Restores ${heal} HP`);
  } else {
    const gold = Math.round(floor * 10 + 15);
    return createTile('chest', 'Treasure Cache', gold, '📦', `Yields ${gold} Gold`);
  }
}

function createTile(type: TileType, name: string, value: number, icon: string, description: string): DungeonTile {
  return {
    id: `tile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    name,
    value,
    icon,
    description,
  };
}
