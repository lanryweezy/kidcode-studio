import React from 'react';
import { Play, Pause, Puzzle, Eye, Settings, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  isPlaying: boolean;
  runCode: () => void;
  stopCode: () => void;
  onBlocks: () => void;
  onPreview: () => void;
  onMenu: () => void;
  activeView: 'blocks' | 'preview';
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isPlaying,
  runCode,
  stopCode,
  onBlocks,
  onPreview,
  onMenu,
  activeView,
}) => {
  return (
    <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 flex items-center justify-around px-2 h-16 shrink-0">
      <button
        onClick={onBlocks}
        className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all active:scale-95 ${
          activeView === 'blocks' ? 'text-violet-600 bg-violet-50' : 'text-slate-500'
        }`}
        aria-label="Blocks"
      >
        <Puzzle size={20} />
        <span className="text-[9px] font-semibold">Blocks</span>
      </button>

      <button
        onClick={onPreview}
        className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all active:scale-95 ${
          activeView === 'preview' ? 'text-violet-600 bg-violet-50' : 'text-slate-500'
        }`}
        aria-label="Preview"
      >
        <Eye size={20} />
        <span className="text-[9px] font-semibold">Preview</span>
      </button>

      <button
        onClick={isPlaying ? stopCode : runCode}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all active:scale-90 -mt-5 ${
          isPlaying
            ? 'bg-rose-500 text-white shadow-rose-200'
            : 'bg-emerald-500 text-white shadow-emerald-200'
        }`}
        aria-label={isPlaying ? 'Stop code' : 'Run code'}
      >
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </button>

      <button
        onClick={onMenu}
        className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl text-slate-500 transition-all active:scale-95"
        aria-label="Settings and tools"
      >
        <Settings size={20} />
        <span className="text-[9px] font-semibold">Menu</span>
      </button>

      <button
        onClick={onMenu}
        className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl text-slate-500 transition-all active:scale-95"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
        <span className="text-[9px] font-semibold">More</span>
      </button>
    </div>
  );
};

export default React.memo(MobileBottomNav);
