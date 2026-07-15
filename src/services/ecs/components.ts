/**
 * ECS Component Types
 * 
 * Each component is a plain data object. No methods, no inheritance.
 * Systems iterate over component arrays, not entity objects.
 * 
 * Design principles:
 * - Components are flat structs (cache-friendly)
 * - Components are optional per entity (composition over inheritance)
 * - Components are stored in typed arrays (ECS pattern)
 */

// === Identity ===

export interface Entity {
  id: string;
  tags: Set<string>; // e.g., 'player', 'enemy', 'item'
}

// === Position & Transform ===

export interface PositionComponent {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

// === Velocity & Physics ===

export interface VelocityComponent {
  vx: number;
  vy: number;
  vz: number;
}

export interface PhysicsComponent {
  gravity: boolean;
  gravityForce: number;
  jumpForce: number;
  isJumping: boolean;
  canDoubleJump: boolean;
  restitution: number; // bounciness
  friction: number;
  mass: number;
}

// === Sprite & Rendering ===

export interface SpriteComponent {
  emoji: string;
  texture: string | null;
  scale: number;
  opacity: number;
  frames: string[];
  animations: Record<string, number[]>;
  currentAnimation: string | null;
  animationSpeed: number;
}

// === Health ===

export interface HealthComponent {
  current: number;
  max: number;
}

// === AI Behavior ===

export interface AIComponent {
  behavior: 'patrol' | 'chase' | 'float_h' | 'float_v' | 'orbit' | 'teammate';
  range: number;
  initialX: number;
  speed: number;
}

// === Input Control ===

export interface InputComponent {
  controlled: boolean; // true = player controls this entity
}

// === Camera ===

export interface CameraComponent {
  follow: boolean;
  constraints?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

// === Inventory ===

export interface InventoryComponent {
  items: InventoryItem[];
  maxItems: number;
  equippedItem?: InventoryItem;
}

// === Dialogue ===

export interface DialogueComponent {
  activeDialogue?: DialogueNode;
  history: string[];
  isActive: boolean;
}

// === Audio ===

export interface AudioComponent {
  backgroundMusic?: string;
  musicVolume: number;
  ambientSound?: string;
}

// === Powerups ===

export interface PowerupComponent {
  speed: number; // frames remaining
  shield: number;
  ghost: number;
}

// === Checkpoint ===

export interface CheckpointComponent {
  checkpoints: Checkpoint[];
  lastCheckpoint?: Checkpoint;
}

// === Cutscene ===

export interface CutsceneComponent {
  isActive: boolean;
  screenShake: number;
  screenFreeze: number;
  timeScale: number;
  fadeAlpha: number;
}

// === Boss ===

export interface BossComponent {
  name: string;
  emoji: string;
  health: number;
  maxHealth: number;
  phase: number;
  attackPattern: string;
  isInvulnerable: boolean;
  attackCooldown: number;
}

// === Weather ===

export interface WeatherComponent {
  weather: 'none' | 'rain' | 'snow';
}

// === World ===

export interface WorldComponent {
  scene: string;
  tilemap: Tile[];
  worldPrompt?: string;
  worldSeed?: number;
}

// === Effects ===

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

export interface EffectsComponent {
  particles: ParticleEffect[];
  effectTrigger?: { type: string; x: number; y: number; color?: string };
  floatingTexts: FloatingText[];
}

// === Imports for nested types ===
import { InventoryItem, DialogueNode, Checkpoint, Tile, FloatingText } from '../../types';
