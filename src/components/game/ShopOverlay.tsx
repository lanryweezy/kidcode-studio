import React, { useState } from 'react';
import { Coins, ShoppingCart, X, Star, Package, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShopOverlayProps {
  gold: number;
  onBuy: (itemId: string, price: number) => void;
  onClose: () => void;
}

const SHOP_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'weapons', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡️' },
  { id: 'consumables', label: 'Consumables', icon: '🧪' },
  { id: 'materials', label: 'Materials', icon: '💎' },
];

const SHOP_INVENTORY = [
  { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', price: 50, category: 'weapons', description: '+12 ATK', effect: '+12 ATK', rarity: 'common' },
  { id: 'steel_sword', name: 'Steel Sword', icon: '⚔️', price: 120, category: 'weapons', description: '+18 ATK', effect: '+18 ATK', rarity: 'rare' },
  { id: 'fire_sword', name: 'Fire Sword', icon: '🔥', price: 200, category: 'weapons', description: '+25 ATK, Fire element', effect: '+25 ATK', rarity: 'epic' },
  { id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️', price: 40, category: 'armor', description: '+3 DEF', effect: '+3 DEF', rarity: 'common' },
  { id: 'iron_shield', name: 'Iron Shield', icon: '🛡️', price: 100, category: 'armor', description: '+8 DEF', effect: '+8 DEF', rarity: 'rare' },
  { id: 'speed_boots', name: 'Speed Boots', icon: '👟', price: 80, category: 'armor', description: '+5 SPD', effect: '+5 SPD', rarity: 'common' },
  { id: 'health_potion', name: 'Health Potion', icon: '🧪', price: 15, category: 'consumables', description: 'Restores 30 HP', effect: 'Heal 30', rarity: 'common', stackable: true },
  { id: 'large_potion', name: 'Large Potion', icon: '🧪', price: 35, category: 'consumables', description: 'Restores 60 HP', effect: 'Heal 60', rarity: 'common', stackable: true },
  { id: 'antidote', name: 'Antidote', icon: '💊', price: 20, category: 'consumables', description: 'Cures poison', effect: 'Cure poison', rarity: 'common', stackable: true },
  { id: 'iron_ore', name: 'Iron Ore', icon: '🪨', price: 10, category: 'materials', description: 'Crafting material', effect: '', rarity: 'common', stackable: true },
  { id: 'herb', name: 'Herb', icon: '🌿', price: 5, category: 'materials', description: 'Crafting material', effect: '', rarity: 'common', stackable: true },
  { id: 'gem', name: 'Gem', icon: '💎', price: 50, category: 'materials', description: 'Rare crafting material', effect: '', rarity: 'rare', stackable: true },
];

const RARITY_COLORS: Record<string, string> = {
  common: 'border-slate-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const RARITY_BG: Record<string, string> = {
  common: '',
  rare: 'bg-blue-50/50',
  epic: 'bg-purple-50/50',
  legendary: 'bg-yellow-50/50',
};

export const ShopOverlay: React.FC<ShopOverlayProps> = ({
  gold, onBuy, onClose
}) => {
  const [category, setCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [buyAnimation, setBuyAnimation] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const filteredItems = category === 'all'
    ? SHOP_INVENTORY
    : SHOP_INVENTORY.filter(i => i.category === category);

  const selected = SHOP_INVENTORY.find(i => i.id === selectedItem);

  const handleBuy = (item: typeof SHOP_INVENTORY[0]) => {
    if (gold < item.price) {
      setPurchaseMessage('Not enough gold!');
      setTimeout(() => setPurchaseMessage(''), 2000);
      return;
    }

    setBuyAnimation(true);
    setTimeout(() => {
      onBuy(item.id, item.price);
      setBuyAnimation(false);
      setPurchaseMessage(`Bought ${item.name}!`);
      setTimeout(() => setPurchaseMessage(''), 2000);
    }, 300);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Shop">
      <div className="w-full max-w-[700px] mx-4 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto overflow-x-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500 to-yellow-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">General Store</div>
              <div className="text-[10px] text-white/70">Buy items for your adventure</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg">
              <Coins size={14} className="text-yellow-200" />
              <span className="text-sm font-bold text-white">{gold}</span>
            </div>
            <button onClick={onClose} className="p-1 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded" aria-label="Close shop">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Purchase Message */}
        {purchaseMessage && (
          <div className="px-5 py-2 bg-green-100 text-green-700 text-sm font-bold text-center animate-pulse">
            {purchaseMessage}
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-1 px-5 py-3 border-b border-slate-200" role="tablist" aria-label="Shop categories">
          {SHOP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSelectedItem(null); }}
              role="tab"
              aria-selected={category === cat.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                category === cat.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex h-[340px]">
          {/* Items Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  aria-label={`${item.name} - ${item.description} - ${item.price} gold`}
                  aria-pressed={selectedItem === item.id}
                  className={`p-3 rounded-xl text-left transition-all border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                    selectedItem === item.id
                      ? `${RARITY_COLORS[item.rarity]} ${RARITY_BG[item.rarity]} ring-2 ring-amber-400`
                      : `border-transparent hover:border-slate-200 ${RARITY_BG[item.rarity]}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Coins size={12} className="text-yellow-500" />
                    <span className={`text-xs font-bold ${gold >= item.price ? 'text-yellow-600' : 'text-red-500'}`}>
                      {item.price}
                    </span>
                    {item.stackable && (
                      <span className="text-[9px] text-slate-400 ml-auto">x10</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Item Detail */}
          {selected ? (
            <div className="w-56 border-l border-slate-200 p-6 space-y-3">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-4xl border-2 ${RARITY_COLORS[selected.rarity]} ${RARITY_BG[selected.rarity]}`}>
                  {selected.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{selected.name}</h3>
                <div className={`text-[10px] font-bold uppercase mt-1 ${
                  selected.rarity === 'common' ? 'text-slate-400' :
                  selected.rarity === 'rare' ? 'text-blue-500' :
                  selected.rarity === 'epic' ? 'text-purple-500' : 'text-yellow-500'
                }`}>
                  {selected.rarity}
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">{selected.description}</p>

              {selected.effect && (
                <div className="text-center px-3 py-1 bg-emerald-100 rounded-lg">
                  <span className="text-xs font-bold text-emerald-700">
                    {selected.effect}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-lg">
                <Coins size={16} className="text-yellow-500" />
                <span className="font-bold text-yellow-700">{selected.price} Gold</span>
              </div>

              <Button
                variant="primary"
                onClick={() => handleBuy(selected)}
                disabled={gold < selected.price}
                className="w-full bg-amber-500 hover:bg-amber-600"
                loading={buyAnimation}
              >
                <ShoppingCart size={14} className="inline mr-1" />
                Buy
              </Button>

              {gold < selected.price && (
                <div className="text-center text-[10px] text-red-500">
                  Need {selected.price - gold} more gold
                </div>
              )}
            </div>
          ) : (
            <div className="w-56 border-l border-slate-200 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Package size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Select an item</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopOverlay;
