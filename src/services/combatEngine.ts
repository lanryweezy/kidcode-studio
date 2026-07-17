/**
 * Combat Engine - Improvements #16-30
 * Melee hitbox, i-frames, damage variance, knockback, combo chain,
 * dodge roll, parry, AOE, projectile physics, weapon animations
 * 
 * NEW in Cycle 4: Rage mode, stealth, elemental combos, execute threshold
 */

import { SpriteState, GameEntity, CharacterStats } from '../types';

// ─── Melee Hitbox Detection (#17) ───

export interface AttackHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  activeFrames: number;
  type: 'melee' | 'ranged' | 'aoe';
}

export function createMeleeHitbox(
  playerX: number,
  playerY: number,
  direction: number, // 1 = right, -1 = left
  weaponRange: number = 50,
  weaponWidth: number = 40,
  damage: number = 10
): AttackHitbox {
  return {
    x: playerX + (direction > 0 ? 20 : -weaponRange - 20),
    y: playerY - weaponWidth / 2,
    width: weaponRange,
    height: weaponWidth,
    damage,
    knockbackX: direction * 8,
    knockbackY: -3,
    activeFrames: 8,
    type: 'melee',
  };
}

export function checkHitboxCollision(
  hitbox: AttackHitbox,
  target: GameEntity
): boolean {
  const targetW = target.width || 30;
  const targetH = target.height || 30;
  return (
    hitbox.x < target.x + targetW &&
    hitbox.x + hitbox.width > target.x &&
    hitbox.y < target.y + targetH &&
    hitbox.y + hitbox.height > target.y
  );
}

// ─── Invincibility Frames (#18) ───

export interface IFrameState {
  active: boolean;
  framesRemaining: number;
  maxFrames: number;
  flickerRate: number; // Frames between alpha changes
}

export function createIFrames(duration: number = 60): IFrameState {
  return {
    active: true,
    framesRemaining: duration,
    maxFrames: duration,
    flickerRate: 3,
  };
}

export function updateIFrames(state: IFrameState): IFrameState {
  if (!state.active) return state;
  const remaining = state.framesRemaining - 1;
  return {
    ...state,
    framesRemaining: remaining,
    active: remaining > 0,
  };
}

export function getIFrameAlpha(state: IFrameState): number {
  if (!state.active) return 1;
  // Flicker: alternate between visible and semi-transparent
  const cycle = Math.floor(state.framesRemaining / state.flickerRate) % 2;
  return cycle === 0 ? 1 : 0.3;
}

// ─── Damage Calculation with Variance (#19) ───

export function calculateDamageWithVariance(
  baseDamage: number,
  variance: number = 0.2
): number {
  const minDmg = baseDamage * (1 - variance);
  const maxDmg = baseDamage * (1 + variance);
  return Math.round(minDmg + Math.random() * (maxDmg - minDmg));
}

export function calculateElementalDamage(
  baseDamage: number,
  attackElement: string,
  defenderElement: string
): { damage: number; effectiveness: 'normal' | 'super' | 'weak' } {
  const effectivenessMap: Record<string, Record<string, number>> = {
    fire: { ice: 2, water: 0.5, grass: 1.5, fire: 0.5 },
    ice: { fire: 0.5, water: 1.5, grass: 2, ice: 0.5 },
    water: { fire: 2, ice: 0.5, grass: 0.5, water: 0.5 },
    grass: { fire: 0.5, water: 2, ice: 0.5, grass: 0.5 },
    lightning: { water: 2, grass: 0.5, ground: 0, lightning: 0.5 },
  };

  const mult = effectivenessMap[attackElement]?.[defenderElement] ?? 1;
  const effectiveness = mult > 1 ? 'super' : mult < 1 ? 'weak' : 'normal';

  return {
    damage: Math.round(baseDamage * mult),
    effectiveness,
  };
}

// ─── Knockback (#20) ───

export function applyKnockback(
  targetX: number,
  targetY: number,
  sourceX: number,
  sourceY: number,
  forceX: number = 8,
  forceY: number = -3
): { vx: number; vy: number } {
  const dx = targetX - sourceX;
  const direction = dx > 0 ? 1 : -1;
  return {
    vx: direction * forceX,
    vy: forceY,
  };
}

// ─── Combo Chain System (#29) ───

