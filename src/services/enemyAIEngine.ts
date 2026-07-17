/**
 * Enemy AI Engine - Improvements #31-42
 * State machine, A* pathfinding, alert system, group coordination,
 * death animations, loot drops, enemy HP from definitions
 */

import { GameEntity, Tile } from '../types';
import { ENEMY_TYPES, getEnemyById, EnemyType } from '../constants/enemies';

// ─── Enemy State Machine (#33) ───

export type EnemyState = 'idle' | 'patrol' | 'alert' | 'chase' | 'attack' | 'retreat' | 'stunned' | 'dead';

export interface EnemyAI {
  state: EnemyState;
  stateTimer: number;
  alertLevel: number; // 0-100
  lastKnownPlayerX: number;
  lastKnownPlayerY: number;
  patrolOriginX: number;
  patrolDirection: number;
  attackCooldown: number;
  detectionRange: number;
  attackRange: number;
  detectionAngle: number; // degrees, 360 = all around
  facingDirection: number;
  deathTimer: number;
  lootDropped: boolean;
  enemyType: EnemyType | null;
}

export function createEnemyAI(entity: GameEntity): EnemyAI {
  const enemyDef = entity.emoji ? getEnemyByEmoji(entity.emoji) : null;
  return {
    state: 'patrol',
    stateTimer: 0,
    alertLevel: 0,
    lastKnownPlayerX: 0,
    lastKnownPlayerY: 0,
    patrolOriginX: entity.initialX || entity.x,
    patrolDirection: 1,
    attackCooldown: 0,
    detectionRange: 200,
    attackRange: 40,
    detectionAngle: 180,
    facingDirection: 1,
    deathTimer: 0,
    lootDropped: false,
    enemyType: enemyDef,
  };
}

function getEnemyByEmoji(emoji: string): EnemyType | null {
  return ENEMY_TYPES.find(e => e.emoji === emoji) || null;
}

// ─── AI State Transitions (#33, #37) ───

