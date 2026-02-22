
import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { 
  X, Upload, Image as ImageIcon, Box, Trash2, 
  Plus, Search, Check, Sparkles 
} from 'lucide-react';
import { playSoundEffect } from '../services/soundService';

const AssetManagerModal: React.FC = () => {
  const { 
    showAssetManager, 
    setShowAssetManager, 
    assets, 
    addAsset, 
    updateSpriteState,
    darkMode 
  } = useStore();
  
  const [filter, setFilter] = useState<'all' | 'image' | 'model'>('all');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showAssetManager) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const type = file.name.endsWith('.glb') || file.name.endsWith('.gltf') ? 'model' : 'image';
      
      addAsset({
        name: file.name,
        type: type,
        url: url
      });
      playSoundEffect('powerup');
    };
    reader.readAsDataURL(file);
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.type === filter;
    return matchesSearch && matchesFilter;
  });

  const selectAsset = (asset: typeof assets[0]) => {
      if (asset.type === 'image') {
          updateSpriteState({ texture: asset.url, emoji: '' });
      }
      setShowAssetManager(false);
      playSoundEffect('click');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-violet-500 overflow-hidden flex flex-col h-[700px] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-violet-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={32} fill="currentColor" />
            <div>
              <h2 className="text-3xl font-black tracking-tight">ASSET MANAGER</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Import your own world!</p>
            </div>
          </div>
          <button onClick={() => setShowAssetManager(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your assets..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-violet-400"
                />
            </div>
            
            <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === 'all' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-500'}`}>All</button>
                <button onClick={() => setFilter('image')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === 'image' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-500'}`}>Images</button>
                <button onClick={() => setFilter('model')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === 'model' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-500'}`}>3D Models</button>
            </div>

            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            >
                <Upload size={20} /> IMPORT FILE
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.glb,.gltf" onChange={handleFileUpload} />
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar">
            {filteredAssets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <ImageIcon size={80} className="mb-4" />
                    <p className="text-xl font-bold italic text-center px-8">Your asset library is empty. Import some cool PNGs or 3D models to start!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredAssets.map((asset) => (
                        <div 
                            key={asset.id} 
                            onClick={() => selectAsset(asset)}
                            className="group relative bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-violet-500 hover:shadow-xl transition-all"
                        >
                            {/* Preview */}
                            <div className="aspect-square flex items-center justify-center p-4 bg-white dark:bg-slate-900">
                                {asset.type === 'image' ? (
                                    <img src={asset.url} className="max-w-full max-h-full object-contain drop-shadow-md" alt={asset.name} />
                                ) : (
                                    <Box size={48} className="text-violet-400" />
                                )}
                            </div>
                            
                            {/* Label */}
                            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{asset.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.type}</p>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="bg-white text-violet-600 px-4 py-1 rounded-full font-black text-[10px] shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform">
                                    USE ASSET
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 px-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Box size={14} /> Total Assets: {assets.length}
            </p>
            <p className="text-[10px] font-black text-violet-500 italic">PRO TIP: Use transparent PNGs for better game characters!</p>
        </div>
      </div>
    </div>
  );
};

export default AssetManagerModal;
