import { AppMode, CommandType, CircuitComponent, CommandBlock } from '../../types';
import { LucideIcon, Zap, Crosshair, Shield } from 'lucide-react';

export const shooterTemplates: {
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
            id: 'tpl_game_space',
            mode: AppMode.GAME,
            name: 'Space Shooter',
            description: 'Fly through space and shoot enemies!',
            icon: Zap,
            color: 'bg-indigo-600',
            commands: [
                { id: '1', type: CommandType.SET_SCENE, params: { text: 'space' } },
                { id: '2', type: CommandType.SET_EMOJI, params: { text: '🚀' } },
                { id: '3', type: CommandType.SET_VAR, params: { varName: 'score', value: 0 } },
                { id: '4', type: CommandType.FOREVER, params: {} },
                { id: '5', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
                { id: '6', type: CommandType.MOVE_X, params: { value: -8 } },
                { id: '7', type: CommandType.END_IF, params: {} },
                { id: '8', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
                { id: '9', type: CommandType.MOVE_X, params: { value: 8 } },
                { id: '10', type: CommandType.END_IF, params: {} },
                { id: '11', type: CommandType.SHOOT, params: { text: '🔥' } },
                { id: '12', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: '13', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 1 } },
                { id: '14', type: CommandType.PLAY_SOUND, params: { text: 'laser' } },
                { id: '15', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        {
            id: 'tpl_arcade_galactic',
            mode: AppMode.GAME,
            name: 'Galactic Defender',
            description: 'Epic space shooter with waves, power-ups, combo system, and boss battles!',
            icon: Zap,
            color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
            commands: [
                // === INTRO CUTSCENE ===
                { id: 'c1', type: CommandType.TRIGGER_CUTSCENE, params: { text: 'intro' } },
                { id: 'c2', type: CommandType.SAY, params: { text: '🌌 Year 3024... The galaxy is under attack!' } },
                { id: 'c3', type: CommandType.WAIT, params: { value: 2 } },
                { id: 'c4', type: CommandType.SAY, params: { text: 'You are the last defender. Save humanity!' } },
                { id: 'c5', type: CommandType.WAIT, params: { value: 2 } },
                { id: 'c6', type: CommandType.FADE_IN, params: { value: 1 } },

                // === SETUP ===
                { id: 's1', type: CommandType.SET_SCENE, params: { text: 'space' } },
                { id: 's2', type: CommandType.SET_EMOJI, params: { text: '🚀' } },
                { id: 's3', type: CommandType.SET_WEATHER, params: { text: 'none' } },
                { id: 's4', type: CommandType.BOUNCE_ON_EDGE, params: {} },
                { id: 's5', type: CommandType.SET_SIZE, params: { value: 100 } },

                // === VARIABLES ===
                { id: 'v1', type: CommandType.SET_VAR, params: { varName: 'score', value: 0 } },
                { id: 'v2', type: CommandType.SET_VAR, params: { varName: 'health', value: 100 } },
                { id: 'v3', type: CommandType.SET_VAR, params: { varName: 'wave', value: 1 } },
                { id: 'v4', type: CommandType.SET_VAR, params: { varName: 'kills', value: 0 } },
                { id: 'v5', type: CommandType.SET_VAR, params: { varName: 'combo', value: 0 } },
                { id: 'v6', type: CommandType.SET_VAR, params: { varName: 'power_level', value: 1 } },
                { id: 'v7', type: CommandType.SET_VAR, params: { varName: 'boss_active', value: 0 } },

                // === SPAWN INITIAL ENEMIES ===
                { id: 'e1', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: 'e2', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: 'e3', type: CommandType.SPAWN_ENEMY, params: { text: '🦇' } },

                // === SPAWN POWER-UPS ===
                { id: 'p1', type: CommandType.SPAWN_ITEM, params: { text: '⚡' } },
                { id: 'p2', type: CommandType.SPAWN_ITEM, params: { text: '❤️' } },
                { id: 'p3', type: CommandType.SPAWN_ITEM, params: { text: '🛡️' } },

                // === BACKGROUND MUSIC ===
                { id: 'm1', type: CommandType.SET_BACKGROUND_MUSIC, params: { text: 'battle' } },

                // === MAIN GAME LOOP ===
                { id: 'f1', type: CommandType.FOREVER, params: {} },

                // --- MOVEMENT (WASD / Arrow Keys) ---
                { id: 'mv1', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
                { id: 'mv2', type: CommandType.MOVE_X, params: { value: -8 } },
                { id: 'mv3', type: CommandType.END_IF, params: {} },
                { id: 'mv4', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
                { id: 'mv5', type: CommandType.MOVE_X, params: { value: 8 } },
                { id: 'mv6', type: CommandType.END_IF, params: {} },
                { id: 'mv7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } },
                { id: 'mv8', type: CommandType.MOVE_Y, params: { value: -8 } },
                { id: 'mv9', type: CommandType.END_IF, params: {} },
                { id: 'mv10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 40 } },
                { id: 'mv11', type: CommandType.MOVE_Y, params: { value: 8 } },
                { id: 'mv12', type: CommandType.END_IF, params: {} },

                // --- SHOOT (Space / Z) ---
                { id: 'sh1', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } },
                { id: 'sh2', type: CommandType.SHOOT, params: { text: '🔥' } },
                { id: 'sh3', type: CommandType.PLAY_SOUND, params: { text: 'laser' } },
                { id: 'sh4', type: CommandType.CHANGE_VAR, params: { varName: 'combo', value: 1 } },
                { id: 'sh5', type: CommandType.END_IF, params: {} },

                // --- COLLECT POWER-UPS ---
                { id: 'cp1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '⚡' } },
                { id: 'cp2', type: CommandType.CHANGE_VAR, params: { varName: 'power_level', value: 1 } },
                { id: 'cp3', type: CommandType.SAY, params: { text: '⚡ POWER UP! Level ' } },
                { id: 'cp4', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'cp5', type: CommandType.END_IF, params: {} },

                // --- COLLECT HEALTH ---
                { id: 'hp1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '❤️' } },
                { id: 'hp2', type: CommandType.CHANGE_VAR, params: { varName: 'health', value: 25 } },
                { id: 'hp3', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'hp4', type: CommandType.SAY, params: { text: '❤️ Health restored!' } },
                { id: 'hp5', type: CommandType.END_IF, params: {} },

                // --- COLLECT SHIELD ---
                { id: 'sh1b', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🛡️' } },
                { id: 'sh2b', type: CommandType.CHANGE_VAR, params: { varName: 'health', value: 50 } },
                { id: 'sh3b', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'sh4b', type: CommandType.SAY, params: { text: '🛡️ Shield activated!' } },
                { id: 'sh5b', type: CommandType.END_IF, params: {} },

                // --- ENEMY CONTACT DAMAGE ---
                { id: 'ed1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '👾' } },
                { id: 'ed2', type: CommandType.CHANGE_VAR, params: { varName: 'health', value: -10 } },
                { id: 'ed3', type: CommandType.CHANGE_VAR, params: { varName: 'combo', value: 0 } },
                { id: 'ed4', type: CommandType.PLAY_SOUND, params: { text: 'hurt' } },
                { id: 'ed5', type: CommandType.END_IF, params: {} },

                // --- BAT CONTACT ---
                { id: 'bd1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🦇' } },
                { id: 'bd2', type: CommandType.CHANGE_VAR, params: { varName: 'health', value: -15 } },
                { id: 'bd3', type: CommandType.CHANGE_VAR, params: { varName: 'combo', value: 0 } },
                { id: 'bd4', type: CommandType.PLAY_SOUND, params: { text: 'hurt' } },
                { id: 'bd5', type: CommandType.END_IF, params: {} },

                // --- KILL ENEMY (projectile hits) ---
                { id: 'ke1', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '🔥' } },
                { id: 'ke2', type: CommandType.CHANGE_VAR, params: { varName: 'kills', value: 1 } },
                { id: 'ke3', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 10 } },
                { id: 'ke4', type: CommandType.PLAY_SOUND, params: { text: 'explosion' } },
                { id: 'ke5', type: CommandType.SPAWN_PARTICLES, params: { value: 8 } },
                { id: 'ke6', type: CommandType.END_IF, params: {} },

                // --- WAVE SYSTEM (every 10 kills) ---
                { id: 'ws1', type: CommandType.IF, params: { condition: 'GREATER', varName: 'kills', value: 9 } },
                { id: 'ws2', type: CommandType.CHANGE_VAR, params: { varName: 'wave', value: 1 } },
                { id: 'ws3', type: CommandType.SET_VAR, params: { varName: 'kills', value: 0 } },
                { id: 'ws4', type: CommandType.SAY, params: { text: '🌊 WAVE ' } },
                { id: 'ws5', type: CommandType.PLAY_SOUND, params: { text: 'powerup' } },
                { id: 'ws6', type: CommandType.FADE_IN, params: { value: 0.5 } },

                // --- SPAWN MORE ENEMIES PER WAVE ---
                { id: 'se1', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: 'se2', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } },
                { id: 'se3', type: CommandType.SPAWN_ENEMY, params: { text: '🦇' } },

                // --- SPAWN POWER-UPS ---
                { id: 'sp1', type: CommandType.SPAWN_ITEM, params: { text: '⚡' } },
                { id: 'sp2', type: CommandType.SPAWN_ITEM, params: { text: '❤️' } },
                { id: 'sp3', type: CommandType.END_IF, params: {} },

                // --- BOSS SPAWN (every 5 waves) ---
                { id: 'bs1', type: CommandType.IF, params: { condition: 'GREATER', varName: 'wave', value: 4 } },
                { id: 'bs2', type: CommandType.SET_VAR, params: { varName: 'boss_active', value: 1 } },
                { id: 'bs3', type: CommandType.SAY, params: { text: '⚠️ BOSS INCOMING!' } },
                { id: 'bs4', type: CommandType.WAIT, params: { value: 2 } },
                { id: 'bs5', type: CommandType.SPAWN_ENEMY, params: { text: '🐲' } },
                { id: 'bs6', type: CommandType.SET_WEATHER, params: { text: 'storm' } },
                { id: 'bs7', type: CommandType.PLAY_SOUND, params: { text: 'explosion' } },
                { id: 'bs8', type: CommandType.END_IF, params: {} },

                // --- BOSS DEFEATED ---
                { id: 'bd1b', type: CommandType.IF, params: { condition: 'EQUALS', varName: 'boss_active', value: 0 } },
                { id: 'bd2b', type: CommandType.SET_VAR, params: { varName: 'boss_active', value: 0 } },
                { id: 'bd3b', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 100 } },
                { id: 'bd4b', type: CommandType.SAY, params: { text: '🎉 BOSS DEFEATED! +100 SCORE!' } },
                { id: 'bd5b', type: CommandType.PLAY_SOUND, params: { text: 'victory' } },
                { id: 'bd6b', type: CommandType.SPAWN_PARTICLES, params: { value: 20 } },
                { id: 'bd7b', type: CommandType.SET_WEATHER, params: { text: 'none' } },
                { id: 'bd8b', type: CommandType.END_IF, params: {} },

                // --- GAME OVER ---
                { id: 'go1', type: CommandType.IF, params: { condition: 'EQUALS', varName: 'health', value: 0 } },
                { id: 'go2', type: CommandType.SAY, params: { text: '💀 GAME OVER! Final Score: ' } },
                { id: 'go3', type: CommandType.PLAY_SOUND, params: { text: 'death' } },
                { id: 'go4', type: CommandType.GAME_OVER, params: {} },
                { id: 'go5', type: CommandType.END_IF, params: {} },

                { id: 'f2', type: CommandType.END_FOREVER, params: {} }
            ]
        },
        { id: 'tpl_shooter_fps', mode: AppMode.GAME, name: 'First Person Shooter', description: 'Classic FPS with multiple weapons!', icon: Crosshair, color: 'bg-gradient-to-r from-slate-600 to-slate-800', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🔫' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'ammo', value: 30 } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'kills', value: 0 } }, { id: 'c5', type: CommandType.SPAWN_ENEMY, params: { text: '💀' } }, { id: 'c6', type: CommandType.FOREVER, params: {} }, { id: 'c7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c8', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c9', type: CommandType.END_IF, params: {} }, { id: 'c10', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c11', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c12', type: CommandType.END_IF, params: {} }, { id: 'c13', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c14', type: CommandType.SHOOT, params: { text: '🔥' } }, { id: 'c15', type: CommandType.CHANGE_VAR, params: { varName: 'ammo', value: -1 } }, { id: 'c16', type: CommandType.PLAY_SOUND, params: { text: 'laser' } }, { id: 'c17', type: CommandType.END_IF, params: {} }, { id: 'c18', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 33 } }, { id: 'c19', type: CommandType.RELOAD, params: {} }, { id: 'c20', type: CommandType.SET_VAR, params: { varName: 'ammo', value: 30 } }, { id: 'c21', type: CommandType.END_IF, params: {} }, { id: 'c22', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_tps', mode: AppMode.GAME, name: 'Third Person Shooter', description: 'Cover-based third person combat!', icon: Crosshair, color: 'bg-gradient-to-r from-blue-600 to-indigo-700', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🎖️' } }, { id: 'c3', type: CommandType.SET_CAMERA, params: { condition: 'true' } }, { id: 'c4', type: CommandType.SPAWN_ENEMY, params: { text: '💀' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c7', type: CommandType.MOVE_X, params: { value: -5 } }, { id: 'c8', type: CommandType.END_IF, params: {} }, { id: 'c9', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c10', type: CommandType.MOVE_X, params: { value: 5 } }, { id: 'c11', type: CommandType.END_IF, params: {} }, { id: 'c12', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c13', type: CommandType.SHOOT, params: { text: '🔥' } }, { id: 'c14', type: CommandType.END_IF, params: {} }, { id: 'c15', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 33 } }, { id: 'c16', type: CommandType.TAKE_COVER, params: {} }, { id: 'c17', type: CommandType.END_IF, params: {} }, { id: 'c18', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_topdown', mode: AppMode.GAME, name: 'Top Down Shooter', description: 'Isometric twin-stick carnage!', icon: Crosshair, color: 'bg-gradient-to-r from-green-600 to-emerald-700', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'metal_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🕵️' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'score', value: 0 } }, { id: 'c4', type: CommandType.SPAWN_ENEMY, params: { text: '👾' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } }, { id: 'c7', type: CommandType.MOVE_X, params: { value: -6 } }, { id: 'c8', type: CommandType.END_IF, params: {} }, { id: 'c9', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } }, { id: 'c10', type: CommandType.MOVE_X, params: { value: 6 } }, { id: 'c11', type: CommandType.END_IF, params: {} }, { id: 'c12', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 38 } }, { id: 'c13', type: CommandType.MOVE_Y, params: { value: -6 } }, { id: 'c14', type: CommandType.END_IF, params: {} }, { id: 'c15', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 40 } }, { id: 'c16', type: CommandType.MOVE_Y, params: { value: 6 } }, { id: 'c17', type: CommandType.END_IF, params: {} }, { id: 'c18', type: CommandType.SHOOT, params: { text: '🔥' } }, { id: 'c19', type: CommandType.CHANGE_VAR, params: { varName: 'score', value: 1 } }, { id: 'c20', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_military', mode: AppMode.GAME, name: 'Military Shooter', description: 'Tactical military operations with squad!', icon: Crosshair, color: 'bg-gradient-to-r from-green-700 to-green-900', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🎖️' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'ammo', value: 60 } }, { id: 'c4', type: CommandType.SPAWN_TEAMMATE, params: { text: '🎖️' } }, { id: 'c5', type: CommandType.SPAWN_OPPONENT, params: { text: '💀' } }, { id: 'c6', type: CommandType.FOREVER, params: {} }, { id: 'c7', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c8', type: CommandType.SHOOT, params: { text: '🔫' } }, { id: 'c9', type: CommandType.CHANGE_VAR, params: { varName: 'ammo', value: -1 } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 34 } }, { id: 'c12', type: CommandType.THROW_GRENADE, params: { value: 20 } }, { id: 'c13', type: CommandType.SHAKE_SCREEN, params: { value: 1 } }, { id: 'c14', type: CommandType.END_IF, params: {} }, { id: 'c15', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_scifi', mode: AppMode.GAME, name: 'Sci-Fi Shooter', description: 'Laser guns and alien invaders!', icon: Crosshair, color: 'bg-gradient-to-r from-cyan-500 to-blue-600', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'metal_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🧑‍🚀' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'energy', value: 100 } }, { id: 'c4', type: CommandType.SPAWN_ENEMY, params: { text: '👽' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c7', type: CommandType.SHOOT, params: { text: '⚡' } }, { id: 'c8', type: CommandType.CHANGE_VAR, params: { varName: 'energy', value: -5 } }, { id: 'c9', type: CommandType.PLAY_SOUND, params: { text: 'laser' } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_zombie', mode: AppMode.GAME, name: 'Zombie Shooter', description: 'Survive the zombie apocalypse!', icon: Crosshair, color: 'bg-gradient-to-r from-green-700 to-green-900', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🔫' } }, { id: 'c3', type: CommandType.SET_WEATHER, params: { text: 'rain' } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'ammo', value: 50 } }, { id: 'c5', type: CommandType.SPAWN_ENEMY, params: { text: '🧟' } }, { id: 'c6', type: CommandType.SPAWN_ENEMY, params: { text: '🧟' } }, { id: 'c7', type: CommandType.FOREVER, params: {} }, { id: 'c8', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c9', type: CommandType.SHOOT, params: { text: '🔥' } }, { id: 'c10', type: CommandType.CHANGE_VAR, params: { varName: 'ammo', value: -1 } }, { id: 'c11', type: CommandType.PLAY_SOUND, params: { text: 'laser' } }, { id: 'c12', type: CommandType.END_IF, params: {} }, { id: 'c13', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_battle_royale', mode: AppMode.GAME, name: 'Battle Royale', description: 'Last one standing wins!', icon: Crosshair, color: 'bg-gradient-to-r from-orange-500 to-red-600', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'grass' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🪖' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'alive', value: 50 } }, { id: 'c4', type: CommandType.SPAWN_ENEMY, params: { text: '💀' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c7', type: CommandType.SHOOT, params: { text: '🔥' } }, { id: 'c8', type: CommandType.CHANGE_VAR, params: { varName: 'alive', value: -1 } }, { id: 'c9', type: CommandType.PLAY_SOUND, params: { text: 'laser' } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 34 } }, { id: 'c12', type: CommandType.THROW_GRENADE, params: { value: 15 } }, { id: 'c13', type: CommandType.END_IF, params: {} }, { id: 'c14', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_arena', mode: AppMode.GAME, name: 'Arena Shooter', description: 'Fast-paced arena combat!', icon: Crosshair, color: 'bg-gradient-to-r from-red-500 to-pink-600', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'metal_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🤖' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'kills', value: 0 } }, { id: 'c4', type: CommandType.SPAWN_ENEMY, params: { text: '💀' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c7', type: CommandType.SHOOT, params: { text: '🔥' } }, { id: 'c8', type: CommandType.CHANGE_VAR, params: { varName: 'kills', value: 1 } }, { id: 'c9', type: CommandType.PLAY_SOUND, params: { text: 'laser' } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 34 } }, { id: 'c12', type: CommandType.DODGE_ROLL, params: { value: 10 } }, { id: 'c13', type: CommandType.END_IF, params: {} }, { id: 'c14', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_extraction', mode: AppMode.GAME, name: 'Extraction Shooter', description: 'Loot, fight, and extract with your bounty!', icon: Crosshair, color: 'bg-gradient-to-r from-amber-600 to-orange-700', commands: [
            { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'stone_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🎒' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'loot', value: 0 } }, { id: 'c4', type: CommandType.SET_VAR, params: { varName: 'extracted', value: 0 } }, { id: 'c5', type: CommandType.SPAWN_ITEM, params: { text: '💰' } }, { id: 'c6', type: CommandType.SPAWN_ENEMY, params: { text: '💀' } }, { id: 'c7', type: CommandType.FOREVER, params: {} }, { id: 'c8', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c9', type: CommandType.SHOOT, params: { text: '🔫' } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 33 } }, { id: 'c12', type: CommandType.USE_ITEM, params: { text: 'medkit' } }, { id: 'c13', type: CommandType.END_IF, params: {} }, { id: 'c14', type: CommandType.IF, params: { condition: 'IS_TOUCHING', text: '💰' } }, { id: 'c15', type: CommandType.CHANGE_VAR, params: { varName: 'loot', value: 1 } }, { id: 'c16', type: CommandType.PLAY_SOUND, params: { text: 'coin' } }, { id: 'c17', type: CommandType.END_IF, params: {} }, { id: 'c18', type: CommandType.END_FOREVER, params: {} }
        ]},
        { id: 'tpl_shooter_cyberpunk', mode: AppMode.GAME, name: 'Cyberpunk Shooter', description: 'Neon-lit cyber combat with hacking!', icon: Crosshair, color: 'bg-gradient-to-r from-fuchsia-500 to-cyan-500', commands: [
          { id: 'c1', type: CommandType.SET_SCENE, params: { text: 'metal_floor' } }, { id: 'c2', type: CommandType.SET_EMOJI, params: { text: '🤖' } }, { id: 'c3', type: CommandType.SET_VAR, params: { varName: 'credits', value: 0 } }, { id: 'c4', type: CommandType.SPAWN_ENEMY, params: { text: '🤖' } }, { id: 'c5', type: CommandType.FOREVER, params: {} }, { id: 'c6', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } }, { id: 'c7', type: CommandType.SHOOT, params: { text: '⚡' } }, { id: 'c8', type: CommandType.CHANGE_VAR, params: { varName: 'credits', value: 1 } }, { id: 'c9', type: CommandType.PLAY_SOUND, params: { text: 'laser' } }, { id: 'c10', type: CommandType.END_IF, params: {} }, { id: 'c11', type: CommandType.END_FOREVER, params: {} }
        ]},
];
