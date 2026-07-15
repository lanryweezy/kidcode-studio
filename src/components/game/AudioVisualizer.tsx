import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AudioWaveform, Activity, Volume2, Zap, Music } from 'lucide-react';

interface AudioVisualizerProps {
  analyserNode?: AnalyserNode | null;
  genre?: 'ambient' | 'electronic' | 'rock' | 'jazz' | 'default';
  barCount?: number;
  width?: number;
  height?: number;
  showWaveform?: boolean;
  showLevelMeters?: boolean;
  showBeat?: boolean;
}

type VisualizerMode = 'spectrum' | 'waveform' | 'levels' | 'beat';

const GENRE_COLORS: Record<string, string[]> = {
  ambient: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  electronic: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
  rock: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef08a'],
  jazz: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  default: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
};

export function AudioVisualizer({
  analyserNode,
  genre = 'default',
  barCount = 32,
  width = 400,
  height = 120,
  showWaveform = true,
  showLevelMeters = true,
  showBeat = true,
}: AudioVisualizerProps) {
  const [mode, setMode] = useState<VisualizerMode>('spectrum');
  const [beatPulse, setBeatPulse] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const prevEnergyRef = useRef(0);

  const colors = GENRE_COLORS[genre] || GENRE_COLORS.default;

  const drawSpectrum = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const barWidth = width / barCount;
    const maxAmp = height * 0.9;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * data.length);
      const value = data[dataIndex] / 255;
      const barHeight = value * maxAmp;
      const x = i * barWidth;

      const gradient = ctx.createLinearGradient(x, height, x, height - barHeight);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, height - barHeight, barWidth - 2, barHeight);
    }
  }, [width, height, barCount, colors]);

  const drawWaveform = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    ctx.beginPath();
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;

    const sliceWidth = width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
  }, [width, height, colors]);

  const drawLevelMeters = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const rms = Math.sqrt(data.reduce((sum, v) => sum + (v / 128 - 1) ** 2, 0) / data.length);
    const level = Math.min(1, rms * 2);

    const meterWidth = 20;
    const meterHeight = height - 20;
    const x = width - meterWidth - 10;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, 10, meterWidth, meterHeight);

    const fillHeight = level * meterHeight;
    const gradient = ctx.createLinearGradient(x, 10 + meterHeight, x, 10);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.7, '#eab308');
    gradient.addColorStop(1, '#ef4444');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, 10 + meterHeight - fillHeight, meterWidth, fillHeight);
  }, [width, height]);

  const drawBeat = useCallback((ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const energy = data.reduce((sum, v) => sum + v, 0) / data.length;
    const isBeat = energy > prevEnergyRef.current * 1.2 && energy > 100;
    prevEnergyRef.current = energy * 0.8 + prevEnergyRef.current * 0.2;

    if (isBeat) setBeatPulse(1);

    const radius = 20 + beatPulse * 30;
    const cx = width / 2;
    const cy = height / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors[Math.floor(beatPulse * (colors.length - 1)) % colors.length];
    ctx.globalAlpha = 0.3 + beatPulse * 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;

    setBeatPulse(prev => prev * 0.92);
  }, [width, height, colors, beatPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode?.frequencyBinCount || 256;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      if (analyserNode) {
        if (mode === 'waveform') {
          analyserNode.getByteTimeDomainData(dataArray);
        } else {
          analyserNode.getByteFrequencyData(dataArray);
        }
      } else {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.random() * 255;
        }
      }

      switch (mode) {
        case 'spectrum':
          drawSpectrum(ctx, dataArray);
          break;
        case 'waveform':
          drawWaveform(ctx, dataArray);
          break;
        case 'levels':
          drawLevelMeters(ctx, dataArray);
          break;
        case 'beat':
          drawBeat(ctx, dataArray);
          break;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyserNode, mode, width, height, drawSpectrum, drawWaveform, drawLevelMeters, drawBeat]);

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-900 rounded-lg">
      <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
        <AudioWaveform size={12} />
        Audio Visualizer — {genre}
      </div>

      <div className="flex gap-1 mb-1">
        <button
          onClick={() => setMode('spectrum')}
          className={`px-2 py-0.5 rounded text-[10px] ${mode === 'spectrum' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
        >
          <Activity size={10} className="inline mr-1" />Spectrum
        </button>
        {showWaveform && (
          <button
            onClick={() => setMode('waveform')}
            className={`px-2 py-0.5 rounded text-[10px] ${mode === 'waveform' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            <AudioWaveform size={10} className="inline mr-1" />Wave
          </button>
        )}
        {showLevelMeters && (
          <button
            onClick={() => setMode('levels')}
            className={`px-2 py-0.5 rounded text-[10px] ${mode === 'levels' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            <Volume2 size={10} className="inline mr-1" />Levels
          </button>
        )}
        {showBeat && (
          <button
            onClick={() => setMode('beat')}
            className={`px-2 py-0.5 rounded text-[10px] ${mode === 'beat' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            <Zap size={10} className="inline mr-1" />Beat
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded border border-slate-700"
      />

      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <Music size={10} />
        {genre === 'ambient' ? 'Soft waveform display' :
         genre === 'electronic' ? 'Pulsing spectrum bars' :
         genre === 'rock' ? 'High energy meters' :
         'General visualization'}
      </div>
    </div>
  );
}
