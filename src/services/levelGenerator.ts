interface GeneratedTile {
  x: number; y: number;
  type: string; emoji: string;
}

interface GeneratedEnemy {
  id: string; x: number; y: number;
  emoji: string; behavior: string;
  hp: number; damage: number; speed: number;
}

interface GeneratedItem {
  id: string; x: number; y: number;
  emoji: string; type: string;
}

interface GeneratedLevel {
  tiles: GeneratedTile[];
  enemies: GeneratedEnemy[];
  items: GeneratedItem[];
  spawnX: number; spawnY: number;
  exitX: number; exitY: number;
  width: number; height: number;
}

interface LevelConfig {
  width: number;
  height: number;
  tileSize: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'insane';
  theme: 'grass' | 'dungeon' | 'space' | 'ice' | 'lava';
  enemyDensity: number;
  itemDensity: number;
  platformChance: number;
  seed?: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const THEME_TILES: Record<string, { ground: string; wall: string; hazard: string; decoration: string }> = {
  grass: { ground: '🟩', wall: '🧱', hazard: '🟥', decoration: '🌳' },
  dungeon: { ground: '⬛', wall: '🧱', hazard: '🟥', decoration: '💀' },
  space: { ground: '⬛', wall: '🪨', hazard: '☄️', decoration: '⭐' },
  ice: { ground: '🟦', wall: '🧊', hazard: '⬛', decoration: '❄️' },
  lava: { ground: '🟫', wall: '🧱', hazard: '🟥', decoration: '🔥' },
};

const ENEMY_TYPES: Record<string, { emoji: string; behaviors: string[] }[]> = {
  grass: [
    { emoji: '👾', behaviors: ['patrol', 'chase'] },
    { emoji: '🦇', behaviors: ['fly', 'chase'] },
    { emoji: '💀', behaviors: ['patrol', 'shoot'] },
  ],
  dungeon: [
    { emoji: '👻', behaviors: ['patrol', 'teleport'] },
    { emoji: '👺', behaviors: ['chase', 'shoot'] },
    { emoji: '💀', behaviors: ['patrol', 'chase'] },
  ],
  space: [
    { emoji: '👽', behaviors: ['fly', 'shoot'] },
    { emoji: '🤖', behaviors: ['patrol', 'shoot'] },
    { emoji: '🛸', behaviors: ['fly', 'teleport'] },
  ],
  ice: [
    { emoji: '🧊', behaviors: ['patrol', 'shield'] },
    { emoji: '❄️', behaviors: ['fly', 'shoot'] },
    { emoji: '🐺', behaviors: ['chase', 'patrol'] },
  ],
  lava: [
    { emoji: '🔥', behaviors: ['chase', 'explode'] },
    { emoji: '🐉', behaviors: ['fly', 'shoot'] },
    { emoji: '👺', behaviors: ['patrol', 'shoot'] },
  ],
};

const DIFFICULTY_MULT: Record<string, { hp: number; dmg: number; spd: number; enemies: number }> = {
  easy: { hp: 0.7, dmg: 0.7, spd: 0.8, enemies: 0.6 },
  normal: { hp: 1, dmg: 1, spd: 1, enemies: 1 },
  hard: { hp: 1.5, dmg: 1.3, spd: 1.2, enemies: 1.4 },
  insane: { hp: 2, dmg: 1.5, spd: 1.5, enemies: 2 },
};

export function generateLevel(config: LevelConfig): GeneratedLevel {
  const { width, height, tileSize, difficulty, theme, enemyDensity, itemDensity, platformChance } = config;
  const rand = seededRandom(config.seed || Date.now());
  const tiles: GeneratedTile[] = [];
  const enemies: GeneratedEnemy[] = [];
  const items: GeneratedItem[] = [];
  const themeTiles = THEME_TILES[theme] || THEME_TILES.grass;
  const diffMult = DIFFICULTY_MULT[difficulty] || DIFFICULTY_MULT.normal;
  const cols = Math.floor(width / tileSize);
  const rows = Math.floor(height / tileSize);

  // Generate ground floor
  for (let x = 0; x < cols; x++) {
    // Bottom row is always ground
    tiles.push({ x: x * tileSize, y: (rows - 1) * tileSize, type: 'ground', emoji: themeTiles.ground });
    // Second bottom row too
    tiles.push({ x: x * tileSize, y: (rows - 2) * tileSize, type: 'ground', emoji: themeTiles.ground });
  }

  // Generate walls on sides
  for (let y = 0; y < rows; y++) {
    tiles.push({ x: 0, y: y * tileSize, type: 'wall', emoji: themeTiles.wall });
    tiles.push({ x: (cols - 1) * tileSize, y: y * tileSize, type: 'wall', emoji: themeTiles.wall });
  }

  // Generate platforms
  const platformCount = Math.floor(cols * rows * platformChance * 0.01);
  for (let i = 0; i < platformCount; i++) {
    const px = 2 + Math.floor(rand() * (cols - 4));
    const py = 3 + Math.floor(rand() * (rows - 6));
    const platLen = 2 + Math.floor(rand() * 4);
    for (let j = 0; j < platLen; j++) {
      if (px + j < cols - 1) {
        tiles.push({ x: (px + j) * tileSize, y: py * tileSize, type: 'brick', emoji: themeTiles.wall });
      }
    }
  }

  // Generate hazards
  const hazardCount = Math.floor(cols * 0.3);
  for (let i = 0; i < hazardCount; i++) {
    const hx = 2 + Math.floor(rand() * (cols - 4));
    tiles.push({ x: hx * tileSize, y: (rows - 3) * tileSize, type: 'spike', emoji: themeTiles.hazard });
  }

  // Generate decorations
  const decoCount = Math.floor(cols * 0.2);
  for (let i = 0; i < decoCount; i++) {
    const dx = 2 + Math.floor(rand() * (cols - 4));
    tiles.push({ x: dx * tileSize, y: (rows - 3) * tileSize, type: 'decoration', emoji: themeTiles.decoration });
  }

  // Spawn point
  const spawnX = 3 * tileSize;
  const spawnY = (rows - 3) * tileSize;

  // Exit point
  const exitX = (cols - 3) * tileSize;
  const exitY = (rows - 3) * tileSize;
  tiles.push({ x: exitX, y: exitY, type: 'flag', emoji: '🚩' });

  // Generate enemies
  const enemyTypes = ENEMY_TYPES[theme] || ENEMY_TYPES.grass;
  const enemyCount = Math.floor(platformCount * enemyDensity * diffMult.enemies);
  for (let i = 0; i < enemyCount; i++) {
    const et = enemyTypes[Math.floor(rand() * enemyTypes.length)];
    const behavior = et.behaviors[Math.floor(rand() * et.behaviors.length)];
    const ex = (4 + Math.floor(rand() * (cols - 8))) * tileSize;
    const ey = (3 + Math.floor(rand() * (rows - 6))) * tileSize;
    enemies.push({
      id: `gen_enemy_${i}`,
      x: ex, y: ey,
      emoji: et.emoji,
      behavior,
      hp: Math.floor((20 + rand() * 30) * diffMult.hp),
      damage: Math.floor((5 + rand() * 10) * diffMult.dmg),
      speed: +(0.5 + rand() * 1.5 * diffMult.spd).toFixed(1),
    });
  }

  // Generate items
  const itemTypes = [
    { emoji: '🪙', type: 'coin' },
    { emoji: '❤️', type: 'health' },
    { emoji: '⭐', type: 'star' },
    { emoji: '🔑', type: 'key' },
  ];
  const itemCount = Math.floor(platformCount * itemDensity);
  for (let i = 0; i < itemCount; i++) {
    const it = itemTypes[Math.floor(rand() * itemTypes.length)];
    items.push({
      id: `gen_item_${i}`,
      x: (3 + Math.floor(rand() * (cols - 6))) * tileSize,
      y: (2 + Math.floor(rand() * (rows - 5))) * tileSize,
      emoji: it.emoji,
      type: it.type,
    });
  }

  return { tiles, enemies, items, spawnX, spawnY, exitX, exitY, width, height };
}
