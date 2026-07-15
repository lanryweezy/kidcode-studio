import { IRNode } from '../types';
import { GameEntity, InventoryItem, SpriteState } from '../../../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound, setNpcChat, stopExecution, setGameState, particleSettings } = ctx;

  switch (node.kind) {
    // === Movement ===
    case 'move_x':
      state.x += node.dx;
      playSound?.('move');
      return true;
    case 'move_y':
      state.y -= node.dy;
      return true;
    case 'set_velocity_x':
      state.vx = node.vx;
      return true;
    case 'set_velocity_y':
      state.vy = node.vy;
      return true;
    case 'set_gravity':
      state.gravity = node.enabled;
      return true;
    case 'set_friction':
      state.friction = node.value;
      return true;
    case 'set_bounciness':
      state.restitution = node.value;
      return true;
    case 'jump':
      if (!state.isJumping) {
        state.vy = -node.force;
        state.isJumping = true;
        playSound?.('move');
      }
      return true;

    // === Appearance ===
    case 'set_emoji':
      state.emoji = node.emoji;
      return true;
    case 'set_size':
      state.scale = node.scale;
      return true;
    case 'set_opacity':
      state.opacity = node.opacity;
      return true;
    case 'say':
      state.speech = node.text;
      setTimeout(() => { state.speech = null; }, 3000);
      return true;
    case 'think':
      state.speech = `💭 ${node.text}`;
      setTimeout(() => { state.speech = null; }, 3000);
      return true;
    case 'show':
      state.opacity = 1;
      return true;
    case 'hide':
      state.opacity = 0;
      return true;

    // === Spawning ===
    case 'spawn_enemy':
      state.enemies.push({
        id: crypto.randomUUID(),
        x: node.x ?? Math.random() * 300 + 50,
        y: node.y ?? Math.random() * 300 + 50,
        type: 'enemy',
        emoji: node.emoji,
        width: 30, height: 30
      });
      return true;
    case 'spawn_item':
      state.items.push({
        id: crypto.randomUUID(),
        x: node.x ?? Math.random() * 300 + 50,
        y: node.y ?? Math.random() * 300 + 50,
        type: 'item',
        emoji: node.emoji,
        width: 20, height: 20
      });
      return true;
    case 'spawn_particles':
      state.effectTrigger = {
        type: (particleSettings?.type as 'explosion' | 'sparkle' | 'poof') || 'sparkle',
        x: state.x,
        y: state.y,
        color: particleSettings?.color
      };
      return true;

    // === Game State ===
    case 'change_score':
      state.score += node.delta;
      return true;
    case 'set_score':
      state.score = node.value;
      return true;
    case 'change_health':
      state.health += node.delta;
      if (state.health <= 0 && setGameState) {
        setGameState('over');
        if (stopExecution) stopExecution.current = true;
      }
      return true;
    case 'set_health':
      state.health = node.value;
      return true;
    case 'game_over':
      if (setGameState) setGameState('over');
      if (stopExecution) stopExecution.current = true;
      return true;
    case 'win_game':
      if (setGameState) setGameState('won');
      if (stopExecution) stopExecution.current = true;
      return true;

    // === Camera ===
    case 'set_camera':
      state.cameraFollow = node.follow;
      return true;
    case 'shake_screen':
      state.screenShake = node.intensity * 60;
      return true;

    // === Audio ===
    case 'play_sound':
      playSound?.(node.sound);
      return true;
    case 'set_bgm':
      state.backgroundMusic = node.track || undefined;
      return true;
    case 'stop_music':
      state.backgroundMusic = undefined;
      return true;

    // === Inventory ===
    case 'add_to_inventory': {
      const existing = state.inventory.find((i: InventoryItem) => i.name === node.item);
      if (existing) {
        existing.quantity += node.quantity;
      } else {
        state.inventory.push({
          id: crypto.randomUUID(),
          name: node.item,
          icon: '📦',
          type: 'consumable',
          description: 'A game item',
          quantity: node.quantity,
          maxStack: 99
        });
      }
      return true;
    }
    case 'remove_from_inventory': {
      const idx = state.inventory.findIndex((i: InventoryItem) => i.name === node.item);
      if (idx >= 0) {
        state.inventory[idx].quantity -= node.quantity;
        if (state.inventory[idx].quantity <= 0) {
          state.inventory.splice(idx, 1);
        }
      }
      return true;
    }

    // === Cutscene ===
    case 'trigger_cutscene':
      state.isCutsceneActive = true;
      return true;
    case 'fade_in':
      state.fadeAlpha = 0;
      return true;
    case 'fade_out':
      state.fadeAlpha = 1;
      return true;

    // === Boss ===
    case 'spawn_boss':
      state.activeBoss = {
        id: crypto.randomUUID(),
        name: node.name,
        emoji: '💀',
        x: 500, y: 200,
        health: node.health,
        maxHealth: node.health,
        phase: 1, attackPattern: 'normal',
        isInvulnerable: false, attackCooldown: 0
      };
      state.bossHealth = node.health;
      state.bossMaxHealth = node.health;
      return true;
    case 'set_boss_health':
      if (state.activeBoss) {
        state.activeBoss.health = node.health;
        state.activeBoss.maxHealth = node.health;
      }
      return true;
    case 'boss_attack':
      if (state.activeBoss) {
        state.activeBoss.attackPattern = node.pattern;
      }
      return true;
    case 'boss_phase':
      if (state.activeBoss) {
        state.activeBoss.phase = node.phase;
      }
      return true;

    // === Advanced Movement ===
    case 'dash':
      state.vx += node.force;
      state.canDash = false;
      state.dashCooldown = 30;
      playSound?.('dash');
      return true;
    case 'double_jump':
      state.canDoubleJump = node.enabled;
      return true;
    case 'wall_jump':
      state.variables['_wall_jump'] = node.enabled;
      return true;
    case 'grapple':
      state.vy = -10;
      state.vx = 8;
      return true;

    // === Checkpoints ===
    case 'create_checkpoint':
      state.lastCheckpoint = {
        id: crypto.randomUUID(),
        x: state.x,
        y: state.y,
        name: node.name,
        unlocked: true
      };
      playSound?.('powerup');
      return true;
    case 'load_checkpoint':
      if (state.lastCheckpoint) {
        state.x = state.lastCheckpoint.x;
        state.y = state.lastCheckpoint.y;
      }
      return true;

    // === Dialogue ===
    case 'create_dialogue':
      if (setNpcChat) setNpcChat({ name: node.speaker, message: node.message });
      return true;
    case 'end_dialogue':
      if (setNpcChat) setNpcChat(null);
      return true;
    case 'npc_talk':
      if (setNpcChat) setNpcChat({ name: node.name, message: node.message });
      return true;

    // === Game Objects ===
    case 'shoot': {
      const projectile: GameEntity = {
        id: crypto.randomUUID(),
        x: state.x,
        y: state.y,
        vx: Math.cos((state.rotation - 90) * Math.PI / 180) * 10,
        vy: Math.sin((state.rotation - 90) * Math.PI / 180) * 10,
        type: 'projectile',
        emoji: node.emoji,
        lifeTime: 100
      };
      state.projectiles.push(projectile);
      playSound?.('laser');
      return true;
    }
    case 'add_platform':
      state.platforms.push({
        id: crypto.randomUUID(), x: node.x, y: node.y,
        type: 'platform', emoji: '🟪', width: node.width, height: 15
      });
      return true;
    case 'create_clone': {
      const clone: GameEntity = {
        id: crypto.randomUUID(), x: state.x + 30, y: state.y,
        type: 'clone', emoji: state.emoji, width: 30, height: 30
      };
      state.clones.push(clone);
      return true;
    }
    case 'delete_clone':
      state.clones.pop();
      return true;

    // === Weather ===
    case 'set_weather':
      state.weather = (node.weather as SpriteState['weather']) || 'none';
      return true;

    // === Save/Load ===
    case 'save_game':
      return true;
    case 'load_game':
      return true;

    // === Data ===
    case 'set_var':
      state.variables[node.varName] = node.value;
      return true;
    case 'change_var': {
      const current = Number(state.variables[node.varName] || 0);
      state.variables[node.varName] = current + node.delta;
      return true;
    }

    // === Movement Extras ===
    case 'go_to_xy':
      state.x = node.x;
      state.y = node.y;
      return true;
    case 'turn_right':
      state.rotation += node.degrees;
      return true;
    case 'turn_left':
      state.rotation -= node.degrees;
      return true;

    // === 3D ===
    case 'move_z':
      state.z = (state.z || 0) + node.dz;
      return true;
    case 'rotate_x':
      state.rotationX = (state.rotationX || 0) + node.degrees;
      return true;
    case 'rotate_y':
      state.rotationY = (state.rotationY || 0) + node.degrees;
      return true;
    case 'rotate_z':
      state.rotationZ = (state.rotationZ || 0) + node.degrees;
      return true;

    // === Advanced Platformer Extras ===
    case 'wall_jump_enabled':
      state.canDoubleJump = node.enabled;
      return true;
    case 'ceiling_cling':
      state.vy = 0;
      return true;
    case 'air_dash':
      state.vx += node.force;
      playSound?.('dash');
      return true;
    case 'ground_slam':
      state.vy = node.force;
      state.effectTrigger = { type: 'explosion', x: state.x, y: state.y + 40, color: '#78716c' };
      playSound?.('explosion');
      return true;
    case 'climb_vine':
      state.vy = -node.force;
      return true;
    case 'swing_rope':
      state.vx += node.force;
      state.vy = -8;
      return true;

    // === Misc ===
    case 'set_scene':
      state.scene = node.scene as any;
      return true;
    case 'set_music_volume':
      state.musicVolume = node.volume;
      return true;
    case 'play_ambient':
      state.ambientSound = node.preset;
      return true;
    case 'slow_motion':
      state.timeScale = node.timeScale;
      return true;
    case 'play_animation':
      state.currentAnimation = node.animation || null;
      return true;
    case 'broadcast':
      return true;
    case 'log_data':
      return true;
    case 'wait':
      return true;

    default:
      return false;
  }
}
