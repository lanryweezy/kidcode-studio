// Audio Effects Library — Chorus, Flanger, Phaser, Tremolo, Vibrato

export interface EffectOptions {
  wet: number;
  bypass: boolean;
}

export interface ChorusOptions extends EffectOptions {
  rate: number;
  depth: number;
  feedback: number;
  delay: number;
}

export interface FlangerOptions extends EffectOptions {
  rate: number;
  depth: number;
  feedback: number;
  delay: number;
}

export interface PhaserOptions extends EffectOptions {
  rate: number;
  depth: number;
  stages: number;
  feedback: number;
}

export interface TremoloOptions extends EffectOptions {
  rate: number;
  depth: number;
  waveform: OscillatorType;
}

export interface VibratoOptions extends EffectOptions {
  rate: number;
  depth: number;
  waveform: OscillatorType;
}

// ─── Chorus Effect ───
// Doubled signal with slight detune for thick, shimmering sound

export function createChorus(ctx: AudioContext, opts: ChorusOptions): { input: GainNode; output: GainNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const wetGain = ctx.createGain();
  const dryGain = ctx.createGain();
  const dryDelay = ctx.createDelay();
  const feedbackGain = ctx.createGain();

  const modDelay = ctx.createDelay(0.1);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  // Dry path
  dryGain.gain.setValueAtTime(1 - opts.wet, ctx.currentTime);
  input.connect(dryGain);
  dryDelay.delayTime.setValueAtTime(opts.delay, ctx.currentTime);
  input.connect(dryDelay);
  dryDelay.connect(dryGain);

  // Wet path — modulated delay for chorus
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(opts.rate, ctx.currentTime);
  lfoGain.gain.setValueAtTime(opts.depth * 0.002, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(modDelay.delayTime);

  modDelay.delayTime.setValueAtTime(opts.delay + opts.depth * 0.001, ctx.currentTime);

  wetGain.gain.setValueAtTime(opts.wet, ctx.currentTime);
  feedbackGain.gain.setValueAtTime(opts.feedback, ctx.currentTime);

  input.connect(modDelay);
  modDelay.connect(feedbackGain);
  feedbackGain.connect(modDelay);
  modDelay.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  lfo.start();

  return { input, output };
}

// ─── Flanger Effect ───
// Sweeping delay with feedback for jet-plane swoosh

export function createFlanger(ctx: AudioContext, opts: FlangerOptions): { input: GainNode; output: GainNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const wetGain = ctx.createGain();
  const dryGain = ctx.createGain();
  const feedbackGain = ctx.createGain();

  const modDelay = ctx.createDelay(0.1);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  dryGain.gain.setValueAtTime(1 - opts.wet, ctx.currentTime);
  wetGain.gain.setValueAtTime(opts.wet, ctx.currentTime);
  feedbackGain.gain.setValueAtTime(opts.feedback, ctx.currentTime);

  input.connect(dryGain);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(opts.rate, ctx.currentTime);
  lfoGain.gain.setValueAtTime(opts.depth * 0.001, ctx.currentTime);

  modDelay.delayTime.setValueAtTime(opts.delay, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(modDelay.delayTime);

  input.connect(modDelay);
  modDelay.connect(feedbackGain);
  feedbackGain.connect(modDelay);
  modDelay.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  lfo.start();

  return { input, output };
}

// ─── Phaser Effect ───
// Sweeping all-pass filters for swirling motion

export function createPhaser(ctx: AudioContext, opts: PhaserOptions): { input: GainNode; output: GainNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const wetGain = ctx.createGain();
  const dryGain = ctx.createGain();
  const feedbackGain = ctx.createGain();

  dryGain.gain.setValueAtTime(1 - opts.wet, ctx.currentTime);
  wetGain.gain.setValueAtTime(opts.wet, ctx.currentTime);
  feedbackGain.gain.setValueAtTime(opts.feedback, ctx.currentTime);

  const stages: BiquadFilterNode[] = [];
  for (let i = 0; i < opts.stages; i++) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'allpass';
    filter.frequency.setValueAtTime(100 + i * 200, ctx.currentTime);
    stages.push(filter);
  }

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(opts.rate, ctx.currentTime);
  lfoGain.gain.setValueAtTime(opts.depth * 300, ctx.currentTime);
  lfo.connect(lfoGain);

  stages.forEach((filter, i) => {
    lfoGain.connect(filter.frequency);
    if (i > 0) stages[i - 1].connect(filter);
  });

  input.connect(dryGain);
  input.connect(stages[0]);
  stages[stages.length - 1].connect(feedbackGain);
  feedbackGain.connect(stages[0]);
  stages[stages.length - 1].connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  lfo.start();

  return { input, output };
}

// ─── Tremolo Effect ───
// Amplitude modulation for pulsing volume

export function createTremolo(ctx: AudioContext, opts: TremoloOptions): { input: GainNode; output: GainNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const wetGain = ctx.createGain();
  const dryGain = ctx.createGain();

  dryGain.gain.setValueAtTime(1 - opts.wet, ctx.currentTime);
  wetGain.gain.setValueAtTime(opts.wet, ctx.currentTime);

  const modGain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGainNode = ctx.createGain();

  lfo.type = opts.waveform;
  lfo.frequency.setValueAtTime(opts.rate, ctx.currentTime);
  lfoGainNode.gain.setValueAtTime(opts.depth * 0.5, ctx.currentTime);

  // DC offset: keep modGain centered at 1
  const dcOffset = ctx.createConstantSource();
  dcOffset.offset.setValueAtTime(1 - opts.depth * 0.5, ctx.currentTime);

  lfo.connect(lfoGainNode);
  lfoGainNode.connect(modGain.gain);
  dcOffset.connect(modGain.gain);

  input.connect(dryGain);
  input.connect(modGain);
  modGain.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  lfo.start();
  dcOffset.start();

  return { input, output };
}

// ─── Vibrato Effect ───
// Pitch modulation for warbling detune

export function createVibrato(ctx: AudioContext, opts: VibratoOptions): { input: GainNode; output: GainNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const wetGain = ctx.createGain();
  const dryGain = ctx.createGain();

  dryGain.gain.setValueAtTime(1 - opts.wet, ctx.currentTime);
  wetGain.gain.setValueAtTime(opts.wet, ctx.currentTime);

  const delay = ctx.createDelay(0.01);
  delay.delayTime.setValueAtTime(0.005, ctx.currentTime);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  lfo.type = opts.waveform;
  lfo.frequency.setValueAtTime(opts.rate, ctx.currentTime);
  lfoGain.gain.setValueAtTime(opts.depth * 0.002, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(delay.delayTime);

  input.connect(dryGain);
  input.connect(delay);
  delay.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  lfo.start();

  return { input, output };
}

// ─── Convenience Defaults ───

export const DEFAULT_CHORUS: ChorusOptions = { wet: 0.4, bypass: false, rate: 1.5, depth: 0.7, feedback: 0.3, delay: 0.03 };
export const DEFAULT_FLANGER: FlangerOptions = { wet: 0.5, bypass: false, rate: 0.5, depth: 0.8, feedback: 0.5, delay: 0.005 };
export const DEFAULT_PHASER: PhaserOptions = { wet: 0.5, bypass: false, rate: 0.8, depth: 0.6, stages: 4, feedback: 0.4 };
export const DEFAULT_TREMOLO: TremoloOptions = { wet: 0.5, bypass: false, rate: 5, depth: 0.8, waveform: 'sine' };
export const DEFAULT_VIBRATO: VibratoOptions = { wet: 0.5, bypass: false, rate: 5, depth: 0.5, waveform: 'sine' };
