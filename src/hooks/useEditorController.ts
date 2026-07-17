import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { AppMode, CommandBlock, PlanType } from '../types';
import { useStore } from '../store/useStore';
import { useCodeInterpreter } from './useCodeInterpreter';
import { useGamePhysics } from './useGamePhysics';
import { playSoundEffect } from '../services/soundService';
import { getProjects, saveProject, SavedProject, captureThumbnail } from '../services/storageService';
import { generateThumbnail, generateThumbnailFromStage } from '../services/thumbnailGenerator';
import { generateSprite } from '../services/geminiService';
import { addXp as originalAddXp, upgradeUserPlan, updateStreak, checkAndUnlockBadge } from '../services/userService';
import { getUndoManager } from '../services/undoManager';
import { saveProjectIndexedDB, saveProjectCompressedIndexedDB } from '../services/storageIndexedDB';
import { registerBuiltInComponents } from '../services/componentRegistry.tsx';
import { createSpriteStateAdapter } from '../services/gameUtils';
import { equipItem, useItem, unlockSkill, craftItem, Equipment } from '../services/rpgSystemsExtended';
import { getCharacterStats } from '../services/rpgEngine';
import type { StageHandle } from '../components/Stage';
import { DEFAULT_SCREEN, STORAGE_KEYS } from '../constants/actions';

const MIN_LEFT_WIDTH = 220;
const MAX_LEFT_WIDTH = 400;
const MIN_RIGHT_WIDTH = 320;
const MAX_RIGHT_WIDTH = 600;

let saveWorker: Worker | null = null;
const getSaveWorker = (): Worker => {
  if (!saveWorker) {
    saveWorker = new Worker(new URL('../workers/saveWorker.ts', import.meta.url), { type: 'module' });
  }
  return saveWorker;
};

