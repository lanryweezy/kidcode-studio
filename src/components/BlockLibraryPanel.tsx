import React from 'react';
import { BlockDefinition, CommandType } from '../types';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface BlockLibraryPanelProps {
  mode: 'APP' | 'GAME' | 'HARDWARE';
  expandedCategories: Record<string, boolean>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  blockSearch: string;
  setBlockSearch: (search: string) => void;
  groupedBlocks: [string, BlockDefinition[]][];
  handleBlockDragStart: (def: BlockDefinition) => (e: React.DragEvent<HTMLDivElement>) => void;
}

const BlockLibraryPanel: React.FC<BlockLibraryPanelProps> = ({ 
  mode,
  expandedCategories,
  setExpandedCategories,
  blockSearch,
  setBlockSearch,
  groupedBlocks,
  handleBlockDragStart
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Block Library</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={blockSearch}
            onChange={(e) => setBlockSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }} >
        {/* Grouped Blocks Rendering */}
        {(groupedBlocks as [string, BlockDefinition[]][]).map(([category, blocks]) => {
          // Filter logic within group
          const filtered = blocks.filter(b => b.label.toLowerCase().includes(blockSearch.toLowerCase()));
          if (filtered.length === 0) return null;

          const isExpanded = expandedCategories[category] !== false;

          return (
            <div key={category} className="mb-2">
              <button
                onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !isExpanded }))}
                className="flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2 hover:text-slate-600 px-1"
              >
                {category}
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isExpanded && (
                <div className="space-y-2">
                  {filtered.map((def, idx) => (
                    <div
                      key={def.type}
                      draggable
                      onDragStart={handleBlockDragStart(def)}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 shadow-sm transition-all hover:scale-[1.02]`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${def.color} shadow-sm`}>
                        {React.createElement(def.icon, { size: 16 })}
                      </div>
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{def.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockLibraryPanel;