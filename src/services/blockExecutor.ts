
// KidCode Studio — Block Executor
// Runs block commands in the game engine in real-time

import { UnifiedGameEngine } from './unifiedGameEngine';
import { playSoundEffect } from './soundService';

interface Block {
  id: string;
  type: string;
  params: Record<string, string | number | boolean | undefined>;
}

interface InventoryEntry {
  id: string;
  emoji: string;
  name: string;
  type: string;
  quantity: number;
  damage?: number;
  range?: number;
  equipped?: boolean;
}

interface ExecutionContext {
  engine: UnifiedGameEngine;
  variables: Map<string, unknown>;
  blockIndex: number;
  loopStack: number[];
  waitUntil: number;
  isRunning: boolean;
}

export class BlockExecutor {
  private context: ExecutionContext;
  private blocks: Block[] = [];
  private executionSpeed: number = 1;
  private lastExecutionTime: number = 0;
  private executionInterval: number = 50; // ms between block executions

  constructor(engine: UnifiedGameEngine) {
    this.context = {
      engine,
      variables: new Map(),
      blockIndex: 0,
      loopStack: [],
      waitUntil: 0,
      isRunning: false,
    };
  }

  loadBlocks(blocks: Block[]) {
    this.blocks = blocks;
    this.context.blockIndex = 0;
    this.context.loopStack = [];
    this.context.variables.clear();
  }

  setSpeed(speed: number) {
    this.executionSpeed = speed;
  }

  start() {
    this.context.isRunning = true;
    this.context.blockIndex = 0;
    this.lastExecutionTime = performance.now();
  }

  stop() {
    this.context.isRunning = false;
  }

  // Execute blocks every frame
  update(dt: number) {
    if (!this.context.isRunning) return;
    if (performance.now() - this.lastExecutionTime < this.executionInterval / this.executionSpeed) return;
    this.lastExecutionTime = performance.now();

    // Execute up to N blocks per frame
    const maxBlocksPerFrame = 5;
    let blocksExecuted = 0;

    while (this.context.blockIndex < this.blocks.length && blocksExecuted < maxBlocksPerFrame) {
      const block = this.blocks[this.context.blockIndex];
      const shouldContinue = this.executeBlock(block);
      
      if (!shouldContinue) break; // Wait or end
      blocksExecuted++;
    }

    // Loop back if we reach the end
    if (this.context.blockIndex >= this.blocks.length) {
      this.context.blockIndex = 0;
    }
  }

  private executeBlock(block: Block): boolean {
    const ctx = this.context;
    const state = ctx.engine.getState();

    switch (block.type) {
      // === FLOW CONTROL ===
      case 'FOREVER':
        ctx.loopStack.push(ctx.blockIndex);
        ctx.blockIndex++;
        return true;

      case 'END_FOREVER':
        if (ctx.loopStack.length > 0) {
          ctx.blockIndex = ctx.loopStack[ctx.loopStack.length - 1] + 1;
        } else {
          ctx.blockIndex++;
        }
        return true;

      case 'WAIT':
        ctx.waitUntil = performance.now() + (Number(block.params.value) || 1) * 1000;
        ctx.blockIndex++;
        return false;

      case 'IF':
        // Simple condition evaluation
        if (this.evaluateCondition(block.params.condition as string, block.params)) {
          ctx.blockIndex++;
        } else {
          // Skip to END_IF
          let depth = 1;
          while (ctx.blockIndex < this.blocks.length && depth > 0) {
            ctx.blockIndex++;
            if (this.blocks[ctx.blockIndex]?.type === 'IF') depth++;
            if (this.blocks[ctx.blockIndex]?.type === 'END_IF') depth--;
          }
          ctx.blockIndex++;
        }
        return true;

      case 'ELSE':
        // Skip to END_IF
        let elseDepth = 1;
        while (ctx.blockIndex < this.blocks.length && elseDepth > 0) {
          ctx.blockIndex++;
          if (this.blocks[ctx.blockIndex]?.type === 'IF') elseDepth++;
          if (this.blocks[ctx.blockIndex]?.type === 'END_IF') elseDepth--;
        }
        ctx.blockIndex++;
        return true;

      case 'END_IF':
        ctx.blockIndex++;
        return true;

      // === MOVEMENT ===
      case 'MOVE_X':
        ctx.engine.state.playerX += Number(block.params.value) || 0;
        ctx.blockIndex++;
        return true;

      case 'MOVE_Y':
        ctx.engine.state.playerY += Number(block.params.value) || 0;
        ctx.blockIndex++;
        return true;

      case 'JUMP':
        if (ctx.engine.state.playerIsGrounded) {
          ctx.engine.state.playerVy = -(block.params.value || 12);
          ctx.engine.state.playerIsGrounded = false;
          playSoundEffect('jump');
        }
        ctx.blockIndex++;
        return true;

      // === ACTIONS ===
      case 'SHOOT':
        ctx.engine.state.projectiles.push({
          id: `proj_${Date.now()}`,
          emoji: String(block.params.text) || '🔥',
          x: ctx.engine.state.playerX + 16,
          y: ctx.engine.state.playerY,
          vx: ctx.engine.state.playerFacing === 'right' ? 10 : -10,
          vy: 0,
          damage: ctx.engine.state.playerDamage,
          owner: 'player',
          alive: true,
        });
        playSoundEffect('laser');
        ctx.blockIndex++;
        return true;

      case 'SPAWN_ENEMY':
        ctx.engine.state.enemies.push({
          id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          emoji: String(block.params.text) || '👾',
          x: Math.random() * (ctx.engine.state.worldWidth - 40),
          y: -40,
          vx: 0, vy: 0,
          hp: 20 + ctx.engine.state.wave * 5,
          maxHp: 20 + ctx.engine.state.wave * 5,
          damage: 5 + ctx.engine.state.wave * 2,
          speed: 0.5 + ctx.engine.state.wave * 0.1,
          behavior: ['patrol', 'chase', 'float_h'][Math.floor(Math.random() * 3)],
          alive: true,
          state: 'idle',
          stateTimer: 0,
        });
        ctx.blockIndex++;
        return true;

      case 'SPAWN_ITEM':
        ctx.engine.state.items.push({
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          emoji: String(block.params.text) || '🪙',
          x: Math.random() * (ctx.engine.state.worldWidth - 24),
          y: Math.random() * (ctx.engine.state.worldHeight - 100) + 50,
          type: 'collectible',
          collected: false,
        });
        ctx.blockIndex++;
        return true;

      case 'SPAWN_PARTICLES':
        for (let i = 0; i < (Number(block.params.value) || 5); i++) {
          ctx.engine.state.particles.push({
            id: `particle_${Date.now()}_${i}`,
            emoji: '💥',
            x: ctx.engine.state.playerX + 16,
            y: ctx.engine.state.playerY + 16,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
          });
        }
        ctx.blockIndex++;
        return true;

      // === VARIABLES ===
      case 'SET_VAR':
        ctx.variables.set(block.params.varName as string, block.params.value || 0);
        ctx.blockIndex++;
        return true;

      case 'CHANGE_VAR':
        const current = ctx.variables.get(block.params.varName as string) || 0;
        ctx.variables.set(block.params.varName as string, (current as number) + (Number(block.params.value) || 0));
        ctx.blockIndex++;
        return true;

      // === EFFECTS ===
      case 'PLAY_SOUND':
        playSoundEffect((String(block.params.text) || 'click') as 'click');
        ctx.blockIndex++;
        return true;

      case 'SAY':

        // Show speech bubble via engine
        ctx.engine.state.speechBubble = {
          text: String(block.params.text) || '',
          timer: 3,
        };
        ctx.blockIndex++;
        return true;

      case 'SET_WEATHER':
        ctx.engine.state.weather = String(block.params.text) || 'none';
        ctx.blockIndex++;
        return true;

      case 'SET_SCENE':
        ctx.engine.state.background = String(block.params.text) || 'space';
        ctx.blockIndex++;
        return true;

      case 'SET_EMOJI':
        ctx.engine.state.playerEmoji = String(block.params.text) || '🚀';
        ctx.blockIndex++;
        return true;

      case 'SET_GRAVITY':
        ctx.engine.state.gravity = String(block.params.condition) === 'true' ? 0.6 : 0;
        ctx.blockIndex++;
        return true;

      case 'SET_SIZE':
        // Scale player
        ctx.blockIndex++;
        return true;

      case 'BOUNCE_ON_EDGE':
        ctx.blockIndex++;
        return true;

      // === GAME STATE ===
      case 'WIN_GAME':
        ctx.engine.state.isVictory = true;
        ctx.blockIndex++;
        return true;

      case 'GAME_OVER':
        ctx.engine.state.isGameOver = true;
        ctx.blockIndex++;
        return true;

      case 'CREATE_CHECKPOINT':
        ctx.engine.state.checkpoint = {
          x: ctx.engine.state.playerX,
          y: ctx.engine.state.playerY,
          health: ctx.engine.state.playerHealth,
          score: ctx.engine.state.score,
        };
        ctx.blockIndex++;
        return true;

      // === WEAPON SYSTEM ===
      case 'PICK_UP_ITEM':
        // Pick up nearest item with matching emoji
        const pickupEmoji = String(block.params.text);
        const nearItem = ctx.engine.state.items.find(
          i => !i.collected && i.emoji === pickupEmoji &&
          Math.abs(i.x - ctx.engine.state.playerX) < 50 &&
          Math.abs(i.y - ctx.engine.state.playerY) < 50
        );
        if (nearItem) {
          nearItem.collected = true;
          // Add to inventory
          const existingInv = ctx.engine.state.inventory;
          const existing = existingInv.find((i) => i.emoji === pickupEmoji);
          if (existing) {
            existing.quantity++;
          } else {
            existingInv.push({
              id: `inv_${Date.now()}`,
              emoji: pickupEmoji,
              name: getItemName(pickupEmoji),
              type: getItemType(pickupEmoji),
              quantity: 1,
              equipped: false,
              damage: getItemDamage(pickupEmoji),
              range: getItemRange(pickupEmoji),
            });
          }
          playSoundEffect('coin');
          // Spawn pickup particles
          for (let i = 0; i < 5; i++) {
            ctx.engine.state.particles.push({
              id: `pickup_${Date.now()}_${i}`,
              emoji: '✨',
              x: nearItem.x + 12,
              y: nearItem.y + 12,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 0.5,
              maxLife: 0.5,
            });
          }
        }
        ctx.blockIndex++;
        return true;

      case 'USE_WEAPON':
        // Use equipped weapon to attack
        const inventory = ctx.engine.state.inventory;
        const weapon = inventory.find((i) => i.type === 'weapon' && i.quantity > 0);
        if (weapon) {
          // Create weapon projectile
          const projectileEmoji = weapon.emoji === '⚔️' ? '⚔️' :
                                  weapon.emoji === '🔫' ? '🔫' :
                                  weapon.emoji === '🏹' ? '🏹' :
                                  weapon.emoji === '🪄' ? '✨' :
                                  weapon.emoji === '🗡️' ? '🗡️' : '💥';
          
          ctx.engine.state.projectiles.push({
            id: `weapon_${Date.now()}`,
            emoji: projectileEmoji,
            x: ctx.engine.state.playerX + (ctx.engine.state.playerFacing === 'right' ? 32 : -16),
            y: ctx.engine.state.playerY + 8,
            vx: ctx.engine.state.playerFacing === 'right' ? 12 : -12,
            vy: 0,
            damage: weapon.damage || 15,
            owner: 'player',
            alive: true,
          });
          
          // Visual feedback
          for (let i = 0; i < 3; i++) {
            ctx.engine.state.particles.push({
              id: `weapon_fx_${Date.now()}_${i}`,
              emoji: projectileEmoji,
              x: ctx.engine.state.playerX + 16,
              y: ctx.engine.state.playerY + 16,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 0.3,
              maxLife: 0.3,
            });
          }
          
          playSoundEffect('attack');
        }
        ctx.blockIndex++;
        return true;

      case 'EQUIP_ITEM':
        // Equip an item from inventory
        const equipEmoji = String(block.params.text);
        const equipInv = ctx.engine.state.inventory;
        const toEquip = equipInv.find((i) => i.emoji === equipEmoji);
        if (toEquip) {
          // Unequip all weapons first
          equipInv.forEach((i) => { if (i.type === 'weapon') i.equipped = false; });
          toEquip.equipped = true;
          // Apply weapon stats
          ctx.engine.state.playerDamage = toEquip.damage || 10;
          playSoundEffect('powerup');
        }
        ctx.blockIndex++;
        return true;

      case 'THROW_ITEM':
        // Throw item as projectile
        const throwEmoji = String(block.params.text);
        const throwInv = ctx.engine.state.inventory;
        const toThrow = throwInv.find((i) => i.emoji === throwEmoji && i.quantity > 0);
        if (toThrow) {
          toThrow.quantity--;
          if (toThrow.quantity <= 0) {
            ctx.engine.state.inventory = throwInv.filter((i) => i.quantity > 0);
          }
          ctx.engine.state.projectiles.push({
            id: `throw_${Date.now()}`,
            emoji: throwEmoji,
            x: ctx.engine.state.playerX + 16,
            y: ctx.engine.state.playerY,
            vx: ctx.engine.state.playerFacing === 'right' ? 10 : -10,
            vy: -3,
            damage: 20,
            owner: 'player',
            alive: true,
          });
          playSoundEffect('laser');
        }
        ctx.blockIndex++;
        return true;

      case 'DROP_ITEM':
        // Drop item on ground
        const dropEmoji = String(block.params.text);
        const dropInv = ctx.engine.state.inventory;
        const toDrop = dropInv.find((i) => i.emoji === dropEmoji);
        if (toDrop) {
          toDrop.quantity--;
          if (toDrop.quantity <= 0) {
            ctx.engine.state.inventory = dropInv.filter((i) => i.quantity > 0);
          }
          ctx.engine.state.items.push({
            id: `drop_${Date.now()}`,
            emoji: dropEmoji,
            x: ctx.engine.state.playerX + 32,
            y: ctx.engine.state.playerY,
            type: 'collectible',
            collected: false,
          });
          playSoundEffect('click');
        }
        ctx.blockIndex++;
        return true;

      case 'GET_INVENTORY':
        // Check inventory count
        const getInv = ctx.engine.state.inventory;
        const getItem = getInv.find((i) => i.emoji === String(block.params.text));
        ctx.variables.set(String(block.params.varName) || 'count', getItem ? getItem.quantity : 0);
        ctx.blockIndex++;
        return true;

      // === SKIP UNKNOWN ===
      default:
        ctx.blockIndex++;
        return true;
    }
  }

