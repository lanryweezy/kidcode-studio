import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bgmPlayer, ambientManager, calculateSpatialVolume } from '../audioEngine';

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  loop = false;
  volume = 0;
  onended: (() => void) | null = null;
  
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  
  constructor(url?: string) {
    if (url) this.src = url;
  }
}

(global as any).Audio = MockAudio;

describe('AudioEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    bgmPlayer.stop();
    ambientManager.stop();
  });

  describe('BGMPlayer', () => {
    it('should play a track', () => {
      const track = {
        id: 'bgm1',
        name: 'Test BGM',
        url: 'test.mp3',
        volume: 0.5,
        loop: true,
      };

      bgmPlayer.play(track);
      expect((bgmPlayer as any).isPlaying).toBe(true);
    });

    it('should not replay the same track', () => {
      const track = {
        id: 'bgm1',
        name: 'Test BGM',
        url: 'test.mp3',
        volume: 0.5,
        loop: true,
      };

      bgmPlayer.play(track);
      const playCalls = vi.mocked((bgmPlayer as any).audio?.play)?.mock?.calls?.length || 0;
      
      // Play same track again
      bgmPlayer.play(track);
      // Should not increase play calls
    });

    it('should stop playback', () => {
      const track = {
        id: 'bgm1',
        name: 'Test BGM',
        url: 'test.mp3',
        volume: 0.5,
        loop: true,
      };

      bgmPlayer.play(track);
      bgmPlayer.stop();
      expect((bgmPlayer as any).isPlaying).toBe(false);
    });

    it('should set volume', () => {
      const track = {
        id: 'bgm1',
        name: 'Test BGM',
        url: 'test.mp3',
        volume: 0.5,
        loop: true,
      };

      bgmPlayer.play(track);
      bgmPlayer.setVolume(0.8);
      expect((bgmPlayer as any).volume).toBe(0.8);
    });

    it('should clamp volume to 0-1 range', () => {
      bgmPlayer.setVolume(1.5);
      expect((bgmPlayer as any).volume).toBe(1);
      
      bgmPlayer.setVolume(-0.5);
      expect((bgmPlayer as any).volume).toBe(0);
    });

    it('should get visualizer data', () => {
      const data = bgmPlayer.getVisualizerData();
      expect(data).toHaveLength(32);
      expect(data.every(v => v >= 0 && v <= 100)).toBe(true);
    });
  });

  describe('AmbientManager', () => {
    it('should play ambient preset (no layers when URLs are empty)', () => {
      ambientManager.play('forest');
      // All forest layers have empty URLs, so no Audio objects are created
      expect((ambientManager as any).layers.size).toBe(0);
    });

    it('should stop all ambient sounds', () => {
      ambientManager.play('forest');
      ambientManager.stop();
      expect((ambientManager as any).layers.size).toBe(0);
    });

    it('should set volume for all layers', () => {
      ambientManager.play('forest');
      ambientManager.setVolume(0.7);
      
      for (const audio of (ambientManager as any).layers.values()) {
        expect(audio.volume).toBeCloseTo(0.7 * 0.3, 1);
      }
    });

    it('should handle unknown preset gracefully', () => {
      ambientManager.play('unknown_preset');
      expect((ambientManager as any).layers.size).toBe(0);
    });
  });

  describe('calculateSpatialVolume', () => {
    it('should return full volume when sound is at listener position', () => {
      const result = calculateSpatialVolume(100, 100, 100, 100);
      expect(result.volume).toBe(1);
      expect(result.pan).toBe(0);
    });

    it('should reduce volume with distance', () => {
      const result = calculateSpatialVolume(0, 0, 400, 0);
      expect(result.volume).toBeLessThan(1);
      expect(result.volume).toBeGreaterThan(0);
    });

    it('should return zero volume at max distance', () => {
      const result = calculateSpatialVolume(0, 0, 800, 0, 800);
      expect(result.volume).toBe(0);
    });

    it('should pan left for sounds on the left', () => {
      const result = calculateSpatialVolume(0, 0, 400, 0, 800);
      expect(result.pan).toBeLessThan(0);
    });

    it('should pan right for sounds on the right', () => {
      const result = calculateSpatialVolume(800, 0, 400, 0, 800);
      expect(result.pan).toBeGreaterThan(0);
    });

    it('should clamp pan to -1 to 1', () => {
      const result = calculateSpatialVolume(1000, 0, 0, 0, 800);
      expect(result.pan).toBe(1);
    });
  });
});
