import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TempoSync,
  VolumeAutomation,
  CrossfadeManager,
  DuckingEngine,
  getMoodFromGameState,
  MUSIC_PRESETS,
  calculateSpatialVolume3D,
  generateVisualizerBars,
  updateVisualizerBars,
  createDuckingState,
  startDucking,
  updateDucking,
  playSFX,
  SFX_LIBRARY,
} from '../audioEngine';

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

describe('TempoSync', () => {
  let tempoSync: TempoSync;

  beforeEach(() => {
    vi.useFakeTimers();
    tempoSync = new TempoSync();
  });

  afterEach(() => {
    tempoSync.stop();
    vi.useRealTimers();
  });

  it('has default BPM of 120', () => {
    expect(tempoSync.getBPM()).toBe(120);
  });

  it('sets BPM within range', () => {
    tempoSync.setBPM(140);
    expect(tempoSync.getBPM()).toBe(140);
  });

  it('clamps BPM to min', () => {
    tempoSync.setBPM(5);
    expect(tempoSync.getBPM()).toBe(20);
  });

  it('clamps BPM to max', () => {
    tempoSync.setBPM(500);
    expect(tempoSync.getBPM()).toBe(300);
  });

  it('calculates beat interval from BPM', () => {
    tempoSync.setBPM(120);
    expect(tempoSync.getBeatInterval()).toBe(500);
    tempoSync.setBPM(60);
    expect(tempoSync.getBeatInterval()).toBe(1000);
  });

  it('starts and tracks beat', () => {
    tempoSync.setBPM(120);
    tempoSync.start();
    expect(tempoSync.getCurrentBeat()).toBeGreaterThanOrEqual(0);
  });

  it('syncs duration to beat grid', () => {
    tempoSync.setBPM(120);
    const synced = tempoSync.syncToDuration(550);
    expect(synced).toBe(500);
    const synced2 = tempoSync.syncToDuration(400);
    expect(synced2).toBe(500);
  });

  it('registers beat callbacks', () => {
    const cb = vi.fn();
    tempoSync.onBeat(4, cb);
    tempoSync.setBPM(120);
    tempoSync.start();
    vi.advanceTimersByTime(2000);
    tempoSync.stop();
  });
});

describe('VolumeAutomation', () => {
  let automation: VolumeAutomation;

  beforeEach(() => {
    vi.useFakeTimers();
    automation = new VolumeAutomation();
  });

  afterEach(() => {
    automation.stop();
    vi.useRealTimers();
  });

  it('adds keyframes in order', () => {
    automation.addKeyframe(100, 0.5);
    automation.addKeyframe(50, 0.2);
    const kf = (automation as any).keyframes;
    expect(kf[0].time).toBe(50);
    expect(kf[1].time).toBe(100);
  });

  it('clears keyframes', () => {
    automation.addKeyframe(100, 0.5);
    automation.clearKeyframes();
    expect((automation as any).keyframes).toHaveLength(0);
  });

  it('fadeIn creates two keyframes', () => {
    automation.fadeIn(1000);
    expect((automation as any).keyframes).toHaveLength(2);
  });

  it('fadeOut creates two keyframes', () => {
    automation.fadeOut(1000);
    expect((automation as any).keyframes).toHaveLength(2);
  });

  it('plays and updates value', () => {
    automation.fadeIn(1000, 0, 1);
    const onUpdate = vi.fn();
    automation.play(onUpdate);
    vi.advanceTimersByTime(500);
    expect(onUpdate).toHaveBeenCalled();
    automation.stop();
  });
});

describe('CrossfadeManager', () => {
  let crossfade: CrossfadeManager;

  beforeEach(() => {
    vi.useFakeTimers();
    crossfade = new CrossfadeManager();
  });

  afterEach(() => {
    crossfade.stop();
    vi.useRealTimers();
  });

  it('crossfades to new track', () => {
    crossfade.crossfadeTo('track1.mp3', 1000);
    vi.advanceTimersByTime(1100);
  });

  it('sets master volume', () => {
    crossfade.setMasterVolume(0.8);
    expect((crossfade as any).masterVolume).toBe(0.8);
  });

  it('clamps master volume', () => {
    crossfade.setMasterVolume(1.5);
    expect((crossfade as any).masterVolume).toBe(1);
    crossfade.setMasterVolume(-0.5);
    expect((crossfade as any).masterVolume).toBe(0);
  });

  it('stop cleans up', () => {
    crossfade.crossfadeTo('track1.mp3');
    crossfade.stop();
    expect((crossfade as any).audioA).toBeNull();
    expect((crossfade as any).audioB).toBeNull();
  });
});

describe('DuckingEngine', () => {
  it('starts ducking', () => {
    const ducking = new DuckingEngine();
    ducking.startDucking(0.3, 500);
    expect(ducking.getDuckedVolume(1)).toBe(0.7);
  });

  it('returns original volume when not ducking', () => {
    const ducking = new DuckingEngine();
    expect(ducking.getDuckedVolume(0.8)).toBe(0.8);
  });
});

