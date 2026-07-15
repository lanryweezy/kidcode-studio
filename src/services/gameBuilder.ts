// KidCode Studio — Complete Game Builder
// Builds polished games using all engine systems

import { GameEngine } from './gameEngine';
import { playSoundEffect } from './soundService';

interface GameConfig {
  name: string;
  description: string;
  scene: string;
  playerEmoji: string;
  gravity: boolean;
  weather: string;
  enemies: { emoji: string; behavior: string; count: number }[];
  items: { emoji: string; effect: string; count: number }[];
  waves: number;
  bossWave: number;
  bossEmoji: string;
  victoryScore: number;
  music: string;
}

const GAME_CONFIGS: Record<string, GameConfig> = {
  'dragon-quest': {
    name: 'Dragon Quest',
    description: 'Medieval RPG with dragons, dungeons, and treasure!',
    scene: 'forest',
    playerEmoji: '⚔️',
    gravity: true,
    weather: 'rain',
    enemies: [
      { emoji: '👾', behavior: 'patrol', count: 3 },
      { emoji: '🦇', behavior: 'fly', count: 2 },
      { emoji: '💀', behavior: 'chase', count: 2 },
      { emoji: '👺', behavior: 'patrol', count: 1 },
    ],
    items: [
      { emoji: '🪙', effect: 'score+10', count: 5 },
      { emoji: '❤️', effect: 'health+25', count: 3 },
      { emoji: '⚔️', effect: 'damage+5', count: 1 },
      { emoji: '🛡️', effect: 'health+50', count: 1 },
      { emoji: '⭐', effect: 'score+100', count: 2 },
    ],
    waves: 5,
    bossWave: 5,
    bossEmoji: '🐲',
    victoryScore: 500,
    music: 'adventure',
  },
  'space-warrior': {
    name: 'Space Warrior',
    description: 'Defend the galaxy from alien invaders!',
    scene: 'space',
    playerEmoji: '🚀',
    gravity: false,
    weather: 'none',
    enemies: [
      { emoji: '👾', behavior: 'patrol', count: 4 },
      { emoji: '🛸', behavior: 'chase', count: 2 },
      { emoji: '👽', behavior: 'shoot', count: 2 },
    ],
    items: [
      { emoji: '⚡', effect: 'score+50', count: 3 },
      { emoji: '❤️', effect: 'health+25', count: 3 },
      { emoji: '🛡️', effect: 'health+50', count: 2 },
      { emoji: '⭐', effect: 'score+100', count: 2 },
    ],
    waves: 5,
    bossWave: 5,
    bossEmoji: '🛸',
    victoryScore: 600,
    music: 'battle',
  },
  'ninja-legend': {
    name: 'Ninja Legend',
    description: 'Shadow warrior with deadly precision!',
    scene: 'grid',
    playerEmoji: '🥷',
    gravity: true,
    weather: 'fog',
    enemies: [
      { emoji: '💂', behavior: 'patrol', count: 4 },
      { emoji: '🥷', behavior: 'chase', count: 3 },
      { emoji: '💀', behavior: 'teleport', count: 2 },
    ],
    items: [
      { emoji: '🪙', effect: 'score+10', count: 5 },
      { emoji: '❤️', effect: 'health+25', count: 3 },
      { emoji: '⭐', effect: 'score+100', count: 3 },
      { emoji: '🧪', effect: 'health+30', count: 2 },
    ],
    waves: 5,
    bossWave: 5,
    bossEmoji: '👹',
    victoryScore: 550,
    music: 'battle',
  },
  'cyber-runner': {
    name: 'Cyber Runner',
    description: 'Neon-lit cyberpunk action adventure!',
    scene: 'grid',
    playerEmoji: '🤖',
    gravity: true,
    weather: 'rain',
    enemies: [
      { emoji: '🤖', behavior: 'patrol', count: 3 },
      { emoji: '🦾', behavior: 'chase', count: 2 },
      { emoji: '🦿', behavior: 'shoot', count: 2 },
    ],
    items: [
      { emoji: '💰', effect: 'score+25', count: 5 },
      { emoji: '❤️', effect: 'health+25', count: 3 },
      { emoji: '⚡', effect: 'score+50', count: 3 },
      { emoji: '🔋', effect: 'health+40', count: 2 },
    ],
    waves: 5,
    bossWave: 5,
    bossEmoji: '🦾',
    victoryScore: 600,
    music: 'electronic',
  },
  'pirate-adventure': {
    name: 'Pirate Adventure',
    description: 'Sail the seas and find treasure!',
    scene: 'grid',
    playerEmoji: '🏴‍☠️',
    gravity: true,
    weather: 'storm',
    enemies: [
      { emoji: '🦈', behavior: 'chase', count: 3 },
      { emoji: '🐙', behavior: 'patrol', count: 2 },
      { emoji: '💀', behavior: 'shoot', count: 2 },
    ],
    items: [
      { emoji: '🪙', effect: 'score+10', count: 8 },
      { emoji: '💎', effect: 'score+50', count: 3 },
      { emoji: '❤️', effect: 'health+25', count: 3 },
      { emoji: '🗺️', effect: 'score+100', count: 2 },
    ],
    waves: 5,
    bossWave: 5,
    bossEmoji: '🐙',
    victoryScore: 500,
    music: 'adventure',
  },
  'mech-warrior': {
    name: 'Mech Warrior',
    description: 'Pilot a giant robot in futuristic warfare!',
    scene: 'grid',
    playerEmoji: '🦾',
    gravity: false,
    weather: 'none',
    enemies: [
      { emoji: '🤖', behavior: 'patrol', count: 4 },
      { emoji: '🦾', behavior: 'chase', count: 3 },
      { emoji: '🦿', behavior: 'shoot', count: 2 },
    ],
    items: [
      { emoji: '🔋', effect: 'health+30', count: 4 },
      { emoji: '❤️', effect: 'health+50', count: 3 },
      { emoji: '⚡', effect: 'score+50', count: 3 },
      { emoji: '⭐', effect: 'score+100', count: 2 },
    ],
    waves: 5,
    bossWave: 5,
    bossEmoji: '🤖',
    victoryScore: 650,
    music: 'battle',
  },
};

