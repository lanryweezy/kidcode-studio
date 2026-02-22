
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Scissors, Grid, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { playSoundEffect } from '../services/soundService';

const SpriteExtractor: React.FC<{ onSpriteExtracted: (frames: string[]) => void, onClose: () => void }> = ({ onSpriteExtracted, onClose }) => {
  const { updateSpriteState } = useStore();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [gridSize, setGridSize] = useState({ w: 32, h: 32 });
  const [frames, setFrames] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
      updateSpriteState({ frames: frames });
      onSpriteExtracted(frames);
      onClose();
      playSoundEffect('click');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-cyan-500 overflow-hidden flex flex-col h-[700px]">
        
        {/* Header */}
        <div className="p-6 bg-cyan-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scissors size={32} fill="currentColor" />
            <div>
              <h2 className="text-3xl font-black tracking-tight">SPRITE SLICER</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Turn sheets into animations!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Controls */}
            <div className="w-64 bg-slate-50 dark:bg-slate-950/50 p-6 border-r border-slate-200 dark:border-slate-800 flex flex-col gap-6">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-cyan-500 hover:text-cyan-500 transition-colors group"
                >
                    <Upload size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase">Upload Sheet</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                {image && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase block mb-2">Grid Width</label>
                            <input 
                                type="number" 
                                value={gridSize.w} 
                                onChange={(e) => setGridSize({ ...gridSize, w: Number(e.target.value) })}
                                className="w-full p-2 rounded-lg bg-slate-200 dark:bg-slate-800 outline-none font-mono text-center"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase block mb-2">Grid Height</label>
                            <input 
                                type="number" 
                                value={gridSize.h} 
                                onChange={(e) => setGridSize({ ...gridSize, h: Number(e.target.value) })}
                                className="w-full p-2 rounded-lg bg-slate-200 dark:bg-slate-800 outline-none font-mono text-center"
                            />
                        </div>
                        <button 
                            onClick={sliceFrames}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                            <Grid size={18} /> SLICE IT!
                        </button>
                    </div>
                )}
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-8 flex flex-col items-center justify-center overflow-hidden relative">
                {!image ? (
                    <div className="text-slate-400 flex flex-col items-center gap-4">
                        <ImageIcon size={64} className="opacity-20" />
                        <p className="font-bold">Upload a sprite sheet to start</p>
                    </div>
                ) : (
                    <div className="relative max-w-full max-h-full overflow-auto border-2 border-slate-300 dark:border-slate-700 rounded-lg shadow-inner bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAjyQc6WCgAsh8AMvpKD7dM19DAAAAAElFTkSuQmCC')]">
                        <canvas 
                            ref={canvasRef} 
                            width={image.width} 
                            height={image.height} 
                            style={{ width: image.width, height: image.height }}
                        />
                        {/* Grid Overlay */}
                        <div 
                            className="absolute inset-0 pointer-events-none" 
                            style={{ 
                                backgroundImage: `linear-gradient(to right, rgba(0, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 255, 0.5) 1px, transparent 1px)`,
                                backgroundSize: `${gridSize.w}px ${gridSize.h}px`
                            }} 
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Frames Output */}
        {frames.length > 0 && (
            <div className="h-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 flex gap-4 overflow-x-auto items-center">
                {frames.map((frame, i) => (
                    <div key={i} className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 p-1 flex items-center justify-center">
                        <img src={frame} className="max-w-full max-h-full object-contain" />
                    </div>
                ))}
                <div className="w-px h-12 bg-slate-300 dark:bg-slate-700 mx-2" />
                <button 
                    onClick={handleSave}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg flex items-center gap-2 shrink-0"
                >
                    <Check size={20} /> SAVE FRAMES
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SpriteExtractor;
