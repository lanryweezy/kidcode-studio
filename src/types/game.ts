import { AppMode } from './enums';
import { CommandType } from './commandTypes';

export interface GameEntity {
  id: string;
  x: number;
  y: number;
  z?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  width?: number;
  height?: number;
  depth?: number;
  emoji?: string;
  modelUrl?: string; // For 3D GLTF
  animations?: Record<string, number[]>;
  currentAnimation?: string;
  type: 'enemy' | 'item' | 'projectile' | 'platform' | 'clone' | 'powerup' | 'object3d';
  vx?: number;
  vy?: number;
  vz?: number;
  color?: string;
  lifeTime?: number;
  physicsType?: 'static' | 'dynamic' | 'bouncy'; // Physics 2.0
  restitution?: number; // Bounciness
  friction?: number; // Surface friction
  // AI/Behavior
  initialX?: number;
  initialY?: number;
  initialZ?: number;
  range?: number;
  behavior?: 'patrol' | 'chase' | 'float_h' | 'float_v' | 'orbit' | 'teammate';
  subtype?: 'speed' | 'shield' | 'ghost'; // for powerups
}

export interface Tile {
  x: number;
  y: number;
  type: 'brick' | 'coin' | 'spike' | 'flag' | 'water' | 'grass' | 'dirt' | 'stone' | 'lava' | 'crate' | 'ladder' | 'spring' | 'key' | 'door' | 'spawn' | 'field_grass' | 'court_wood' | 'net' | 'goal' | 'hoop' | 'tee' | 'bunker' | 'mat' | 'ring' | 'ramp' | 'rail' | 'wave' | 'track' | 'lane' | 'pitch_grass' | 'arena_floor' | 'stone_floor' | 'metal_floor' | 'lava_pool' | 'trap' | 'teleporter' | 'path' | 'bridge' | 'door_locked' | 'chest' | 'sign' | 'npc_spot' | 'crate_cover' | 'sandbag' | 'barrel' | 'barricade' | 'wall_metal' | 'tree' | 'rock' | 'bush' | 'water_source' | 'campfire' | 'shelter_wall' | 'puzzle_blue' | 'puzzle_red' | 'puzzle_green' | 'puzzle_yellow' | 'puzzle_purple' | 'puzzle_orange' | 'race_road' | 'race_grass' | 'race_sand' | 'race_water' | 'race_boost' | 'race_finish' | 'race_barrier' | 'checkered' | 'platform_wood' | 'platform_stone' | 'platform_metal' | 'platform_cloud' | 'platform_ice' | 'spike_up' | 'spike_down' | 'moving_platform' | 'conveyor_right' | 'conveyor_left' | 'bounce_pad' | 'checkpoint_tile' | 'portal_tile' | 'vine_tile' | 'ice_floor' | 'sand_floor';
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
  rotation?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  vy: number;
}

export interface SpriteState {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scaleX?: number;
  scaleY?: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  emoji: string;
  texture: string | null;
  frames: string[]; // Animation Frames
  animations: Record<string, number[]>; // Named animation sequences
  currentAnimation: string | null;
  animationSpeed: number; // FPS-like
  speech: string | null;
  scene?: string;
  weather: 'none' | 'rain' | 'snow';
  score: number;
  keys: number; // Inventory
  health: number;
  maxHealth: number;
  variables: Record<string, any>;

  is3D: boolean;
  cameraMode: 'first_person' | 'third_person' | 'top_down';
  skyboxUrl?: string;

  // Powerups (active duration)
  powerups: {
    speed?: number; // Frames remaining
    shield?: number;
    ghost?: number;
  };

  // Physics & Entities
  vy: number;
  vx: number;
  vz: number;
  opacity: number;
  scale: number;
  gravity: boolean;
  gravityForce: number;
  jumpForce: number;
  isJumping: boolean;
  canDoubleJump: boolean;
  restitution?: number; // Bounciness
  friction?: number; // Surface friction
  canDash: boolean;
  dashCooldown: number;
  projectiles: GameEntity[];
  enemies: GameEntity[];
  items: GameEntity[];
  platforms: GameEntity[];
  clones: GameEntity[];
  cameraFollow: boolean;
  cameraConstraints?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
  };
  lighting?: {
    ambientColor?: string;
    ambientIntensity?: number;
    directionalColor?: string;
    directionalIntensity?: number;
    directionalPosition?: { x: number, y: number, z: number };
  };

  // Visual Effects
  effectTrigger?: { type: 'explosion' | 'sparkle' | 'poof', x: number, y: number, z?: number, color?: string };
  particles: ParticleEffect[];
  floatingTexts: FloatingText[];

  // Level Data
  tilemap: Tile[];
  worldPrompt?: string;
  worldSeed?: number;
  objects3d: GameEntity[];

  // === ENHANCED GAME FEATURES ===

  // Inventory System
  inventory: InventoryItem[];
  maxInventorySize: number;
  equippedItem?: InventoryItem;

  // Dialogue System
  activeDialogue?: DialogueNode;
  dialogueHistory: string[];
  isDialogueActive: boolean;

  // Music & Audio
  backgroundMusic?: string;
  musicVolume: number;
  ambientSound?: string;

  // Checkpoints
  checkpoints: Checkpoint[];
  lastCheckpoint?: Checkpoint;

  // Cutscenes
  isCutsceneActive: boolean;
  screenShake: number;
  screenFreeze: number;
  timeScale: number;
  fadeAlpha: number;

  // Boss Battles
  activeBoss?: BossState;
  bossHealth: number;
  bossMaxHealth: number;
  bossPhase: number;
}