export function updateEnemyAI(
  ai: EnemyAI,
  entity: GameEntity,
  playerX: number,
  playerY: number,
  tilemap: Tile[],
  allEnemies: GameEntity[]
): { ai: EnemyAI; entity: GameEntity } {
  const newAI = { ...ai };
  const newEntity = { ...entity };

  if (newAI.state === 'dead') {
    newAI.deathTimer++;
    return { ai: newAI, entity: newEntity };
  }

  // Decrease timers
  newAI.stateTimer++;
  if (newAI.attackCooldown > 0) newAI.attackCooldown--;

  const distToPlayer = Math.hypot(playerX - entity.x, playerY - entity.y);
  const angleToPlayer = Math.atan2(playerY - entity.y, playerX - entity.x) * (180 / Math.PI);

  // Check if player is in detection cone (#37)
  const isInDetectionRange = distToPlayer < newAI.detectionRange;
  const isInDetectionAngle = Math.abs(angleToPlayer) < newAI.detectionAngle / 2 ||
    Math.abs(angleToPlayer - 360) < newAI.detectionAngle / 2 ||
    Math.abs(angleToPlayer + 360) < newAI.detectionAngle / 2;

  const canSeePlayer = isInDetectionRange && (newAI.detectionAngle >= 360 || isInDetectionAngle);

  // Check line of sight (simple raycast through tiles)
  const hasLineOfSight = checkLineOfSight(entity.x, entity.y, playerX, playerY, tilemap);

  // State machine
  switch (newAI.state) {
    case 'idle':
      if (canSeePlayer && hasLineOfSight) {
        newAI.state = 'alert';
        newAI.alertLevel = 30;
        newAI.lastKnownPlayerX = playerX;
        newAI.lastKnownPlayerY = playerY;
      } else if (newAI.stateTimer > 120) {
        newAI.state = 'patrol';
        newAI.stateTimer = 0;
      }
      break;

    case 'patrol':
      // Move back and forth
      const patrolRange = entity.range || 100;
      const patrolDist = entity.x - newAI.patrolOriginX;
      if (Math.abs(patrolDist) > patrolRange) {
        newAI.patrolDirection *= -1;
      }
      newEntity.vx = newAI.patrolDirection * (entity.vx || 1);
      newAI.facingDirection = newAI.patrolDirection;

      if (canSeePlayer && hasLineOfSight) {
        newAI.state = 'alert';
        newAI.alertLevel = 30;
        newAI.lastKnownPlayerX = playerX;
        newAI.lastKnownPlayerY = playerY;
        newAI.stateTimer = 0;
      }
      break;

    case 'alert':
      // Spotted player, ramp up alert
      newAI.alertLevel = Math.min(100, newAI.alertLevel + 2);
      newAI.lastKnownPlayerX = playerX;
      newAI.lastKnownPlayerY = playerY;
      newEntity.vx = 0; // Stop and look

      if (newAI.alertLevel >= 80) {
        newAI.state = 'chase';
        newAI.stateTimer = 0;
      } else if (!canSeePlayer && newAI.stateTimer > 60) {
        newAI.state = 'patrol';
        newAI.alertLevel = 0;
        newAI.stateTimer = 0;
      }
      break;

    case 'chase':
      // Move toward player
      if (canSeePlayer) {
        newAI.lastKnownPlayerX = playerX;
        newAI.lastKnownPlayerY = playerY;
      }

      const dx = newAI.lastKnownPlayerX - entity.x;
      const dy = newAI.lastKnownPlayerY - entity.y;
      const chaseDist = Math.hypot(dx, dy);

      if (chaseDist > 2) {
        const speed = (entity.vx || 1) * 1.5;
        newEntity.vx = (dx / chaseDist) * speed;
        newEntity.vy = (dy / chaseDist) * speed;
        newAI.facingDirection = dx > 0 ? 1 : -1;
      }

      // Transition to attack when close enough
      if (chaseDist < newAI.attackRange) {
        newAI.state = 'attack';
        newAI.stateTimer = 0;
      }

      // Lost player
      if (!canSeePlayer && newAI.stateTimer > 120) {
        newAI.state = 'patrol';
        newAI.alertLevel = 0;
        newAI.stateTimer = 0;
        newEntity.vx = newAI.patrolDirection * (entity.vx || 1);
      }
      break;

    case 'attack':
      newEntity.vx = 0;
      if (newAI.attackCooldown <= 0) {
        // Perform attack (return attack data for game loop to handle)
        newAI.attackCooldown = 60; // 1 second cooldown
      }

      // Return to chase if player moves away
      if (distToPlayer > newAI.attackRange * 1.5) {
        newAI.state = 'chase';
        newAI.stateTimer = 0;
      }
      break;

    case 'retreat':
      // Move away from player
      const rdx = entity.x - playerX;
      const rdy = entity.y - playerY;
      const retreatDist = Math.hypot(rdx, rdy);
      if (retreatDist > 0 && retreatDist < 300) {
        newEntity.vx = (rdx / retreatDist) * (entity.vx || 2);
        newEntity.vy = (rdy / retreatDist) * (entity.vy || 2);
      }

      if (newAI.stateTimer > 60 || distToPlayer > 400) {
        newAI.state = 'patrol';
        newAI.stateTimer = 0;
      }
      break;

    case 'stunned':
      newEntity.vx = 0;
      if (newAI.stateTimer > 30) {
        newAI.state = 'chase';
        newAI.stateTimer = 0;
      }
      break;
  }

  return { ai: newAI, entity: newEntity };
}

// ─── Line of Sight Check (#37) ───

function checkLineOfSight(
  x1: number, y1: number,
  x2: number, y2: number,
  tilemap: Tile[]
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.ceil(dist / 20);
  const TILE_SIZE = 40;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const checkX = x1 + dx * t;
    const checkY = y1 + dy * t;
    const tileX = Math.floor(checkX / TILE_SIZE);
    const tileY = Math.floor(checkY / TILE_SIZE);

    const blocked = tilemap.some(tile =>
      tile.x === tileX && tile.y === tileY &&
      ['brick', 'stone', 'dirt', 'grass', 'crate'].includes(tile.type)
    );
    if (blocked) return false;
  }
  return true;
}

// ─── Group Coordination (#38) ───

export function coordinateGroupBehavior(
  enemies: { entity: GameEntity; ai: EnemyAI }[],
  playerX: number,
  playerY: number
): { entity: GameEntity; ai: EnemyAI }[] {
  const chasingEnemies = enemies.filter(e => e.ai.state === 'chase' || e.ai.state === 'attack');

  if (chasingEnemies.length < 2) return enemies;

  // Calculate flanking positions
  return enemies.map(({ entity, ai }) => {
    if (ai.state !== 'chase') return { entity, ai };

    // Try to spread out around player
    const myAngle = Math.atan2(entity.y - playerY, entity.x - playerX);
    const repulsionForce = { x: 0, y: 0 };

    for (const other of chasingEnemies) {
      if (other.entity.id === entity.id) continue;
      const dx = entity.x - other.entity.x;
      const dy = entity.y - other.entity.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 60 && dist > 0) {
        repulsionForce.x += (dx / dist) * 0.5;
        repulsionForce.y += (dy / dist) * 0.5;
      }
    }

    return {
      entity: {
        ...entity,
        vx: (entity.vx || 0) + repulsionForce.x,
        vy: (entity.vy || 0) + repulsionForce.y,
      },
      ai,
    };
  });
}

