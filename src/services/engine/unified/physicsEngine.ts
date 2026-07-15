import { GameContext, boxCollision } from './types';
import { playSoundEffect } from '../../soundService';

export function updatePlayer(context: GameContext, dt: number) {
  const p = context.state;
  if (p.playerHealth <= 0) return;

  if (p.playerInvincible) {
    p.playerInvincibleTimer -= dt;
    if (p.playerInvincibleTimer <= 0) p.playerInvincible = false;
  }

  if (context.keys.has('ArrowLeft') || context.keys.has('KeyA')) {
    p.playerVx = -p.playerSpeed;
    p.playerFacing = 'left';
  } else if (context.keys.has('ArrowRight') || context.keys.has('KeyD')) {
    p.playerVx = p.playerSpeed;
    p.playerFacing = 'right';
  } else {
    p.playerVx *= p.friction;
  }

  if ((context.keys.has('Space') || context.keys.has('KeyW') || context.keys.has('ArrowUp')) && p.playerIsGrounded) {
    p.playerVy = -p.playerJumpForce;
    p.playerIsGrounded = false;
    playSoundEffect('jump');
  }

  p.playerVy += p.gravity;
  p.playerX += p.playerVx;
  p.playerY += p.playerVy;

  p.playerIsGrounded = false;
  context.state.tiles.forEach(tile => {
    if (!tile.solid) return;
    if (boxCollision(
      { x: p.playerX, y: p.playerY, width: 32, height: 32 },
      { x: tile.x, y: tile.y, width: context.tileSize, height: context.tileSize }
    )) {
      const overlapLeft = (p.playerX + 32) - tile.x;
      const overlapRight = (tile.x + context.tileSize) - p.playerX;
      const overlapTop = (p.playerY + 32) - tile.y;
      const overlapBottom = (tile.y + context.tileSize) - p.playerY;

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop) {
        p.playerY = tile.y - 32;
        p.playerVy = 0;
        p.playerIsGrounded = true;
      } else if (minOverlap === overlapBottom) {
        p.playerY = tile.y + context.tileSize;
        p.playerVy = 0;
      } else if (minOverlap === overlapLeft) {
        p.playerX = tile.x - 32;
        p.playerVx = 0;
      } else if (minOverlap === overlapRight) {
        p.playerX = tile.x + context.tileSize;
        p.playerVx = 0;
      }
    }
  });

  p.playerX = Math.max(0, Math.min(p.worldWidth - 32, p.playerX));
  p.playerY = Math.max(0, Math.min(p.worldHeight - 32, p.playerY));

  if (context.keys.has('KeyZ') || context.keys.has('KeyX')) {
    playerShoot(context);
  }

  p.distanceTraveled += Math.abs(p.playerVx) * dt;
}

function playerShoot(context: GameContext) {
  const now = Date.now();
  const lastShot = context.state._lastShot || 0;
  if (now - lastShot < 250) return;

  context.state.projectiles.push({
    id: `proj_${now}`,
    emoji: '🔥',
    x: context.state.playerX + 16,
    y: context.state.playerY,
    vx: context.state.playerFacing === 'right' ? 10 : -10,
    vy: 0,
    damage: context.state.playerDamage,
    owner: 'player',
    alive: true,
  });

  context.state._lastShot = now;
  playSoundEffect('laser');
}

export function updateEnemies(context: GameContext, dt: number) {
  context.state.enemies.forEach(e => {
    if (!e.alive) return;

    const p = context.state;
    const dx = p.playerX - e.x;
    const dy = p.playerY - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    switch (e.behavior) {
      case 'patrol':
        e.x += Math.sin(context.frameCount * 0.02 + e.x) * e.speed;
        break;
      case 'chase':
        if (dist > 0 && dist < 300) {
          e.x += (dx / dist) * e.speed * 60 * dt;
          e.y += (dy / dist) * e.speed * 60 * dt;
        }
        break;
      case 'float_h':
        e.x += Math.sin(context.frameCount * 0.03 + e.y) * e.speed;
        break;
      case 'float_v':
        e.y += Math.sin(context.frameCount * 0.03 + e.x) * e.speed;
        break;
      case 'shoot':
        if (dist < 400) {
          e.x += (dx / dist) * e.speed * 30 * dt;
          e.y += (dy / dist) * e.speed * 30 * dt;
        }
        break;
      case 'teleport':
        if (Math.random() < 0.01) {
          e.x = Math.random() * context.state.worldWidth;
          e.y = Math.random() * (context.state.worldHeight - 100);
        }
        break;
      case 'shield':
        e.x += Math.sin(context.frameCount * 0.02) * e.speed;
        break;
    }

    context.state.tiles.forEach(tile => {
      if (!tile.solid) return;
      if (boxCollision(
        { x: e.x, y: e.y, width: 32, height: 32 },
        { x: tile.x, y: tile.y, width: context.tileSize, height: context.tileSize }
      )) {
        e.vx *= -1;
        e.x += e.vx * 2;
      }
    });

    e.x = Math.max(0, Math.min(context.state.worldWidth - 32, e.x));
    e.y = Math.max(0, Math.min(context.state.worldHeight - 32, e.y));
  });
}

export function updateProjectiles(context: GameContext, _dt: number) {
  context.state.projectiles = context.state.projectiles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    return p.x > -50 && p.x < context.state.worldWidth + 50 &&
           p.y > -50 && p.y < context.state.worldHeight + 50 && p.alive;
  });
}

export function updateParticles(context: GameContext, dt: number) {
  context.state.particles = context.state.particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= dt;
    return p.life > 0;
  });
}

export function updateNPCs(context: GameContext, _dt: number) {
  context.state.npcs.forEach(npc => {
    if (npc.isTalking) {
      const dx = context.state.playerX - npc.x;
    }
  });
}

export function updateCamera(context: GameContext) {
  const targetX = context.state.playerX - context.canvas.width / 2 + 16;
  const targetY = context.state.playerY - context.canvas.height / 2 + 16;

  context.state.cameraX += (targetX - context.state.cameraX) * 0.1;
  context.state.cameraY += (targetY - context.state.cameraY) * 0.1;

  context.state.cameraX = Math.max(0, Math.min(context.state.worldWidth - context.canvas.width, context.state.cameraX));
  context.state.cameraY = Math.max(0, Math.min(context.state.worldHeight - context.canvas.height, context.state.cameraY));
}
