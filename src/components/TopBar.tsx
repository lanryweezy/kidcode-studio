
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
    <div className="h-14 glass border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-40 overflow-x-auto">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setLeftPanelWidth(leftPanelWidth === 0 ? 280 : 0)}
          className="p-2 lg:hidden hover:bg-slate-100 rounded-lg text-slate-500 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          aria-label="Toggle left panel"
        >
          <Menu size={16} />
        </button>

        <button onClick={() => setShowHome(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title="Home (Esc)" aria-label="Go to Home">
          <Home size={16} />
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: customAccentColor }}>
            {React.createElement(MODE_CONFIG[mode].icon, { size: 14 })}
          </div>
          <input
            value={currentProject?.name || 'Untitled'}
            onChange={(e) => currentProject && setProject({ ...currentProject, name: e.target.value })}
            className="bg-transparent font-bold text-sm outline-none hover:bg-white/50 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
            style={{ color: customAccentColor }}
          />
        </div>

        {saveStatus === 'saving' && <span className="text-xs text-violet-600 font-semibold flex items-center gap-1"><RotateCcw className="animate-spin" size={10} /> Saving</span>}
        {saveStatus === 'saved' && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Check size={10} /> Saved</span>}

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        <div className="hidden md:flex items-center gap-2">
          {mode === AppMode.HARDWARE && (
            <>
              <button
                onClick={() => { downloadArduinoCode(commands, currentProject?.name); toast('success', 'Arduino code downloaded!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-xl hover:bg-teal-600 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <Download size={14} /> .ino
              </button>
              <button
                onClick={async () => {
                  if (!serialService.isConnected()) { toast('warning', 'Please connect a board first via the Hardware Stage.'); return; }
                  try { const inoCode = exportToArduino(commands); await serialService.sendCode(inoCode); toast('success', 'Code sent to board via WebSerial!'); }
                  catch (e) { console.error(e); toast('error', 'Failed to send code.'); }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <UploadCloud size={14} /> Push
              </button>
            </>
          )}

          {mode === AppMode.APP && onOpenCodePages && (
            <button
              onClick={onOpenCodePages}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <Code2 size={14} /> Code by Page
            </button>
          )}

          {mode === AppMode.GAME && onToggle3D && (
            <button
              onClick={onToggle3D}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-xl transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${is3DMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-500 hover:bg-slate-600'}`}
            >
              {is3DMode ? <Box size={14} /> : <Square size={14} />}
              {is3DMode ? "3D Mode" : "2D Mode"}
            </button>
          )}

          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <Globe size={14} /> Publish
          </button>

          <button
            onClick={handleToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${isLive ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isLive ? <Radio size={14} /> : <Users size={14} />}
            {isLive ? 'Live' : 'Go Live'}
          </button>
        </div>

        <div className="relative md:hidden">
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors active:scale-95"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
          {showOverflow && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                {mode === AppMode.HARDWARE && (
                  <>
                    <button onClick={() => { downloadArduinoCode(commands, currentProject?.name); toast('success', 'Arduino code downloaded!'); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Download size={16} className="text-teal-500" /> Download .ino
                    </button>
                    <button onClick={async () => { if (!serialService.isConnected()) { toast('warning', 'Please connect a board first via the Hardware Stage.'); setShowOverflow(false); return; } try { const inoCode = exportToArduino(commands); await serialService.sendCode(inoCode); toast('success', 'Code sent to board via WebSerial!'); } catch (e) { console.error(e); toast('error', 'Failed to send code.'); } setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <UploadCloud size={16} className="text-orange-500" /> Push to Board
                    </button>
                  </>
                )}
                {mode === AppMode.APP && onOpenCodePages && (
                  <button onClick={() => { onOpenCodePages(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Code2 size={16} className="text-violet-500" /> Code by Page
                  </button>
                )}
                {mode === AppMode.GAME && onToggle3D && (
                  <button onClick={() => { onToggle3D(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    {is3DMode ? <Box size={16} className="text-cyan-500" /> : <Square size={16} className="text-slate-500" />}
                    {is3DMode ? "Switch to 2D" : "Switch to 3D"}
                  </button>
                )}
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => { handlePublish(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Globe size={16} className="text-violet-500" /> Publish
                </button>
                <button onClick={() => { handleToggleLive(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  {isLive ? <Radio size={16} className="text-rose-500" /> : <Users size={16} className="text-slate-500" />}
                  {isLive ? 'Stop Live' : 'Go Live'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={undo} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title="Undo (Ctrl+Z)" aria-label="Undo"><Undo2 size={16} /></button>
        <button onClick={redo} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title="Redo (Ctrl+Y)" aria-label="Redo"><Redo2 size={16} /></button>

        <button onClick={() => setShowHelp(true)} className="p-2 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-slate-100 transition-colors active:scale-95" title="Academy / Help" aria-label="Help"><HelpCircle size={16} /></button>
        <button onClick={() => setShowMarketplace(true)} className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors active:scale-95" title="Marketplace" aria-label="Marketplace"><ShoppingBag size={16} /></button>
        
        {diagnosis.errors.length > 0 && (
          <button
            onClick={() => setShowDiagnosis(!showDiagnosis)}
            className="p-2 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors active:scale-95"
            title={`Check code for ${diagnosis.errors.length} error(s)`}
          >
            <AlertCircle size={16} />
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 mx-1" />

        <button onClick={() => setDebugMode(!debugMode)} className={`p-2 rounded-lg transition-colors active:scale-95 ${debugMode ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`} title="Debugger (Ctrl+D)" aria-label="Toggle Debugger"><Bug size={16} /></button>

        {debugMode && (
          <button
            onClick={resumeCode}
            disabled={!isPlaying || !isPaused}
            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Step Over"
          >
            <StepForward size={16} />
          </button>
        )}

        <button
          onClick={isPlaying ? stopCode : runCode}
          className={`flex items-center gap-2 px-5 py-1.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          title={isPlaying ? "Stop (Ctrl+.)" : "Run Code (Ctrl+Enter)"}
        >
          {isPlaying ? <><Pause size={16} fill="currentColor" /> STOP</> : <><Play size={16} fill="currentColor" /> RUN</>}
        </button>
      </div>
      
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
