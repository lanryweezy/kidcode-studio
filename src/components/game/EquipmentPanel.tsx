import React, { useState } from 'react';
import { Swords, Shield, Shirt, Gem, Plus, X, ArrowRightLeft, Info } from 'lucide-react';
import { InventoryItem, CharacterStats } from '../../types';
import { Equipment, EquipmentStats, getEquipmentStats } from '../../services/rpgSystemsExtended';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface EquipmentPanelProps {
  equipment: Equipment;
  inventory: InventoryItem[];
  stats: CharacterStats;
  onEquip: (item: InventoryItem, slot: keyof Equipment) => void;
  onUnequip: (slot: keyof Equipment) => void;
  onClose: () => void;
}

const SLOT_CONFIG: Record<keyof Equipment, { label: string; icon: React.ReactNode; color: string; borderColor: string }> = {
  weapon: { label: 'Weapon', icon: <Swords size={20} />, color: 'bg-red-100', borderColor: 'border-red-300' },
  armor: { label: 'Armor', icon: <Shirt size={20} />, color: 'bg-blue-100', borderColor: 'border-blue-300' },
  accessory: { label: 'Accessory', icon: <Gem size={20} />, color: 'bg-purple-100', borderColor: 'border-purple-300' },
  cosmetic: { label: 'Cosmetic', icon: <Shield size={20} />, color: 'bg-pink-100', borderColor: 'border-pink-300' },
};

const EQUIPABLE_ITEMS: Record<string, keyof Equipment> = {
  weapon: 'weapon',
  armor: 'armor',
  accessory: 'accessory',
  consumable: 'accessory',
};

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
  equipment, inventory, stats, onEquip, onUnequip, onClose
}) => {
  const [selectedSlot, setSelectedSlot] = useState<keyof Equipment | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  const equipStats = getEquipmentStats(equipment);
  const totalSTR = stats.strength + equipStats.strength;
  const totalDEF = stats.defense + equipStats.defense;
  const totalSPD = stats.speed + equipStats.speed;
  const totalCrit = stats.criticalChance + equipStats.criticalChance;

  const equipableItems = inventory.filter(item =>
    item.type === 'weapon' || item.type === 'armor' || item.type === 'consumable'
  );

  return (
    <Modal open={true} onClose={onClose} title="Equipment" size="lg">
      <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[480px]">
        {/* Left: Equipment Slots */}
        <div className="w-full md:w-64 space-y-3">
          {/* Character Preview */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-4 text-center border border-slate-200">
            <div className="text-6xl mb-2">🧙</div>
            <div className="text-sm font-bold text-slate-700">
              Hero
            </div>
            <div className="text-xs text-slate-500">Level {stats.level}</div>
          </div>

          {/* Equipment Slots */}
          <div className="space-y-2">
            {(Object.keys(SLOT_CONFIG) as (keyof Equipment)[]).map(slot => {
              const config = SLOT_CONFIG[slot];
              const item = equipment[slot];
              return (
                <button
                  key={slot}
                  onClick={() => { setSelectedSlot(slot); setShowInventory(true); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedSlot === slot
                      ? `${config.color} ${config.borderColor} ring-2 ring-violet-400`
                      : item
                        ? `${config.color} ${config.borderColor}`
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item ? config.color : 'bg-slate-200'
                  }`}>
                    {item ? (
                      <span className="text-2xl">{item.icon}</span>
                    ) : (
                      <Plus size={16} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[10px] text-slate-400 uppercase">{config.label}</div>
                    <div className="text-xs font-bold text-slate-700">
                      {item ? item.name : 'Empty'}
                    </div>
                    {item?.effect && (
                      <div className="text-[10px] text-emerald-500">
                        +{item.effect.value} {item.effect.type}
                      </div>
                    )}
                  </div>
                  {item && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onUnequip(slot); }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Stats + Inventory */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Total Stats */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Stats</div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <Swords size={16} className="text-red-500 mx-auto mb-1" />
                <div className="text-lg font-black text-red-600">{totalSTR}</div>
                <div className="text-[10px] text-slate-500">STR</div>
                {equipStats.strength > 0 && (
                  <div className="text-[10px] text-emerald-500">+{equipStats.strength}</div>
                )}
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <Shield size={16} className="text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-black text-blue-600">{totalDEF}</div>
                <div className="text-[10px] text-slate-500">DEF</div>
                {equipStats.defense > 0 && (
                  <div className="text-[10px] text-emerald-500">+{equipStats.defense}</div>
                )}
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <Swords size={16} className="text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-black text-yellow-600">{totalSPD}</div>
                <div className="text-[10px] text-slate-500">SPD</div>
                {equipStats.speed > 0 && (
                  <div className="text-[10px] text-emerald-500">+{equipStats.speed}</div>
                )}
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <Gem size={16} className="text-purple-500 mx-auto mb-1" />
                <div className="text-lg font-black text-purple-600">{totalCrit}</div>
                <div className="text-[10px] text-slate-500">CRIT</div>
                {equipStats.criticalChance > 0 && (
                  <div className="text-[10px] text-emerald-500">+{equipStats.criticalChance}</div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory for Equipping */}
          {showInventory && selectedSlot && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Select {SLOT_CONFIG[selectedSlot].label}
                </div>
                <button onClick={() => setShowInventory(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>

              {equipableItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Info size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No equipable items</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {equipableItems.map(item => {
                    const slotType = EQUIPABLE_ITEMS[item.type] || 'accessory';
                    const matchesSlot = slotType === selectedSlot || selectedSlot === 'cosmetic';
                    return (
                      <button
                        key={item.id}
                        onClick={() => { if (matchesSlot) { onEquip(item, selectedSlot); setShowInventory(false); } }}
                        disabled={!matchesSlot}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                          matchesSlot
                            ? 'bg-white border border-slate-200 hover:border-violet-300 cursor-pointer'
                            : 'bg-slate-100 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-700 truncate">{item.name}</div>
                          {item.effect && (
                            <div className="text-[10px] text-emerald-500">
                              +{item.effect.value} {item.effect.type}
                            </div>
                          )}
                        </div>
                        {matchesSlot && <ArrowRightLeft size={12} className="text-violet-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Stat Comparison */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Equipment Bonus</div>
            {equipStats.strength === 0 && equipStats.defense === 0 && equipStats.speed === 0 ? (
              <div className="text-sm text-slate-500 text-center py-2">No equipment bonuses</div>
            ) : (
              <div className="space-y-1">
                {equipStats.strength > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attack Power</span>
                    <span className="font-bold text-red-500">+{equipStats.strength}</span>
                  </div>
                )}
                {equipStats.defense > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Defense</span>
                    <span className="font-bold text-blue-500">+{equipStats.defense}</span>
                  </div>
                )}
                {equipStats.speed > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Speed</span>
                    <span className="font-bold text-yellow-500">+{equipStats.speed}</span>
                  </div>
                )}
                {equipStats.maxHP > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Max HP</span>
                    <span className="font-bold text-green-500">+{equipStats.maxHP}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EquipmentPanel;