export function useEditorController() {
    const { toast } = useToast();

    const {
        showLanding, showHome, showGallery, mode, setMode,
        commands, setCommands,
        history, pushHistory, undo, redo,
        currentProject, setProject, saveStatus, setSaveStatus,
        hardwareState, updateHardwareState,
        spriteState, updateSpriteState,
        appState, updateAppState,
        consoleLogs, clearLogs, showConsole,
        userProfile, setUserProfile,
        showProfile, setShowProfile,
        showPricing, setShowPricing,
        circuitComponents, setCircuitComponents,
        wires, setWires, pcbColor, setPcbColor,
        showMissions, setShowMissions,
        showPixelEditor, setShowPixelEditor,
        showSoundEditor, setShowSoundEditor,
        showVariables, setShowVariables,
        leftPanelWidth, setLeftPanelWidth,
        rightPanelWidth, setRightPanelWidth,
        showStats, setShowStats,
        showAssetManager, setShowAssetManager,
        showSpriteExtractor, setShowSpriteExtractor,
        showTutorial, setShowTutorial,
        advancedPhysics, setAdvancedPhysics,
        showSoundRecorder, setShowSoundRecorder,
        showAI3DCreator, setShowAI3DCreator,
        showMusicGenerator, setShowMusicGenerator,
        showMusicStudio, setShowMusicStudio,
        hackerMode, setHackerMode,
        activeMission, activeTycoonGame, setActiveTycoonGame,
        showCodePageManager, setShowCodePageManager,
        is3DMode, setIs3DMode,
        showFirstWinCelebration, setShowFirstWinCelebration,
        showQuestEditor, setShowQuestEditor,
        showEquipment, setShowEquipment,
        showCrafting, setShowCrafting,
        showSkillTree, setShowSkillTree,
        showShopOverlay, setShowShopOverlay,
        showShortcuts, setShowShortcuts,
        showStudioManager, setShowStudioManager,
        showStudioDetail, setShowStudioDetail,
        showAddToStudio, setShowAddToStudio,
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
    const [showSpritePrompt, setShowSpritePrompt] = useState(false);
    const [spritePromptText, setSpritePromptText] = useState('');
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const [hasRunCode, setHasRunCode] = useState(false);
    const [xpNotifications, setXpNotifications] = useState<Array<{ id: string; amount: number; reason: string; icon?: 'star' | 'trophy' | 'trend' }>>([]);
    const [viewVisible, setViewVisible] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; blockId: string } | null>(null);
    const [gameCanvasSize, setGameCanvasSize] = useState({ w: 400, h: 400 });

    const prevViewRef = useRef<string>('');
    const saveTimeoutRef = useRef<number | undefined>(undefined);
    const autoSaveIntervalRef = useRef<number | undefined>(undefined);
    const hardwareStateRef = useRef(hardwareState);
    const spriteStateRef = useRef(spriteState);
    const appStateRef = useRef(appState);
    const commandsRef = useRef(commands);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const prevCommandsLengthRef = useRef(commands.length);
    const gameCanvasSizeRef = useRef(gameCanvasSize);
    const isDraggingLeft = useRef(false);
    const isDraggingRight = useRef(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stageRef = useRef<StageHandle>(null);
    const konamiRef = useRef<string[]>([]);

    useEffect(() => { hardwareStateRef.current = hardwareState; }, [hardwareState]);
    useEffect(() => { spriteStateRef.current = spriteState; }, [spriteState]);
    useEffect(() => { appStateRef.current = appState; }, [appState]);
    useEffect(() => { commandsRef.current = commands; }, [commands]);

    const adaptedSetHardwareState = useCallback(createSpriteStateAdapter(updateHardwareState, hardwareState), [hardwareState]);
    const adaptedSetSpriteState = useCallback(createSpriteStateAdapter(updateSpriteState, spriteState), [spriteState]);
    const adaptedSetAppState = useCallback(createSpriteStateAdapter(updateAppState, appState), [appState]);

    useEffect(() => {
        if (commands.length > prevCommandsLengthRef.current && workspaceRef.current) {
            setTimeout(() => {
                workspaceRef.current?.scrollTo({ top: workspaceRef.current.scrollHeight, behavior: 'smooth' });
            }, 50);
        }
        prevCommandsLengthRef.current = commands.length;
    }, [commands.length]);

    const {
        isPlaying, activeBlockId, executionSpeed, setExecutionSpeed,
        debugMode, setDebugMode, isPaused, highlightedPin,
        runCode: originalRunCode, stopCode, resumeCode, forceRestart
    } = useCodeInterpreter({
        mode, commands, hardwareState, setHardwareState: adaptedSetHardwareState,
        hardwareStateRef, spriteState, setSpriteState: adaptedSetSpriteState,
        spriteStateRef, appState, setAppState: adaptedSetAppState,
        appStateRef, circuitComponents,
    });

    const runCode = useCallback(() => {
        if (!hasRunCode && commands.length > 0) {
            setHasRunCode(true);
            setShowFirstWinCelebration(true);
            addXp(50, 'First Code Run!', 'star');
            playSoundEffect('powerup');
        }
        originalRunCode();
    }, [hasRunCode, commands.length, originalRunCode]);

    const restartCode = useCallback(() => {
        forceRestart();
    }, [forceRestart]);

    const autoExecuteTimeoutRef = useRef<number | undefined>(undefined);
    const isPlayingRef = useRef(isPlaying);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        if (commands.length === 0) return;

        if (autoExecuteTimeoutRef.current) clearTimeout(autoExecuteTimeoutRef.current);

        autoExecuteTimeoutRef.current = window.setTimeout(() => {
            const doRun = () => {
                if (isPlayingRef.current) {
                    stopCode();
                    setTimeout(doRun, 50);
                } else {
                    originalRunCode();
                }
            };
            doRun();
        }, 500);

        return () => {
            if (autoExecuteTimeoutRef.current) clearTimeout(autoExecuteTimeoutRef.current);
        };
    }, [commands]);

    const addXp = useCallback((amount: number, reason: string, icon?: 'star' | 'trophy' | 'trend') => {
        const id = crypto.randomUUID();
        setXpNotifications(prev => [...prev, { id, amount, reason, icon }]);
        originalAddXp(amount);
    }, []);

    const { tick, shakeAmount } = useGamePhysics({
        isPlaying, mode, spriteState,
        setSpriteState: adaptedSetSpriteState, spriteStateRef, gameCanvasSizeRef,
    });

    const [matterTick, setMatterTick] = useState<(() => void) | null>(null);

    useEffect(() => {
        const targetView = showLanding ? 'landing' : showGallery ? 'gallery' : showHome ? 'home' : 'editor';
        if (prevViewRef.current && prevViewRef.current !== targetView) {
            setViewVisible(false);
            const timer = setTimeout(() => setViewVisible(true), 150);
            return () => clearTimeout(timer);
        }
        prevViewRef.current = targetView;
    }, [showLanding, showHome, showGallery]);

    useEffect(() => {
        const profile = updateStreak();
        setUserProfile(profile);
        const projects = getProjects();
        if (projects.length > 0) {
            const { profile: updatedProfile, unlocked } = checkAndUnlockBadge('first_steps', 'First Steps', '🏆');
            if (unlocked) setUserProfile(updatedProfile);
        }
        const undoManager = getUndoManager(useStore);
        const cleanupKeyboard = undoManager.setupKeyboardShortcuts();
        registerBuiltInComponents();
        const tutorialShown = localStorage.getItem(STORAGE_KEYS.TUTORIAL_SHOWN);
        if (!tutorialShown) {
            setTimeout(() => setShowTutorial(true), 2000);
            localStorage.setItem(STORAGE_KEYS.TUTORIAL_SHOWN, 'true');
        }
        const handleTutorialKey = (e: KeyboardEvent) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
                e.preventDefault();
                setShowTutorial(true);
            }
        };
        window.addEventListener('keydown', handleTutorialKey);
        return () => { cleanupKeyboard(); window.removeEventListener('keydown', handleTutorialKey); };
    }, []);

    const saveCurrentProject = useCallback(async (isAutoSave = false) => {
        if (!currentProject) return;
        setSaveStatus('saving');
        const updatedProject: SavedProject = {
            ...currentProject,
            id: currentProject.id || crypto.randomUUID(),
            lastEdited: Date.now(),
            data: { commands, hardwareState, spriteState, appState, circuitComponents, wires, pcbColor },
            thumbnail: stageRef.current?.getThumbnail() || undefined,
        };
        try {
            if (isAutoSave && typeof Worker !== 'undefined') {
                const worker = getSaveWorker();
                const compressed = await new Promise<string>((resolve, reject) => {
                    const handler = (e: MessageEvent) => {
                        if (e.data.type === 'saved') {
                            worker.removeEventListener('message', handler);
                            if (e.data.success) resolve(e.data.compressed);
                            else reject(new Error(e.data.error));
                        }
                    };
                    worker.addEventListener('message', handler);
                    worker.postMessage({ type: 'save', project: updatedProject, thumbnail: updatedProject.thumbnail });
                });
                await saveProjectCompressedIndexedDB(
                    updatedProject.id,
                    compressed,
                    updatedProject.name,
                    updatedProject.mode,
                    updatedProject.lastEdited,
                    updatedProject.thumbnail
                );
            } else {
                await saveProjectIndexedDB(updatedProject);
            }
        } catch (error) {
            console.error('IndexedDB save failed, using localStorage:', error);
            const saveResult = saveProject(updatedProject);
            if (saveResult === 'limit-reached') {
                toast('error', 'Project limit reached. Delete old projects to save new ones.');
            } else if (saveResult === 'limit-warning') {
                toast('warning', 'Approaching project limit! You can save up to 10 projects.');
            }
        }
        setProject(updatedProject);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(() => setSaveStatus('saved'), 1000);
    }, [currentProject, commands, hardwareState, spriteState, appState, circuitComponents, wires, pcbColor, setProject, setSaveStatus]);

    useEffect(() => {
        if (currentProject && !showHome) {
            autoSaveIntervalRef.current = window.setInterval(() => saveCurrentProject(true), 30000);
        }
        return () => { if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current); };
    }, [currentProject, showHome, saveCurrentProject]);

    useEffect(() => {
        const handleBeforeUnload = () => { if (currentProject) saveCurrentProject(true); };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentProject, saveCurrentProject]);

    const handleUpdateBlock = useCallback((id: string, params: Partial<CommandBlock['params']>) => {
        const newCommands = [...commands];
        const index = newCommands.findIndex(c => c.id === id);
        if (index !== -1) {
            newCommands[index] = { ...newCommands[index], params: { ...newCommands[index].params, ...params } };
            setCommands(newCommands);
        }
    }, [commands, setCommands]);

    const handleDeleteBlock = useCallback((id: string) => {
        pushHistory();
        setCommands(commands.filter(c => c.id !== id));
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

    const handleAppInteraction = useCallback((varName: string, value: string | number | boolean) => {
        updateAppState({ variables: { ...appState.variables, [varName]: value } });
    }, [appState.variables, updateAppState]);

    const handleNavigate = useCallback((scr: string) => {
        updateAppState({ activeScreen: scr });
    }, [updateAppState]);

    const handleCreateScreen = useCallback((screenName: string) => {
        updateAppState({ screens: { ...appState.screens, [screenName]: [] } });
        playSoundEffect('click');
    }, [appState.screens, updateAppState]);

    const handleDeleteScreen = useCallback((screenId: string) => {
        if (screenId === DEFAULT_SCREEN) return;
        const newScreens = { ...appState.screens };
        delete newScreens[screenId];
        updateAppState({ screens: newScreens, activeScreen: DEFAULT_SCREEN });
        playSoundEffect('click');
    }, [appState.screens, updateAppState]);

    const handleScreenChange = useCallback((screenId: string) => {
        updateAppState({ activeScreen: screenId });
    }, [updateAppState]);

    const handle3DAssetGenerated = useCallback((voxels: unknown[]) => {
        playSoundEffect('powerup');
    }, []);

    const handleHardwareInput = useCallback((pin: number, value: boolean | { type: string; value: unknown }) => {
        if (typeof value === 'object' && value.type === 'motorLoad') {
            updateHardwareState({ motorLoad: value.value as number });
        } else if (typeof value === 'object' && value.type === 'powerDraw') {
            updateHardwareState({ powerDraw: value.value as number });
        } else if (typeof value === 'object' && value.type === 'multimeter') {
            const mv = value.value as { v: number; i: number; r: number; short: boolean };
            updateHardwareState({
                multimeterVoltage: mv.v, multimeterCurrent: mv.i,
                multimeterResistance: Math.round(mv.r), isShortCircuit: mv.short,
            });
        } else {
            const newPins = [...hardwareState.pins];
            newPins[pin] = value as boolean;
            updateHardwareState({ pins: newPins });
        }
    }, [hardwareState.pins, updateHardwareState]);

    const handleAppendCode = useCallback((newCmds: CommandBlock[]) => {
        pushHistory();
        setCommands([...commands, ...newCmds]);
    }, [commands, pushHistory, setCommands]);

    const handleReplaceCode = useCallback((newCmds: CommandBlock[]) => {
        pushHistory();
        setCommands(newCmds.map(c => ({ ...c, id: crypto.randomUUID() })));
    }, [pushHistory, setCommands]);

    const handleGenerateSprite = useCallback(() => {
        setSpritePromptText('');
        setShowSpritePrompt(true);
    }, []);

    const handleConfirmSprite = useCallback(async () => {
        if (!spritePromptText.trim()) return;
        setShowSpritePrompt(false);
        setLocalIsGeneratingSprite(true);
        const imgData = await generateSprite(spritePromptText);
        if (imgData) {
            updateSpriteState({ texture: imgData, emoji: '' });
            playSoundEffect('powerup');
        }
        setLocalIsGeneratingSprite(false);
    }, [spritePromptText]);

    const handleUpgrade = useCallback((plan: PlanType) => {
        const updated = upgradeUserPlan(plan);
        setUserProfile(updated);
        setShowPricing(false);
        playSoundEffect('powerup');
        toast('success', `Welcome to ${plan.toUpperCase()}! All features unlocked.`);
    }, []);

    const captureScreenshot = useCallback(() => {
        const thumbnail = generateThumbnailFromStage(stageRef);
        if (!thumbnail) {
            toast('warning', 'Could not capture screenshot.');
            return;
        }
        if (currentProject) {
            const updatedProject = { ...currentProject, thumbnail, lastEdited: Date.now() };
            setProject(updatedProject);
            saveProjectIndexedDB(updatedProject);
            toast('success', 'Screenshot captured!');
        }
        return thumbnail;
    }, [currentProject, setProject, toast]);

    useEffect(() => {
        const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        const handleKonami = (e: KeyboardEvent) => {
            konamiRef.current = [...konamiRef.current, e.code].slice(-10);
            if (JSON.stringify(konamiRef.current) === JSON.stringify(KONAMI_CODE)) {
                const { hackerMode: hm, setHackerMode: shm } = useStore.getState();
                shm(!hm);
                playSoundEffect('powerup');
                toast('info', hm ? "Hacker Mode Deactivated." : "HACKER MODE ACTIVATED. Welcome to the Matrix.");
            }
        };
        window.addEventListener('keydown', handleKonami);
        return () => window.removeEventListener('keydown', handleKonami);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('toggle-command-palette'));
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (currentProject) {
                    let thumb = '';
                    if (stageRef.current) {
                        const canvas = stageRef.current.getCanvas();
                        if (canvas) thumb = captureThumbnail(canvas);
                    }
                    saveProject({
                        ...currentProject, lastEdited: Date.now(),
                        data: {
                            commands: commandsRef.current, hardwareState: hardwareStateRef.current,
                            spriteState: spriteStateRef.current, appState: appStateRef.current,
                            circuitComponents, wires, pcbColor,
                        },
                    }, thumb);
                    setSaveStatus('saved');
                    playSoundEffect('click');
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') { e.preventDefault(); if (isPlaying) stopCode(); else runCode(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setLeftPanelWidth((prev: number) => prev === 0 ? 300 : 0); }
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                const s = useStore.getState();
                s.setShowShortcuts(!s.showShortcuts);
            }
            if (mode === AppMode.GAME && isPlaying) {
                const s = useStore.getState();
                if (e.key === 'e' || e.key === 'E') { e.preventDefault(); s.setShowEquipment(!s.showEquipment); }
                if (e.key === 'c' || e.key === 'C') { e.preventDefault(); s.setShowCrafting(!s.showCrafting); }
                if (e.key === 't' || e.key === 'T') { e.preventDefault(); s.setShowSkillTree(!s.showSkillTree); }
                if (e.key === 'g' || e.key === 'G') { e.preventDefault(); s.setShowShopOverlay(!s.showShopOverlay); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentProject, undo, redo, isPlaying, runCode, stopCode, mode]);

    const handleMouseDownLeft = useCallback(() => { isDraggingLeft.current = true; }, []);
    const handleMouseDownRight = useCallback(() => { isDraggingRight.current = true; }, []);

    const handleWorkspaceDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const blocks = document.querySelectorAll('.block-wrapper');
        let closestIndex = commands.length;
        let minDistance = Number.POSITIVE_INFINITY;
        blocks.forEach((block, index) => {
            const rect = block.getBoundingClientRect();
            const offset = e.clientY - (rect.top + rect.height / 2);
            if (Math.abs(offset) < minDistance) {
                minDistance = Math.abs(offset);
                closestIndex = offset < 0 ? index : index + 1;
            }
        });
        setDropIndex(closestIndex);
    }, [commands.length]);

    const handleWorkspaceDragLeave = useCallback(() => setDropIndex(null), []);

    const handleWorkspaceDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        try {
            const data = e.dataTransfer.getData('application/json');
            if (!data) {
                if (draggedBlockId && dropIndex !== null) {
                    const oldIndex = commands.findIndex(c => c.id === draggedBlockId);
                    if (oldIndex !== -1) {
                        const newCmds = [...commands];
                        const [moved] = newCmds.splice(oldIndex, 1);
                        newCmds.splice(oldIndex < dropIndex ? dropIndex - 1 : dropIndex, 0, moved);
                        setCommands(newCmds);
                        playSoundEffect('click');
                    }
                }
                setDraggedBlockId(null);
                setDropIndex(null);
                return;
            }
            const def = JSON.parse(data);
            if (def.type) {
                const newBlock: CommandBlock = { id: crypto.randomUUID(), type: def.type, params: { ...def.defaultParams } };
                const newCmds = [...commands];
                newCmds.splice(dropIndex !== null ? dropIndex : commands.length, 0, newBlock);
                setCommands(newCmds);
                playSoundEffect('click');
            }
        } catch (err) { void 0; }
        setDropIndex(null);
    }, [commands, draggedBlockId, dropIndex, setCommands]);

    const handleTrashDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (draggedBlockId) {
            setCommands(commands.filter(c => c.id !== draggedBlockId));
            playSoundEffect('click');
        }
    }, [commands, draggedBlockId, setCommands]);

    const handleTrashDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

    useEffect(() => {
        let rafId: number | null = null;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (isDraggingLeft.current) setLeftPanelWidth(Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, e.clientX - 64)));
                if (isDraggingRight.current) setRightPanelWidth(Math.max(MIN_RIGHT_WIDTH, Math.min(MAX_RIGHT_WIDTH, window.innerWidth - e.clientX)));
            });
        };
        const handleMouseUp = () => {
            isDraggingLeft.current = false;
            isDraggingRight.current = false;
            setDraggedBlockId(null);
            setIsOverTrash(false);
            setDropIndex(null);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [setLeftPanelWidth, setRightPanelWidth]);

    return {
        isMobile, viewVisible,
        isPlaying, activeBlockId, debugMode, setDebugMode, isPaused, runCode, stopCode, resumeCode, restartCode,
        currentProject, setProject, saveStatus,
        mode, commands,
        dropIndex, setDropIndex, draggedBlockId, setDraggedBlockId,
        isOverTrash, setIsOverTrash,
        handleUpdateBlock, handleDeleteBlock, handleDuplicateBlock,
        setContextMenu, contextMenu,
        handleWorkspaceDragOver, handleWorkspaceDragLeave, handleWorkspaceDrop,
        handleTrashDragOver, handleTrashDrop,
        workspaceRef, stageRef, canvasRef,
        rightPanelWidth, leftPanelWidth,
        hardwareState, hardwareStateRef, spriteState, spriteStateRef,
        appState, circuitComponents, setCircuitComponents,
        pcbColor, setPcbColor, wires, setWires,
        handleNavigate, highlightedPin, handleHardwareInput,
        updateSpriteState, shakeAmount, handleAppInteraction,
        tick, matterTick, setMatterTick, advancedPhysics,
        gameCanvasSize, gameCanvasSizeRef, adaptedSetSpriteState,
        showConsole, consoleLogs, clearLogs,
        handleMouseDownLeft, handleMouseDownRight,
        handleAppendCode, handleReplaceCode,
        handleGenerateSprite, localIsGeneratingSprite,
        handleCreateScreen, handleDeleteScreen, handleScreenChange,
        handle3DAssetGenerated, handleUpgrade,
        showProfile, setShowProfile, userProfile, setUserProfile,
        showPricing, setShowPricing,
        showPixelEditor, setShowPixelEditor,
        showSoundEditor, setShowSoundEditor,
        showMusicStudio, setShowMusicStudio,
        showSoundRecorder, setShowSoundRecorder,
        showAssetManager, setShowAssetManager,
        showVariables, setShowVariables,
        showMissions, setShowMissions, activeMission,
        showFirstWinCelebration, setShowFirstWinCelebration,
        xpNotifications, setXpNotifications,
        showCodePageManager, setShowCodePageManager,
        is3DMode, setIs3DMode,
        showAI3DCreator, setShowAI3DCreator,
        showMusicGenerator, setShowMusicGenerator,
        showSpriteExtractor, setShowSpriteExtractor,
        showTutorial, setShowTutorial,
        showSpritePrompt, setShowSpritePrompt,
        spritePromptText, setSpritePromptText,
        handleConfirmSprite,
        showStats, setShowStats,
        showQuestEditor, setShowQuestEditor,
        showEquipment, setShowEquipment,
        showCrafting, setShowCrafting,
        showSkillTree, setShowSkillTree,
        showShopOverlay, setShowShopOverlay,
        showShortcuts, setShowShortcuts,
        hackerMode, activeTycoonGame, setActiveTycoonGame,
        showStudioManager, setShowStudioManager,
        showStudioDetail, setShowStudioDetail,
        showAddToStudio, setShowAddToStudio,
        setLeftPanelWidth,
        captureScreenshot,
    };
}
