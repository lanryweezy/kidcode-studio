
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Music, Sliders, Save, Volume2 } from 'lucide-react';

interface SoundEditorProps {
  onClose: () => void;
}

const SoundEditor: React.FC<SoundEditorProps> = ({ onClose }) => {
  const [params, setParams] = useState({
    frequency: 440,
    slide: 0,
    duration: 0.3,
    type: 'square' as OscillatorType,
    modulation: 0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (audioCtxRef.current) {
              audioCtxRef.current.close();
              audioCtxRef.current = null;
          }
      };
  }, []);

  const playSound = (freqOverride?: number) => {
    const audioCtx = getAudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = params.type;
    osc.frequency.setValueAtTime(freqOverride || params.frequency, audioCtx.currentTime);
    if (params.slide !== 0 && !freqOverride) {
        osc.frequency.linearRampToValueAtTime(params.frequency + params.slide, audioCtx.currentTime + params.duration);
    }
    
    if (params.modulation > 0 && !freqOverride) {
        // Simple Vibrato
        const modOsc = audioCtx.createOscillator();
        const modGain = audioCtx.createGain();
        modOsc.frequency.value = 10; // Speed
        modGain.gain.value = params.modulation; // Depth
        modOsc.connect(modGain);
        modGain.connect(osc.frequency);
        modOsc.start();
        modOsc.stop(audioCtx.currentTime + params.duration);
    }

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (freqOverride ? 0.3 : params.duration));

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (freqOverride ? 0.3 : params.duration));
  };

  // Visualizer Loop
  useEffect(() => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      
      let frameId: number;
      const render = () => {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 300, 150);
          
          ctx.beginPath();
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 3;
          
          const width = 300;
          const height = 150;
          const centerY = height / 2;
          
          for (let x = 0; x < width; x++) {
              const t = x / width; // 0 to 1 time progress
              // Simulate waveform logic based on params
              const freq = params.frequency + (params.slide * t);
              const amp = 1 - Math.pow(t, 2); // Decay
              
              let y = centerY;
              const waveT = x * freq * 0.0005;
              
              if (params.type === 'sine') y += Math.sin(waveT) * 50 * amp;
              if (params.type === 'square') y += (Math.sin(waveT) > 0 ? 50 : -50) * amp;
              if (params.type === 'sawtooth') y += ((waveT % 1) * 100 - 50) * amp;
              if (params.type === 'triangle') y += (Math.abs((waveT % 1) * 2 - 1) * 100 - 50) * amp;
              
              if (params.modulation > 0) {
                  y += Math.sin(x * 0.2) * (params.modulation * 0.5) * amp;
              }

              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
          }
          ctx.stroke();
          
          frameId = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(frameId);
  }, [params]);

  const PIANO_KEYS = [
      { note: 'C', freq: 261.63, color: 'white' },
      { note: 'C#', freq: 277.18, color: 'black' },
      { note: 'D', freq: 293.66, color: 'white' },
      { note: 'D#', freq: 311.13, color: 'black' },
      { note: 'E', freq: 329.63, color: 'white' },
      { note: 'F', freq: 349.23, color: 'white' },
      { note: 'F#', freq: 369.99, color: 'black' },
      { note: 'G', freq: 392.00, color: 'white' },
      { note: 'G#', freq: 415.30, color: 'black' },
      { note: 'A', freq: 440.00, color: 'white' },
      { note: 'A#', freq: 466.16, color: 'black' },
      { note: 'B', freq: 493.88, color: 'white' },
      { note: 'C2', freq: 523.25, color: 'white' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
         <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Music size={24} /></div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">Sound Studio</h3>
                    <p className="text-xs text-slate-400">Design retro 8-bit effects</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
         </div>

         {/* Visualizer */}
         <div className="rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner shrink-0">
             <canvas ref={canvasRef} width={300} height={150} className="w-full h-32 bg-slate-800" />
         </div>

         <div className="space-y-4">
             {/* Wave Type */}
             <div className="flex gap-2">
                 {['square', 'sawtooth', 'triangle', 'sine'].map(t => (
                     <button 
                        key={t}
                        onClick={() => setParams(p => ({ ...p, type: t as any }))}
                        className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border-2 transition-all ${params.type === t ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-500 hover:border-pink-200'}`}
                     >
                         {t}
                     </button>
                 ))}
             </div>

             {/* Sliders */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Frequency (Pitch)</label>
                     <input type="range" min="100" max="1000" value={params.frequency} onChange={(e) => setParams(p => ({...p, frequency: Number(e.target.value)}))} className="w-full h-2 bg-slate-200 rounded-lg accent-pink-500" />
                 </div>
                 <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Duration (Length)</label>
                     <input type="range" min="0.1" max="1.0" step="0.1" value={params.duration} onChange={(e) => setParams(p => ({...p, duration: Number(e.target.value)}))} className="w-full h-2 bg-slate-200 rounded-lg accent-pink-500" />
                 </div>
                 <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Slide (Laser Effect)</label>
                     <input type="range" min="-500" max="500" value={params.slide} onChange={(e) => setParams(p => ({...p, slide: Number(e.target.value)}))} className="w-full h-2 bg-slate-200 rounded-lg accent-pink-500" />
                 </div>
                 <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Wobble (Modulation)</label>
                     <input type="range" min="0" max="50" value={params.modulation} onChange={(e) => setParams(p => ({...p, modulation: Number(e.target.value)}))} className="w-full h-2 bg-slate-200 rounded-lg accent-pink-500" />
                 </div>
             </div>
         </div>

         {/* Piano Keyboard */}
         <div className="h-24 relative flex border-t-4 border-slate-800 bg-slate-800 rounded-b-xl overflow-hidden shadow-inner">
            {PIANO_KEYS.map((k, i) => {
                const isBlack = k.color === 'black';
                const leftPos = i * (100 / PIANO_KEYS.length);
                
                // Adjust black keys visual position
                if (isBlack) return null;

                // Render White Keys
                return (
                    <button 
                        key={k.note}
                        onClick={() => { setParams(p => ({...p, frequency: k.freq})); playSound(k.freq); }}
                        className="flex-1 bg-white border-l border-slate-300 rounded-b active:bg-slate-200 active:h-[95%] h-full relative z-10"
                    >
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">{k.note}</span>
                    </button>
                )
            })}
            
            {/* Render Black Keys Absolute */}
            <div className="absolute top-0 left-0 right-0 h-16 flex pointer-events-none z-20 pl-[4%]">
                 {PIANO_KEYS.map((k, i) => {
                     if (k.color !== 'black') {
                         return <div key={i} style={{ flex: 1 }} className="invisible" />;
                     }
                     return (
                         <div key={k.note} style={{ flex: 1 }} className="flex justify-center pointer-events-auto">
                             <button 
                                onClick={() => { setParams(p => ({...p, frequency: k.freq})); playSound(k.freq); }}
                                className="w-[80%] h-full bg-slate-900 border-x border-b border-black rounded-b active:bg-black active:h-[90%] pointer-events-auto" 
                             />
                         </div>
                     );
                 })}
            </div>
         </div>

         <div className="flex gap-3 pt-2">
             <button onClick={() => playSound()} className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2">
                 <Play size={18} fill="currentColor" /> Play Effect
             </button>
             <button onClick={() => alert("Sound saved! Use 'Play Tone' block with frequency " + params.frequency)} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all">
                 <Save size={18} />
             </button>
         </div>
      </div>
    </div>
  );
};

export default SoundEditor;
