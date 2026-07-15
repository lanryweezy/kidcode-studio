import { AppMode, CommandType, CircuitComponent, CommandBlock } from '../../types';
import { LucideIcon, ArrowUpCircle, Zap, Box, Eye, Anchor, Droplets, ArrowBigUp } from 'lucide-react';

export const platformerTemplates: {
    id: string,
    mode: AppMode,
    name: string,
    description: string,
    icon: LucideIcon,
    color: string,
    commands: CommandBlock[],
    circuitComponents?: CircuitComponent[]
}[] = [
        {
            id: 'tpl_game_jump',
            mode: AppMode.GAME,
            name: 'Jumping Bot',
            description: 'A platformer starter with gravity and jump logic.',
            icon: ArrowUpCircle,
            color: 'bg-orange-500',
            commands: [
                { id: '1', type: CommandType.SET_SCENE, params: { text: 'forest' } },
                { id: '2', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
                { id: '3', type: CommandType.FOREVER, params: {} },
                { id: '4', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, // Up Arrow code usually
                { id: '5', type: CommandType.JUMP, params: { value: 15 } },
                { id: '6', type: CommandType.END_IF, params: {} },
                { id: '7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, // Right
                { id: '8', type: CommandType.MOVE_X, params: { value: 5 } },
                { id: '9', type: CommandType.END_IF, params: {} },
                { id: '10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, // Left
                { id: '11', type: CommandType.MOVE_X, params: { value: -5 } },
                { id: '12', type: CommandType.END_IF, params: {} },
                { id: '13', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'tpl_game_3d',
            mode: AppMode.GAME,
            name: '3D World Explorer',
            description: 'Build and walk through a 3D world!',
            icon: Box,
            color: 'bg-cyan-600',
            commands: [
                { id: '1', type: CommandType.SET_VIEW_3D, params: { condition: 'true' } },
                { id: '2', type: CommandType.GENERATE_ENVIRONMENT, params: { text: 'Sci-fi Moon Base' } },
                { id: '3', type: CommandType.SET_EMOJI, params: { text: '👨‍🚀' } },
                { id: '4', type: CommandType.SAY, params: { text: 'One small step for a kid...' } },
                { id: '5', type: CommandType.FOREVER, params: {} },
                { id: '6', type: CommandType.MOVE_Z, params: { value: 1 } },
                { id: '7', type: CommandType.ROTATE_Y, params: { value: 5 } },
                { id: '8', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'hero_parkour_3d',
            mode: AppMode.GAME,
            name: '3D Parkour Runner',
            description: '🏆 A complete 3D obstacle course game with AI world generation!',
            icon: Box,
            color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
            commands: [
                { id: '1', type: CommandType.SET_VIEW_3D, params: { condition: 'true' } },
                { id: '2', type: CommandType.GENERATE_ENVIRONMENT, params: { text: 'Neon Cyberpunk City' } },
                { id: '3', type: CommandType.SET_EMOJI, params: { text: '🥷' } },
                { id: '4', type: CommandType.SAY, params: { text: 'Ready... GO!' } },
                { id: '5', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
                { id: '6', type: CommandType.FOREVER, params: {} },
                { id: '7', type: CommandType.MOVE_Z, params: { value: 3 } },
                { id: '8', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } },
                { id: '9', type: CommandType.JUMP, params: { value: 18 } },
                { id: '10', type: CommandType.END_IF, params: {} },
                { id: '11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
                { id: '12', type: CommandType.MOVE_X, params: { value: 4 } },
                { id: '13', type: CommandType.END_IF, params: {} },
                { id: '14', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
                { id: '15', type: CommandType.MOVE_X, params: { value: -4 } },
                { id: '16', type: CommandType.END_IF, params: {} },
                { id: '17', type: CommandType.CHANGE_SCORE, params: { value: 1 } },
                { id: '18', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'tpl_game_runner',
            mode: AppMode.GAME,
            name: 'Endless Runner',
            description: 'Run forever, dodge obstacles!',
            icon: Zap,
            color: 'bg-cyan-600',
            commands: [
                { id: '1', type: CommandType.SET_SCENE, params: { text: 'grid' } },
                { id: '2', type: CommandType.SET_EMOJI, params: { text: '🏃' } },
                { id: '3', type: CommandType.SET_VAR, params: { varName: 'score', value: 0 } },
                { id: '4', type: CommandType.FOREVER, params: {} },
                { id: '5', type: CommandType.MOVE_X, params: { value: 5 } },
                { id: '6', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 1 } },
                { id: '7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } },
                { id: '8', type: CommandType.JUMP, params: { value: 15 } },
                { id: '9', type: CommandType.END_IF, params: {} },
                { id: '10', type: CommandType.SPAWN_ENEMY, params: { text: '🚧' } },
                { id: '11', type: CommandType.PLAY_SOUND, params: { text: 'coin' } },
                { id: '12', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'tpl_game_platformer',
            mode: AppMode.GAME,
            name: 'Mario Platformer',
            description: 'Classic jump-and-run with coins!',
            icon: ArrowUpCircle,
            color: 'bg-red-600',
            commands: [
                { id: '1', type: CommandType.SET_SCENE, params: { text: 'forest' } },
                { id: '2', type: CommandType.SET_EMOJI, params: { text: '🧑‍🔧' } },
                { id: '3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
                { id: '4', type: CommandType.SET_VAR, params: { varName: 'coins', value: 0 } },
                { id: '5', type: CommandType.FOREVER, params: {} },
                { id: '6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } },
                { id: '7', type: CommandType.JUMP, params: { value: 15 } },
                { id: '8', type: CommandType.PLAY_SOUND, params: { text: 'jump' } },
                { id: '9', type: CommandType.END_IF, params: {} },
                { id: '10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
                { id: '11', type: CommandType.MOVE_X, params: { value: 5 } },
                { id: '12', type: CommandType.END_IF, params: {} },
                { id: '13', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
                { id: '14', type: CommandType.MOVE_X, params: { value: -5 } },
                { id: '15', type: CommandType.END_IF, params: {} },
                { id: '16', type: CommandType.SPAWN_ITEM, params: { text: '🪙' } },
                { id: '17', type: CommandType.CHANGE_VAR, params: { varName: 'coins', value: 1 } },
                { id: '18', type: CommandType.PLAY_SOUND, params: { text: 'coin' } },
                { id: '19', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'tpl_platformer_full',
            mode: AppMode.GAME,
            name: 'Dragon Quest Platformer',
            description: 'Complete platformer with enemies, boss, inventory, cutscenes, weather, and day/night cycle!',
            icon: ArrowUpCircle,
            color: 'bg-gradient-to-r from-orange-500 to-red-500',
            commands: [
                // === INTRO CUTSCENE ===
                { id: 'c1', type: CommandType.TRIGGER_CUTSCENE, params: { text: 'intro' } },
                { id: 'c2', type: CommandType.SAY, params: { text: 'Welcome, brave adventurer!' } },
                { id: 'c3', type: CommandType.WAIT, params: { value: 2 } },
                { id: 'c4', type: CommandType.SAY, params: { text: 'Defeat the Dragon Lord and save the kingdom!' } },
                { id: 'c5', type: CommandType.WAIT, params: { value: 2 } },
                { id: 'c6', type: CommandType.FADE_IN, params: { value: 1 } },

                // === SETUP ===
                { id: 's1', type: CommandType.SET_SCENE, params: { text: 'forest' } },
                { id: 's2', type: CommandType.SET_EMOJI, params: { text: '🧑‍🔧' } },
                { id: 's3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } },
                { id: 's4', type: CommandType.SET_WEATHER, params: { text: 'rain' } },
                { id: 's5', type: CommandType.SET_SIZE, params: { value: 100 } },
                { id: 's6', type: CommandType.BOUNCE_ON_EDGE, params: {} },

                // === VARIABLES ===
                { id: 'v1', type: CommandType.SET_VAR, params: { varName: 'coins', value: 0 } },
                { id: 'v2', type: CommandType.SET_VAR, params: { varName: 'health', value: 100 } },
                { id: 'v3', type: CommandType.SET_VAR, params: { varName: 'enemies_defeated', value: 0 } },
                { id: 'v4', type: CommandType.SET_VAR, params: { varName: 'has_sword', value: 0 } },
                { id: 'v5', type: CommandType.SET_VAR, params: { varName: 'boss_defeated', value: 0 } },

                // === SPAWN ENEMIES ===
                { id: 'e1', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: 'e2', type: CommandType.SPAWN_ENEMY, params: { text: '🦇' } },
                { id: 'e3', type: CommandType.SPAWN_ENEMY, params: { text: '👻' } },

                // === SPAWN COLLECTIBLES ===
                { id: 'i1', type: CommandType.SPAWN_ITEM, params: { text: '🪙' } },
                { id: 'i2', type: CommandType.SPAWN_ITEM, params: { text: '🪙' } },
                { id: 'i3', type: CommandType.SPAWN_ITEM, params: { text: '🪙' } },
                { id: 'i4', type: CommandType.SPAWN_ITEM, params: { text: '❤️' } },
                { id: 'i5', type: CommandType.SPAWN_ITEM, params: { text: '⚔️' } },

                // === BACKGROUND MUSIC ===
                { id: 'm1', type: CommandType.SET_BACKGROUND_MUSIC, params: { text: 'adventure' } },

                // === MAIN GAME LOOP ===
                { id: 'f1', type: CommandType.FOREVER, params: {} },

                // --- MOVEMENT ---
                { id: 'mv1', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
                { id: 'mv2', type: CommandType.MOVE_X, params: { value: -5 } },
                { id: 'mv3', type: CommandType.END_IF, params: {} },
                { id: 'mv4', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
                { id: 'mv5', type: CommandType.MOVE_X, params: { value: 5 } },
                { id: 'mv6', type: CommandType.END_IF, params: {} },
                { id: 'mv7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } },
                { id: 'mv8', type: CommandType.JUMP, params: { value: 15 } },
                { id: 'mv9', type: CommandType.PLAY_SOUND, params: { text: 'jump' } },
                { id: 'mv10', type: CommandType.END_IF, params: {} },

                // --- ATTACK ---
                { id: 'at1', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } },
                { id: 'at2', type: CommandType.SHOOT, params: { text: '⚡' } },
                { id: 'at3', type: CommandType.PLAY_SOUND, params: { text: 'laser' } },
                { id: 'at4', type: CommandType.END_IF, params: {} },

                // --- COLLECT COINS ---
                { id: 'cc1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🪙' } },
                { id: 'cc2', type: CommandType.CHANGE_VAR, params: { varName: 'coins', value: 1 } },
                { id: 'cc3', type: CommandType.PLAY_SOUND, params: { text: 'coin' } },
                { id: 'cc4', type: CommandType.END_IF, params: {} },

                // --- PICK UP SWORD ---
                { id: 'ps1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '⚔️' } },
                { id: 'ps2', type: CommandType.SET_VAR, params: { varName: 'has_sword', value: 1 } },
                { id: 'ps3', type: CommandType.SAY, params: { text: 'Got the Dragon Slayer!' } },
                { id: 'ps4', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'ps5', type: CommandType.END_IF, params: {} },

                // --- COLLECT HEALTH ---
                { id: 'ch1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '❤️' } },
                { id: 'ch2', type: CommandType.CHANGE_VAR, params: { varName: 'health', value: 25 } },
                { id: 'ch3', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'ch4', type: CommandType.END_IF, params: {} },

                // --- ENEMY CONTACT ---
                { id: 'ec1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '👾' } },
                { id: 'ec2', type: CommandType.CHANGE_VAR, params: { varName: 'health', value: -10 } },
                { id: 'ec3', type: CommandType.PLAY_SOUND, params: { text: 'hurt' } },
                { id: 'ec4', type: CommandType.END_IF, params: {} },

                // --- DEFEAT ENEMY WITH SWORD ---
                { id: 'de1', type: CommandType.IF, params: { condition: 'AND' } },
                { id: 'de2', type: CommandType.CHANGE_VAR, params: { varName: 'enemies_defeated', value: 1 } },
                { id: 'de3', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 10 } },
                { id: 'de4', type: CommandType.PLAY_SOUND, params: { text: 'explosion' } },
                { id: 'de5', type: CommandType.SPAWN_PARTICLES, params: { value: 5 } },
                { id: 'de6', type: CommandType.END_IF, params: {} },

                // --- SPAWN MORE ENEMIES ---
                { id: 'se1', type: CommandType.IF, params: { condition: 'EQUALS', varName: 'enemies_defeated', value: 3 } },
                { id: 'se2', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: 'se3', type: CommandType.END_IF, params: {} },

                // --- BOSS TRIGGER (after 5 enemies) ---
                { id: 'bt1', type: CommandType.IF, params: { condition: 'GREATER' } },
                { id: 'bt2', type: CommandType.SAY, params: { text: '⚠️ The Dragon Lord approaches!' } },
                { id: 'bt3', type: CommandType.WAIT, params: { value: 2 } },
                { id: 'bt4', type: CommandType.SPAWN_ENEMY, params: { text: '🐉' } },
                { id: 'bt5', type: CommandType.SET_WEATHER, params: { text: 'storm' } },
                { id: 'bt6', type: CommandType.PLAY_SOUND, params: { text: 'explosion' } },
                { id: 'bt7', type: CommandType.END_IF, params: {} },

                // --- WIN CONDITION ---
                { id: 'wc1', type: CommandType.IF, params: { condition: 'EQUALS', varName: 'boss_defeated', value: 1 } },
                { id: 'wc2', type: CommandType.SET_VAR, params: { varName: 'boss_defeated', value: 1 } },
                { id: 'wc3', type: CommandType.SAY, params: { text: '🎉 You defeated the Dragon Lord!' } },
                { id: 'wc4', type: CommandType.PLAY_SOUND, params: { text: 'victory' } },
                { id: 'wc5', type: CommandType.WIN_GAME, params: {} },
                { id: 'wc6', type: CommandType.END_IF, params: {} },

                // --- GAME OVER ---
                { id: 'go1', type: CommandType.IF, params: { condition: 'EQUALS', varName: 'health', value: 0 } },
                { id: 'go2', type: CommandType.SAY, params: { text: '💀 Game Over!' } },
                { id: 'go3', type: CommandType.PLAY_SOUND, params: { text: 'death' } },
                { id: 'go4', type: CommandType.GAME_OVER, params: {} },
                { id: 'go5', type: CommandType.END_IF, params: {} },

                // --- CHECKPOINT ---
                { id: 'cp1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '💾' } },
                { id: 'cp2', type: CommandType.CREATE_CHECKPOINT, params: {} },
                { id: 'cp3', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'cp4', type: CommandType.SAY, params: { text: '💾 Checkpoint saved!' } },
                { id: 'cp5', type: CommandType.END_IF, params: {} },

                { id: 'f2', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        { id: 'tpl_platformer_castle', mode: AppMode.GAME, name: 'Castle Runner', description: 'Escape the crumbling castle with wall jumps and air dashes!', icon: ArrowUpCircle, color: 'bg-gradient-to-r from-stone-600 to-stone-800', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🏃' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.WALL_JUMP_ENABLED, params: { condition: 'true' } }, { id: 'c5', type: CommandType.DOUBLE_JUMP, params: { condition: 'true' } }, { id: 'c6', type: CommandType.SET_VAR, params: { varName: 'stars', value: 0 } }, { id: 'c7', type: CommandType.SPAWN_ITEM, params: { text: '⭐' } }, { id: 'c8', type: CommandType.SPAWN_ENEMY, params: { text: '💀' } }, { id: 'c9', type: CommandType.FOREVER, params: {} }, { id: 'c10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c11', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c12', type: CommandType.END_IF, params: {} }, { id: 'c13', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c14', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c15', type: CommandType.END_IF, params: {} }, { id: 'c16', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c17', type: CommandType.JUMP, params: { value: 18 } }, { id: 'c18', type: CommandType.PLAY_SOUND, params: { text: 'jump' } }, { id: 'c19', type: CommandType.END_IF, params: {} }, { id: 'c20', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c21', type: CommandType.AIR_DASH, params: { value: 15 } }, { id: 'c22', type: CommandType.PLAY_SOUND, params: { text: 'dash' } }, { id: 'c23', type: CommandType.END_IF, params: {} }, { id: 'c24', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 34 } }, { id: 'c25', type: CommandType.GROUND_SLAM, params: { value: 20 } }, { id: 'c26', type: CommandType.PLAY_SOUND, params: { text: 'explosion' } }, { id: 'c27', type: CommandType.END_IF, params: {} }, { id: 'c28', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '⭐' } }, { id: 'c29', type: CommandType.COLLECT_STAR, params: { value: 1 } }, { id: 'c30', type: CommandType.PLAY_SOUND, params: { text: 'coin' } }, { id: 'c31', type: CommandType.END_IF, params: {} }, { id: 'c32', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_jungle', mode: AppMode.GAME, name: 'Jungle Swing', description: 'Swing through the jungle on vines and ropes!', icon: Anchor, color: 'bg-gradient-to-r from-green-600 to-emerald-700', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'grass' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🐒' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'bananas', value: 0 } }, { id: 'c5', type: CommandType.SPAWN_ITEM, params: { text: '🍌' } }, { id: 'c6', type: CommandType.FOREVER, params: {} }, { id: 'c7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c8', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c9', type: CommandType.END_IF, params: {} }, { id: 'c10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c11', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c12', type: CommandType.END_IF, params: {} }, { id: 'c13', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c14', type: CommandType.JUMP, params: { value: 15 } }, { id: 'c15', type: CommandType.END_IF, params: {} }, { id: 'c16', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c17', type: CommandType.SWING_ROPE, params: { value: 10 } }, { id: 'c18', type: CommandType.PLAY_SOUND, params: { text: 'jump' } }, { id: 'c19', type: CommandType.END_IF, params: {} }, { id: 'c20', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 33 } }, { id: 'c21', type: CommandType.CLIMB_VINE, params: { value: 5 } }, { id: 'c22', type: CommandType.END_IF, params: {} }, { id: 'c23', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🍌' } }, { id: 'c24', type: CommandType.CHANGE_VAR, params: { varName: 'bananas', value: 1 } }, { id: 'c25', type: CommandType.PLAY_SOUND, params: { text: 'coin' } }, { id: 'c26', type: CommandType.END_IF, params: {} }, { id: 'c27', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_ice', mode: AppMode.GAME, name: 'Frozen Peaks', description: 'Icy platforming with slippery surfaces!', icon: ArrowUpCircle, color: 'bg-gradient-to-r from-blue-200 to-cyan-300', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'ice_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🐧' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.SET_WEATHER, params: { text: 'snow' } }, { id: 'c5', type: CommandType.SET_VAR, params: { varName: 'fish', value: 0 } }, { id: 'c6', type: CommandType.SPAWN_ITEM, params: { text: '🐟' } }, { id: 'c7', type: CommandType.FOREVER, params: {} }, { id: 'c8', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c9', type: CommandType.MOVE_X, params: { value: -6 } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c12', type: CommandType.MOVE_X, params: { value: 6 } }, { id: 'c13', type: CommandType.END_IF, params: {} }, { id: 'c14', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c15', type: CommandType.JUMP, params: { value: 12 } }, { id: 'c16', type: CommandType.END_IF, params: {} }, { id: 'c17', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🐟' } }, { id: 'c18', type: CommandType.CHANGE_VAR, params: { varName: 'fish', value: 1 } }, { id: 'c19', type: CommandType.PLAY_SOUND, params: { text: 'coin' } }, { id: 'c20', type: CommandType.END_IF, params: {} }, { id: 'c21', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_factory', mode: AppMode.GAME, name: 'Factory Escape', description: 'Navigate conveyor belts and moving platforms!', icon: ArrowUpCircle, color: 'bg-gradient-to-r from-slate-600 to-slate-800', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'metal_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🤖' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.ACTIVATE_SWITCH, params: { text: 'door' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c7', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c8', type: CommandType.END_IF, params: {} }, { id: 'c9', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c10', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c11', type: CommandType.END_IF, params: {} }, { id: 'c12', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c13', type: CommandType.JUMP, params: { value: 15 } }, { id: 'c14', type: CommandType.END_IF, params: {} }, { id: 'c15', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c16', type: CommandType.ACTIVATE_SWITCH, params: { text: 'belt' } }, { id: 'c17', type: CommandType.PLAY_SOUND, params: { text: 'click' } }, { id: 'c18', type: CommandType.END_IF, params: {} }, { id: 'c19', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_portal', mode: AppMode.GAME, name: 'Portal Plumber', description: 'Use portals to solve platforming puzzles!', icon: Eye, color: 'bg-gradient-to-r from-purple-500 to-violet-600', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🔧' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'portals_used', value: 0 } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c7', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c8', type: CommandType.END_IF, params: {} }, { id: 'c9', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c10', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c11', type: CommandType.END_IF, params: {} }, { id: 'c12', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c13', type: CommandType.JUMP, params: { value: 15 } }, { id: 'c14', type: CommandType.END_IF, params: {} }, { id: 'c15', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c16', type: CommandType.ENTER_PORTAL, params: { text: 'next_room' } }, { id: 'c17', type: CommandType.CHANGE_VAR, params: { varName: 'portals_used', value: 1 } }, { id: 'c18', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } }, { id: 'c19', type: CommandType.END_IF, params: {} }, { id: 'c20', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_sky', mode: AppMode.GAME, name: 'Sky Fortress', description: 'Cloud-hopping platformer with air dashes!', icon: ArrowUpCircle, color: 'bg-gradient-to-r from-sky-400 to-blue-500', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'grass' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🦅' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.DOUBLE_JUMP, params: { condition: 'true' } }, { id: 'c5', type: CommandType.AIR_DASH, params: { value: 15 } }, { id: 'c6', type: CommandType.SET_VAR, params: { varName: 'feathers', value: 0 } }, { id: 'c7', type: CommandType.SPAWN_ITEM, params: { text: '🪶' } }, { id: 'c8', type: CommandType.FOREVER, params: {} }, { id: 'c9', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c10', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c11', type: CommandType.END_IF, params: {} }, { id: 'c12', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c13', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c14', type: CommandType.END_IF, params: {} }, { id: 'c15', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c16', type: CommandType.JUMP, params: { value: 18 } }, { id: 'c17', type: CommandType.END_IF, params: {} }, { id: 'c18', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c19', type: CommandType.AIR_DASH, params: { value: 15 } }, { id: 'c20', type: CommandType.PLAY_SOUND, params: { text: 'dash' } }, { id: 'c21', type: CommandType.END_IF, params: {} }, { id: 'c22', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🪶' } }, { id: 'c23', type: CommandType.CHANGE_VAR, params: { varName: 'feathers', value: 1 } }, { id: 'c24', type: CommandType.PLAY_SOUND, params: { text: 'coin' } }, { id: 'c25', type: CommandType.END_IF, params: {} }, { id: 'c26', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_water', mode: AppMode.GAME, name: 'Deep Dive', description: 'Underwater platforming with bubbles and currents!', icon: Droplets, color: 'bg-gradient-to-r from-blue-500 to-cyan-600', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'water' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🐠' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'false' } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'pearls', value: 0 } }, { id: 'c5', type: CommandType.SPAWN_ITEM, params: { text: '🫧' } }, { id: 'c6', type: CommandType.FOREVER, params: {} }, { id: 'c7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c8', type: CommandType.MOVE_X, params: { value: -4 } }, { id: 'c9', type: CommandType.END_IF, params: {} }, { id: 'c10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c11', type: CommandType.MOVE_X, params: { value: 4 } }, { id: 'c12', type: CommandType.END_IF, params: {} }, { id: 'c13', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c14', type: CommandType.MOVE_Y, params: { value: -4 } }, { id: 'c15', type: CommandType.END_IF, params: {} }, { id: 'c16', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 40 } }, { id: 'c17', type: CommandType.MOVE_Y, params: { value: 4 } }, { id: 'c18', type: CommandType.END_IF, params: {} }, { id: 'c19', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🫧' } }, { id: 'c20', type: CommandType.CHANGE_VAR, params: { varName: 'pearls', value: 1 } }, { id: 'c21', type: CommandType.PLAY_SOUND, params: { text: 'coin' } }, { id: 'c22', type: CommandType.END_IF, params: {} }, { id: 'c23', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_platformer_gravity', mode: AppMode.GAME, name: 'Gravity Flip', description: 'Flip gravity to navigate impossible levels!', icon: ArrowBigUp, color: 'bg-gradient-to-r from-violet-500 to-purple-700', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🔮' } }, { id: 'c3', type: CommandType.SET_GRAVITY, params: { condition: 'true' } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'flips', value: 0 } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c7', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c8', type: CommandType.END_IF, params: {} }, { id: 'c9', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c10', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c11', type: CommandType.END_IF, params: {} }, { id: 'c12', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c13', type: CommandType.CHANGE_VAR, params: { varName: 'flips', value: 1 } }, { id: 'c14', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } }, { id: 'c15', type: CommandType.END_IF, params: {} }, { id: 'c16', type: CommandType.END_FOREVER, params: {} }
        ]},
];
