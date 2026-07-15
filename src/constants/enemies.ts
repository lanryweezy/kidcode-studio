export interface EnemyType {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  damage: number;
  speed: number;
  behavior: 'patrol' | 'chase' | 'fly' | 'shoot' | 'explode' | 'teleport' | 'shield' | 'summon';
  description: string;
  weakness?: string;
  drops?: string;
  xpReward: number;
}

export const ENEMY_TYPES: EnemyType[] = [
  // === BASIC ENEMIES ===
  {
    id: 'slime',
    name: 'Slime',
    emoji: '🟢',
    hp: 20,
    damage: 5,
    speed: 1,
    behavior: 'patrol',
    description: 'Bounces back and forth. Easy target.',
    weakness: 'sword',
    drops: 'coin',
    xpReward: 10,
  },
  {
    id: 'bat',
    name: 'Bat',
    emoji: '🦇',
    hp: 15,
    damage: 8,
    speed: 2,
    behavior: 'fly',
    description: 'Flies in random patterns. Hard to hit.',
    weakness: 'ranged',
    drops: 'coin',
    xpReward: 15,
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    emoji: '💀',
    hp: 30,
    damage: 10,
    speed: 1.5,
    behavior: 'chase',
    description: 'Chases you relentlessly.',
    weakness: 'fire',
    drops: 'bone',
    xpReward: 20,
  },

  // === MEDIUM ENEMIES ===
  {
    id: 'goblin',
    name: 'Goblin',
    emoji: '👺',
    hp: 40,
    damage: 12,
    speed: 2.5,
    behavior: 'patrol',
    description: 'Fast and sneaky. Attacks in groups.',
    weakness: 'lightning',
    drops: 'coin',
    xpReward: 25,
  },
  {
    id: 'ghost',
    name: 'Ghost',
    emoji: '👻',
    hp: 25,
    damage: 15,
    speed: 1.5,
    behavior: 'teleport',
    description: 'Phases through walls. Teleports randomly.',
    weakness: 'holy',
    drops: 'ether',
    xpReward: 30,
  },
  {
    id: 'golem',
    name: 'Stone Golem',
    emoji: '🗿',
    hp: 100,
    damage: 20,
    speed: 0.5,
    behavior: 'patrol',
    description: 'Slow but extremely tough. High defense.',
    weakness: 'pickaxe',
    drops: 'gem',
    xpReward: 40,
  },
  {
    id: 'archer',
    name: 'Dark Archer',
    emoji: '🏹',
    hp: 35,
    damage: 15,
    speed: 1,
    behavior: 'shoot',
    description: 'Shoots arrows from a distance.',
    weakness: 'shield',
    drops: 'arrow',
    xpReward: 35,
  },

  // === TOUGH ENEMIES ===
  {
    id: 'werewolf',
    name: 'Werewolf',
    emoji: '🐺',
    hp: 60,
    damage: 18,
    speed: 3,
    behavior: 'chase',
    description: 'Fast chase. Gets faster at low HP.',
    weakness: 'silver',
    drops: 'pelt',
    xpReward: 50,
  },
  {
    id: 'mage',
    name: 'Dark Mage',
    emoji: '🧙',
    hp: 45,
    damage: 25,
    speed: 1,
    behavior: 'shoot',
    description: 'Casts homing magic missiles.',
    weakness: 'silence',
    drops: 'scroll',
    xpReward: 55,
  },
  {
    id: 'mimic',
    name: 'Mimic',
    emoji: '📦',
    hp: 50,
    damage: 20,
    speed: 0,
    behavior: 'explode',
    description: 'Looks like a chest. Bites when you get close.',
    weakness: 'ranged',
    drops: 'treasure',
    xpReward: 45,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    emoji: '👁️',
    hp: 30,
    damage: 30,
    speed: 2,
    behavior: 'teleport',
    description: 'Appears behind you. High damage.',
    weakness: 'light',
    drops: 'eye',
    xpReward: 60,
  },

  // === ELITE ENEMIES ===
  {
    id: 'knight',
    name: 'Dark Knight',
    emoji: '⚔️',
    hp: 80,
    damage: 22,
    speed: 1.5,
    behavior: 'shield',
    description: 'Blocks attacks with shield. Must flank.',
    weakness: 'backstab',
    drops: 'armor',
    xpReward: 65,
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    emoji: '☠️',
    hp: 55,
    damage: 20,
    speed: 1,
    behavior: 'summon',
    description: 'Summons skeleton minions.',
    weakness: 'fire',
    drops: 'skull',
    xpReward: 70,
  },
  {
    id: 'wyvern',
    name: 'Wyvern',
    emoji: '🐉',
    hp: 120,
    damage: 30,
    speed: 2,
    behavior: 'fly',
    description: 'Breathes fire from above.',
    weakness: 'ice',
    drops: 'scale',
    xpReward: 80,
  },

  // === BOSS-TIER ENEMIES ===
  {
    id: 'dragon',
    name: 'Dragon Lord',
    emoji: '🐲',
    hp: 200,
    damage: 40,
    speed: 1.5,
    behavior: 'shoot',
    description: 'Final boss. Multiple attack phases.',
    weakness: 'legendary_sword',
    drops: 'crown',
    xpReward: 200,
  },
  {
    id: 'demon',
    name: 'Demon King',
    emoji: '👹',
    hp: 250,
    damage: 50,
    speed: 2,
    behavior: 'teleport',
    description: 'Teleports and summons. Ultimate challenge.',
    weakness: 'holy_water',
    drops: 'trident',
    xpReward: 250,
  },
];

export const getEnemyById = (id: string): EnemyType | undefined => {
  return ENEMY_TYPES.find(e => e.id === id);
};

export const getEnemiesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard' | 'boss'): EnemyType[] => {
  switch (difficulty) {
    case 'easy': return ENEMY_TYPES.filter(e => e.hp <= 30);
    case 'medium': return ENEMY_TYPES.filter(e => e.hp > 30 && e.hp <= 60);
    case 'hard': return ENEMY_TYPES.filter(e => e.hp > 60 && e.hp <= 120);
    case 'boss': return ENEMY_TYPES.filter(e => e.hp > 120);
  }
};