export class GameBuilder {
  private engine: GameEngine;
  private config: GameConfig;
  private currentWave: number = 0;
  private enemiesSpawned: number = 0;
  private itemsSpawned: number = 0;
  private bossSpawned: boolean = false;

  constructor(engine: GameEngine, gameType: string) {
    this.engine = engine;
    this.config = GAME_CONFIGS[gameType] || GAME_CONFIGS['dragon-quest'];
  }

  build() {
    // Setup game from config
    this.engine.processCommands([
      { type: 'SET_SCENE', params: { text: this.config.scene } },
      { type: 'SET_EMOJI', params: { text: this.config.playerEmoji } },
      { type: 'SET_WEATHER', params: { text: this.config.weather } },
      { type: 'SET_GRAVITY', params: { condition: this.config.gravity ? 'true' : 'false' } },
      { type: 'SET_VAR', params: { varName: 'score', value: 0 } },
      { type: 'SET_VAR', params: { varName: 'health', value: 100 } },
      { type: 'SET_VAR', params: { varName: 'wave', value: 1 } },
      { type: 'SET_VAR', params: { varName: 'combo', value: 0 } },
    ]);

    // Spawn initial enemies
    this.spawnWaveEnemies();

    // Spawn initial items
    this.spawnWaveItems();
  }

  private spawnWaveEnemies() {
    const totalEnemies = this.config.enemies.reduce((sum, e) => sum + e.count, 0);
    const enemiesPerWave = Math.ceil(totalEnemies / this.config.waves);

    for (let i = 0; i < enemiesPerWave && this.enemiesSpawned < totalEnemies; i++) {
      const enemyType = this.config.enemies[i % this.config.enemies.length];
      this.engine.processCommands([
        { type: 'SPAWN_ENEMY', params: { text: enemyType.emoji } },
      ]);
      this.enemiesSpawned++;
    }
  }

  private spawnWaveItems() {
    const totalItems = this.config.items.reduce((sum, i) => sum + i.count, 0);
    const itemsPerWave = Math.ceil(totalItems / this.config.waves);

    for (let i = 0; i < itemsPerWave && this.itemsSpawned < totalItems; i++) {
      const itemType = this.config.items[i % this.config.items.length];
      this.engine.processCommands([
        { type: 'SPAWN_ITEM', params: { text: itemType.emoji } },
      ]);
      this.itemsSpawned++;
    }
  }

  onWaveComplete(wave: number) {
    this.currentWave = wave;

    // Spawn more enemies for next wave
    this.spawnWaveEnemies();

    // Spawn more items
    this.spawnWaveItems();

    // Boss wave
    if (wave === this.config.bossWave && !this.bossSpawned) {
      this.bossSpawned = true;
      this.engine.processCommands([
        { type: 'SPAWN_ENEMY', params: { text: this.config.bossEmoji } },
        { type: 'SET_WEATHER', params: { text: 'storm' } },
        { type: 'SAY', params: { text: `⚠️ ${this.config.bossEmoji} BOSS INCOMING!` } },
        { type: 'PLAY_SOUND', params: { text: 'explosion' } },
      ]);
    }
  }

  onEnemyDefeated() {
    // Check if boss was defeated
    const state = this.engine.getState();
    const hasBoss = state.enemies.some((e: { data?: Record<string, unknown> }) => e.data?.isBoss);
    if (!hasBoss && this.bossSpawned) {
      this.bossSpawned = false;
      this.engine.processCommands([
        { type: 'SET_WEATHER', params: { text: 'none' } },
        { type: 'SAY', params: { text: '🎉 BOSS DEFEATED!' } },
        { type: 'CHANGE_VAR', params: { varName: 'score', value: 100 } },
        { type: 'PLAY_SOUND', params: { text: 'victory' } },
        { type: 'SPAWN_PARTICLES', params: { value: 20 } },
      ]);
    }
  }

  checkVictory(): boolean {
    const state = this.engine.getState();
    return state.score >= this.config.victoryScore;
  }

  getGameInfo() {
    return {
      name: this.config.name,
      description: this.config.description,
      waves: this.config.waves,
      bossWave: this.config.bossWave,
      victoryScore: this.config.victoryScore,
    };
  }
}

export { GAME_CONFIGS };