  private evaluateCondition(condition: string, params: Record<string, string | number | boolean | undefined>): boolean {
    const state = this.context.engine.getState();
    const vars = this.context.variables;

    switch (condition) {
      case 'IS_PRESSED':
        // Check if a key is pressed (simplified)
        return false; // Would need keyboard state
      case 'IS_TOUCHING':
        // Check if player is touching an entity with this emoji
        const target = params.text as string;
        return state.items.some(i => i.emoji === target && !i.collected) ||
               state.enemies.some(e => e.emoji === target && e.alive);
      case 'EQUALS':
        const varName = params.varName as string;
        const value = params.value as number;
        return (vars.get(varName) as number || 0) === value;
      case 'GREATER':
        const gVar = params.varName as string;
        const gVal = params.value as number;
        return (vars.get(gVar) as number || 0) > (gVal || 0);
      case 'LESS':
        const lVar = params.varName as string;
        const lVal = params.value as number;
        return (vars.get(lVar) as number || 0) < (lVal || 0);
      default:
        return true;
    }
  }

  getVariables(): Map<string, unknown> {
    return this.context.variables;
  }

  getBlockIndex(): number {
    return this.context.blockIndex;
  }
}

// === ITEM HELPER FUNCTIONS ===

function getItemName(emoji: string): string {
  const names: Record<string, string> = {
    '⚔️': 'Sword', '🗡️': 'Dagger', '🔫': 'Blaster', '🏹': 'Bow',
    '🪄': 'Magic Wand', '🛡️': 'Shield', '🧪': 'Potion', '❤️': 'Health Heart',
    '⚡': 'Speed Boost', '⭐': 'Star Power', '🪙': 'Gold Coin', '💎': 'Gem',
    '🔑': 'Key', '🗺️': 'Map', '📦': 'Crate', '🔋': 'Battery',
    '💰': 'Money Bag', '🪨': 'Rock', '🧱': 'Brick', '🚩': 'Flag',
    '🧲': 'Magnet', '💊': 'Medicine', '🎯': 'Target',
  };
  return names[emoji] || 'Unknown Item';
}

