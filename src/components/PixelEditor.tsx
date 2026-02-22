
import React, { useState, useEffect, useRef } from 'react';
import { X, Eraser, Check, PaintBucket, Pencil, RotateCcw, Plus, Trash2, Copy, Play, Pause, Layers } from 'lucide-react';

interface PixelEditorProps {
  initialTexture?: string | null;
  onSave: (textureData: string, frames?: string[]) => void;
  onClose: () => void;
}

const GRID_SIZE = 12;

const PixelEditor: React.FC<PixelEditorProps> = ({ initialTexture, onSave, onClose }) => {
  const [frames, setFrames] = useState<string[]>(initialTexture ? [initialTexture] : [createEmptyFrame()]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  
  const [pixels, setPixels] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill('transparent'));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill'>('pencil');
  const [isPlaying, setIsPlaying] = useState(false);
  const [onionSkin, setOnionSkin] = useState(false);
  
  useEffect(() => {
      loadFramePixels(frames[currentFrameIdx]);
  }, [currentFrameIdx]);

  useEffect(() => {
      if (!isPlaying) return;
      const interval = setInterval(() => {
          setCurrentFrameIdx(prev => (prev + 1) % frames.length);
      }, 200);
      return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  function createEmptyFrame() {
      const canvas = document.createElement('canvas');
      canvas.width = GRID_SIZE * 10;
      canvas.height = GRID_SIZE * 10;
      return canvas.toDataURL();
  }

  const loadFramePixels = (dataUrl: string) => {
      if (!dataUrl) {
          setPixels(Array(GRID_SIZE * GRID_SIZE).fill('transparent'));
          return;
      }
      const img = new Image();
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = GRID_SIZE * 10;
          canvas.height = GRID_SIZE * 10;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          
          const newPixels = [];
          for(let y=0; y<GRID_SIZE; y++) {
              for(let x=0; x<GRID_SIZE; x++) {
                  const p = ctx.getImageData(x*10 + 5, y*10 + 5, 1, 1).data;
                  if (p[3] === 0) newPixels.push('transparent');
                  else {
                      const hex = "#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1);
                      newPixels.push(hex);
                  }
              }
          }
          setPixels(newPixels);
      };
      img.src = dataUrl;
  };

  const saveCurrentFrameToState = () => {
      const canvas = document.createElement('canvas');
      canvas.width = GRID_SIZE * 10;
      canvas.height = GRID_SIZE * 10;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      pixels.forEach((color, i) => {
        if (color === 'transparent') return;
        const x = (i % GRID_SIZE) * 10;
        const y = Math.floor(i / GRID_SIZE) * 10;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 10, 10);
      });
      
      const newUrl = canvas.toDataURL();
      setFrames(prev => {
          const next = [...prev];
          next[currentFrameIdx] = newUrl;
          return next;
      });
  };

  useEffect(() => {
      const timer = setTimeout(saveCurrentFrameToState, 100);
      return () => clearTimeout(timer);
  }, [pixels]);

  const PALETTE = [
    '#000000', '#ffffff', '#94a3b8', '#475569',
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const handlePixelClick = (index: number) => {
    if (tool === 'fill') {
      const targetColor = pixels[index];
      if (targetColor === selectedColor) return;
      
      const newPixels = [...pixels];
      const stack = [index];
      
      while (stack.length > 0) {
        const i = stack.pop()!;
        if (newPixels[i] !== targetColor) continue;
        
        newPixels[i] = selectedColor;
        
        const x = i % GRID_SIZE;
        const y = Math.floor(i / GRID_SIZE);
        
        if (x > 0) stack.push(i - 1);
        if (x < GRID_SIZE - 1) stack.push(i + 1);
        if (y > 0) stack.push(i - GRID_SIZE);
        if (y < GRID_SIZE - 1) stack.push(i + GRID_SIZE);
      }
      setPixels(newPixels);
    } else {
      const newPixels = [...pixels];
      newPixels[index] = tool === 'eraser' ? 'transparent' : selectedColor;
      setPixels(newPixels);
    }
  };

  const handleSaveAll = () => {
    onSave(frames[0], frames);
    onClose();
  };

  const addNewFrame = () => {
      setFrames([...frames, createEmptyFrame()]);
      setCurrentFrameIdx(frames.length);
  };

  const duplicateFrame = () => {
      const current = frames[currentFrameIdx];
      const newFrames = [...frames];
      newFrames.splice(currentFrameIdx + 1, 0, current);
      setFrames(newFrames);
      setCurrentFrameIdx(currentFrameIdx + 1);
  };

  const deleteFrame = () => {
      if (frames.length <= 1) return;
      const newFrames = frames.filter((_, i) => i !== currentFrameIdx);
      setFrames(newFrames);
      setCurrentFrameIdx(Math.max(0, currentFrameIdx - 1));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-lg flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">Sprite Animator</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
         </div>

         <div className="flex gap-2 justify-center mb-2">
            <button onClick={() => setTool('pencil')} className={`p-2 rounded-lg ${tool === 'pencil' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:bg-slate-50'}`} title="Pencil"><Pencil size={20} /></button>
            <button onClick={() => setTool('fill')} className={`p-2 rounded-lg ${tool === 'fill' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:bg-slate-50'}`} title="Fill"><PaintBucket size={20} /></button>
            <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:bg-slate-50'}`} title="Eraser"><Eraser size={20} /></button>
            <div className="w-px bg-slate-200 mx-2" />
            <button onClick={() => setOnionSkin(!onionSkin)} className={`p-2 rounded-lg ${onionSkin ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`} title="Onion Skin"><Layers size={20} /></button>
            <button onClick={() => setPixels(Array(GRID_SIZE*GRID_SIZE).fill('transparent'))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Clear"><RotateCcw size={20} /></button>
         </div>

         <div className="flex gap-4 items-start">
             <div className="self-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] bg-repeat border-2 border-slate-300 shadow-inner relative">
                <div className="grid grid-cols-12 gap-0 w-[240px] h-[240px] relative z-10">
                   {pixels.map((color, i) => (
                     <div 
                        key={i} 
                        onMouseDown={() => handlePixelClick(i)}
                        onMouseEnter={(e) => { if (e.buttons === 1) handlePixelClick(i); }}
                        className="w-5 h-5 cursor-crosshair hover:opacity-80 transition-opacity border-[0.5px] border-black/5"
                        style={{ backgroundColor: color }}
                     />
                   ))}
                </div>
                
                {/* Onion Skin Layer */}
                {onionSkin && currentFrameIdx > 0 && (
                    <img 
                        src={frames[currentFrameIdx - 1]} 
                        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none z-0 filter grayscale" 
                    />
                )}
             </div>

             <div className="flex flex-col gap-4 flex-1">
                 <div className="border border-slate-200 rounded-lg p-2 flex flex-col items-center gap-2 bg-slate-50">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Preview</span>
                     <img src={frames[currentFrameIdx]} className="w-16 h-16 object-contain pixelated bg-white border border-slate-200 rounded" />
                     <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-1 rounded-full ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                     >
                         {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                     </button>
                 </div>

                 <div className="grid grid-cols-5 gap-1.5">
                    {PALETTE.map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 rounded-full border-2 ${selectedColor === c ? 'border-violet-500 scale-110 shadow-md' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                 </div>
             </div>
         </div>

         <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-100 rounded-xl custom-scrollbar">
             {frames.map((frame, idx) => (
                 <div 
                    key={idx} 
                    onClick={() => setCurrentFrameIdx(idx)}
                    className={`relative shrink-0 w-12 h-12 border-2 rounded-lg cursor-pointer bg-white overflow-hidden hover:scale-105 transition-all ${idx === currentFrameIdx ? 'border-violet-500 ring-2 ring-violet-200' : 'border-slate-300'}`}
                 >
                     <img src={frame} className="w-full h-full object-contain pixelated" />
                     <div className="absolute bottom-0 right-0 bg-slate-800 text-white text-[8px] px-1 rounded-tl">{idx + 1}</div>
                 </div>
             ))}
             <button onClick={addNewFrame} className="shrink-0 w-12 h-12 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-violet-500 hover:border-violet-300 hover:bg-violet-50 transition-all">
                 <Plus size={20} />
             </button>
         </div>

         <div className="flex gap-2">
             <button onClick={duplicateFrame} className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-xs flex items-center justify-center gap-2">
                 <Copy size={14} /> Duplicate Frame
             </button>
             <button onClick={deleteFrame} disabled={frames.length <= 1} className="flex-1 py-2 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 text-xs flex items-center justify-center gap-2">
                 <Trash2 size={14} /> Delete Frame
             </button>
         </div>

         <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
             <button onClick={handleSaveAll} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2">
                 <Check size={18} /> Save Sprite
             </button>
         </div>
      </div>
    </div>
  );
};

export default PixelEditor;
