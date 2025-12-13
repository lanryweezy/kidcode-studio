
import React, { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import MainWorkspace from './components/MainWorkspace';
import RightPanel from './components/RightPanel';
import SidebarDock from './components/SidebarDock';
import ProfileModal from './components/ProfileModal';
import MissionOverlay from './components/MissionOverlay';
import PixelEditor from './components/PixelEditor';
import SoundEditor from './components/SoundEditor';
import VariableMonitor from './components/VariableMonitor';
import CodeViewer from './components/CodeViewer';
import { generateCode } from './services/codeGenerator';
import { AppMode } from './types/types';
import { MODE_CONFIG } from './constants/constants';
import { createNewProject } from './services/storageService';
import { Zap, Plus, FileCode } from 'lucide-react';

const App: React.FC = () => {
  const context = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        context.handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        context.handleRedo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        context.saveCurrentProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [context]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (context.isDraggingLeft.current) {
        const newWidth = Math.max(220, Math.min(400, e.clientX - 64));
        context.setLeftPanelWidth(newWidth);
      }
      if (context.isDraggingRight.current) {
        const newWidth = Math.max(320, Math.min(600, window.innerWidth - e.clientX));
        context.setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      context.isDraggingLeft.current = false;
      context.isDraggingRight.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [context]);

  if (context.showHome) {
    return (
      <div className={`min-h-screen ${context.darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} transition-colors font-sans`}>
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap size={24} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">KidCode Studio</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => context.setShowProfile(true)}
              className="flex items-center gap-2 py-2 px-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-all"
            >
              <span className="text-2xl">{context.userProfile.avatar}</span>
              <span className="font-bold text-sm hidden sm:block">{context.userProfile.name}</span>
              <div className="bg-yellow-400 text-yellow-900 text-xs font-black px-1.5 rounded ml-1">{context.userProfile.level}</div>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-4xl font-black mb-8">What do you want to build?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {Object.values(AppMode).map(m => {
              const config = MODE_CONFIG[m];
              const Icon = config.icon;
              return (
                <button
                  key={m}
                  onClick={() => {
                    const newProj = createNewProject(m);
                    context.setCurrentProject(newProj);
                    context.setCommands(newProj.data.commands);
                    context.setMode(m);
                    context.setShowHome(false);
                  }}
                  className={`relative group h-64 rounded-3xl p-8 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl text-white ${config.color}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125">
                    <Icon size={120} />
                  </div>
                  <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <Icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2">{config.label}</h3>
                    <p className="opacity-90 font-medium">Create {m === 'APP' ? 'mobile apps' : m === 'GAME' ? 'video games' : 'inventions'} with blocks.</p>
                  </div>
                  <div className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <Plus size={24} />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><FileCode size={20} /> Recent Projects</h3>
            <button className="text-sm font-bold text-violet-500 hover:text-violet-600">View All</button>
          </div>

          {context.recentProjects.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-medium">No projects yet. Start building!</p>
            </div>
          )}
        </div>

        {context.showProfile && <ProfileModal user={context.userProfile} onClose={() => context.setShowProfile(false)} onUpdateUser={context.setUserProfile} onLoadProject={(p) => context.handleLoadProject(p, context.setCurrentProject, context.setCommands, context.setMode, context.setShowHome)} />}
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${context.darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <Header
        showHome={() => context.setShowHome(true)}
        mode={context.mode}
        currentProject={context.currentProject}
        setCurrentProject={context.setCurrentProject}
        saveStatus={context.saveStatus}
        handleUndo={context.handleUndo}
        handleRedo={context.handleRedo}
        debugMode={context.debugMode}
        setDebugMode={context.setDebugMode}
        isPlaying={context.isPlaying}
        isPaused={context.isPaused}
        handleStep={context.handleStep}
        stopCode={context.stopCode}
        runCode={context.runCode}
      />

      <div className="flex-1 flex overflow-hidden">
        <SidebarDock mode={context.mode} activeTab={context.activeTab} onTabChange={context.setActiveTab} onHome={() => context.setShowHome(true)} onOpenProfile={() => context.setShowProfile(true)} />

        <LeftPanel
          activeTab={context.activeTab}
          mode={context.mode}
          handleAppendCode={context.pushToHistory}
          leftPanelWidth={context.leftPanelWidth}
          handleMouseDownLeft={() => (context.isDraggingLeft.current = true)}
        />

        <MainWorkspace
          draggedBlockId={context.draggedBlockId}
          isOverTrash={context.isOverTrash}
          setIsOverTrash={context.setIsOverTrash}
          commands={context.commands}
          pushToHistory={context.pushToHistory}
          mode={context.mode}
          activeBlockId={context.activeBlockId}
          handleUpdateBlock={context.handleUpdateBlock}
          handleDeleteBlock={context.handleDeleteBlock}
          handleDuplicateBlock={context.handleDuplicateBlock}
          isPlaying={context.isPlaying}
          setDraggedToolType={context.setDraggedToolType}
        />

        <RightPanel
          rightPanelWidth={context.rightPanelWidth}
          handleMouseDownRight={() => (context.isDraggingRight.current = true)}
          stageRef={context.stageRef}
          mode={context.mode}
          hardwareState={context.hardwareState}
          canvasRef={context.canvasRef}
          activeInputs={context.activeInputs}
          spriteState={context.spriteState}
          appState={context.appState}
          circuitComponents={context.circuitComponents}
          setCircuitComponents={context.setCircuitComponents}
          pcbColor={context.pcbColor}
          setPcbColor={context.setPcbColor}
          isPlaying={context.isPlaying}
          highlightedPin={context.highlightedPin}
          updateSpriteState={context.updateSpriteState}
          showConsole={context.showConsole}
          consoleLogs={context.consoleLogs}
          setConsoleLogs={context.setConsoleLogs}
        />
      </div>

      {context.showMissions && <MissionOverlay activeMission={context.activeMission} mode={context.mode} onSelectMission={context.setActiveMission} onClose={() => context.setShowMissions(false)} />}
      {context.showPixelEditor && <PixelEditor initialTexture={context.spriteState.texture} onSave={(tex) => context.setSpriteState(prev => ({ ...prev, texture: tex }))} onClose={() => context.setShowPixelEditor(false)} />}
      {context.showSoundEditor && <SoundEditor onClose={() => context.setShowSoundEditor(false)} />}
      <VariableMonitor variables={context.mode === 'APP' ? context.appState.variables : context.spriteState.variables} isVisible={context.showVariables} onClose={() => context.setShowVariables(false)} />
      {context.showCode && <CodeViewer code={generateCode(context.commands, context.mode)} onClose={() => context.setShowCode(false)} />}
      {context.showProfile && <ProfileModal user={context.userProfile} onClose={() => context.setShowProfile(false)} onUpdateUser={context.setUserProfile} onLoadProject={(p) => context.handleLoadProject(p, context.setCurrentProject, context.setCommands, context.setMode, context.setShowHome)} />}
    </div>
  );
};

export default App;