// ─── Death Animation (#40) ───

export function processEnemyDeath(ai: EnemyAI): { removeEntity: boolean; deathProgress: number } {
  if (ai.state !== 'dead') return { removeEntity: false, deathProgress: 0 };
  const progress = Math.min(1, ai.deathTimer / 30); // 30 frames to fully die
  return { removeEntity: ai.deathTimer > 30, deathProgress: progress };
}

// ─── Loot Drop on Death (#42) ───

export interface LootDropResult {
  itemId: string;
  name: string;
  icon: string;
  quantity: number;
  x: number;
  y: number;
}

export function rollEnemyLoot(
  enemyEmoji: string,
  x: number,
  y: number
): LootDropResult[] {
  const enemyDef = getEnemyByEmoji(enemyEmoji);
  if (!enemyDef) return [];

  const drops: LootDropResult[] = [];

  // XP reward (always drops)
  drops.push({
    itemId: 'xp_orb',
    name: `${enemyDef.xpReward} XP`,
    icon: '⭐',
    quantity: enemyDef.xpReward,
    x, y,
  });

  // Gold drop (50% chance)
  if (Math.random() < 0.5) {
    drops.push({
      itemId: 'gold',
      name: 'Gold',
      icon: '🪙',
      quantity: 5 + Math.floor(Math.random() * 10),
      x, y,
    });
  }

  // Item drop based on enemy drops field
  if (enemyDef.drops && Math.random() < 0.3) {
    drops.push({
      itemId: enemyDef.drops,
      name: enemyDef.drops,
      icon: getItemIcon(enemyDef.drops),
      quantity: 1,
      x, y,
    });
  }

  return drops;
}

function getItemIcon(itemId: string): string {
  const icons: Record<string, string> = {
    coin: '🪙', bone: '🦴', wing: '🦇', ether: '💎', gem: '💎',
    arrow: '🏹', pelt: '🐺', scroll: '📜', treasure: '📦',
    eye: '👁️', armor: '🛡️', skull: '☠️', scale: '🐉',
    crown: '👑', trident: '🔱',
  };
  return icons[itemId] || '📦';
}

// ─── Alert Call (#38) ───

