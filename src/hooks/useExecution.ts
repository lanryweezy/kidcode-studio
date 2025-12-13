
import { useState, useRef, useCallback } from 'react';
import { CommandBlock, HardwareState, SpriteState, AppState, AppMode, CommandType, AppElement, GameEntity } from '../types/types';
import { INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE } from '../constants/constants';
import { playSoundEffect, playTone, playSpeakerSound } from '../services/soundService';

export const useExecution = (
  commands: CommandBlock[],
  hardwareState: HardwareState,
  spriteState: SpriteState,
  appState: AppState,
  setHardwareState: React.Dispatch<React.SetStateAction<HardwareState>>,
  setSpriteState: React.Dispatch<React.SetStateAction<SpriteState>>,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>,
  setConsoleLogs: React.Dispatch<React.SetStateAction<string[]>>,
  setShowConsole: React.Dispatch<React.SetStateAction<boolean>>,
  mode: AppMode,
  activeMission: any,
  setActiveMission: any
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [executionSpeed, setExecutionSpeed] = useState(1);
  const [debugMode, setDebugMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const resumeRef = useRef<() => void>(() => {});
  const stopExecution = useRef(false);
  const speedRef = useRef(1);
  const hardwareStateRef = useRef<HardwareState>(hardwareState);
  const spriteStateRef = useRef<SpriteState>(spriteState);
  const appStateRef = useRef<AppState>(appState);
  const renderingScreen = useRef<string>('main');
  const [highlightedPin, setHighlightedPin] = useState<number | null>(null);
  const bounceEnabled = useRef(false);

  const executeSingleCommand = async (cmd: CommandBlock, wait: (ms: number) => Promise<unknown>) => {
    setActiveBlockId(cmd.id);

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
          if (!setShowConsole) setShowConsole(true);
          break;
        case CommandType.CREATE_SCREEN:
          renderingScreen.current = cmd.params.text || 'main';
          appStateRef.current.screens[renderingScreen.current] = [];
          break;
        case CommandType.SET_TITLE:
          appStateRef.current.title = cmd.params.text || 'My App';
          setAppState({ ...appStateRef.current });
          break;
        case CommandType.SET_BACKGROUND:
          appStateRef.current.backgroundColor = cmd.params.color || '#ffffff';
          setAppState({ ...appStateRef.current });
          break;
        case CommandType.ADD_BUTTON: addAppElement('button', cmd.params.text || 'Button', { actionMessage: cmd.params.message, targetScreen: cmd.params.screenName }); break;
        case CommandType.ADD_INPUT: addAppElement('input', '', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_TEXT_BLOCK: addAppElement('text', cmd.params.text || '', { color: cmd.params.color, textSize: cmd.params.textSize }); break;
        case CommandType.ADD_IMAGE: addAppElement('image', cmd.params.text || ''); break;
        case CommandType.ADD_SWITCH: addAppElement('switch', cmd.params.text || 'Toggle', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_SLIDER: addAppElement('slider', cmd.params.text || 'Value', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_CHECKBOX: addAppElement('checkbox', cmd.params.text || 'Check', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_PROGRESS: addAppElement('progress', 'Loading', { value: cmd.params.value, max: 100 }); break;
        case CommandType.ADD_LIST_VIEW: addAppElement('list', '', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_DRAWING_CANVAS: addAppElement('drawing_canvas', '', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_MAP: addAppElement('map', cmd.params.text || 'New York'); break;
        case CommandType.ADD_VIDEO: addAppElement('video', cmd.params.text || ''); break;
        case CommandType.ADD_CAMERA: addAppElement('camera', ''); break;
        case CommandType.ADD_CHART: addAppElement('chart', cmd.params.text || 'Data', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_DATE_PICKER: addAppElement('date', '', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_COLOR_PICKER: addAppElement('color_picker', '', { variableName: cmd.params.varName }); break;
        case CommandType.ADD_DIVIDER: addAppElement('divider', ''); break;
        case CommandType.ADD_SPACER: addAppElement('spacer', '', { max: cmd.params.value }); break;
        case CommandType.SHOW_ALERT: alert(cmd.params.text); break;
        case CommandType.SPEAK: if ('speechSynthesis' in window) { window.speechSynthesis.speak(new SpeechSynthesisUtterance(cmd.params.text)); } break;
        case CommandType.VIBRATE_DEVICE: if (navigator.vibrate) navigator.vibrate((cmd.params.value || 0.5) * 1000); break;
        case CommandType.OPEN_URL: window.open(cmd.params.text, '_blank'); break;
        case CommandType.CLEAR_UI:
          appStateRef.current.screens = { 'main': [] };
          appStateRef.current.activeScreen = 'main';
          setAppState({ ...appStateRef.current });
          break;
        case CommandType.SET_VAR:
          if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = cmd.params.value;
          if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = cmd.params.value;
          break;
        case CommandType.CHANGE_VAR:
          if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = (appStateRef.current.variables[cmd.params.varName!] || 0) + (cmd.params.value || 0);
          if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = (spriteStateRef.current.variables[cmd.params.varName!] || 0) + (cmd.params.value || 0);
          break;
        case CommandType.MOVE_X: spriteStateRef.current.x += (cmd.params.value || 0); playSoundEffect('move'); break;
        case CommandType.MOVE_Y: spriteStateRef.current.y -= (cmd.params.value || 0); break;
        case CommandType.GO_TO_XY: spriteStateRef.current.x = cmd.params.x || 0; spriteStateRef.current.y = cmd.params.y || 0; break;
        case CommandType.POINT_DIR: spriteStateRef.current.rotation = cmd.params.value || 0; break;
        case CommandType.JUMP: if (!spriteStateRef.current.isJumping) { spriteStateRef.current.vy = -(cmd.params.value || 10); spriteStateRef.current.isJumping = true; playSoundEffect('move'); } break;
        case CommandType.SET_GRAVITY: spriteStateRef.current.gravity = cmd.params.condition === 'true'; break;
        case CommandType.BOUNCE_ON_EDGE: bounceEnabled.current = true; break;
        case CommandType.SAY: spriteStateRef.current.speech = cmd.params.text || null; if (cmd.params.text) setTimeout(() => spriteStateRef.current.speech = null, 2000); break;
        case CommandType.SET_SCENE: spriteStateRef.current.scene = cmd.params.text; break;
        case CommandType.SET_WEATHER: spriteStateRef.current.weather = cmd.params.text as any; break;
        case CommandType.SET_EMOJI: spriteStateRef.current.emoji = cmd.params.text || '🤖'; spriteStateRef.current.texture = null; break;
        case CommandType.SHOOT:
          const projectile: GameEntity = { id: crypto.randomUUID(), x: spriteStateRef.current.x, y: spriteStateRef.current.y, vx: Math.cos((spriteStateRef.current.rotation - 90) * Math.PI / 180) * 10, vy: Math.sin((spriteStateRef.current.rotation - 90) * Math.PI / 180) * 10, type: 'projectile', emoji: cmd.params.text || '⚡', lifeTime: 100 };
          spriteStateRef.current.projectiles.push(projectile);
          playSoundEffect('laser');
          break;
        case CommandType.SPAWN_ENEMY:
          spriteStateRef.current.enemies.push({ id: crypto.randomUUID(), x: Math.random() * 300 + 50, y: Math.random() * 300 + 50, type: 'enemy', emoji: cmd.params.text || '👾', width: 30, height: 30 });
          break;
        case CommandType.SPAWN_ITEM:
          spriteStateRef.current.items.push({ id: crypto.randomUUID(), x: Math.random() * 300 + 50, y: Math.random() * 300 + 50, type: 'item', emoji: cmd.params.text || '💎', width: 20, height: 20 });
          break;
        case CommandType.SPAWN_PARTICLES:
          spriteStateRef.current.effectTrigger = { type: 'explosion', x: spriteStateRef.current.x, y: spriteStateRef.current.y, color: '#f59e0b' };
          playSoundEffect('explosion');
          break;
        case CommandType.CHANGE_SCORE:
          spriteStateRef.current.score += (cmd.params.value || 0);
          break;
        case CommandType.LED_ON: hardwareStateRef.current.pins[cmd.params.pin!] = true; setHardwareState({ ...hardwareStateRef.current }); playSoundEffect('click'); break;
        case CommandType.LED_OFF: hardwareStateRef.current.pins[cmd.params.pin!] = false; setHardwareState({ ...hardwareStateRef.current }); playSoundEffect('click'); break;
        case CommandType.SET_RGB: hardwareStateRef.current.rgbColor = cmd.params.color || '#ff0000'; setHardwareState({ ...hardwareStateRef.current }); break;
        case CommandType.SET_FAN: hardwareStateRef.current.fanSpeed = cmd.params.speed || 0; setHardwareState({ ...hardwareStateRef.current }); break;
        case CommandType.SET_SERVO: hardwareStateRef.current.servoAngle = cmd.params.angle || 0; setHardwareState({ ...hardwareStateRef.current }); break;
        case CommandType.PLAY_TONE: playTone(cmd.params.duration || 0.5); await wait((cmd.params.duration || 0.5) * 1000); break;
        case CommandType.PLAY_SOUND: playSpeakerSound(cmd.params.text || 'beep'); break;
        case CommandType.SET_LCD: hardwareStateRef.current.lcdLines[cmd.params.row || 0] = cmd.params.text || ""; setHardwareState({ ...hardwareStateRef.current }); break;
        case CommandType.CLEAR_LCD: hardwareStateRef.current.lcdLines = ["", ""]; setHardwareState({ ...hardwareStateRef.current }); break;
        case CommandType.SET_SEGMENT: hardwareStateRef.current.sevenSegmentValue = cmd.params.value || 0; setHardwareState({ ...hardwareStateRef.current }); break;
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

    const syncInterval = setInterval(() => {
      if (!stopExecution.current) {
        setSpriteState({ ...spriteStateRef.current });
      }
    }, 200);

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const TIME_SLICE_MS = 12;

    while (pc < commands.length && !stopExecution.current) {
      const frameStart = performance.now();

      while (performance.now() - frameStart < TIME_SLICE_MS && pc < commands.length && !stopExecution.current) {
        const cmd = commands[pc];

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
              if (cmd.type === CommandType.END_FOREVER) break;
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
          else if (cmd.params.condition === 'IS_DARK') condition = !hardwareStateRef.current.pins[5];
          else if (cmd.params.condition === 'true') condition = true;
          else if (cmd.params.condition === 'IS_TOUCHING_EDGE') {
            const s = spriteStateRef.current;
            condition = s.x <= 0 || s.x >= 360 || s.y <= 0 || s.y >= 360;
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

      await wait(0);
    }

    clearInterval(syncInterval);
    setIsPlaying(false);
    setActiveBlockId(null);
    setHighlightedPin(null);
    setSpriteState({ ...spriteStateRef.current });
    setHardwareState({ ...hardwareStateRef.current });
  };

  const stopCode = () => {
    stopExecution.current = true;
    setIsPlaying(false);
    setActiveBlockId(null);
  };

  const handleStep = () => {
    if (resumeRef.current) {
      resumeRef.current();
    }
  };

  return {
    isPlaying,
    setIsPlaying,
    activeBlockId,
    setActiveBlockId,
    executionSpeed,
    setExecutionSpeed,
    debugMode,
    setDebugMode,
    isPaused,
    setIsPaused,
    resumeRef,
    runCode,
    stopCode,
    handleStep,
    highlightedPin,
  };
};
