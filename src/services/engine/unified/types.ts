export interface UnifiedGameState {
  playerX: number;
  playerY: number;
  playerVx: number;
  playerVy: number;
  playerEmoji: string;
  playerHealth: number;
  playerMaxHealth: number;
  playerDamage: number;
  playerSpeed: number;
  playerJumpForce: number;
  playerIsGrounded: boolean;
  playerFacing: 'left' | 'right';
  playerInvincible: boolean;
  playerInvincibleTimer: number;

  worldWidth: number;
  worldHeight: number;
  cameraX: number;
  cameraY: number;
  cameraZoom: number;
  gravity: number;
  friction: number;

  tiles: Array<{ x: number; y: number; type: string; solid: boolean; emoji: string }>;
  background: string;

  enemies: Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    damage: number;
    speed: number;
    behavior: string;
    alive: boolean;
    state: string;
    stateTimer: number;
  }>;
  items: Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    type: string;
    collected: boolean;
  }>;
  projectiles: Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    owner: 'player' | 'enemy';
    alive: boolean;
  }>;
  particles: Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }>;

  npcs: Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    name: string;
    dialogue: string[];
    dialogueIndex: number;
    isTalking: boolean;
  }>;

  score: number;
  combo: number;
  maxCombo: number;
  wave: number;
  health: number;
  maxHealth: number;
  coins: number;
  keys: number;
  xp: number;
  level: number;

  inventory: Array<{
    id: string;
    name: string;
    emoji: string;
    type: string;
    quantity: number;
    equipped: boolean;
    damage?: number;
    range?: number;
  }>;

  speechBubble?: {
    text: string;
    timer: number;
  };

  checkpoint?: {
    x: number;
    y: number;
    health: number;
    score: number;
  };

  activeQuests: Array<{
    id: string;
    name: string;
    description: string;
    objectives: string[];
    completed: boolean;
    rewards: { xp: number; coins: number; items: string[] };
  }>;

  activeDialogue: {
    speaker: string;
    text: string;
    choices: Array<{ text: string; next: number }>;
    isActive: boolean;
  } | null;

  weather: string;
  weatherIntensity: number;

  gameTime: number;
  dayNightCycle: number;

  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  isCutsceneActive: boolean;
  _lastShot: number;

  timePlayed: number;
  enemiesDefeated: number;
  itemsCollected: number;
  distanceTraveled: number;

  variables: Record<string, number | string | boolean>;
}

export interface GameContext {
  state: UnifiedGameState;
  canvas: HTMLCanvasElement;
  keys: Set<string>;
  tileSize: number;
  frameCount: number;
}

export function boxCollision(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}
