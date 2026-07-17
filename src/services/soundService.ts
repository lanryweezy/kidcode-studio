
let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
};

export type SoundEffectType = 'move' | 'turn' | 'ui' | 'click' | 'coin' | 'camera' | 'powerup' | 'laser' | 'explosion' | 'hurt' | 'jump' | 'dash' | 'attack' | 'hit' | 'swish' | 'death' | 'victory' | 'wind' | 'gameOver' | 'notification' | 'achievement' | 'coinCollect' | 'levelComplete' | 'menuSelect' | 'menuBack' | 'typing' | 'bossIntro' | 'healing' | 'damageTaken' | 'shieldBlock' | 'thunder' | 'kick' | 'shoot' | 'pass' | 'whistle' | 'punch' | 'splash' | 'crack' | 'magicSpell' | 'swordSlash' | 'arrowShoot' | 'explosionSmall' | 'explosionLarge' | 'snap' | 'success' | 'error' | 'drop';

/** Plays a procedural sound effect using the Web Audio API.
 * @param type - The sound effect to play.
 * @param panX - Stereo pan position from -1 (left) to 1 (right).
 */
export const playSoundEffect = (type: SoundEffectType, panX: number = 0) => {
  try {
    if (muted) return;
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const masterGain = ctx.createGain();
    masterGain.gain.value = sfxVolume;

    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, panX));

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'jump':
        // Quick upward sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'move':
        // Soft sine slide (retro movement sound)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'turn':
        // Quick ratchet/blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'ui':
        // Happy chime for messages/emojis
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'click':
        // Mechanical click for LEDs
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;

      case 'coin':
        // Coin sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.setValueAtTime(0.05, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'camera':
        // Shutter sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'powerup':
        // Powerup sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'laser':
        // Laser sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'explosion':
        // Explosion noise (white noise approximation)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'hurt':
        // Hurt sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'dash':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'snap':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'error':
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'drop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'attack':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'hit':
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case 'death':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'victory': {
        osc.type = 'sine';
        const v1 = ctx.createOscillator();
        const v1g = ctx.createGain();
        v1.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.15);
        osc.frequency.setValueAtTime(784, now + 0.3);
        v1.frequency.setValueAtTime(659, now);
        v1.frequency.setValueAtTime(784, now + 0.15);
        v1.frequency.setValueAtTime(1047, now + 0.3);
        v1g.gain.value = 0.08;
        v1.connect(v1g);
        v1g.connect(ctx.destination);
        v1.start(now);
        v1.stop(now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'achievement':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1108, now + 0.1);
        osc.frequency.setValueAtTime(1318, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'notification':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(698, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'gameOver':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(370, now + 0.2);
        osc.frequency.setValueAtTime(311, now + 0.4);
        osc.frequency.setValueAtTime(220, now + 0.6);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        break;

      case 'levelComplete': {
        osc.type = 'square';
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
        });
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      case 'healing':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'menuSelect':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.04);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

/** Plays a sustained tone for a given duration.
 * @param duration - Length in seconds.
 * @param volume - Gain multiplier from 0 to 1.
 */
export const playTone = (duration: number, volume: number = 0.5) => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // A buzzer sound
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);

    // Scale gain by volume
    const vol = Math.max(0, Math.min(1, volume));
    gain.gain.setValueAtTime(0.1 * vol, now);
    gain.gain.setValueAtTime(0.1 * vol, now + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.error("Tone playback failed", e);
  }
}

/** Plays a named speaker sound (siren, laser, powerup, coin) and returns its duration. */
export const playSpeakerSound = (type: string, volume: number = 0.5): number => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Scale gain by volume
    const vol = Math.max(0, Math.min(1, volume));
    const baseGain = 0.1 * vol;

    if (type === 'siren') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.5);
      osc.frequency.linearRampToValueAtTime(400, now + 1.0);
      gain.gain.setValueAtTime(baseGain, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
      return 1;
    }
    if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(baseGain, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      return 0.3;
    }
    if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.2);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
      gain.gain.setValueAtTime(baseGain, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      return 0.5;
    }
    if (type === 'coin') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(baseGain * 0.5, now);
      gain.gain.setValueAtTime(baseGain * 0.5, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      return 0.4;
    }

    // Default fallback (low beep)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
    return 0.2;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

let sfxVolume = 0.5;
let musicVolume = 0.5;
let muted = false;

export const setSfxVolume = (v: number) => { sfxVolume = Math.max(0, Math.min(1, v)); };
export const getSfxVolume = () => sfxVolume;
export const setMusicVolume = (v: number) => { musicVolume = Math.max(0, Math.min(1, v)); };
export const getMusicVolume = () => musicVolume;
export const toggleMute = () => { muted = !muted; return muted; };
export const setMuted = (v: boolean) => { muted = v; };
export const getMuted = () => muted;

/** Plays a sound effect panned based on the entity's x position relative to canvas width. */
export const spatialPlaySound = (type: SoundEffectType, x: number = 0, canvasWidth: number = 400) => {
  const panX = ((x / canvasWidth) * 2) - 1;
  playSoundEffect(type, panX);
};

let bgMusicOsc: OscillatorNode | null = null;
let bgMusicGain: GainNode | null = null;

