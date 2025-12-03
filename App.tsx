
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppMode, AppState, CommandBlock, CommandType, HardwareState, SpriteState, BlockDefinition, CircuitComponent } from './types';
import { AVAILABLE_BLOCKS, INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE, MODE_CONFIG } from './constants';
import Block from './components/Block';
import Stage from './components/Stage';
import AIChat from './components/AIChat';
import { playSoundEffect, playTone, playSpeakerSound } from './services/soundService';
import { getProjects, saveProject, createNewProject, SavedProject } from './services/storageService';
import { Play, RotateCcw, Plus, Trash, Code2, ChevronDown, ChevronRight, GripVertical, Home, ArrowRight, Layout, Gamepad2, Cpu, Sparkles, Clock, FolderOpen, Save, Undo2, Redo2 } from 'lucide-react';

const App: React.FC = () => {
  const [showHome, setShowHome] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.APP);
  
  // Undo/Redo Stacks
  const [history, setHistory] = useState<CommandBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<CommandBlock[][]>([]);
  const [commands, setCommands] = useState<CommandBlock[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);
  
  // States for outputs
  const [hardwareState, setHardwareState] = useState<HardwareState>(INITIAL_HARDWARE_STATE);
  const [spriteState, setSpriteState] = useState<SpriteState>(INITIAL_SPRITE_STATE);
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  
  // Interactive Circuit State
  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([]);
  const [pcbColor, setPcbColor] = useState<string>('#059669'); 
  
  // UI States
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [highlightedPin, setHighlightedPin] = useState<number | null>(null);
  
  // Drag and Drop State
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedToolType, setDraggedToolType] = useState<CommandType | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Recent Projects State
  const [recentProjects, setRecentProjects] = useState<SavedProject[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopExecution = useRef(false);
  
  // LIVE State Ref for interpreter to read from
  const hardwareStateRef = useRef(hardwareState);
  useEffect(() => { hardwareStateRef.current = hardwareState; }, [hardwareState]);

  const spriteStateRef = useRef(spriteState);
  useEffect(() => { spriteStateRef.current = spriteState; }, [spriteState]);

  // Load projects on mount
  useEffect(() => {
    setRecentProjects(getProjects());
  }, [showHome]);

  // Auto-Save Effect
  useEffect(() => {
    if (!currentProject || showHome) return;
    
    const timeout = setTimeout(() => {
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
        }
      };
      saveProject(updatedProject);
      setCurrentProject(updatedProject);
      // Quiet save, no alert
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeout);
  }, [commands, hardwareState, spriteState, appState, circuitComponents, pcbColor, currentProject, showHome]);

  // --- UNDO / REDO HELPERS ---
  const pushToHistory = (newCommands: CommandBlock[]) => {
      setHistory(prev => [...prev, commands]);
      setRedoStack([]); // Clear redo stack on new action
      setCommands(newCommands);
  };

  const handleUndo = () => {
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      setRedoStack(prev => [commands, ...prev]);
      setCommands(previous);
      setHistory(newHistory);
      playSoundEffect('click');
  };

  const handleRedo = () => {
      if (redoStack.length === 0) return;
      const next = redoStack[0];
      const newRedoStack = redoStack.slice(1);
      
      setHistory(prev => [...prev, commands]);
      setCommands(next);
      setRedoStack(newRedoStack);
      playSoundEffect('click');
  };

  // --- EDITOR ACTIONS ---

  const addBlock = (type: CommandType, index?: number) => {
    const defs = Object.values(AVAILABLE_BLOCKS).flat();
    const def = defs.find(d => d.type === type);
    if (!def) return;

    const newBlock: CommandBlock = {
      id: crypto.randomUUID(),
      type: type,
      params: { ...def.defaultParams }
    };

    let newCmds: CommandBlock[];
    if (index !== undefined && index !== null) {
      newCmds = [...commands];
      newCmds.splice(index, 0, newBlock);
    } else {
      newCmds = [...commands, newBlock];
    }
    pushToHistory(newCmds);
    playSoundEffect('click');
  };

  const updateBlock = (id: string, params: any) => {
    const newCmds = commands.map(b => b.id === id ? { ...b, params } : b);
    pushToHistory(newCmds);
  };

  const deleteBlock = (id: string) => {
    const newCmds = commands.filter(b => b.id !== id);
    pushToHistory(newCmds);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newCmds = [...commands];
    const [moved] = newCmds.splice(fromIndex, 1);
    newCmds.splice(toIndex, 0, moved);
    pushToHistory(newCmds);
  };

  const appendGeneratedCode = (newCmds: Omit<CommandBlock, 'id'>[]) => {
    const blocks: CommandBlock[] = newCmds.map(c => ({
      ...c,
      id: crypto.randomUUID(),
      params: c.params || {}
    }));
    const combined = [...commands, ...blocks];
    pushToHistory(combined);
  };

  const clearWorkspace = () => {
    pushToHistory([]);
    resetState();
  };

  const handleHardwareInput = (pin: number, value: any) => {
    setHardwareState(prev => {
        if (pin === 99) return { ...prev, temperature: value };
        if (pin === 97) return { ...prev, potentiometerValue: value };
        if (pin === 100) return { ...prev, speakerVolume: value };
        if (pin === 92) return { ...prev, distance: value }; // Ultrasonic
        if (pin === 91) return { ...prev, motionDetected: value }; // Motion
        
        const newPins = [...prev.pins];
        if (pin >= 0 && pin < newPins.length) {
            newPins[pin] = value;
        }
        return { ...prev, pins: newPins };
    });
    // Click effect for buttons/switches but not continuous inputs
    if ((value === true && (pin === 4 || pin === 6 || pin === 91)) || (pin === 97 && typeof value === 'number' && value % 10 === 0)) {
       playSoundEffect('click'); 
    }
  };

  // --- DRAG AND DROP HANDLERS ---

  const handleDragStartTool = (e: React.DragEvent, type: CommandType) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedToolType(type);
    setDraggedBlockId(null);
  };

  const handleDragStartBlock = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBlockId(id);
    setDraggedToolType(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/json')) {
        // Ignored circuit components drop here
    }

    if (draggedToolType) {
      addBlock(draggedToolType, index);
    } else if (draggedBlockId) {
      const fromIndex = commands.findIndex(c => c.id === draggedBlockId);
      if (fromIndex !== -1 && fromIndex !== index) {
        const actualToIndex = fromIndex < index ? index - 1 : index;
        moveBlock(fromIndex, actualToIndex);
      }
    }

    setDraggedBlockId(null);
    setDraggedToolType(null);
    setDragOverIndex(null);
  };

  // --- CIRCUIT BUILDER DROP HANDLER ---
  const handleCircuitDrop = (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const tool = JSON.parse(data);
        if (tool.type) {
            // Add component to board
            const stageRect = e.currentTarget.getBoundingClientRect();
            // Snap to 20px grid
            const rawX = e.clientX - stageRect.left - 20; 
            const rawY = e.clientY - stageRect.top - 20;
            
            const snapToGrid = (val: number) => Math.round(val / 20) * 20;

            const x = Math.max(0, Math.min(300, snapToGrid(rawX)));
            const y = Math.max(0, Math.min(400, snapToGrid(rawY)));
            
            setCircuitComponents(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    type: tool.type,
                    x,
                    y,
                    pin: tool.defaultPin,
                    rotation: 0
                }
            ]);
            playSoundEffect('click');
        }
      } catch (err) {
          // Not a valid tool drop
      }
  };

  const handleBlockHover = (block: CommandBlock | null) => {
    if (block && block.params && typeof block.params.pin === 'number') {
      setHighlightedPin(block.params.pin);
    } else if (block) {
        if (block.type === CommandType.SET_FAN) setHighlightedPin(98); 
        else if (block.type === CommandType.SET_LCD) setHighlightedPin(95);
        else if (block.type === CommandType.CLEAR_LCD) setHighlightedPin(95);
        else if (block.type === CommandType.SET_SERVO) setHighlightedPin(96);
        else if (block.type === CommandType.PLAY_SOUND) setHighlightedPin(100);
        else if (block.type === CommandType.PLAY_TONE) setHighlightedPin(100);
        else if (block.type === CommandType.SET_RGB) setHighlightedPin(94);
        else if (block.type === CommandType.SET_SEGMENT) setHighlightedPin(93);
        else if (block.type === CommandType.SET_VIBRATION) setHighlightedPin(90);

        else if (block.type === CommandType.IF) {
            // Highlight based on selected condition
            if (block.params.condition === 'IS_DARK') setHighlightedPin(5);
            else if (block.params.condition === 'IS_PRESSED') setHighlightedPin(4);
            else if (block.params.condition === 'IS_SWITCH_ON') setHighlightedPin(6);
            else if (block.params.condition === 'IS_TEMP_HIGH') setHighlightedPin(99);
            else if (block.params.condition === 'FAN_SPEED_GT') setHighlightedPin(98);
            else if (block.params.condition === 'IS_MOTION') setHighlightedPin(91);
            else if (block.params.condition === 'DIST_LESS_THAN') setHighlightedPin(92);
            else if (block.params.condition === 'PIN_HIGH' && block.params.pin !== undefined) setHighlightedPin(block.params.pin);
        }
        else if (block.type === CommandType.WAIT_FOR_PRESS) setHighlightedPin(4);
    } else {
      setHighlightedPin(null);
    }
  };

  // --- INTERPRETER & EXECUTION ---

  const resetState = useCallback(() => {
    // Reload state from current project if it exists, otherwise use defaults
    if (currentProject) {
        setHardwareState({ ...currentProject.data.hardwareState });
        setSpriteState({ ...currentProject.data.spriteState });
        setAppState({ ...currentProject.data.appState });
        setCircuitComponents(currentProject.data.circuitComponents);
    } else {
        setHardwareState(prev => ({
            ...INITIAL_HARDWARE_STATE,
            pins: [false, false, false, false, prev.pins[4], prev.pins[5], prev.pins[6]], // Preserve input states 
            temperature: prev.temperature,
            potentiometerValue: prev.potentiometerValue,
            speakerVolume: 50,
            servoAngle: 90,
            lcdText: "",
            rgbColor: '#ff0000',
            sevenSegmentValue: null,
            distance: 100,
            motionDetected: false,
            vibrationActive: false
        }));
        setSpriteState(INITIAL_SPRITE_STATE);
        setAppState(INITIAL_APP_STATE);
        // Default components if not in a saved project
        setCircuitComponents([
            { id: '1', type: 'LED_RED', x: 40, y: 60, pin: 0, rotation: 0 },
            { id: '2', type: 'BUTTON', x: 100, y: 320, pin: 4, rotation: 0 },
            { id: '3', type: 'LIGHT_SENSOR', x: 160, y: 320, pin: 5, rotation: 0 },
            { id: '4', type: 'LCD', x: 180, y: 320, pin: 95, rotation: 0 }
        ]);
    }
  }, [currentProject]);

  const executeSingleCommand = async (cmd: CommandBlock, ctx: CanvasRenderingContext2D | null | undefined, wait: (ms: number) => Promise<unknown>) => {
    if (stopExecution.current) return;

    handleBlockHover(cmd);

    switch (cmd.type) {
      case CommandType.WAIT:
      case CommandType.SLEEP:
        await wait((cmd.params.value || 0) * 1000);
        break;

      case CommandType.WAIT_FOR_PRESS:
        while (!stopExecution.current) {
            if (hardwareStateRef.current.pins[4]) {
                playSoundEffect('click');
                break;
            }
            await wait(100); 
        }
        break;

      case CommandType.SET_TITLE:
        playSoundEffect('ui');
        setAppState(prev => ({ ...prev, title: cmd.params.text || 'My App' }));
        await wait(200);
        break;
      
      case CommandType.SET_BACKGROUND:
        setAppState(prev => ({ ...prev, backgroundColor: cmd.params.color || '#ffffff' }));
        await wait(200);
        break;

      case CommandType.ADD_BUTTON:
        playSoundEffect('click');
        setAppState(prev => ({
          ...prev,
          elements: [
            ...prev.elements,
            { 
              id: crypto.randomUUID(), 
              type: 'button', 
              content: cmd.params.text || 'Button',
              actionMessage: cmd.params.message 
            }
          ]
        }));
        await wait(300);
        break;

      case CommandType.ADD_TEXT_BLOCK:
        playSoundEffect('ui');
        setAppState(prev => ({
          ...prev,
          elements: [
            ...prev.elements,
            { 
              id: crypto.randomUUID(), 
              type: 'text', 
              content: cmd.params.text || 'Text'
            }
          ]
        }));
        await wait(300);
        break;

      case CommandType.ADD_INPUT:
        playSoundEffect('ui');
        setAppState(prev => ({
          ...prev,
          elements: [
            ...prev.elements,
            {
              id: crypto.randomUUID(),
              type: 'input',
              content: cmd.params.text || 'Enter text...'
            }
          ]
        }));
        await wait(300);
        break;

      case CommandType.ADD_IMAGE:
        playSoundEffect('ui');
        setAppState(prev => ({
          ...prev,
          elements: [
            ...prev.elements,
            {
              id: crypto.randomUUID(),
              type: 'image',
              content: cmd.params.text || 'https://placehold.co/150'
            }
          ]
        }));
        await wait(300);
        break;

      case CommandType.CLEAR_UI:
        playSoundEffect('click');
        setAppState(prev => ({ ...prev, elements: [] }));
        await wait(200);
        break;
      
      case CommandType.CHANGE_SCORE:
         const val = cmd.params.value || 1;
         playSoundEffect('coin');
         if (mode === AppMode.GAME) {
            setSpriteState(prev => ({...prev, score: prev.score + val }));
         } else {
            setAppState(prev => ({...prev, score: prev.score + val }));
         }
         await wait(200);
         break;

      case CommandType.SET_SCORE:
         const newVal = cmd.params.value || 0;
         playSoundEffect('ui');
         if (mode === AppMode.GAME) {
            setSpriteState(prev => ({...prev, score: newVal }));
         } else {
            setAppState(prev => ({...prev, score: newVal }));
         }
         await wait(200);
         break;

      case CommandType.MOVE_X:
        playSoundEffect('move');
        setSpriteState(prev => ({ ...prev, x: prev.x + (cmd.params.value || 0) }));
        await wait(200);
        break;
      case CommandType.MOVE_Y:
        playSoundEffect('move');
        setSpriteState(prev => ({ ...prev, y: prev.y + (cmd.params.value || 0) }));
        await wait(200);
        break;
      case CommandType.SAY:
        playSoundEffect('ui');
        setSpriteState(prev => ({ ...prev, speech: cmd.params.text || '' }));
        await wait(1500); 
        setSpriteState(prev => ({ ...prev, speech: null }));
        break;
      case CommandType.SET_EMOJI:
        playSoundEffect('ui');
        setSpriteState(prev => ({ ...prev, emoji: cmd.params.text || '🤖' }));
        await wait(100);
        break;
      case CommandType.SET_SCENE:
        playSoundEffect('ui');
        setSpriteState(prev => ({ ...prev, scene: cmd.params.text || 'grid' }));
        await wait(200);
        break;

      case CommandType.LED_ON:
        playSoundEffect('click');
        setHardwareState(prev => {
          const newPins = [...prev.pins];
          if (typeof cmd.params.pin === 'number') newPins[cmd.params.pin] = true;
          return { ...prev, pins: newPins };
        });
        await wait(200);
        break;
      case CommandType.LED_OFF:
        playSoundEffect('click');
        setHardwareState(prev => {
          const newPins = [...prev.pins];
          if (typeof cmd.params.pin === 'number') newPins[cmd.params.pin] = false;
          return { ...prev, pins: newPins };
        });
        await wait(200);
        break;
      case CommandType.PLAY_TONE:
        setHardwareState(prev => ({ ...prev, buzzerActive: true }));
        // Pass the volume multiplier (0.0 to 1.0)
        playTone(cmd.params.duration || 0.5, hardwareStateRef.current.speakerVolume / 100);
        await wait((cmd.params.duration || 0.5) * 1000);
        setHardwareState(prev => ({ ...prev, buzzerActive: false }));
        break;
      case CommandType.PLAY_SOUND:
        setHardwareState(prev => ({ ...prev, buzzerActive: true }));
        // Pass volume multiplier
        const duration = playSpeakerSound(cmd.params.text || 'siren', hardwareStateRef.current.speakerVolume / 100);
        await wait(duration * 1000);
        setHardwareState(prev => ({ ...prev, buzzerActive: false }));
        break;
      case CommandType.SET_FAN:
        setHardwareState(prev => ({ ...prev, fanSpeed: cmd.params.speed || 0 }));
        if ((cmd.params.speed || 0) > 0) playSoundEffect('move');
        await wait(200);
        break;
      case CommandType.SET_SERVO:
        setHardwareState(prev => ({ ...prev, servoAngle: cmd.params.angle || 90 }));
        playSoundEffect('move');
        await wait(300);
        break;
      case CommandType.SET_LCD:
        setHardwareState(prev => ({ ...prev, lcdText: cmd.params.text || '' }));
        playSoundEffect('click');
        await wait(200);
        break;
      case CommandType.CLEAR_LCD:
        setHardwareState(prev => ({ ...prev, lcdText: '' }));
        playSoundEffect('click');
        await wait(200);
        break;
      
      case CommandType.SET_RGB:
        setHardwareState(prev => ({ ...prev, rgbColor: cmd.params.color || '#000000' }));
        playSoundEffect('click');
        await wait(200);
        break;
      
      case CommandType.SET_SEGMENT:
        setHardwareState(prev => ({ ...prev, sevenSegmentValue: cmd.params.value ?? 0 }));
        playSoundEffect('click');
        await wait(200);
        break;

      case CommandType.SET_VIBRATION:
        setHardwareState(prev => ({ ...prev, vibrationActive: true }));
        playSoundEffect('move');
        await wait((cmd.params.value || 0.5) * 1000);
        setHardwareState(prev => ({ ...prev, vibrationActive: false }));
        break;

      case CommandType.LOG_DATA:
         playSoundEffect('click');
         await wait(300);
         break;
    }
    setHighlightedPin(null);
  };

  const executeCommandList = async (
    cmdList: CommandBlock[], 
    ctx: CanvasRenderingContext2D | null | undefined, 
    wait: (ms: number) => Promise<unknown>
  ) => {
    for (let i = 0; i < cmdList.length; i++) {
      if (stopExecution.current) return;
      const cmd = cmdList[i];

      const isLogicStart = 
        cmd.type === CommandType.REPEAT || 
        cmd.type === CommandType.IF;

      if (isLogicStart) {
        let depth = 1;
        let endIdx = -1;
        let elseIdx = -1;
        
        // Match either END_REPEAT or END_IF depending on type
        const closeTypeRef = cmd.type === CommandType.REPEAT ? CommandType.END_REPEAT : CommandType.END_IF;

        // Scan ahead for matching END block or ELSE block
        for (let j = i + 1; j < cmdList.length; j++) {
          if (cmdList[j].type === cmd.type) depth++;
          if (cmdList[j].type === closeTypeRef) {
             depth--;
             if (depth === 0) {
                endIdx = j;
                break;
             }
          }
          // Only look for ELSE if we are in an IF block at the top level (depth 1)
          if (cmd.type === CommandType.IF && cmdList[j].type === CommandType.ELSE && depth === 1) {
             elseIdx = j;
          }
        }

        // REPEAT LOGIC
        if (cmd.type === CommandType.REPEAT) {
            const innerCmds = endIdx !== -1 ? cmdList.slice(i + 1, endIdx) : cmdList.slice(i + 1);
            const iterations = cmd.params.value || 1;
            for (let k = 0; k < iterations; k++) {
                if (stopExecution.current) return;
                await executeCommandList(innerCmds, ctx, wait);
            }
        } 
        
        // IF / ELSE LOGIC
        else if (cmd.type === CommandType.IF) {
            // Evaluate Generic IF Logic
            let conditionMet = false;
            const hs = hardwareStateRef.current;
            const ss = spriteStateRef.current;
            
            if (cmd.params.condition === 'IS_PRESSED') {
               conditionMet = hs.pins[4];
            } else if (cmd.params.condition === 'IS_SWITCH_ON') {
               conditionMet = hs.pins[6];
            } else if (cmd.params.condition === 'IS_DARK') {
               conditionMet = !hs.pins[5]; // Pin 5 true=light, false=dark
            } else if (cmd.params.condition === 'IS_TEMP_HIGH') {
               conditionMet = hs.temperature > (cmd.params.value || 25);
            } else if (cmd.params.condition === 'FAN_SPEED_GT') {
               conditionMet = hs.fanSpeed > (cmd.params.value || 0);
            } else if (cmd.params.condition === 'IS_MOTION') {
               conditionMet = hs.motionDetected;
            } else if (cmd.params.condition === 'DIST_LESS_THAN') {
               conditionMet = hs.distance < (cmd.params.value || 20);
            } else if (cmd.params.condition === 'PIN_HIGH') {
               const p = cmd.params.pin || 0;
               conditionMet = hs.pins[p] === true;
            } else if (cmd.params.condition === 'IS_TOUCHING_EDGE') {
               // Check if sprite is near edges of 400x400 canvas
               const margin = 20;
               conditionMet = ss.x < margin || ss.x > 400 - margin || ss.y < margin || ss.y > 400 - margin;
            }
            
            // Branch Execution
            if (conditionMet) {
               // Execute IF branch (From IF to ELSE, or IF to END_IF if no else)
               const limit = elseIdx !== -1 ? elseIdx : endIdx;
               const ifCmds = limit !== -1 ? cmdList.slice(i + 1, limit) : [];
               await executeCommandList(ifCmds, ctx, wait);
            } else {
               // Execute ELSE branch if it exists
               if (elseIdx !== -1) {
                   const elseCmds = endIdx !== -1 ? cmdList.slice(elseIdx + 1, endIdx) : [];
                   await executeCommandList(elseCmds, ctx, wait);
               }
            }
        }

        if (endIdx !== -1) i = endIdx; 
        else break; 

      } else if (cmd.type === CommandType.END_REPEAT || cmd.type === CommandType.END_IF || cmd.type === CommandType.ELSE) {
        continue;
      } else {
        await executeSingleCommand(cmd, ctx, wait);
      }
    }
  };

  const runCode = async () => {
    if (isPlaying) return; 
    setIsPlaying(true);
    stopExecution.current = false;
    const ctx = canvasRef.current?.getContext('2d');
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await executeCommandList(commands, ctx, wait);
    setIsPlaying(false);
    setHighlightedPin(null);
  };

  const stopCode = () => {
    stopExecution.current = true;
    setIsPlaying(false);
    setHardwareState(prev => ({ 
        ...prev, 
        fanSpeed: 0, 
        buzzerActive: false,
        vibrationActive: false,
        sevenSegmentValue: null
    }));
    setHighlightedPin(null);
  };

  useEffect(() => {
    setExpandedCategories({'Blocks': true, '⚡ Power': true, '🧠 Brains': true, '👀 Inputs': true, '💪 Outputs': true, '🔀 Logic': true, '🔄 Control': true});
  }, [mode]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({...prev, [cat]: !prev[cat]}));
  };

  const handleStartProject = (newMode: AppMode) => {
    const newProject = createNewProject(newMode);
    setCurrentProject(newProject);
    setMode(newMode);
    
    // Init state from new project
    setCommands([]);
    setHistory([]);
    setRedoStack([]);
    setHardwareState(newProject.data.hardwareState);
    setSpriteState(newProject.data.spriteState);
    setAppState(newProject.data.appState);
    setCircuitComponents(newProject.data.circuitComponents);
    setPcbColor(newProject.data.pcbColor);

    setShowHome(false);
    playSoundEffect('ui');
  };

  const loadProject = (project: SavedProject) => {
    setCurrentProject(project);
    setMode(project.mode);
    
    // Load data
    setCommands(project.data.commands);
    setHistory([]);
    setRedoStack([]);
    setHardwareState(project.data.hardwareState);
    setSpriteState(project.data.spriteState);
    setAppState(project.data.appState);
    setCircuitComponents(project.data.circuitComponents);
    setPcbColor(project.data.pcbColor);

    setShowHome(false);
    playSoundEffect('ui');
  };

  const goHome = () => {
    setShowHome(true);
    stopCode();
    playSoundEffect('ui');
  };

  let currentDepth = 0;
  
  const groupedBlocks = React.useMemo<Record<string, BlockDefinition[]>>(() => {
    const blocks = AVAILABLE_BLOCKS[mode];
    if (mode !== AppMode.HARDWARE) return { "Blocks": blocks };
    const groups: Record<string, BlockDefinition[]> = {};
    blocks.forEach(b => {
       const cat = b.category || 'Other';
       if (!groups[cat]) groups[cat] = [];
       groups[cat].push(b);
    });
    return groups;
  }, [mode]);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden select-none">
      
      {/* --- TOP BAR --- */}
      <header className="h-16 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
            <div className="bg-violet-600 p-2 rounded-lg text-white">
                <Code2 size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">KidCode <span className="text-violet-500">Studio</span></h1>
        </div>

        {/* Project Title Display */}
        {!showHome && currentProject && (
             <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                 <span className="bg-slate-100 px-2 py-1 rounded">{currentProject.name}</span>
                 <span className="text-xs text-slate-300">Autosaving...</span>
             </div>
        )}

        <div className="flex items-center gap-3">
            {!showHome && (
                <>
                    {/* Undo / Redo Buttons */}
                    <div className="flex bg-slate-100 rounded-full p-1 mr-4">
                        <button 
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-full hover:bg-white transition-all"
                            title="Undo"
                        >
                            <Undo2 size={18} />
                        </button>
                        <button 
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-full hover:bg-white transition-all"
                            title="Redo"
                        >
                            <Redo2 size={18} />
                        </button>
                    </div>

                    <button 
                        onClick={goHome}
                        className="p-2 text-slate-400 hover:text-violet-600 rounded-full hover:bg-violet-50 transition-colors mr-2"
                        title="Back to Home"
                    >
                        <Home size={20} />
                    </button>
                    <button 
                        onClick={resetState}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        title="Reset Stage"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button 
                        onClick={isPlaying ? stopCode : runCode}
                        className={`
                            flex items-center gap-2 px-6 py-2 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95
                            ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                        `}
                    >
                        {isPlaying ? <>Stop</> : <><Play size={18} fill="currentColor" /> Run Code</>}
                    </button>
                </>
            )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      {showHome ? (
         // --- HOME PAGE / WELCOME SCREEN ---
         <div className="flex-1 overflow-y-auto bg-slate-50 relative">
            <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none fixed"></div>
            
            <div className="max-w-6xl mx-auto py-12 px-6 flex flex-col items-center">
                
                {/* Hero Section */}
                <div className="text-center mb-10 z-10 animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 px-4 py-1 rounded-full text-sm font-bold mb-4">
                        <Sparkles size={16} />
                        <span>Start Creating Today</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">build?</span></h2>
                    <p className="text-slate-500 text-lg max-w-lg mx-auto">Select a project mode below to start your coding adventure!</p>
                </div>

                {/* Main Action Cards */}
                <div className="flex flex-wrap gap-6 justify-center z-10 mb-16 w-full">
                    {/* App Maker Card */}
                    <button 
                        onClick={() => handleStartProject(AppMode.APP)}
                        className="group w-full md:w-80 h-72 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col text-left"
                    >
                        <div className="h-32 bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors relative">
                            <div className="absolute inset-0 bg-pink-200/20 pattern-grid opacity-50"></div>
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-pink-500 transform group-hover:scale-110 transition-transform">
                                <Layout size={40} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">New App</h3>
                            <p className="text-slate-500 text-sm mb-auto">Design your own phone apps with buttons, images, and text.</p>
                            <div className="flex items-center gap-2 text-pink-500 font-bold text-sm mt-4">
                                Start Project <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>

                    {/* Game Maker Card */}
                    <button 
                        onClick={() => handleStartProject(AppMode.GAME)}
                        className="group w-full md:w-80 h-72 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col text-left"
                    >
                        <div className="h-32 bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors relative">
                            <div className="absolute inset-0 bg-orange-200/20 pattern-grid opacity-50"></div>
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500 transform group-hover:scale-110 transition-transform">
                                <Gamepad2 size={40} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">New Game</h3>
                            <p className="text-slate-500 text-sm mb-auto">Create sprites, move them around, and make them talk.</p>
                            <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mt-4">
                                Start Project <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>

                    {/* Circuit Lab Card */}
                    <button 
                        onClick={() => handleStartProject(AppMode.HARDWARE)}
                        className="group w-full md:w-80 h-72 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col text-left"
                    >
                        <div className="h-32 bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 transition-colors relative">
                            <div className="absolute inset-0 bg-cyan-200/20 pattern-grid opacity-50"></div>
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-cyan-500 transform group-hover:scale-110 transition-transform">
                                <Cpu size={40} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">New Electronics</h3>
                            <p className="text-slate-500 text-sm mb-auto">Simulate circuits, wire up LEDs, sensors, and code the brain.</p>
                            <div className="flex items-center gap-2 text-cyan-500 font-bold text-sm mt-4">
                                Start Project <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Recent Projects Section */}
                <div className="w-full max-w-5xl z-10 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                    <div className="flex items-center gap-3 mb-6">
                        <FolderOpen className="text-slate-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-600 uppercase tracking-wide">Recent Projects</h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {recentProjects.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 bg-white border border-dashed border-slate-200 rounded-xl">
                            No saved projects yet. Start building!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentProjects.map((project) => {
                                const config = MODE_CONFIG[project.mode];
                                const Icon = config.icon;
                                return (
                                    <button 
                                        key={project.id}
                                        onClick={() => loadProject(project)}
                                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-1 transition-all flex items-start gap-4 text-left group"
                                    >
                                        <div className={`p-3 rounded-lg ${config.bg} ${config.color} shrink-0`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-700 truncate group-hover:text-violet-600 transition-colors">{project.name}</h4>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                <Clock size={10} />
                                                <span>{new Date(project.lastEdited).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
         </div>
      ) : (
         // --- EDITOR WORKSPACE ---
         <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
            
            {/* LEFT: Toolbox */}
            <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 bg-white border-b border-slate-100">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toolbox</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {Object.entries(groupedBlocks).map(([category, blocks]) => (
                        <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            {mode === AppMode.HARDWARE && (
                                <button 
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{category}</span>
                                    {expandedCategories[category] ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronRight size={14} className="text-slate-400"/>}
                                </button>
                            )}
                            
                            {(mode !== AppMode.HARDWARE || expandedCategories[category]) && (
                            <div className="p-2 space-y-2">
                                {(blocks as BlockDefinition[]).map((blockDef) => {
                                    const Icon = blockDef.icon;
                                    return (
                                        <div
                                            key={blockDef.type}
                                            draggable
                                            onDragStart={(e) => handleDragStartTool(e, blockDef.type)}
                                            onClick={() => addBlock(blockDef.type)}
                                            className={`
                                                cursor-grab active:cursor-grabbing w-full flex items-center gap-3 p-2 rounded-lg border border-transparent 
                                                hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all text-left group
                                            `}
                                        >
                                            <div className={`p-2 rounded-lg text-white shadow-sm ${blockDef.color}`}>
                                                <Icon size={16} />
                                            </div>
                                            <span className="font-bold text-slate-600 group-hover:text-slate-900 text-sm">{blockDef.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CENTER: Editor */}
            <div className="flex-1 bg-slate-100 flex flex-col relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, commands.length)}
            >
                <div className="absolute inset-0 pattern-dots opacity-50 pointer-events-none"></div>
                
                <div className="p-4 flex items-center justify-between z-10">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Script</h2>
                    <button 
                        onClick={clearWorkspace}
                        className="text-xs font-bold text-red-400 hover:text-red-500 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm"
                    >
                        <Trash size={12} /> Clear All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-32 scroll-smooth">
                    {commands.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <div className="w-24 h-24 border-4 border-dashed border-slate-300 rounded-2xl mb-4 flex items-center justify-center">
                                <Plus size={32} />
                            </div>
                            <p className="font-bold">Drag blocks here to build!</p>
                        </div>
                    ) : (
                        <div className="space-y-0 relative min-h-[200px] pb-20">
                            <div className="absolute left-[27px] top-6 bottom-6 w-1 bg-slate-200 -z-0"></div>
                            
                            {commands.map((cmd, idx) => {
                                const isIndentEnd = cmd.type === CommandType.END_REPEAT || cmd.type === CommandType.END_IF || cmd.type === CommandType.ELSE;
                                
                                if (isIndentEnd) {
                                    currentDepth = Math.max(0, currentDepth - 1);
                                }
                                const renderDepth = currentDepth;
                                
                                const element = (
                                    <div key={cmd.id} 
                                        style={{ marginLeft: `${renderDepth * 24}px` }} 
                                        className="transition-all duration-300"
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                    >
                                        {dragOverIndex === idx && (
                                            <div className="h-1 bg-violet-400 rounded-full mb-1 w-full animate-pulse" />
                                        )}
                                        
                                        <Block 
                                            index={idx} 
                                            block={cmd} 
                                            mode={mode} 
                                            onUpdate={updateBlock} 
                                            onDelete={deleteBlock}
                                            isDraggable={true}
                                            onDragStart={(e) => handleDragStartBlock(e, cmd.id)}
                                            onMouseEnter={() => handleBlockHover(cmd)}
                                            onMouseLeave={() => handleBlockHover(null)}
                                        />
                                    </div>
                                );

                                const isLogicStart = 
                                    cmd.type === CommandType.REPEAT || 
                                    cmd.type === CommandType.IF ||
                                    cmd.type === CommandType.ELSE;

                                if (isLogicStart) {
                                    currentDepth++;
                                }
                                return element;
                            })}

                            <div 
                                className="h-24 w-full flex items-center justify-center text-transparent hover:text-slate-300 transition-colors border-2 border-dashed border-transparent hover:border-slate-300 rounded-xl mt-2"
                                onDragOver={(e) => handleDragOver(e, commands.length)}
                                onDrop={(e) => handleDrop(e, commands.length)}
                            >
                                Drop here to append
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Output Stage - FIXED ALIGNMENT TO TOP */}
            <div 
                className="w-[480px] bg-slate-50 border-l border-slate-200 flex flex-col p-6 shrink-0 z-20 shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCircuitDrop}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Stage</h2>
                    <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-bold text-slate-500">{isPlaying ? 'Running' : 'Ready'}</span>
                    </div>
                </div>
                
                <div className="flex-1 relative flex flex-col items-center justify-center">
                    <Stage 
                        mode={mode} 
                        hardwareState={hardwareState} 
                        onHardwareInput={handleHardwareInput}
                        spriteState={spriteState} 
                        appState={appState}
                        canvasRef={canvasRef}
                        highlightPin={highlightedPin}
                        circuitComponents={circuitComponents}
                        onCircuitUpdate={setCircuitComponents}
                        pcbColor={pcbColor}
                        setPcbColor={setPcbColor}
                        isExecuting={isPlaying}
                    />
                    
                    {mode === AppMode.HARDWARE && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 flex items-start gap-2 max-w-[300px]">
                            <div className="mt-1 min-w-[4px] h-[4px] bg-yellow-400 rounded-full"></div>
                            <p>Tip: Drag parts from sidebar. Double-click to rotate.</p>
                        </div>
                    )}
                </div>
            </div>

            <AIChat currentMode={mode} onAppendCode={appendGeneratedCode} />
        </div>
      )}
    </div>
  );
};

export default App;
