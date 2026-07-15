import { GameContext, boxCollision } from './types';
import { playSoundEffect } from '../../soundService';

export function loadLevel(context: GameContext, levelData: {
  tiles?: Array<{ x: number; y: number; type: string; emoji?: string }>;
  enemies?: Array<{ id: string; emoji: string; x: number; y: number; hp?: number; damage?: number; speed?: number; behavior?: string }>;
  items?: Array<{ id: string; emoji: string; x: number; y: number; type?: string }>;
  npcs?: Array<{ id: string; emoji: string; x: number; y: number; name: string; dialogue?: string[] }>;
  weather?: string;
  background?: string;
  playerStart?: { x: number; y: number };
}) {
  if (levelData.tiles) {
    context.state.tiles = levelData.tiles.map((t) => ({
      x: t.x, y: t.y, type: t.type,
      solid: ['brick', 'stone', 'crate', 'dirt', 'grass'].includes(t.type),
      emoji: t.emoji || '',
    }));
  }

  if (levelData.enemies) {
    context.state.enemies = levelData.enemies.map((e) => ({
      id: e.id, emoji: e.emoji, x: e.x, y: e.y,
      vx: 0, vy: 0, hp: e.hp || 30, maxHp: e.hp || 30,
      damage: e.damage || 10, speed: e.speed || 1,
      behavior: e.behavior || 'patrol', alive: true,
      state: 'idle', stateTimer: 0,
    }));
  }

  if (levelData.items) {
    context.state.items = levelData.items.map((i) => ({
      id: i.id, emoji: i.emoji, x: i.x, y: i.y,
      type: i.type || 'collectible', collected: false,
    }));
  }

  if (levelData.npcs) {
    context.state.npcs = levelData.npcs.map((n) => ({
      id: n.id, emoji: n.emoji, x: n.x, y: n.y,
      name: n.name, dialogue: n.dialogue || [],
      dialogueIndex: 0, isTalking: false,
    }));
  }

  if (levelData.weather) context.state.weather = levelData.weather;
  if (levelData.background) context.state.background = levelData.background;

  if (levelData.playerStart) {
    context.state.playerX = levelData.playerStart.x;
    context.state.playerY = levelData.playerStart.y;
  }
}

export function spawnParticles(context: GameContext, x: number, y: number, emoji: string, count: number) {
  for (let i = 0; i < count; i++) {
    context.state.particles.push({
      id: `particle_${Date.now()}_${i}`,
      emoji,
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
    });
  }
}

export function damagePlayer(context: GameContext, amount: number) {
  const p = context.state;
  if (p.playerInvincible) return;

  p.playerHealth -= amount;
  p.playerInvincible = true;
  p.playerInvincibleTimer = 1;
  p.combo = 0;

  spawnParticles(context, p.playerX + 16, p.playerY + 16, '💔', 3);
  playSoundEffect('hurt');

  if (p.playerHealth <= 0) {
    p.playerHealth = 0;
    p.isGameOver = true;
    playSoundEffect('death');
  }
}

export function collectItem(context: GameContext, item: { emoji: string; x: number; y: number }) {
  const p = context.state;
  p.itemsCollected++;

  switch (item.emoji) {
    case '❤️': p.playerHealth = Math.min(p.playerMaxHealth, p.playerHealth + 25); playSoundEffect('powerup'); break;
    case '🛡️': p.playerHealth = Math.min(p.playerMaxHealth, p.playerHealth + 50); playSoundEffect('powerup'); break;
    case '🪙': p.coins++; p.score += 10; playSoundEffect('coin'); break;
    case '⭐': p.score += 100; playSoundEffect('coin'); break;
    case '⚡': p.score += 50; playSoundEffect('powerup'); break;
    case '🔑': p.keys++; playSoundEffect('coin'); break;
    case '🧪': p.playerHealth = Math.min(p.playerMaxHealth, p.playerHealth + 30); playSoundEffect('powerup'); break;
    case '🔋': p.playerHealth = Math.min(p.playerMaxHealth, p.playerHealth + 40); playSoundEffect('powerup'); break;
    case '💰': p.coins += 5; p.score += 25; playSoundEffect('coin'); break;
    case '🗺️': p.score += 100; playSoundEffect('powerup'); break;
  }

  spawnParticles(context, item.x + 12, item.y + 12, '✨', 5);
}

