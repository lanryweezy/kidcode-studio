import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, Square, Download, Volume2, Plus, Trash2, GripVertical, Save, Upload, Music } from 'lucide-react';
import { Button } from '../ui/Button';

interface EffectNode {
  id: string;
  type: 'filter' | 'reverb' | 'delay' | 'distortion' | 'panner';
  enabled: boolean;
  params: Record<string, number>;
}

interface SoundPreset {
  id: string;
  name: string;
  emoji: string;
  frequency: number;
  type: OscillatorType;
  duration: number;
  description: string;
  effects: EffectNode[];
}

const DEFAULT_EFFECTS: EffectNode[] = [
  { id: 'ef_1', type: 'filter', enabled: true, params: { frequency: 2000, Q: 1 } },
];

const SOUND_PRESETS: SoundPreset[] = [
  { id: 'jump', name: 'Jump', emoji: '🦘', frequency: 440, type: 'square', duration: 0.15, description: 'Quick upward blip', effects: [] },
  { id: 'coin', name: 'Coin', emoji: '🪙', frequency: 880, type: 'sine', duration: 0.1, description: 'High pitched ding', effects: [] },
  { id: 'hit', name: 'Hit', emoji: '💥', frequency: 150, type: 'sawtooth', duration: 0.2, description: 'Low thud', effects: [] },
  { id: 'powerup', name: 'Power Up', emoji: '⭐', frequency: 660, type: 'sine', duration: 0.3, description: 'Rising chime', effects: [] },
  { id: 'death', name: 'Death', emoji: '💀', frequency: 200, type: 'sawtooth', duration: 0.5, description: 'Falling tone', effects: [] },
  { id: 'laser', name: 'Laser', emoji: '🔫', frequency: 1200, type: 'sawtooth', duration: 0.1, description: 'Sharp zap', effects: [] },
  { id: 'explosion', name: 'Explosion', emoji: '💣', frequency: 100, type: 'sawtooth', duration: 0.4, description: 'Low rumble', effects: [] },
  { id: 'select', name: 'Select', emoji: '✅', frequency: 600, type: 'sine', duration: 0.08, description: 'Quick click', effects: [] },
  { id: 'bounce', name: 'Bounce', emoji: '🏀', frequency: 300, type: 'triangle', duration: 0.12, description: 'Soft bounce', effects: [] },
  { id: 'victory', name: 'Victory', emoji: '🏆', frequency: 523, type: 'sine', duration: 0.6, description: 'Triumphant chord', effects: [] },
];

const EFFECT_TYPES: { type: EffectNode['type']; label: string; emoji: string }[] = [
  { type: 'filter', label: 'Filter', emoji: '🎛️' },
  { type: 'reverb', label: 'Reverb', emoji: '🌊' },
  { type: 'delay', label: 'Delay', emoji: '🔄' },
  { type: 'distortion', label: 'Distortion', emoji: '⚡' },
  { type: 'panner', label: 'Panner', emoji: '🔊' },
];

