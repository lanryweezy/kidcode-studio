import { PlanType } from './enums';
import { CommandType } from './commandTypes';

export interface CommandBlock {
  id: string;
  type: CommandType;
  hasBreakpoint?: boolean;
  screenId?: string; // For organizing blocks by screen/page
  params: {
    // Basic values
    value?: number;
    value2?: number; // For binary math/logic
    intensity?: number; // For lighting/effects
    text?: string;
    text2?: string;
    message?: string;
    color?: string;

    // Hardware params
    pin?: number;
    duration?: number;
    speed?: number;
    angle?: number;
    address?: string;
    row?: number;
    col?: number;

    // Component Object params
    componentId?: string;
    methodName?: string;
    propName?: string;
    propValue?: string | number | boolean;
    eventName?: string;
    args?: string[];

    // Logic/Vars
    condition?: string;
    varName?: string;
    listName?: string;

    // App/UI
    screenName?: string;
    textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
    url?: string;

    // Game/Physics
    x?: number;
    y?: number;
    z?: number;
    width?: number;
    height?: number;
    direction?: 'cw' | 'ccw';
    effect?: 'color' | 'fisheye' | 'whirl' | 'pixelate' | 'mosaic' | 'brightness' | 'ghost';

    // Additional params for new components
    steps?: number; // For stepper motors
    state?: boolean; // For relays, solenoids, lasers, etc.
    max?: number; // For progress bars, sliders, etc.
    note?: string; // For musical notes
    shape?: string; // For OLED shapes
    pattern?: string; // For matrix patterns
    ssid?: string; // For WiFi
    password?: string; // For WiFi
    method?: string; // For HTTP requests

    // Minecraft params
    x2?: number;
    y2?: number;
    z2?: number;
    blockType?: string;
    entityType?: string;
    item?: string;
    amount?: number;
    weather?: string;
    time?: string;
    sound?: string;
    structure?: string;
  };
}

// New interface for organized page code
export interface PageCode {
  screenId: string;
  screenName: string;
  blocks: CommandBlock[];
  generatedCode: {
    python: string;
    javascript: string;
    arduino: string;
  };
  lastEdited: number;
}

export interface BlockDefinition {
  type: CommandType;
  label: string;
  icon: string | React.ComponentType;
  defaultParams: Record<string, unknown>;
  color: string;
  category?: string;
  description?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
  xpReward?: number;
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  completed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  progress?: number;
  maxProgress?: number;
}

export interface Trophy {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward?: number;
  unlockedAt?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirements: string[];
  category: 'coding' | 'creativity' | 'community' | 'mastery';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  avatar: string;
}

export interface Cosmetic {
  id: string;
  type: 'avatar' | 'theme' | 'effect';
  name: string;
  unlocked: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  plan: PlanType;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  badges: Badge[];
  quests: Quest[];
  trophies?: Trophy[];
  projects: string[]; // IDs
  creatorScore?: number;
  skillTree?: SkillNode[];
  cosmetics?: Cosmetic[];
  leaderboards?: LeaderboardEntry[];
}

// === 3D ASSET TYPES ===
export interface Model3D {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  format: 'glb' | 'gltf' | 'fbx' | 'obj';
  vertices: number;
  textures: string[];
  isRigged: boolean;
  animations?: string[];
  category: 'character' | 'prop' | 'vehicle' | 'building' | 'environment';
  style: 'cartoon' | 'realistic' | 'lowpoly' | 'anime' | 'voxel';
  aiGenerated: boolean;
  createdAt: number;
}
