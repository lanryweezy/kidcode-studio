import { SpriteState, GameEntity, InventoryItem, Tile, RPGQuest, LootDrop } from '../types';

/**
 * Shadow Realm RPG - A Pro-Level Dungeon Crawler
 * Built using ONLY existing KidCode Studio components
 * 
 * SHORTCOMINGS FOUND during building:
 * 1. No wave/level progression system - can't define difficulty scaling
 * 2. No XP/leveling system - characters can't gain levels
 * 3. No skill tree - no ability progression
 * 4. No status effects - no poison/burn/freeze/stun
 * 5. No armor/defense system - no damage reduction
 * 6. No dynamic enemy spawning - enemies are static
 * 7. No loot drop tables - enemies don't drop items by probability
 * 8. No minimap - can't see full level layout
 * 9. No screen/area transitions - can't move between rooms
 * 10. No crafting system - InventoryBuilder exists but isn't connected
 * 11. No quest tracking - no objective system
 * 12. No difficulty settings - no easy/medium/hard
 * 13. No save slot management UI
 * 14. No character stats panel (STR/DEF/SPD display)
 * 15. No shop/trading system
 */

// ─── Level 1: The Dark Forest ───
export const DARK_FOREST_LEVEL = (): Partial<SpriteState> => ({
  x: 80,
  y: 340,
  emoji: '🧙',
  scene: 'forest',
  weather: 'rain',
  health: 100,
  maxHealth: 100,
  score: 0,
  gravity: true,
  gravityForce: 0.6,
  restitution: 0.2,
  friction: 0.85,
  jumpForce: 16,
  canDoubleJump: false,
  canDash: true,
  dashCooldown: 0,
  lighting: {
    ambientColor: '#1a1a2e',
    ambientIntensity: 0.6,
  },
  variables: {
    playerLevel: 1,
    playerXP: 0,
    playerXPToLevel: 100,
    playerSTR: 10,
    playerDEF: 5,
    playerSPD: 8,
    gold: 50,
    currentRoom: 'forest_entrance',
    questsCompleted: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    gameTime: 0,
    difficulty: 'normal',
    // Status effect tracking
    poisonTimer: 0,
    burnTimer: 0,
    freezeTimer: 0,
    stunTimer: 0,
    shieldTimer: 0,
    speedBoostTimer: 0,
  },
  tilemap: [
    // Ground layer
    ...Array.from({ length: 25 }, (_, i) => ({ x: i * 40, y: 380, type: 'grass' as const })),
    ...Array.from({ length: 25 }, (_, i) => ({ x: i * 40, y: 420, type: 'dirt' as const })),
    // Underground
    ...Array.from({ length: 25 }, (_, i) => ({ x: i * 40, y: 460, type: 'stone' as const })),

    // ─── Platforming Section ───
    { x: 6, y: 7, type: 'brick' as const },
    { x: 7, y: 7, type: 'brick' as const },
    { x: 8, y: 7, type: 'brick' as const },

    { x: 10, y: 6, type: 'stone' as const },
    { x: 11, y: 6, type: 'stone' as const },

    { x: 14, y: 5, type: 'brick' as const },
    { x: 15, y: 5, type: 'brick' as const },
    { x: 16, y: 5, type: 'brick' as const },

    // Upper platforms
    { x: 18, y: 4, type: 'stone' as const },
    { x: 19, y: 4, type: 'stone' as const },
    { x: 20, y: 4, type: 'stone' as const },

    // ─── Hazards ───
    { x: 9, y: 9, type: 'spike' as const },
    { x: 13, y: 9, type: 'spike' as const },
    { x: 17, y: 9, type: 'lava' as const },
    { x: 18, y: 9, type: 'lava' as const },

    // ─── Collectibles ───
    { x: 7, y: 6, type: 'coin' as const },
    { x: 8, y: 6, type: 'coin' as const },
    { x: 11, y: 5, type: 'coin' as const },
    { x: 15, y: 4, type: 'coin' as const },
    { x: 19, y: 3, type: 'coin' as const },

    // Keys & Doors
    { x: 20, y: 3, type: 'key' as const },
    { x: 22, y: 9, type: 'door' as const },

    // Power-ups
    { x: 6, y: 8, type: 'spring' as const },
    { x: 12, y: 8, type: 'ladder' as const },
    { x: 12, y: 7, type: 'ladder' as const },
    { x: 12, y: 6, type: 'ladder' as const },

    // Crates (pushable)
    { x: 4, y: 9, type: 'crate' as const },
    { x: 5, y: 9, type: 'crate' as const },

    // Finish flag
    { x: 23, y: 9, type: 'flag' as const },
  ],
  enemies: [
    // Patrol enemies
    { id: 'slime1', type: 'enemy', emoji: '🟢', x: 300, y: 340, behavior: 'patrol', range: 120, initialX: 300, vx: 1, vy: 0 },
    { id: 'slime2', type: 'enemy', emoji: '🟢', x: 500, y: 340, behavior: 'patrol', range: 80, initialX: 500, vx: 0.8, vy: 0 },
    { id: 'bat1', type: 'enemy', emoji: '🦇', x: 400, y: 200, behavior: 'float_h', range: 100, initialX: 400, vx: 1.5, vy: 0 },
    { id: 'bat2', type: 'enemy', emoji: '🦇', x: 650, y: 150, behavior: 'float_h', range: 60, initialX: 650, vx: 2, vy: 0 },

    // Chase enemies (more dangerous)
    { id: 'skeleton1', type: 'enemy', emoji: '💀', x: 700, y: 340, behavior: 'chase', vx: 0, vy: 0 },
    { id: 'ghost1', type: 'enemy', emoji: '👻', x: 850, y: 250, behavior: 'chase', vx: 0, vy: 0 },

    // Ranged enemies
    { id: 'archer1', type: 'enemy', emoji: '🏹', x: 600, y: 180, behavior: 'patrol', range: 60, initialX: 600, vx: 0.5, vy: 0 },
  ],
  items: [
    // Coins scattered
    { id: 'coin1', type: 'item', emoji: '🪙', x: 150, y: 350 },
    { id: 'coin2', type: 'item', emoji: '🪙', x: 250, y: 350 },
    { id: 'coin3', type: 'item', emoji: '🪙', x: 350, y: 300 },
    { id: 'coin4', type: 'item', emoji: '🪙', x: 550, y: 250 },
    { id: 'coin5', type: 'item', emoji: '🪙', x: 750, y: 200 },

    // Health pickups
    { id: 'heal1', type: 'powerup', emoji: '❤️', x: 200, y: 340, subtype: 'shield' },
    { id: 'heal2', type: 'powerup', emoji: '🧪', x: 500, y: 150 },

    // Power-ups
    { id: 'speed1', type: 'powerup', emoji: '⚡', x: 400, y: 180, subtype: 'speed' },
    { id: 'shield1', type: 'powerup', emoji: '🛡️', x: 700, y: 140, subtype: 'shield' },

    // Key items
    { id: 'key1', type: 'item', emoji: '🔑', x: 850, y: 140 },
    { id: 'sword1', type: 'item', emoji: '⚔️', x: 350, y: 180 },
  ],
  inventory: [
    { id: 'starter_sword', name: 'Rusty Sword', icon: '⚔️', type: 'weapon', description: 'A worn blade. Better than nothing.', quantity: 1, maxStack: 1, effect: { type: 'damage', value: 5 } },
    { id: 'health_potion', name: 'Health Potion', icon: '🧪', type: 'consumable', description: 'Restores 30 HP.', quantity: 3, maxStack: 10, effect: { type: 'heal', value: 30 } },
    { id: 'bread', name: 'Bread', icon: '🍞', type: 'consumable', description: 'Restores 10 HP.', quantity: 5, maxStack: 20, effect: { type: 'heal', value: 10 } },
  ],
  maxInventorySize: 20,
  checkpoints: [
    { id: 'cp1', x: 80, y: 340, name: 'Forest Entrance', unlocked: true },
  ],
  musicVolume: 0.3,
});