function getItemType(emoji: string): string {
  const types: Record<string, string> = {
    '⚔️': 'weapon', '🗡️': 'weapon', '🔫': 'weapon', '🏹': 'weapon',
    '🪄': 'weapon', '🛡️': 'armor', '🧪': 'consumable', '❤️': 'consumable',
    '⚡': 'consumable', '⭐': 'powerup', '🪙': 'currency', '💎': 'currency',
    '🔑': 'key', '🗺️': 'quest', '📦': 'supply', '🔋': 'consumable',
    '💰': 'currency', '🪨': 'ammo', '🧱': 'ammo', '🚩': 'quest',
    '🧲': 'tool', '💊': 'consumable', '🎯': 'ammo',
  };
  return types[emoji] || 'misc';
}

function getItemDamage(emoji: string): number {
  const damage: Record<string, number> = {
    '⚔️': 20, '🗡️': 15, '🔫': 25, '🏹': 18,
    '🪄': 30, '🪨': 10, '🧱': 8, '🎯': 22,
  };
  return damage[emoji] || 10;
}

function getItemRange(emoji: string): number {
  const range: Record<string, number> = {
    '⚔️': 50, '🗡️': 40, '🔫': 200, '🏹': 180,
    '🪄': 150, '🪨': 80, '🧱': 60, '🎯': 200,
  };
  return range[emoji] || 100;
}
