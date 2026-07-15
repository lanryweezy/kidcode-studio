// ============================================================
// AI Game Creator Service v1.0
// Natural language to game blocks conversion,
// AI suggestions, difficulty balancing, asset generation
// ============================================================

import { Tile } from '../types/game';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type GameGenre = 'platformer' | 'shooter' | 'puzzle' | 'rpg' | 'racing' | 'rhythm' | 'strategy';

export interface GameBlock {
  id: string;
  type: string;
  name: string;
  code: string;
  category: 'movement' | 'physics' | 'enemies' | 'items' | 'effects' | 'ui' | 'audio';
}

export interface GeneratedGame {
  id: string;
  title: string;
  description: string;
  genre: GameGenre;
  skillLevel: SkillLevel;
  blocks: GameBlock[];
  tiles: Tile[];
  settings: GameSettings;
  metadata: GameMetadata;
}

export interface GameSettings {
  gravity: number;
  playerSpeed: number;
  jumpForce: number;
  enemySpeed: number;
  enemyHealth: number;
  scoreMultiplier: number;
  timeLimit?: number;
  lives?: number;
}

export interface GameMetadata {
  difficulty: number;
  estimatedPlayTime: number;
  tags: string[];
  createdAt: number;
}

export interface AIAssetRequest {
  type: 'sprite' | 'sound' | 'music' | 'tile';
  description: string;
  style?: string;
  size?: number;
}

export interface AIAssetResult {
  id: string;
  type: string;
  data: string;
  format: string;
}

const GENRE_TEMPLATES: Record<GameGenre, Partial<GameSettings>> = {
  platformer: { gravity: 0.5, playerSpeed: 4, jumpForce: -12, enemySpeed: 2, enemyHealth: 1, scoreMultiplier: 1 },
  shooter: { gravity: 0.3, playerSpeed: 5, jumpForce: -8, enemySpeed: 3, enemyHealth: 2, scoreMultiplier: 1.5 },
  puzzle: { gravity: 0, playerSpeed: 3, jumpForce: 0, enemySpeed: 0, enemyHealth: 0, scoreMultiplier: 2 },
  rpg: { gravity: 0.5, playerSpeed: 3, jumpForce: -10, enemySpeed: 2, enemyHealth: 3, scoreMultiplier: 1 },
  racing: { gravity: 0.8, playerSpeed: 8, jumpForce: -6, enemySpeed: 6, enemyHealth: 0, scoreMultiplier: 1 },
  rhythm: { gravity: 0, playerSpeed: 5, jumpForce: 0, enemySpeed: 0, enemyHealth: 0, scoreMultiplier: 3 },
  strategy: { gravity: 0, playerSpeed: 2, jumpForce: 0, enemySpeed: 1, enemyHealth: 5, scoreMultiplier: 1 },
};

const SKILL_MODIFIERS: Record<SkillLevel, Partial<GameSettings>> = {
  beginner: { enemySpeed: 0.5, enemyHealth: 0.5, scoreMultiplier: 2, lives: 5 },
  intermediate: { enemySpeed: 1, enemyHealth: 1, scoreMultiplier: 1, lives: 3 },
  advanced: { enemySpeed: 1.5, enemyHealth: 2, scoreMultiplier: 0.5, lives: 1 },
};

const KEYWORD_TO_GENRE: Record<string, GameGenre> = {
  jump: 'platformer', jumping: 'platformer', run: 'platformer', running: 'platformer',
  climb: 'platformer', climbing: 'platformer', wall: 'platformer',
  shoot: 'shooter', shooting: 'shooter', gun: 'shooter', laser: 'shooter', bullet: 'shooter',
  match: 'puzzle', matching: 'puzzle', tile: 'puzzle', solve: 'puzzle', solving: 'puzzle', pattern: 'puzzle',
  quest: 'rpg', quests: 'rpg', sword: 'rpg', spell: 'rpg', spells: 'rpg', level: 'rpg', levels: 'rpg',
  car: 'racing', drive: 'racing', driving: 'racing', speed: 'racing', race: 'racing', racing: 'racing',
  music: 'rhythm', beat: 'rhythm', beats: 'rhythm', dance: 'rhythm', dancing: 'rhythm', note: 'rhythm',
  build: 'rhythm', building: 'strategy', plan: 'strategy', planning: 'strategy',
  resource: 'strategy', empire: 'strategy', strategy: 'strategy',
};