// ─── Level 2: The Crystal Cavern ───
export const CRYSTAL_CAVERN_LEVEL = (): Partial<SpriteState> => ({
  x: 80,
  y: 340,
  emoji: '🧙',
  scene: 'cave',
  weather: 'none',
  health: 120,
  maxHealth: 120,
  score: 0,
  gravity: true,
  gravityForce: 0.5,
  restitution: 0.1,
  friction: 0.9,
  jumpForce: 14,
  lighting: {
    ambientColor: '#0f172a',
    ambientIntensity: 0.4,
  },
  variables: {
    playerLevel: 3,
    playerXP: 250,
    playerXPToLevel: 300,
    playerSTR: 15,
    playerDEF: 10,
    playerSPD: 10,
    gold: 150,
    currentRoom: 'crystal_entrance',
    questsCompleted: 2,
    enemiesDefeated: 25,
    bossesDefeated: 0,
    gameTime: 600,
    difficulty: 'normal',
  },
  tilemap: [
    // Cave floor
    ...Array.from({ length: 30 }, (_, i) => ({ x: i * 40, y: 380, type: 'stone' as const })),
    ...Array.from({ length: 30 }, (_, i) => ({ x: i * 40, y: 420, type: 'stone' as const })),
    // Cave ceiling
    ...Array.from({ length: 30 }, (_, i) => ({ x: i * 40, y: 0, type: 'stone' as const })),
    // Cave walls
    ...Array.from({ length: 10 }, (_, i) => ({ x: 0, y: i * 40, type: 'stone' as const })),
    ...Array.from({ length: 10 }, (_, i) => ({ x: 29 * 40, y: i * 40, type: 'stone' as const })),

    // Crystal platforms
    { x: 5, y: 7, type: 'stone' as const },
    { x: 6, y: 7, type: 'stone' as const },
    { x: 8, y: 6, type: 'stone' as const },
    { x: 9, y: 6, type: 'stone' as const },
    { x: 11, y: 5, type: 'stone' as const },
    { x: 12, y: 5, type: 'stone' as const },
    { x: 14, y: 4, type: 'stone' as const },
    { x: 15, y: 4, type: 'stone' as const },

    // Water hazards
    { x: 7, y: 9, type: 'water' as const },
    { x: 10, y: 9, type: 'water' as const },
    { x: 13, y: 9, type: 'water' as const },

    // Lava pits
    { x: 16, y: 9, type: 'lava' as const },
    { x: 17, y: 9, type: 'lava' as const },
    { x: 18, y: 9, type: 'lava' as const },

    // Coins
    { x: 5, y: 6, type: 'coin' as const },
    { x: 8, y: 5, type: 'coin' as const },
    { x: 11, y: 4, type: 'coin' as const },
    { x: 14, y: 3, type: 'coin' as const },

    // Key & Door
    { x: 15, y: 3, type: 'key' as const },
    { x: 25, y: 9, type: 'door' as const },

    // Springs
    { x: 4, y: 9, type: 'spring' as const },
    { x: 20, y: 9, type: 'spring' as const },

    // Finish
    { x: 27, y: 9, type: 'flag' as const },
  ],
  enemies: [
    { id: 'golem1', type: 'enemy', emoji: '🗿', x: 400, y: 340, behavior: 'patrol', range: 80, initialX: 400, vx: 0.5, vy: 0 },
    { id: 'golem2', type: 'enemy', emoji: '🗿', x: 700, y: 340, behavior: 'patrol', range: 60, initialX: 700, vx: 0.3, vy: 0 },
    { id: 'mage1', type: 'enemy', emoji: '🧙', x: 500, y: 180, behavior: 'patrol', range: 40, initialX: 500, vx: 0.3, vy: 0 },
    { id: 'phantom1', type: 'enemy', emoji: '👁️', x: 900, y: 200, behavior: 'chase', vx: 0, vy: 0 },
    { id: 'knight1', type: 'enemy', emoji: '⚔️', x: 1000, y: 340, behavior: 'chase', vx: 0, vy: 0 },
  ],
  items: [
    { id: 'coin_c1', type: 'item', emoji: '🪙', x: 200, y: 350 },
    { id: 'coin_c2', type: 'item', emoji: '🪙', x: 400, y: 300 },
    { id: 'coin_c3', type: 'item', emoji: '🪙', x: 600, y: 250 },
    { id: 'heal_c1', type: 'powerup', emoji: '❤️', x: 300, y: 200 },
    { id: 'shield_c1', type: 'powerup', emoji: '🛡️', x: 800, y: 150 },
    { id: 'key_c1', type: 'item', emoji: '🔑', x: 1000, y: 100 },
    { id: 'gem1', type: 'item', emoji: '💎', x: 900, y: 140 },
  ],
  inventory: [
    { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', type: 'weapon', description: 'A sturdy blade.', quantity: 1, maxStack: 1, effect: { type: 'damage', value: 12 } },
    { id: 'health_potion_l', name: 'Large Health Potion', icon: '🧪', type: 'consumable', description: 'Restores 60 HP.', quantity: 2, maxStack: 5, effect: { type: 'heal', value: 60 } },
    { id: 'shield_item', name: 'Wooden Shield', icon: '🛡️', type: 'weapon', description: 'Blocks 20% damage.', quantity: 1, maxStack: 1, effect: { type: 'shield', value: 20 } },
  ],
  maxInventorySize: 25,
  checkpoints: [
    { id: 'cp_c1', x: 80, y: 340, name: 'Cavern Entrance', unlocked: true },
    { id: 'cp_c2', x: 500, y: 340, name: 'Crystal Hall', unlocked: true },
  ],
});

// ─── Boss Level: The Dragon's Lair ───
export const DRAGON_LAIR_LEVEL = (): Partial<SpriteState> => ({
  x: 100,
  y: 340,
  emoji: '🧙',
  scene: 'volcano',
  weather: 'none',
  health: 150,
  maxHealth: 150,
  score: 0,
  gravity: true,
  gravityForce: 0.5,
  restitution: 0,
  friction: 0.85,
  jumpForce: 16,
  lighting: {
    ambientColor: '#7f1d1d',
    ambientIntensity: 0.7,
  },
  variables: {
    playerLevel: 5,
    playerXP: 500,
    playerXPToLevel: 600,
    playerSTR: 22,
    playerDEF: 15,
    playerSPD: 12,
    gold: 300,
    currentRoom: 'dragon_lair',
    questsCompleted: 5,
    enemiesDefeated: 50,
    bossesDefeated: 0,
    gameTime: 1800,
    difficulty: 'normal',
    bossPhase: 1,
    bossHP: 500,
    bossMaxHP: 500,
  },
  tilemap: [
    // Lava floor
    ...Array.from({ length: 25 }, (_, i) => ({ x: i * 40, y: 380, type: 'lava' as const })),
    // Safe platforms
    { x: 2, y: 9, type: 'stone' as const },
    { x: 3, y: 9, type: 'stone' as const },
    { x: 5, y: 8, type: 'stone' as const },
    { x: 6, y: 8, type: 'stone' as const },
    { x: 8, y: 7, type: 'stone' as const },
    { x: 9, y: 7, type: 'stone' as const },
    { x: 11, y: 6, type: 'stone' as const },
    { x: 12, y: 6, type: 'stone' as const },
    { x: 14, y: 7, type: 'stone' as const },
    { x: 15, y: 7, type: 'stone' as const },
    { x: 17, y: 8, type: 'stone' as const },
    { x: 18, y: 8, type: 'stone' as const },
    { x: 20, y: 9, type: 'stone' as const },
    { x: 21, y: 9, type: 'stone' as const },

    // Coins
    { x: 3, y: 8, type: 'coin' as const },
    { x: 6, y: 7, type: 'coin' as const },
    { x: 9, y: 6, type: 'coin' as const },
    { x: 12, y: 5, type: 'coin' as const },
    { x: 15, y: 6, type: 'coin' as const },
    { x: 18, y: 7, type: 'coin' as const },

    // Health pickups
    { x: 5, y: 7, type: 'spring' as const },
    { x: 14, y: 6, type: 'spring' as const },
  ],
  enemies: [
    // Dragon Boss
    { id: 'dragon_boss', type: 'enemy', emoji: '🐲', x: 800, y: 250, behavior: 'patrol', range: 200, initialX: 800, vx: 1, vy: 0 },
    // Minions (spawned by boss)
    { id: 'dragon_minion1', type: 'enemy', emoji: '🦇', x: 600, y: 150, behavior: 'float_h', vx: 0, vy: 1 },
    { id: 'dragon_minion2', type: 'enemy', emoji: '🦇', x: 700, y: 100, behavior: 'float_h', vx: 0, vy: 1.5 },
  ],
  items: [
    { id: 'coin_d1', type: 'item', emoji: '🪙', x: 150, y: 300 },
    { id: 'coin_d2', type: 'item', emoji: '🪙', x: 300, y: 250 },
    { id: 'heal_d1', type: 'powerup', emoji: '❤️', x: 250, y: 200 },
    { id: 'heal_d2', type: 'powerup', emoji: '🧪', x: 600, y: 180 },
    { id: 'legendary_sword', type: 'item', emoji: '⚔️', x: 900, y: 100 },
  ],
  inventory: [
    { id: 'steel_sword', name: 'Steel Sword', icon: '⚔️', type: 'weapon', description: 'A fine blade.', quantity: 1, maxStack: 1, effect: { type: 'damage', value: 18 } },
    { id: 'mega_potion', name: 'Mega Potion', icon: '🧪', type: 'consumable', description: 'Restores 100 HP.', quantity: 3, maxStack: 5, effect: { type: 'heal', value: 100 } },
    { id: 'dragon_shield', name: 'Dragon Shield', icon: '🛡️', type: 'weapon', description: 'Blocks 40% damage.', quantity: 1, maxStack: 1, effect: { type: 'shield', value: 40 } },
  ],
  maxInventorySize: 30,
  checkpoints: [
    { id: 'cp_d1', x: 100, y: 340, name: 'Lair Entrance', unlocked: true },
  ],
  activeBoss: {
    id: 'dragon_lord',
    name: 'Dragon Lord',
    emoji: '🐲',
    x: 800,
    y: 250,
    health: 500,
    maxHealth: 500,
    phase: 1,
    attackPattern: 'charge',
    isInvulnerable: false,
    attackCooldown: 0,
  },
  bossHealth: 500,
  bossMaxHealth: 500,
  bossPhase: 1,
});

// ─── Level Definitions ───
export interface LevelDefinition {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  requiredLevel: number;
  bgEmoji: string;
  createLevel: () => Partial<SpriteState>;
}

export const GAME_LEVELS: LevelDefinition[] = [
  {
    id: 'dark_forest',
    name: 'The Dark Forest',
    description: 'A mysterious forest shrouded in darkness. Beware of slimes and bats.',
    difficulty: 'easy',
    requiredLevel: 1,
    bgEmoji: '🌲',
    createLevel: DARK_FOREST_LEVEL,
  },
  {
    id: 'crystal_cavern',
    name: 'Crystal Cavern',
    description: 'Deep underground, crystalline formations light your path. Golems guard ancient treasures.',
    difficulty: 'medium',
    requiredLevel: 3,
    bgEmoji: '💎',
    createLevel: CRYSTAL_CAVERN_LEVEL,
  },
  {
    id: 'dragon_lair',
    name: "Dragon's Lair",
    description: 'The final challenge. Face the Dragon Lord in his volcanic domain.',
    difficulty: 'boss',
    requiredLevel: 5,
    bgEmoji: '🔥',
    createLevel: DRAGON_LAIR_LEVEL,
  },
];

// ─── Enemy Definitions for Spawning ───
export interface EnemySpawnConfig {
  type: string;
  emoji: string;
  hp: number;
  damage: number;
  speed: number;
  xpReward: number;
  behavior: 'patrol' | 'chase' | 'fly' | 'shoot' | 'teleport';
  dropChance: number;
  dropItem?: string;
}

export const ENEMY_SPAWN_TABLE: Record<string, EnemySpawnConfig[]> = {
  dark_forest: [
    { type: 'slime', emoji: '🟢', hp: 20, damage: 5, speed: 1, xpReward: 10, behavior: 'patrol', dropChance: 0.3, dropItem: 'health_potion' },
    { type: 'bat', emoji: '🦇', hp: 15, damage: 8, speed: 2, xpReward: 15, behavior: 'fly', dropChance: 0.2 },
    { type: 'skeleton', emoji: '💀', hp: 30, damage: 10, speed: 1.5, xpReward: 20, behavior: 'chase', dropChance: 0.25, dropItem: 'bone' },
  ],
  crystal_cavern: [
    { type: 'golem', emoji: '🗿', hp: 80, damage: 20, speed: 0.5, xpReward: 40, behavior: 'patrol', dropChance: 0.4, dropItem: 'gem' },
    { type: 'mage', emoji: '🧙', hp: 45, damage: 25, speed: 1, xpReward: 55, behavior: 'shoot', dropChance: 0.35, dropItem: 'scroll' },
    { type: 'phantom', emoji: '👁️', hp: 30, damage: 30, speed: 2, xpReward: 60, behavior: 'teleport', dropChance: 0.3 },
  ],
  dragon_lair: [
    { type: 'wyvern', emoji: '🐉', hp: 120, damage: 30, speed: 2, xpReward: 80, behavior: 'fly', dropChance: 0.5, dropItem: 'scale' },
    { type: 'knight', emoji: '⚔️', hp: 80, damage: 22, speed: 1.5, xpReward: 65, behavior: 'patrol', dropChance: 0.4, dropItem: 'armor' },
  ],
};

// ─── Item Drop Tables ───

export const LOOT_TABLES: Record<string, LootDrop[]> = {
  slime: [
    { itemId: 'health_potion', name: 'Health Potion', icon: '🧪', chance: 0.3, minQuantity: 1, maxQuantity: 1, type: 'consumable' },
    { itemId: 'coin', name: 'Gold Coin', icon: '🪙', chance: 0.5, minQuantity: 5, maxQuantity: 15, type: 'currency' },
  ],
  bat: [
    { itemId: 'wing', name: 'Bat Wing', icon: '🦇', chance: 0.2, minQuantity: 1, maxQuantity: 2, type: 'material' },
    { itemId: 'coin', name: 'Gold Coin', icon: '🪙', chance: 0.4, minQuantity: 3, maxQuantity: 10, type: 'currency' },
  ],
  skeleton: [
    { itemId: 'bone', name: 'Bone', icon: '🦴', chance: 0.3, minQuantity: 1, maxQuantity: 3, type: 'material' },
    { itemId: 'rusty_sword', name: 'Rusty Sword', icon: '⚔️', chance: 0.1, minQuantity: 1, maxQuantity: 1, type: 'weapon' },
    { itemId: 'coin', name: 'Gold Coin', icon: '🪙', chance: 0.6, minQuantity: 10, maxQuantity: 25, type: 'currency' },
  ],
  golem: [
    { itemId: 'gem', name: 'Crystal Gem', icon: '💎', chance: 0.25, minQuantity: 1, maxQuantity: 2, type: 'material' },
    { itemId: 'stone_shard', name: 'Stone Shard', icon: '🪨', chance: 0.4, minQuantity: 2, maxQuantity: 5, type: 'material' },
    { itemId: 'coin', name: 'Gold Coin', icon: '🪙', chance: 0.7, minQuantity: 20, maxQuantity: 50, type: 'currency' },
  ],
  mage: [
    { itemId: 'scroll', name: 'Magic Scroll', icon: '📜', chance: 0.2, minQuantity: 1, maxQuantity: 1, type: 'quest' },
    { itemId: 'mana_crystal', name: 'Mana Crystal', icon: '🔮', chance: 0.3, minQuantity: 1, maxQuantity: 3, type: 'material' },
    { itemId: 'coin', name: 'Gold Coin', icon: '🪙', chance: 0.5, minQuantity: 15, maxQuantity: 40, type: 'currency' },
  ],
  dragon: [
    { itemId: 'dragon_scale', name: 'Dragon Scale', icon: '🐉', chance: 0.5, minQuantity: 2, maxQuantity: 5, type: 'material' },
    { itemId: 'legendary_sword', name: 'Dragon Slayer', icon: '⚔️', chance: 0.1, minQuantity: 1, maxQuantity: 1, type: 'weapon' },
    { itemId: 'crown', name: 'Dragon Crown', icon: '👑', chance: 0.05, minQuantity: 1, maxQuantity: 1, type: 'quest' },
    { itemId: 'coin', name: 'Gold Coin', icon: '🪙', chance: 1.0, minQuantity: 100, maxQuantity: 500, type: 'currency' },
  ],
};

// ─── Quest Definitions ───
// Using RPGQuest from types.ts

export const GAME_QUESTS: RPGQuest[] = [
  {
    id: 'q_slay_slimes',
    name: 'Slime Slayer',
    description: 'Defeat 5 slimes in the Dark Forest.',
    objectives: [{ id: 'obj1', type: 'kill', target: 'slime', current: 0, required: 5, description: 'Defeat 5 slimes' }],
    xpReward: 50,
    goldReward: 25,
    requiredLevel: 1,
    isActive: false,
    isCompleted: false,
    isTurnedIn: false,
  },
  {
    id: 'q_collect_coins',
    name: 'Treasure Hunter',
    description: 'Collect 20 gold coins.',
    objectives: [{ id: 'obj2', type: 'collect', target: 'coin', current: 0, required: 20, description: 'Collect 20 gold coins' }],
    xpReward: 30,
    goldReward: 10,
    requiredLevel: 1,
    isActive: false,
    isCompleted: false,
    isTurnedIn: false,
  },
  {
    id: 'q_defeat_boss',
    name: 'Dragon Slayer',
    description: 'Defeat the Dragon Lord.',
    objectives: [{ id: 'obj3', type: 'kill', target: 'dragon', current: 0, required: 1, description: 'Defeat the Dragon Lord' }],
    xpReward: 500,
    goldReward: 200,
    requiredLevel: 5,
    isActive: false,
    isCompleted: false,
    isTurnedIn: false,
  },
];

// ─── Difficulty Multipliers ───
export const DIFFICULTY_MULTIPLIERS = {
  easy: { enemyHP: 0.7, enemyDamage: 0.7, enemySpeed: 0.8, xpMultiplier: 0.8, goldMultiplier: 0.8 },
  normal: { enemyHP: 1.0, enemyDamage: 1.0, enemySpeed: 1.0, xpMultiplier: 1.0, goldMultiplier: 1.0 },
  hard: { enemyHP: 1.5, enemyDamage: 1.5, enemySpeed: 1.3, xpMultiplier: 1.5, goldMultiplier: 1.5 },
  insane: { enemyHP: 2.0, enemyDamage: 2.0, enemySpeed: 1.5, xpMultiplier: 2.0, goldMultiplier: 2.0 },
};
