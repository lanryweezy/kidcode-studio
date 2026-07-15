import React, { useState } from 'react';
import { Plus, Trash2, Sword, Shield, Heart, Coins, Star, Key, Gem } from 'lucide-react';
import { Button } from '../ui/Button';

interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  type: 'weapon' | 'armor' | 'consumable' | 'key' | 'material' | 'quest';
  description: string;
  stackable: boolean;
  maxStack: number;
  effect?: string;
}

interface InventoryBuilderProps {
  onSave: (items: InventoryItem[]) => void;
}

const ITEM_TYPES = [
  { type: 'weapon', label: 'Weapon', emoji: '⚔️' },
  { type: 'armor', label: 'Armor', emoji: '🛡️' },
  { type: 'consumable', label: 'Consumable', emoji: '🧪' },
  { type: 'key', label: 'Key Item', emoji: '🔑' },
  { type: 'material', label: 'Material', emoji: '💎' },
  { type: 'quest', label: 'Quest Item', emoji: '📜' },
];

const ITEM_EMOJIS = ['⚔️', '🛡️', '🧪', '🔑', '💎', '📜', '🍎', '🍖', '🍞', '🧪', '💊', '🧲', '🪄', '🎯', '🏹', '🪓', '🔨', '⚒️', '🧪', '💊'];

const EFFECTS = ['Heal HP', 'Restore Mana', 'Boost Speed', 'Increase Damage', 'Shield', 'Teleport', 'Invisibility', 'Double Jump'];

export const InventoryBuilder: React.FC<InventoryBuilderProps> = ({ onSave }) => {
  const [items, setItems] = useState<InventoryItem[]>([
    { id: 'item_1', name: 'Health Potion', emoji: '🧪', type: 'consumable', description: 'Restores 50 HP', stackable: true, maxStack: 10, effect: 'Heal HP' },
    { id: 'item_2', name: 'Iron Sword', emoji: '⚔️', type: 'weapon', description: 'Basic starter sword', stackable: false, maxStack: 1, effect: 'Increase Damage' },
    { id: 'item_3', name: 'Golden Key', emoji: '🔑', type: 'key', description: 'Opens the treasure chest', stackable: false, maxStack: 1 },
  ]);
  const [selectedItem, setSelectedItem] = useState<string>('item_1');

  const addItem = () => {
    const newId = `item_${items.length + 1}`;
    const newItem: InventoryItem = {
      id: newId,
      name: 'New Item',
      emoji: '📦',
      type: 'material',
      description: '',
      stackable: true,
      maxStack: 5,
    };
    setItems([...items, newItem]);
    setSelectedItem(newId);
  };

  const deleteItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
    if (selectedItem === id) setSelectedItem(items[0].id);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const selected = items.find(i => i.id === selectedItem);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Items</div>
        <Button variant="ghost" size="xs" icon={<Plus size={12} />} onClick={addItem}>Add</Button>
      </div>

      {/* Item List */}
      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item.id)}
            className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
              selectedItem === item.id
                ? 'bg-violet-100 border border-violet-300'
                : 'bg-slate-50 border border-transparent hover:border-slate-200'
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-700 truncate">{item.name}</div>
              <div className="text-[10px] text-slate-400">{ITEM_TYPES.find(t => t.type === item.type)?.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Item Editor */}
      {selected && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          {/* Emoji + Name */}
          <div className="flex gap-2">
            <div className="flex flex-wrap gap-1">
              {ITEM_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => updateItem(selected.id, { emoji })}
                  className={`text-lg p-1 rounded ${selected.emoji === emoji ? 'bg-violet-100 border border-violet-300 scale-110' : 'hover:bg-slate-200'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={selected.name}
            onChange={(e) => updateItem(selected.id, { name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold"
            placeholder="Item name"
          />

          {/* Type */}
          <div className="flex flex-wrap gap-1">
            {ITEM_TYPES.map(t => (
              <button
                key={t.type}
                onClick={() => updateItem(selected.id, { type: t.type as any })}
                className={`px-2 py-1 rounded text-xs font-bold ${
                  selected.type === t.type
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <textarea
            value={selected.description}
            onChange={(e) => updateItem(selected.id, { description: e.target.value })}
            placeholder="What does this item do?"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs resize-none h-16"
          />

          {/* Stackable */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Stackable</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.stackable}
                onChange={(e) => updateItem(selected.id, { stackable: e.target.checked })}
                className="rounded"
              />
              {selected.stackable && (
                <input
                  type="number"
                  value={selected.maxStack}
                  onChange={(e) => updateItem(selected.id, { maxStack: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={99}
                  className="w-14 px-2 py-1 text-xs rounded border border-slate-200 bg-white text-center"
                />
              )}
            </div>
          </div>

          {/* Effect */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Effect</label>
            <select
              value={selected.effect || ''}
              onChange={(e) => updateItem(selected.id, { effect: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
            >
              <option value="">No effect</option>
              {EFFECTS.map(effect => (
                <option key={effect} value={effect}>{effect}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => deleteItem(selected.id)} className="text-red-500">Delete</Button>
          </div>
        </div>
      )}

      <Button variant="primary" fullWidth onClick={() => onSave(items)}>Save Inventory</Button>
    </div>
  );
};