export function callForHelp(
  alertSource: { x: number; y: number },
  allies: { entity: GameEntity; ai: EnemyAI }[],
  range: number = 300
): { entity: GameEntity; ai: EnemyAI }[] {
  return allies.map(({ entity, ai }) => {
    if (ai.state !== 'patrol' && ai.state !== 'idle') return { entity, ai };

    const dist = Math.hypot(entity.x - alertSource.x, entity.y - alertSource.y);
    if (dist < range) {
      return {
        entity,
        ai: {
          ...ai,
          state: 'alert' as EnemyState,
          alertLevel: 50,
          lastKnownPlayerX: alertSource.x,
          lastKnownPlayerY: alertSource.y,
          stateTimer: 0,
        },
      };
    }
    return { entity, ai };
  });
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 5 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Flanking Behavior ───
// Enemies try to approach from different angles

export function calculateFlankingPosition(
  enemyX: number,
  enemyY: number,
  playerX: number,
  playerY: number,
  allyPositions: { x: number; y: number }[],
  preferredAngle: number = 0
): { x: number; y: number } {
  // Find angle away from allies
  const angles = allyPositions.map(ally => Math.atan2(ally.y - enemyY, ally.x - enemyX));
  
  // Try different angles to find one that's far from allies
  let bestAngle = preferredAngle;
  let bestMinDist = 0;

  for (let testAngle = 0; testAngle < Math.PI * 2; testAngle += Math.PI / 4) {
    const minDist = angles.reduce((min, a) => {
      const diff = Math.abs(testAngle - a);
      return Math.min(min, Math.min(diff, Math.PI * 2 - diff));
    }, Infinity);

    if (minDist > bestMinDist) {
      bestMinDist = minDist;
      bestAngle = testAngle;
    }
  }

  // Move toward player but offset by best angle
  const dist = Math.hypot(playerX - enemyX, playerY - enemyY);
  const targetDist = Math.min(50, dist * 0.7);
  
  return {
    x: playerX + Math.cos(bestAngle) * targetDist,
    y: playerY + Math.sin(bestAngle) * targetDist,
  };
}

// ─── Retreat When Low HP ───

export function shouldRetreat(
  currentHP: number,
  maxHP: number,
  retreatThreshold: number = 0.3
): boolean {
  return currentHP / maxHP <= retreatThreshold;
}

export function calculateRetreatPosition(
  enemyX: number,
  enemyY: number,
  playerX: number,
  playerY: number,
  retreatDistance: number = 200
): { x: number; y: number } {
  const angle = Math.atan2(enemyY - playerY, enemyX - playerX);
  return {
    x: enemyX + Math.cos(angle) * retreatDistance,
    y: enemyY + Math.sin(angle) * retreatDistance,
  };
}

// ─── Group Tactics ───

export interface GroupTactic {
  name: string;
  description: string;
  minEnemies: number;
  execute: (enemies: { x: number; y: number; ai: EnemyAI }[], playerX: number, playerY: number) => { x: number; y: number }[];
}

export const GROUP_TACTICS: GroupTactic[] = [
  {
    name: 'surround',
    description: 'Surround the player from all sides',
    minEnemies: 3,
    execute: (enemies, playerX, playerY) => {
      const angleStep = (Math.PI * 2) / enemies.length;
      return enemies.map((enemy, i) => {
        const angle = angleStep * i;
        return {
          x: playerX + Math.cos(angle) * 80,
          y: playerY + Math.sin(angle) * 80,
        };
      });
    },
  },
  {
    name: 'flank',
    description: 'Attack from two sides simultaneously',
    minEnemies: 2,
    execute: (enemies, playerX, playerY) => {
      const angle = Math.atan2(enemies[0].y - playerY, enemies[0].x - playerX);
      return [
        { x: playerX + Math.cos(angle + Math.PI / 3) * 60, y: playerY + Math.sin(angle + Math.PI / 3) * 60 },
        { x: playerX + Math.cos(angle - Math.PI / 3) * 60, y: playerY + Math.sin(angle - Math.PI / 3) * 60 },
      ];
    },
  },
  {
    name: 'retreat_and_rally',
    description: 'Retreat to heal, then attack together',
    minEnemies: 2,
    execute: (enemies, playerX, playerY) => {
      const retreatX = (enemies[0].x + enemies[1].x) / 2;
      const retreatY = Math.min(enemies[0].y, enemies[1].y) - 100;
      return [
        { x: retreatX - 30, y: retreatY },
        { x: retreatX + 30, y: retreatY },
      ];
    },
  },
];

export function selectBestTactic(
  enemyCount: number,
  playerHealth: number,
  playerMaxHealth: number
): GroupTactic | null {
  if (enemyCount < 2) return null;

  // Use surround if many enemies
  if (enemyCount >= 3) {
    return GROUP_TACTICS.find(t => t.name === 'surround') || null;
  }

  // Use flank if player is healthy (aggressive)
  if (playerHealth / playerMaxHealth > 0.5) {
    return GROUP_TACTICS.find(t => t.name === 'flank') || null;
  }

  // Use retreat and rally if player is low (defensive)
  return GROUP_TACTICS.find(t => t.name === 'retreat_and_rally') || null;
}

// ─── Enemy Difficulty Scaling ───

export function scaleEnemyStats(
  enemy: GameEntity,
  waveNumber: number,
  difficulty: string
): GameEntity {
  const difficultyMult: Record<string, number> = {
    easy: 0.7,
    normal: 1.0,
    hard: 1.5,
    insane: 2.0,
  };

  const mult = (difficultyMult[difficulty] || 1.0) * (1 + (waveNumber - 1) * 0.1);

  return {
    ...enemy,
    vx: (enemy.vx || 1) * Math.min(2, 1 + (waveNumber - 1) * 0.05),
  } as GameEntity;
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 14 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── A* Pathfinding (#51) ───

export interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export function aStarPathfind(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  tilemap: Tile[],
  tileSize: number = 40
): { x: number; y: number }[] {
  const startTileX = Math.floor(startX / tileSize);
  const startTileY = Math.floor(startY / tileSize);
  const endTileX = Math.floor(endX / tileSize);
  const endTileY = Math.floor(endY / tileSize);

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  const heuristic = (x: number, y: number) =>
    Math.abs(x - endTileX) + Math.abs(y - endTileY);

  const startNode: PathNode = {
    x: startTileX, y: startTileY,
    g: 0, h: heuristic(startTileX, startTileY),
    f: heuristic(startTileX, startTileY), parent: null,
  };
  openSet.push(startNode);

  const isBlocked = (x: number, y: number) =>
    tilemap.some(t => t.x === x && t.y === y &&
      ['brick', 'stone', 'dirt', 'grass', 'crate'].includes(t.type));

  const neighbors = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
  ];

  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) => a.f < b.f ? a : b);
    if (current.x === endTileX && current.y === endTileY) {
      const path: { x: number; y: number }[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift({ x: node.x * tileSize + tileSize / 2, y: node.y * tileSize + tileSize / 2 });
        node = node.parent;
      }
      return path;
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(`${current.x},${current.y}`);

    for (const n of neighbors) {
      const nx = current.x + n.dx;
      const ny = current.y + n.dy;
      if (closedSet.has(`${nx},${ny}`) || isBlocked(nx, ny)) continue;

      const moveCost = (n.dx !== 0 && n.dy !== 0) ? 1.414 : 1;
      const g = current.g + moveCost;
      const existing = openSet.find(o => o.x === nx && o.y === ny);

      if (!existing || g < existing.g) {
        const node: PathNode = {
          x: nx, y: ny, g, h: heuristic(nx, ny),
          f: g + heuristic(nx, ny), parent: current,
        };
        if (existing) {
          existing.g = node.g;
          existing.f = node.f;
          existing.parent = node.parent;
        } else {
          openSet.push(node);
        }
      }
    }
  }
  return [];
}

