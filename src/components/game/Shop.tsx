import React, { useState } from 'react';
import { Coins, ShoppingCart, X, Star, Shield, Swords, Heart } from 'lucide-react';
import { ShopItem } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ShopProps {
  gold: number;
  items: ShopItem[];
  inventory: { id: string; name: string; icon: string; quantity: number }[];
  onBuy: (itemId: string, price: number) => void;
  onSell: (itemId: string, price: number) => void;
  onClose: () => void;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'health_potion', name: 'Health Potion', icon: '🧪', price: 15, description: 'Restores 30 HP', type: 'consumable', effect: { type: 'heal', value: 30 } },
  { id: 'large_potion', name: 'Large Potion', icon: '🧪', price: 35, description: 'Restores 60 HP', type: 'consumable', effect: { type: 'heal', value: 60 } },
  { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', price: 50, description: '+5 ATK', type: 'weapon', stats: { strength: 5 } },
  { id: 'steel_sword', name: 'Steel Sword', icon: '⚔️', price: 120, description: '+12 ATK', type: 'weapon', stats: { strength: 12 } },
  { id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️', price: 40, description: '+3 DEF', type: 'armor', stats: { defense: 3 } },
  { id: 'iron_shield', name: 'Iron Shield', icon: '🛡️', price: 100, description: '+8 DEF', type: 'armor', stats: { defense: 8 } },
  { id: 'speed_boots', name: 'Speed Boots', icon: '👟', price: 80, description: '+5 SPD', type: 'armor', stats: { speed: 5 } },
  { id: 'bread', name: 'Bread', icon: '🍞', price: 5, description: 'Restores 10 HP', type: 'consumable', effect: { type: 'heal', value: 10 } },
  { id: 'antidote', name: 'Antidote', icon: '💊', price: 20, description: 'Cures poison', type: 'consumable', effect: { type: 'cure_poison', value: 0 } },
  { id: 'bomb', name: 'Bomb', icon: '💣', price: 30, description: 'Deals 50 damage', type: 'consumable', effect: { type: 'damage', value: 50 } },
];

export const Shop: React.FC<ShopProps> = ({ gold, items, inventory, onBuy, onSell, onClose }) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const allItems = items.length > 0 ? items : SHOP_ITEMS;
  const selected = allItems.find(i => i.id === selectedItem);

  const getSellPrice = (item: { id: string; name: string; quantity: number }) => {
    const shopItem = allItems.find(i => i.id === item.id);
    return shopItem ? Math.floor(shopItem.price * 0.5) : 5;
  };

  return (
    <Modal open={true} onClose={onClose} title="Shop" size="lg">
      <div className="flex gap-4 h-[400px]">
        {/* Left: Items */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab Bar */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('buy')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === 'buy'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <ShoppingCart size={14} className="inline mr-1" /> Buy
            </button>
            <button
              onClick={() => setTab('sell')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === 'sell'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Coins size={14} className="inline mr-1" /> Sell
            </button>
          </div>

          {/* Gold Display */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <Coins size={18} className="text-yellow-500" />
            <span className="font-bold text-yellow-700">Gold</span>
          </div>

          {tab === 'buy' ? (
            <div className="grid grid-cols-2 gap-2">
              {allItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedItem === item.id
                      ? 'bg-emerald-100 border-2 border-emerald-400'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins size={12} className="text-yellow-500" />
                    <span className="text-xs font-bold text-yellow-600">{item.price}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {inventory.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedItem === item.id
                      ? 'bg-amber-100 border-2 border-amber-400'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins size={12} className="text-yellow-500" />
                    <span className="text-xs font-bold text-yellow-600">{getSellPrice(item)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Item Detail */}
        {selected ? (
          <div className="w-56 border-l border-slate-200 pl-4 space-y-4">
            <div className="text-center">
              <span className="text-5xl">{selected.icon}</span>
              <h3 className="font-bold text-slate-800 mt-2">{selected.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{selected.description}</p>
            </div>

            {selected.stats && (
              <div className="space-y-1">
                {Object.entries(selected.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 capitalize">{stat}</span>
                    <span className="font-bold text-emerald-500">+{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 py-2 bg-yellow-50 rounded-lg">
              <Coins size={16} className="text-yellow-500" />
              <span className="font-bold text-yellow-700">
                {tab === 'buy' ? selected.price : getSellPrice(inventory.find(i => i.id === selected.id) || { id: '', name: '', quantity: 1 })}
              </span>
            </div>

            {tab === 'buy' ? (
              <Button
                variant="primary"
                onClick={() => { onBuy(selected.id, selected.price); setSelectedItem(null); }}
                disabled={gold < selected.price}
                className="w-full"
              >
                Buy
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => { onSell(selected.id, getSellPrice(inventory.find(i => i.id === selected.id)!)); setSelectedItem(null); }}
                className="w-full text-amber-600 border border-amber-300"
              >
                Sell
              </Button>
            )}
          </div>
        ) : (
          <div className="w-56 border-l border-slate-200 pl-4 flex items-center justify-center text-slate-400">
            <p className="text-sm">Select an item</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Shop;
