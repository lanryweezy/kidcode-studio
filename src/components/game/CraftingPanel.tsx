import React, { useState } from 'react';
import { Hammer, Plus, Check, X, ChevronRight, Sparkles } from 'lucide-react';
import { InventoryItem } from '../../types';
import { CraftingRecipe, CRAFTING_RECIPES, canCraft } from '../../services/rpgSystemsExtended';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface CraftingPanelProps {
  inventory: InventoryItem[];
  onCraft: (recipe: CraftingRecipe) => void;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  weapons: 'bg-red-500',
  armor: 'bg-blue-500',
  consumables: 'bg-green-500',
  materials: 'bg-amber-500',
};

const CATEGORY_ICONS: Record<string, string> = {
  weapons: '⚔️',
  armor: '🛡️',
  consumables: '🧪',
  materials: '💎',
};

export const CraftingPanel: React.FC<CraftingPanelProps> = ({
  inventory, onCraft, onClose
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [craftAnimation, setCraftAnimation] = useState(false);

  const categories = ['all', 'weapons', 'armor', 'consumables', 'materials'];
  const filteredRecipes = category === 'all'
    ? CRAFTING_RECIPES
    : CRAFTING_RECIPES.filter(r => r.category === category);

  const selected = CRAFTING_RECIPES.find(r => r.id === selectedRecipe);

  const getItemCount = (itemId: string): number => {
    const item = inventory.find(i => i.id === itemId);
    return item?.quantity || 0;
  };

  const handleCraft = (recipe: CraftingRecipe) => {
    setCraftAnimation(true);
    setTimeout(() => {
      onCraft(recipe);
      setCraftAnimation(false);
      setSelectedRecipe(null);
    }, 500);
  };

  return (
    <Modal open={true} onClose={onClose} title="Crafting" size="lg">
      <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[480px]">
        {/* Left: Recipe List */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {/* Category Tabs */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  category === cat
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? ' All' : `${CATEGORY_ICONS[cat] || ''} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
              </button>
            ))}
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-2 gap-2">
            {filteredRecipes.map(recipe => {
              const craftable = canCraft({ inventory, maxInventorySize: 99 } as any, recipe);
              return (
                <button
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe.id)}
                  className={`p-3 rounded-xl text-left transition-all relative ${
                    selectedRecipe === recipe.id
                      ? 'bg-violet-100 border-2 border-violet-400'
                      : craftable
                        ? 'bg-white border-2 border-transparent hover:border-slate-200'
                        : 'bg-slate-50 border-2 border-transparent opacity-60'
                  }`}
                >
                  {craftable && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{recipe.result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{recipe.name}</div>
                      <div className="text-[10px] text-slate-500">{recipe.result.type}</div>
                    </div>
                  </div>

                  {/* Ingredients Preview */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {recipe.ingredients.map((ing, idx) => {
                      const have = getItemCount(ing.itemId);
                      const enough = have >= ing.quantity;
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            enough ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {have}/{ing.quantity}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Recipe Detail */}
        {selected ? (
          <div className="w-64 border-l border-slate-200 pl-4 space-y-4 overflow-y-auto">
            {/* Result Preview */}
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                craftAnimation ? 'animate-spin scale-125' : ''
              } bg-gradient-to-br from-violet-100 to-purple-100`}
              >
                <span className="text-4xl">{selected.result.icon}</span>
              </div>
              <h3 className="font-bold text-slate-800 mt-3">{selected.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{selected.result.description}</p>
              {selected.result.effect && (
                <div className="mt-2 px-3 py-1 bg-emerald-100 rounded-lg inline-block">
                  <span className="text-xs font-bold text-emerald-700">
                    +{selected.result.effect.value} {selected.result.effect.type}
                  </span>
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Ingredients</div>
              <div className="space-y-2">
                {selected.ingredients.map((ing, idx) => {
                  const have = getItemCount(ing.itemId);
                  const enough = have >= ing.quantity;
                  const item = inventory.find(i => i.id === ing.itemId);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        enough ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <span className="text-lg">{item?.icon || '📦'}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-700">
                          {item?.name || ing.itemId}
                        </div>
                        <span className={`text-xs font-bold ${enough ? 'text-green-600' : 'text-red-600'}`}>
                          {have}/{ing.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Craft Button */}
            <Button
              variant="primary"
              onClick={() => handleCraft(selected)}
              disabled={!canCraft({ inventory, maxInventorySize: 99 } as any, selected)}
              className="w-full"
              loading={craftAnimation}
            >
              <Hammer size={14} className="inline mr-1" />
              Craft
            </Button>

            {selected.result.quantity > 1 && (
              <div className="text-center text-xs text-slate-500">
                Produces {selected.result.quantity}x
              </div>
            )}
          </div>
        ) : (
          <div className="w-64 border-l border-slate-200 pl-4 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a recipe</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CraftingPanel;