// ─── Formation AI (#52) ───

export interface FormationConfig {
  type: 'line' | 'circle' | 'v' | 'grid' | 'random';
  spacing: number;
  followLeader: boolean;
}

export function calculateFormationPosition(
  index: number,
  total: number,
  leaderX: number,
  leaderY: number,
  config: FormationConfig
): { x: number; y: number } {
  switch (config.type) {
    case 'line':
      return {
        x: leaderX - index * config.spacing,
        y: leaderY,
      };
    case 'circle': {
      const angle = (index / total) * Math.PI * 2;
      return {
        x: leaderX + Math.cos(angle) * config.spacing * 2,
        y: leaderY + Math.sin(angle) * config.spacing * 2,
      };
    }
    case 'v': {
      const side = index % 2 === 0 ? 1 : -1;
      const rank = Math.ceil(index / 2);
      return {
        x: leaderX - rank * config.spacing,
        y: leaderY + side * rank * config.spacing * 0.5,
      };
    }
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(total));
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        x: leaderX + (col - cols / 2) * config.spacing,
        y: leaderY + (row - Math.floor(total / cols) / 2) * config.spacing,
      };
    }
    default:
      return {
        x: leaderX + (Math.random() - 0.5) * config.spacing * 4,
        y: leaderY + (Math.random() - 0.5) * config.spacing * 4,
      };
  }
}

export function applyFormationMovement(
  enemies: { entity: GameEntity; ai: EnemyAI }[],
  playerX: number,
  playerY: number,
  config: FormationConfig
): { entity: GameEntity; ai: EnemyAI }[] {
  if (enemies.length < 2) return enemies;
  const leader = enemies[0];

  return enemies.map(({ entity, ai }, index) => {
    if (index === 0) return { entity, ai };
    if (ai.state !== 'chase') return { entity, ai };

    const target = calculateFormationPosition(
      index, enemies.length,
      leader.entity.x, leader.entity.y,
      config
    );

    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      return {
        entity: {
          ...entity,
          vx: (dx / dist) * (entity.vx || 1),
          vy: (dy / dist) * (entity.vy || 1),
        },
        ai,
      };
    }
    return { entity, ai };
  });
}

// ─── Aggression Levels (#53) ───

export interface AggressionSystem {
  baseAggression: number;
  playerLevel: number;
  killCount: number;
  timeInCombat: number;
  currentAggression: number;
}

export function createAggressionSystem(baseAggression: number = 50): AggressionSystem {
  return {
    baseAggression,
    playerLevel: 1,
    killCount: 0,
    timeInCombat: 0,
    currentAggression: baseAggression,
  };
}

