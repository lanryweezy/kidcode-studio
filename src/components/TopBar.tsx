
import React from 'react';
import { useStore } from '../store/useStore';
import { MODE_CONFIG } from '../constants';
import { AppMode } from '../types';
import {
  Home, Undo2, Redo2, Bug, StepForward, Pause, Play, Check, RotateCcw, Menu, HelpCircle, Globe, Code2, Box, Square, Users, Radio, ShoppingBag
} from 'lucide-react';
import { exportToStandaloneHTML } from '../services/standaloneExporter';
import { multiplayerService } from '../services/multiplayerService';

interface TopBarProps {
  isPlaying: boolean;
  debugMode: boolean;
  setDebugMode: (mode: boolean) => void;
  isPaused: boolean;
  runCode: () => void;
  stopCode: () => void;
  resumeCode: () => void;
  currentProject: any;
  setProject: (project: any) => void;
  saveStatus: string;
  onOpenCodePages?: () => void;
  is3DMode?: boolean;
  onToggle3D?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  isPlaying,
  debugMode,
  setDebugMode,
  isPaused,
  runCode,
  stopCode,
  resumeCode,
  currentProject,
  setProject,
  saveStatus,
  onOpenCodePages,
  is3DMode,
  onToggle3D
}) => {
  const { 
    setShowHome, mode, undo, redo, setShowHelp, 
    setLeftPanelWidth, leftPanelWidth, 
    circuitComponents, pcbColor, isLive, setIsLive,
    setShowMarketplace
  } = useStore();

  const handleToggleLive = () => {
      const next = !isLive;
      setIsLive(next);
      if (next) multiplayerService.joinRoom('main_room');
  };

  const handlePublish = () => {
      if (!currentProject) return;
      // Capture current state into project data for export
      const fullProject = {
          ...currentProject,
          data: {
              ...currentProject.data,
              commands: useStore.getState().commands,
              circuitComponents,
              pcbColor
          }
      };
      const html = exportToStandaloneHTML(fullProject);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '_')}.html`;
      a.click();
      URL.revokeObjectURL(url);
  };

  return (
    <div className="h-14 glass dark:glass-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-40">
       <div className="flex items-center gap-4">
           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setLeftPanelWidth(leftPanelWidth === 0 ? 280 : 0)}
             className="p-2 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
           >
               <Menu size={20} />
           </button>

           <button onClick={() => setShowHome(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-transform hover:scale-110 active:scale-95" aria-label="Go to Home" role="button">
               <Home size={20} />
           </button>
           <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
           <div className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${MODE_CONFIG[mode].color} shadow-lg shadow-blue-500/20`}>
                   {React.createElement(MODE_CONFIG[mode].icon, { size: 16 })}
               </div>
               <input
                  value={currentProject?.name || 'Untitled'}
                  onChange={(e) => setProject({ ...currentProject, name: e.target.value })}
                  className="bg-transparent font-bold outline-none hover:bg-white/50 dark:hover:bg-black/20 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
               />
           </div>
           <div className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-2">
               {saveStatus === 'saving' && <><RotateCcw className="animate-spin" size={10} /> Saving...</>}
               {saveStatus === 'saved' && <><Check size={10} className="text-emerald-500" /> <span className="opacity-70">Project Saved</span></>}
           </div>

           {mode === AppMode.APP && onOpenCodePages && (
               <button
                 onClick={onOpenCodePages}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                 title="Organize code by page/screen"
               >
                   <Code2 size={12} /> Code by Page
               </button>
           )}

           {mode === AppMode.GAME && onToggle3D && (
               <button
                 onClick={onToggle3D}
                 className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all ${
                   is3DMode 
                     ? 'bg-gradient-to-r from-cyan-500 to-blue-600' 
                     : 'bg-gradient-to-r from-slate-500 to-slate-600'
                 }`}
                 title={is3DMode ? "Switch to 2D Mode" : "Switch to 3D Mode"}
               >
                   {is3DMode ? <Box size={12} /> : <Square size={12} />}
                   {is3DMode ? "3D Mode" : "2D Mode"}
               </button>
           )}

           <button
             onClick={handlePublish}
             className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
           >
               <Globe size={12} /> Publish to Web
           </button>

           <button 
             onClick={handleToggleLive}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-[10px] uppercase shadow-lg transition-all hover:scale-105 active:scale-95 ${
               isLive 
                 ? 'bg-red-500 text-white animate-pulse' 
                 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
             }`}
           >
               {isLive ? <Radio size={12} /> : <Users size={12} />}
               {isLive ? 'Live Room' : 'Go Live'}
           </button>
       </div>

       <div className="flex items-center gap-2">
           <button onClick={undo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-white/50 transition-all hover:-translate-y-0.5 active:scale-90" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
           <button onClick={redo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-white/50 transition-all hover:-translate-y-0.5 active:scale-90" title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
           
           <button onClick={() => setShowHelp(true)} className="p-2 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-white/50 transition-all hover:-translate-y-0.5" title="Academy / Help"><HelpCircle size={18} /></button>
           <button onClick={() => setShowMarketplace(true)} className="p-2 text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 rounded-lg hover:bg-white/50 transition-all hover:-translate-y-0.5" title="Marketplace"><ShoppingBag size={18} /></button>

           <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

           <button onClick={() => setDebugMode(!debugMode)} className={`p-2 rounded-lg transition-all ${debugMode ? 'bg-orange-500 text-white shadow-inner' : 'text-slate-500 hover:bg-white/50'}`} title="Debugger"><Bug size={18} /></button>

           {debugMode && (
               <button
                   onClick={resumeCode}
                   disabled={!isPlaying || !isPaused}
                   className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed"
                   title="Step Over"
               >
                   <StepForward size={18} />
               </button>
           )}

           <button
              onClick={isPlaying ? stopCode : runCode}
              className={`btn-3d flex items-center gap-2 px-6 py-1.5 rounded-full font-black text-white transition-all shadow-xl active:scale-95 ${isPlaying ? 'bg-red-500 border-red-700 animate-pulse-glow' : 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400'}`}
           >
               {isPlaying ? <><Pause size={16} fill="currentColor" /> STOP</> : <><Play size={16} fill="currentColor" /> RUN CODE</>}
           </button>
       </div>
    </div>
  );
};

export default TopBar;