export interface ComboChain {
  currentHit: number;
  maxHits: number;
  windowFrames: number; // Frames to land next hit
  timer: number;
  damageMultipliers: number[];
  attacks: string[];
}

export function createComboChain(maxHits: number = 3): ComboChain {
  return {
    currentHit: 0,
    maxHits,
    windowFrames: 30,
    timer: 0,
    damageMultipliers: Array.from({ length: maxHits }, (_, i) => 1 + i * 0.25),
    attacks: ['light', 'light', 'heavy'],
  };
}

export function advanceCombo(chain: ComboChain): { chain: ComboChain; attackIndex: number; damageMultiplier: number } {
  const nextHit = chain.currentHit + 1;
  if (nextHit >= chain.maxHits) {
    // Reset combo
    return {
      chain: { ...chain, currentHit: 0, timer: 0 },
      attackIndex: 0,
      damageMultiplier: chain.damageMultipliers[0],
    };
  }
  return {
    chain: { ...chain, currentHit: nextHit, timer: chain.windowFrames },
    attackIndex: nextHit,
    damageMultiplier: chain.damageMultipliers[nextHit],
  };
}

export function updateCombo(chain: ComboChain): ComboChain {
  if (chain.timer > 0) {
    const newTimer = chain.timer - 1;
    if (newTimer <= 0) {
      return { ...chain, currentHit: 0, timer: 0 }; // Combo dropped
    }
    return { ...chain, timer: newTimer };
  }
  return chain;
}

// ─── Dodge Roll (#22) ───

export interface DodgeState {
  isDodging: boolean;
  framesRemaining: number;
  direction: number;
  cooldown: number;
  maxCooldown: number;
  maxFrames: number;
}

export function createDodgeState(): DodgeState {
  return {
    isDodging: false,
    framesRemaining: 0,
    direction: 1,
    cooldown: 0,
    maxCooldown: 30,
    maxFrames: 15,
  };
}

export function startDodge(state: DodgeState, direction: number): DodgeState {
  if (state.cooldown > 0 || state.isDodging) return state;
  return {
    ...state,
    isDodging: true,
    framesRemaining: state.maxFrames,
    direction,
    cooldown: state.maxCooldown,
  };
}

export function updateDodge(state: DodgeState): DodgeState {
  return {
    ...state,
    framesRemaining: Math.max(0, state.framesRemaining - 1),
    isDodging: state.framesRemaining > 1,
    cooldown: Math.max(0, state.cooldown - 1),
  };
}

// ─── Parry System (#23) ───

export interface ParryState {
  isParrying: boolean;
  framesRemaining: number;
  parryWindow: number; // Active frames for parry
  cooldown: number;
  maxCooldown: number;
}

export function createParryState(): ParryState {
  return {
    isParrying: false,
    framesRemaining: 0,
    parryWindow: 6,
    cooldown: 0,
    maxCooldown: 45,
  };
}

export function startParry(state: ParryState): ParryState {
  if (state.cooldown > 0) return state;
  return {
    ...state,
    isParrying: true,
    framesRemaining: state.parryWindow,
    cooldown: state.maxCooldown,
  };
}

export function updateParry(state: ParryState): ParryState {
  return {
    ...state,
    framesRemaining: Math.max(0, state.framesRemaining - 1),
    isParrying: state.framesRemaining > 1,
    cooldown: Math.max(0, state.cooldown - 1),
  };
}

export function isParryActive(state: ParryState): boolean {
  return state.isParrying && state.framesRemaining > 0;
}

// ─── AOE Attack (#25) ───

export function getEnemiesInAOE(
  x: number, y: number,
  radius: number,
  enemies: GameEntity[]
): GameEntity[] {
  return enemies.filter(e => {
    const dist = Math.hypot(e.x - x, e.y - y);
    return dist <= radius;
  });
}

// ─── Projectile Physics (#26) ───

export interface ProjectileConfig {
  speed: number;
  gravity: number;
  homing: boolean;
  homingStrength: number;
  bounce: boolean;
  bounceCount: number;
  pierce: boolean;
  maxPierce: number;
  arcHeight: number;
}