export function updateAggression(
  system: AggressionSystem,
  playerLevel: number,
  enemyKilled: boolean,
  inCombat: boolean
): AggressionSystem {
  const newSystem = { ...system };
  newSystem.playerLevel = playerLevel;
  if (enemyKilled) newSystem.killCount++;
  if (inCombat) newSystem.timeInCombat++;

  const levelFactor = Math.max(0, (playerLevel - 5) * 2);
  const killFactor = Math.min(30, newSystem.killCount * 3);
  const combatFactor = Math.min(20, newSystem.timeInCombat * 0.1);

  newSystem.currentAggression = Math.min(100,
    newSystem.baseAggression + levelFactor + killFactor + combatFactor
  );

  return newSystem;
}

export function getAggressionModifiers(aggression: number): {
  speedMultiplier: number;
  damageMultiplier: number;
  detectionRangeBonus: number;
  retreatThreshold: number;
} {
  const factor = aggression / 100;
  return {
    speedMultiplier: 1 + factor * 0.5,
    damageMultiplier: 1 + factor * 0.3,
    detectionRangeBonus: factor * 100,
    retreatThreshold: 0.3 - factor * 0.2,
  };
}

// ─── Enhanced Retreat Behavior (#54) ───

export interface RetreatStrategy {
  type: 'flee' | 'kite' | 'group_retreat' | 'feint';
  preferredDistance: number;
  useCover: boolean;
}

export function calculateAdvancedRetreat(
  enemyX: number,
  enemyY: number,
  playerX: number,
  playerY: number,
  healthPercent: number,
  tilemap: Tile[],
  strategy: RetreatStrategy = { type: 'flee', preferredDistance: 200, useCover: false }
): { x: number; y: number } | null {
  const angleFromPlayer = Math.atan2(enemyY - playerY, enemyX - playerX);

  switch (strategy.type) {
    case 'flee':
      return {
        x: enemyX + Math.cos(angleFromPlayer) * strategy.preferredDistance,
        y: enemyY + Math.sin(angleFromPlayer) * strategy.preferredDistance,
      };
    case 'kite': {
      const perpAngle = angleFromPlayer + Math.PI / 2;
      return {
        x: enemyX + Math.cos(perpAngle) * strategy.preferredDistance * 0.5,
        y: enemyY + Math.sin(perpAngle) * strategy.preferredDistance * 0.5,
      };
    }
    case 'feint': {
      const fakeAngle = angleFromPlayer + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 4;
      return {
        x: enemyX + Math.cos(fakeAngle) * strategy.preferredDistance * 0.7,
        y: enemyY + Math.sin(fakeAngle) * strategy.preferredDistance * 0.7,
      };
    }
    case 'group_retreat': {
      const retreatAngle = angleFromPlayer;
      return {
        x: enemyX + Math.cos(retreatAngle) * strategy.preferredDistance,
        y: enemyY + Math.sin(retreatAngle) * strategy.preferredDistance,
      };
    }
    default:
      return null;
  }
}

export function shouldUseRetreatStrategy(
  healthPercent: number,
  aggression: number,
  allyCount: number
): RetreatStrategy {
  if (healthPercent < 0.2) {
    return { type: 'flee', preferredDistance: 300, useCover: true };
  }
  if (allyCount >= 3) {
    return { type: 'group_retreat', preferredDistance: 150, useCover: false };
  }
  if (aggression > 70) {
    return { type: 'kite', preferredDistance: 100, useCover: false };
  }
  return { type: 'feint', preferredDistance: 120, useCover: false };
}

// ─── Ambient Behavior (#55) ───

export interface AmbientBehavior {
  type: 'wander' | 'sleep' | 'eat' | 'socialize' | 'investigate' | 'idle';
  duration: number;
  animation?: string;
}

export function calculateAmbientBehavior(
  timeOfDay: number,
  playerDistance: number,
  enemyType: string,
  tilemap: Tile[]
): AmbientBehavior {
  const behaviors: AmbientBehavior[] = [];

  if (playerDistance > 500) {
    if (enemyType === 'bat' && (timeOfDay > 18 || timeOfDay < 6)) {
      behaviors.push({ type: 'wander', duration: 120, animation: 'fly' });
    } else if (enemyType === 'skeleton') {
      behaviors.push({ type: 'wander', duration: 180, animation: 'walk' });
    } else if (enemyType === 'slime') {
      behaviors.push({ type: 'idle', duration: 240, animation: 'bounce' });
    } else {
      behaviors.push({ type: 'wander', duration: 150 });
    }
  }

  if (behaviors.length === 0) {
    behaviors.push({ type: 'idle', duration: 60 });
  }

  return behaviors[0];
}

