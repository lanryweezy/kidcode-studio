import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  deployGame, generateDeploymentConfig, packageAssets,
  type DeploymentConfig, type AssetEntry, type DeploymentResult
} from './gameDeployment';
import { CommandBlock, AppMode, CommandType } from '../types';

const mockCommands: CommandBlock[] = [
  { id: '1', type: CommandType.SET_SCENE, params: { text: 'grid' } },
  { id: '2', type: CommandType.SET_EMOJI, params: { text: '🎮' } },
  { id: '3', type: CommandType.SET_VAR, params: { varName: 'score', value: 0 } },
  { id: '4', type: CommandType.FOREVER, params: {} },
  { id: '5', type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 32 } },
  { id: '6', type: CommandType.CHANGE_SCORE, params: { value: 1 } },
  { id: '7', type: CommandType.PLAY_SOUND, params: { text: 'coin' } },
  { id: '8', type: CommandType.END_IF, params: {} },
  { id: '9', type: CommandType.END_FOREVER, params: {} },
];

describe('Game Deployment Pipeline', () => {
  describe('deployGame', () => {
    it('should export game as HTML5 file', async () => {
      const config = generateDeploymentConfig('Test Game', 'html5');
      const result = await deployGame(mockCommands, config);

      expect(result.success).toBe(true);
      expect(result.blob).toBeDefined();
      expect(result.files).toContain('index.html');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should export game as React component', async () => {
      const config = generateDeploymentConfig('Test Game', 'react');
      const result = await deployGame(mockCommands, config);

      expect(result.success).toBe(true);
      expect(result.blob).toBeDefined();
      expect(result.files.some(f => f.endsWith('Game.tsx'))).toBe(true);
      expect(result.files).toContain('manifest.json');
    });

    it('should export game as React Native project', async () => {
      const config = generateDeploymentConfig('Test Game', 'react-native');
      const result = await deployGame(mockCommands, config);

      expect(result.success).toBe(true);
      expect(result.blob).toBeDefined();
      expect(result.files.some(f => f.endsWith('Screen.tsx'))).toBe(true);
    });

    it('should export game as ZIP package', async () => {
      const config = generateDeploymentConfig('Test Game', 'zip');
      const result = await deployGame(mockCommands, config);

      expect(result.success).toBe(true);
      expect(result.blob).toBeDefined();
      expect(result.files).toContain('index.html');
      expect(result.files).toContain('manifest.json');
    });

    it('should include assets when configured', async () => {
      const config = generateDeploymentConfig('Test Game', 'zip');
      config.includeAssets = true;

      const assets: AssetEntry[] = [
        { name: 'sprite.png', type: 'sprite', path: 'sprite.png', data: 'base64data' },
        { name: 'sound.mp3', type: 'sound', path: 'sound.mp3', data: 'base64data' },
      ];

      const result = await deployGame(mockCommands, config, assets);

      expect(result.success).toBe(true);
      expect(result.files).toContain('assets/sprite.png');
      expect(result.files).toContain('assets/sound.mp3');
    });

    it('should include source code when configured', async () => {
      const config = generateDeploymentConfig('Test Game', 'zip');
      config.includeSource = true;

      const result = await deployGame(mockCommands, config);

      expect(result.success).toBe(true);
      expect(result.files).toContain('source/game.js');
      expect(result.files).toContain('source/game.py');
    });

    it('should handle unsupported deployment target', async () => {
      const config = generateDeploymentConfig('Test Game', 'unsupported' as any);
      const result = await deployGame(mockCommands, config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported deployment target');
    });
  });

  describe('generateDeploymentConfig', () => {
    it('should create default config with correct values', () => {
      const config = generateDeploymentConfig('My Game');

      expect(config.projectName).toBe('My Game');
      expect(config.target).toBe('html5');
      expect(config.author).toBe('KidCode Creator');
      expect(config.version).toBe('1.0.0');
      expect(config.includeSource).toBe(false);
      expect(config.includeAssets).toBe(true);
    });

    it('should create config with custom target', () => {
      const config = generateDeploymentConfig('My Game', 'react');

      expect(config.target).toBe('react');
    });
  });

  describe('packageAssets', () => {
    it('should package assets into a blob', async () => {
      const assets: AssetEntry[] = [
        { name: 'test.txt', type: 'other', path: 'test.txt', data: 'hello' },
      ];

      const blob = await packageAssets(assets);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});
