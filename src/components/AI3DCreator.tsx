
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateVoxelsFromPrompt, Voxel } from '../services/voxelService';
import { X, Box, Sparkles, Loader2, Check } from 'lucide-react';

const AI3DCreator: React.FC<{ onClose: () => void, onAssetGenerated: (voxels: Voxel[]) => void }> = ({ onClose, onAssetGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<Voxel[] | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const result = await generateVoxelsFromPrompt(prompt);
    setPreview(result);
    setIsGenerating(false);
  };

  const handleImport = () => {
    if (preview) {
        onAssetGenerated(preview);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border-4 border-cyan-500 overflow-hidden flex flex-col">
        
        <div className="p-6 bg-cyan-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Box size={28} fill="currentColor" />
                <h2 className="text-2xl font-black tracking-tight">AI 3D BUILDER</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
            <div className="relative">
                <input 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe a 3D world (e.g. 'Ice Castle')"
                    className="w-full pl-4 pr-12 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-cyan-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute right-2 top-2 p-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-400 text-white rounded-xl transition-all shadow-md"
                >
                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} fill="currentColor" />}
                </button>
            </div>

            {preview && (
                <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Preview Stats</p>
                    <div className="flex gap-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span>🧊 {preview.length} Voxels</span>
                        <span>🎨 Theme: {prompt}</span>
                    </div>
                </div>
            )}

            {preview && (
                <button 
                    onClick={handleImport}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Check size={20} /> IMPORT TO WORLD
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AI3DCreator;