export const PROJECTILE_PRESETS: Record<string, ProjectileConfig> = {
  straight: { speed: 8, gravity: 0, homing: false, homingStrength: 0, bounce: false, bounceCount: 0, pierce: false, maxPierce: 0, arcHeight: 0 },
  arrow: { speed: 10, gravity: 0.1, homing: false, homingStrength: 0, bounce: false, bounceCount: 0, pierce: false, maxPierce: 0, arcHeight: 0 },
  fireball: { speed: 6, gravity: 0, homing: true, homingStrength: 0.02, bounce: false, bounceCount: 0, pierce: false, maxPierce: 0, arcHeight: 0 },
  grenade: { speed: 5, gravity: 0.2, homing: false, homingStrength: 0, bounce: true, bounceCount: 2, pierce: false, maxPierce: 0, arcHeight: -5 },
  boomerang: { speed: 7, gravity: 0, homing: true, homingStrength: 0.05, bounce: false, bounceCount: 0, pierce: true, maxPierce: 3, arcHeight: 0 },
  laser: { speed: 20, gravity: 0, homing: false, homingStrength: 0, bounce: false, bounceCount: 0, pierce: true, maxPierce: 99, arcHeight: 0 },
};

export function updateProjectile(
  proj: GameEntity,
  targetX: number,
  targetY: number,
  config: ProjectileConfig,
  canvasW: number,
  canvasH: number
): GameEntity {
  let vx = proj.vx || 0;
  let vy = proj.vy || 0;

  // Gravity
  vy += config.gravity;

  // Homing
  if (config.homing) {
    const dx = targetX - proj.x;
    const dy = targetY - proj.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      vx += (dx / dist) * config.homingStrength * config.speed;
      vy += (dy / dist) * config.homingStrength * config.speed;
    }
  }

  // Normalize speed
  const currentSpeed = Math.hypot(vx, vy);
  if (currentSpeed > config.speed) {
    vx = (vx / currentSpeed) * config.speed;
    vy = (vy / currentSpeed) * config.speed;
  }

  return {
    ...proj,
    x: proj.x + vx,
    y: proj.y + vy,
    vx,
    vy,
    lifeTime: (proj.lifeTime || 100) - 1,
  };
}

// ─── Weapon Swing Animation Data (#27) ───

export interface SwingAnimation {
  startAngle: number;
  endAngle: number;
  duration: number;
  radius: number;
  color: string;
}

export function getSwingAnimation(direction: number): SwingAnimation {
  return {
    startAngle: direction > 0 ? -Math.PI / 4 : Math.PI + Math.PI / 4,
    endAngle: direction > 0 ? Math.PI / 4 : Math.PI - Math.PI / 4,
    duration: 8,
    radius: 40,
    color: 'rgba(255, 255, 255, 0.6)',
  };
}

// ─── Damage Vignette (#77) ───

