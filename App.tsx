
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppMode, AppState, CommandBlock, CommandType, HardwareState, SpriteState, BlockDefinition, CircuitComponent, ComponentType, Mission, GameEntity, AppElement, UserProfile } from './types';
import { AVAILABLE_BLOCKS, INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE, MODE_CONFIG, UI_PALETTE, CIRCUIT_PALETTE, LEVEL_PALETTE, CHARACTER_PALETTE, VEHICLE_PALETTE, EXAMPLE_TEMPLATES } from './constants';
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
import { Play, Trash, Plus, ChevronDown, ChevronRight, Undo2, Redo2, FileCode, Camera, Trophy, Search, Sliders, Code2, Paintbrush, Zap, Upload, Box, TableProperties, Terminal, Car, User, Music, X, ZoomIn, ZoomOut, RotateCcw, Cloud, Check, Bug, Pause, StepForward, Disc, Home, Save, Ghost, Palette, Cpu, Sparkles, Layout, Square, ToggleLeft, SlidersHorizontal, PanelTop, Trash2 } from 'lucide-react';

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
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const autoSaveIntervalRef = useRef<number | undefined>(undefined);
  
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
    setRecentProjects(getProjects());
  }, []);

  const updateSpriteState = useCallback((newState: Partial<SpriteState>) => {
    setSpriteState(prev => ({ ...prev, ...newState }));
  }, []);
  
  // Input State (Keyboard + Virtual Joystick)
  const activeInputs = useRef<Set<string>>(new Set());
  
  // Refs for Live Execution Reading (Critical for async loops)
  const hardwareStateRef = useRef(hardwareState);
  const spriteStateRef = useRef(spriteState);
  const appStateRef = useRef(appState);
  const commandsRef = useRef(commands);

  // Sync Refs with State
  useEffect(() => { if(!isPlaying) hardwareStateRef.current = hardwareState; }, [hardwareState, isPlaying]);
  useEffect(() => { if(!isPlaying) spriteStateRef.current = spriteState; }, [spriteState, isPlaying]);
  useEffect(() => { if(!isPlaying) appStateRef.current = appState; }, [appState, isPlaying]);
  useEffect(() => { commandsRef.current = commands; }, [commands]);

  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([]);
  const [pcbColor, setPcbColor] = useState<string>('#059669'); 
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [highlightedPin, setHighlightedPin] = useState<number | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedToolType, setDraggedToolType] = useState<CommandType | ComponentType | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  
  // DRAG & DROP REORDERING STATE
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  
  const [recentProjects, setRecentProjects] = useState<SavedProject[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showMissions, setShowMissions] = useState(false);
  const [showPixelEditor, setShowPixelEditor] = useState(false); 
  const [showSoundEditor, setShowSoundEditor] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  
  const [circuitSearch, setCircuitSearch] = useState('');
  const [blockSearch, setBlockSearch] = useState('');
  
  // Layout State
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  
  // Interpreter State for Multi-screen App Building
  const renderingScreen = useRef<string>('main');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<StageHandle>(null);
  const stopExecution = useRef(false);
  const speedRef = useRef(1);
  const bounceEnabled = useRef(false);
  const invincibilityTimer = useRef(0);
  const shakeTimer = useRef(0);

  useEffect(() => {
    speedRef.current = executionSpeed;
  }, [executionSpeed]);

  // --- GAME PHYSICS LOOP ---
  useEffect(() => {
      if (!isPlaying || mode !== AppMode.GAME) return;

      const PHYSICS_FPS = 60;
      const GRAVITY = 0.8;
      const GROUND_Y = 340; // Approx ground level in 400x400 canvas
      
      const physicsInterval = setInterval(() => {
          if (stopExecution.current || isPaused) return;

          const state = spriteStateRef.current;
          let { x, y, vx, vy, isJumping, gravity, projectiles, enemies, items, health, score, effectTrigger } = state;
          
          // 1. Player Physics
          x += vx;
          y += vy;
          
          if (gravity) {
              vy += GRAVITY;
          }
          
          // Friction (Ground)
          if (!isJumping) {
              vx *= 0.85;
          } else {
              vx *= 0.95; // Air resistance
          }
          
          // Stop tiny movements
          if (Math.abs(vx) < 0.1) vx = 0;

          // Ground Collision
          if (gravity && y > GROUND_Y) {
              y = GROUND_Y;
              vy = 0;
              isJumping = false;
          }
          
          // Screen Bounds (Wrap or Bounce)
          if (x < 0) x = 0;
          if (x > 360) x = 360; // 400 - sprite width
          if (y < 0) { y = 0; vy = 0; } // Ceiling

          // 2. Projectile Physics
          const activeProjectiles = projectiles
              .map(p => ({ ...p, x: p.x + (p.vx || 0), y: p.y + (p.vy || 0), lifeTime: (p.lifeTime || 100) - 1 }))
              .filter(p => p.lifeTime > 0 && p.x > -50 && p.x < 450 && p.y > -50 && p.y < 450);

          let newScore = score;
          let newHealth = health;
          let newEnemies = [...enemies];
          let newItems = [...items];
          let newEffect = effectTrigger;
          let shake = 0;

          // 3. Collision: Projectile vs Enemy
          activeProjectiles.forEach(proj => {
              newEnemies = newEnemies.filter(enemy => {
                  const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
                  if (dist < 30) {
                      // Hit!
                      playSoundEffect('explosion');
                      newEffect = { type: 'explosion', x: enemy.x, y: enemy.y, color: '#ef4444' };
                      newScore += 10;
                      return false; // Remove enemy
                  }
                  return true;
              });
          });

          // 4. Collision: Player vs Enemy
          if (invincibilityTimer.current > 0) {
              invincibilityTimer.current--;
          } else {
              newEnemies.forEach(enemy => {
                  const dist = Math.hypot(x - enemy.x, y - enemy.y);
                  if (dist < 30) {
                      // Ouch!
                      playSoundEffect('hurt');
                      newHealth = Math.max(0, newHealth - 1);
                      invincibilityTimer.current = 60; // 1 sec invincibility
                      shake = 10;
                      // Knockback
                      vx = (x - enemy.x) * 0.5;
                      vy = -5;
                  }
              });
          }

          // 5. Collision: Player vs Item
          newItems = newItems.filter(item => {
              const dist = Math.hypot(x - item.x, y - item.y);
              if (dist < 30) {
                  playSoundEffect('coin');
                  newEffect = { type: 'sparkle', x: item.x, y: item.y, color: '#fbbf24' };
                  newScore += 5;
                  return false;
              }
              return true;
          });

          // Update Ref
          spriteStateRef.current = {
              ...state,
              x, y, vx, vy, isJumping,
              projectiles: activeProjectiles,
              enemies: newEnemies,
              items: newItems,
              health: newHealth,
              score: newScore,
              effectTrigger: newEffect
          };
          
          if (shake > 0) shakeTimer.current = shake;

      }, 1000 / PHYSICS_FPS);

      return () => clearInterval(physicsInterval);
  }, [isPlaying, mode]);

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

  const handleUpdateBlock = useCallback((id: string, params: any) => {
      setCommands(prev => prev.map(c => c.id === id ? { ...c, params: { ...c.params, ...params } } : c));
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
      const currentCmds = commandsRef.current;
      const newCmds = currentCmds.filter(c => c.id !== id);
      setHistory(h => [...h.slice(-20), currentCmds]);
      setRedoStack([]);
      setCommands(newCmds);
      setSaveStatus('unsaved');
      playSoundEffect('click');
  }, []);

  const handleDuplicateBlock = useCallback((id: string) => {
      const currentCmds = commandsRef.current;
      const original = currentCmds.find(c => c.id === id);
      if (original) {
          const index = currentCmds.indexOf(original);
          const copy = { ...original, id: crypto.randomUUID() };
          const newCmds = [...currentCmds];
          newCmds.splice(index + 1, 0, copy);
          setHistory(h => [...h.slice(-20), currentCmds]);
          setRedoStack([]);
          setCommands(newCmds);
          setSaveStatus('unsaved');
          playSoundEffect('click');
      }
  }, []);

  // --- INPUT HANDLING (KEYBOARD) ---
  useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          if (activeInputs.current.has(e.code)) return;
          activeInputs.current.add(e.code);
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

  useEffect(() => {
      if (currentProject && !showHome) {
          autoSaveIntervalRef.current = window.setInterval(() => {
              saveCurrentProject(true);
          }, 60000); 
      }
      return () => {
          if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      };
  }, [currentProject, showHome, commands, hardwareState, spriteState, appState, saveCurrentProject]);

  // --- EXECUTION HIGHLIGHTING (Direct DOM) ---
  const highlightBlockFast = (id: string | null) => {
      const old = document.querySelector('.block-executing');
      if (old) old.classList.remove('block-executing', 'ring-4', 'ring-yellow-400', 'z-20');
      
      if (id) {
          const el = document.getElementById(`block-${id}`);
          if (el) {
              el.classList.add('block-executing', 'ring-4', 'ring-yellow-400', 'z-20');
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  };

  // --- APP INTERACTION HANDLER ---
  const handleAppInteraction = useCallback((varName: string, value: any) => {
      setAppState(prev => ({
          ...prev,
          variables: { ...prev.variables, [varName]: value }
      }));
      // Also update Ref for immediate read access in loops if needed
      appStateRef.current = {
          ...appStateRef.current,
          variables: { ...appStateRef.current.variables, [varName]: value }
      };
  }, []);

  // --- EXECUTION ENGINE ---
  const executeSingleCommand = async (cmd: CommandBlock, wait: (ms: number) => Promise<unknown>) => {
    // setActiveBlockId(cmd.id); // Too slow for React state
    highlightBlockFast(cmd.id);

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

    const addAppElement = (type: AppElement['type'], defaultContent: string, extraParams: Partial<AppElement> = {}) => {
        const currentScr = renderingScreen.current;
        const newEl: AppElement = { 
            id: crypto.randomUUID(), 
            blockId: cmd.id,
            type, 
            content: cmd.params.text || defaultContent, 
            ...extraParams
        };
        const prev = appStateRef.current;
        const newState = { ...prev, screens: { ...prev.screens, [currentScr]: [...(prev.screens[currentScr] || []), newEl] } };
        appStateRef.current = newState;
        setAppState(newState);
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
            // ... (Rest of commands same as before, ensuring use of Refs for high perf) ...
            case CommandType.MOVE_X: spriteStateRef.current.x += (cmd.params.value || 0); playSoundEffect('move'); break;
            case CommandType.MOVE_Y: spriteStateRef.current.y -= (cmd.params.value || 0); break;
            
            // --- APP BUILDER ---
            case CommandType.CREATE_SCREEN:
                renderingScreen.current = cmd.params.text || 'main';
                setAppState(prev => ({ ...prev, screens: { ...prev.screens, [renderingScreen.current]: [] } }));
                break;
            case CommandType.ADD_BUTTON:
                addAppElement('button', cmd.params.text || 'Button', { actionMessage: cmd.params.message, targetScreen: cmd.params.screenName });
                break;
            case CommandType.ADD_INPUT:
                addAppElement('input', '', { variableName: cmd.params.varName, placeholder: cmd.params.text });
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
            case CommandType.SHOW_ALERT:
                alert(cmd.params.text);
                break;
            case CommandType.NAVIGATE:
                renderingScreen.current = cmd.params.text || 'main';
                setAppState(prev => ({ ...prev, activeScreen: cmd.params.text || 'main' }));
                break;

            // --- DATA & MATH (FIXED TYPING) ---
            case CommandType.SET_VAR:
                if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = cmd.params.value;
                if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = cmd.params.value;
                break;
            case CommandType.CHANGE_VAR:
                 const val = Number(cmd.params.value) || 0; // Force number
                 if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = Number(appStateRef.current.variables[cmd.params.varName!] || 0) + val;
                 if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = Number(spriteStateRef.current.variables[cmd.params.varName!] || 0) + val;
                 break;
            case CommandType.CALC_ADD:
                 const v1 = Number(cmd.params.value) || 0;
                 const v2 = Number(cmd.params.value2) || 0;
                 if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = v1 + v2;
                 break;

            // Re-implement key commands ensuring Ref mutation
            case CommandType.LED_ON: hardwareStateRef.current.pins[cmd.params.pin!] = true; playSoundEffect('click'); break;
            case CommandType.LED_OFF: hardwareStateRef.current.pins[cmd.params.pin!] = false; playSoundEffect('click'); break;
            case CommandType.LED_TOGGLE: 
                const currentPin = hardwareStateRef.current.pins[cmd.params.pin!];
                hardwareStateRef.current.pins[cmd.params.pin!] = !currentPin; 
                playSoundEffect('click'); 
                break;
            case CommandType.SET_RGB: 
                hardwareStateRef.current.rgbColor = cmd.params.color || '#ff0000'; 
                break;
            case CommandType.SET_RGB_BRIGHTNESS: 
                // Handle RGB brightness if needed
                break;
            case CommandType.SET_FAN: 
                hardwareStateRef.current.fanSpeed = cmd.params.speed || 0; 
                break;
            case CommandType.SET_SERVO: 
                hardwareStateRef.current.servoAngle = cmd.params.angle || 90; 
                break;
            case CommandType.SET_MOTOR_SPEED: 
                // Set motor speed
                break;
            case CommandType.SET_MOTOR_DIR: 
                // Set motor direction
                break;
            case CommandType.SET_STEPPER: 
                hardwareStateRef.current.stepperPosition = cmd.params.steps || 0; 
                break;
            case CommandType.SET_RELAY: 
                hardwareStateRef.current.relayState = cmd.params.state === true; 
                break;
            case CommandType.SET_SOLENOID: 
                hardwareStateRef.current.solenoidActive = cmd.params.state === true; 
                break;
            case CommandType.SET_LASER: 
                hardwareStateRef.current.laserActive = cmd.params.state === true; 
                break;
            case CommandType.SET_VIBRATION: 
                hardwareStateRef.current.vibrationActive = true; 
                // Auto-reset after duration
                setTimeout(() => { 
                    hardwareStateRef.current.vibrationActive = false; 
                    setHardwareState({...hardwareStateRef.current}); 
                }, (cmd.params.duration || 0.5) * 1000);
                break;
            case CommandType.SET_OLED_TEXT: 
                // Handle OLED display
                break;
            case CommandType.DRAW_OLED_SHAPE: 
                // Handle OLED drawing
                break;
            case CommandType.SET_MATRIX_ROW: 
                // Handle matrix display
                break;
            case CommandType.CLEAR_MATRIX: 
                // Clear matrix display
                break;
            case CommandType.PLAY_SOUND: playSpeakerSound(cmd.params.text || 'beep'); break;
            case CommandType.PLAY_NOTE: 
                // Play musical note
                playTone(cmd.params.duration || 0.5); 
                await wait((cmd.params.duration || 0.5) * 1000); 
                break;
            case CommandType.PLAY_TONE: playTone(cmd.params.duration || 0.5); await wait((cmd.params.duration || 0.5) * 1000); break;
            case CommandType.SET_LCD: 
                hardwareStateRef.current.lcdLines[0] = cmd.params.text || 'Hello'; 
                break;
            case CommandType.CLEAR_LCD: 
                hardwareStateRef.current.lcdLines = ['', '']; 
                break;
            case CommandType.SCROLL_LCD: 
                // Handle scrolling LCD text
                break;
            case CommandType.SET_SEGMENT: 
                hardwareStateRef.current.sevenSegmentValue = cmd.params.value || 0; 
                break;
            case CommandType.READ_DIGITAL: 
                // Update variable with digital pin state
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                }
                break;
            case CommandType.READ_ANALOG: 
                // Update variable with analog value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                }
                break;
            case CommandType.READ_TEMPERATURE: 
                // Update variable with temperature value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.temperature;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.temperature;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.temperature;
                }
                break;
            case CommandType.READ_HUMIDITY: 
                // Update variable with humidity value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.humidity;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.humidity;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.humidity;
                }
                break;
            case CommandType.READ_DISTANCE: 
                // Update variable with distance value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.distance;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.distance;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.distance;
                }
                break;
            case CommandType.READ_GAS_LEVEL: 
                // Update variable with gas level value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gasLevel;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gasLevel;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gasLevel;
                }
                break;
            case CommandType.READ_FLAME: 
                // Update variable with flame detection value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.flameDetected;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.flameDetected;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.flameDetected;
                }
                break;
            case CommandType.READ_RAIN: 
                // Update variable with rain level value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.rainLevel;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.rainLevel;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.rainLevel;
                }
                break;
            case CommandType.READ_SOIL: 
                // Update variable with soil moisture value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.soilMoisture;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.soilMoisture;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.soilMoisture;
                }
                break;
            case CommandType.READ_HEARTBEAT: 
                // Update variable with heartbeat rate value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.heartbeatRate;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.heartbeatRate;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.heartbeatRate;
                }
                break;
            case CommandType.READ_COMPASS: 
                // Update variable with compass heading value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.compassHeading;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.compassHeading;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.compassHeading;
                }
                break;
            case CommandType.READ_GYRO: 
                // Update variable with gyro data value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gyroData;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gyroData;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gyroData;
                }
                break;
            case CommandType.READ_GPS: 
                // Update variable with GPS location value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gpsLocation;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gpsLocation;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.gpsLocation;
                }
                break;
            case CommandType.READ_COLOR: 
                // Update variable with detected color value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.detectedColor;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.detectedColor;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.detectedColor;
                }
                break;
            case CommandType.READ_PRESSURE: 
                // Update variable with pressure value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pressure;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pressure;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pressure;
                }
                break;
            case CommandType.READ_FLEX: 
                // Update variable with flex value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.flex;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.flex;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.flex;
                }
                break;
            case CommandType.READ_MAGNETIC: 
                // Update variable with magnetic field value
                if (cmd.params.varName) {
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.magneticField;
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.magneticField;
                    if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.magneticField;
                }
                break;
            
            // --- GAME COMMANDS ---
            case CommandType.JUMP:
                if (!spriteStateRef.current.isJumping) {
                    spriteStateRef.current.vy = -(cmd.params.value || 10);
                    spriteStateRef.current.isJumping = true;
                    playSoundEffect('move');
                }
                break;
            case CommandType.SET_GRAVITY:
                spriteStateRef.current.gravity = cmd.params.condition === 'true';
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
                spriteStateRef.current.projectiles.push(projectile);
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
                spriteStateRef.current.enemies.push(enemy);
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
                spriteStateRef.current.items.push(item);
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

    setHardwareState(INITIAL_HARDWARE_STATE);
    setSpriteState({ ...INITIAL_SPRITE_STATE, tilemap: spriteState.tilemap }); 
    setAppState(INITIAL_APP_STATE);
    
    hardwareStateRef.current = { ...INITIAL_HARDWARE_STATE };
    spriteStateRef.current = { ...INITIAL_SPRITE_STATE, tilemap: spriteState.tilemap };
    appStateRef.current = { ...INITIAL_APP_STATE };
    
    renderingScreen.current = 'main';

    const loopStack: { index: number, count: number }[] = [];
    let pc = 0; 
    
    // UI Sync Loop (High Frequency for Game, Low for App)
    const syncInterval = setInterval(() => {
        if (!stopExecution.current) {
            setSpriteState({ ...spriteStateRef.current }); 
            setHardwareState({ ...hardwareStateRef.current });
            setAppState({ ...appStateRef.current });
        }
    }, 50); // Faster sync for physics

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const TIME_SLICE_MS = 12;

    while (pc < commands.length && !stopExecution.current) {
        const frameStart = performance.now();
        
        while (performance.now() - frameStart < TIME_SLICE_MS && pc < commands.length && !stopExecution.current) {
            const cmd = commands[pc];
            
            // Highlight Logic commands too if slow enough, otherwise skip for performance
            if (executionSpeed <= 2) highlightBlockFast(cmd.id);

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
                        pc = loop.index + 1; 
                        if (cmd.type === CommandType.END_FOREVER) { await wait(0); } 
                    } else {
                        loopStack.pop();
                        pc++;
                    }
                } else {
                    pc++;
                }
            }
            else if (cmd.type === CommandType.IF) {
                let condition = false;
                if (cmd.params.condition === 'IS_PRESSED') condition = hardwareStateRef.current.pins[cmd.params.pin || 4];
                else if (cmd.params.condition === 'true') condition = true;
                else if (cmd.params.condition === 'IS_TOUCHING_ENEMY') {
                    // Check if invincibility is active to avoid multiple hits? 
                    // Simple check for now
                    condition = invincibilityTimer.current > 0; 
                }
                
                if (!condition) {
                    let depth = 0;
                    let found = false;
                    for (let i = pc + 1; i < commands.length; i++) {
                        if (commands[i].type === CommandType.IF) depth++;
                        if (commands[i].type === CommandType.END_IF) {
                            if (depth === 0) { pc = i; found = true; break; }
                            depth--;
                        }
                        if (commands[i].type === CommandType.ELSE && depth === 0) {
                            pc = i; found = true; break;
                        }
                    }
                    if (!found) pc++;
                } else {
                    pc++;
                }
            }
            else if (cmd.type === CommandType.ELSE) {
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
                await executeSingleCommand(cmd, wait);
                pc++;
            }
        }
        await wait(0); 
    }

    clearInterval(syncInterval);
    setIsPlaying(false);
    highlightBlockFast(null);
    setHighlightedPin(null);
    setSpriteState({ ...spriteStateRef.current });
    setHardwareState({ ...hardwareStateRef.current });
  };

  const stopCode = () => {
      stopExecution.current = true;
      setIsPlaying(false);
      highlightBlockFast(null);
      setHighlightedPin(null);
  };

  const handleStep = () => {
    if (resumeRef.current) resumeRef.current();
  };

  const handleNavigate = useCallback((scr: string) => { 
      renderingScreen.current = scr; 
      setAppState(prev => ({...prev, activeScreen: scr})); 
  }, []);

  const handleInput = useCallback((key: string, pressed: boolean) => {
      if (pressed) activeInputs.current.add(key);
      else activeInputs.current.delete(key);
  }, []);

  // --- HARDWARE INPUT HANDLER ---
  const handleHardwareInput = useCallback((pin: number, pressed: boolean) => {
      // Update Ref immediately for execution engine
      const currentState = hardwareStateRef.current;
      const newPins = [...currentState.pins];
      newPins[pin] = pressed;
      hardwareStateRef.current = { ...currentState, pins: newPins };
      
      // Update State for Visuals (React Render)
      setHardwareState(prev => {
          const np = [...prev.pins];
          np[pin] = pressed;
          return { ...prev, pins: np };
      });
  }, []);

  const handleAppendCode = useCallback((newCmds: any) => {
      setCommands(prev => {
          const updated = [...prev, ...newCmds];
          setHistory(h => [...h.slice(-20), prev]);
          setRedoStack([]);
          return updated;
      });
      setSaveStatus('unsaved');
  }, []);

  // Group Blocks by Category
  const groupedBlocks = (AVAILABLE_BLOCKS[mode] as BlockDefinition[]).reduce((acc, block) => {
      const cat = block.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(block);
      return acc;
  }, {} as Record<string, BlockDefinition[]>);

  // Group Circuit Components by Category
  const groupedComponents = CIRCUIT_PALETTE.reduce((acc, comp) => {
      const cat = comp.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(comp);
      return acc;
  }, {} as Record<string, any[]>);

  // --- HOME SCREEN ---
  if (showHome) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} transition-colors font-sans`}>
        {/* Navbar */}
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce-sm">
                   <Zap size={24} fill="currentColor" />
               </div>
               <h1 className="text-2xl font-black tracking-tight">KidCode Studio</h1>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 py-2 px-4 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-all hover:scale-105"
                >
                    <span className="text-2xl">{userProfile.avatar}</span>
                    <span className="font-bold text-sm hidden sm:block">{userProfile.name}</span>
                    <div className="bg-yellow-400 text-yellow-900 text-xs font-black px-1.5 rounded ml-1 animate-pulse">{userProfile.level}</div>
                </button>
            </div>
        </div>

        {/* Hero / Mode Selection */}
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-4xl font-black mb-8 animate-in slide-in-from-left-10 fade-in duration-500">What do you want to build?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               {Object.values(AppMode).map((m, i) => {
                   const config = MODE_CONFIG[m];
                   const Icon = config.icon;
                   return (
                       <button 
                         key={m}
                         style={{ animationDelay: `${i * 100}ms` }}
                         onClick={() => {
                             const newProj = createNewProject(m);
                             setCurrentProject(newProj);
                             setCommands(newProj.data.commands);
                             setMode(m);
                             setShowHome(false);
                         }}
                         className={`relative group h-64 rounded-3xl p-8 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.05] hover:rotate-1 hover:shadow-2xl text-white ${config.color}`}
                       >
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                               <Icon size={120} />
                           </div>
                           <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner animate-float">
                               <Icon size={32} />
                           </div>
                           <div>
                               <h3 className="text-2xl font-black mb-2">{config.label}</h3>
                               <p className="opacity-90 font-medium">Create {m === 'APP' ? 'mobile apps' : m === 'GAME' ? 'video games' : 'inventions'} with blocks.</p>
                           </div>
                           <div className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 group-hover:rotate-90 duration-300">
                               <Plus size={24} />
                           </div>
                       </button>
                   )
               })}
            </div>

            {/* Starter Templates */}
            <div className="mb-12">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Sparkles size={20} className="text-yellow-500" /> Instant Starters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {EXAMPLE_TEMPLATES.map((tpl) => (
                        <button
                            key={tpl.id}
                            onClick={() => {
                                const newProj = createNewProject(tpl.mode);
                                newProj.name = tpl.name;
                                newProj.data.commands = tpl.commands.map(c => ({...c, id: crypto.randomUUID()}));
                                if (tpl.circuitComponents && tpl.mode === AppMode.HARDWARE) {
                                    newProj.data.circuitComponents = tpl.circuitComponents as CircuitComponent[];
                                }
                                setCurrentProject(newProj);
                                setCommands(newProj.data.commands);
                                if (tpl.circuitComponents) setCircuitComponents(tpl.circuitComponents as CircuitComponent[]);
                                setMode(tpl.mode);
                                setShowHome(false);
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-violet-400 hover:shadow-lg transition-all text-left group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-md ${tpl.color}`}>
                                {React.createElement(tpl.icon, { size: 24 })}
                            </div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-violet-600 transition-colors">{tpl.name}</h4>
                            <p className="text-sm text-slate-500">{tpl.description}</p>
                        </button>
                    ))}
                </div>
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
            
            {recentProjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {recentProjects.map(proj => (
                        <button 
                            key={proj.id}
                            onClick={() => { setCurrentProject(proj); setCommands(proj.data.commands); setMode(proj.mode); setShowHome(false); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:shadow-md hover:scale-[1.02] transition-all text-left"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${MODE_CONFIG[proj.mode].color}`}>{proj.mode}</span>
                                <span className="text-[10px] text-slate-400">{new Date(proj.lastEdited).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white truncate">{proj.name}</h4>
                        </button>
                    ))}
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
               <button onClick={() => setShowHome(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-transform hover:scale-110">
                   <Home size={20} />
               </button>
               <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
               <div className="flex items-center gap-2">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${MODE_CONFIG[mode].color} shadow-sm`}>
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
               <button onClick={handleUndo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5" title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
               <button onClick={handleRedo} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5" title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
               
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
            <SidebarDock mode={mode} activeTab={activeTab} onTabChange={setActiveTab} onHome={() => setShowHome(true)} onOpenProfile={() => setShowProfile(true)} />

            {/* Left Panel (Library/AI/Design) */}
            <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-75 relative z-20" style={{ width: leftPanelWidth }}>
                {activeTab === 'ai' ? (
                    <AIChat currentMode={mode} onAppendCode={handleAppendCode} />
                ) : activeTab === 'design' && mode === AppMode.GAME ? (
                    // --- CHARACTER STUDIO PANEL ---
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Ghost className="text-violet-500" /> Sprite Studio
                            </h3>
                            <p className="text-xs text-slate-400">Design your hero!</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }}>
                            
                            {/* Preview Box */}
                            <div className="aspect-square bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-center relative overflow-hidden shadow-inner group">
                                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] opacity-10"></div>
                                <div 
                                    className="transition-transform duration-200 relative z-10"
                                    style={{ 
                                        transform: `scale(${spriteState.scale}) rotate(${spriteState.rotation}deg)`,
                                        opacity: spriteState.opacity / 100 
                                    }}
                                >
                                    {spriteState.texture ? (
                                        <img src={spriteState.texture} className="w-24 h-24 object-contain pixelated" />
                                    ) : (
                                        <span className="text-6xl filter drop-shadow-lg">{spriteState.emoji}</span>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded-full">Preview</span>
                                </div>
                            </div>

                            {/* Main Actions */}
                            <div className="space-y-3 mb-6">
                                <button 
                                    onClick={() => setShowPixelEditor(true)}
                                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    <Paintbrush size={18} /> Draw Pixel Art
                                </button>
                            </div>

                            {/* Visual Tweaks */}
                            <div className="space-y-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Size ({Math.round(spriteState.scale * 100)}%)</label>
                                    <input 
                                        type="range" min="0.2" max="3" step="0.1"
                                        value={spriteState.scale}
                                        onChange={(e) => updateSpriteState({ scale: parseFloat(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg accent-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Rotation ({Math.round(spriteState.rotation)}°)</label>
                                    <input 
                                        type="range" min="0" max="360"
                                        value={spriteState.rotation}
                                        onChange={(e) => updateSpriteState({ rotation: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg accent-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block uppercase">Opacity ({spriteState.opacity}%)</label>
                                    <input 
                                        type="range" min="0" max="100"
                                        value={spriteState.opacity}
                                        onChange={(e) => updateSpriteState({ opacity: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg accent-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Emoji Picker */}
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 text-sm uppercase tracking-wide">Quick Avatar</h4>
                            <div className="grid grid-cols-5 gap-2">
                                {CHARACTER_PALETTE.map(char => (
                                    <button 
                                        key={char.emoji}
                                        onClick={() => updateSpriteState({ emoji: char.emoji, texture: null })}
                                        className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white dark:bg-slate-800 border-2 transition-all
                                            ${spriteState.emoji === char.emoji && !spriteState.texture ? 'border-violet-500 shadow-md scale-110' : 'border-slate-100 dark:border-slate-700 hover:border-violet-200'}
                                        `}
                                        title={char.label}
                                    >
                                        {char.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'components' && mode === AppMode.HARDWARE ? (
                    // --- CIRCUIT COMPONENTS PANEL (RESTORED & CATEGORIZED) ---
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                             <div className="mb-4">
                                 <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-2 uppercase tracking-wide">Board Color</h3>
                                 <div className="flex gap-2">
                                    {['#059669', '#1e293b', '#dc2626', '#2563eb', '#d97706'].map(c => (
                                      <button 
                                        key={c}
                                        onClick={() => setPcbColor(c)} 
                                        className={`w-6 h-6 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${pcbColor === c ? 'border-slate-900 dark:border-white ring-2 ring-violet-200' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                      />
                                    ))}
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                        <input 
                                            type="color" 
                                            value={pcbColor} 
                                            onChange={(e) => setPcbColor(e.target.value)} 
                                            className="absolute -top-1 -left-1 w-8 h-8 p-0 border-0 cursor-pointer" 
                                        />
                                    </div>
                                 </div>
                             </div>
                             <div className="relative">
                                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                 <input 
                                    type="text" 
                                    placeholder="Search parts..." 
                                    value={circuitSearch}
                                    onChange={(e) => setCircuitSearch(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-slate-800 pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-200" 
                                 />
                             </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }} >
                             {/* Grouped Components Rendering */}
                             {(Object.entries(groupedComponents) as [string, any[]][]).map(([category, components]) => {
                                 const filtered = components.filter((c: any) => c.label.toLowerCase().includes(circuitSearch.toLowerCase()));
                                 if (filtered.length === 0) return null;
                                 
                                 const isExpanded = expandedCategories[category] !== false;

                                 return (
                                     <div key={category} className="mb-2">
                                         <button 
                                            onClick={() => setExpandedCategories(p => ({ ...p, [category]: !isExpanded }))}
                                            className="flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2 hover:text-slate-600 px-1"
                                         >
                                             {category}
                                             {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                         </button>
                                         {isExpanded && (
                                             <div className="space-y-2">
                                                 {filtered.map((comp: any) => (
                                                     <div 
                                                        key={comp.type} 
                                                        draggable 
                                                        onDragStart={(e) => {
                                                            setDraggedToolType(comp.type as any); 
                                                            e.dataTransfer.setData('application/json', JSON.stringify({ type: comp.type, defaultPin: comp.defaultPin }));
                                                            e.dataTransfer.effectAllowed = 'copy';
                                                        }}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 shadow-sm transition-all hover:scale-[1.02]`}
                                                     >
                                                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${comp.color} bg-slate-100 dark:bg-slate-700`}>
                                                             {React.createElement(comp.icon, { size: 18 })}
                                                         </div>
                                                         <div className="flex flex-col">
                                                             <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{comp.label}</span>
                                                             <span className="text-[10px] text-slate-400">{comp.description}</span>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                 );
                             })}
                        </div>
                    </div>
                ) : (
                    // --- BLOCK LIBRARY (Default) ---
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
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1" style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }} >
                             {/* Grouped Blocks Rendering */}
                             {(Object.entries(groupedBlocks) as [string, BlockDefinition[]][]).map(([category, blocks]) => {
                                 // Filter logic within group
                                 const filtered = blocks.filter(b => b.label.toLowerCase().includes(blockSearch.toLowerCase()));
                                 if (filtered.length === 0) return null;
                                 
                                 const isExpanded = expandedCategories[category] !== false;

                                 return (
                                     <div key={category} className="mb-2">
                                         <button 
                                            onClick={() => setExpandedCategories(p => ({ ...p, [category]: !isExpanded }))}
                                            className="flex items-center justify-between w-full text-xs font-bold uppercase text-slate-400 mb-2 hover:text-slate-600 px-1"
                                         >
                                             {category}
                                             {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                         </button>
                                         {isExpanded && (
                                             <div className="space-y-2">
                                                 {filtered.map((def, idx) => (
                                                     <div 
                                                        key={def.type} 
                                                        draggable 
                                                        onDragStart={(e) => {
                                                            setDraggedToolType(def.type);
                                                            e.dataTransfer.setData('application/json', JSON.stringify(def));
                                                            e.dataTransfer.effectAllowed = 'copy';
                                                            
                                                            const dragImg = document.createElement("div");
                                                            dragImg.innerText = def.label;
                                                            dragImg.style.background = "#8b5cf6";
                                                            dragImg.style.color = "white";
                                                            dragImg.style.padding = "8px 16px";
                                                            dragImg.style.borderRadius = "8px";
                                                            dragImg.style.fontWeight = "bold";
                                                            dragImg.style.position = "absolute";
                                                            dragImg.style.top = "-1000px";
                                                            document.body.appendChild(dragImg);
                                                            e.dataTransfer.setDragImage(dragImg, 0, 0);
                                                            setTimeout(() => document.body.removeChild(dragImg), 0);
                                                        }}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 shadow-sm transition-all hover:scale-[1.02]`}
                                                     >
                                                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${def.color} shadow-sm`}>
                                                             {React.createElement(def.icon, { size: 16 })}
                                                         </div>
                                                         <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{def.label}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                 );
                             })}
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
                   <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-full transition-all z-40 flex items-center gap-2 ${isOverTrash ? 'bg-red-500 text-white scale-110 shadow-xl rotate-6' : 'bg-white text-slate-400 shadow-lg'}`}
                        onDragEnter={() => setIsOverTrash(true)}
                        onDragLeave={() => setIsOverTrash(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); if (draggedBlockId) { const newCmds = commands.filter(c => c.id !== draggedBlockId); pushToHistory(newCmds); playSoundEffect('click'); } }}
                   >
                       <Trash size={24} className={isOverTrash ? "animate-bounce" : ""} />
                       {isOverTrash && <span className="font-bold">Drop to Delete</span>}
                   </div>
                )}

                {/* Blocks Area */}
                <div 
                    className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-1 relative"
                    onDragOver={(e) => {
                        e.preventDefault();
                        // Drag Over insertion logic
                        const blocks = document.querySelectorAll('.block-wrapper');
                        let closestIndex = commands.length;
                        let minDistance = Number.POSITIVE_INFINITY;
                        
                        blocks.forEach((block, index) => {
                            const rect = block.getBoundingClientRect();
                            const offset = e.clientY - (rect.top + rect.height / 2);
                            if (Math.abs(offset) < minDistance) {
                                minDistance = Math.abs(offset);
                                if (offset < 0) closestIndex = index; // Above middle
                                else closestIndex = index + 1; // Below middle
                            }
                        });
                        
                        // Edge case: empty list or drag below last item
                        if (blocks.length > 0) {
                            const lastBlock = blocks[blocks.length - 1].getBoundingClientRect();
                            if (e.clientY > lastBlock.bottom) closestIndex = commands.length;
                        }
                        
                        setDropIndex(closestIndex);
                    }}
                    onDragLeave={() => setDropIndex(null)}
                    onDrop={(e) => {
                        e.preventDefault();
                        try {
                            const data = e.dataTransfer.getData('application/json');
                            if (!data) {
                                // Internal Reorder
                                if (draggedBlockId && dropIndex !== null) {
                                    const oldIndex = commands.findIndex(c => c.id === draggedBlockId);
                                    if (oldIndex !== -1) {
                                        const newCmds = [...commands];
                                        const [movedItem] = newCmds.splice(oldIndex, 1);
                                        // Adjust index if we removed an item before the drop point
                                        const finalIndex = oldIndex < dropIndex ? dropIndex - 1 : dropIndex;
                                        newCmds.splice(finalIndex, 0, movedItem);
                                        pushToHistory(newCmds);
                                        playSoundEffect('click');
                                    }
                                }
                                setDraggedBlockId(null);
                                setDropIndex(null);
                                return;
                            };
                            
                            const def = JSON.parse(data);
                            if (def.type) {
                                const newBlock: CommandBlock = {
                                    id: crypto.randomUUID(),
                                    type: def.type,
                                    params: { ...def.defaultParams }
                                };
                                
                                const targetIndex = dropIndex !== null ? dropIndex : commands.length;
                                const newCmds = [...commands];
                                newCmds.splice(targetIndex, 0, newBlock);
                                
                                pushToHistory(newCmds);
                                playSoundEffect('click');
                            }
                        } catch (err) {}
                        setDraggedToolType(null);
                        setDropIndex(null);
                    }}
                >
                    {commands.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 pointer-events-none animate-in zoom-in duration-500">
                            <Box size={64} className="mb-4 text-slate-300 animate-bounce-sm" />
                            <p className="font-bold text-xl">Drag blocks here to start coding!</p>
                        </div>
                    )}

                    {commands.map((cmd, idx) => (
                        <div key={cmd.id} className="block-wrapper">
                            {/* Visual insertion line */}
                            {dropIndex === idx && <div className="h-1 bg-blue-500 rounded-full mb-1 animate-pulse" />}
                            
                            <Block 
                                block={cmd} 
                                index={idx} 
                                mode={mode} 
                                onUpdate={handleUpdateBlock}
                                onDelete={handleDeleteBlock}
                                onDuplicate={handleDuplicateBlock}
                                isDraggable={!isPlaying}
                                onDragStart={(e) => {
                                    setDraggedBlockId(cmd.id);
                                    e.dataTransfer.effectAllowed = 'move';
                                    // Make invisible image to avoid default ghost
                                    const img = new Image();
                                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                    e.dataTransfer.setDragImage(img, 0, 0);
                                }}
                                isActive={false} // Handled via Direct DOM now
                            />
                        </div>
                    ))}
                    {/* Final Drop Zone */}
                    {dropIndex === commands.length && <div className="h-1 bg-blue-500 rounded-full mb-1 animate-pulse" />}
                    
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
                        hardwareStateRef={hardwareStateRef}
                        spriteState={spriteState}
                        spriteStateRef={spriteStateRef} // Pass Ref for High Performance
                        appState={appState}
                        canvasRef={canvasRef}
                        circuitComponents={circuitComponents}
                        onCircuitUpdate={setCircuitComponents}
                        pcbColor={pcbColor}
                        setPcbColor={setPcbColor}
                        isExecuting={isPlaying}
                        onNavigate={handleNavigate}
                        highlightPin={highlightedPin}
                        inputState={activeInputs.current}
                        onInput={handleInput}
                        onHardwareInput={handleHardwareInput}
                        onUpdateSpriteState={updateSpriteState}
                        shakeAmount={shakeTimer.current}
                        onAppInteraction={handleAppInteraction}
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
