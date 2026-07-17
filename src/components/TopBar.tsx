
import React from 'react';
import { useStore } from '../store/useStore';
import { MODE_CONFIG } from '../constants';
import { AppMode } from '../types';
import {
  Home, Undo2, Redo2, Bug, StepForward, Pause, Play, Check, RotateCcw, Menu, HelpCircle, Globe, Code2, Box, Square, Users, Radio, ShoppingBag, AlertCircle, MoreHorizontal, Download, UploadCloud
} from 'lucide-react';
import { exportToStandaloneHTML } from '../services/standaloneExporter';
import { downloadArduinoCode, exportToArduino } from '../services/codeExporter';
import { serialService } from '../services/webSerialService';
import { multiplayerService } from '../services/multiplayerService';
import { diagnoseCode } from '../services/errorDiagnosis';
import { ErrorDiagnosisHelp } from '../components/ErrorDiagnosisHelp';
import { useToast } from './ui/Toast';
import { SavedProject } from '../services/storageService';

interface TopBarProps {
  isPlaying: boolean;
  debugMode: boolean;
  setDebugMode: (mode: boolean) => void;
  isPaused: boolean;
  runCode: () => void;
  stopCode: () => void;
  resumeCode: () => void;
  currentProject: SavedProject | null;
  setProject: (project: SavedProject) => void;
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
    setShowMarketplace, commands, customAccentColor
  } = useStore();
  
  const { toast } = useToast();
  const [showDiagnosis, setShowDiagnosis] = React.useState(false);
  const [showOverflow, setShowOverflow] = React.useState(false);
  const diagnosis = React.useMemo(() => diagnoseCode(commands, mode), [commands, mode]);

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
    toast('success', 'Project exported successfully!');
  };

  return (
    <div className="h-14 glass border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0 z-40 overflow-x-auto">
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setLeftPanelWidth(leftPanelWidth === 0 ? 280 : 0)}
          className="p-2 lg:hidden hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          aria-label="Toggle left panel"
        >
          <Menu size={20} />
        </button>

        <button onClick={() => setShowHome(true)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 hover:shadow-sm rounded-lg text-slate-500 transition-all hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title="Home (Esc)" aria-label="Go to Home" role="button">
          <Home size={20} />
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20`} style={{ backgroundColor: customAccentColor }}>
            {React.createElement(MODE_CONFIG[mode].icon, { size: 16 })}
          </div>
          <input
            value={currentProject?.name || 'Untitled'}
            onChange={(e) => currentProject && setProject({ ...currentProject, name: e.target.value })}
            className="bg-transparent font-bold outline-none hover:bg-white/50 dark:hover:bg-black/20 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
            style={{ color: customAccentColor }}
          />
        </div>
        <div className="text-xs text-slate-600 flex items-center gap-1 font-medium mr-2">
          {saveStatus === 'saving' && <><RotateCcw className="animate-spin text-violet-500" size={10} /> <span className="text-violet-600 font-bold">Saving...</span></>}
          {saveStatus === 'saved' && <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold animate-in zoom-in-50 duration-300"><Check size={10} className="text-emerald-500" /> Saved</span>}
        </div>

        {/* Secondary buttons - hidden on mobile, shown in overflow */}
        <div className="hidden md:flex items-center gap-2">
          {mode === AppMode.HARDWARE && (
            <>
              <button
                onClick={() => {
                  downloadArduinoCode(commands, currentProject?.name);
                  toast('success', 'Arduino code downloaded!');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                aria-label="Download Arduino code"
              >
                <Download size={12} /> .ino
              </button>
              <button
                onClick={async () => {
                  if (!serialService.isConnected()) {
                    toast('warning', 'Please connect a board first via the Hardware Stage.');
                    return;
                  }
                  try {
                    const inoCode = exportToArduino(commands);
                    await serialService.sendCode(inoCode);
                    toast('success', 'Code sent to board via WebSerial!');
                  } catch (e) {
                    console.error(e);
                    toast('error', 'Failed to send code.');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                aria-label="Push code to Arduino board"
              >
                <UploadCloud size={12} /> Push
              </button>
            </>
          )}

          {mode === AppMode.APP && onOpenCodePages && (
            <button
              onClick={onOpenCodePages}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              title="Organize code by page/screen"
              aria-label="Open code pages organizer"
            >
              <Code2 size={12} /> Code by Page
            </button>
          )}

          {mode === AppMode.GAME && onToggle3D && (
            <button
              onClick={onToggle3D}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${is3DMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                : 'bg-gradient-to-r from-slate-500 to-slate-600'
                }`}
              title={is3DMode ? "Switch to 2D Mode" : "Switch to 3D Mode"}
              aria-label={is3DMode ? "Switch to 2D Mode" : "Switch to 3D Mode"}
            >
              {is3DMode ? <Box size={12} /> : <Square size={12} />}
              {is3DMode ? "3D Mode" : "2D Mode"}
            </button>
          )}

          <button
            onClick={handlePublish}
            className="btn-primary-action flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            aria-label="Publish to Web"
          >
            <Globe size={12} /> Publish to Web
          </button>

          <button
            onClick={handleToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-[10px] uppercase shadow-lg transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${isLive
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-white text-slate-600'
              }`}
            aria-label={isLive ? 'Stop Live Multiplayer' : 'Go Live Multiplayer'}
          >
            {isLive ? <Radio size={12} /> : <Users size={12} />}
            {isLive ? 'Live Room' : 'Go Live'}
          </button>
        </div>

        {/* Mobile overflow menu */}
        <div className="relative md:hidden">
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all active:scale-95"
            aria-label="More options"
          >
            <MoreHorizontal size={20} />
          </button>
          {showOverflow && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-scale-in">
                {mode === AppMode.HARDWARE && (
                  <>
                    <button
                      onClick={() => {
                        downloadArduinoCode(commands, currentProject?.name);
                        toast('success', 'Arduino code downloaded!');
                        setShowOverflow(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Download size={16} className="text-teal-500" /> Download .ino
                    </button>
                    <button
                      onClick={async () => {
                        if (!serialService.isConnected()) {
                          toast('warning', 'Please connect a board first via the Hardware Stage.');
                          setShowOverflow(false);
                          return;
                        }
                        try {
                          const inoCode = exportToArduino(commands);
                          await serialService.sendCode(inoCode);
                          toast('success', 'Code sent to board via WebSerial!');
                        } catch (e) {
                          console.error(e);
                          toast('error', 'Failed to send code.');
                        }
                        setShowOverflow(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <UploadCloud size={16} className="text-orange-500" /> Push to Board
                    </button>
                  </>
                )}
                {mode === AppMode.APP && onOpenCodePages && (
                  <button
                    onClick={() => { onOpenCodePages(); setShowOverflow(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Code2 size={16} className="text-purple-500" /> Code by Page
                  </button>
                )}
                {mode === AppMode.GAME && onToggle3D && (
                  <button
                    onClick={() => { onToggle3D(); setShowOverflow(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {is3DMode ? <Box size={16} className="text-cyan-500" /> : <Square size={16} className="text-slate-500" />}
                    {is3DMode ? "Switch to 2D" : "Switch to 3D"}
                  </button>
                )}
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => { handlePublish(); setShowOverflow(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Globe size={16} className="text-blue-500" /> Publish to Web
                </button>
                <button
                  onClick={() => { handleToggleLive(); setShowOverflow(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {isLive ? <Radio size={16} className="text-red-500" /> : <Users size={16} className="text-slate-500" />}
                  {isLive ? 'Stop Live Room' : 'Go Live'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={undo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title="Undo (Ctrl+Z)" aria-label="Undo"><Undo2 size={18} /></button>
        <button onClick={redo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title="Redo (Ctrl+Y)" aria-label="Redo"><Redo2 size={18} /></button>

        <button onClick={() => setShowHelp(true)} className="btn-secondary-action p-2 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95" title="Academy / Help" aria-label="Help"><HelpCircle size={18} /></button>
        <button onClick={() => setShowMarketplace(true)} className="btn-secondary-action p-2 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95" title="Marketplace" aria-label="Marketplace"><ShoppingBag size={18} /></button>
        
        {/* Error Diagnosis Button */}
        {diagnosis.errors.length > 0 && (
          <button
            onClick={() => setShowDiagnosis(!showDiagnosis)}
            className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95 animate-pulse"
            title={`Check code for ${diagnosis.errors.length} error(s)`}
            aria-label={`Show ${diagnosis.errors.length} code errors`}
          >
            <AlertCircle size={18} />
          </button>
        )}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        <button onClick={() => setDebugMode(!debugMode)} className={`p-2 rounded-lg transition-all active:scale-95 ${debugMode ? 'bg-orange-500 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:shadow-sm hover:-translate-y-0.5'}`} title="Debugger (Ctrl+D)" aria-label="Toggle Debugger"><Bug size={18} /></button>

        {debugMode && (
          <button
            onClick={resumeCode}
            disabled={!isPlaying || !isPaused}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Step Over"
            aria-label="Step over in debugger"
          >
            <StepForward size={18} />
          </button>
        )}

        <button
          onClick={isPlaying ? stopCode : runCode}
          className={`btn-3d flex items-center gap-2 px-6 py-1.5 rounded-full font-black text-white transition-all shadow-xl active:scale-95 ${isPlaying ? 'bg-red-500 border-red-700 animate-pulse-glow' : 'bg-emerald-500 border-emerald-700 hover:bg-emerald-400'}`}
          title={isPlaying ? "Stop (Ctrl+.)" : "Run Code (Ctrl+Enter)"}
          aria-label={isPlaying ? "Stop Code" : "Run Code"}
        >
          {isPlaying ? <><Pause size={16} fill="currentColor" /> STOP</> : <><Play size={16} fill="currentColor" /> RUN CODE</>}
        </button>
      </div>
      
      {/* Error Diagnosis Panel */}
      {showDiagnosis && diagnosis.errors.length > 0 && (
        <div className="absolute top-14 right-4 w-96 z-50">
          <ErrorDiagnosisHelp
            errors={diagnosis.errors}
            suggestions={diagnosis.suggestions}
            onDismiss={() => setShowDiagnosis(false)}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(TopBar);
