/**
 * Audio Engine - Improvements #86-92
 * BGM player, ambient sounds, spatial audio, audio visualization,
 * sample-based SFX, distance-based volume
 */

// ─── Background Music Player (#87) ───

export interface BGMTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
}

class BGMPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: BGMTrack | null = null;
  private volume: number = 0.5;
  private isPlaying: boolean = false;
  private crossfadeDuration: number = 1000;
  private onEnded: (() => void) | null = null;

  play(track: BGMTrack, fade: boolean = true) {
    if (this.currentTrack?.id === track.id) return;

    if (this.audio && fade) {
      this.crossfadeOut(() => {
        this.startNewTrack(track);
      });
    } else {
      this.startNewTrack(track);
    }
  }

  private startNewTrack(track: BGMTrack) {
    this.stop();
    this.audio = new Audio(track.url);
    this.audio.loop = track.loop;
    this.audio.volume = 0;
    this.currentTrack = track;

    this.audio.onended = () => {
      if (!track.loop) this.onEnded?.();
    };

    this.audio.play().catch(() => { /* autoplay blocked — user interaction required */ });
    this.crossfadeIn();
    this.isPlaying = true;
  }

  private crossfadeIn() {
    if (!this.audio) return;
    const target = this.volume;
    let current = 0;
    const step = target / (this.crossfadeDuration / 16);
    const interval = setInterval(() => {
      current = Math.min(target, current + step);
      if (this.audio) this.audio.volume = current;
      if (current >= target) clearInterval(interval);
    }, 16);
  }

  private crossfadeOut(onComplete: () => void) {
    if (!this.audio) { onComplete(); return; }
    let current = this.audio.volume;
    const step = current / (this.crossfadeDuration / 16);
    const interval = setInterval(() => {
      current = Math.max(0, current - step);
      if (this.audio) this.audio.volume = current;
      if (current <= 0) {
        clearInterval(interval);
        this.stop();
        onComplete();
      }
    }, 16);
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.isPlaying = false;
    this.currentTrack = null;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) this.audio.volume = this.volume;
  }

  getVisualizerData(): number[] {
    // Placeholder - would need Web Audio API AnalyserNode
    return Array.from({ length: 32 }, () => Math.random() * 100);
  }
}

export const bgmPlayer = new BGMPlayer();

// ─── Ambient Sound Layer (#88) ───

export interface AmbientLayer {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
}

const AMBIENT_PRESETS: Record<string, AmbientLayer[]> = {
  forest: [
    { id: 'birds', name: 'Birds', url: '', volume: 0.3, loop: true },
    { id: 'wind_trees', name: 'Wind in Trees', url: '', volume: 0.2, loop: true },
    { id: 'crickets', name: 'Crickets', url: '', volume: 0.15, loop: true },
  ],
  cave: [
    { id: 'drips', name: 'Water Drips', url: '', volume: 0.25, loop: true },
    { id: 'rumble', name: 'Deep Rumble', url: '', volume: 0.1, loop: true },
  ],
  volcano: [
    { id: 'lava_flow', name: 'Lava Flow', url: '', volume: 0.3, loop: true },
    { id: 'fire_crackle', name: 'Fire Crackle', url: '', volume: 0.2, loop: true },
  ],
  ocean: [
    { id: 'waves', name: 'Waves', url: '', volume: 0.4, loop: true },
    { id: 'seagulls', name: 'Seagulls', url: '', volume: 0.15, loop: false },
  ],
  space: [
    { id: 'space_hum', name: 'Space Hum', url: '', volume: 0.2, loop: true },
  ],
};

class AmbientManager {
  private layers: Map<string, HTMLAudioElement> = new Map();
  private masterVolume: number = 0.5;

  play(preset: string) {
    this.stop();
    const layers = AMBIENT_PRESETS[preset] || [];
    for (const layer of layers) {
      if (!layer.url) continue;
      const audio = new Audio(layer.url);
      audio.loop = layer.loop;
      audio.volume = layer.volume * this.masterVolume;
      audio.play().catch(() => { /* autoplay blocked */ });
      this.layers.set(layer.id, audio);
    }
  }

  stop() {
    for (const audio of this.layers.values()) {
      audio.pause();
      audio.src = '';
    }
    this.layers.clear();
  }

  setVolume(v: number) {
    this.masterVolume = v;
    for (const audio of this.layers.values()) {
      audio.volume = v * 0.3;
    }
  }
}

export const ambientManager = new AmbientManager();

// ─── Spatial Audio (#91) ───