const KEYWORD_TO_BLOCK: Record<string, string[]> = {
  jump: ['move_player', 'apply_gravity', 'jump_ability'],
  jumping: ['move_player', 'apply_gravity', 'jump_ability'],
  shoot: ['shoot_projectile', 'enemy_spawner', 'collision_damage'],
  shooting: ['shoot_projectile', 'enemy_spawner', 'collision_damage'],
  collect: ['item_spawn', 'score_counter', 'inventory_add'],
  collecting: ['item_spawn', 'score_counter', 'inventory_add'],
  platform: ['tile_platform', 'moving_platform', 'breakable_platform'],
  platforms: ['tile_platform', 'moving_platform', 'breakable_platform'],
  enemy: ['enemy_spawner', 'enemy_patrol', 'boss_fight'],
  enemies: ['enemy_spawner', 'enemy_patrol', 'boss_fight'],
  fight: ['enemy_spawner', 'enemy_patrol', 'combat_system'],
  fighting: ['enemy_spawner', 'enemy_patrol', 'combat_system'],
  music: ['music_player', 'beat_sync', 'sound_effect'],
  timer: ['countdown_timer', 'score_timer', 'event_scheduler'],
  health: ['health_bar', 'damage_system', 'heal_item'],
  coin: ['coin_spawn', 'score_counter', 'coin_effect'],
  coins: ['coin_spawn', 'score_counter', 'coin_effect'],
  lava: ['lava_hazard', 'damage_zone', 'respawn_player'],
  water: ['water_physics', 'swim_ability', 'bubble_effect'],
  flying: ['fly_ability', 'anti_gravity', 'wind_force'],
  night: ['day_night_cycle', 'lighting_system', 'spawn_enemies'],
  boss: ['boss_fight', 'boss_phases', 'boss_arena'],
  portal: ['portal_teleport', 'dimension_shift', 'warp_zone'],
};

let gameCounter = 0;

export function parseDescription(description: string): {
  detectedGenre: GameGenre;
  keywords: string[];
  suggestedBlocks: string[];
} {
  const lower = description.toLowerCase();
  const words = lower.split(/\s+/);

  const genreCounts: Record<GameGenre, number> = {
    platformer: 0, shooter: 0, puzzle: 0, rpg: 0,
    racing: 0, rhythm: 0, strategy: 0,
  };

  const keywords: string[] = [];
  const suggestedBlocks = new Set<string>();

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');
    if (KEYWORD_TO_GENRE[clean]) {
      genreCounts[KEYWORD_TO_GENRE[clean]]++;
      keywords.push(clean);
    }
    if (KEYWORD_TO_BLOCK[clean]) {
      KEYWORD_TO_BLOCK[clean].forEach(b => suggestedBlocks.add(b));
      if (!keywords.includes(clean)) keywords.push(clean);
    }
  }

  let detectedGenre: GameGenre = 'platformer';
  let maxCount = 0;
  for (const [genre, count] of Object.entries(genreCounts)) {
    if (count > maxCount) {
      maxCount = count;
      detectedGenre = genre as GameGenre;
    }
  }

  if (keywords.length === 0) {
    keywords.push('default');
  }

  return { detectedGenre, keywords, suggestedBlocks: Array.from(suggestedBlocks) };
}