function createEffect(type: EffectNode['type']): EffectNode {
  const defaults: Record<string, Record<string, number>> = {
    filter: { frequency: 2000, Q: 1 },
    reverb: { decay: 1.5, mix: 0.3 },
    delay: { time: 0.3, feedback: 0.4, mix: 0.3 },
    distortion: { amount: 0.5 },
    panner: { pan: 0 },
  };
  return {
    id: `ef_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    enabled: true,
    params: { ...defaults[type] },
  };
}

interface SoundEffectBuilderProps {
  onSave: (preset: SoundPreset) => void;
}

export const SoundEffectBuilder: React.FC<SoundEffectBuilderProps> = ({ onSave }) => {
  const [frequency, setFrequency] = useState(440);
  const [waveType, setWaveType] = useState<OscillatorType>('square');
  const [duration, setDuration] = useState(0.3);
  const [customName, setCustomName] = useState('My Sound');
  const [isPlaying, setIsPlaying] = useState(false);
  const [effects, setEffects] = useState<EffectNode[]>(DEFAULT_EFFECTS);
  const [savedPresets, setSavedPresets] = useState<SoundPreset[]>(() => {
    try {
      const stored = localStorage.getItem('kidcode-sound-presets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [autoPreview, setAutoPreview] = useState(true);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kidcode-sound-presets', JSON.stringify(savedPresets));
    } catch { /* ignore */ }
  }, [savedPresets]);

  const playSound = useCallback((freq?: number, type?: OscillatorType, dur?: number, fx?: EffectNode[]) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const useFx = fx || effects;

      osc.type = type || waveType;
      osc.frequency.value = freq || frequency;

      let lastNode: AudioNode = osc;

      for (const effect of useFx) {
        if (!effect.enabled) continue;
        switch (effect.type) {
          case 'filter': {
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(effect.params.frequency || 2000, ctx.currentTime);
            filter.Q.setValueAtTime(effect.params.Q || 1, ctx.currentTime);
            lastNode.connect(filter);
            lastNode = filter;
            break;
          }
          case 'reverb': {
            const convolver = ctx.createConvolver();
            const length = ctx.sampleRate * (effect.params.decay || 1.5);
            const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
              const data = impulse.getChannelData(ch);
              for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
              }
            }
            convolver.buffer = impulse;
            const wetGain = ctx.createGain();
            const dryGain = ctx.createGain();
            wetGain.gain.setValueAtTime(effect.params.mix || 0.3, ctx.currentTime);
            dryGain.gain.setValueAtTime(1 - (effect.params.mix || 0.3), ctx.currentTime);
            const merger = ctx.createGain();
            lastNode.connect(dryGain);
            lastNode.connect(convolver);
            convolver.connect(wetGain);
            dryGain.connect(merger);
            wetGain.connect(merger);
            lastNode = merger;
            break;
          }
          case 'delay': {
            const delayNode = ctx.createDelay(2.0);
            const fb = ctx.createGain();
            const wet = ctx.createGain();
            const dry = ctx.createGain();
            delayNode.delayTime.setValueAtTime(effect.params.time || 0.3, ctx.currentTime);
            fb.gain.setValueAtTime(effect.params.feedback || 0.4, ctx.currentTime);
            wet.gain.setValueAtTime(effect.params.mix || 0.3, ctx.currentTime);
            dry.gain.setValueAtTime(1 - (effect.params.mix || 0.3), ctx.currentTime);
            lastNode.connect(dry);
            lastNode.connect(delayNode);
            delayNode.connect(fb);
            fb.connect(delayNode);
            delayNode.connect(wet);
            const merger = ctx.createGain();
            dry.connect(merger);
            wet.connect(merger);
            lastNode = merger;
            break;
          }
          case 'distortion': {
            const shaper = ctx.createWaveShaper();
            const samples = 44100;
            const curve = new Float32Array(samples);
            const k = (effect.params.amount || 0.5) * 100;
            for (let i = 0; i < samples; i++) {
              const x = (i * 2) / samples - 1;
              curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
            }
            shaper.curve = curve;
            shaper.oversample = '4x';
            lastNode.connect(shaper);
            lastNode = shaper;
            break;
          }
          case 'panner': {
            const panNode = ctx.createStereoPanner();
            panNode.pan.setValueAtTime(effect.params.pan || 0, ctx.currentTime);
            lastNode.connect(panNode);
            lastNode = panNode;
            break;
          }
        }
      }

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (dur || duration));
      lastNode.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (dur || duration));
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), (dur || duration) * 1000);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [frequency, waveType, duration, effects]);

  const schedulePreview = useCallback((newFreq: number, newType: OscillatorType, newDur: number) => {
    if (!autoPreview) return;
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
      playSound(newFreq, newType, newDur);
    }, 150);
  }, [autoPreview, playSound]);

  const handleFrequencyChange = (val: number) => {
    setFrequency(val);
    schedulePreview(val, waveType, duration);
  };

  const handleWaveTypeChange = (type: OscillatorType) => {
    setWaveType(type);
    schedulePreview(frequency, type, duration);
  };

  const handleDurationChange = (val: number) => {
    setDuration(val);
    schedulePreview(frequency, waveType, val);
  };

  const WAVE_TYPES: { type: OscillatorType; label: string; emoji: string }[] = [
    { type: 'sine', label: 'Sine', emoji: '〰️' },
    { type: 'square', label: 'Square', emoji: '📶' },
    { type: 'sawtooth', label: 'Sawtooth', emoji: '📉' },
    { type: 'triangle', label: 'Triangle', emoji: '🔺' },
  ];

  const addEffect = (type: EffectNode['type']) => {
    setEffects(prev => [...prev, createEffect(type)]);
  };

  const removeEffect = (id: string) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  const toggleEffect = (id: string) => {
    setEffects(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const updateEffectParam = (id: string, param: string, value: number) => {
    setEffects(prev => prev.map(e => e.id === id ? { ...e, params: { ...e.params, [param]: value } } : e));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setEffects(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(index, 0, moved);
      return copy;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const savePreset = () => {
    const preset: SoundPreset = {
      id: `preset_${Date.now()}`,
      name: customName,
      emoji: '🔊',
      frequency,
      type: waveType,
      duration,
      description: `${frequency}Hz ${waveType}`,
      effects: [...effects],
    };
    setSavedPresets(prev => [...prev, preset]);
    onSave(preset);
  };

  const loadPreset = (preset: SoundPreset) => {
    setFrequency(preset.frequency);
    setWaveType(preset.type);
    setDuration(preset.duration);
    setCustomName(preset.name);
    setEffects(preset.effects.length > 0 ? [...preset.effects] : []);
    setSelectedPresetId(preset.id);
    playSound(preset.frequency, preset.type, preset.duration, preset.effects);
  };

  const deletePreset = (id: string) => {
    setSavedPresets(prev => prev.filter(p => p.id !== id));
    if (selectedPresetId === id) setSelectedPresetId(null);
  };

  const exportSound = async (format: 'wav' | 'mp3' | 'ogg') => {
    try {
      const ctx = new OfflineAudioContext(1, 44100 * duration, 44100);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.value = frequency;

      for (const effect of effects) {
        if (!effect.enabled) continue;
        if (effect.type === 'filter') {
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = effect.params.frequency || 2000;
          filter.Q.value = effect.params.Q || 1;
          osc.connect(filter);
          filter.connect(gain);
        }
      }

      const hasFilter = effects.some(e => e.type === 'filter' && e.enabled);
      if (!hasFilter) osc.connect(gain);

      gain.gain.setValueAtTime(0.3, 0);
      gain.gain.exponentialRampToValueAtTime(0.01, duration);
      gain.connect(ctx.destination);

      osc.start(0);
      osc.stop(duration);

      const buffer = await ctx.startRendering();
      const wavData = audioBufferToWav(buffer);
      const blob = new Blob([wavData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customName.replace(/\s+/g, '_')}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sound Effect Builder</div>

      {/* Sound Preview */}
      <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200 text-center">
        <div className="text-4xl mb-2">{isPlaying ? '🔊' : '🔈'}</div>
        <div className="text-sm font-bold text-slate-700"></div>
        <div className="text-xs text-slate-400">{frequency}Hz • {waveType} • {duration}s • {effects.filter(e => e.enabled).length} effects</div>
      </div>

      {/* Play Button */}
      <Button variant="primary" fullWidth size="lg" icon={isPlaying ? <Square size={18} /> : <Play size={18} />} onClick={() => playSound()}>
        {isPlaying ? 'Playing...' : 'Play Sound'}
      </Button>

      {/* Auto-preview toggle */}
      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
        <input
          type="checkbox"
          checked={autoPreview}
          onChange={(e) => setAutoPreview(e.target.checked)}
          className="rounded"
        />
        Auto-preview on change
      </label>

      {/* Custom Name */}
      <div>
        <div className="text-xs text-slate-500 mb-1">Name</div>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Frequency */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Frequency</span>
          <span className="text-xs font-bold text-violet-600">{frequency}Hz</span>
        </div>
        <input
          type="range"
          value={frequency}
          onChange={(e) => handleFrequencyChange(parseInt(e.target.value))}
          min={20}
          max={2000}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Wave Type */}
      <div>
        <div className="text-xs text-slate-500 mb-1">Wave Type</div>
        <div className="grid grid-cols-4 gap-1">
          {WAVE_TYPES.map(wave => (
            <button
              key={wave.type}
              onClick={() => handleWaveTypeChange(wave.type)}
              className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all ${
                waveType === wave.type
                  ? 'bg-violet-100 border border-violet-300 font-bold'
                  : 'bg-slate-100 border border-transparent hover:border-slate-300'
              }`}
            >
              <span className="text-lg">{wave.emoji}</span>
              <span>{wave.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Duration</span>
          <span className="text-xs font-bold text-violet-600">{duration.toFixed(2)}s</span>
        </div>
        <input
          type="range"
          value={duration}
          onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
          min={0.05}
          max={2}
          step={0.05}
          className="w-full"
        />
      </div>

      {/* Effect Chain Editor */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Effect Chain</div>
        <div className="space-y-2">
          {effects.map((effect, index) => (
            <div
              key={effect.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-3 bg-slate-50 rounded-lg border transition-all ${
                dragIndex === index ? 'border-violet-400 opacity-70' : 'border-slate-200'
              } ${!effect.enabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <GripVertical size={14} className="text-slate-400 cursor-grab" />
                <span className="text-sm font-bold text-slate-700">
                  {EFFECT_TYPES.find(t => t.type === effect.type)?.emoji} {effect.type}
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => toggleEffect(effect.id)}
                  className={`text-[10px] px-2 py-0.5 rounded ${effect.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}
                >
                  {effect.enabled ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => removeEffect(effect.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>

              {effect.type === 'filter' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500">Freq: {effect.params.frequency}Hz</div>
                    <input
                      type="range"
                      value={effect.params.frequency || 2000}
                      onChange={(e) => updateEffectParam(effect.id, 'frequency', parseInt(e.target.value))}
                      min={20}
                      max={20000}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Q: {(effect.params.Q || 1).toFixed(1)}</div>
                    <input
                      type="range"
                      value={effect.params.Q || 1}
                      onChange={(e) => updateEffectParam(effect.id, 'Q', parseFloat(e.target.value))}
                      min={0.1}
                      max={20}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {effect.type === 'reverb' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500">Decay: {(effect.params.decay || 1.5).toFixed(1)}s</div>
                    <input
                      type="range"
                      value={effect.params.decay || 1.5}
                      onChange={(e) => updateEffectParam(effect.id, 'decay', parseFloat(e.target.value))}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Mix: {((effect.params.mix || 0.3) * 100).toFixed(0)}%</div>
                    <input
                      type="range"
                      value={effect.params.mix || 0.3}
                      onChange={(e) => updateEffectParam(effect.id, 'mix', parseFloat(e.target.value))}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {effect.type === 'delay' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500">Time: {(effect.params.time || 0.3).toFixed(2)}s</div>
                    <input
                      type="range"
                      value={effect.params.time || 0.3}
                      onChange={(e) => updateEffectParam(effect.id, 'time', parseFloat(e.target.value))}
                      min={0.01}
                      max={2}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Fb: {((effect.params.feedback || 0.4) * 100).toFixed(0)}%</div>
                    <input
                      type="range"
                      value={effect.params.feedback || 0.4}
                      onChange={(e) => updateEffectParam(effect.id, 'feedback', parseFloat(e.target.value))}
                      min={0}
                      max={0.95}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Mix: {((effect.params.mix || 0.3) * 100).toFixed(0)}%</div>
                    <input
                      type="range"
                      value={effect.params.mix || 0.3}
                      onChange={(e) => updateEffectParam(effect.id, 'mix', parseFloat(e.target.value))}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {effect.type === 'distortion' && (
                <div>
                  <div className="text-[10px] text-slate-500">Amount: {((effect.params.amount || 0.5) * 100).toFixed(0)}%</div>
                  <input
                    type="range"
                    value={effect.params.amount || 0.5}
                    onChange={(e) => updateEffectParam(effect.id, 'amount', parseFloat(e.target.value))}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              )}

              {effect.type === 'panner' && (
                <div>
                  <div className="text-[10px] text-slate-500">Pan: {(effect.params.pan || 0).toFixed(2)}</div>
                  <input
                    type="range"
                    value={effect.params.pan || 0}
                    onChange={(e) => updateEffectParam(effect.id, 'pan', parseFloat(e.target.value))}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add effect buttons */}
        <div className="flex flex-wrap gap-1 mt-2">
          {EFFECT_TYPES.map(et => (
            <button
              key={et.type}
              onClick={() => addEffect(et.type)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Plus size={10} /> {et.emoji} {et.label}
            </button>
          ))}
        </div>
      </div>

      {/* Built-in Presets */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Presets</div>
        <div className="grid grid-cols-5 gap-1">
          {SOUND_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                setFrequency(preset.frequency);
                setWaveType(preset.type);
                setDuration(preset.duration);
                setCustomName(preset.name);
                playSound(preset.frequency, preset.type, preset.duration, preset.effects);
              }}
              onMouseEnter={() => {
                playSound(preset.frequency, preset.type, Math.min(preset.duration, 0.15), []);
              }}
              className="flex flex-col items-center p-2 bg-slate-50 rounded-lg hover:bg-slate-100 hover:scale-105 transition-all"
            >
              <span className="text-lg">{preset.emoji}</span>
              <span className="text-[9px] font-bold text-slate-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Custom Presets */}
      {savedPresets.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">My Presets</div>
          <div className="space-y-1">
            {savedPresets.map(preset => (
              <div
                key={preset.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPresetId === preset.id
                    ? 'bg-violet-100 border border-violet-300'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
                onClick={() => loadPreset(preset)}
              >
                <span className="text-lg">{preset.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700 truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-400">{preset.frequency}Hz • {preset.type}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth icon={<Save size={14} />} onClick={savePreset}>
          Save Preset
        </Button>
        <Button variant="secondary" fullWidth icon={<Volume2 size={14} />} onClick={() => onSave({ id: `sfx_${Date.now()}`, name: customName, emoji: '🔊', frequency, type: waveType, duration, description: `${frequency}Hz ${waveType}`, effects })}>
          Use in Game
        </Button>
      </div>

      {/* Export */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Export Format</div>
        <div className="flex gap-1">
          {(['wav', 'mp3', 'ogg'] as const).map(fmt => (
            <Button
              key={fmt}
              variant="secondary"
              size="sm"
              icon={<Download size={12} />}
              onClick={() => exportSound(fmt)}
              className="flex-1"
            >
              {fmt.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}