export function calculateSpatialVolume(
  soundX: number, soundY: number,
  listenerX: number, listenerY: number,
  maxDistance: number = 800,
  referenceVolume: number = 1
): { volume: number; pan: number } {
  const dx = soundX - listenerX;
  const dy = soundY - listenerY;
  const distance = Math.hypot(dx, dy);

  // Inverse distance attenuation
  const volume = Math.max(0, referenceVolume * (1 - distance / maxDistance));

  // Stereo panning (-1 to 1)
  const pan = Math.max(-1, Math.min(1, dx / (maxDistance / 2)));

  return { volume, pan };
}

// ─── Audio Visualization (#92) ───

export interface AudioVisualizerBar {
  frequency: number;
  amplitude: number;
  color: string;
}

export function generateVisualizerBars(count: number = 32): AudioVisualizerBar[] {
  return Array.from({ length: count }, (_, i) => ({
    frequency: (i / count) * 22050,
    amplitude: Math.random() * 100,
    color: `hsl(${(i / count) * 270}, 80%, 60%)`,
  }));
}

export function updateVisualizerBars(bars: AudioVisualizerBar[]): AudioVisualizerBar[] {
  return bars.map(bar => ({
    ...bar,
    amplitude: Math.max(5, bar.amplitude * 0.85 + Math.random() * 30),
  }));
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 9 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Sound Effects Library ───

export interface SFXDefinition {
  id: string;
  name: string;
  type: 'hit' | 'pickup' | 'jump' | 'shoot' | 'explosion' | 'ui' | 'ambient';
  frequency: number;
  duration: number;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

export const SFX_LIBRARY: SFXDefinition[] = [
  { id: 'sword_slash', name: 'Sword Slash', type: 'hit', frequency: 800, duration: 0.1, waveform: 'sawtooth' },
  { id: 'arrow_shoot', name: 'Arrow Shoot', type: 'shoot', frequency: 1200, duration: 0.15, waveform: 'sine' },
  { id: 'coin_pickup', name: 'Coin Pickup', type: 'pickup', frequency: 1500, duration: 0.2, waveform: 'sine' },
  { id: 'health_pickup', name: 'Health Pickup', type: 'pickup', frequency: 800, duration: 0.3, waveform: 'sine' },
  { id: 'powerup', name: 'Power Up', type: 'pickup', frequency: 600, duration: 0.4, waveform: 'sine' },
  { id: 'enemy_hit', name: 'Enemy Hit', type: 'hit', frequency: 400, duration: 0.1, waveform: 'square' },
  { id: 'player_hurt', name: 'Player Hurt', type: 'hit', frequency: 200, duration: 0.2, waveform: 'sawtooth' },
  { id: 'explosion_small', name: 'Small Explosion', type: 'explosion', frequency: 100, duration: 0.3, waveform: 'sawtooth' },
  { id: 'explosion_large', name: 'Large Explosion', type: 'explosion', frequency: 60, duration: 0.5, waveform: 'sawtooth' },
  { id: 'jump', name: 'Jump', type: 'jump', frequency: 400, duration: 0.1, waveform: 'sine' },
  { id: 'double_jump', name: 'Double Jump', type: 'jump', frequency: 600, duration: 0.15, waveform: 'sine' },
  { id: 'land', name: 'Land', type: 'jump', frequency: 200, duration: 0.05, waveform: 'square' },
  { id: 'menu_click', name: 'Menu Click', type: 'ui', frequency: 1000, duration: 0.05, waveform: 'sine' },
  { id: 'menu_hover', name: 'Menu Hover', type: 'ui', frequency: 800, duration: 0.03, waveform: 'sine' },
  { id: 'victory', name: 'Victory', type: 'pickup', frequency: 500, duration: 0.5, waveform: 'sine' },
  { id: 'game_over', name: 'Game Over', type: 'ui', frequency: 300, duration: 0.8, waveform: 'sawtooth' },
];

export function playSFX(sfxId: string, volume: number = 0.3, pan: number = 0): void {
  const sfx = SFX_LIBRARY.find(s => s.id === sfxId);
  if (!sfx) return;

  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = sfx.waveform;
    osc.frequency.setValueAtTime(sfx.frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(sfx.frequency * 0.5, ctx.currentTime + sfx.duration);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + sfx.duration);

    panner.pan.value = Math.max(-1, Math.min(1, pan));

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + sfx.duration);
  } catch (e) {
    // Audio context not available
  }
}

// ─── Audio Ducking ───

export interface AudioDuckingState {
  isDucking: boolean;
  duckAmount: number;
  duckDuration: number;
  originalVolume: number;
}

export function createDuckingState(): AudioDuckingState {
  return {
    isDucking: false,
    duckAmount: 0.3,
    duckDuration: 0,
    originalVolume: 0.5,
  };
}

export function startDucking(state: AudioDuckingState, duration: number, amount: number = 0.3): AudioDuckingState {
  return {
    ...state,
    isDucking: true,
    duckAmount: amount,
    duckDuration: duration,
  };
}

