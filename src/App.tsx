import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { AppMode, AppState, CommandBlock, CommandType, HardwareState, SpriteState, BlockDefinition, CircuitComponent, ComponentType, Mission, GameEntity, AppElement, UserProfile, PlanType } from './types';
import { AVAILABLE_BLOCKS, INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE, MODE_CONFIG, UI_PALETTE, CIRCUIT_PALETTE, LEVEL_PALETTE, CHARACTER_PALETTE, VEHICLE_PALETTE, EXAMPLE_TEMPLATES } from './constants';
import Block from './components/Block';
import Stage, { StageHandle } from './components/Stage';
import Stage3D, { Stage3DHandle } from './components/Stage3D';
import ContextMenu from './components/ContextMenu';
import HomeScreen from './components/HomeScreen';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import NPCModal from './components/NPCModal';
import GameOverModal from './components/GameOverModal';
import ParticleEditor from './components/ParticleEditor';
import HelpModal from './components/HelpModal';
import GalleryPage from './components/GalleryPage';
import ProjectStatsModal from './components/ProjectStatsModal';
// Lazy load heavy modal components
const PixelEditor = React.lazy(() => import('./components/PixelEditor'));
const SoundEditor = React.lazy(() => import('./components/SoundEditor'));
const VariableMonitor = React.lazy(() => import('./components/VariableMonitor'));
const ProfileModal = React.lazy(() => import('./components/EnhancedProfileModal'));
const PricingModal = React.lazy(() => import('./components/PricingModal'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const CodeViewer = React.lazy(() => import('./components/CodeViewer'));
const MissionOverlay = React.lazy(() => import('./components/MissionOverlay'));
const MusicStudio = React.lazy(() => import('./components/MusicStudio'));
const SoundRecorder = React.lazy(() => import('./components/SoundRecorder'));
const CodePageManager = React.lazy(() => import('./components/CodePageManager'));
const AI3DCreator = React.lazy(() => import('./components/AI3DCreator'));
const MusicGenerator = React.lazy(() => import('./components/MusicGenerator'));
const SpriteExtractor = React.lazy(() => import('./components/SpriteExtractor'));
const MarketplaceModal = React.lazy(() => import('./components/MarketplaceModal'));
const AssetManagerModal = React.lazy(() => import('./components/AssetManagerModal'));
const ToastProvider = React.lazy(() => import('./components/ToastProvider'));
const TutorialLauncher = React.lazy(() => import('./components/TutorialSystem'));
import { useStore } from './store/useStore';
import { useCodeInterpreter } from './hooks/useCodeInterpreter';
import { useGamePhysics } from './hooks/useGamePhysics';
import { useMatterPhysics } from './hooks/useMatterPhysics';
import { playSoundEffect, playTone, playSpeakerSound } from './services/soundService';
import { getProjects, saveProject, createNewProject, SavedProject, exportProjectToFile, importProjectFromFile, captureThumbnail } from './services/storageService';
import { generateCode } from './services/codeGenerator';
import { generateSprite } from './services/geminiService';
import { getUserProfile, addXp, DEFAULT_USER, upgradeUserPlan, updateStreak, checkAndUnlockBadge } from './services/userService';
import { getDailyQuests, updateQuestProgress } from './services/gamificationService';
import { Box, RotateCcw, Check, Trash, Code2, Layout, X } from 'lucide-react';

const MIN_LEFT_WIDTH = 220;
const MAX_LEFT_WIDTH = 400;
const MIN_RIGHT_WIDTH = 320;
const MAX_RIGHT_WIDTH = 600;

export const App: React.FC = () => {
    // --- STORE SELECTORS ---
    const {
        showHome, setShowHome,
        mode, setMode,
        activeTab, setActiveTab,
        darkMode, setDarkMode,
        commands, setCommands,
        history, pushHistory,
        undo, redo,
        currentProject, setProject,
        saveStatus, setSaveStatus,
        hardwareState, updateHardwareState,
        spriteState, updateSpriteState,
        appState, updateAppState,
        consoleLogs, clearLogs,
        showConsole, toggleConsole,
        userProfile, setUserProfile,
        showProfile, setShowProfile,
        showPricing, setShowPricing,
        circuitComponents, setCircuitComponents,
        pcbColor, setPcbColor,
        showMissions, setShowMissions,
        showPixelEditor, setShowPixelEditor,
        showSoundEditor, setShowSoundEditor,
        showVariables, setShowVariables,
        leftPanelWidth, setLeftPanelWidth,
        rightPanelWidth, setRightPanelWidth,
        showGallery, setShowGallery,
        showMusicStudio, setShowMusicStudio,
        showStats, setShowStats,
        hackerMode, setHackerMode,
        showAssetManager, setShowAssetManager,
        showSpriteExtractor, setShowSpriteExtractor,
        showTutorial, setShowTutorial,
        showMarketplace, setShowMarketplace,
        advancedPhysics, setAdvancedPhysics,
        showSoundRecorder, setShowSoundRecorder,
        showAI3DCreator, setShowAI3DCreator,
        showMusicGenerator, setShowMusicGenerator,
        activeMission
    } = useStore();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setLeftPanelWidth(0);
            else setLeftPanelWidth(280);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setLeftPanelWidth]);

    const [localIsGeneratingSprite, setLocalIsGeneratingSprite] = useState(false);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const [showCodePageManager, setShowCodePageManager] = useState(false);
    const [is3DMode, setIs3DMode] = useState(false);

    // --- INITIAL SETUP ---
    useEffect(() => {
        const profile = updateStreak();
        setUserProfile(profile);

        // Check for "First Steps" badge if they have projects
        const projects = getProjects();
        if (projects.length > 0) {
            const { profile: updatedProfile, unlocked } = checkAndUnlockBadge('first_steps', 'First Steps', '🏆');
            if (unlocked) {
                setUserProfile(updatedProfile);
            }
        }

        // --- AUTO-TUTORIAL ---
        const tutorialShown = localStorage.getItem('tutorial_shown');
        if (!tutorialShown) {
            setTimeout(() => setShowTutorial(true), 2000); // Wait for initial loading
            localStorage.setItem('tutorial_shown', 'true');
        }
    }, []);

    const saveTimeoutRef = useRef<number | undefined>(undefined);
    const autoSaveIntervalRef = useRef<number | undefined>(undefined);

    // Application Refs for Performance
    const hardwareStateRef = useRef(hardwareState);
    const spriteStateRef = useRef(spriteState);
    const appStateRef = useRef(appState);
    const commandsRef = useRef(commands);

    // Sync Refs with Store State
    useEffect(() => { hardwareStateRef.current = hardwareState; }, [hardwareState]);
    useEffect(() => { spriteStateRef.current = spriteState; }, [spriteState]);
    useEffect(() => { appStateRef.current = appState; }, [appState]);
    useEffect(() => { commandsRef.current = commands; }, [commands]);

    // Game Canvas Size
    const [gameCanvasSize, setGameCanvasSize] = useState({ w: 400, h: 400 });
    const gameCanvasSizeRef = useRef(gameCanvasSize);

    // Initialize Code Interpreter Hook
    const {
        isPlaying,
        activeBlockId,
        executionSpeed,
        setExecutionSpeed,
        debugMode,
        setDebugMode,
        isPaused,
        highlightedPin,
        runCode,
        stopCode,
        resumeCode
    } = useCodeInterpreter({
        mode,
        commands,
        hardwareState,
        setHardwareState: (state: any) => {
            if (typeof state === 'function') updateHardwareState(state(hardwareState));
            else updateHardwareState(state);
        },
        hardwareStateRef,
        spriteState,
        setSpriteState: (state: any) => {
            if (typeof state === 'function') updateSpriteState(state(spriteState));
            else updateSpriteState(state);
        },
        spriteStateRef,
        appState,
        setAppState: (state: any) => {
            if (typeof state === 'function') updateAppState(state(appState));
            else updateAppState(state);
        },
        appStateRef
    });

    // Initialize Game Physics Hook
    const { tick, shakeAmount } = useGamePhysics({
        isPlaying,
        mode,
        spriteState,
        setSpriteState: (state: any) => {
            if (typeof state === 'function') updateSpriteState(state(spriteState));
            else updateSpriteState(state);
        },
        spriteStateRef,
        gameCanvasSizeRef
    });

    // Initialize Physics 2.0 (Matter.js) - currently parallel/background
    const { tick: matterTick } = useMatterPhysics({
        spriteState,
        setSpriteState: (state: any) => updateSpriteState(state),
        spriteStateRef,
        gameCanvasSizeRef,
        isExecuting: isPlaying && mode === AppMode.GAME // Only run when playing game
    });

    const isDraggingLeft = useRef(false);
    const isDraggingRight = useRef(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stageRef = useRef<StageHandle>(null);

    // --- PROJECT MANAGEMENT ---
    const saveCurrentProject = useCallback((isAutoSave = false) => {
        if (!currentProject) return;
        setSaveStatus('saving');
        const updatedProject: SavedProject = {
            ...currentProject,
            lastEdited: Date.now(),
            data: {
                commands,
                hardwareState,
                spriteState,
                appState,
                circuitComponents,
                pcbColor
            },
            thumbnail: stageRef.current?.getThumbnail() || undefined
        };
        saveProject(updatedProject);
        setProject(updatedProject);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(() => {
            setSaveStatus('saved');
        }, 1000);
    }, [currentProject, commands, hardwareState, spriteState, appState, circuitComponents, pcbColor, setProject, setSaveStatus]);

    const handleUpdateBlock = useCallback((id: string, params: any) => {
        const newCommands = [...commands];
        const index = newCommands.findIndex(c => c.id === id);
        if (index !== -1) {
            newCommands[index] = { ...newCommands[index], params: { ...newCommands[index].params, ...params } };
            setCommands(newCommands);
        }
    }, [commands, setCommands]);

    const handleDeleteBlock = useCallback((id: string) => {
        pushHistory();
        const newCmds = commands.filter(c => c.id !== id);
        setCommands(newCmds);
        playSoundEffect('click');
    }, [commands, pushHistory, setCommands]);

    const handleDuplicateBlock = useCallback((id: string) => {
        const index = commands.findIndex(c => c.id === id);
        if (index !== -1) {
            pushHistory();
            const copy = { ...commands[index], id: crypto.randomUUID() };
            const newCmds = [...commands];
            newCmds.splice(index + 1, 0, copy);
            setCommands(newCmds);
            playSoundEffect('click');
        }
    }, [commands, pushHistory, setCommands]);

    // --- INPUT HANDLING ---
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveCurrentProject(false); }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [undo, redo, saveCurrentProject]);

    useEffect(() => {
        if (currentProject && !showHome) {
            autoSaveIntervalRef.current = window.setInterval(() => {
                saveCurrentProject(true);
            }, 60000);
        }
        return () => {
            if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
        };
    }, [currentProject, showHome, saveCurrentProject]);

    const handleAppInteraction = useCallback((varName: string, value: any) => {
        updateAppState({ variables: { ...appState.variables, [varName]: value } });
    }, [appState.variables, updateAppState]);

    const handleNavigate = useCallback((scr: string) => {
        updateAppState({ activeScreen: scr });
    }, [updateAppState]);

    // === CODE PAGE MANAGER HANDLERS ===
    const handleCreateScreen = useCallback((screenName: string) => {
        updateAppState({
            screens: {
                ...appState.screens,
                [screenName]: []
            }
        });
        playSoundEffect('click');
    }, [appState.screens, updateAppState]);

    const handleDeleteScreen = useCallback((screenId: string) => {
        if (screenId === 'main') return; // Can't delete main screen
        const newScreens = { ...appState.screens };
        delete newScreens[screenId];
        updateAppState({ screens: newScreens, activeScreen: 'main' });
        playSoundEffect('click');
    }, [appState.screens, updateAppState]);

    const handleScreenChange = useCallback((screenId: string) => {
        updateAppState({ activeScreen: screenId });
    }, [updateAppState]);

    // === AI 3D CREATOR HANDLERS ===
    const handle3DAssetGenerated = useCallback((asset: any) => {
        // Add to asset library
        console.log('3D Asset generated:', asset);
        playSoundEffect('powerup');
        // In production, add to store/library
    }, []);

    const handleHardwareInput = useCallback((pin: number, pressed: boolean) => {
        const newPins = [...hardwareState.pins];
        newPins[pin] = pressed;
        updateHardwareState({ pins: newPins });
    }, [hardwareState.pins, updateHardwareState]);

    const handleAppendCode = useCallback((newCmds: any) => {
        pushHistory();
        setCommands([...commands, ...newCmds]);
    }, [commands, pushHistory, setCommands]);

    const handleReplaceCode = useCallback((newCmds: any[]) => {
        pushHistory();
        const withIds = newCmds.map(c => ({ ...c, id: crypto.randomUUID() }));
        setCommands(withIds);
    }, [pushHistory, setCommands]);

    const handleGenerateSprite = async () => {
        const prompt = window.prompt("What should your sprite look like?");
        if (!prompt) return;
        setLocalIsGeneratingSprite(true);
        const imgData = await generateSprite(prompt);
        if (imgData) {
            updateSpriteState({ texture: imgData, emoji: '' });
            playSoundEffect('powerup');
        }
        setLocalIsGeneratingSprite(false);
    };

    const konamiRef = useRef<string[]>([]);
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    useEffect(() => {
        const handleKonami = (e: KeyboardEvent) => {
            konamiRef.current = [...konamiRef.current, e.code].slice(-10);
            if (JSON.stringify(konamiRef.current) === JSON.stringify(KONAMI_CODE)) {
                const { hackerMode, setHackerMode } = useStore.getState();
                setHackerMode(!hackerMode);
                playSoundEffect('powerup');
                alert(hackerMode ? "Hacker Mode Deactivated." : "HACKER MODE ACTIVATED. Welcome to the Matrix.");
            }
        };
        window.addEventListener('keydown', handleKonami);
        return () => window.removeEventListener('keydown', handleKonami);
    }, []);

    // --- KEYBOARD SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (currentProject) {
                    let thumb = '';
                    if (stageRef.current) {
                        const canvas = stageRef.current.getCanvas();
                        if (canvas) thumb = captureThumbnail(canvas);
                    }

                    saveProject({
                        ...currentProject,
                        lastEdited: Date.now(),
                        data: {
                            commands: commandsRef.current,
                            hardwareState: hardwareStateRef.current,
                            spriteState: spriteStateRef.current,
                            appState: appStateRef.current,
                            circuitComponents: circuitComponents,
                            pcbColor: pcbColor
                        }
                    }, thumb);
                    setSaveStatus('saved');
                    playSoundEffect('click');
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                isPlaying ? stopCode() : runCode();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setLeftPanelWidth((prev: number) => prev === 0 ? 300 : 0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentProject, undo, redo, isPlaying, runCode, stopCode, circuitComponents, pcbColor]);

    // --- LAYOUT HANDLERS ---
    const handleMouseDownLeft = () => { isDraggingLeft.current = true; };
    const handleMouseDownRight = () => { isDraggingRight.current = true; };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingLeft.current) setLeftPanelWidth(Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, e.clientX - 64)));
            if (isDraggingRight.current) setRightPanelWidth(Math.max(MIN_RIGHT_WIDTH, Math.min(MAX_RIGHT_WIDTH, window.innerWidth - e.clientX)));
        };
        const handleMouseUp = () => { isDraggingLeft.current = false; isDraggingRight.current = false; setDraggedBlockId(null); setIsOverTrash(false); setDropIndex(null); };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [setLeftPanelWidth, setRightPanelWidth]);

    const handleUpgrade = (plan: PlanType) => {
        const updated = upgradeUserPlan(plan);
        setUserProfile(updated);
        setShowPricing(false);
        playSoundEffect('powerup');
        alert(`Welcome to ${plan.toUpperCase()}! All features unlocked.`);
    };

    return (
        <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} ${hackerMode ? 'hacker-mode' : ''}`}>
            {hackerMode && <div className="hacker-scanline" />}
            <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black animate-pulse">LOADING KIDCODE STUDIO...</div>}>
                {showGallery ? (
                    <GalleryPage onBack={() => setShowGallery(false)} />
                ) : showHome ? (
                    <HomeScreen />
                ) : (
                    <>
                        <TopBar
                            isPlaying={isPlaying}
                            debugMode={debugMode}
                            setDebugMode={setDebugMode}
                            isPaused={isPaused}
                            runCode={runCode}
                            stopCode={stopCode}
                            resumeCode={resumeCode}
                            currentProject={currentProject}
                            setProject={setProject}
                            saveStatus={saveStatus}
                            onOpenCodePages={() => setShowCodePageManager(true)}
                            is3DMode={is3DMode}
                            onToggle3D={() => setIs3DMode(!is3DMode)}
                        />

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            <Sidebar
                                handleAppendCode={handleAppendCode}
                                handleReplaceCode={handleReplaceCode}
                                handleGenerateSprite={handleGenerateSprite}
                                isGeneratingSprite={localIsGeneratingSprite}
                            />

                            {/* Main Workspace */}
                            <div key={`workspace-${mode}`} className="flex-1 bg-slate-100 dark:bg-slate-950 relative flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
                                <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-violet-500 transition-colors z-50 hidden lg:block" onMouseDown={handleMouseDownLeft} />

                                {draggedBlockId && (
                                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-full transition-all z-40 flex items-center gap-2 ${isOverTrash ? 'bg-red-500 text-white scale-110 shadow-xl rotate-6' : 'bg-white text-slate-400 shadow-lg'}`}
                                        onDragEnter={() => setIsOverTrash(true)}
                                        onDragLeave={() => setIsOverTrash(false)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => { e.preventDefault(); if (draggedBlockId) { setCommands(commands.filter(c => c.id !== draggedBlockId)); playSoundEffect('click'); } }}
                                    >
                                        <Trash size={24} className={isOverTrash ? "animate-bounce" : ""} />
                                        {isOverTrash && <span className="font-bold">Drop to Delete</span>}
                                    </div>
                                )}

                                <div className="flex-1 p-4 lg:p-8 custom-scrollbar space-y-1 relative" onDragOver={(e) => { e.preventDefault(); const blocks = document.querySelectorAll('.block-wrapper'); let closestIndex = commands.length; let minDistance = Number.POSITIVE_INFINITY; blocks.forEach((block, index) => { const rect = block.getBoundingClientRect(); const offset = e.clientY - (rect.top + rect.height / 2); if (Math.abs(offset) < minDistance) { minDistance = Math.abs(offset); if (offset < 0) closestIndex = index; else closestIndex = index + 1; } }); setDropIndex(closestIndex); }} onDragLeave={() => setDropIndex(null)} onDrop={(e) => { e.preventDefault(); try { const data = e.dataTransfer.getData('application/json'); if (!data) { if (draggedBlockId && dropIndex !== null) { let oldIndex = commands.findIndex(c => c.id === draggedBlockId); if (oldIndex !== -1) { const newCmds = [...commands]; const [moved] = newCmds.splice(oldIndex, 1); newCmds.splice(oldIndex < dropIndex ? dropIndex - 1 : dropIndex, 0, moved); setCommands(newCmds); playSoundEffect('click'); } } setDraggedBlockId(null); setDropIndex(null); return; }; const def = JSON.parse(data); if (def.type) { const newBlock: CommandBlock = { id: crypto.randomUUID(), type: def.type, params: { ...def.defaultParams } }; const newCmds = [...commands]; newCmds.splice(dropIndex !== null ? dropIndex : commands.length, 0, newBlock); setCommands(newCmds); playSoundEffect('click'); } } catch (err) { } setDropIndex(null); }}>
                                    {commands.length === 0 && (
                                        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 opacity-60 pointer-events-none animate-in zoom-in duration-500">
                                            <Box size={64} className="mb-4 text-slate-300 animate-bounce-sm" />
                                            <p className="font-bold text-xl text-center px-4">Drag blocks here to start coding!</p>
                                        </div>
                                    )}
                                    {commands.map((cmd, idx) => (
                                        <div key={cmd.id} className="block-wrapper">
                                            {dropIndex === idx && (
                                                <div className="border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl h-14 mb-2 flex items-center justify-center animate-pulse transition-all shadow-inner">
                                                    <span className="text-blue-500 font-bold text-sm tracking-widest">+ SNAP HERE</span>
                                                </div>
                                            )}
                                            <Block block={cmd} index={idx} mode={mode} onUpdate={handleUpdateBlock} onDelete={handleDeleteBlock} onDuplicate={handleDuplicateBlock} isDraggable={!isPlaying} onDragStart={(e) => { setDraggedBlockId(cmd.id); e.dataTransfer.effectAllowed = 'move'; const img = new Image(); img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; e.dataTransfer.setDragImage(img, 0, 0); }} isActive={false} />
                                        </div>
                                    ))}
                                    {dropIndex === commands.length && (
                                        <div className="border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl h-14 mb-2 flex items-center justify-center animate-pulse transition-all shadow-inner">
                                            <span className="text-blue-500 font-bold text-sm tracking-widest">+ SNAP HERE</span>
                                        </div>
                                    )}
                                    <div className="h-40" />
                                </div>
                            </div>

                            {/* Stage Area */}
                            <div key={`stage-${mode}`} className="bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col relative z-20 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500" style={{ width: isMobile ? '100%' : rightPanelWidth }}>
                                <div className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-violet-500 transition-colors z-50 hidden lg:block" onMouseDown={handleMouseDownRight} />
                                <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative min-h-[300px]">
                                    {is3DMode && mode === AppMode.GAME ? (
                                        <Stage3D
                                            ref={stageRef as any}
                                            spriteState={spriteState}
                                            spriteStateRef={spriteStateRef}
                                            isExecuting={isPlaying}
                                            shakeAmount={shakeAmount}
                                            gameCanvasSize={gameCanvasSize}
                                            onInput={() => { }}
                                        />
                                    ) : (
                                        <Stage
                                            ref={stageRef}
                                            mode={mode}
                                            hardwareState={hardwareState}
                                            hardwareStateRef={hardwareStateRef}
                                            spriteState={spriteState}
                                            spriteStateRef={spriteStateRef}
                                            appState={appState}
                                            canvasRef={canvasRef}
                                            circuitComponents={circuitComponents}
                                            onCircuitUpdate={setCircuitComponents}
                                            pcbColor={pcbColor}
                                            setPcbColor={setPcbColor}
                                            isExecuting={isPlaying}
                                            onNavigate={handleNavigate}
                                            highlightPin={highlightedPin}
                                            inputState={null as any}
                                            onInput={() => { }}
                                            onHardwareInput={handleHardwareInput}
                                            onUpdateSpriteState={updateSpriteState}
                                            shakeAmount={shakeAmount}
                                            onAppInteraction={handleAppInteraction}
                                            onTick={advancedPhysics ? matterTick : tick}
                                        />)}
                                </div>
                                <div className={`h-40 bg-slate-900 text-slate-300 font-mono text-xs overflow-y-auto p-2 border-t border-slate-700 transition-all ${showConsole ? 'block' : 'hidden'}`}>
                                    <div className="flex justify-between items-center mb-1 text-slate-500 text-[10px] uppercase font-bold sticky top-0 bg-slate-900">
                                        <span>Console Output</span>
                                        <button onClick={clearLogs} className="hover:text-white">Clear</button>
                                    </div>
                                    {consoleLogs.map((log, i) => <div key={i} className="border-b border-white/5 py-0.5">{log}</div>)}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* MODALS */}
                <Suspense fallback={null}>
                    {showProfile && <ProfileModal user={userProfile} onClose={() => setShowProfile(false)} onUpdateUser={setUserProfile} onLoadProject={(p) => setProject(p)} />}
                    {showPricing && <PricingModal currentPlan={userProfile.plan} onClose={() => setShowPricing(false)} onUpgrade={handleUpgrade} />}
                    {showPixelEditor && <PixelEditor onClose={() => setShowPixelEditor(false)} onSave={(img) => { updateSpriteState({ texture: img, emoji: '' }); setShowPixelEditor(false); }} initialTexture={spriteState.texture} />}
                    {showSoundEditor && <SoundEditor onClose={() => setShowSoundEditor(false)} />}
                    {showMusicStudio && <MusicStudio onClose={() => setShowMusicStudio(false)} />}
                    {showSoundRecorder && <SoundRecorder onClose={() => setShowSoundRecorder(false)} />}
                    {showAssetManager && <AssetManagerModal onClose={() => setShowAssetManager(false)} />}
                    {showMarketplace && <MarketplaceModal onClose={() => setShowMarketplace(false)} />}
                    {showVariables && <VariableMonitor variables={mode === AppMode.APP ? appState.variables : spriteState.variables} isVisible={showVariables} onClose={() => setShowVariables(false)} />}
                    {showMissions && <MissionOverlay activeMission={activeMission} mode={mode} onSelectMission={(m) => { useStore.getState().setActiveMission(m); }} onClose={() => setShowMissions(false)} />}
                    {showCodePageManager && (
                        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[100]">
                            <CodePageManager
                                commands={commands}
                                appState={appState}
                                activeScreen={appState.activeScreen}
                                onScreenChange={handleScreenChange}
                                onCreateScreen={handleCreateScreen}
                                onDeleteScreen={handleDeleteScreen}
                            />
                            <button
                                onClick={() => setShowCodePageManager(false)}
                                className="absolute top-4 right-4 p-3 bg-white dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-full shadow-2xl transition-all z-50"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}
                    {showAI3DCreator && (
                        <AI3DCreator
                            onAssetGenerated={handle3DAssetGenerated}
                            onClose={() => setShowAI3DCreator(false)}
                        />
                    )}
                    {showMusicGenerator && (
                        <MusicGenerator
                            onMusicGenerated={(music) => console.log('Music generated:', music)}
                            onClose={() => setShowMusicGenerator(false)}
                        />
                    )}
                    {showSpriteExtractor && (
                        <SpriteExtractor
                            onSpriteExtracted={(result) => console.log('Sprite extracted:', result)}
                            onClose={() => setShowSpriteExtractor(false)}
                        />
                    )}
                    {showTutorial && <TutorialLauncher onClose={() => setShowTutorial(false)} />}
                </Suspense>
                <NPCModal />
                <GameOverModal onRestart={runCode} />
                <ParticleEditor />
                <HelpModal />
                {showStats && <ProjectStatsModal onClose={() => setShowStats(false)} />}
            </Suspense>
        </div>
    );
};
export default App;