export function startDialogue(context: GameContext, npc: { name: string; dialogue: string[]; isTalking: boolean }) {
  if (npc.dialogue.length === 0) return;
  npc.isTalking = true;
  context.state.activeDialogue = {
    speaker: npc.name,
    text: npc.dialogue[0],
    choices: [],
    isActive: true,
  };
  playSoundEffect('click');
}

export function checkCollisions(context: GameContext) {
  const p = context.state;

  p.projectiles.forEach(proj => {
    if (!proj.alive || proj.owner !== 'player') return;
    p.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      if (boxCollision(
        { x: proj.x, y: proj.y, width: 16, height: 16 },
        { x: enemy.x, y: enemy.y, width: 32, height: 32 }
      )) {
        enemy.hp -= proj.damage;
        proj.alive = false;
        spawnParticles(context, enemy.x + 16, enemy.y + 16, '💥', 3);
        playSoundEffect('explosion');

        if (enemy.hp <= 0) {
          enemy.alive = false;
          p.score += 10;
          p.combo++;
          p.maxCombo = Math.max(p.maxCombo, p.combo);
          p.enemiesDefeated++;
          p.enemies = p.enemies.filter(e => e.alive);
        }
      }
    });
  });

  if (!p.playerInvincible) {
    p.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      if (boxCollision(
        { x: p.playerX, y: p.playerY, width: 32, height: 32 },
        { x: enemy.x, y: enemy.y, width: 32, height: 32 }
      )) {
        damagePlayer(context, enemy.damage);
      }
    });
  }

  p.items.forEach(item => {
    if (item.collected) return;
    if (boxCollision(
      { x: p.playerX, y: p.playerY, width: 32, height: 32 },
      { x: item.x, y: item.y, width: 24, height: 24 }
    )) {
      item.collected = true;
      collectItem(context, item);
    }
  });

  p.npcs.forEach(npc => {
    if (boxCollision(
      { x: p.playerX, y: p.playerY, width: 32, height: 32 },
      { x: npc.x, y: npc.y, width: 32, height: 32 }
    )) {
      if (context.keys.has('KeyE') && !npc.isTalking) {
        startDialogue(context, npc);
      }
    }
  });

  p.items = p.items.filter(i => !i.collected);
}

export function spawnEnemies(context: GameContext) {
  const p = context.state;
  const maxEnemies = 3 + p.wave * 2;

  if (p.enemies.length < maxEnemies) {
    const types = ['👾', '🦇', '💀', '👺', '👻'];
    const behaviors = ['patrol', 'chase', 'float_h', 'shoot', 'teleport'];
    const emoji = types[Math.floor(Math.random() * types.length)];
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

    p.enemies.push({
      id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      x: Math.random() * (p.worldWidth - 40),
      y: -40,
      vx: 0, vy: 0,
      hp: 20 + p.wave * 5,
      maxHp: 20 + p.wave * 5,
      damage: 5 + p.wave * 2,
      speed: 0.5 + p.wave * 0.1,
      behavior,
      alive: true,
      state: 'idle',
      stateTimer: 0,
    });
  }
}

function spawnBoss(context: GameContext) {
  const p = context.state;
  p.enemies.push({
    id: `boss_${Date.now()}`,
    emoji: '🐲',
    x: p.worldWidth / 2 - 32,
    y: -80,
    vx: 0, vy: 1,
    hp: 200 + p.wave * 20,
    maxHp: 200 + p.wave * 20,
    damage: 30,
    speed: 1,
    behavior: 'chase',
    alive: true,
    state: 'idle',
    stateTimer: 0,
  });
  p.weather = 'storm';
  playSoundEffect('explosion');
}

export function checkGameState(context: GameContext) {
  const p = context.state;

  if (p.score > p.wave * 100 && p.enemies.length === 0) {
    p.wave++;
    p.combo = 0;
    playSoundEffect('powerup');
  }

  if (p.wave % 5 === 0 && p.enemies.length === 0) {
    spawnBoss(context);
  }

  if (p.score >= 1000) {
    p.isVictory = true;
    playSoundEffect('victory');
  }
}