export function updateAmbientState(
  ai: EnemyAI,
  ambient: AmbientBehavior,
  entity: GameEntity
): { ai: EnemyAI; entity: GameEntity } {
  const newAI = { ...ai };
  const newEntity = { ...entity };

  switch (ambient.type) {
    case 'wander':
      newEntity.vx = Math.sin(ai.stateTimer * 0.05) * 0.5;
      newEntity.vy = Math.cos(ai.stateTimer * 0.03) * 0.3;
      break;
    case 'sleep':
      newEntity.vx = 0;
      newEntity.vy = 0;
      break;
    case 'eat':
      newEntity.vx = Math.sin(ai.stateTimer * 0.1) * 0.2;
      break;
    case 'socialize':
      newEntity.vx = Math.cos(ai.stateTimer * 0.02) * 0.4;
      break;
    default:
      break;
  }

  return { ai: newAI, entity: newEntity };
}

// ─── Patrol Patterns ───

export type PatrolPattern = 'linear' | 'circular' | 'figure8' | 'random' | 'sine';

export function calculatePatrolPosition(
  originX: number,
  originY: number,
  time: number,
  pattern: PatrolPattern,
  range: number = 100,
  speed: number = 1
): { x: number; y: number } {
  const t = time * speed * 0.01;

  switch (pattern) {
    case 'linear':
      return {
        x: originX + Math.sin(t) * range,
        y: originY,
      };
    case 'circular':
      return {
        x: originX + Math.cos(t) * range,
        y: originY + Math.sin(t) * range,
      };
    case 'figure8':
      return {
        x: originX + Math.sin(t) * range,
        y: originY + Math.sin(t * 2) * range * 0.5,
      };
    case 'random':
      return {
        x: originX + (Math.random() - 0.5) * range * 2,
        y: originY + (Math.random() - 0.5) * range * 2,
      };
    case 'sine':
      return {
        x: originX + Math.sin(t) * range,
        y: originY + Math.cos(t * 0.5) * range * 0.3,
      };
    default:
      return { x: originX, y: originY };
  }
}

// ─── Alert Level System ───

export interface AlertLevel {
  level: number; // 0-100
  decayRate: number;
  increaseRate: number;
  maxLevel: number;
}

export function createAlertLevel(): AlertLevel {
  return {
    level: 0,
    decayRate: 0.5,
    increaseRate: 10,
    maxLevel: 100,
  };
}

export function increaseAlertLevel(
  state: AlertLevel,
  amount: number
): AlertLevel {
  return {
    ...state,
    level: Math.min(state.maxLevel, state.level + amount),
  };
}

export function decreaseAlertLevel(state: AlertLevel): AlertLevel {
  return {
    ...state,
    level: Math.max(0, state.level - state.decayRate),
  };
}

export function getAlertStatus(level: number): string {
  if (level >= 80) return 'combat';
  if (level >= 50) return 'alert';
  if (level >= 20) return 'suspicious';
  return 'idle';
}

// ─── Enemy Behavior Tree ───

export type BehaviorNode = {
  type: 'condition' | 'action' | 'sequence' | 'selector';
  children?: BehaviorNode[];
  condition?: () => boolean;
  action?: () => void;
};

export function createBehaviorTree(
  conditions: (() => boolean)[],
  actions: (() => void)[]
): BehaviorNode {
  return {
    type: 'selector',
    children: conditions.map((cond, i) => ({
      type: 'sequence',
      children: [
        { type: 'condition', condition: cond },
        { type: 'action', action: actions[i] || (() => {}) },
      ],
    })),
  };
}

// ─── Enemy Spawning Patterns ───

export interface SpawnPattern {
  name: string;
  description: string;
  enemyCount: number;
  spawnDelay: number;
  spawnRadius: number;
}

export const SPAWN_PATTERNS: SpawnPattern[] = [
  { name: 'wave', description: 'Enemies spawn in a line', enemyCount: 5, spawnDelay: 500, spawnRadius: 100 },
  { name: 'circle', description: 'Enemies spawn in a circle', enemyCount: 8, spawnDelay: 300, spawnRadius: 150 },
  { name: 'random', description: 'Enemies spawn randomly', enemyCount: 6, spawnDelay: 400, spawnRadius: 200 },
  { name: 'boss_rush', description: 'One powerful enemy', enemyCount: 1, spawnDelay: 0, spawnRadius: 0 },
];

