import React, { useState } from 'react';
import { CircuitComponent, ComponentType } from '../types';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import ComponentThumbnail from './ComponentThumbnail';

interface CircuitComponentsPanelProps {
  circuitComponents: CircuitComponent[];
  onCircuitUpdate: (components: CircuitComponent[]) => void;
  pcbColor: string;
  setPcbColor: (color: string) => void;
  expandedCategories: Record<string, boolean>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  circuitSearch: string;
  setCircuitSearch: (search: string) => void;
  groupedComponents: [string, any[]][];
  handleComponentDragStart: (comp: any) => (e: React.DragEvent<HTMLDivElement>) => void;
}

const CircuitComponentsPanel: React.FC<CircuitComponentsPanelProps> = ({ 
  circuitComponents,
  onCircuitUpdate,
  pcbColor,
  setPcbColor,
  expandedCategories,
  setExpandedCategories,
  circuitSearch,
  setCircuitSearch,
  groupedComponents,
  handleComponentDragStart
}) => {
  // Define PCB color options
  const pcbColorOptions = ['#059669', '#1e293b', '#dc2626', '#2563eb', '#d97706'];

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-2 uppercase tracking-wide">Board Color</h3>
          <div className="flex gap-2">
            {pcbColorOptions.map(c => (
              <button
                key={c}
                onClick={() => setPcbColor(c)}
                className={`w-6 h-6 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${pcbColor === c ? 'border-slate-900 dark:border-white ring-2 ring-violet-200' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={pcbColor}
                onChange={(e) => setPcbColor(e.target.value)}
                className="absolute -top-1 -left-1 w-8 h-8 p-0 border-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search parts..."
            value={circuitSearch}
            onChange={(e) => setCircuitSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }} >
        {/* Grouped Components Rendering */}
        {(groupedComponents as [string, any[]][]).map(([category, components]) => {
          const filtered = components.filter((c: any) => c.label.toLowerCase().includes(circuitSearch.toLowerCase()));
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
                  {filtered.map((comp: any) => (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={handleComponentDragStart(comp)}
                      className={`flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 shadow-sm transition-all hover:scale-[1.02]`}
                    >
                      <ComponentThumbnail type={comp.type} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{comp.label}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{comp.description}</span>
                      </div>
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

export default CircuitComponentsPanel;