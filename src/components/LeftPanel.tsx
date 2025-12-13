
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import AIChat from './AIChat';
import { AppMode, CommandType } from '../types/types';
import { AVAILABLE_BLOCKS } from '../constants/constants';

interface LeftPanelProps {
  activeTab: string;
  mode: AppMode;
  handleAppendCode: (code: any) => void;
  leftPanelWidth: number;
  handleMouseDownLeft: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  activeTab,
  mode,
  handleAppendCode,
  leftPanelWidth,
  handleMouseDownLeft,
}) => {
  const [blockSearch, setBlockSearch] = useState('');

  return (
    <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-75 relative z-20" style={{ width: leftPanelWidth }}>
      {activeTab === 'ai' ? (
        <AIChat currentMode={mode} onAppendCode={handleAppendCode} />
      ) : (
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
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
            {AVAILABLE_BLOCKS[mode].filter(b => b.label.toLowerCase().includes(blockSearch.toLowerCase())).map(def => (
              <div
                key={def.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(def));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 shadow-sm transition-all hover:scale-[1.02]`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${def.color}`}>
                  {React.createElement(def.icon, { size: 16 })}
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{def.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-violet-500 transition-colors z-50" onMouseDown={handleMouseDownLeft} />
    </div>
  );
};

export default LeftPanel;
