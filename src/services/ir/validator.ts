/**
 * IR Validator — Catches type errors and logic errors BEFORE execution.
 * 
 * Validates IR nodes against:
 * 1. Range constraints (opacity 0-100, health 0-maxHealth, etc.)
 * 2. Required fields (entityId must exist, text must not be empty, etc.)
 * 3. Logic errors (jump while already jumping, use item not in inventory, etc.)
 * 4. Context errors (game commands in non-game mode, etc.)
 * 
 * Returns a list of errors. Empty list = valid.
 */

import { IRNode } from './types';
import { SpriteState } from '../../types';

export interface ValidationError {
  nodeId: string;
  kind: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationContext {
  spriteState: SpriteState;
  mode: 'GAME' | 'APP' | 'HARDWARE';
}

/**
 * Validate a single IR node.
 * Returns an array of errors (empty if valid).
 */
export function validateIRNode(
  node: IRNode,
  ctx: ValidationContext,
  nodeId: string = 'unknown'
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { spriteState, mode } = ctx;

  switch (node.kind) {
    // === Movement ===
    case 'move_x':
      if (typeof node.dx !== 'number') {
        errors.push({ nodeId, kind: node.kind, field: 'dx', message: 'Movement distance must be a number', severity: 'error' });
      }
      if (Math.abs(node.dx) > 100) {
        errors.push({ nodeId, kind: node.kind, message: 'Movement distance > 100px may cause teleporting', severity: 'warning' });
      }
      break;
    case 'move_y':
      if (typeof node.dy !== 'number') {
        errors.push({ nodeId, kind: node.kind, field: 'dy', message: 'Movement distance must be a number', severity: 'error' });
      }
      if (Math.abs(node.dy) > 100) {
        errors.push({ nodeId, kind: node.kind, message: 'Movement distance > 100px may cause teleporting', severity: 'warning' });
      }
      break;

    case 'set_velocity_x':
      if (typeof node.vx !== 'number') {
        errors.push({ nodeId, kind: node.kind, field: 'vx', message: 'Velocity must be a number', severity: 'error' });
      }
      if (Math.abs(node.vx) > 50) {
        errors.push({ nodeId, kind: node.kind, message: 'Velocity > 50 may cause tunneling', severity: 'warning' });
      }
      break;
    case 'set_velocity_y':
      if (typeof node.vy !== 'number') {
        errors.push({ nodeId, kind: node.kind, field: 'vy', message: 'Velocity must be a number', severity: 'error' });
      }
      if (Math.abs(node.vy) > 50) {
        errors.push({ nodeId, kind: node.kind, message: 'Velocity > 50 may cause tunneling', severity: 'warning' });
      }
      break;

    case 'set_gravity':
      if (typeof node.enabled !== 'boolean') {
        errors.push({ nodeId, kind: node.kind, field: 'enabled', message: 'Gravity must be true or false', severity: 'error' });
      }
      break;

    case 'set_friction':
      if (node.value < 0 || node.value > 1) {
        errors.push({ nodeId, kind: node.kind, field: 'value', message: `Friction ${node.value} outside range [0, 1]`, severity: 'error' });
      }
      break;

    case 'set_bounciness':
      if (node.value < 0 || node.value > 2) {
        errors.push({ nodeId, kind: node.kind, field: 'value', message: `Bounciness ${node.value} outside range [0, 2]`, severity: 'warning' });
      }
      break;

    case 'jump':
      if (node.force <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'force', message: 'Jump force must be positive', severity: 'error' });
      }
      if (node.force > 30) {
        errors.push({ nodeId, kind: node.kind, field: 'force', message: 'Jump force > 30 may launch off-screen', severity: 'warning' });
      }
      if (spriteState.isJumping) {
        errors.push({ nodeId, kind: node.kind, message: 'Cannot jump while already jumping (unless double-jump enabled)', severity: 'warning' });
      }
      break;

