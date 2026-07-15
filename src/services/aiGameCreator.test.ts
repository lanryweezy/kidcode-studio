import { describe, it, expect } from 'vitest';
import {
  parseDescription,
  generateGameBlocks,
  generateGameTiles,
  generateGameSettings,
  suggestTemplate,
  generateAIAsset,
  createGame,
  balanceDifficulty,
  getBlockCode,
  exportGameAsCode,
  type GeneratedGame,
} from './aiGameCreator';

describe('AI Game Creator', () => {
  describe('parseDescription', () => {
    it('detects platformer genre from keywords', () => {
      const result = parseDescription('A platformer with jumping and running');
      expect(result.detectedGenre).toBe('platformer');
      expect(result.keywords).toContain('jumping');
      expect(result.keywords).toContain('running');
    });

    it('detects shooter genre', () => {
      const result = parseDescription('Shoot enemies with a gun');
      expect(result.detectedGenre).toBe('shooter');
      expect(result.keywords).toContain('shoot');
    });

    it('detects puzzle genre', () => {
      const result = parseDescription('Match tiles to solve puzzles');
      expect(result.detectedGenre).toBe('puzzle');
    });

    it('detects RPG genre', () => {
      const result = parseDescription('Quest with sword and spells');
      expect(result.detectedGenre).toBe('rpg');
    });

    it('detects racing genre', () => {
      const result = parseDescription('Race cars at high speed');
      expect(result.detectedGenre).toBe('racing');
    });

    it('detects rhythm genre', () => {
      const result = parseDescription('Dance to the music beats');
      expect(result.detectedGenre).toBe('rhythm');
    });

    it('detects strategy genre', () => {
      const result = parseDescription('Build an empire and plan resources');
      expect(result.detectedGenre).toBe('strategy');
    });

    it('returns default keywords for empty description', () => {
      const result = parseDescription('');
      expect(result.detectedGenre).toBe('platformer');
      expect(result.keywords).toContain('default');
    });

    it('detects suggested blocks from keywords', () => {
      const result = parseDescription('Jump over enemies and collect coins');
      expect(result.suggestedBlocks).toContain('enemy_spawner');
      expect(result.suggestedBlocks).toContain('coin_spawn');
    });
  });

  describe('generateGameBlocks', () => {
    it('creates movement and physics blocks', () => {
      const blocks = generateGameBlocks('A platformer game', 'platformer');
      expect(blocks.length).toBeGreaterThanOrEqual(2);
      expect(blocks.some(b => b.type === 'movement')).toBe(true);
      expect(blocks.some(b => b.type === 'physics')).toBe(true);
    });

    it('adds enemy spawner for enemy keywords', () => {
      const blocks = generateGameBlocks('Fight enemies', 'shooter');
      expect(blocks.some(b => b.type === 'enemy')).toBe(true);
    });

    it('adds shooting block for shooter genre', () => {
      const blocks = generateGameBlocks('Shoot bullets', 'shooter');
      expect(blocks.some(b => b.type === 'shooting')).toBe(true);
    });

    it('adds timer block for timer keywords', () => {
      const blocks = generateGameBlocks('Timer countdown', 'puzzle');
      expect(blocks.some(b => b.type === 'timer')).toBe(true);
    });

    it('adds boss block for boss keywords', () => {
      const blocks = generateGameBlocks('Boss fight', 'rpg');
      expect(blocks.some(b => b.type === 'boss')).toBe(true);
    });

    it('adds music block for music keywords', () => {
      const blocks = generateGameBlocks('Music rhythm game', 'rhythm');
      expect(blocks.some(b => b.type === 'audio')).toBe(true);
    });
  });

  describe('generateGameTiles', () => {
    it('creates ground tiles', () => {
      const tiles = generateGameTiles('platformer', 10, 5);
      expect(tiles.length).toBeGreaterThan(0);
      expect(tiles.some(t => t.type === 'brick')).toBe(true);
    });

    it('creates spawn and flag tiles', () => {
      const tiles = generateGameTiles('platformer', 10, 5);
      expect(tiles.some(t => t.type === 'spawn')).toBe(true);
      expect(tiles.some(t => t.type === 'flag')).toBe(true);
    });

    it('creates coin tiles', () => {
      const tiles = generateGameTiles('platformer', 10, 5);
      expect(tiles.some(t => t.type === 'coin')).toBe(true);
    });

    it('creates platform tiles for platformer genre', () => {
      const tiles = generateGameTiles('platformer', 20, 12);
      expect(tiles.some(t => t.type === 'platform_wood')).toBe(true);
    });
  });

  describe('generateGameSettings', () => {
    it('applies genre defaults', () => {
      const settings = generateGameSettings('platformer', 'beginner');
      expect(settings.gravity).toBe(0.5);
      expect(settings.playerSpeed).toBe(4);
    });

    it('applies skill level modifiers', () => {
      const beginner = generateGameSettings('shooter', 'beginner');
      const advanced = generateGameSettings('shooter', 'advanced');
      expect(beginner.enemySpeed).toBeLessThan(advanced.enemySpeed);
      expect(beginner.scoreMultiplier).toBeGreaterThan(advanced.scoreMultiplier);
    });

    it('sets lives based on skill level', () => {
      const beginner = generateGameSettings('platformer', 'beginner');
      const advanced = generateGameSettings('platformer', 'advanced');
      expect(beginner.lives).toBe(5);
      expect(advanced.lives).toBe(1);
    });
  });

  describe('suggestTemplate', () => {
    it('returns platformer for jump keywords', () => {
      expect(suggestTemplate('Jump and run')).toBe('platformer');
    });

    it('returns shooter for shoot keywords', () => {
      expect(suggestTemplate('Shoot enemies')).toBe('shooter');
    });
  });

  describe('generateAIAsset', () => {
    it('generates sprite asset with emoji', () => {
      const asset = generateAIAsset({ type: 'sprite', description: 'hero' });
      expect(asset.type).toBe('sprite');
      expect(asset.format).toBe('emoji');
      expect(asset.data).toBeTruthy();
    });

    it('generates sound asset', () => {
      const asset = generateAIAsset({ type: 'sound', description: 'explosion' });
      expect(asset.type).toBe('sound');
      expect(asset.format).toBe('wav');
    });

    it('generates music asset', () => {
      const asset = generateAIAsset({ type: 'music', description: 'battle theme' });
      expect(asset.type).toBe('music');
      expect(asset.format).toBe('mp3');
    });

    it('generates tile asset', () => {
      const asset = generateAIAsset({ type: 'tile', description: 'grass' });
      expect(asset.type).toBe('tile');
      expect(asset.format).toBe('tileset');
    });
  });

  describe('createGame', () => {
    it('creates a complete game object', () => {
      const game = createGame('A platformer with enemies and coins', 'beginner');
      expect(game.id).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.genre).toBe('platformer');
      expect(game.skillLevel).toBe('beginner');
      expect(game.blocks.length).toBeGreaterThan(0);
      expect(game.tiles.length).toBeGreaterThan(0);
      expect(game.settings).toBeTruthy();
      expect(game.metadata).toBeTruthy();
    });

    it('uses genre override when provided', () => {
      const game = createGame('Some description', 'intermediate', 'puzzle');
      expect(game.genre).toBe('puzzle');
    });

    it('generates title from description', () => {
      const game = createGame('Super Jump Adventure', 'beginner');
      expect(game.title).toBe('Super Jump Adventure');
    });

    it('sets metadata correctly', () => {
      const game = createGame('Test game', 'advanced');
      expect(game.metadata.difficulty).toBe(3);
      expect(game.metadata.tags.length).toBeGreaterThan(0);
      expect(game.metadata.createdAt).toBeGreaterThan(0);
    });
  });

  describe('balanceDifficulty', () => {
    it('increases difficulty for high win rate', () => {
      const game = createGame('Test', 'beginner');
      const balanced = balanceDifficulty(game, { winRate: 0.9, avgTime: 60 });
      expect(balanced.enemySpeed).toBeGreaterThan(game.settings.enemySpeed);
    });

    it('decreases difficulty for low win rate', () => {
      const game = createGame('Test', 'advanced');
      const balanced = balanceDifficulty(game, { winRate: 0.2, avgTime: 60 });
      expect(balanced.enemySpeed).toBeLessThan(game.settings.enemySpeed);
    });

    it('keeps settings similar for average win rate', () => {
      const game = createGame('Test', 'beginner');
      const balanced = balanceDifficulty(game, { winRate: 0.5, avgTime: 60 });
      expect(balanced.enemySpeed).toBe(game.settings.enemySpeed);
    });
  });

  describe('getBlockCode', () => {
    it('returns code for existing block type', () => {
      const blocks = generateGameBlocks('Platformer', 'platformer');
      const code = getBlockCode(blocks, 'movement');
      expect(code).toBeTruthy();
      expect(code).toContain('onKeyDown');
    });

    it('returns empty string for non-existent block type', () => {
      const blocks = generateGameBlocks('Platformer', 'platformer');
      const code = getBlockCode(blocks, 'nonexistent');
      expect(code).toBe('');
    });
  });

  describe('exportGameAsCode', () => {
    it('exports game as valid JavaScript string', () => {
      const game = createGame('Platformer with enemies', 'beginner');
      const code = exportGameAsCode(game);
      expect(code).toContain('// ' + game.title);
      expect(code).toContain('const settings');
      expect(code.length).toBeGreaterThan(50);
    });

    it('includes all block code', () => {
      const game = createGame('Shooter game', 'beginner');
      const code = exportGameAsCode(game);
      game.blocks.forEach(block => {
        expect(code).toContain(block.code);
      });
    });
  });
});