export function generateGameBlocks(description: string, genre: GameGenre): GameBlock[] {
  const { suggestedBlocks } = parseDescription(description);
  const blocks: GameBlock[] = [];

  blocks.push({
    id: `block_${++gameCounter}`,
    type: 'movement',
    name: 'Player Movement',
    code: generateMovementCode(genre),
    category: 'movement',
  });

  blocks.push({
    id: `block_${++gameCounter}`,
    type: 'physics',
    name: 'Physics System',
    code: generatePhysicsCode(genre),
    category: 'physics',
  });

  if (genre === 'platformer' || genre === 'rpg') {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'gravity',
      name: 'Gravity',
      code: 'player.vy += gravity; if (player.y > ground) { player.y = ground; player.vy = 0; }',
      category: 'physics',
    });
  }

  if (suggestedBlocks.includes('enemy_spawner')) {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'enemy',
      name: 'Enemy Spawner',
      code: generateEnemySpawnerCode(genre),
      category: 'enemies',
    });
  }

  if (suggestedBlocks.includes('shoot_projectile')) {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'shooting',
      name: 'Projectile System',
      code: generateShootingCode(),
      category: 'effects',
    });
  }

  if (suggestedBlocks.includes('coin_spawn') || suggestedBlocks.includes('item_spawn')) {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'items',
      name: 'Item Collector',
      code: generateItemCode(),
      category: 'items',
    });
  }

  if (suggestedBlocks.includes('music_player')) {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'audio',
      name: 'Music Player',
      code: 'playMusic("background"); onBeat(() => { spawnEffect(); });',
      category: 'audio',
    });
  }

  if (suggestedBlocks.includes('countdown_timer')) {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'timer',
      name: 'Game Timer',
      code: generateTimerCode(),
      category: 'ui',
    });
  }

  if (suggestedBlocks.includes('boss_fight')) {
    blocks.push({
      id: `block_${++gameCounter}`,
      type: 'boss',
      name: 'Boss Fight',
      code: generateBossCode(),
      category: 'enemies',
    });
  }

  return blocks;
}

function generateMovementCode(genre: GameGenre): string {
  const speed = GENRE_TEMPLATES[genre]?.playerSpeed || 4;
  return `onKeyDown("ArrowLeft", () => { player.x -= ${speed}; player.direction = "left"; });
onKeyDown("ArrowRight", () => { player.x += ${speed}; player.direction = "right"; });
onKeyPress("Space", () => { if (player.grounded) { player.vy = ${GENRE_TEMPLATES[genre]?.jumpForce || -12}; } });`;
}

function generatePhysicsCode(genre: GameGenre): string {
  const gravity = GENRE_TEMPLATES[genre]?.gravity || 0.5;
  return `player.vy += ${gravity};
player.x += player.vx;
player.y += player.vy;
player.grounded = checkCollision(player, ground);`;
}

function generateEnemySpawnerCode(genre: GameGenre): string {
  const speed = GENRE_TEMPLATES[genre]?.enemySpeed || 2;
  const hp = GENRE_TEMPLATES[genre]?.enemyHealth || 1;
  return `let spawnTimer = 0;
onUpdate(() => {
  spawnTimer++;
  if (spawnTimer > 120) {
    enemies.push({ x: rand(0, width), y: 0, hp: ${hp}, speed: ${speed} });
    spawnTimer = 0;
  }
});`;
}

function generateShootingCode(): string {
  return `onKeyPress("f", () => {
  projectiles.push({ x: player.x, y: player.y, vx: player.direction === "right" ? 8 : -8 });
});
onUpdate(() => {
  projectiles.forEach(p => p.x += p.vx);
  checkProjectileEnemyCollision();
});`;
}

function generateItemCode(): string {
  return `spawnItems(10, "coin");
onCollide("player", "coin", (c) => {
  destroy(c);
  score += 10;
  playSound("coin");
});`;
}

function generateTimerCode(): string {
  return `let timeLeft = 60;
onUpdate(() => {
  timeLeft -= dt();
  if (timeLeft <= 0) gameOver();
});`;
}

function generateBossCode(): string {
  return `const boss = { x: 400, y: 100, hp: 50, phase: 1 };
onUpdate(() => {
  if (boss.hp < 25) boss.phase = 2;
  if (boss.hp < 10) boss.phase = 3;
  bossAttack(boss.phase);
});`;
}

