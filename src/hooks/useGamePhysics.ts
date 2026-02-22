import { useRef, useCallback } from 'react';
import { AppMode, SpriteState, GameEntity } from '../types';
import { playSoundEffect } from '../services/soundService';

interface UseGamePhysicsProps {
  isPlaying: boolean;
  mode: AppMode;
  spriteState: SpriteState;
  setSpriteState: React.Dispatch<React.SetStateAction<SpriteState>>;
  spriteStateRef: React.MutableRefObject<SpriteState>;
  gameCanvasSizeRef: React.MutableRefObject<{ w: number, h: number }>;
}

export const useGamePhysics = ({
  isPlaying,
  mode,
  spriteStateRef,
  gameCanvasSizeRef
}: UseGamePhysicsProps) => {
  const invincibilityTimer = useRef(0);
  const shakeTimer = useRef(0);

  const tick = useCallback(() => {
      if (!isPlaying || mode !== AppMode.GAME) return;

      const GRAVITY = 0.8;
      const MAX_FALL_SPEED = 15;
      const TILE_SIZE = 40;
      const SPRITE_SIZE = 30; // Hitbox slightly smaller than visual 40px

      const state = spriteStateRef.current;
      if (!state) return;

      const canvasW = gameCanvasSizeRef.current.w;
      const canvasH = gameCanvasSizeRef.current.h;

      let { x, y, vx, vy, isJumping, gravity, projectiles, enemies, items, health, score, effectTrigger, tilemap } = state;
      let newHealth = health;
      let newEffect = effectTrigger;

      // --- PHYSICS STEP 1: X AXIS ---
      let nextX = x + vx;
      let collisionX = false;

      // Check Tile Collisions (X)
      if (tilemap) {
          const hitbox = { x: nextX + 5, y: y + 5, w: SPRITE_SIZE, h: SPRITE_SIZE }; // +5 padding
          
          for (let i = 0; i < tilemap.length; i++) {
              const tile = tilemap[i];
              const tx = tile.x * TILE_SIZE;
              const ty = tile.y * TILE_SIZE;
              
              if (
                  hitbox.x < tx + TILE_SIZE &&
                  hitbox.x + hitbox.w > tx &&
                  hitbox.y < ty + TILE_SIZE &&
                  hitbox.y + hitbox.h > ty
              ) {
                  // Solid blocks
                  if (['brick', 'grass', 'dirt', 'stone', 'crate'].includes(tile.type)) {
                      collisionX = true;
                      vx = 0;
                      break;
                  }
                  // Door logic
                  if (tile.type === 'door') {
                      if (state.keys > 0) {
                          // Unlock!
                          tilemap.splice(i, 1);
                          state.keys--;
                          playSoundEffect('powerup');
                          newEffect = { type: 'sparkle', x: tx, y: ty, color: '#fbbf24' };
                      } else {
                          collisionX = true;
                          vx = 0;
                      }
                      break;
                  }
                  // Key collection
                  if (tile.type === 'key') {
                      tilemap.splice(i, 1);
                      state.keys++;
                      playSoundEffect('coin');
                      newEffect = { type: 'sparkle', x: tx, y: ty, color: '#fbbf24' };
                      break;
                  }
                  // Hazards
                  if (['spike', 'lava'].includes(tile.type)) {
                      if (invincibilityTimer.current === 0) {
                          newHealth--;
                          invincibilityTimer.current = 60;
                          shakeTimer.current = 10;
                          playSoundEffect('hurt');
                          if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
                          vx = -vx * 1.5; // Bounce back
                      }
                  }
              }
          }
      }

      if (!collisionX) x = nextX;

      // --- PHYSICS STEP 2: Y AXIS ---
      if (gravity) {
          vy += GRAVITY;
          if (vy > MAX_FALL_SPEED) vy = MAX_FALL_SPEED;
      }

      let nextY = y + vy;
      let collisionY = false;
      let onGround = false;

      // Check Tile Collisions (Y)
      if (tilemap) {
          const hitbox = { x: x + 5, y: nextY + 5, w: SPRITE_SIZE, h: SPRITE_SIZE };
          
          for (const tile of tilemap) {
              const tx = tile.x * TILE_SIZE;
              const ty = tile.y * TILE_SIZE;
              
              if (
                  hitbox.x < tx + TILE_SIZE &&
                  hitbox.x + hitbox.w > tx &&
                  hitbox.y < ty + TILE_SIZE &&
                  hitbox.y + hitbox.h > ty
              ) {
                  // Solid blocks
                  if (['brick', 'grass', 'dirt', 'stone', 'crate'].includes(tile.type)) {
                      if (vy > 0) { // Falling down
                          nextY = ty - SPRITE_SIZE - 5;
                          onGround = true;
                      } else if (vy < 0) { // Jumping up
                          nextY = ty + TILE_SIZE - 5;
                      }
                      vy = 0;
                      collisionY = true;
                  }
                  // Platforms (One-way up)
                  if (tile.type === 'ladder') {
                      // Climb logic placeholder
                  }
                  // Springs
                  if (tile.type === 'spring') {
                      vy = -20; // BOING!
                      playSoundEffect('jump');
                      newEffect = { type: 'sparkle', x: tx, y: ty, color: '#ec4899' };
                  }
                  // Hazards
                  if (['spike', 'lava'].includes(tile.type)) {
                      if (invincibilityTimer.current === 0) {
                          newHealth--;
                          invincibilityTimer.current = 60;
                          shakeTimer.current = 10;
                          playSoundEffect('hurt');
                          vy = -10; // Pop up
                      }
                  }
              }
          }
      }

      y = nextY;
      if (onGround) isJumping = false;

      // Friction
      if (onGround) vx *= 0.8;
      else vx *= 0.95; 
      
      if (Math.abs(vx) < 0.1) vx = 0;

      // Screen Bounds
      if (x < 0) x = 0;
      if (x > canvasW - SPRITE_SIZE) x = canvasW - SPRITE_SIZE; 
      
      // Pit Death
      if (y > canvasH + 100) {
          newHealth = 0; // Fall off world
          y = 0; 
          vy = 0;
          x = 50;
      }

      // 2. AI & Projectiles
      const activeProjectiles = projectiles
          .map(p => ({ ...p, x: p.x + (p.vx || 0), y: p.y + (p.vy || 0), lifeTime: (p.lifeTime || 100) - 1 }))
          .filter(p => p.lifeTime > 0 && p.x > -50 && p.x < canvasW + 50 && p.y > -50 && p.y < canvasH + 50);

      let newScore = score;
      let newEnemies = enemies.map(enemy => {
          let ex = enemy.x;
          let ey = enemy.y;
          // Simple chase AI
          const dist = Math.hypot(x - ex, y - ey);
          if (dist < 200) {
              ex += (x - ex) * 0.015;
              ey += (y - ey) * 0.015;
          }
          return { ...enemy, x: ex, y: ey };
      });

      let newItems = [...items];

      // 3. Collision: Projectile vs Enemy
      activeProjectiles.forEach(proj => {
          newEnemies = newEnemies.filter(enemy => {
              if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < 30) {
                  playSoundEffect('explosion');
                  newEffect = { type: 'explosion', x: enemy.x, y: enemy.y, color: '#ef4444' };
                  newScore += 10;
                  return false; 
              }
              return true;
          });
      });

      // 4. Collision: Player vs Enemy
      if (invincibilityTimer.current > 0) {
          invincibilityTimer.current--;
      } else {
          newEnemies.forEach(enemy => {
              if (Math.hypot(x - enemy.x, y - enemy.y) < 30) {
                  playSoundEffect('hurt');
                  if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
                  newHealth = Math.max(0, newHealth - 1);
                  invincibilityTimer.current = 60; 
                  shakeTimer.current = 10;
                  vx = (x - enemy.x) * 0.5; // Knockback
                  vy = -5;
              }
          });
      }

      // 5. Collision: Player vs Item
      newItems = newItems.filter(item => {
          if (Math.hypot(x - item.x, y - item.y) < 30) {
              playSoundEffect('coin');
              if ('vibrate' in navigator) navigator.vibrate(20);
              newEffect = { type: 'sparkle', x: item.x, y: item.y, color: '#fbbf24' };
              newScore += 5;
              return false;
          }
          return true;
      });

      if (shakeTimer.current > 0) shakeTimer.current--;

      spriteStateRef.current = {
          ...state,
          x, y, vx, vy, isJumping,
          projectiles: activeProjectiles,
          enemies: newEnemies,
          items: newItems,
          health: newHealth,
          score: newScore,
          effectTrigger: newEffect
      };
  }, [isPlaying, mode, spriteStateRef, gameCanvasSizeRef]);

  return {
      tick,
      shakeAmount: shakeTimer.current
  };
};
