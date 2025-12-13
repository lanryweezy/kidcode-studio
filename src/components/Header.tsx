
import React from 'react';
import { Home, Undo2, Redo2, Bug, StepForward, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { AppMode } from '../types/types';
import { MODE_CONFIG } from '../constants/constants';

interface HeaderProps {
  showHome: () => void;
  mode: AppMode;
  currentProject: { name: string } | null;
  setCurrentProject: (project: { name: string } | null) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  handleUndo: () => void;
  handleRedo: () => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  isPlaying: boolean;
  isPaused: boolean;
  handleStep: () => void;
  stopCode: () => void;
  runCode: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showHome,
  mode,
  currentProject,
  setCurrentProject,
  saveStatus,
  handleUndo,
  handleRedo,
  debugMode,
  setDebugMode,
  isPlaying,
  isPaused,
  handleStep,
  stopCode,
  runCode,
}) => {
  return (
    <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={showHome} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
          <Home size={20} />
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${MODE_CONFIG[mode].color}`}>
            {React.createElement(MODE_CONFIG[mode].icon, { size: 16 })}
          </div>
          <input
            value={currentProject?.name || 'Untitled'}
            onChange={(e) => setCurrentProject(currentProject ? { ...currentProject, name: e.target.value } : null)}
            className="bg-transparent font-bold outline-none hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1">
          {saveStatus === 'saving' && <><RotateCcw className="animate-spin" size={10} /> Saving...</>}
          {saveStatus === 'saved' && <><Check size={10} /> Saved</>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleUndo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
        <button onClick={handleRedo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        <button onClick={() => setDebugMode(!debugMode)} className={`p-2 rounded-lg transition-colors ${debugMode ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100'}`} title="Debugger"><Bug size={18} /></button>

        {debugMode && (
          <button
            onClick={handleStep}
            disabled={!isPlaying || !isPaused}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Step Over"
          >
            <StepForward size={18} />
          </button>
        )}

        <button
          onClick={isPlaying ? stopCode : runCode}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-95 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isPlaying ? <><Pause size={16} fill="currentColor" /> Stop</> : <><Play size={16} fill="currentColor" /> Run</>}
        </button>
      </div>
    </div>
  );
};

export default Header;