export function calculateVignetteIntensity(currentHP: number, maxHP: number): number {
  const hpPercent = currentHP / maxHP;
  if (hpPercent > 0.6) return 0;
  if (hpPercent > 0.3) return (0.6 - hpPercent) / 0.3 * 0.5;
  return 0.5 + (0.3 - hpPercent) / 0.3 * 0.5;
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 4 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Rage Mode ───
// Build rage by taking/dealing damage, spend for powered-up attacks

export interface RageState {
  current: number;
  max: number;
  isRaging: boolean;
  rageDuration: number;
  damageMultiplier: number;
  speedMultiplier: number;
}

export function createRageState(maxRage: number = 100): RageState {
  return {
    current: 0,
    max: maxRage,
    isRaging: false,
    rageDuration: 0,
    damageMultiplier: 1.5,
    speedMultiplier: 1.3,
  };
}

export function addRage(state: RageState, amount: number): RageState {
  if (state.isRaging) return state;
  return {
    ...state,
    current: Math.min(state.max, state.current + amount),
  };
}

export function activateRage(state: RageState, duration: number = 300): RageState {
  if (state.current < state.max) return state;
  return {
    ...state,
    current: 0,
    isRaging: true,
    rageDuration: duration,
  };
}

export function updateRage(state: RageState): RageState {
  if (!state.isRaging) return state;
  const newDuration = state.rageDuration - 1;
  return {
    ...state,
    rageDuration: newDuration,
    isRaging: newDuration > 0,
  };
}

// ─── Stealth System ───

export interface StealthState {
  isStealthy: boolean;
  detectionLevel: number; // 0-100
  stealthTimer: number;
  lastKnownPosition: { x: number; y: number } | null;
}

export function createStealthState(): StealthState {
  return {
    isStealthy: false,
    detectionLevel: 0,
    stealthTimer: 0,
    lastKnownPosition: null,
  };
}

export function enterStealth(state: StealthState, duration: number = 180): StealthState {
  return {
    ...state,
    isStealthy: true,
    stealthTimer: duration,
    detectionLevel: 0,
  };
}

export function updateStealth(
  state: StealthState,
  playerX: number,
  playerY: number,
  enemies: { x: number; y: number; detectionRange: number }[]
): StealthState {
  if (!state.isStealthy) return state;

  // Check enemy detection
  let maxDetection = 0;
  for (const enemy of enemies) {
    const dist = Math.hypot(playerX - enemy.x, playerY - enemy.y);
    if (dist < enemy.detectionRange) {
      const detection = (1 - dist / enemy.detectionRange) * 100;
      maxDetection = Math.max(maxDetection, detection);
    }
  }

  const newDetection = Math.min(100, state.detectionLevel + maxDetection * 0.1);
  const newTimer = state.stealthTimer - 1;

  // Break stealth if detected or timer expires
  if (newDetection >= 100 || newTimer <= 0) {
    return {
      isStealthy: false,
      detectionLevel: newDetection,
      stealthTimer: 0,
      lastKnownPosition: { x: playerX, y: playerY },
    };
  }

  return {
    ...state,
    detectionLevel: newDetection,
    stealthTimer: newTimer,
  };
}

// ─── Execute Threshold ───
// Deals bonus damage to low-health enemies

export function calculateExecuteDamage(
  baseDamage: number,
  targetHP: number,
  targetMaxHP: number,
  executeThreshold: number = 0.3
): number {
  const hpPercent = targetHP / targetMaxHP;
  if (hpPercent <= executeThreshold) {
    return Math.round(baseDamage * 2.5); // 2.5x execute damage
  }
  return baseDamage;
}

// ─── Elemental Combo System ───
// Apply two elements for bonus effect

export interface ElementalCombo {
  element1: string;
  element2: string;
  bonusDamage: number;
  effect: string;
  description: string;
}

export const ELEMENTAL_COMBOS: ElementalCombo[] = [
  { element1: 'fire', element2: 'ice', bonusDamage: 15, effect: 'steam_burst', description: 'Steam explosion!' },
  { element1: 'fire', element2: 'lightning', bonusDamage: 20, effect: 'plasma_blast', description: 'Plasma blast!' },
  { element1: 'ice', element2: 'lightning', bonusDamage: 18, effect: 'frozen_shock', description: 'Frozen shock!' },
  { element1: 'water', element2: 'lightning', bonusDamage: 22, effect: 'electrocute', description: 'Electrocution!' },
  { element1: 'earth', element2: 'fire', bonusDamage: 16, effect: 'magma_burst', description: 'Magma burst!' },
  { element1: 'earth', element2: 'water', bonusDamage: 12, effect: 'mud_trap', description: 'Mud trap!' },
];

export function findElementalCombo(element1: string, element2: string): ElementalCombo | null {
  return ELEMENTAL_COMBOS.find(combo =>
    (combo.element1 === element1 && combo.element2 === element2) ||
    (combo.element1 === element2 && combo.element2 === element1)
  ) || null;
}

// ─── Perfect Parry Window ───
// Timing-based parry for massive counter damage

export interface PerfectParryState {
  windowFrames: number;
  isPerfectWindow: boolean;
  counterDamage: number;
}

export function checkPerfectParry(
  parryTiming: number, // frames since attack started
  attackStartup: number = 5,
  perfectWindow: number = 3
): PerfectParryState {
  const diff = Math.abs(parryTiming - attackStartup);
  const isPerfect = diff <= perfectWindow;

  return {
    windowFrames: perfectWindow,
    isPerfectWindow: isPerfect,
    counterDamage: isPerfect ? 50 : 20, // Perfect parry does 2.5x counter damage
  };
}

// ─── Weapon Durability ───

export interface DurabilityState {
  current: number;
  max: number;
  breakThreshold: number;
  isBroken: boolean;
}

export function createDurabilityState(maxDurability: number = 100): DurabilityState {
  return {
    current: maxDurability,
    max: maxDurability,
    breakThreshold: 10,
    isBroken: false,
  };
}

export function useDurability(state: DurabilityState, amount: number = 1): DurabilityState {
  const newCurrent = Math.max(0, state.current - amount);
  return {
    ...state,
    current: newCurrent,
    isBroken: newCurrent <= state.breakThreshold,
  };
}

export function repairDurability(state: DurabilityState, amount: number): DurabilityState {
  return {
    ...state,
    current: Math.min(state.max, state.current + amount),
    isBroken: false,
  };
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 13 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Combo System ───

export interface ComboState {
  count: number;
  timer: number;
  maxTimer: number;
  damageMultiplier: number;
  lastHitTime: number;
}

export function createComboState(maxTimer: number = 60): ComboState {
  return {
    count: 0,
    timer: 0,
    maxTimer,
    damageMultiplier: 1.0,
    lastHitTime: 0,
  };
}

export function registerHit(state: ComboState): ComboState {
  const now = Date.now();
  const timeSinceLastHit = now - state.lastHitTime;
  
  if (timeSinceLastHit < state.maxTimer * 16) { // Within combo window
    const newCount = state.count + 1;
    const newMultiplier = 1 + (newCount * 0.1); // 10% more damage per combo
    
    return {
      ...state,
      count: newCount,
      timer: state.maxTimer,
      damageMultiplier: Math.min(3, newMultiplier), // Cap at 3x
      lastHitTime: now,
    };
  } 
    // Combo dropped
    return {
      count: 1,
      timer: state.maxTimer,
      maxTimer: state.maxTimer,
      damageMultiplier: 1.0,
      lastHitTime: now,
    };
  
}

export function updateComboState(state: ComboState): ComboState {
  if (state.timer > 0) {
    const newTimer = state.timer - 1;
    if (newTimer <= 0) {
      return { ...state, count: 0, timer: 0, damageMultiplier: 1.0 };
    }
    return { ...state, timer: newTimer };
  }
  return state;
}

export function getComboText(count: number): string {
  if (count >= 10) return 'LEGENDARY!';
  if (count >= 7) return 'UNSTOPPABLE!';
  if (count >= 5) return 'AMAZING!';
  if (count >= 3) return 'NICE!';
  if (count >= 2) return 'COMBO';
  return '';
}

export function getComboColor(count: number): string {
  if (count >= 10) return '#fbbf24'; // Gold
  if (count >= 7) return '#f97316'; // Orange
  if (count >= 5) return '#ef4444'; // Red
  if (count >= 3) return '#a855f7'; // Purple
  if (count >= 2) return '#3b82f6'; // Blue
  return '#ffffff';
}

// ─── Special Moves ───

export interface SpecialMove {
  id: string;
  name: string;
  damage: number;
  manaCost: number;
  cooldown: number;
  range: number;
  type: 'melee' | 'ranged' | 'aoe' | 'buff';
  description: string;
}

export const SPECIAL_MOVES: SpecialMove[] = [
  { id: 'whirlwind', name: 'Whirlwind', damage: 30, manaCost: 20, cooldown: 5, range: 80, type: 'aoe', description: 'Spin attack hitting all nearby enemies' },
  { id: 'fireball', name: 'Fireball', damage: 40, manaCost: 30, cooldown: 8, range: 200, type: 'ranged', description: 'Launch a fireball at range' },
  { id: 'heal', name: 'Heal', damage: -50, manaCost: 25, cooldown: 10, range: 0, type: 'buff', description: 'Restore 50 HP' },
  { id: 'shield_bash', name: 'Shield Bash', damage: 20, manaCost: 15, cooldown: 4, range: 50, type: 'melee', description: 'Stun enemy for 2 seconds' },
  { id: 'lightning', name: 'Lightning Strike', damage: 60, manaCost: 40, cooldown: 12, range: 150, type: 'ranged', description: 'Massive lightning damage' },
  { id: 'dash_attack', name: 'Dash Strike', damage: 25, manaCost: 10, cooldown: 3, range: 120, type: 'melee', description: 'Dash forward dealing damage' },
];

export function canUseSpecialMove(
  move: SpecialMove,
  currentMana: number,
  cooldownRemaining: number
): boolean {
  return currentMana >= move.manaCost && cooldownRemaining <= 0;
}

export function useSpecialMove(
  move: SpecialMove,
  currentMana: number
): { mana: number; success: boolean } {
  if (currentMana < move.manaCost) {
    return { mana: currentMana, success: false };
  }
  return { mana: currentMana - move.manaCost, success: true };
}

// ─── Critical Hit System ───

export interface CriticalHitState {
  chance: number; // 0-100
  damageMultiplier: number;
  lastCritTime: number;
  critStreak: number;
}

export function createCriticalHitState(chance: number = 5): CriticalHitState {
  return {
    chance,
    damageMultiplier: 2.0,
    lastCritTime: 0,
    critStreak: 0,
  };
}

export function rollCriticalHit(state: CriticalHitState): { isCrit: boolean; newState: CriticalHitState } {
  const isCrit = Math.random() * 100 < state.chance;
  const now = Date.now();

  if (isCrit) {
    const timeSinceLastCrit = now - state.lastCritTime;
    const newStreak = timeSinceLastCrit < 2000 ? state.critStreak + 1 : 1;
    
    // Bonus damage for crit streaks
    const streakBonus = Math.min(2, newStreak * 0.2);
    const finalMultiplier = state.damageMultiplier + streakBonus;

    return {
      isCrit: true,
      newState: {
        ...state,
        lastCritTime: now,
        critStreak: newStreak,
        damageMultiplier: finalMultiplier,
      },
    };
  }

  return { isCrit: false, newState: state };
}

// ─── Damage Types ───

export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark';

export interface DamageTypeInfo {
  name: string;
  color: string;
  effectiveness: Record<DamageType, number>;
}

export const DAMAGE_TYPES: Record<DamageType, DamageTypeInfo> = {
  physical: { name: 'Physical', color: '#94a3b8', effectiveness: { physical: 1, fire: 1, ice: 1, lightning: 1, poison: 1, holy: 1, dark: 1 } },
  fire: { name: 'Fire', color: '#ef4444', effectiveness: { physical: 1, fire: 0.5, ice: 2, lightning: 1, poison: 0.5, holy: 1, dark: 1.5 } },
  ice: { name: 'Ice', color: '#3b82f6', effectiveness: { physical: 1, fire: 0.5, ice: 0.5, lightning: 1, poison: 1, holy: 1, dark: 1 } },
  lightning: { name: 'Lightning', color: '#eab308', effectiveness: { physical: 1, fire: 1, ice: 1, lightning: 0.5, poison: 1, holy: 1, dark: 1 } },
  poison: { name: 'Poison', color: '#a855f7', effectiveness: { physical: 1, fire: 0.5, ice: 1, lightning: 1, poison: 0.5, holy: 2, dark: 0.5 } },
  holy: { name: 'Holy', color: '#fbbf24', effectiveness: { physical: 1, fire: 1, ice: 1, lightning: 1, poison: 2, holy: 0.5, dark: 2 } },
  dark: { name: 'Dark', color: '#6b21a8', effectiveness: { physical: 1, fire: 1, ice: 1, lightning: 1, poison: 1, holy: 0.5, dark: 0.5 } },
};

export function calculateDamageTypeMultiplier(
  attackType: DamageType,
  defenseType: DamageType
): number {
  return DAMAGE_TYPES[attackType].effectiveness[defenseType] || 1;
}

// ─── Knockback System ───

export interface KnockbackForce {
  x: number;
  y: number;
  duration: number;
}

export function calculateKnockback(
  attackerX: number,
  attackerY: number,
  targetX: number,
  targetY: number,
  force: number = 10,
  angle: number = 0
): KnockbackForce {
  const baseAngle = Math.atan2(targetY - attackerY, targetX - attackerX);
  const finalAngle = baseAngle + angle;

  return {
    x: Math.cos(finalAngle) * force,
    y: Math.sin(finalAngle) * force,
    duration: 15,
  };
}

export function applyKnockbackForce(
  currentVX: number,
  currentVY: number,
  knockback: KnockbackForce
): { vx: number; vy: number } {
  return {
    vx: currentVX + knockback.x,
    vy: currentVY + knockback.y,
  };
}
