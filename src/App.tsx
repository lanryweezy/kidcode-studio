
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppMode, AppState, CommandBlock, CommandType, HardwareState, SpriteState, BlockDefinition, CircuitComponent, ComponentType, Mission, GameEntity, AppElement, UserProfile } from './types';
import { AVAILABLE_BLOCKS, INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE, MODE_CONFIG, UI_PALETTE, CIRCUIT_PALETTE, LEVEL_PALETTE, CHARACTER_PALETTE, VEHICLE_PALETTE } from './constants';
import Block from './components/Block';
import Stage, { StageHandle } from './components/Stage';
import AIChat from './components/AIChat';
import CodeViewer from './components/CodeViewer'; 
import MissionOverlay from './components/MissionOverlay';
import SidebarDock from './components/SidebarDock';
import ContextMenu from './components/ContextMenu'; 
import PixelEditor from './components/PixelEditor'; 
import SoundEditor from './components/SoundEditor';
import SettingsModal from './components/SettingsModal';
import VariableMonitor from './components/VariableMonitor';
import ProfileModal from './components/ProfileModal';
import { playSoundEffect, playTone, playSpeakerSound } from './services/soundService';
import { getProjects, saveProject, createNewProject, SavedProject, exportProjectToFile, importProjectFromFile } from './services/storageService';
import { generateCode } from './services/codeGenerator';
import { getUserProfile, addXp, DEFAULT_USER } from './services/userService';
import { Play, Trash, Plus, ChevronDown, ChevronRight, Undo2, Redo2, FileCode, Camera, Trophy, Search, Sliders, Code2, Paintbrush, Zap, Upload, Box, TableProperties, Terminal, Car, User, Music, X, ZoomIn, ZoomOut, RotateCcw, Cloud, Check, Bug, Pause, StepForward, Disc, Home, Save } from 'lucide-react';

