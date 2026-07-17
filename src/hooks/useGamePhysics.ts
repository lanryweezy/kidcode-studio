import React, { useRef, useCallback } from 'react';
import { AppMode, SpriteState, GameEntity } from '../types';
import { playSoundEffect } from '../services/soundService';
import { SpatialHash } from '../services/spatialHash';
import { ObjectPool } from '../services/objectPool';
import { CanvasOptimizer } from '../services/renderOptimizer';

const SOLID_BLOCK_TYPES = new Set(['brick', 'grass', 'dirt', 'stone', 'crate']);
const HAZARD_BLOCK_TYPES = new Set(['spike', 'lava']);

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
    const spatialHashRef = useRef<SpatialHash>(new SpatialHash(40));
    const lastTilemapLengthRef = useRef(0);
    const particlePoolRef = useRef<ObjectPool<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>(
        new ObjectPool(
            () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '#ffffff' }),
            (p) => { p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; p.life = 0; p.color = '#ffffff'; },
            100,
            500
        )
    );
    const canvasOptimizerRef = useRef<CanvasOptimizer | null>(null);

    const tick = useCallback(() => {
        if (!isPlaying || mode !== AppMode.GAME) return;

        const state = spriteStateRef.current;
        if (!state) return;

        // --- Gamepad Polling ---
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0];
        if (gp) {
            // Analog sticks
            const threshold = 0.2;
            const lr = Math.abs(gp.axes[0]) > threshold ? gp.axes[0] : 0;
            const ud = Math.abs(gp.axes[1]) > threshold ? gp.axes[1] : 0;

            if (lr !== 0) state.vx = lr * 5; // Direct mapped movement or acceleration

            // Face buttons (A = 0, B = 1, X = 2, Y = 3)
            const aPressed = gp.buttons[0]?.pressed;
            const bPressed = gp.buttons[1]?.pressed;
            const xPressed = gp.buttons[2]?.pressed;
            const yPressed = gp.buttons[3]?.pressed;

            // Simple jump binding to A
            if (aPressed && !state.isJumping) {
               state.vy = -state.jumpForce;
               state.isJumping = true;
               playSoundEffect('jump');
            }

            // Dash binding to X
            if (xPressed && state.canDash && state.dashCooldown <= 0) {
                state.vx += lr > 0 ? 20 : (lr < 0 ? -20 : (state.scale > 0 ? 20 : -20));
                state.dashCooldown = 30; // 30 frames
                playSoundEffect('dash');
            }
        }
        // -----------------------

        const GRAVITY = 0.8;
        const MAX_FALL_SPEED = 15;
        const TILE_SIZE = 40;
        const SPRITE_SIZE = 30; // Hitbox slightly smaller than visual 40px

        const canvasW = gameCanvasSizeRef.current.w;
        const canvasH = gameCanvasSizeRef.current.h;

        let { x, y, vx, vy, isJumping, gravity, projectiles, enemies, items, health, score, effectTrigger, tilemap } = state;
        let newHealth = health;
        let newEffect = effectTrigger;

        // Update spatial hash if tilemap changed
        if (tilemap && tilemap.length !== lastTilemapLengthRef.current) {
            spatialHashRef.current.buildTilemap(tilemap);
            lastTilemapLengthRef.current = tilemap.length;
        }

        // --- PHYSICS STEP 1: X AXIS ---
        const nextX = x + vx;
        let collisionX = false;

        // Check Tile Collisions (X) using spatial hash for O(1) lookup
        if (tilemap) {
            const hitbox = { x: nextX + 5, y: y + 5, w: SPRITE_SIZE, h: SPRITE_SIZE }; // +5 padding

            // Query only nearby tiles instead of checking all tiles
            const { tiles: nearbyTiles } = spatialHashRef.current.query(
                hitbox.x, hitbox.y, hitbox.w, hitbox.h
            );

            for (let i = 0; i < nearbyTiles.length; i++) {
                const tile = nearbyTiles[i];
                const tx = tile.x * TILE_SIZE;
                const ty = tile.y * TILE_SIZE;

                if (
                    hitbox.x < tx + TILE_SIZE &&
                    hitbox.x + hitbox.w > tx &&
                    hitbox.y < ty + TILE_SIZE &&
                    hitbox.y + hitbox.h > ty
                ) {
                    // Solid blocks
                    if (SOLID_BLOCK_TYPES.has(tile.type)) {
                        collisionX = true;
                        const restitution = state.restitution ?? 0;
                        if (restitution > 0) {
                            vx = -vx * restitution;
                        } else {
                            vx = 0;
                        }
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
                    if (HAZARD_BLOCK_TYPES.has(tile.type)) {
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

        // Check Tile Collisions (Y) using spatial hash
        if (tilemap) {
            const hitbox = { x: x + 5, y: nextY + 5, w: SPRITE_SIZE, h: SPRITE_SIZE };

            // Query only nearby tiles
            const { tiles: nearbyTiles } = spatialHashRef.current.query(
                hitbox.x, hitbox.y, hitbox.w, hitbox.h
            );

            for (const tile of nearbyTiles) {
                const tx = tile.x * TILE_SIZE;
                const ty = tile.y * TILE_SIZE;

                if (
                    hitbox.x < tx + TILE_SIZE &&
                    hitbox.x + hitbox.w > tx &&
                    hitbox.y < ty + TILE_SIZE &&
                    hitbox.y + hitbox.h > ty
                ) {
                    // Solid blocks
                    if (SOLID_BLOCK_TYPES.has(tile.type)) {
                        if (vy > 0) { // Falling down
                            nextY = ty - SPRITE_SIZE - 5;
                            onGround = true;
                        } else if (vy < 0) { // Jumping up
                            nextY = ty + TILE_SIZE - 5;
                        }
                        const restitution = state.restitution ?? 0;
                        if (restitution > 0) {
                             vy = -vy * restitution;
                             // If it bounced hard enough, it's not on the ground anymore
                             if (Math.abs(vy) > 2) onGround = false;
                        } else {
                             vy = 0;
                        }
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
                    if (HAZARD_BLOCK_TYPES.has(tile.type)) {
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
        const surfaceFriction = state.friction ?? 0.8;
        if (onGround) vx *= surfaceFriction;
        else vx *= 0.95; // Air friction

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

        // 2. AI & Projectiles with viewport culling
        const activeProjectiles = projectiles
            .map(p => ({ ...p, x: p.x + (p.vx || 0), y: p.y + (p.vy || 0), lifeTime: (p.lifeTime || 100) - 1 }))
            .filter(p => p.lifeTime > 0 && p.x > -50 && p.x < canvasW + 50 && p.y > -50 && p.y < canvasH + 50);

        let newScore = score;
        let newEnemies = enemies.map(enemy => {
            let ex = enemy.x;
            let ey = enemy.y;

            // Pathfinding/Chase AI
            const dist = Math.hypot(x - ex, y - ey);
            if (dist < 200 && dist > 2) {
                // Determine direction
                let dx = x - ex;
                let dy = y - ey;

                // Normalize
                const length = Math.hypot(dx, dy);
                dx /= length;
                dy /= length;

                // Speed
                const speed = 1.5;
                const nextEx = ex + dx * speed;
                const nextEy = ey + dy * speed;

                // --- Simple Greedy Pathfinding (Obstacle Avoidance) ---
                let hitObstacle = false;
                if (tilemap) {
                     const hitbox = { x: nextEx + 5, y: nextEy + 5, w: SPRITE_SIZE, h: SPRITE_SIZE };
                     const { tiles: nearbyTiles } = spatialHashRef.current.query(hitbox.x, hitbox.y, hitbox.w, hitbox.h);

                     for (const tile of nearbyTiles) {
                         if (SOLID_BLOCK_TYPES.has(tile.type)) {
                             const tx = tile.x * TILE_SIZE;
                             const ty = tile.y * TILE_SIZE;
                             if (
                                hitbox.x < tx + TILE_SIZE &&
                                hitbox.x + hitbox.w > tx &&
                                hitbox.y < ty + TILE_SIZE &&
                                hitbox.y + hitbox.h > ty
                            ) {
                                hitObstacle = true;
                                break;
                            }
                         }
                     }
                }

                if (!hitObstacle) {
                    ex = nextEx;
                    ey = nextEy;
                } else {
                    // Try sliding along X axis if we hit something directly
                    const slideEx = ex + dx * speed;
                    const slideEy = ey;
                    let slideHitX = false;

                    if (tilemap) {
                         const hitbox = { x: slideEx + 5, y: slideEy + 5, w: SPRITE_SIZE, h: SPRITE_SIZE };
                         const { tiles: nearbyTiles } = spatialHashRef.current.query(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
                         for (const tile of nearbyTiles) {
                             if (SOLID_BLOCK_TYPES.has(tile.type)) {
                                 const tx = tile.x * TILE_SIZE;
                                 const ty = tile.y * TILE_SIZE;
                                 if (hitbox.x < tx + TILE_SIZE && hitbox.x + hitbox.w > tx && hitbox.y < ty + TILE_SIZE && hitbox.y + hitbox.h > ty) {
                                     slideHitX = true;
                                     break;
                                 }
                             }
                         }
                    }

                    if (!slideHitX) {
                        ex = slideEx;
                    } else {
                        // Try sliding along Y axis
                        const slideExY = ex;
                        const slideEyY = ey + dy * speed;
                        let slideHitY = false;

                        if (tilemap) {
                             const hitbox = { x: slideExY + 5, y: slideEyY + 5, w: SPRITE_SIZE, h: SPRITE_SIZE };
                             const { tiles: nearbyTiles } = spatialHashRef.current.query(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
                             for (const tile of nearbyTiles) {
                                 if (SOLID_BLOCK_TYPES.has(tile.type)) {
                                     const tx = tile.x * TILE_SIZE;
                                     const ty = tile.y * TILE_SIZE;
                                     if (hitbox.x < tx + TILE_SIZE && hitbox.x + hitbox.w > tx && hitbox.y < ty + TILE_SIZE && hitbox.y + hitbox.h > ty) {
                                         slideHitY = true;
                                         break;
                                     }
                                 }
                             }
                        }

                        if (!slideHitY) {
                            ey = slideEyY;
                        }
                    }
                }
            }
            return { ...enemy, x: ex, y: ey };
        });

        let newItems = [...items];

        // 3. Collision: Projectile vs Enemy
        activeProjectiles.forEach(proj => {
            newEnemies = newEnemies.filter(enemy => {
                if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < 30) {
                    const panX = (enemy.x - x) / canvasW; // -1 to 1 based on screen width
                    playSoundEffect('explosion', panX);
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
                const panX = (item.x - x) / canvasW;
                playSoundEffect('coin', panX);
                if ('vibrate' in navigator) navigator.vibrate(20);
                newEffect = { type: 'sparkle', x: item.x, y: item.y, color: '#fbbf24' };
                newScore += 5;
                return false;
            }
            return true;
        });

        if (shakeTimer.current > 0) shakeTimer.current--;

        // Update spatial hash with new entity positions for next frame
        // Only process enemies within viewport for AI optimization
        const viewportEnemies = newEnemies.filter(e => 
            e.x > -100 && e.x < canvasW + 100 && e.y > -100 && e.y < canvasH + 100
        );
        spatialHashRef.current.buildEntityList([...viewportEnemies, ...items]);

        // Return particle pool for recycling dead projectiles
        particlePoolRef.current.getStats();

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
        shakeAmount: shakeTimer.current,
        particlePoolStats: particlePoolRef.current.getStats()
    };
};
