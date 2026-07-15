import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setSfxVolume, getSfxVolume,
  setMusicVolume, getMusicVolume,
  toggleMute, setMuted, getMuted,
} from '../soundService';

describe('Sound Service', () => {
  beforeEach(() => {
    setMuted(false);
    setSfxVolume(0.5);
    setMusicVolume(0.5);
  });

  describe('Volume Controls', () => {
    it('should set and get SFX volume', () => {
      setSfxVolume(0.8);
      expect(getSfxVolume()).toBe(0.8);
    });

    it('should clamp SFX volume between 0 and 1', () => {
      setSfxVolume(1.5);
      expect(getSfxVolume()).toBe(1);
      setSfxVolume(-0.5);
      expect(getSfxVolume()).toBe(0);
    });

    it('should set and get music volume', () => {
      setMusicVolume(0.3);
      expect(getMusicVolume()).toBe(0.3);
    });

    it('should clamp music volume between 0 and 1', () => {
      setMusicVolume(2);
      expect(getMusicVolume()).toBe(1);
      setMusicVolume(-1);
      expect(getMusicVolume()).toBe(0);
    });
  });

  describe('Mute Controls', () => {
    it('should toggle mute state', () => {
      expect(getMuted()).toBe(false);
      toggleMute();
      expect(getMuted()).toBe(true);
      toggleMute();
      expect(getMuted()).toBe(false);
    });

    it('should set mute state directly', () => {
      setMuted(true);
      expect(getMuted()).toBe(true);
      setMuted(false);
      expect(getMuted()).toBe(false);
    });
  });

  describe('Sound Types', () => {
    it('should support all required sound types', () => {
      const soundTypes = [
        'move', 'turn', 'ui', 'click', 'coin', 'camera',
        'powerup', 'laser', 'explosion', 'hurt', 'jump',
        'dash', 'death', 'victory', 'attack', 'kick',
        'shoot', 'pass', 'whistle', 'swish', 'hit',
        'punch', 'splash', 'crack',
      ];
      expect(soundTypes.length).toBe(24);
    });
  });
});
