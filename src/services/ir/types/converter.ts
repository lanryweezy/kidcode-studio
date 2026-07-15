import { CommandBlock, CommandType } from '../../../types';
import { IRNode } from './nodes';

/**
 * Convert a CommandBlock to a typed IRNode.
 * Returns null for unhandled command types (they stay on the old path).
 */
export function commandBlockToIR(block: CommandBlock): IRNode | null {
  const entityId = 'player';

  switch (block.type) {
    // --- Movement ---
    case CommandType.MOVE_X:
      return { kind: 'move_x', entityId, dx: block.params.value ?? 0 };
    case CommandType.MOVE_Y:
      return { kind: 'move_y', entityId, dy: block.params.value ?? 0 };
    case CommandType.SET_VELOCITY_X:
      return { kind: 'set_velocity_x', entityId, vx: block.params.value ?? 0 };
    case CommandType.SET_VELOCITY_Y:
      return { kind: 'set_velocity_y', entityId, vy: block.params.value ?? 0 };
    case CommandType.SET_GRAVITY:
      return { kind: 'set_gravity', entityId, enabled: block.params.condition === 'true' };
    case CommandType.SET_FRICTION:
      return { kind: 'set_friction', entityId, value: block.params.value ?? 0.1 };
    case CommandType.SET_BOUNCINESS:
      return { kind: 'set_bounciness', entityId, value: block.params.value ?? 0.8 };
    case CommandType.JUMP:
      return { kind: 'jump', entityId, force: block.params.value ?? 10 };

    // --- Appearance ---
    case CommandType.SET_EMOJI:
      return { kind: 'set_emoji', entityId, emoji: block.params.text || '👤' };
    case CommandType.SET_SIZE:
      return { kind: 'set_size', entityId, scale: block.params.value ?? 1 };
    case CommandType.SET_OPACITY:
      return { kind: 'set_opacity', entityId, opacity: block.params.value ?? 1 };
    case CommandType.SAY:
      return { kind: 'say', entityId, text: block.params.text || '' };
    case CommandType.THINK:
      return { kind: 'think', entityId, text: block.params.text || '...' };
    case CommandType.SHOW:
      return { kind: 'show', entityId };
    case CommandType.HIDE:
      return { kind: 'hide', entityId };

    // --- Spawning ---
    case CommandType.SPAWN_ENEMY:
      return { kind: 'spawn_enemy', emoji: block.params.text || '👾', x: block.params.x, y: block.params.y };
    case CommandType.SPAWN_ITEM:
      return { kind: 'spawn_item', emoji: block.params.text || '💎', x: block.params.x, y: block.params.y };
    case CommandType.SPAWN_PARTICLES:
      return { kind: 'spawn_particles', count: block.params.value ?? 10 };

    // --- Game State ---
    case CommandType.CHANGE_SCORE:
      return { kind: 'change_score', delta: block.params.value ?? 1 };
    case CommandType.SET_SCORE:
      return { kind: 'set_score', value: block.params.value ?? 0 };
    case CommandType.CHANGE_HEALTH:
      return { kind: 'change_health', delta: block.params.value ?? -1 };
    case CommandType.SET_HEALTH:
      return { kind: 'set_health', value: block.params.value ?? 3 };
    case CommandType.GAME_OVER:
      return { kind: 'game_over' };
    case CommandType.WIN_GAME:
      return { kind: 'win_game' };

    // --- Camera ---
    case CommandType.SET_CAMERA:
      return { kind: 'set_camera', follow: block.params.condition === 'true' || block.params.text === 'follow' };
    case CommandType.SHAKE_SCREEN:
    case CommandType.SHAKE_CAMERA:
    case CommandType.SCREEN_SHAKE:
      return { kind: 'shake_screen', intensity: block.params.value ?? 0.5 };

    // --- Audio ---
    case CommandType.PLAY_SOUND:
      return { kind: 'play_sound', sound: block.params.text || 'beep' };
    case CommandType.PLAY_MUSIC:
    case CommandType.SET_BACKGROUND_MUSIC:
      return { kind: 'set_bgm', track: block.params.text || '' };
    case CommandType.STOP_MUSIC:
      return { kind: 'stop_music' };

    // --- Inventory ---
    case CommandType.ADD_TO_INVENTORY:
      return { kind: 'add_to_inventory', item: block.params.text || 'Item', quantity: block.params.value ?? 1 };
    case CommandType.REMOVE_FROM_INVENTORY:
      return { kind: 'remove_from_inventory', item: block.params.text || 'Item', quantity: block.params.value ?? 1 };

    // --- Cutscene ---
    case CommandType.TRIGGER_CUTSCENE:
      return { kind: 'trigger_cutscene', name: block.params.text || '' };
    case CommandType.FADE_IN:
      return { kind: 'fade_in', duration: block.params.value ?? 1 };
    case CommandType.FADE_OUT:
      return { kind: 'fade_out', duration: block.params.value ?? 1 };

    // --- Boss ---
    case CommandType.SPAWN_BOSS:
      return { kind: 'spawn_boss', name: block.params.text || 'Boss', health: block.params.value ?? 100 };
    case CommandType.SET_BOSS_HEALTH:
      return { kind: 'set_boss_health', health: block.params.value ?? 100 };
    case CommandType.BOSS_ATTACK:
      return { kind: 'boss_attack', pattern: block.params.text || 'normal' };
    case CommandType.BOSS_PHASE:
      return { kind: 'boss_phase', phase: block.params.value ?? 2 };

    // --- Advanced Movement ---
    case CommandType.DASH:
      return { kind: 'dash', force: block.params.value ?? 15 };
    case CommandType.DOUBLE_JUMP:
      return { kind: 'double_jump', enabled: block.params.condition !== 'false' };
    case CommandType.WALL_JUMP:
      return { kind: 'wall_jump', enabled: block.params.condition !== 'false' };
    case CommandType.GRAPPLE:
      return { kind: 'grapple', force: block.params.value ?? 10 };

    // --- Checkpoints ---
    case CommandType.CREATE_CHECKPOINT:
      return { kind: 'create_checkpoint', name: block.params.text || 'Checkpoint' };
    case CommandType.LOAD_CHECKPOINT:
      return { kind: 'load_checkpoint' };

    // --- Dialogue ---
    case CommandType.CREATE_DIALOGUE:
      return { kind: 'create_dialogue', speaker: block.params.text || 'NPC', message: block.params.message || 'Hello!' };
    case CommandType.END_DIALOGUE:
      return { kind: 'end_dialogue' };
    case CommandType.NPC_TALK:
      return { kind: 'npc_talk', name: block.params.text || 'Guard', message: block.params.message || 'Greetings adventurer!' };

    // --- Game Objects ---
    case CommandType.SHOOT:
      return { kind: 'shoot', emoji: block.params.text || '⚡' };
    case CommandType.ADD_PLATFORM:
      return { kind: 'add_platform', x: block.params.x ?? 200, y: block.params.y ?? 300, width: block.params.value ?? 100 };
    case CommandType.CREATE_CLONE:
      return { kind: 'create_clone' };
    case CommandType.DELETE_CLONE:
      return { kind: 'delete_clone' };

    // --- Weather ---
    case CommandType.SET_WEATHER:
      return { kind: 'set_weather', weather: block.params.text || 'none' };

    // --- Sports ---
    case CommandType.KICK_BALL:
      return { kind: 'kick_ball', emoji: block.params.text || '⚽', force: block.params.value ?? 10 };
    case CommandType.PASS_BALL:
      return { kind: 'pass_ball', target: block.params.text || 'teammate' };
    case CommandType.DRIBBLE:
      return { kind: 'dribble', speed: block.params.value ?? 5 };
    case CommandType.SHOOT_BALL:
      return { kind: 'shoot_ball', emoji: block.params.text || '⚽', force: block.params.value ?? 15 };
    case CommandType.SET_TIMER:
      return { kind: 'set_timer', seconds: block.params.value ?? 90 };
    case CommandType.TICK_TIMER:
      return { kind: 'tick_timer' };
    case CommandType.STOP_TIMER:
      return { kind: 'stop_timer' };
    case CommandType.SCORE_GOAL:
      return { kind: 'score_goal', points: block.params.value ?? 1 };
    case CommandType.ADD_PERIOD:
      return { kind: 'add_period', name: block.params.text || '1st Half' };
    case CommandType.END_PERIOD:
      return { kind: 'end_period' };
    case CommandType.SPAWN_BALL:
      return { kind: 'spawn_ball', emoji: block.params.text || '⚽' };
    case CommandType.SPAWN_TEAMMATE:
      return { kind: 'spawn_teammate', emoji: block.params.text || '🏃' };
    case CommandType.SPAWN_OPPONENT:
      return { kind: 'spawn_opponent', emoji: block.params.text || '🏃' };
    case CommandType.SWITCH_CONTROL:
      return { kind: 'switch_control' };
    case CommandType.SET_FORMATION:
      return { kind: 'set_formation', formation: block.params.text || '4-4-2' };
    case CommandType.FOUL:
      return { kind: 'foul', type: block.params.text || 'foul' };
    case CommandType.YELLOW_CARD:
      return { kind: 'yellow_card' };
    case CommandType.RED_CARD:
      return { kind: 'red_card' };

    // --- Advanced Sports ---
    case CommandType.CRY_FOUL:
      return { kind: 'cry_foul', text: block.params.text || 'foul' };
    case CommandType.CELEBRATE_GOAL:
      return { kind: 'celebrate_goal', text: block.params.text || 'goal' };
    case CommandType.SUBSTITUTION:
      return { kind: 'substitution', player: block.params.text || 'player' };
    case CommandType.EXTRA_TIME:
      return { kind: 'extra_time', seconds: block.params.value ?? 30 };
    case CommandType.PENALTY_KICK:
      return { kind: 'penalty_kick', force: block.params.value ?? 20 };
    case CommandType.CORNER_KICK:
      return { kind: 'corner_kick' };
    case CommandType.FREE_KICK:
      return { kind: 'free_kick', force: block.params.value ?? 15 };
    case CommandType.INJURY_TIME:
      return { kind: 'injury_time', seconds: block.params.value ?? 5 };
    case CommandType.WATER_BREAK:
      return { kind: 'water_break' };
    case CommandType.TEAM_TALK:
      return { kind: 'team_talk', message: block.params.text || 'motivate' };
    case CommandType.SET_PIECE:
      return { kind: 'set_piece', type: block.params.text || 'corner' };
    case CommandType.MAN_MARK:
      return { kind: 'man_mark' };

    // --- Action ---
    case CommandType.SWING_WEAPON:
      return { kind: 'swing_weapon', weapon: block.params.text || '⚔️', damage: block.params.value ?? 10 };
    case CommandType.COMBO_ATTACK:
      return { kind: 'combo_attack', hits: block.params.value ?? 3 };
    case CommandType.DODGE_ROLL:
      return { kind: 'dodge_roll', distance: block.params.value ?? 5 };
    case CommandType.BLOCK_ATTACK:
      return { kind: 'block_attack' };
    case CommandType.SPECIAL_MOVE:
      return { kind: 'special_move', name: block.params.text || 'ult', damage: block.params.value ?? 50 };
    case CommandType.SWITCH_WEAPON:
      return { kind: 'switch_weapon', weapon: block.params.text || 'sword' };
    case CommandType.CHARGE_ATTACK:
      return { kind: 'charge_attack', damage: block.params.value ?? 30 };

    // --- Adventure ---
    case CommandType.EXAMINE:
      return { kind: 'examine', target: block.params.text || 'area' };
    case CommandType.USE_ITEM:
      return { kind: 'use_item', item: block.params.text || '' };
    case CommandType.COMBINE_ITEMS:
      return { kind: 'combine_items', item1: block.params.text || '', item2: block.params.text2 || '' };
    case CommandType.TALK_TO:
      return { kind: 'talk_to', npc: block.params.text || 'NPC' };
    case CommandType.ADD_QUEST:
      return { kind: 'add_quest', name: block.params.text || 'Quest' };
    case CommandType.COMPLETE_QUEST:
      return { kind: 'complete_quest', name: block.params.text || 'Quest' };
    case CommandType.DISCOVER:
      return { kind: 'discover', location: block.params.text || 'Location' };
    case CommandType.TRIGGER_PUZZLE:
      return { kind: 'trigger_puzzle', type: block.params.text || 'puzzle' };

    // --- Shooter ---
    case CommandType.RELOAD:
      return { kind: 'reload' };
    case CommandType.THROW_GRENADE:
      return { kind: 'throw_grenade', force: block.params.value ?? 15 };
    case CommandType.TAKE_COVER:
      return { kind: 'take_cover' };
    case CommandType.AIM:
      return { kind: 'aim', zoom: block.params.value ?? 2 };
    case CommandType.SWAP_WEAPON:
      return { kind: 'swap_weapon', weapon: block.params.text || 'rifle' };
    case CommandType.DROP_WEAPON:
      return { kind: 'drop_weapon' };
    case CommandType.PICKUP_WEAPON:
      return { kind: 'pickup_weapon', weapon: block.params.text || 'rifle' };

    // --- Survival ---
    case CommandType.GATHER:
      return { kind: 'gather', resource: block.params.text || 'wood', amount: block.params.value ?? 1 };
    case CommandType.CRAFT:
      return { kind: 'craft', item: block.params.text || 'item', cost: block.params.value ?? 2 };
    case CommandType.EAT:
      return { kind: 'eat', amount: block.params.value ?? 20 };
    case CommandType.DRINK:
      return { kind: 'drink', amount: block.params.value ?? 15 };
    case CommandType.BUILD:
      return { kind: 'build', structure: block.params.text || 'wall', cost: block.params.value ?? 5 };
    case CommandType.PLACE_TORCH:
      return { kind: 'place_torch' };
    case CommandType.SHELTER:
      return { kind: 'shelter', level: block.params.value ?? 1 };

    // --- Puzzle ---
    case CommandType.SWAP_TILES:
      return { kind: 'swap_tiles' };
    case CommandType.ROTATE_BLOCK:
      return { kind: 'rotate_block', degrees: block.params.value ?? 90 };
    case CommandType.SLIDE_PUZZLE:
      return { kind: 'slide_puzzle', direction: block.params.text || 'right' };
    case CommandType.FILL_COLOR:
      return { kind: 'fill_color', color: block.params.color || '#ff0000' };
    case CommandType.CONNECT_DOTS:
      return { kind: 'connect_dots', pairs: block.params.value ?? 2 };
    case CommandType.SORT_ITEMS:
      return { kind: 'sort_items', by: block.params.text || 'color' };
    case CommandType.UNLOCK_PATTERN:
      return { kind: 'unlock_pattern', pattern: block.params.text || '1234' };
    case CommandType.MIRROR_PUZZLE:
      return { kind: 'mirror_puzzle', axis: block.params.text || 'horizontal' };
    case CommandType.FLIP_CARD:
      return { kind: 'flip_card' };
    case CommandType.CHECK_MATCH:
      return { kind: 'check_match' };

    // --- Racing ---
    case CommandType.BOOST:
      return { kind: 'boost', force: block.params.value ?? 20 };
    case CommandType.DRIFT:
      return { kind: 'drift', angle: block.params.value ?? 0 };
    case CommandType.LAP_COMPLETE:
      return { kind: 'lap_complete' };
    case CommandType.START_RACE:
      return { kind: 'start_race', countdown: block.params.value ?? 3 };
    case CommandType.SET_CHECKPOINT:
      return { kind: 'set_checkpoint' };
    case CommandType.UPGRADE_CAR:
      return { kind: 'upgrade_car', stat: block.params.text || 'speed', amount: block.params.value ?? 1 };
    case CommandType.PIT_STOP:
      return { kind: 'pit_stop' };
    case CommandType.USE_BOOST_PAD:
      return { kind: 'use_boost_pad' };

    // --- Movement Extras ---
    case CommandType.GO_TO_XY:
      return { kind: 'go_to_xy', x: block.params.x ?? 200, y: block.params.y ?? 200 };
    case CommandType.TURN_RIGHT:
      return { kind: 'turn_right', degrees: block.params.value ?? 15 };
    case CommandType.TURN_LEFT:
      return { kind: 'turn_left', degrees: block.params.value ?? 15 };

    // --- 3D ---
    case CommandType.MOVE_Z:
      return { kind: 'move_z', dz: block.params.value ?? 0 };
    case CommandType.ROTATE_X:
      return { kind: 'rotate_x', degrees: block.params.value ?? 0 };
    case CommandType.ROTATE_Y:
      return { kind: 'rotate_y', degrees: block.params.value ?? 0 };
    case CommandType.ROTATE_Z:
      return { kind: 'rotate_z', degrees: block.params.value ?? 0 };

    // --- Advanced Platformer Extras ---
    case CommandType.WALL_JUMP_ENABLED:
      return { kind: 'wall_jump_enabled', enabled: block.params.condition === 'true' };
    case CommandType.CEILING_CLING:
      return { kind: 'ceiling_cling' };
    case CommandType.AIR_DASH:
      return { kind: 'air_dash', force: block.params.value ?? 15 };
    case CommandType.GROUND_SLAM:
      return { kind: 'ground_slam', force: block.params.value ?? 20 };
    case CommandType.CLIMB_VINE:
      return { kind: 'climb_vine', force: block.params.value ?? 5 };
    case CommandType.SWING_ROPE:
      return { kind: 'swing_rope', force: block.params.value ?? 10 };

    // --- Misc ---
    case CommandType.SET_SCENE:
      return { kind: 'set_scene', scene: block.params.text || 'grid' };
    case CommandType.SET_MUSIC_VOLUME:
      return { kind: 'set_music_volume', volume: (block.params.value || 50) / 100 };
    case CommandType.PLAY_AMBIENT:
      return { kind: 'play_ambient', preset: block.params.text || 'nature' };
    case CommandType.SLOW_MOTION:
      return { kind: 'slow_motion', timeScale: block.params.value || 0.5 };
    case CommandType.PLAY_ANIMATION:
      return { kind: 'play_animation', animation: block.params.text || 'idle' };
    case CommandType.BROADCAST:
      return { kind: 'broadcast', channel: block.params.text || 'default' };
    case CommandType.LOG_DATA:
      return { kind: 'log_data', text: String(block.params.text || '') };
    case CommandType.WAIT:
    case CommandType.SLEEP:
      return { kind: 'wait', seconds: block.params.value ?? 1 };

    // --- Save/Load ---
    case CommandType.SAVE_GAME:
      return { kind: 'save_game', slot: block.params.text || 'slot1' };
    case CommandType.LOAD_GAME:
      return { kind: 'load_game', slot: block.params.text || 'slot1' };

    // --- Data ---
    case CommandType.SET_VAR:
      return { kind: 'set_var', varName: block.params.varName ?? 'x', value: block.params.value ?? null };
    case CommandType.CHANGE_VAR:
      return { kind: 'change_var', varName: block.params.varName ?? 'x', delta: Number(block.params.value) || 0 };

    default:
      return null;
  }
}