describe('getMoodFromGameState', () => {
  it('returns calm when no enemies and high health', () => {
    const mood = getMoodFromGameState(100, 100, 0, false, 0);
    expect(mood.theme).toBe('exploration');
    expect(mood.intensity).toBeLessThanOrEqual(0.2);
  });

  it('returns combat when enemies nearby', () => {
    const mood = getMoodFromGameState(100, 100, 3, false, 0);
    expect(mood.theme).toBe('combat');
  });

  it('returns boss when boss active', () => {
    const mood = getMoodFromGameState(100, 100, 5, true, 0);
    expect(mood.theme).toBe('boss');
    expect(mood.intensity).toBe(1.0);
  });

  it('returns combat when low health', () => {
    const mood = getMoodFromGameState(20, 100, 0, false, 0);
    expect(mood.theme).toBe('combat');
    expect(mood.intensity).toBeGreaterThan(0);
  });

  it('returns exploration when high score but no enemies and full health', () => {
    const mood = getMoodFromGameState(100, 100, 0, false, 1500);
    expect(mood.theme).toBe('exploration');
    expect(mood.intensity).toBeGreaterThan(0);
  });

  it('returns victory when high score and enemies present', () => {
    const mood = getMoodFromGameState(100, 100, 2, false, 1500);
    expect(mood.theme).toBe('victory');
  });

  it('clamps intensity to 1', () => {
    const mood = getMoodFromGameState(10, 100, 10, true, 2000);
    expect(mood.intensity).toBeLessThanOrEqual(1);
  });
});

describe('MUSIC_PRESETS', () => {
  it('has all theme presets', () => {
    expect(MUSIC_PRESETS).toHaveProperty('calm');
    expect(MUSIC_PRESETS).toHaveProperty('exploration');
    expect(MUSIC_PRESETS).toHaveProperty('combat');
    expect(MUSIC_PRESETS).toHaveProperty('boss');
    expect(MUSIC_PRESETS).toHaveProperty('victory');
    expect(MUSIC_PRESETS).toHaveProperty('defeat');
  });

  it('each preset has name, bpm, key', () => {
    for (const [, preset] of Object.entries(MUSIC_PRESETS)) {
      expect(typeof preset.name).toBe('string');
      expect(typeof preset.bpm).toBe('number');
      expect(typeof preset.key).toBe('string');
    }
  });
});

describe('calculateSpatialVolume3D', () => {
  it('returns full volume at same position', () => {
    const result = calculateSpatialVolume3D(
      { x: 100, y: 100, z: 0 },
      { x: 100, y: 100, z: 0 }
    );
    expect(result.volume).toBe(1);
    expect(result.pan).toBe(0);
    expect(result.elevation).toBe(0);
  });

  it('reduces volume with distance', () => {
    const result = calculateSpatialVolume3D(
      { x: 500, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 }
    );
    expect(result.volume).toBeLessThan(1);
    expect(result.volume).toBeGreaterThan(0);
  });

  it('pans left for sounds on left', () => {
    const result = calculateSpatialVolume3D(
      { x: -400, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 }
    );
    expect(result.pan).toBeLessThan(0);
  });

  it('pans right for sounds on right', () => {
    const result = calculateSpatialVolume3D(
      { x: 400, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 }
    );
    expect(result.pan).toBeGreaterThan(0);
  });

  it('elevation reflects z-axis', () => {
    const result = calculateSpatialVolume3D(
      { x: 0, y: 0, z: 500 },
      { x: 0, y: 0, z: 0 }
    );
    expect(result.elevation).toBeGreaterThan(0);
  });

  it('clamps pan to [-1, 1]', () => {
    const result = calculateSpatialVolume3D(
      { x: 2000, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 }
    );
    expect(result.pan).toBe(1);
  });
});

describe('Audio Visualizer', () => {
  it('generates correct number of bars', () => {
    const bars = generateVisualizerBars(16);
    expect(bars).toHaveLength(16);
  });

  it('each bar has frequency, amplitude, color', () => {
    const bars = generateVisualizerBars(8);
    for (const bar of bars) {
      expect(typeof bar.frequency).toBe('number');
      expect(typeof bar.amplitude).toBe('number');
      expect(typeof bar.color).toBe('string');
    }
  });

  it('updates bars with new amplitudes', () => {
    const bars = generateVisualizerBars(8);
    const updated = updateVisualizerBars(bars);
    expect(updated).toHaveLength(8);
    for (const bar of updated) {
      expect(bar.amplitude).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('Audio Ducking State', () => {
  it('creates default ducking state', () => {
    const state = createDuckingState();
    expect(state.isDucking).toBe(false);
    expect(state.duckAmount).toBe(0.3);
  });

  it('starts ducking', () => {
    const state = createDuckingState();
    const ducked = startDucking(state, 500, 0.5);
    expect(ducked.isDucking).toBe(true);
    expect(ducked.duckAmount).toBe(0.5);
  });

  it('updates ducking duration', () => {
    const state = createDuckingState();
    const ducked = startDucking(state, 3, 0.3);
    const updated = updateDucking(ducked);
    expect(updated.duckDuration).toBe(2);
  });

  it('stops ducking when duration reaches 0', () => {
    const state = createDuckingState();
    const ducked = startDucking(state, 1, 0.3);
    const updated = updateDucking(ducked);
    expect(updated.isDucking).toBe(false);
  });

  it('returns same state when not ducking', () => {
    const state = createDuckingState();
    const updated = updateDucking(state);
    expect(updated).toEqual(state);
  });
});

describe('SFX Library', () => {
  it('has SFX definitions', () => {
    expect(SFX_LIBRARY.length).toBeGreaterThan(0);
  });

  it('each SFX has required fields', () => {
    for (const sfx of SFX_LIBRARY) {
      expect(typeof sfx.id).toBe('string');
      expect(typeof sfx.name).toBe('string');
      expect(typeof sfx.frequency).toBe('number');
      expect(typeof sfx.duration).toBe('number');
    }
  });

  it('playSFX does not throw', () => {
    expect(() => playSFX('sword_slash')).not.toThrow();
  });

  it('playSFX handles unknown ID gracefully', () => {
    expect(() => playSFX('nonexistent')).not.toThrow();
  });
});
