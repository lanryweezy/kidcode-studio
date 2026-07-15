/**
 * Keyframe Animation System - Ported from Timeframe
 * Allows property animation over time with easing functions
 */

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic' | 'backIn' | 'backOut';

export interface Keyframe {
  time: number; // 0-1 normalized
  value: number;
  easing: EasingFunction;
}

export interface AnimatedProperty {
  property: string;
  keyframes: Keyframe[];
  loop: boolean;
  pingPong: boolean;
}

export interface AnimationTrack {
  id: string;
  name: string;
  target: string; // entity ID or 'camera'
  properties: AnimatedProperty[];
  duration: number; // seconds
  playing: boolean;
  currentTime: number;
}

// ─── Easing Functions ───

const easings: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  elastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
  backIn: (t) => t * t * (2.70158 * t - 1.70158),
  backOut: (t) => { const p = 1.70158; return (t -= 1) * t * ((p + 1) * t + p) + 1; },
};

export function interpolateKeyframes(keyframes: Keyframe[], time: number): number {
  if (keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  // Find surrounding keyframes
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  for (let i = 0; i < sorted.length - 1; i++) {
    const kf1 = sorted[i];
    const kf2 = sorted[i + 1];
    if (time >= kf1.time && time <= kf2.time) {
      const t = (time - kf1.time) / (kf2.time - kf1.time);
      const eased = easings[kf2.easing](t);
      return kf1.value + (kf2.value - kf1.value) * eased;
    }
  }

  return sorted[0].value;
}

// ─── Animation Track Manager ───

export class AnimationManager {
  private tracks: Map<string, AnimationTrack> = new Map();

  createTrack(name: string, target: string, duration: number = 1): AnimationTrack {
    const track: AnimationTrack = {
      id: `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      target,
      properties: [],
      duration,
      playing: false,
      currentTime: 0,
    };
    this.tracks.set(track.id, track);
    return track;
  }

  addProperty(trackId: string, property: string, keyframes: Keyframe[]): void {
    const track = this.tracks.get(trackId);
    if (!track) return;
    track.properties.push({ property, keyframes, loop: false, pingPong: false });
  }

  play(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) track.playing = true;
  }

  stop(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) { track.playing = false; track.currentTime = 0; }
  }

  tick(deltaTime: number): Record<string, Record<string, number>> {
    const results: Record<string, Record<string, number>> = {};

    for (const track of this.tracks.values()) {
      if (!track.playing) continue;

      track.currentTime += deltaTime;
      if (track.currentTime >= track.duration) {
        if (track.properties.some(p => p.loop)) {
          track.currentTime = track.currentTime % track.duration;
        } else {
          track.currentTime = track.duration;
          track.playing = false;
        }
      }

      const normalizedTime = track.currentTime / track.duration;
      if (!results[track.target]) results[track.target] = {};

      for (const prop of track.properties) {
        let time = normalizedTime;
        if (prop.pingPong) {
          time = time < 0.5 ? time * 2 : 2 - time * 2;
        }
        results[track.target][prop.property] = interpolateKeyframes(prop.keyframes, time);
      }
    }

    return results;
  }

  getTrack(id: string): AnimationTrack | undefined { return this.tracks.get(id); }
  getAllTracks(): AnimationTrack[] { return Array.from(this.tracks.values()); }
  removeTrack(id: string): void { this.tracks.delete(id); }
}

// ─── Preset Animations ───

export const ANIMATION_PRESETS: Record<string, (manager: AnimationManager, target: string) => string> = {
  'bob': (m, t) => {
    const track = m.createTrack('Bob', t, 1);
    m.addProperty(track.id, 'y', [
      { time: 0, value: 0, easing: 'easeInOut' },
      { time: 0.5, value: -10, easing: 'easeInOut' },
      { time: 1, value: 0, easing: 'easeInOut' },
    ]);
    track.properties[0].loop = true;
    return track.id;
  },
  'pulse': (m, t) => {
    const track = m.createTrack('Pulse', t, 0.5);
    m.addProperty(track.id, 'scale', [
      { time: 0, value: 1, easing: 'easeOut' },
      { time: 0.5, value: 1.2, easing: 'easeIn' },
      { time: 1, value: 1, easing: 'easeOut' },
    ]);
    track.properties[0].loop = true;
    return track.id;
  },
  'shake': (m, t) => {
    const track = m.createTrack('Shake', t, 0.3);
    m.addProperty(track.id, 'x', [
      { time: 0, value: 0, easing: 'linear' },
      { time: 0.25, value: -5, easing: 'linear' },
      { time: 0.5, value: 5, easing: 'linear' },
      { time: 0.75, value: -3, easing: 'linear' },
      { time: 1, value: 0, easing: 'linear' },
    ]);
    return track.id;
  },
  'fadeIn': (m, t) => {
    const track = m.createTrack('Fade In', t, 0.5);
    m.addProperty(track.id, 'opacity', [
      { time: 0, value: 0, easing: 'easeOut' },
      { time: 1, value: 1, easing: 'easeOut' },
    ]);
    return track.id;
  },
  'spin': (m, t) => {
    const track = m.createTrack('Spin', t, 1);
    m.addProperty(track.id, 'rotation', [
      { time: 0, value: 0, easing: 'linear' },
      { time: 1, value: 360, easing: 'linear' },
    ]);
    track.properties[0].loop = true;
    return track.id;
  },
};