const MUSIC_PROFILES: Record<string, { baseFreq: number; type: OscillatorType; filterFreq: number }> = {
  calm: { baseFreq: 220, type: 'sine', filterFreq: 400 },
  exploration: { baseFreq: 261, type: 'triangle', filterFreq: 600 },
  combat: { baseFreq: 329, type: 'sawtooth', filterFreq: 800 },
  boss: { baseFreq: 196, type: 'square', filterFreq: 500 },
  victory: { baseFreq: 392, type: 'sine', filterFreq: 1000 },
  defeat: { baseFreq: 164, type: 'sawtooth', filterFreq: 300 },
};

export const playBackgroundMusic = (track: string = 'calm') => {
  stopBackgroundMusic();
  if (muted) return;

  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const profile = MUSIC_PROFILES[track] || MUSIC_PROFILES.calm;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    bgMusicGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(profile.filterFreq, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
    lfoGain.gain.setValueAtTime(15, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    osc1.type = profile.type;
    osc1.frequency.setValueAtTime(profile.baseFreq, ctx.currentTime);
    osc2.type = profile.type;
    osc2.frequency.setValueAtTime(profile.baseFreq * 1.5, ctx.currentTime);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.3;

    bgMusicGain.gain.setValueAtTime(0, ctx.currentTime);
    bgMusicGain.gain.linearRampToValueAtTime(musicVolume * 0.12, ctx.currentTime + 1);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(bgMusicGain);
    bgMusicGain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    bgMusicOsc = osc1;
    (bgMusicOsc as any)._osc2 = osc2;
    (bgMusicOsc as any)._lfo = lfo;
  } catch (e) {
    console.error('Background music failed', e);
  }
};

export const stopBackgroundMusic = () => {
  if (bgMusicOsc) {
    try {
      if (bgMusicGain) {
        const ctx = bgMusicOsc.context;
        bgMusicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      const osc2Ref = (bgMusicOsc as any)._osc2;
      const lfoRef = (bgMusicOsc as any)._lfo;
      setTimeout(() => {
        try {
          bgMusicOsc?.stop();
          osc2Ref?.stop();
          lfoRef?.stop();
        } catch {}
        bgMusicOsc = null;
        bgMusicGain = null;
      }, 600);
    } catch {
      bgMusicOsc = null;
      bgMusicGain = null;
    }
  }
};

export const setBgMusicVolume = (v: number) => {
  musicVolume = Math.max(0, Math.min(1, v));
  if (bgMusicGain) {
    bgMusicGain.gain.setValueAtTime(muted ? 0 : musicVolume * 0.12, bgMusicGain.context.currentTime);
  }
};

export const applyADSR = (param: AudioParam | GainNode, peakVolume: number = 1, envelope: { attack: number; decay: number; sustain: number; release: number } = DEFAULT_ADSR, startTime: number = 0) => {
  const gainParam = 'gain' in param ? (param as GainNode).gain : param as AudioParam;
  gainParam.setValueAtTime(0, startTime);
  gainParam.linearRampToValueAtTime(peakVolume, startTime + envelope.attack);
  gainParam.linearRampToValueAtTime(peakVolume * envelope.sustain, startTime + envelope.attack + envelope.decay);
};

export const createFilter = (ctx?: AudioContext, options?: { type?: BiquadFilterType; frequency?: number; Q?: number }): BiquadFilterNode => {
  const context = ctx || getContext();
  const filter = context.createBiquadFilter();
  if (options) {
    if (options.type) filter.type = options.type;
    if (options.frequency) filter.frequency.setValueAtTime(options.frequency, context.currentTime);
    if (options.Q) filter.Q.setValueAtTime(options.Q, context.currentTime);
  }
  return filter;
};

export const createReverb = (ctx?: AudioContext, options?: { decay?: number; mix?: number }): ConvolverNode => {
  const context = ctx || getContext();
  const convolver = context.createConvolver();
  const duration = options?.decay || 2;
  const length = context.sampleRate * duration;
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  convolver.buffer = impulse;
  return convolver;
};

export const createDelay = (ctx?: AudioContext, options?: { time?: number; feedback?: number; mix?: number }): { input: GainNode; output: GainNode; delay: DelayNode } => {
  const context = ctx || getContext();
  const delay = context.createDelay();
  delay.delayTime.setValueAtTime(options?.time || 0.5, context.currentTime);
  const input = context.createGain();
  const output = context.createGain();
  input.connect(delay);
  delay.connect(output);
  return { input, output, delay };
};

export const createDistortion = (ctx?: AudioContext, amount?: number): WaveShaperNode => {
  const context = ctx || getContext();
  const waveshaper = context.createWaveShaper();
  const samples = 44100;
  const curve = new Float32Array(samples);
  const distortionAmount = amount || 50;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + distortionAmount) * x * 20 * (Math.PI / 180)) / (Math.PI + distortionAmount * Math.abs(x));
  }
  waveshaper.curve = curve;
  waveshaper.oversample = '4x';
  return waveshaper;
};

export const createCompressor = (ctx?: AudioContext, options?: { threshold?: number; knee?: number; ratio?: number }): DynamicsCompressorNode => {
  const context = ctx || getContext();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(options?.threshold ?? -24, context.currentTime);
  compressor.knee.setValueAtTime(options?.knee ?? 30, context.currentTime);
  compressor.ratio.setValueAtTime(options?.ratio ?? 12, context.currentTime);
  return compressor;
};

export const DEFAULT_ADSR = { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 };

export const initSoundPool = (_size?: number) => {};
export const disposeSoundPool = () => {};
