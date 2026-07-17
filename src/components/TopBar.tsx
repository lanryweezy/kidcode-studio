
import React from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { MODE_CONFIG } from '../constants';
import { AppMode } from '../types';
import {
  Home, Undo2, Redo2, Bug, StepForward, Pause, Play, Check, RotateCcw, Menu, HelpCircle, Globe, Code2, Box, Square, Users, Radio, ShoppingBag, AlertCircle, MoreHorizontal, Download, UploadCloud, Camera, FolderPlus
} from 'lucide-react';
import { exportToStandaloneHTML } from '../services/standaloneExporter';
import { exportToDatapack, exportToMCWorld } from '../services/minecraftExporter';
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
  restartCode?: () => void;
  currentProject: SavedProject | null;
  setProject: (project: SavedProject) => void;
  saveStatus: string;
  onOpenCodePages?: () => void;
  is3DMode?: boolean;
  onToggle3D?: () => void;
  onCaptureScreenshot?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  isPlaying,
  debugMode,
  setDebugMode,
  isPaused,
  runCode,
  stopCode,
  resumeCode,
  restartCode,
  currentProject,
  setProject,
  saveStatus,
  onOpenCodePages,
  is3DMode,
  onToggle3D,
  onCaptureScreenshot
}) => {
  const {
    setShowHome, mode, undo, redo, setShowHelp,
    setLeftPanelWidth, leftPanelWidth,
    circuitComponents, pcbColor, isLive, setIsLive,
    setShowMarketplace, commands, customAccentColor,
    setShowAddToStudio,
  } = useStore();
  
  const { t } = useTranslation();
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
    toast('success', t('topbar.projectExported'));
  };

  return (
    <div className="h-14 glass border-b border-slate-200 flex items-center justify-between px-3 md:px-4 shrink-0 z-40 overflow-x-auto">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={() => setLeftPanelWidth(leftPanelWidth === 0 ? 280 : 0)}
          className="p-2.5 lg:hidden hover:bg-slate-100 rounded-lg text-slate-500 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          aria-label="Toggle left panel"
        >
          <Menu size={18} />
        </button>

        <button onClick={() => setShowHome(true)} className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" title={t('topbar.home')} aria-label="Go to Home">
          <Home size={18} />
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg items-center justify-center text-white hidden sm:flex" style={{ backgroundColor: customAccentColor }}>
            {React.createElement(MODE_CONFIG[mode].icon, { size: 14 })}
          </div>
          <input
            value={currentProject?.name || 'Untitled'}
            onChange={(e) => currentProject && setProject({ ...currentProject, name: e.target.value })}
            className="bg-transparent font-bold text-sm outline-none hover:bg-white/50 px-2 py-1 rounded transition-colors truncate max-w-[140px] sm:max-w-[200px]"
            style={{ color: customAccentColor }}
          />
        </div>

        {saveStatus === 'saving' && <span className="text-xs text-violet-600 font-semibold items-center gap-1 hidden sm:flex"><RotateCcw className="animate-spin" size={10} /> {t('topbar.saving')}</span>}
        {saveStatus === 'saved' && <span className="text-xs text-emerald-600 font-semibold items-center gap-1 hidden sm:flex"><Check size={10} /> {t('topbar.saved')}</span>}

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        <div className="hidden md:flex items-center gap-2">
          {mode === AppMode.HARDWARE && (
            <>
              <button
                onClick={() => { downloadArduinoCode(commands, currentProject?.name); toast('success', t('topbar.arduinoDownloaded')); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-xl hover:bg-teal-600 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <Download size={14} /> .ino
              </button>
              <button
                onClick={async () => {
                  if (!serialService.isConnected()) { toast('warning', t('topbar.connectBoard')); return; }
                  try { const inoCode = exportToArduino(commands); await serialService.sendCode(inoCode); toast('success', t('topbar.codeSent')); }
                  catch (e) { console.error(e); toast('error', t('topbar.sendFailed')); }
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

          {mode === AppMode.MINECRAFT && (
            <>
              <button
                onClick={async () => {
                  if (!currentProject) return;
                  const fullProject = { ...currentProject, data: { ...currentProject.data, commands: useStore.getState().commands } };
                  await exportToDatapack(fullProject);
                  toast('success', t('topbar.datapackExported'));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <Download size={14} /> .zip Datapack
              </button>
              <button
                onClick={async () => {
                  if (!currentProject) return;
                  const fullProject = { ...currentProject, data: { ...currentProject.data, commands: useStore.getState().commands } };
                  await exportToMCWorld(fullProject);
                  toast('success', t('topbar.mcworldExported'));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <Download size={14} /> .mcworld
              </button>
            </>
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
            <Globe size={14} /> {t('topbar.publish')}
          </button>

          <button
            onClick={handleToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${isLive ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isLive ? <Radio size={14} /> : <Users size={14} />}
            {isLive ? t('topbar.live') : t('topbar.goLive')}
          </button>

          {onCaptureScreenshot && (
            <button
              onClick={onCaptureScreenshot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              title="Capture Screenshot"
            >
              <Camera size={14} />
            </button>
          )}
        </div>

        <div className="relative sm:hidden">
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors active:scale-95"
            aria-label="More options"
          >
            <MoreHorizontal size={18} />
          </button>
          {showOverflow && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                {mode === AppMode.HARDWARE && (
                  <>
                    <button onClick={() => { downloadArduinoCode(commands, currentProject?.name); toast('success', t('topbar.arduinoDownloaded')); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Download size={16} className="text-teal-500" /> Download .ino
                    </button>
                    <button onClick={async () => { if (!serialService.isConnected()) { toast('warning', t('topbar.connectBoard')); setShowOverflow(false); return; } try { const inoCode = exportToArduino(commands); await serialService.sendCode(inoCode); toast('success', t('topbar.codeSent')); } catch (e) { console.error(e); toast('error', t('topbar.sendFailed')); } setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <UploadCloud size={16} className="text-orange-500" /> Push to Board
                    </button>
                  </>
                )}
                {mode === AppMode.APP && onOpenCodePages && (
                  <button onClick={() => { onOpenCodePages(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Code2 size={16} className="text-violet-500" /> Code by Page
                  </button>
                )}
                {mode === AppMode.GAME && onToggle3D && (
                  <button onClick={() => { onToggle3D(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    {is3DMode ? <Box size={16} className="text-cyan-500" /> : <Square size={16} className="text-slate-500" />}
                    {is3DMode ? "Switch to 2D" : "Switch to 3D"}
                  </button>
                )}
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => { handlePublish(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Globe size={16} className="text-violet-500" /> {t('topbar.publish')}
                </button>
                <button onClick={() => { handleToggleLive(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  {isLive ? <Radio size={16} className="text-rose-500" /> : <Users size={16} className="text-slate-500" />}
                  {isLive ? t('topbar.stopLive') : t('topbar.goLive')}
                </button>
                {onCaptureScreenshot && (
                  <button onClick={() => { onCaptureScreenshot(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Camera size={16} className="text-slate-500" /> Capture Screenshot
                  </button>
                )}
                {currentProject && (
                  <button onClick={() => { setShowAddToStudio(currentProject.id); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <FolderPlus size={16} className="text-violet-500" /> Add to Studio
                  </button>
                )}
                <div className="border-t border-slate-100 my-1" />
                <button onClick={() => { undo(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Undo2 size={16} className="text-slate-500" /> {t('common.undo')}
                </button>
                <button onClick={() => { redo(); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Redo2 size={16} className="text-slate-500" /> {t('common.redo')}
                </button>
                <button onClick={() => { setShowHelp(true); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <HelpCircle size={16} className="text-violet-500" /> {t('topbar.help')}
                </button>
                <button onClick={() => { setShowMarketplace(true); setShowOverflow(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <ShoppingBag size={16} className="text-amber-500" /> {t('topbar.marketplace')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={undo} className="p-2.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 hidden sm:flex" title={t('topbar.undo')} aria-label="Undo"><Undo2 size={16} /></button>
        <button onClick={redo} className="p-2.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 hidden sm:flex" title={t('topbar.redo')} aria-label="Redo"><Redo2 size={16} /></button>

        <button onClick={() => setShowHelp(true)} className="p-2.5 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 hidden sm:flex" title={t('topbar.help')} aria-label="Help"><HelpCircle size={16} /></button>
        <button onClick={() => setShowMarketplace(true)} className="p-2.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors active:scale-95 hidden sm:flex" title={t('topbar.marketplace')} aria-label="Marketplace"><ShoppingBag size={16} /></button>
        
        {diagnosis.errors.length > 0 && (
          <button
            onClick={() => setShowDiagnosis(!showDiagnosis)}
            className="p-2.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors active:scale-95"
            title={`Check code for ${diagnosis.errors.length} error(s)`}
          >
            <AlertCircle size={16} />
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 mx-0.5 sm:mx-1" />

        <button onClick={() => setDebugMode(!debugMode)} className={`p-2.5 rounded-lg transition-colors active:scale-95 ${debugMode ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`} title={t('topbar.toggleDebugger')} aria-label="Toggle Debugger"><Bug size={16} /></button>

        {debugMode && (
          <button
            onClick={resumeCode}
            disabled={!isPlaying || !isPaused}
            className="p-2.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={t('topbar.stepOver')}
          >
            <StepForward size={16} />
          </button>
        )}

        <button
          onClick={isPlaying ? stopCode : runCode}
          className={`flex items-center gap-2 px-5 py-1.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          title={isPlaying ? t('topbar.stop') : t('topbar.run')}
        >
          {isPlaying ? <><Pause size={16} fill="currentColor" /> STOP</> : <><Play size={16} fill="currentColor" /> RUN</>}
        </button>
        {restartCode && (
          <button
            onClick={restartCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            title={t('topbar.restart')}
          >
            <RotateCcw size={14} />
          </button>
        )}
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
