import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setSfxVolume,
  getSfxVolume,
  setMusicVolume,
  getMusicVolume,
  toggleMute,
  setMuted,
  getMuted,
  playSoundEffect,
  playTone,
  playSpeakerSound,
  spatialPlaySound,
} from '../soundService';

describe('soundService improvements', () => {
  beforeEach(() => {
    setMuted(false);
    setSfxVolume(0.5);
    setMusicVolume(0.5);
  });

  describe('volume controls', () => {
    it('setSfxVolume clamps to 0-1', () => {
      setSfxVolume(1.5);
      expect(getSfxVolume()).toBe(1);
      setSfxVolume(-0.5);
      expect(getSfxVolume()).toBe(0);
    });

    it('setMusicVolume clamps to 0-1', () => {
      setMusicVolume(2);
      expect(getMusicVolume()).toBe(1);
      setMusicVolume(-1);
      expect(getMusicVolume()).toBe(0);
    });

    it('sets sfx volume', () => {
      setSfxVolume(0.8);
      expect(getSfxVolume()).toBe(0.8);
    });

    it('sets music volume', () => {
      setMusicVolume(0.3);
      expect(getMusicVolume()).toBe(0.3);
    });
  });

  describe('mute controls', () => {
    it('toggleMute toggles mute state', () => {
      expect(getMuted()).toBe(false);
      expect(toggleMute()).toBe(true);
      expect(getMuted()).toBe(true);
      expect(toggleMute()).toBe(false);
    });

    it('setMuted sets mute state', () => {
      setMuted(true);
      expect(getMuted()).toBe(true);
      setMuted(false);
      expect(getMuted()).toBe(false);
    });
  });

  describe('playSoundEffect', () => {
    it('does not throw when muted', () => {
      setMuted(true);
      expect(() => playSoundEffect('jump')).not.toThrow();
    });

    it('handles all sound types without error', () => {
      const types: Array<Parameters<typeof playSoundEffect>[0]> = [
        'move', 'turn', 'ui', 'click', 'coin', 'camera', 'powerup', 'laser',
        'explosion', 'hurt', 'jump', 'dash', 'death', 'victory', 'attack',
        'kick', 'shoot', 'pass', 'whistle', 'swish', 'hit', 'punch', 'splash', 'crack',
      ];
      for (const type of types) {
        expect(() => playSoundEffect(type)).not.toThrow();
      }
    });

    it('applies spatial panning', () => {
      expect(() => playSoundEffect('coin', -1)).not.toThrow();
      expect(() => playSoundEffect('coin', 1)).not.toThrow();
      expect(() => playSoundEffect('coin', 0)).not.toThrow();
    });
  });

  describe('playTone', () => {
    it('does not throw', () => {
      expect(() => playTone(0.1, 0.5)).not.toThrow();
    });

    it('clamps volume', () => {
      expect(() => playTone(0.1, 2)).not.toThrow();
      expect(() => playTone(0.1, -1)).not.toThrow();
    });
  });

  describe('playSpeakerSound', () => {
    it('returns number (duration or 0 on failure)', () => {
      const result = playSpeakerSound('siren');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('returns number for sports types', () => {
      expect(typeof playSpeakerSound('kick')).toBe('number');
      expect(typeof playSpeakerSound('shoot')).toBe('number');
      expect(typeof playSpeakerSound('pass')).toBe('number');
      expect(typeof playSpeakerSound('whistle')).toBe('number');
      expect(typeof playSpeakerSound('swish')).toBe('number');
      expect(typeof playSpeakerSound('hit')).toBe('number');
      expect(typeof playSpeakerSound('punch')).toBe('number');
      expect(typeof playSpeakerSound('splash')).toBe('number');
      expect(typeof playSpeakerSound('crack')).toBe('number');
    });

    it('falls back to default for unknown type', () => {
      const result = playSpeakerSound('unknown_type');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('spatialPlaySound', () => {
    it('calculates pan from entity position', () => {
      expect(() => spatialPlaySound('coin', 0, 800)).not.toThrow();
      expect(() => spatialPlaySound('coin', 400, 800)).not.toThrow();
      expect(() => spatialPlaySound('coin', 800, 800)).not.toThrow();
    });
  });
});