    // === Appearance ===
    case 'set_emoji':
      if (!node.emoji || node.emoji.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'emoji', message: 'Emoji must not be empty', severity: 'error' });
      }
      break;

    case 'set_size':
      if (node.scale <= 0 || node.scale > 10) {
        errors.push({ nodeId, kind: node.kind, field: 'scale', message: `Size ${node.scale} outside range (0, 10]`, severity: 'error' });
      }
      break;

    case 'set_opacity':
      if (node.opacity < 0 || node.opacity > 100) {
        errors.push({ nodeId, kind: node.kind, field: 'opacity', message: `Opacity ${node.opacity} outside range [0, 100]`, severity: 'error' });
      }
      break;

    case 'say':
    case 'think':
      if (!node.text || node.text.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'text', message: 'Speech text must not be empty', severity: 'error' });
      }
      if (node.text && node.text.length > 200) {
        errors.push({ nodeId, kind: node.kind, field: 'text', message: 'Speech text > 200 chars may overflow bubble', severity: 'warning' });
      }
      break;

    // === Spawning ===
    case 'spawn_enemy':
    case 'spawn_item':
      if (!node.emoji || node.emoji.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'emoji', message: 'Spawn emoji must not be empty', severity: 'error' });
      }
      if (node.x !== undefined && (node.x < 0 || node.x > 1000)) {
        errors.push({ nodeId, kind: node.kind, field: 'x', message: `Spawn x=${node.x} outside visible area`, severity: 'warning' });
      }
      if (node.y !== undefined && (node.y < 0 || node.y > 800)) {
        errors.push({ nodeId, kind: node.kind, field: 'y', message: `Spawn y=${node.y} outside visible area`, severity: 'warning' });
      }
      break;

    case 'spawn_particles':
      if (node.count <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'count', message: 'Particle count must be positive', severity: 'error' });
      }
      if (node.count > 100) {
        errors.push({ nodeId, kind: node.kind, field: 'count', message: `Particle count ${node.count} may cause FPS drops`, severity: 'warning' });
      }
      break;

    // === Game State ===
    case 'change_score':
    case 'set_score':
      if (node.kind === 'set_score' && node.value < 0) {
        errors.push({ nodeId, kind: node.kind, field: 'value', message: 'Score should not be negative', severity: 'warning' });
      }
      if (mode !== 'GAME') {
        errors.push({ nodeId, kind: node.kind, message: 'Score commands only work in Game mode', severity: 'warning' });
      }
      break;

    case 'change_health':
      if (node.delta < -50) {
        errors.push({ nodeId, kind: node.kind, field: 'delta', message: `Health change ${node.delta} is very large`, severity: 'warning' });
      }
      if (spriteState.health + node.delta < 0) {
        errors.push({ nodeId, kind: node.kind, message: 'Health would go below 0 (triggers game over)', severity: 'warning' });
      }
      break;

    case 'set_health':
      if (node.value < 0 || node.value > spriteState.maxHealth) {
        errors.push({ nodeId, kind: node.kind, field: 'value', message: `Health ${node.value} outside range [0, ${spriteState.maxHealth}]`, severity: 'warning' });
      }
      break;

    // === Audio ===
    case 'play_sound':
      if (!node.sound || node.sound.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'sound', message: 'Sound name must not be empty', severity: 'error' });
      }
      break;

    case 'set_bgm':
      if (!node.track || node.track.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'track', message: 'Track name must not be empty', severity: 'error' });
      }
      break;

    // === Inventory ===
    case 'add_to_inventory':
      if (!node.item || node.item.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'item', message: 'Item name must not be empty', severity: 'error' });
      }
      if (node.quantity <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'quantity', message: 'Quantity must be positive', severity: 'error' });
      }
      if (spriteState.inventory.length >= spriteState.maxInventorySize) {
        errors.push({ nodeId, kind: node.kind, message: 'Inventory is full', severity: 'warning' });
      }
      break;

    case 'remove_from_inventory':
      if (!node.item || node.item.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'item', message: 'Item name must not be empty', severity: 'error' });
      }
      const hasItem = spriteState.inventory.some(i => i.name === node.item);
      if (!hasItem) {
        errors.push({ nodeId, kind: node.kind, message: `Item "${node.item}" not found in inventory`, severity: 'error' });
      }
      break;

    // === Dialogue ===
    case 'create_dialogue':
      if (!('speaker' in node) || !node.speaker || node.speaker.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'speaker', message: 'Speaker name must not be empty', severity: 'error' });
      }
      if (!('message' in node) || !node.message || node.message.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'message', message: 'Dialogue message must not be empty', severity: 'error' });
      }
      break;
    case 'npc_talk':
      if (!('name' in node) || !node.name || node.name.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'name', message: 'Speaker name must not be empty', severity: 'error' });
      }
      if (!('message' in node) || !node.message || node.message.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'message', message: 'Dialogue message must not be empty', severity: 'error' });
      }
      break;

    // === Boss ===
    case 'spawn_boss':
      if (!node.name || node.name.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'name', message: 'Boss name must not be empty', severity: 'error' });
      }
      if (node.health <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'health', message: 'Boss health must be positive', severity: 'error' });
      }
      if (spriteState.activeBoss) {
        errors.push({ nodeId, kind: node.kind, message: 'A boss is already active', severity: 'warning' });
      }
      break;

    case 'set_boss_health':
      if (node.health < 0) {
        errors.push({ nodeId, kind: node.kind, field: 'health', message: 'Boss health cannot be negative', severity: 'error' });
      }
      if (!spriteState.activeBoss) {
        errors.push({ nodeId, kind: node.kind, message: 'No active boss to set health for', severity: 'warning' });
      }
      break;

    // === Sports ===
    case 'kick_ball':
    case 'shoot_ball':
      if (!node.emoji || node.emoji.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'emoji', message: 'Ball emoji must not be empty', severity: 'error' });
      }
      if (node.force <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'force', message: 'Kick/shoot force must be positive', severity: 'error' });
      }
      break;

    case 'set_timer':
      if (node.seconds <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'seconds', message: 'Timer must be positive', severity: 'error' });
      }
      break;

    case 'set_formation':
      const validFormations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '4-1-4-1'];
      if (!validFormations.includes(node.formation)) {
        errors.push({ nodeId, kind: node.kind, field: 'formation', message: `Formation "${node.formation}" not recognized. Valid: ${validFormations.join(', ')}`, severity: 'warning' });
      }
      break;

    // === Action ===
    case 'swing_weapon':
      if (!node.weapon || node.weapon.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'weapon', message: 'Weapon name must not be empty', severity: 'error' });
      }
      if (node.damage <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'damage', message: 'Damage must be positive', severity: 'error' });
      }
      break;

    case 'special_move':
      if (!node.name || node.name.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'name', message: 'Special move name must not be empty', severity: 'error' });
      }
      break;

    // === Adventure ===
    case 'add_quest':
    case 'complete_quest':
      if (!node.name || node.name.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'name', message: 'Quest name must not be empty', severity: 'error' });
      }
      break;

    case 'discover':
      if (!node.location || node.location.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'location', message: 'Location name must not be empty', severity: 'error' });
      }
      break;

    // === Shooter ===
    case 'throw_grenade':
      if (node.force <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'force', message: 'Grenade force must be positive', severity: 'error' });
      }
      break;

    // === Survival ===
    case 'gather':
      if (!node.resource || node.resource.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'resource', message: 'Resource name must not be empty', severity: 'error' });
      }
      if (node.amount <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'amount', message: 'Gather amount must be positive', severity: 'error' });
      }
      break;

    case 'craft':
      if (!node.item || node.item.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'item', message: 'Craft item name must not be empty', severity: 'error' });
      }
      const hasWood = Number(spriteState.variables['wood'] || 0) >= node.cost;
      if (!hasWood) {
        errors.push({ nodeId, kind: node.kind, message: `Not enough resources (need ${node.cost} wood)`, severity: 'warning' });
      }
      break;

    case 'eat':
    case 'drink':
      if (node.amount <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'amount', message: 'Amount must be positive', severity: 'error' });
      }
      break;

    case 'build':
      if (!node.structure || node.structure.length === 0) {
        errors.push({ nodeId, kind: node.kind, field: 'structure', message: 'Structure name must not be empty', severity: 'error' });
      }
      const buildWood = Number(spriteState.variables['wood'] || 0) >= node.cost;
      if (!buildWood) {
        errors.push({ nodeId, kind: node.kind, message: `Not enough resources (need ${node.cost} wood)`, severity: 'warning' });
      }
      break;

    // === Puzzle ===
    case 'rotate_block':
      if (node.degrees !== 90 && node.degrees !== 180 && node.degrees !== 270 && node.degrees !== 360) {
        errors.push({ nodeId, kind: node.kind, field: 'degrees', message: `Rotation ${node.degrees}° not standard (90/180/270/360)`, severity: 'warning' });
      }
      break;

    case 'slide_puzzle':
      const validDirs = ['up', 'down', 'left', 'right'];
      if (!validDirs.includes(node.direction)) {
        errors.push({ nodeId, kind: node.kind, field: 'direction', message: `Direction "${node.direction}" not valid. Use: ${validDirs.join(', ')}`, severity: 'error' });
      }
      break;

    case 'fill_color':
      if (!node.color || !node.color.match(/^#[0-9a-fA-F]{6}$/)) {
        errors.push({ nodeId, kind: node.kind, field: 'color', message: `Invalid color "${node.color}". Use hex format like #ff0000`, severity: 'error' });
      }
      break;

    case 'mirror_puzzle':
      const validAxes = ['horizontal', 'vertical'];
      if (!validAxes.includes(node.axis)) {
        errors.push({ nodeId, kind: node.kind, field: 'axis', message: `Axis "${node.axis}" not valid. Use: horizontal or vertical`, severity: 'error' });
      }
      break;

    // === Racing ===
    case 'boost':
      if (node.force <= 0) {
        errors.push({ nodeId, kind: node.kind, field: 'force', message: 'Boost force must be positive', severity: 'error' });
      }
      if (node.force > 30) {
        errors.push({ nodeId, kind: node.kind, field: 'force', message: 'Boost force > 30 may cause loss of control', severity: 'warning' });
      }
      break;

    case 'upgrade_car':
      const validStats = ['speed', 'handling', 'acceleration', 'brakes'];
      if (!validStats.includes(node.stat)) {
        errors.push({ nodeId, kind: node.kind, field: 'stat', message: `Stat "${node.stat}" not valid. Use: ${validStats.join(', ')}`, severity: 'warning' });
      }
      break;

    default:
      // Unknown node kind — no validation needed
      break;
  }

  return errors;
}

/**
 * Validate a sequence of IR nodes.
 * Returns all errors across all nodes.
 */
export function validateIRProgram(
  nodes: IRNode[],
  ctx: ValidationContext
): ValidationError[] {
  const allErrors: ValidationError[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const errors = validateIRNode(nodes[i], ctx, `node_${i}`);
    allErrors.push(...errors);
  }

  return allErrors;
}

/**
 * Check if a program has any errors (vs warnings).
 */
export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some(e => e.severity === 'error');
}

/**
 * Get only errors (not warnings).
 */
export function getErrors(errors: ValidationError[]): ValidationError[] {
  return errors.filter(e => e.severity === 'error');
}

/**
 * Get only warnings (not errors).
 */
export function getWarnings(errors: ValidationError[]): ValidationError[] {
  return errors.filter(e => e.severity === 'warning');
}