export function generateGameTiles(genre: GameGenre, width: number = 20, height: number = 12): Tile[] {
  const tiles: Tile[] = [];

  for (let x = 0; x < width; x++) {
    tiles.push({ x, y: height - 1, type: 'brick' });
  }

  if (genre === 'platformer' || genre === 'rpg') {
    for (let i = 0; i < 5; i++) {
      const px = Math.floor(Math.random() * (width - 4)) + 2;
      const py = Math.floor(Math.random() * (height - 4)) + 2;
      for (let j = 0; j < 3; j++) {
        tiles.push({ x: px + j, y: py, type: 'platform_wood' });
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    const cx = Math.floor(Math.random() * (width - 2)) + 1;
    const cy = Math.floor(Math.random() * (height - 3)) + 1;
    tiles.push({ x: cx, y: cy, type: 'coin' });
  }

  tiles.push({ x: 1, y: height - 2, type: 'spawn' });
  tiles.push({ x: width - 2, y: height - 2, type: 'flag' });

  return tiles;
}

export function generateGameSettings(genre: GameGenre, skillLevel: SkillLevel): GameSettings {
  const base = { ...GENRE_TEMPLATES[genre] } as GameSettings;
  const skill = SKILL_MODIFIERS[skillLevel];

  return {
    gravity: base.gravity,
    playerSpeed: base.playerSpeed,
    jumpForce: base.jumpForce,
    enemySpeed: (base.enemySpeed || 0) * (skill.enemySpeed || 1),
    enemyHealth: (base.enemyHealth || 0) * (skill.enemyHealth || 1),
    scoreMultiplier: (base.scoreMultiplier || 1) * (skill.scoreMultiplier || 1),
    timeLimit: skillLevel === 'beginner' ? 120 : skillLevel === 'intermediate' ? 90 : 60,
    lives: skill.lives || 3,
  };
}

export function suggestTemplate(description: string): GameGenre {
  const { detectedGenre } = parseDescription(description);
  return detectedGenre;
}

export function generateAIAsset(request: AIAssetRequest): AIAssetResult {
  const id = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  if (request.type === 'sprite') {
    return generateSpriteAsset(id, request);
  }
  if (request.type === 'sound') {
    return generateSoundAsset(id, request);
  }
  if (request.type === 'music') {
    return generateMusicAsset(id, request);
  }
  return { id, type: 'tile', data: request.description, format: 'tileset' };
}

function generateSpriteAsset(id: string, request: AIAssetRequest): AIAssetResult {
  const emojis: Record<string, string> = {
    hero: '🧑‍🚀', enemy: '👾', boss: '👹', coin: '🪙',
    sword: '⚔️', shield: '🛡️', heart: '❤️', star: '⭐',
  };
  const emoji = emojis[request.description.toLowerCase()] || '🎮';
  return { id, type: 'sprite', data: emoji, format: 'emoji' };
}

function generateSoundAsset(id: string, request: AIAssetRequest): AIAssetResult {
  return { id, type: 'sound', data: request.description, format: 'wav' };
}

function generateMusicAsset(id: string, request: AIAssetRequest): AIAssetResult {
  return { id, type: 'music', data: request.description, format: 'mp3' };
}

export function createGame(description: string, skillLevel: SkillLevel = 'beginner', genreOverride?: GameGenre): GeneratedGame {
  const { detectedGenre, keywords } = parseDescription(description);
  const genre = genreOverride || detectedGenre;
  const blocks = generateGameBlocks(description, genre);
  const tiles = generateGameTiles(genre);
  const settings = generateGameSettings(genre, skillLevel);

  return {
    id: `game_${Date.now()}_${++gameCounter}`,
    title: extractTitle(description),
    description,
    genre,
    skillLevel,
    blocks,
    tiles,
    settings,
    metadata: {
      difficulty: skillLevel === 'beginner' ? 1 : skillLevel === 'intermediate' ? 2 : 3,
      estimatedPlayTime: 300,
      tags: keywords.slice(0, 5),
      createdAt: Date.now(),
    },
  };
}

function extractTitle(description: string): string {
  const words = description.split(/\s+/).slice(0, 5);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function balanceDifficulty(game: GeneratedGame, playerPerformance: { winRate: number; avgTime: number }): GameSettings {
  const settings = { ...game.settings };

  if (playerPerformance.winRate > 0.8) {
    settings.enemySpeed *= 1.2;
    settings.enemyHealth *= 1.3;
    settings.scoreMultiplier *= 0.8;
  } else if (playerPerformance.winRate < 0.3) {
    settings.enemySpeed *= 0.8;
    settings.enemyHealth *= 0.7;
    settings.scoreMultiplier *= 1.3;
  }

  return settings;
}

export function getBlockCode(blocks: GameBlock[], blockType: string): string {
  const block = blocks.find(b => b.type === blockType);
  return block?.code || '';
}

export function exportGameAsCode(game: GeneratedGame): string {
  let code = `// ${game.title}\n// Generated by AI Game Creator\n\n`;
  code += `const settings = ${JSON.stringify(game.settings, null, 2)};\n\n`;

  game.blocks.forEach(block => {
    code += `// --- ${block.name} ---\n${block.code}\n\n`;
  });

  return code;
}
