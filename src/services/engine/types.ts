export interface BlockCommand {
  type: string;
  params: Record<string, any>;
}

export interface Vec2 { x: number; y: number; }

export interface EngineEntity {
  id: string;
  type: 'player' | 'enemy' | 'item' | 'projectile' | 'particle';
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  behavior: string;
  alive: boolean;
  data?: Record<string, unknown> & { initialX?: number; range?: number; checkpoint?: { x: number; y: number }; isBoss?: boolean; gravity?: number };
}

export interface EngineTile {
  x: number;
  y: number;
  type: string;
  emoji: string;
  solid: boolean;
}

export interface ParticleConfig {
  lifetime: number;
  gravity: number;
  fadeOut: boolean;
  scaleOverLife: boolean;
  color?: string;
}

export const PARTICLE_PRESETS: Record<string, ParticleConfig> = {
  fire: { lifetime: 0.8, gravity: -0.5, fadeOut: true, scaleOverLife: true, color: '#ff6b35' },
  smoke: { lifetime: 1.5, gravity: -0.2, fadeOut: true, scaleOverLife: true, color: '#6b7280' },
  spark: { lifetime: 0.5, gravity: 0.3, fadeOut: true, scaleOverLife: false, color: '#fbbf24' },
  trail: { lifetime: 0.6, gravity: 0, fadeOut: true, scaleOverLife: true, color: '#60a5fa' },
};

export interface CameraState {
  x: number; y: number;
  targetX: number; targetY: number;
  followPlayer: boolean;
  smoothing: number;
  worldWidth: number; worldHeight: number;
  zoom: number;
  targetZoom: number;
  shakeX: number; shakeY: number;
  shakeIntensity: number;
  shakeDecay: number;
  minZoom: number;
  maxZoom: number;
}

export interface InputState {
  pressed: Set<string>;
  justPressed: Set<string>;
  justReleased: Set<string>;
  buffered: Map<string, number>;
  bufferWindow: number;
}

export interface GameState {
  player: EngineEntity;
  enemies: EngineEntity[];
  items: EngineEntity[];
  projectiles: EngineEntity[];
  particles: EngineEntity[];
  tiles: EngineTile[];
  variables: Record<string, number>;
  score: number;
  health: number;
  maxHealth: number;
  wave: number;
  combo: number;
  maxCombo: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
  weather: string;
  dayTime: number;
  cutsceneActive: boolean;
  scene?: string;
  camera?: CameraState;
  floatingTexts?: { id: string; x: number; y: number; text: string; color: string; life: number; vy: number }[];
  wrapWorld?: boolean;
  particlePool: EngineEntity[];
  activeParticles: number;
}

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
  onVictory: () => void;
  onWaveComplete: (wave: number) => void;
  onEnemyDefeated: (enemy: EngineEntity) => void;
  onItemCollected: (item: EngineEntity) => void;
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
}