// === NEW INTERFACES FOR ENHANCED FEATURES ===

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'key' | 'material' | 'quest';
  quantity: number;
  maxStack: number;
  effect?: {
    type: 'heal' | 'damage' | 'speed' | 'shield' | 'teleport';
    value: number;
    duration?: number;
  };
  craftable?: boolean;
  recipe?: { itemId: string; quantity: number }[];
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerEmoji: string;
  text: string;
  choices?: DialogueChoice[];
  nextId?: string;
  onChoose?: { itemId?: string; condition?: string };
}

export interface DialogueChoice {
  text: string;
  nextId: string;
  condition?: string; // e.g., "hasItem:key"
  effect?: { type: string; value: string | number | boolean };
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  name: string;
  unlocked: boolean;
}

export interface BossState {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  phase: number;
  attackPattern: string;
  isInvulnerable: boolean;
  attackCooldown: number;
}

// === RPG SYSTEM TYPES (New in Cycle 2) ===

export type StatusEffectType = 'poison' | 'burn' | 'freeze' | 'stun' | 'shield' | 'speed' | 'regen' | 'blind';

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number;
  maxDuration: number;
  value: number; // damage per tick, or shield/speed amount
  source?: string; // What caused this effect
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'insane';

export interface DifficultyMultipliers {
  enemyHP: number;
  enemyDamage: number;
  enemySpeed: number;
  xpMultiplier: number;
  goldMultiplier: number;
}

export interface LootDrop {
  itemId: string;
  name: string;
  icon: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'currency';
}

export interface EnemyLootTable {
  enemyType: string;
  drops: LootDrop[];
  guaranteedDrops?: LootDrop[];
}

export interface WaveConfig {
  waveNumber: number;
  enemies: { type: string; count: number; spawnDelay: number; spawnArea?: { minX: number; maxX: number; minY: number; maxY: number } }[];
  bossWave: boolean;
  waveDelay?: number; // Delay before next wave
}

export interface RPGQuestObjective {
  id: string;
  type: 'kill' | 'collect' | 'reach' | 'survive' | 'craft' | 'talk';
  target: string;
  current: number;
  required: number;
  description: string;
}

export interface RPGQuest {
  id: string;
  name: string;
  description: string;
  objectives: RPGQuestObjective[];
  xpReward: number;
  goldReward: number;
  itemRewards?: { itemId: string; quantity: number }[];
  requiredLevel: number;
  isActive: boolean;
  isCompleted: boolean;
  isTurnedIn: boolean;
}

export interface CharacterStats {
  level: number;
  xp: number;
  xpToLevel: number;
  maxHP: number;
  strength: number;
  defense: number;
  speed: number;
  criticalChance: number; // 0-100%
  criticalDamage: number; // multiplier
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material';
  stats?: Partial<CharacterStats>;
  effect?: { type: string; value: number };
}

export interface MinimapConfig {
  enabled: boolean;
  scale: number; // 0.1 = small, 0.3 = large
  showEnemies: boolean;
  showItems: boolean;
  showQuests: boolean;
  backgroundColor: string;
}

export interface AreaTransition {
  id: string;
  fromArea: string;
  toArea: string;
  triggerX: number;
  triggerY: number;
  triggerWidth: number;
  triggerHeight: number;
  requiredKey?: string;
  requiredLevel?: number;
}

export interface GameArea {
  id: string;
  name: string;
  level: () => Partial<SpriteState>;
  transitions: AreaTransition[];
  music?: string;
  ambientSound?: string;
}

export interface BossPhaseConfig {
  phase: number;
  healthThreshold: number; // % of max HP to trigger this phase
  attackPatterns: string[];
  speed: number;
  isInvulnerable: boolean;
  spawnMinions?: { type: string; count: number }[];
}

export interface BossConfig {
  id: string;
  name: string;
  emoji: string;
  maxHealth: number;
  phases: BossPhaseConfig[];
  lootTable: LootDrop[];
  xpReward: number;
}

// === EXTENDED SPRITE STATE (RPG additions) ===

export interface SpriteStateRPGExtensions {
  // Character Stats
  characterStats: CharacterStats;
  
  // Status Effects
  statusEffects: StatusEffect[];
  
  // Quests
  activeQuests: RPGQuest[];
  completedQuests: string[];
  
  // Wave System
  currentWave: number;
  totalWaves: number;
  waveTimer: number;
  waveConfigs: WaveConfig[];
  
  // Loot
  lootTables: Record<string, EnemyLootTable>;
  
  // Difficulty
  difficulty: Difficulty;
  difficultyMultipliers: DifficultyMultipliers;
  
  // Minimap
  minimapConfig: MinimapConfig;
  
  // Areas
  currentArea: string;
  areas: Record<string, GameArea>;
}

export interface MissionStep {
  id: string;
  text: string;
  isCompleted: boolean;
  criteria?: {
    requiredBlock?: CommandType;
  };
}

export interface Mission {
  id: string;
  mode: AppMode;
  title: string;
  description: string;
  completed: boolean;
  steps: MissionStep[];
}
