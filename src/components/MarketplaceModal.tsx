
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  X, ShoppingBag, Zap, Sparkles, Star,
  Search, Check, Box, Palette, Music, Coins
} from 'lucide-react';
import { playSoundEffect } from '../services/soundService';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  category: '3d' | 'effect' | 'code' | 'sound';
  preview: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'item_1', name: 'Cyber Dragon', description: 'A futuristic 3D dragon model with fire animations.', price: 50, icon: Box, category: '3d', preview: '🐉' },
  { id: 'item_2', name: 'Magic Portal FX', description: 'Glowy particle effects for teleporting characters.', price: 30, icon: Sparkles, category: 'effect', preview: '🌀' },
  { id: 'item_3', name: 'AI Battle Logic', description: 'A pro coding block for smart enemy AI.', price: 100, icon: Zap, category: 'code', preview: '🧠' },
  { id: 'item_4', name: 'Synthwave Beats', description: 'Looping background music for your space levels.', price: 40, icon: Music, category: 'sound', preview: '🎵' },
  { id: 'item_5', name: 'Golden Armor', description: 'A special shiny texture for your player sprite.', price: 20, icon: Palette, category: 'effect', preview: '✨' },
];

const MarketplaceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userProfile, spendCoins, addAsset } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | '3d' | 'effect' | 'code' | 'sound'>('all');

  const handleBuy = (item: ShopItem) => {
    if (spendCoins(item.price)) {
      playSoundEffect('powerup');
      // In a real app, we'd add the actual asset. For now, simulate:
      addAsset({
        name: item.name,
        type: item.category === '3d' ? 'model' : 'image',
        url: item.preview // Mock URL
      });
      alert(`Awesome! You unlocked the ${item.name}!`);
    } else {
      playSoundEffect('hurt');
      alert("Oh no! You don't have enough KidCoins. Build more games to earn some!");
    }
  };

  const filtered = SHOP_ITEMS.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || i.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col h-[700px]">

        {/* Header */}
        <div className="p-6 bg-amber-400 text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={32} fill="currentColor" />
            <div>
              <h2 className="text-3xl font-black tracking-tight">KIDCODE MARKETPLACE</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Spend your hard-earned KidCoins!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full font-black">
              <Coins size={20} className="text-yellow-600" />
              <span>{userProfile.coins}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for cool stuff..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none"
            />
          </div>

          <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            {['all', '3d', 'effect', 'code', 'sound'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === f ? 'bg-amber-400 text-slate-900 shadow-md' : 'text-slate-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-950">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-6 flex flex-col shadow-sm hover:shadow-xl hover:border-amber-400 transition-all group">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {React.createElement(item.icon, { size: 32, className: "text-amber-500" })}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{item.name}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">{item.description}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 font-black text-amber-600">
                    <Coins size={16} />
                    <span>{item.price}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl text-xs hover:bg-amber-400 hover:text-slate-900 transition-all active:scale-95"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Star size={12} fill="currentColor" className="text-amber-400" /> New items added every Saturday! <Star size={12} fill="currentColor" className="text-amber-400" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceModal;
