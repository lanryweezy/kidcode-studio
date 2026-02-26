
import { useState, useRef, useCallback, useEffect } from 'react';
import {
    AppMode,
    CommandBlock,
    CommandType,
    HardwareState,
    SpriteState,
    AppState,
    GameEntity,
    AppElement
} from '../types';
import { playSoundEffect, playTone, playSpeakerSound } from '../services/soundService';
import { useStore } from '../store/useStore';
import { serialService } from '../services/webSerialService';
import { eventBus } from '../services/eventBus';

interface UseCodeInterpreterProps {
    mode: AppMode;
    commands: CommandBlock[];
    hardwareState: HardwareState;
    setHardwareState: React.Dispatch<React.SetStateAction<HardwareState>>;
    hardwareStateRef: React.MutableRefObject<HardwareState>;
    spriteState: SpriteState;
    setSpriteState: React.Dispatch<React.SetStateAction<SpriteState>>;
    spriteStateRef: React.MutableRefObject<SpriteState>;
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    appStateRef: React.MutableRefObject<AppState>;
}

export const useCodeInterpreter = ({
    mode,
    commands,
    hardwareState,
    setHardwareState,
    hardwareStateRef,
    spriteState,
    setSpriteState,
    spriteStateRef,
    appState,
    setAppState,
    appStateRef
}: UseCodeInterpreterProps) => {
    const { setNpcChat, npcChat, setGameState, addPlugin, plugins, particleSettings, isBoardConnected } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [executionSpeed, setExecutionSpeed] = useState(1);
    const [debugMode, setDebugMode] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
    const [showConsole, setShowConsole] = useState(false);
    const [highlightedPin, setHighlightedPin] = useState<number | null>(null);

    const resumeRef = useRef<() => void>(() => { });
    const stopExecution = useRef(false);
    const speedRef = useRef(1);
    const renderingScreen = useRef<string>('main');

    useEffect(() => {
        speedRef.current = executionSpeed;
    }, [executionSpeed]);

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

    const executeSingleCommand = async (cmd: CommandBlock, wait: (ms: number) => Promise<unknown>) => {
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

        const addAppElement = (type: AppElement['type'] | 'news_feed' | 'chat_bubble', defaultContent: string, extraParams: Partial<AppElement> & { alignment?: 'left' | 'right' } = {}) => {
            try {
                const currentScr = renderingScreen.current;
                const newEl: AppElement = {
                    id: crypto.randomUUID(),
                    blockId: cmd.id,
                    type: type as any,
                    content: cmd.params.text || defaultContent,
                    ...extraParams
                };
                const prev = appStateRef.current;
                const newState = { ...prev, screens: { ...prev.screens, [currentScr]: [...(prev.screens[currentScr] || []), newEl] } };
                appStateRef.current = newState;
                setAppState(newState);
            } catch (error) {
                console.error('Error adding app element:', error);
                setConsoleLogs(prev => [...prev, `Error: Failed to add element - ${(error as Error).message}`].slice(-50));
            }
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
                case CommandType.ADD_NEWS_FEED:
                    addAppElement('news_feed', cmd.params.text || 'Check out my latest project!');
                    break;
                case CommandType.ADD_CHAT_MESSAGE:
                    addAppElement('chat_bubble', cmd.params.text || 'Hello!', { alignment: cmd.params.message === 'right' ? 'right' : 'left' });
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
                case CommandType.DEFINE_PLUGIN:
                    const name = cmd.params.text || 'MyPlugin';
                    const elements = appStateRef.current.screens[renderingScreen.current] || [];
                    addPlugin(name, [...elements]);
                    setConsoleLogs(prev => [...prev, `📦 Plugin '${name}' defined!`].slice(-50));
                    break;
                case CommandType.USE_PLUGIN:
                    const pluginName = cmd.params.text || 'MyPlugin';
                    const pluginElements = plugins[pluginName];
                    if (pluginElements) {
                        const currentScr = renderingScreen.current;
                        const prev = appStateRef.current;
                        // Add all elements from plugin with new IDs
                        const clonedElements = pluginElements.map(el => ({ ...el, id: crypto.randomUUID() }));
                        const newState = { ...prev, screens: { ...prev.screens, [currentScr]: [...(prev.screens[currentScr] || []), ...clonedElements] } };
                        appStateRef.current = newState;
                        setAppState(newState);
                    }
                    break;
                case CommandType.CLOUD_SAVE:
                    const dataToSave = mode === AppMode.APP ? appStateRef.current.variables : spriteStateRef.current.variables;
                    localStorage.setItem('kidcode_cloud', JSON.stringify(dataToSave));
                    setConsoleLogs(prev => [...prev, '☁️ Data saved to cloud!'].slice(-50));
                    break;
                case CommandType.CLOUD_LOAD:
                    try {
                        const raw = localStorage.getItem('kidcode_cloud');
                        if (raw) {
                            const loaded = JSON.parse(raw);
                            if (mode === AppMode.APP) {
                                appStateRef.current.variables = { ...appStateRef.current.variables, ...loaded };
                                setAppState({ ...appStateRef.current });
                            } else if (mode === AppMode.GAME) {
                                spriteStateRef.current.variables = { ...spriteStateRef.current.variables, ...loaded };
                                setSpriteState({ ...spriteStateRef.current });
                            }
                            setConsoleLogs(prev => [...prev, '☁️ Data loaded from cloud!'].slice(-50));
                        }
                    } catch (e) { console.error("Cloud load error", e); }
                    break;

                // --- DATA & MATH ---
                case CommandType.SET_VAR:
                    const varName = cmd.params.varName!;
                    const value = cmd.params.value;

                    if (mode === AppMode.APP) {
                        // Global variable logic
                        if (varName.startsWith('global_')) {
                            appStateRef.current.variables[varName] = value;
                        } else {
                            // Screen-local variable (scoped to current screen in future, currently shared but good practice to prep)
                            appStateRef.current.variables[varName] = value;
                        }
                    }
                    if (mode === AppMode.GAME) spriteStateRef.current.variables[varName] = value;
                    break;

                case CommandType.CHANGE_VAR:
                    const vName = cmd.params.varName!;
                    const val = Number(cmd.params.value) || 0;

                    if (mode === AppMode.APP) {
                        const current = Number(appStateRef.current.variables[vName] || 0);
                        appStateRef.current.variables[vName] = current + val;
                    }
                    if (mode === AppMode.GAME) {
                        const current = Number(spriteStateRef.current.variables[vName] || 0);
                        spriteStateRef.current.variables[vName] = current + val;
                    }
                    break;
                case CommandType.CALC_ADD:
                    const v1 = Number(cmd.params.value) || 0;
                    const v2 = Number(cmd.params.value2) || 0;
                    if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = v1 + v2;
                    break;

                case CommandType.LED_ON:
                    hardwareStateRef.current.pins[cmd.params.pin!] = true;
                    playSoundEffect('click');
                    if (isBoardConnected) serialService.sendCommand({ type: 'digitalWrite', pin: cmd.params.pin, value: 1 });
                    break;
                case CommandType.LED_OFF:
                    hardwareStateRef.current.pins[cmd.params.pin!] = false;
                    playSoundEffect('click');
                    if (isBoardConnected) serialService.sendCommand({ type: 'digitalWrite', pin: cmd.params.pin, value: 0 });
                    break;
                case CommandType.LED_TOGGLE:
                    const currentPin = hardwareStateRef.current.pins[cmd.params.pin!];
                    hardwareStateRef.current.pins[cmd.params.pin!] = !currentPin;
                    playSoundEffect('click');
                    if (isBoardConnected) serialService.sendCommand({ type: 'digitalWrite', pin: cmd.params.pin, value: !currentPin ? 1 : 0 });
                    break;
                case CommandType.SET_RGB:
                    hardwareStateRef.current.rgbColor = cmd.params.color || '#ff0000';
                    break;
                case CommandType.SET_FAN:
                    hardwareStateRef.current.fanSpeed = cmd.params.speed || 0;
                    break;
                case CommandType.SET_SERVO:
                    hardwareStateRef.current.servoAngle = cmd.params.angle || 90;
                    if (isBoardConnected) serialService.sendCommand({ type: 'servoWrite', pin: cmd.params.pin, value: cmd.params.angle });
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
                    setTimeout(() => {
                        hardwareStateRef.current.vibrationActive = false;
                        if (!isPlaying) setHardwareState({ ...hardwareStateRef.current });
                    }, (cmd.params.duration || 0.5) * 1000);
                    break;
                case CommandType.PLAY_SOUND: playSpeakerSound(cmd.params.text || 'beep'); break;
                case CommandType.PLAY_TONE: playTone(cmd.params.duration || 0.5); await wait((cmd.params.duration || 0.5) * 1000); break;
                case CommandType.SET_LCD:
                    hardwareStateRef.current.lcdLines[0] = cmd.params.text || 'Hello';
                    break;
                case CommandType.CLEAR_LCD:
                    hardwareStateRef.current.lcdLines = ['', ''];
                    break;
                case CommandType.SET_SEGMENT:
                    hardwareStateRef.current.sevenSegmentValue = cmd.params.value || 0;
                    break;
                case CommandType.READ_DIGITAL:
                    if (cmd.params.varName) {
                        if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                        if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                        if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                    }
                    break;
                case CommandType.READ_ANALOG:
                    if (cmd.params.varName) {
                        if (mode === AppMode.APP) appStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                        if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                        if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                    }
                    break;

                case CommandType.CONNECT_WIFI:
                    const ssid = cmd.params.ssid || 'default_network';
                    const password = cmd.params.password || '';
                    hardwareStateRef.current.wifiConnected = password.length > 0;
                    setConsoleLogs(prev => [...prev, `WiFi connected to: ${ssid}`].slice(-50));
                    if (!showConsole) setShowConsole(true);
                    break;

                case CommandType.SEND_HTTP:
                    const method = cmd.params.method || 'GET';
                    setConsoleLogs(prev => [...prev, `HTTP ${method}: ${cmd.params.url}`].slice(-50));
                    if (!showConsole) setShowConsole(true);
                    break;

                // --- LOGIC GATES ---
                case CommandType.LOGIC_AND:
                    if (cmd.params.varName) {
                        hardwareStateRef.current.variables[cmd.params.varName] = Boolean(cmd.params.value && cmd.params.value2);
                    }
                    break;
                case CommandType.LOGIC_OR:
                    if (cmd.params.varName) {
                        hardwareStateRef.current.variables[cmd.params.varName] = Boolean(cmd.params.value || cmd.params.value2);
                    }
                    break;
                case CommandType.LOGIC_NOT:
                    if (cmd.params.varName) {
                        hardwareStateRef.current.variables[cmd.params.varName] = !Boolean(cmd.params.value);
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
                case CommandType.SPAWN_PARTICLES:
                    spriteStateRef.current.effectTrigger = {
                        type: particleSettings.type,
                        x: spriteStateRef.current.x,
                        y: spriteStateRef.current.y,
                        color: particleSettings.color
                    };
                    break;
                case CommandType.NPC_TALK:
                    setNpcChat({ name: cmd.params.text || 'Guard', message: cmd.params.message || 'Greetings adventurer!' });
                    // Block until chat is closed
                    while (useStore.getState().npcChat !== null && !stopExecution.current) {
                        await wait(100);
                    }
                    break;
                case CommandType.SPAWN_ENEMY:
                    spriteStateRef.current.enemies.push({
                        id: crypto.randomUUID(),
                        x: Math.random() * 300 + 50,
                        y: Math.random() * 300 + 50,
                        type: 'enemy',
                        emoji: cmd.params.text || '👾',
                        width: 30, height: 30
                    });
                    break;
                case CommandType.SPAWN_ITEM:
                    spriteStateRef.current.items.push({
                        id: crypto.randomUUID(),
                        x: Math.random() * 300 + 50,
                        y: Math.random() * 300 + 50,
                        type: 'item',
                        emoji: cmd.params.text || '💎',
                        width: 20, height: 20
                    });
                    break;
                // --- 3D COMMANDS ---
                case CommandType.SET_VIEW_3D:
                case CommandType.SWITCH_TO_3D_MODE:
                    spriteStateRef.current.is3D = true;
                    break;
                case CommandType.SWITCH_TO_2D_MODE:
                    spriteStateRef.current.is3D = false;
                    break;
                case CommandType.MOVE_Z:
                    spriteStateRef.current.z += (cmd.params.value || 0);
                    break;
                case CommandType.ROTATE_X:
                    spriteStateRef.current.rotationX += (cmd.params.value || 0);
                    break;
                case CommandType.ROTATE_Y:
                    spriteStateRef.current.rotationY += (cmd.params.value || 0);
                    break;
                case CommandType.ROTATE_Z:
                    spriteStateRef.current.rotationZ += (cmd.params.value || 0);
                    break;
                case CommandType.SET_CAMERA:
                case CommandType.SET_3D_CAMERA:
                    if (spriteStateRef.current.is3D) {
                        spriteStateRef.current.cameraMode = (cmd.params.text as any) || 'third_person';
                    }
                    break;
                case CommandType.GENERATE_ENVIRONMENT:
                    if (spriteStateRef.current.is3D) {
                        const prompt = cmd.params.text || 'plains';
                        spriteStateRef.current.worldPrompt = prompt;
                        // Hash text to a seed if needed
                        let hash = 0;
                        for (let i = 0; i < prompt.length; i++) {
                            hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
                            hash |= 0;
                        }
                        spriteStateRef.current.worldSeed = Math.abs(hash);
                        setConsoleLogs(prev => [...prev, `🌍 Generating environment: ${prompt}...`].slice(-50));
                    }
                    break;
                case CommandType.SPAWN_3D_MODEL:
                case CommandType.SPAWN_3D_OBJECT:
                    const obj3d: GameEntity = {
                        id: crypto.randomUUID(),
                        x: cmd.params.x || 0,
                        y: cmd.params.y || 0,
                        z: cmd.params.z || 0,
                        type: 'object3d',
                        emoji: cmd.params.text || '📦',
                        modelUrl: `/models/${cmd.params.text}.glb`
                    };
                    if (!spriteStateRef.current.objects3d) spriteStateRef.current.objects3d = [];
                    spriteStateRef.current.objects3d.push(obj3d);
                    break;
                case CommandType.SET_3D_POSITION:
                    spriteStateRef.current.x = cmd.params.x ?? spriteStateRef.current.x;
                    spriteStateRef.current.y = cmd.params.y ?? spriteStateRef.current.y;
                    spriteStateRef.current.z = cmd.params.z ?? spriteStateRef.current.z;
                    break;
                case CommandType.ROTATE_3D_MODEL:
                    spriteStateRef.current.rotationX = cmd.params.x ?? spriteStateRef.current.rotationX;
                    spriteStateRef.current.rotationY = cmd.params.y ?? spriteStateRef.current.rotationY;
                    spriteStateRef.current.rotationZ = cmd.params.z ?? spriteStateRef.current.rotationZ;
                    break;
                case CommandType.SCALE_3D_MODEL:
                    spriteStateRef.current.scale = cmd.params.value ?? spriteStateRef.current.scale;
                    break;
                case CommandType.PLAY_3D_ANIMATION:
                    spriteStateRef.current.currentAnimation = cmd.params.text || 'idle';
                    break;
                case CommandType.SET_3D_LIGHTING:
                    setConsoleLogs(prev => [...prev, `💡 Setting 3D Lighting: ${cmd.params.color} (${cmd.params.intensity})`].slice(-50));
                    break;
                case CommandType.ENABLE_PHYSICS_3D:
                    setConsoleLogs(prev => [...prev, `⚡ 3D Physics: ${cmd.params.condition === 'true' ? 'Enabled' : 'Disabled'}`].slice(-50));
                    break;
                case CommandType.BROADCAST:
                    eventBus.emit(`msg_${cmd.params.text}`);
                    break;

                // --- PHYSICS 2.0 ---
                case CommandType.SET_PHYSICS_TYPE:
                    // In a real implementation, this would update the body in the physics world
                    // For now, we store it in metadata
                    console.log(`Setting physics type to: ${cmd.params.text}`);
                    break;
                case CommandType.CREATE_JOINT:
                    console.log(`Creating joint with: ${cmd.params.text}`);
                    break;
                case CommandType.APPLY_FORCE:
                    spriteStateRef.current.vx += (cmd.params.x || 0);
                    spriteStateRef.current.vy += (cmd.params.y || 0);
                    break;

                case CommandType.PLAY_ANIMATION:
                    spriteStateRef.current.currentAnimation = cmd.params.text || null;
                    break;
                case CommandType.WIN_GAME:
                    setGameState('won');
                    stopExecution.current = true;
                    break;
                case CommandType.GAME_OVER:
                    setGameState('over');
                    stopExecution.current = true;
                    break;
                case CommandType.CHANGE_SCORE:
                    spriteStateRef.current.score += (cmd.params.value || 1);
                    break;
                case CommandType.CHANGE_HEALTH:
                    spriteStateRef.current.health += (cmd.params.value || -1);
                    if (spriteStateRef.current.health <= 0) {
                        setGameState('over');
                        stopExecution.current = true;
                    }
                    break;
            }
        } catch (e) {
            console.error("Execution error", e);
        }
    };

    const evaluateCondition = (cmd: CommandBlock): boolean => {
        if (!cmd.params) return true;

        let val1: any = 0;
        if (cmd.params.varName) {
            if (mode === AppMode.APP) val1 = appStateRef.current.variables[cmd.params.varName];
            else if (mode === AppMode.GAME) val1 = spriteStateRef.current.variables[cmd.params.varName];
            else val1 = hardwareStateRef.current.variables[cmd.params.varName];
        } else if (cmd.params.value !== undefined) {
            val1 = cmd.params.value;
        }

        const cond = String(cmd.params.condition || '').toLowerCase();

        if (cond === 'true' || cond === '') return true;
        if (cond === 'false') return false;

        if (cond === 'is_touching_edge' || cond === 'touching_edge') {
            const { x, y } = spriteStateRef.current;
            return x <= 0 || x >= 800 || y <= 0 || y >= 600; // approximation
        }

        if (cond.includes('>')) {
            const parts = cond.split('>');
            return Number(val1) > Number(parts[1]?.trim());
        }
        if (cond.includes('<')) {
            const parts = cond.split('<');
            return Number(val1) < Number(parts[1]?.trim());
        }
        if (cond.includes('=')) {
            const parts = cond.split('=');
            return String(val1) === String(parts[1]?.trim());
        }

        return Boolean(val1);
    };

    const runCode = async () => {
        let syncInterval: any = null;
        try {
            if (isPlaying) return;
            setIsPlaying(true);
            stopExecution.current = false;
            setConsoleLogs([]);
            eventBus.clear();

            // Reset state for clean run
            if (mode === AppMode.APP) {
                setAppState(prev => ({ ...prev, screens: { 'main': [] }, activeScreen: 'main', variables: {} }));
                appStateRef.current = { ...appStateRef.current, screens: { 'main': [] }, activeScreen: 'main', variables: {} };
                renderingScreen.current = 'main';
            }

            // --- EVENT REGISTRATION ---
            const mainSequence: CommandBlock[] = [];
            let currentEventHandler: { type: string, trigger: string, blocks: CommandBlock[] } | null = null;

            for (const cmd of commands) {
                if (cmd.type === CommandType.ON_COLLIDE || cmd.type === CommandType.WHEN_I_RECEIVE || cmd.type === CommandType.ON_CLICK) {
                    currentEventHandler = {
                        type: cmd.type,
                        trigger: cmd.params.text || 'any',
                        blocks: []
                    };
                    continue;
                }

                if (cmd.type === CommandType.END_EVENT) {
                    if (currentEventHandler) {
                        const handler = currentEventHandler;
                        const eventName = handler.type === CommandType.WHEN_I_RECEIVE ? `msg_${handler.trigger}` : handler.type.toLowerCase();

                        eventBus.on(eventName, async (data) => {
                            // Create a mini-runner for the event blocks
                            const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
                            for (const b of handler.blocks) {
                                if (stopExecution.current) break;
                                await executeSingleCommand(b, wait);
                            }
                        });
                        currentEventHandler = null;
                    }
                    continue;
                }

                if (currentEventHandler) {
                    currentEventHandler.blocks.push(cmd);
                } else {
                    mainSequence.push(cmd);
                }
            }

            const wait = (ms: number) => new Promise(res => {
                const timeout = setTimeout(res, ms);
                const checkStop = setInterval(() => {
                    if (stopExecution.current) {
                        clearTimeout(timeout);
                        clearInterval(checkStop);
                        res(null);
                    }
                }, 10);
            });

            // Background state sync
            syncInterval = setInterval(() => {
                if (stopExecution.current) {
                    clearInterval(syncInterval);
                    return;
                }
                setHardwareState({ ...hardwareStateRef.current });
                setSpriteState({ ...spriteStateRef.current });
            }, 50);

            // --- BUILD JUMP TABLE ---
            const jumpTable = new Map<number, number>();
            const elseTable = new Map<number, number>();
            const loopStack: number[] = [];
            const ifStack: number[] = [];

            for (let i = 0; i < mainSequence.length; i++) {
                const cmd = mainSequence[i];
                if (cmd.type === CommandType.REPEAT || cmd.type === CommandType.FOREVER) {
                    loopStack.push(i);
                } else if (cmd.type === CommandType.END_REPEAT || cmd.type === CommandType.END_FOREVER) {
                    const start = loopStack.pop();
                    if (start !== undefined) {
                        jumpTable.set(start, i);
                        jumpTable.set(i, start - 1); // jump to just before loop so condition re-evaluates
                    }
                } else if (cmd.type === CommandType.IF) {
                    ifStack.push(i);
                } else if (cmd.type === CommandType.ELSE) {
                    const start = ifStack[ifStack.length - 1];
                    if (start !== undefined && mainSequence[start]?.type === CommandType.IF) {
                        elseTable.set(start, i);
                    }
                } else if (cmd.type === CommandType.END_IF) {
                    const start = ifStack.pop();
                    if (start !== undefined) {
                        jumpTable.set(start, i);
                        if (elseTable.has(start)) {
                            const elseIdx = elseTable.get(start)!;
                            jumpTable.set(elseIdx, i);
                        }
                    }
                }
            }

            // --- ITERATIVE EXECUTION ---
            let pc = 0;
            const loopCounts = new Map<number, number>();
            let stepsSinceYield = 0;

            while (pc < mainSequence.length) {
                if (stopExecution.current) break;

                const cmd = mainSequence[pc];

                if (cmd.type === CommandType.REPEAT) {
                    const maxCount = Number(cmd.params.value) || 1;
                    const currentCount = loopCounts.get(pc) || 0;

                    if (currentCount < maxCount) {
                        loopCounts.set(pc, currentCount + 1);
                        highlightBlockFast(cmd.id);
                        await wait(50 * (1 / speedRef.current));
                    } else {
                        loopCounts.set(pc, 0); // reset for future iterations
                        pc = jumpTable.get(pc) || pc;
                    }
                }
                else if (cmd.type === CommandType.FOREVER) {
                    highlightBlockFast(cmd.id);
                    await wait(20 * (1 / speedRef.current));
                }
                else if (cmd.type === CommandType.IF) {
                    const isTrue = evaluateCondition(cmd);
                    highlightBlockFast(cmd.id);
                    await wait(20 * (1 / speedRef.current));
                    if (!isTrue) {
                        pc = elseTable.get(pc) || jumpTable.get(pc) || pc;
                    }
                }
                else if (cmd.type === CommandType.ELSE) {
                    pc = jumpTable.get(pc) || pc;
                }
                else if (cmd.type === CommandType.END_REPEAT || cmd.type === CommandType.END_FOREVER || cmd.type === CommandType.END_IF) {
                    const target = jumpTable.get(pc);
                    if (target !== undefined) {
                        pc = target;
                        continue;
                    }
                }
                else {
                    await executeSingleCommand(cmd, wait);
                }

                pc++;

                // CRASH PROTECTION / YIELDING
                stepsSinceYield++;
                if (stepsSinceYield > 10) {
                    await new Promise(r => setTimeout(r, 0));
                    stepsSinceYield = 0;
                }
            }

        } catch (error) {
            console.error("Run Error:", error);
        } finally {
            if (syncInterval) clearInterval(syncInterval);
            setIsPlaying(false);
            setActiveBlockId(null);
            highlightBlockFast(null);
        }
    };

    const stopCode = () => {
        stopExecution.current = true;
        setIsPlaying(false);
        setIsPaused(false);
        setActiveBlockId(null);
        highlightBlockFast(null);
        setHardwareState({ ...hardwareStateRef.current });
        setSpriteState({ ...spriteStateRef.current });
    };

    const stepCode = async () => {
        // Logic for single step debugging could go here
    };

    const resumeCode = () => {
        setIsPaused(false);
        resumeRef.current();
    };

    const clearLogs = useCallback(() => {
        setConsoleLogs([]);
    }, []);

    return {
        isPlaying,
        activeBlockId,
        executionSpeed,
        setExecutionSpeed,
        debugMode,
        setDebugMode,
        isPaused,
        consoleLogs,
        clearLogs,
        showConsole,
        setShowConsole,
        highlightedPin,
        runCode,
        stopCode,
        stepCode,
        resumeCode
    };
};