export function updateDucking(state: AudioDuckingState): AudioDuckingState {
  if (!state.isDucking) return state;

  const newDuration = state.duckDuration - 1;
  if (newDuration <= 0) {
    return { ...state, isDucking: false, duckDuration: 0 };
  }

  return { ...state, duckDuration: newDuration };
}

// ─── Dynamic Music System ───

export interface MusicMood {
  intensity: number; // 0-1
  theme: 'calm' | 'exploration' | 'combat' | 'boss' | 'victory' | 'defeat';
}

export function getMoodFromGameState(
  playerHP: number,
  maxHP: number,
  enemiesNearby: number,
  isBossActive: boolean,
  score: number
): MusicMood {
  let intensity = 0;
  let theme: MusicMood['theme'] = 'calm';

  // Low health increases intensity
  if (playerHP / maxHP < 0.3) {
    intensity += 0.3;
    theme = 'combat';
  }

  // Enemies nearby increase intensity
  if (enemiesNearby > 0) {
    intensity += Math.min(0.4, enemiesNearby * 0.1);
    theme = 'combat';
  }

  // Boss active = max intensity
  if (isBossActive) {
    intensity = 1.0;
    theme = 'boss';
  }

  // High score = victory mood
  if (score > 1000) {
    intensity = Math.max(intensity, 0.3);
    theme = 'victory';
  }

  // No enemies, full health = calm
  if (enemiesNearby === 0 && playerHP / maxHP > 0.7) {
    intensity = Math.min(intensity, 0.2);
    theme = 'exploration';
  }

  return { intensity: Math.min(1, intensity), theme };
}

// ─── Music Track Presets ───

export const MUSIC_PRESETS: Record<MusicMood['theme'], { name: string; bpm: number; key: string }> = {
  calm: { name: 'Peaceful Meadow', bpm: 80, key: 'C major' },
  exploration: { name: 'Mysterious Forest', bpm: 100, key: 'D minor' },
  combat: { name: 'Battle Theme', bpm: 140, key: 'E minor' },
  boss: { name: 'Boss Battle', bpm: 160, key: 'F# minor' },
  victory: { name: 'Victory Fanfare', bpm: 120, key: 'G major' },
  defeat: { name: 'Game Over', bpm: 60, key: 'A minor' },
};

// ─── Tempo Synchronization (BPM-Locked Loops) ───

export class TempoSync {
  private bpm: number = 120;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private callbacks: Array<{ beat: number; callback: () => void }> = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  setBPM(bpm: number) {
    this.bpm = Math.max(20, Math.min(300, bpm));
  }

  getBPM(): number {
    return this.bpm;
  }

  getBeatInterval(): number {
    return 60000 / this.bpm;
  }

  getCurrentBeat(): number {
    if (!this.isRunning) return 0;
    const elapsed = Date.now() - this.startTime;
    return elapsed / this.getBeatInterval();
  }

  onBeat(beat: number, callback: () => void) {
    this.callbacks.push({ beat, callback });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    let lastBeat = 0;

    this.intervalId = setInterval(() => {
      const currentBeat = Math.floor(this.getCurrentBeat());
      if (currentBeat !== lastBeat) {
        lastBeat = currentBeat;
        this.callbacks.forEach(cb => {
          if (currentBeat % cb.beat === 0) cb.callback();
        });
      }
    }, 16);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks = [];
  }

  syncToDuration(durationMs: number): number {
    return Math.round(durationMs / this.getBeatInterval()) * this.getBeatInterval();
  }
}

export const tempoSync = new TempoSync();

// ─── Volume Automation ───

export interface VolumeKeyframe {
  time: number;
  value: number;
}

export class VolumeAutomation {
  private keyframes: VolumeKeyframe[] = [];
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private currentValue: number = 0.5;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onUpdate: ((value: number) => void) | null = null;

  addKeyframe(time: number, value: number) {
    this.keyframes.push({ time, value: Math.max(0, Math.min(1, value)) });
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  clearKeyframes() {
    this.keyframes = [];
  }

  fadeIn(durationMs: number, from: number = 0, to: number = 1) {
    this.clearKeyframes();
    this.addKeyframe(0, from);
    this.addKeyframe(durationMs, to);
  }

  fadeOut(durationMs: number, from: number = 1, to: number = 0) {
    this.addKeyframe(0, from);
    this.addKeyframe(durationMs, to);
  }

  private interpolate(time: number): number {
    if (this.keyframes.length === 0) return this.currentValue;
    if (this.keyframes.length === 1) return this.keyframes[0].value;

    let lower = this.keyframes[0];
    let upper = this.keyframes[this.keyframes.length - 1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (time >= this.keyframes[i].time && time <= this.keyframes[i + 1].time) {
        lower = this.keyframes[i];
        upper = this.keyframes[i + 1];
        break;
      }
    }

    if (time <= lower.time) return lower.value;
    if (time >= upper.time) return upper.value;

    const range = upper.time - lower.time;
    const t = range > 0 ? (time - lower.time) / range : 0;
    return lower.value + (upper.value - lower.value) * t;
  }

  play(onUpdate: (value: number) => void) {
    this.isPlaying = true;
    this.startTime = Date.now();
    this.onUpdate = onUpdate;

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      this.currentValue = this.interpolate(elapsed);
      this.onUpdate?.(this.currentValue);

      if (this.keyframes.length > 0) {
        const maxTime = this.keyframes[this.keyframes.length - 1].time;
        if (elapsed >= maxTime) {
          this.stop();
        }
      }
    }, 16);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onUpdate = null;
  }
}