export function getSpawnPositions(
  pattern: SpawnPattern,
  centerX: number,
  centerY: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  switch (pattern.name) {
    case 'wave':
      for (let i = 0; i < pattern.enemyCount; i++) {
        positions.push({
          x: centerX - (pattern.enemyCount * 20) + i * 40,
          y: centerY,
        });
      }
      break;
    case 'circle':
      for (let i = 0; i < pattern.enemyCount; i++) {
        const angle = (i / pattern.enemyCount) * Math.PI * 2;
        positions.push({
          x: centerX + Math.cos(angle) * pattern.spawnRadius,
          y: centerY + Math.sin(angle) * pattern.spawnRadius,
        });
      }
      break;
    case 'random':
      for (let i = 0; i < pattern.enemyCount; i++) {
        positions.push({
          x: centerX + (Math.random() - 0.5) * pattern.spawnRadius * 2,
          y: centerY + (Math.random() - 0.5) * pattern.spawnRadius * 2,
        });
      }
      break;
    case 'boss_rush':
      positions.push({ x: centerX, y: centerY });
      break;
  }

  return positions;
}

// ─── Enemy Health Bar Data ───

export interface EnemyHealthBarData {
  entityId: string;
  currentHP: number;
  maxHP: number;
  name: string;
  emoji: string;
  showBar: boolean;
}

export function createEnemyHealthBarData(
  entity: GameEntity,
  currentHP: number,
  maxHP: number
): EnemyHealthBarData {
  return {
    entityId: entity.id,
    currentHP,
    maxHP,
    name: ('name' in entity ? (entity as GameEntity & { name?: string }).name : undefined) || 'Enemy',
    emoji: entity.emoji || '👾',
    showBar: true,
  };
}

// ─── Enemy Loot Table ───

export interface EnemyLootEntry {
  itemId: string;
  itemName: string;
  itemIcon: string;
  dropChance: number;
  minQuantity: number;
  maxQuantity: number;
}

export const ENEMY_LOOT_TABLES: Record<string, EnemyLootEntry[]> = {
  slime: [
    { itemId: 'slime_gel', itemName: 'Slime Gel', itemIcon: '🟢', dropChance: 0.5, minQuantity: 1, maxQuantity: 3 },
    { itemId: 'coin', itemName: 'Gold Coin', itemIcon: '🪙', dropChance: 0.3, minQuantity: 1, maxQuantity: 5 },
  ],
  bat: [
    { itemId: 'bat_wing', itemName: 'Bat Wing', itemIcon: '🦇', dropChance: 0.4, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'coin', itemName: 'Gold Coin', itemIcon: '🪙', dropChance: 0.2, minQuantity: 1, maxQuantity: 3 },
  ],
  skeleton: [
    { itemId: 'bone', itemName: 'Bone', itemIcon: '🦴', dropChance: 0.6, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'rusty_sword', itemName: 'Rusty Sword', itemIcon: '⚔️', dropChance: 0.1, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'coin', itemName: 'Gold Coin', itemIcon: '🪙', dropChance: 0.5, minQuantity: 2, maxQuantity: 8 },
  ],
  ghost: [
    { itemId: 'ectoplasm', itemName: 'Ectoplasm', itemIcon: '👻', dropChance: 0.3, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'coin', itemName: 'Gold Coin', itemIcon: '🪙', dropChance: 0.4, minQuantity: 3, maxQuantity: 10 },
  ],
  dragon: [
    { itemId: 'dragon_scale', itemName: 'Dragon Scale', itemIcon: '🐉', dropChance: 0.8, minQuantity: 2, maxQuantity: 5 },
    { itemId: 'dragon_fang', itemName: 'Dragon Fang', itemIcon: '🦷', dropChance: 0.5, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'legendary_gem', itemName: 'Legendary Gem', itemIcon: '💎', dropChance: 0.2, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'coin', itemName: 'Gold Coin', itemIcon: '🪙', dropChance: 1.0, minQuantity: 50, maxQuantity: 100 },
  ],
};

export function rollEnemyLootFromTable(enemyType: string): { item: EnemyLootEntry; quantity: number }[] {
  const table = ENEMY_LOOT_TABLES[enemyType] || ENEMY_LOOT_TABLES['slime'];
  const drops: { item: EnemyLootEntry; quantity: number }[] = [];

  for (const entry of table) {
    if (Math.random() < entry.dropChance) {
      const quantity = entry.minQuantity + Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1));
      drops.push({ item: entry, quantity });
    }
  }

  return drops;
}