const MIN_LEFT_WIDTH = 220;
const MAX_LEFT_WIDTH = 400;
const MIN_RIGHT_WIDTH = 320;
const MAX_RIGHT_WIDTH = 600;

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [showHome, setShowHome] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.APP);
  const [activeTab, setActiveTab] = useState('code'); 
  const [darkMode, setDarkMode] = useState(false);

  const [history, setHistory] = useState<CommandBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<CommandBlock[][]>([]);
  const [commands, setCommands] = useState<CommandBlock[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [executionSpeed, setExecutionSpeed] = useState(1); 
  
  // Debugger States
  const [debugMode, setDebugMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const resumeRef = useRef<() => void>(() => {});
  
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimeoutRef = useRef<number>();
  const autoSaveIntervalRef = useRef<number>();
  
  // Application State
  const [hardwareState, setHardwareState] = useState<HardwareState>(INITIAL_HARDWARE_STATE);
  const [spriteState, setSpriteState] = useState<SpriteState>(INITIAL_SPRITE_STATE);
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setUserProfile(getUserProfile());
  }, []);

  const updateSpriteState = (newState: Partial<SpriteState>) => {
    setSpriteState(prev => ({ ...prev, ...newState }));
  };
  
  // Input State (Keyboard + Virtual Joystick)
  const activeInputs = useRef<Set<string>>(new Set());
  
  // Refs for Live Execution Reading (Critical for async loops)
  const hardwareStateRef = useRef(hardwareState);
  const spriteStateRef = useRef(spriteState);
  const appStateRef = useRef(appState);

  // Sync Refs with State
  useEffect(() => { hardwareStateRef.current = hardwareState; }, [hardwareState]);
  useEffect(() => { spriteStateRef.current = spriteState; }, [spriteState]);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([]);
  const [pcbColor, setPcbColor] = useState<string>('#059669'); 
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [highlightedPin, setHighlightedPin] = useState<number | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedToolType, setDraggedToolType] = useState<CommandType | ComponentType | null>(null);
  const [hoveredBlockDef, setHoveredBlockDef] = useState<BlockDefinition | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  
  // DRAG & DROP REORDERING STATE
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  
  const [recentProjects, setRecentProjects] = useState<SavedProject[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showMissions, setShowMissions] = useState(false);
  const [showPixelEditor, setShowPixelEditor] = useState(false); 
  const [showSoundEditor, setShowSoundEditor] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  
  const [selectedAppElementId, setSelectedAppElementId] = useState<string | null>(null);
  const [circuitSearch, setCircuitSearch] = useState('');
  const [blockSearch, setBlockSearch] = useState('');
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; blockId: string } | null>(null);

  // Layout State
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  const [zoomLevel, setZoomLevel] = useState(1);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  
  // Interpreter State for Multi-screen App Building
  const renderingScreen = useRef<string>('main');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<StageHandle>(null);
  const stopExecution = useRef(false);
  const speedRef = useRef(1);
  const shakeTimer = useRef(0);
  const bounceEnabled = useRef(false);
  const invincibilityTimer = useRef(0); // Cooldown for damage

  useEffect(() => {
    speedRef.current = executionSpeed;
  }, [executionSpeed]);

  // --- LAYOUT HANDLERS ---
  const handleMouseDownLeft = () => { isDraggingLeft.current = true; };
  const handleMouseDownRight = () => { isDraggingRight.current = true; };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft.current) {
        // Offset by SidebarDock width (64px)
        const newWidth = Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, e.clientX - 64));
        setLeftPanelWidth(newWidth);
      }
      if (isDraggingRight.current) {
        const newWidth = Math.max(MIN_RIGHT_WIDTH, Math.min(MAX_RIGHT_WIDTH, window.innerWidth - e.clientX));
        setRightPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      setDraggedBlockId(null); // Ensure cleanup
      setIsOverTrash(false);
      setDropIndex(null); // Clear drop indicator
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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
    setCurrentProject(updatedProject);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus('saved');
    }, 1000);
  }, [currentProject, commands, hardwareState, spriteState, appState, circuitComponents, pcbColor]);

  // --- UNDO / REDO ---
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setRedoStack(prev => [commands, ...prev]);
    setHistory(newHistory);
    setCommands(previous);
  }, [history, commands]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    
    setHistory(prev => [...prev, commands]);
    setRedoStack(newRedo);
    setCommands(next);
  }, [redoStack, commands]);

  const pushToHistory = (newCommands: CommandBlock[]) => {
      setHistory(prev => [...prev.slice(-20), commands]);
      setRedoStack([]);
      setCommands(newCommands);
      setSaveStatus('unsaved');
  };

  // --- INPUT HANDLING (KEYBOARD) ---
  useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          if (activeInputs.current.has(e.code)) return;
          activeInputs.current.add(e.code);
          
          // Shortcuts (only if not running a game input)
          if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
          if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
          if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveCurrentProject(false); }
      };
      
      const handleGlobalKeyUp = (e: KeyboardEvent) => {
          activeInputs.current.delete(e.code);
      };

      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('keyup', handleGlobalKeyUp);
      return () => {
          window.removeEventListener('keydown', handleGlobalKeyDown);
          window.removeEventListener('keyup', handleGlobalKeyUp);
      };
  }, [commands, handleUndo, handleRedo, saveCurrentProject]); 

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
      // Auto save every 60 seconds if there's a project open
      if (currentProject && !showHome) {
          autoSaveIntervalRef.current = window.setInterval(() => {
              saveCurrentProject(true); // true = isAutoSave
          }, 60000); 
      }
      return () => {
          if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      };
  }, [currentProject, showHome, commands, hardwareState, spriteState, appState, saveCurrentProject]);

  // --- EXECUTION ENGINE ---
  const executeSingleCommand = async (cmd: CommandBlock, wait: (ms: number) => Promise<unknown>) => {
    setActiveBlockId(cmd.id);

    // --- DEBUGGER PAUSE CHECK ---
    if (debugMode) {
        if (cmd.hasBreakpoint || isPaused) {
            setIsPaused(true);
            await new Promise<void>(resolve => {
                resumeRef.current = resolve;
            });
        }
    }

    if (cmd.type === CommandType.LED_ON || cmd.type === CommandType.LED_OFF) {
        setHighlightedPin(cmd.params.pin ?? null);
    } else {
        setHighlightedPin(null);
    }

    const speedMultiplier = 1 / speedRef.current; 

    // Helper for UI Element Creation
    const addAppElement = (type: AppElement['type'], defaultContent: string, extraParams: Partial<AppElement> = {}) => {
        setAppState(prev => {
            const currentScr = renderingScreen.current;
            const newEl: AppElement = { 
                id: crypto.randomUUID(), 
                blockId: cmd.id,
                type, 
                content: cmd.params.text || defaultContent, 
                ...extraParams
            };
            return { ...prev, screens: { ...prev.screens, [currentScr]: [...(prev.screens[currentScr] || []), newEl] } };
        });
    };

    try {
        switch (cmd.type) {
            case CommandType.WAIT:
            case CommandType.SLEEP:
                await wait((cmd.params.value || 1) * 1000 * speedMultiplier);
                break;
            case CommandType.LOG_DATA:
                setConsoleLogs(prev => [...prev, String(cmd.params.text)].slice(-50));
                if (!showConsole) setShowConsole(true);
                break;
            
            // --- APP BUILDER COMMANDS ---
            case CommandType.CREATE_SCREEN:
                renderingScreen.current = cmd.params.text || 'main';
                setAppState(prev => ({ ...prev, screens: { ...prev.screens, [renderingScreen.current]: [] } }));
                break;
            case CommandType.SET_TITLE:
                setAppState(prev => ({ ...prev, title: cmd.params.text || 'My App' }));
                break;
            case CommandType.SET_BACKGROUND:
                setAppState(prev => ({ ...prev, backgroundColor: cmd.params.color || '#ffffff' }));
                break;
            case CommandType.ADD_BUTTON:
                addAppElement('button', cmd.params.text || 'Button', { actionMessage: cmd.params.message, targetScreen: cmd.params.screenName });
                break;
            case CommandType.ADD_INPUT:
                addAppElement('input', '', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_TEXT_BLOCK:
                addAppElement('text', cmd.params.text || '', { color: cmd.params.color, textSize: cmd.params.textSize });
                break;
            case CommandType.ADD_IMAGE:
                addAppElement('image', cmd.params.text || '');
                break;
            case CommandType.ADD_SWITCH:
                addAppElement('switch', cmd.params.text || 'Toggle', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_SLIDER:
                addAppElement('slider', cmd.params.text || 'Value', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_CHECKBOX:
                addAppElement('checkbox', cmd.params.text || 'Check', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_PROGRESS:
                addAppElement('progress', 'Loading', { value: cmd.params.value, max: 100 });
                break;
            case CommandType.ADD_LIST_VIEW:
                addAppElement('list', '', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_DRAWING_CANVAS:
                addAppElement('drawing_canvas', '', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_MAP:
                addAppElement('map', cmd.params.text || 'New York');
                break;
            case CommandType.ADD_VIDEO:
                addAppElement('video', cmd.params.text || '');
                break;
            case CommandType.ADD_CAMERA:
                addAppElement('camera', '');
                break;
            case CommandType.ADD_CHART:
                addAppElement('chart', cmd.params.text || 'Data', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_DATE_PICKER:
                addAppElement('date', '', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_COLOR_PICKER:
                addAppElement('color_picker', '', { variableName: cmd.params.varName });
                break;
            case CommandType.ADD_DIVIDER:
                addAppElement('divider', '');
                break;
            case CommandType.ADD_SPACER:
                addAppElement('spacer', '', { max: cmd.params.value });
                break;

            case CommandType.SHOW_ALERT:
                alert(cmd.params.text);
                break;
            case CommandType.SHOW_TOAST:
                // Simple toast implementation via log for now
                console.log("TOAST:", cmd.params.text);
                break;
            case CommandType.SPEAK:
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(cmd.params.text);
                    window.speechSynthesis.speak(utterance);
                }
                break;
            case CommandType.VIBRATE_DEVICE:
                if (navigator.vibrate) navigator.vibrate((cmd.params.value || 0.5) * 1000);
                break;
            case CommandType.OPEN_URL:
                window.open(cmd.params.text, '_blank');
                break;
            case CommandType.CLEAR_UI:
                setAppState(prev => ({ ...prev, screens: { 'main': [] }, activeScreen: 'main' }));
                break;

            // --- VARIABLES ---
            case CommandType.SET_VAR:
                if (mode === AppMode.APP) setAppState(prev => ({ ...prev, variables: { ...prev.variables, [cmd.params.varName!]: cmd.params.value } }));
                if (mode === AppMode.GAME) setSpriteState(prev => ({ ...prev, variables: { ...prev.variables, [cmd.params.varName!]: cmd.params.value } }));
                break;
            case CommandType.CHANGE_VAR:
                 // Simplified: needs to read current value and add
                 // Assuming logic handles reading via state ref in runCode if needed, but for simple exec:
                 if (mode === AppMode.APP) setAppState(prev => ({ ...prev, variables: { ...prev.variables, [cmd.params.varName!]: (prev.variables[cmd.params.varName!] || 0) + (cmd.params.value || 0) } }));
                 if (mode === AppMode.GAME) setSpriteState(prev => ({ ...prev, variables: { ...prev.variables, [cmd.params.varName!]: (prev.variables[cmd.params.varName!] || 0) + (cmd.params.value || 0) } }));
                 break;

            // --- GAME COMMANDS ---
            case CommandType.MOVE_X:
                setSpriteState(prev => ({ ...prev, x: prev.x + (cmd.params.value || 0) }));
                playSoundEffect('move');
                break;
            case CommandType.MOVE_Y:
                setSpriteState(prev => ({ ...prev, y: prev.y - (cmd.params.value || 0) })); // Y is up
                break;
            case CommandType.GO_TO_XY:
                setSpriteState(prev => ({ ...prev, x: cmd.params.x || 0, y: cmd.params.y || 0 }));
                break;
            case CommandType.POINT_DIR:
                setSpriteState(prev => ({ ...prev, rotation: cmd.params.value || 0 }));
                break;
            case CommandType.JUMP:
                if (!spriteStateRef.current.isJumping) {
                    setSpriteState(prev => ({ ...prev, vy: -(cmd.params.value || 10), isJumping: true }));
                    playSoundEffect('move');
                }
                break;
            case CommandType.SET_GRAVITY:
                setSpriteState(prev => ({ ...prev, gravity: cmd.params.condition === 'true' }));
                break;
            case CommandType.BOUNCE_ON_EDGE:
                // Handled in loop generally, but can set flag
                bounceEnabled.current = true;
                break;
            case CommandType.SAY:
                setSpriteState(prev => ({ ...prev, speech: cmd.params.text || null }));
                if (cmd.params.text) setTimeout(() => setSpriteState(prev => ({ ...prev, speech: null })), 2000);
                break;
            case CommandType.SET_SCENE:
                setSpriteState(prev => ({ ...prev, scene: cmd.params.text }));
                break;
            case CommandType.SET_WEATHER:
                setSpriteState(prev => ({ ...prev, weather: cmd.params.text as any }));
                break;
            case CommandType.SET_EMOJI:
                setSpriteState(prev => ({ ...prev, emoji: cmd.params.text || '🤖', texture: null, frames: [] }));
                break;
            case CommandType.SHOOT:
                const projectile: GameEntity = {
                    id: crypto.randomUUID(),
                    x: spriteStateRef.current.x,
                    y: spriteStateRef.current.y,
                    vx: Math.cos((spriteStateRef.current.rotation - 90) * Math.PI / 180) * 10,
                    vy: Math.sin((spriteStateRef.current.rotation - 90) * Math.PI / 180) * 10,
                    type: 'projectile',
                    emoji: cmd.params.text || '⚡',
                    lifeTime: 100
                };
                setSpriteState(prev => ({ ...prev, projectiles: [...prev.projectiles, projectile] }));
                playSoundEffect('laser');
                break;
            case CommandType.SPAWN_ENEMY:
                const enemy: GameEntity = {
                    id: crypto.randomUUID(),
                    x: Math.random() * 300 + 50,
                    y: Math.random() * 300 + 50,
                    type: 'enemy',
                    emoji: cmd.params.text || '👾',
                    width: 30, height: 30
                };
                setSpriteState(prev => ({ ...prev, enemies: [...prev.enemies, enemy] }));
                break;
            case CommandType.SPAWN_ITEM:
                const item: GameEntity = {
                    id: crypto.randomUUID(),
                    x: Math.random() * 300 + 50,
                    y: Math.random() * 300 + 50,
                    type: 'item',
                    emoji: cmd.params.text || '💎',
                    width: 20, height: 20
                };
                setSpriteState(prev => ({ ...prev, items: [...prev.items, item] }));
                break;
             case CommandType.CHANGE_SCORE:
                setSpriteState(prev => ({ ...prev, score: prev.score + (cmd.params.value || 0) }));
                break;

            // --- HARDWARE COMMANDS ---
            case CommandType.LED_ON:
                setHardwareState(prev => { const n = [...prev.pins]; n[cmd.params.pin!] = true; return { ...prev, pins: n }; });
                playSoundEffect('click');
                break;
            case CommandType.LED_OFF:
                setHardwareState(prev => { const n = [...prev.pins]; n[cmd.params.pin!] = false; return { ...prev, pins: n }; });
                playSoundEffect('click');
                break;
            case CommandType.SET_RGB:
                setHardwareState(prev => ({ ...prev, rgbColor: cmd.params.color || '#ff0000' }));
                break;
            case CommandType.SET_FAN:
                setHardwareState(prev => ({ ...prev, fanSpeed: cmd.params.speed || 0 }));
                break;
            case CommandType.SET_SERVO:
                setHardwareState(prev => ({ ...prev, servoAngle: cmd.params.angle || 0 }));
                break;
            case CommandType.PLAY_TONE:
                playTone(cmd.params.duration || 0.5);
                await wait((cmd.params.duration || 0.5) * 1000);
                break;
            case CommandType.PLAY_SOUND:
                playSpeakerSound(cmd.params.text || 'beep');
                break;
            case CommandType.SET_LCD:
                setHardwareState(prev => {
                    const n = [...prev.lcdLines];
                    n[cmd.params.row || 0] = cmd.params.text || "";
                    return { ...prev, lcdLines: n };
                });
                break;
            case CommandType.CLEAR_LCD:
                setHardwareState(prev => ({ ...prev, lcdLines: ["", ""] }));
                break;
            case CommandType.SET_SEGMENT:
                setHardwareState(prev => ({ ...prev, sevenSegmentValue: cmd.params.value || 0 }));
                break;

        }
    } catch (e) {
        console.error("Execution error", e);
    }
  };

  const runCode = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setConsoleLogs([]);
    stopExecution.current = false;

    // --- RESET ---
    setHardwareState(INITIAL_HARDWARE_STATE);
    setSpriteState({ ...INITIAL_SPRITE_STATE, tilemap: spriteState.tilemap }); // Keep map
    setAppState(INITIAL_APP_STATE);
    renderingScreen.current = 'main';

    const loopStack: { index: number, count: number }[] = [];
    
    // --- MAIN LOOP ---
    // If GAME mode and FOREVER block exists, we wrap in requestAnimationFrame logic implicitly or use a loop
    // But for this interpreter, we iterate blocks.
    // If FOREVER is found, we might loop the whole command set or that block.
    // Simplification: We execute list once unless REPEAT/FOREVER blocks control flow.

    let pc = 0; // Program Counter
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (pc < commands.length && !stopExecution.current) {
        const cmd = commands[pc];
        
        // Control Flow Handling
        if (cmd.type === CommandType.REPEAT) {
            loopStack.push({ index: pc, count: cmd.params.value || 1 });
            pc++;
        } 
        else if (cmd.type === CommandType.FOREVER) {
            loopStack.push({ index: pc, count: Infinity });
            pc++;
        }
        else if (cmd.type === CommandType.END_REPEAT || cmd.type === CommandType.END_FOREVER) {
            const loop = loopStack[loopStack.length - 1];
            if (loop) {
                loop.count--;
                if (loop.count > 0) {
                    pc = loop.index + 1; // Jump back
                    await wait(0); // Yield to prevent freeze
                } else {
                    loopStack.pop();
                    pc++;
                }
            } else {
                pc++;
            }
        }
        else if (cmd.type === CommandType.IF) {
            // Evaluate Condition
            let condition = false;
            if (cmd.params.condition === 'IS_PRESSED') condition = hardwareStateRef.current.pins[cmd.params.pin || 4];
            else if (cmd.params.condition === 'IS_DARK') condition = !hardwareStateRef.current.pins[5]; // Simplified
            else if (cmd.params.condition === 'true') condition = true;
            else if (cmd.params.condition === 'IS_TOUCHING_EDGE') {
                 const s = spriteStateRef.current;
                 condition = s.x <= 0 || s.x >= 360 || s.y <= 0 || s.y >= 360;
            }
            // ... more conditions
            
            if (!condition) {
                // Skip to ELSE or END_IF
                let depth = 0;
                let found = false;
                for (let i = pc + 1; i < commands.length; i++) {
                    if (commands[i].type === CommandType.IF) depth++;
                    if (commands[i].type === CommandType.END_IF) {
                        if (depth === 0) { pc = i; found = true; break; }
                        depth--;
                    }
                    if (commands[i].type === CommandType.ELSE && depth === 0) {
                        pc = i; found = true; break; // Jump to Else
                    }
                }
                if (!found) pc++;
            } else {
                pc++;
            }
        }
        else if (cmd.type === CommandType.ELSE) {
            // If we hit ELSE, it means we executed the IF block, so skip to END_IF
            let depth = 0;
            for (let i = pc + 1; i < commands.length; i++) {
                if (commands[i].type === CommandType.IF) depth++;
                if (commands[i].type === CommandType.END_IF) {
                    if (depth === 0) { pc = i; break; }
                    depth--;
                }
            }
        }
        else {
            // Normal Command
            await executeSingleCommand(cmd, wait);
            pc++;
        }
        
        // Check Missions
        if (activeMission && !activeMission.completed) {
            const updatedSteps = activeMission.steps.map(s => {
                if (!s.isCompleted && s.criteria?.requiredBlock === cmd.type) return { ...s, isCompleted: true };
                return s;
            });
            if (JSON.stringify(updatedSteps) !== JSON.stringify(activeMission.steps)) {
                 setActiveMission({ ...activeMission, steps: updatedSteps });
            }
        }
    }

    setIsPlaying(false);
    setActiveBlockId(null);
    setHighlightedPin(null);
  };

  const stopCode = () => {
      stopExecution.current = true;
      setIsPlaying(false);
      setActiveBlockId(null);
      setHighlightedPin(null);
  };

  const handleStep = () => {
    if (resumeRef.current) {
        resumeRef.current();
    }
  };

  // --- HOME SCREEN ---
  if (showHome) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} transition-colors font-sans`}>
        {/* Navbar */}
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                   <Zap size={24} fill="currentColor" />
               </div>
               <h1 className="text-2xl font-black tracking-tight">KidCode Studio</h1>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 py-2 px-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-all"
                >
                    <span className="text-2xl">{userProfile.avatar}</span>
                    <span className="font-bold text-sm hidden sm:block">{userProfile.name}</span>
                    <div className="bg-yellow-400 text-yellow-900 text-xs font-black px-1.5 rounded ml-1">{userProfile.level}</div>
                </button>
            </div>
        </div>

        {/* Hero / Mode Selection */}
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
                             setCurrentProject(newProj);
                             setCommands(newProj.data.commands);
                             setMode(m);
                             setShowHome(false);
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

            {/* Recent Projects */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><FileCode size={20} /> Recent Projects</h3>
                <button className="text-sm font-bold text-violet-500 hover:text-violet-600">View All</button>
            </div>
            
            {recentProjects.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">No projects yet. Start building!</p>
                </div>
            )}
        </div>
        
        {showProfile && <ProfileModal user={userProfile} onClose={() => setShowProfile(false)} onUpdateUser={setUserProfile} onLoadProject={(p) => { setCurrentProject(p); setCommands(p.data.commands); setMode(p.mode); setShowHome(false); }} />}
      </div>
    );
  }

  // --- EDITOR RENDER ---
  return (
    <div className={`h-screen flex flex-col overflow-hidden ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
        {/* Top Bar */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-40">
           <div className="flex items-center gap-4">
               <button onClick={() => setShowHome(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                   <Home size={20} />
               </button>
               <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
               <div className="flex items-center gap-2">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${MODE_CONFIG[mode].color}`}>
                       {React.createElement(MODE_CONFIG[mode].icon, { size: 16 })}
                   </div>
                   <input 
                      value={currentProject?.name || 'Untitled'} 
                      onChange={(e) => setCurrentProject(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
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
               
               {/* STEP BUTTON (Visible only in Debug Mode) */}
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

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <SidebarDock mode={mode} activeTab={activeTab} onTabChange={setActiveTab} onHome={() => setShowHome(true)} onOpenProfile={() => setShowProfile(true)} />

            {/* Left Panel (Library/AI) */}
            <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-75 relative z-20" style={{ width: leftPanelWidth }}>
                {activeTab === 'ai' ? (
                    <AIChat currentMode={mode} onAppendCode={(newCmds) => pushToHistory([...commands, ...newCmds as CommandBlock[]])} />
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
                                        setDraggedToolType(def.type);
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
                {/* Resize Handle */}
                <div className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-violet-500 transition-colors z-50" onMouseDown={handleMouseDownLeft} />
            </div>

            {/* Main Workspace */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative flex flex-col">
                {/* Trash Zone */}
                {draggedBlockId && (
                   <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-full transition-all z-40 flex items-center gap-2 ${isOverTrash ? 'bg-red-500 text-white scale-110 shadow-xl' : 'bg-white text-slate-400 shadow-lg'}`}
                        onDragEnter={() => setIsOverTrash(true)}
                        onDragLeave={() => setIsOverTrash(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); if (draggedBlockId) { const newCmds = commands.filter(c => c.id !== draggedBlockId); pushToHistory(newCmds); playSoundEffect('click'); } }}
                   >
                       <Trash size={24} />
                       {isOverTrash && <span className="font-bold">Drop to Delete</span>}
                   </div>
                )}

                {/* Blocks Area */}
                <div 
                    className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-1 relative"
                    onDragOver={(e) => {
                        e.preventDefault();
                        // Find drop index based on Y position
                        // Simple approximation
                        const blocks = document.querySelectorAll('.block-wrapper');
                        let index = commands.length;
                        // Logic to find index would go here for insertion
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        try {
                            const data = e.dataTransfer.getData('application/json');
                            if (!data) return;
                            const def = JSON.parse(data);
                            if (def.type) {
                                const newBlock: CommandBlock = {
                                    id: crypto.randomUUID(),
                                    type: def.type,
                                    params: { ...def.defaultParams }
                                };
                                // Insert at end or specific index
                                pushToHistory([...commands, newBlock]);
                                playSoundEffect('click');
                            }
                        } catch (err) {}
                        setDraggedToolType(null);
                    }}
                >
                    {commands.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 pointer-events-none">
                            <Box size={48} className="mb-4 text-slate-300" />
                            <p className="font-bold text-lg">Drag blocks here to start coding!</p>
                        </div>
                    )}

                    {commands.map((cmd, idx) => (
                        <div key={cmd.id} className="block-wrapper">
                            <Block 
                                block={cmd} 
                                index={idx} 
                                mode={mode} 
                                onUpdate={(id, params) => {
                                    const newCmds = commands.map(c => c.id === id ? { ...c, params: { ...c.params, ...params } } : c);
                                    setCommands(newCmds); // Don't push history on every keystroke, ideally debounce
                                }}
                                onDelete={(id) => {
                                    const newCmds = commands.filter(c => c.id !== id);
                                    pushToHistory(newCmds);
                                    playSoundEffect('click');
                                }}
                                onDuplicate={(id) => {
                                    const original = commands.find(c => c.id === id);
                                    if (original) {
                                        const copy = { ...original, id: crypto.randomUUID() };
                                        const newCmds = [...commands];
                                        newCmds.splice(idx + 1, 0, copy);
                                        pushToHistory(newCmds);
                                    }
                                }}
                                isDraggable={!isPlaying}
                                isActive={activeBlockId === cmd.id}
                            />
                        </div>
                    ))}
                    
                    {/* Spacer for scroll */}
                    <div className="h-40" />
                </div>
            </div>

            {/* Right Panel (Stage) */}
            <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col relative z-20" style={{ width: rightPanelWidth }}>
                 <div className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-violet-500 transition-colors z-50" onMouseDown={handleMouseDownRight} />
                 
                 <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
                     <Stage 
                        ref={stageRef}
                        mode={mode}
                        hardwareState={hardwareState}
                        spriteState={spriteState}
                        appState={appState}
                        canvasRef={canvasRef}
                        circuitComponents={circuitComponents}
                        onCircuitUpdate={setCircuitComponents}
                        pcbColor={pcbColor}
                        setPcbColor={setPcbColor}
                        isExecuting={isPlaying}
                        onNavigate={(scr) => { renderingScreen.current = scr; setAppState(prev => ({...prev, activeScreen: scr})); }}
                        highlightPin={highlightedPin}
                        inputState={activeInputs.current}
                        onInput={(k, v) => { if(v) activeInputs.current.add(k); else activeInputs.current.delete(k); }}
                        onUpdateSpriteState={updateSpriteState}
                     />
                 </div>
                 
                 {/* Console / Logs */}
                 <div className={`h-40 bg-slate-900 text-slate-300 font-mono text-xs overflow-y-auto p-2 border-t border-slate-700 transition-all ${showConsole ? 'block' : 'hidden'}`}>
                     <div className="flex justify-between items-center mb-1 text-slate-500 text-[10px] uppercase font-bold sticky top-0 bg-slate-900">
                         <span>Console Output</span>
                         <button onClick={() => setConsoleLogs([])} className="hover:text-white">Clear</button>
                     </div>
                     {consoleLogs.map((log, i) => <div key={i} className="border-b border-white/5 py-0.5">{log}</div>)}
                 </div>
            </div>
        </div>

        {/* Modals */}
        {showMissions && <MissionOverlay activeMission={activeMission} mode={mode} onSelectMission={setActiveMission} onClose={() => setShowMissions(false)} />}
        {showPixelEditor && <PixelEditor initialTexture={spriteState.texture} onSave={(tex) => setSpriteState(prev => ({...prev, texture: tex}))} onClose={() => setShowPixelEditor(false)} />}
        {showSoundEditor && <SoundEditor onClose={() => setShowSoundEditor(false)} />}
        <VariableMonitor variables={mode === 'APP' ? appState.variables : spriteState.variables} isVisible={showVariables} onClose={() => setShowVariables(false)} />
        {showCode && <CodeViewer code={generateCode(commands, mode)} onClose={() => setShowCode(false)} />}
        {showProfile && <ProfileModal user={userProfile} onClose={() => setShowProfile(false)} onUpdateUser={setUserProfile} onLoadProject={(p) => { setCurrentProject(p); setCommands(p.data.commands); setMode(p.mode); setShowHome(false); }} />}
    </div>
  );
};

export default App;