// ─── Crossfade Manager ───

export class CrossfadeManager {
  private audioA: HTMLAudioElement | null = null;
  private audioB: HTMLAudioElement | null = null;
  private isPlayingA: boolean = true;
  private volumeA: number = 0;
  private volumeB: number = 0;
  private targetA: number = 0;
  private targetB: number = 0;
  private crossfadeTime: number = 2000;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private masterVolume: number = 0.5;

  crossfadeTo(trackUrl: string, duration: number = 2000) {
    this.crossfadeTime = duration;
    const newAudio = new Audio(trackUrl);
    newAudio.loop = true;

    if (this.isPlayingA) {
      this.audioB = newAudio;
      this.volumeB = 0;
      this.targetA = 0;
      this.targetB = this.masterVolume;
      this.audioB.play().catch(() => {});
    } else {
      this.audioA = newAudio;
      this.volumeA = 0;
      this.targetB = 0;
      this.targetA = this.masterVolume;
      this.audioA.play().catch(() => {});
    }

    if (this.intervalId) clearInterval(this.intervalId);

    const stepTime = 16;
    const steps = this.crossfadeTime / stepTime;
    const stepA = (this.targetA - this.volumeA) / steps;
    const stepB = (this.targetB - this.volumeB) / steps;

    this.intervalId = setInterval(() => {
      this.volumeA = Math.max(0, Math.min(this.masterVolume, this.volumeA + stepA));
      this.volumeB = Math.max(0, Math.min(this.masterVolume, this.volumeB + stepB));

      if (this.audioA) this.audioA.volume = this.volumeA;
      if (this.audioB) this.audioB.volume = this.volumeB;

      if (Math.abs(this.volumeA - this.targetA) < 0.01 && Math.abs(this.volumeB - this.targetB) < 0.01) {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.isPlayingA && this.audioA) {
          this.audioA.pause();
          this.audioA.src = '';
        } else if (!this.isPlayingA && this.audioB) {
          this.audioB.pause();
          this.audioB.src = '';
        }
        this.isPlayingA = !this.isPlayingA;
      }
    }, stepTime);
  }

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.audioA && this.isPlayingA) this.audioA.volume = this.volumeA;
    if (this.audioB && !this.isPlayingA) this.audioB.volume = this.volumeB;
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.audioA?.pause();
    this.audioB?.pause();
    this.audioA = null;
    this.audioB = null;
  }
}

export const crossfadeManager = new CrossfadeManager();

// ─── Enhanced Spatial Audio (3D Positioning) ───

export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
}

export function calculateSpatialVolume3D(
  soundPos: SpatialPosition,
  listenerPos: SpatialPosition,
  maxDistance: number = 1000,
  referenceVolume: number = 1,
  rolloffFactor: number = 1.5
): { volume: number; pan: number; elevation: number } {
  const dx = soundPos.x - listenerPos.x;
  const dy = soundPos.y - listenerPos.y;
  const dz = soundPos.z - listenerPos.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const volume = Math.max(0, referenceVolume * Math.pow(1 - Math.min(distance / maxDistance, 1), rolloffFactor));
  const pan = Math.max(-1, Math.min(1, dx / (maxDistance / 2)));
  const elevation = Math.max(-1, Math.min(1, dz / (maxDistance / 2)));

  return { volume, pan, elevation };
}

// ─── Audio Ducking Engine ───

export class DuckingEngine {
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private isDucking: boolean = false;
  private originalVolume: number = 0.5;
  private duckAmount: number = 0.3;
  private releaseTime: number = 0.3;

  startDucking(duckAmount: number = 0.3, duration: number = 500) {
    this.isDucking = true;
    this.duckAmount = duckAmount;
    setTimeout(() => this.stopDucking(), duration);
  }

  stopDucking() {
    this.isDucking = false;
  }

  getDuckedVolume(originalVolume: number): number {
    if (!this.isDucking) return originalVolume;
    return originalVolume * (1 - this.duckAmount);
  }
}

export const duckingEngine = new DuckingEngine();
