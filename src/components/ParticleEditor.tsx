
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, X, Play, Settings2 } from 'lucide-react';

const ParticleEditor: React.FC = () => {
  const { showParticleEditor, setShowParticleEditor, particleSettings, setParticleSettings } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);

  useEffect(() => {
    if (!showParticleEditor || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    let raf: number;

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, 300, 300);
      
      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.current.splice(i, 1);
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [showParticleEditor]);

  const triggerPreview = () => {
    const { color, speed, size, count } = particleSettings;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: 150,
        y: 150,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * size + 1,
        color,
        life: 1.0
      });
    }
  };

  if (!showParticleEditor) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-orange-500 overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Preview Side */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-8 flex flex-col items-center justify-center relative">
          <canvas ref={canvasRef} width={300} height={300} className="bg-white dark:bg-slate-900 rounded-3xl shadow-inner border-2 border-slate-200 dark:border-slate-800" />
          <button onClick={triggerPreview} className="mt-6 flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95">
            <Play size={20} fill="currentColor" /> TEST EFFECT
          </button>
          <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-widest">
            <Sparkles size={16} /> Live Preview
          </div>
        </div>

        {/* Controls Side */}
        <div className="w-full md:w-80 bg-white dark:bg-slate-900 p-8 border-l border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Settings2 size={24} className="text-orange-500" /> FX STUDIO
            </h3>
            <button onClick={() => setShowParticleEditor(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Particle Color</label>
              <input type="color" value={particleSettings.color} onChange={(e) => setParticleSettings({ color: e.target.value })} className="w-full h-12 rounded-xl cursor-pointer bg-transparent" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Explosion Speed ({particleSettings.speed})</label>
              <input type="range" min="1" max="20" value={particleSettings.speed} onChange={(e) => setParticleSettings({ speed: parseInt(e.target.value) })} className="w-full accent-orange-500" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Particle Size ({particleSettings.size})</label>
              <input type="range" min="1" max="15" value={particleSettings.size} onChange={(e) => setParticleSettings({ size: parseInt(e.target.value) })} className="w-full accent-orange-500" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Quantity ({particleSettings.count})</label>
              <input type="range" min="5" max="100" value={particleSettings.count} onChange={(e) => setParticleSettings({ count: parseInt(e.target.value) })} className="w-full accent-orange-500" />
            </div>
          </div>

          <button onClick={() => setShowParticleEditor(false)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-colors">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticleEditor;
