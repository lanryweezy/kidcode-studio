import {
    CommandType,
    AppMode,
    GameEntity,
    InventoryItem,
    CharacterStats,
    SpriteState,
    AppElement
} from '../../types';
import { HandlerContext } from './types';
import { useStore } from '../../store/useStore';
import { serialService } from '../../services/webSerialService';
import { playSpeakerSound, playTone } from '../../services/soundService';
import { bgmPlayer, ambientManager, BGMTrack } from '../../services/audioEngine';
import { commandBlockToIR, executeIRNode } from '../../services/ir';

export const handleCoreCommand = async (ctx: HandlerContext): Promise<boolean> => {
    const {
        cmd, mode, spriteStateRef, appStateRef, hardwareStateRef,
        setNpcChat, playSound, setConsoleLogs, stopExecution, wait,
        appState, setAppState, setSpriteState, setHardwareState,
        isBoardConnected, showConsole, setShowConsole, plugins,
        addPlugin, renderingScreen, particleSettings, circuitComponents,
        setGameState, addAppElement, eventBus
    } = ctx;

    const speedMultiplier = 1; // speed is handled by caller

    switch (cmd.type) {
        // --- SAVE/LOAD ---
        case CommandType.SAVE_GAME: {
            const slot = cmd.params.text || 'slot1';
            const saveData = {
                variables: spriteStateRef.current.variables,
                score: spriteStateRef.current.score,
                health: spriteStateRef.current.health,
                x: spriteStateRef.current.x,
                y: spriteStateRef.current.y
            };
            localStorage.setItem(`savegame_${slot}`, JSON.stringify(saveData));
            setConsoleLogs(prev => [...prev, `Game saved to ${slot}`]);
            return true;
        }
        case CommandType.LOAD_GAME: {
            const slot = cmd.params.text || 'slot1';
            const savedString = localStorage.getItem(`savegame_${slot}`);
            if (savedString) {
                try {
                    const saveData = JSON.parse(savedString);
                    spriteStateRef.current = {
                        ...spriteStateRef.current,
                        variables: { ...spriteStateRef.current.variables, ...(saveData.variables || {}) },
                        score: saveData.score ?? spriteStateRef.current.score,
                        health: saveData.health ?? spriteStateRef.current.health,
                        x: saveData.x ?? spriteStateRef.current.x,
                        y: saveData.y ?? spriteStateRef.current.y
                    };
                    setConsoleLogs(prev => [...prev, `Game loaded from ${slot}`]);
                } catch (e) {
                    setConsoleLogs(prev => [...prev, `Failed to load ${slot}`]);
                }
            } else {
                setConsoleLogs(prev => [...prev, `No save found in ${slot}`]);
            }
            return true;
        }

        // --- WAIT/LOG ---
        case CommandType.WAIT:
        case CommandType.SLEEP:
            await wait((cmd.params.value || 1) * 1000);
            return true;
        case CommandType.LOG_DATA:
            setConsoleLogs(prev => [...prev, String(cmd.params.text)].slice(-50));
            if (!showConsole) setShowConsole(true);
            return true;

        // --- GAME COMMANDS (via IR) ---
        case CommandType.MOVE_X:
        case CommandType.MOVE_Y:
        case CommandType.SET_VELOCITY_X:
        case CommandType.SET_VELOCITY_Y:
        case CommandType.SET_GRAVITY:
        case CommandType.SET_FRICTION:
        case CommandType.SET_BOUNCINESS:
        case CommandType.JUMP:
        case CommandType.SAY:
        case CommandType.THINK:
        case CommandType.SHOW:
        case CommandType.HIDE:
        case CommandType.SET_EMOJI:
        case CommandType.SET_SIZE:
        case CommandType.SET_OPACITY:
        case CommandType.SPAWN_ENEMY:
        case CommandType.SPAWN_ITEM:
        case CommandType.SPAWN_PARTICLES:
        case CommandType.CHANGE_SCORE:
        case CommandType.SET_SCORE:
        case CommandType.CHANGE_HEALTH:
        case CommandType.SET_HEALTH:
        case CommandType.GAME_OVER:
        case CommandType.WIN_GAME:
        case CommandType.SET_CAMERA:
        case CommandType.SHAKE_SCREEN:
        case CommandType.SHAKE_CAMERA:
        case CommandType.PLAY_SOUND:
        case CommandType.PLAY_MUSIC:
        case CommandType.SET_BACKGROUND_MUSIC:
        case CommandType.STOP_MUSIC:
        case CommandType.ADD_TO_INVENTORY:
        case CommandType.REMOVE_FROM_INVENTORY:
        case CommandType.TRIGGER_CUTSCENE:
        case CommandType.FADE_IN:
        case CommandType.FADE_OUT:
        case CommandType.SPAWN_BOSS:
        case CommandType.SET_BOSS_HEALTH:
        case CommandType.BOSS_ATTACK:
        case CommandType.BOSS_PHASE:
        case CommandType.DASH:
        case CommandType.DOUBLE_JUMP:
        case CommandType.WALL_JUMP:
        case CommandType.GRAPPLE:
        case CommandType.CREATE_CHECKPOINT:
        case CommandType.LOAD_CHECKPOINT:
        case CommandType.CREATE_DIALOGUE:
        case CommandType.END_DIALOGUE:
        case CommandType.NPC_TALK:
        case CommandType.SHOOT:
        case CommandType.ADD_PLATFORM:
        case CommandType.CREATE_CLONE:
        case CommandType.DELETE_CLONE:
        case CommandType.SET_WEATHER:
        case CommandType.KICK_BALL:
        case CommandType.PASS_BALL:
        case CommandType.DRIBBLE:
        case CommandType.SHOOT_BALL:
        case CommandType.SET_TIMER:
        case CommandType.TICK_TIMER:
        case CommandType.STOP_TIMER:
        case CommandType.SCORE_GOAL:
        case CommandType.ADD_PERIOD:
        case CommandType.END_PERIOD:
        case CommandType.SPAWN_BALL:
        case CommandType.SPAWN_TEAMMATE:
        case CommandType.SPAWN_OPPONENT:
        case CommandType.SWITCH_CONTROL:
        case CommandType.SET_FORMATION:
        case CommandType.FOUL:
        case CommandType.YELLOW_CARD:
        case CommandType.RED_CARD:
        case CommandType.SWING_WEAPON:
        case CommandType.COMBO_ATTACK:
        case CommandType.DODGE_ROLL:
        case CommandType.BLOCK_ATTACK:
        case CommandType.SPECIAL_MOVE:
        case CommandType.SWITCH_WEAPON:
        case CommandType.CHARGE_ATTACK:
        case CommandType.EXAMINE:
        case CommandType.USE_ITEM:
        case CommandType.COMBINE_ITEMS:
        case CommandType.TALK_TO:
        case CommandType.ADD_QUEST:
        case CommandType.COMPLETE_QUEST:
        case CommandType.DISCOVER:
        case CommandType.TRIGGER_PUZZLE:
        case CommandType.RELOAD:
        case CommandType.THROW_GRENADE:
        case CommandType.TAKE_COVER:
        case CommandType.AIM:
        case CommandType.SWAP_WEAPON:
        case CommandType.DROP_WEAPON:
        case CommandType.PICKUP_WEAPON:
        case CommandType.GATHER:
        case CommandType.CRAFT:
        case CommandType.EAT:
        case CommandType.DRINK:
        case CommandType.BUILD:
        case CommandType.PLACE_TORCH:
        case CommandType.SHELTER:
        case CommandType.SWAP_TILES:
        case CommandType.ROTATE_BLOCK:
        case CommandType.SLIDE_PUZZLE:
        case CommandType.FILL_COLOR:
        case CommandType.CONNECT_DOTS:
        case CommandType.SORT_ITEMS:
        case CommandType.UNLOCK_PATTERN:
        case CommandType.MIRROR_PUZZLE:
        case CommandType.FLIP_CARD:
        case CommandType.CHECK_MATCH:
        case CommandType.BOOST:
        case CommandType.DRIFT:
        case CommandType.LAP_COMPLETE:
        case CommandType.START_RACE:
        case CommandType.SET_CHECKPOINT:
        case CommandType.UPGRADE_CAR:
        case CommandType.PIT_STOP:
        case CommandType.USE_BOOST_PAD:
        case CommandType.CRY_FOUL:
        case CommandType.CELEBRATE_GOAL:
        case CommandType.SUBSTITUTION:
        case CommandType.EXTRA_TIME:
        case CommandType.PENALTY_KICK:
        case CommandType.CORNER_KICK:
        case CommandType.FREE_KICK:
        case CommandType.INJURY_TIME:
        case CommandType.WATER_BREAK:
        case CommandType.TEAM_TALK:
        case CommandType.SET_PIECE:
        case CommandType.GO_TO_XY:
        case CommandType.TURN_RIGHT:
        case CommandType.TURN_LEFT:
        case CommandType.SET_SCENE:
        case CommandType.PLAY_ANIMATION:
        case CommandType.SET_MUSIC_VOLUME:
        case CommandType.PLAY_AMBIENT:
        case CommandType.SLOW_MOTION:
        case CommandType.MAN_MARK: {
            const irNode = commandBlockToIR(cmd);
            if (irNode) {
                await executeIRNode(irNode, {
                    spriteState: spriteStateRef.current,
                    playSound: playSound as (type: string) => void,
                    setNpcChat,
                    wait: wait as (ms: number) => Promise<void>,
                    stopExecution,
                    setGameState: setGameState as (state: string) => void,
                    particleSettings
                });
                return true;
            }
            return false;
        }

        // --- APP BUILDER ---
        case CommandType.CREATE_SCREEN:
            renderingScreen.current = cmd.params.text || 'main';
            setAppState(prev => ({ ...prev, screens: { ...prev.screens, [renderingScreen.current]: [] } }));
            return true;
        case CommandType.ADD_BUTTON:
            addAppElement('button', cmd.params.text || 'Button', { actionMessage: cmd.params.message, targetScreen: cmd.params.screenName });
            return true;
        case CommandType.ADD_INPUT:
            addAppElement('input', '', { variableName: cmd.params.varName, placeholder: cmd.params.text });
            return true;
        case CommandType.ADD_TEXT_BLOCK:
            addAppElement('text', cmd.params.text || '', { color: cmd.params.color, textSize: cmd.params.textSize });
            return true;
        case CommandType.ADD_IMAGE:
            addAppElement('image', cmd.params.text || '');
            return true;
        case CommandType.ADD_SWITCH:
            addAppElement('switch', cmd.params.text || 'Toggle', { variableName: cmd.params.varName });
            return true;
        case CommandType.ADD_SLIDER:
            addAppElement('slider', cmd.params.text || 'Value', { variableName: cmd.params.varName });
            return true;
        case CommandType.ADD_NEWS_FEED:
            addAppElement('news_feed', cmd.params.text || 'Check out my latest project!');
            return true;
        case CommandType.ADD_CHAT_MESSAGE:
            addAppElement('chat_bubble', cmd.params.text || 'Hello!', { alignment: cmd.params.message === 'right' ? 'right' : 'left' });
            return true;
        case CommandType.ADD_CHECKBOX:
            addAppElement('checkbox', cmd.params.text || 'Check', { variableName: cmd.params.varName });
            return true;
        case CommandType.SHOW_ALERT:
            alert(cmd.params.text);
            return true;
        case CommandType.NAVIGATE:
            renderingScreen.current = cmd.params.text || 'main';
            setAppState(prev => ({ ...prev, activeScreen: cmd.params.text || 'main' }));
            return true;
        case CommandType.DEFINE_PLUGIN: {
            const name = cmd.params.text || 'MyPlugin';
            const elements = appStateRef.current.screens[renderingScreen.current] || [];
            addPlugin(name, [...elements]);
            setConsoleLogs(prev => [...prev, `📦 Plugin '${name}' defined!`].slice(-50));
            return true;
        }
        case CommandType.USE_PLUGIN: {
            const pluginName = cmd.params.text || 'MyPlugin';
            const pluginElements = plugins[pluginName];
            if (pluginElements) {
                const currentScr = renderingScreen.current;
                const prev = appStateRef.current;
                const clonedElements = (pluginElements as AppElement[]).map((el) => ({ ...el, id: crypto.randomUUID() }));
                const newState = { ...prev, screens: { ...prev.screens, [currentScr]: [...(prev.screens[currentScr] || []), ...clonedElements] } };
                appStateRef.current = newState;
                setAppState(newState);
            }
            return true;
        }
        case CommandType.CLOUD_SAVE: {
            const dataToSave = spriteStateRef.current.variables;
            localStorage.setItem('kidcode_cloud', JSON.stringify(dataToSave));
            setConsoleLogs(prev => [...prev, '☁️ Data saved to cloud!'].slice(-50));
            return true;
        }
        case CommandType.CLOUD_LOAD: {
            try {
                const raw = localStorage.getItem('kidcode_cloud');
                if (raw) {
                    const loaded = JSON.parse(raw);
                    if (mode === AppMode.GAME) {
                        spriteStateRef.current.variables = { ...spriteStateRef.current.variables, ...loaded };
                        setSpriteState({ ...spriteStateRef.current });
                    }
                    setConsoleLogs(prev => [...prev, '☁️ Data loaded from cloud!'].slice(-50));
                }
            } catch (e) { console.error("Cloud load error", e); }
            return true;
        }

        // --- DATA & MATH ---
        case CommandType.SET_VAR: {
            const varName = cmd.params.varName!;
            const value = cmd.params.value;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[varName] = value;
            return true;
        }
        case CommandType.CHANGE_VAR: {
            const vName = cmd.params.varName!;
            const val = Number(cmd.params.value) || 0;
            if (mode === AppMode.GAME) {
                const current = Number(spriteStateRef.current.variables[vName] || 0);
                spriteStateRef.current.variables[vName] = current + val;
            }
            return true;
        }
        case CommandType.CALC_ADD: {
            const v1 = Number(cmd.params.value) || 0;
            const v2 = Number(cmd.params.value2) || 0;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = v1 + v2;
            return true;
        }
        case CommandType.CALC_RANDOM: {
            const rMin = Number(cmd.params.value) || 0;
            const rMax = Number(cmd.params.value2) || 10;
            const rResult = Math.floor(Math.random() * (rMax - rMin + 1)) + rMin;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = rResult;
            return true;
        }
        case CommandType.CALC_SUB: {
            const subV1 = Number(cmd.params.value) || 0;
            const subV2 = Number(cmd.params.value2) || 0;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = subV1 - subV2;
            return true;
        }
        case CommandType.CALC_MUL: {
            const mulV1 = Number(cmd.params.value) || 0;
            const mulV2 = Number(cmd.params.value2) || 0;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = mulV1 * mulV2;
            return true;
        }
        case CommandType.CALC_DIV: {
            const divV1 = Number(cmd.params.value) || 0;
            const divV2 = Number(cmd.params.value2) || 1;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = divV2 !== 0 ? divV1 / divV2 : 0;
            return true;
        }
        case CommandType.CALC_MOD: {
            const modV1 = Number(cmd.params.value) || 0;
            const modV2 = Number(cmd.params.value2) || 1;
            if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = modV2 !== 0 ? modV1 % modV2 : 0;
            return true;
        }

        // --- HARDWARE ---
        case CommandType.LED_ON:
            hardwareStateRef.current.pins[cmd.params.pin!] = true;
            playSound('click');
            if (isBoardConnected) serialService.sendCommand({ type: 'digitalWrite', pin: cmd.params.pin, value: 1 });
            return true;
        case CommandType.LED_OFF:
            hardwareStateRef.current.pins[cmd.params.pin!] = false;
            playSound('click');
            if (isBoardConnected) serialService.sendCommand({ type: 'digitalWrite', pin: cmd.params.pin, value: 0 });
            return true;
        case CommandType.LED_TOGGLE: {
            const currentPin = hardwareStateRef.current.pins[cmd.params.pin!];
            hardwareStateRef.current.pins[cmd.params.pin!] = !currentPin;
            playSound('click');
            if (isBoardConnected) serialService.sendCommand({ type: 'digitalWrite', pin: cmd.params.pin, value: !currentPin ? 1 : 0 });
            return true;
        }
        case CommandType.SET_RGB:
            hardwareStateRef.current.rgbColor = cmd.params.color || '#ff0000';
            return true;
        case CommandType.SET_FAN:
            hardwareStateRef.current.fanSpeed = cmd.params.speed || 0;
            return true;
        case CommandType.SET_SERVO:
            hardwareStateRef.current.servoAngle = cmd.params.angle || 90;
            if (isBoardConnected) serialService.sendCommand({ type: 'servoWrite', pin: cmd.params.pin, value: cmd.params.angle });
            return true;
        case CommandType.SET_STEPPER:
            hardwareStateRef.current.stepperPosition = cmd.params.steps || 0;
            return true;
        case CommandType.SET_RELAY:
            hardwareStateRef.current.relayState = cmd.params.state === true;
            return true;
        case CommandType.SET_SOLENOID:
            hardwareStateRef.current.solenoidActive = cmd.params.state === true;
            return true;
        case CommandType.SET_LASER:
            hardwareStateRef.current.laserActive = cmd.params.state === true;
            return true;
        case CommandType.SET_VIBRATION:
            hardwareStateRef.current.vibrationActive = true;
            setTimeout(() => {
                hardwareStateRef.current.vibrationActive = false;
                if (!ctx.isPlaying) setHardwareState({ ...hardwareStateRef.current });
            }, (cmd.params.duration || 0.5) * 1000);
            return true;
        case CommandType.PLAY_SOUND:
            playSpeakerSound(cmd.params.text || 'beep');
            return true;
        case CommandType.PLAY_TONE:
            playTone(cmd.params.duration || 0.5);
            await wait((cmd.params.duration || 0.5) * 1000);
            return true;
        case CommandType.SET_LCD: {
            const { lcdPrintAt } = await import('../../services/lcdSimulation');
            const row = cmd.params.row ?? 0;
            const col = cmd.params.col ?? 0;
            const text = cmd.params.text || 'Hello';
            const lines = [...hardwareStateRef.current.lcdLines];
            if (row >= 0 && row < lines.length) {
                const lineArr = [...lines[row]];
                for (let i = 0; i < text.length && col + i < 16; i++) {
                    lineArr[col + i] = text[i];
                }
                lines[row] = lineArr.join('');
            }
            hardwareStateRef.current.lcdLines = lines;
            return true;
        }
        case CommandType.CLEAR_LCD:
            hardwareStateRef.current.lcdLines = ['', '', '', ''];
            return true;
        case CommandType.SCROLL_LCD: {
            const text = cmd.params.text || '';
            const lines = [...hardwareStateRef.current.lcdLines];
            for (let i = 0; i < lines.length - 1; i++) {
                lines[i] = lines[i + 1] || '';
            }
            lines[lines.length - 1] = text;
            hardwareStateRef.current.lcdLines = lines;
            return true;
        }
        case CommandType.SET_SEGMENT:
            hardwareStateRef.current.sevenSegmentValue = cmd.params.value || 0;
            return true;
        case CommandType.READ_DIGITAL:
            if (cmd.params.varName) {
                if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
                if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.pins[cmd.params.pin!];
            }
            return true;
        case CommandType.READ_ANALOG:
            if (cmd.params.varName) {
                if (mode === AppMode.GAME) spriteStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
                if (mode === AppMode.HARDWARE) hardwareStateRef.current.variables[cmd.params.varName!] = hardwareStateRef.current.potentiometerValue;
            }
            return true;

        // --- NETWORK ---
        case CommandType.CONNECT_WIFI: {
            const ssid = cmd.params.ssid || 'default_network';
            const password = cmd.params.password || '';
            hardwareStateRef.current.wifiConnected = password.length > 0;
            setConsoleLogs(prev => [...prev, `WiFi connected to: ${ssid}`].slice(-50));
            if (!showConsole) setShowConsole(true);
            return true;
        }
        case CommandType.SEND_HTTP: {
            const method = cmd.params.method || 'GET';
            setConsoleLogs(prev => [...prev, `HTTP ${method}: ${cmd.params.url}`].slice(-50));
            if (!showConsole) setShowConsole(true);
            return true;
        }

        // --- LOGIC GATES ---
        case CommandType.LOGIC_AND:
            if (cmd.params.varName) {
                hardwareStateRef.current.variables[cmd.params.varName] = Boolean(cmd.params.value && cmd.params.value2);
            }
            return true;
        case CommandType.LOGIC_OR:
            if (cmd.params.varName) {
                hardwareStateRef.current.variables[cmd.params.varName] = Boolean(cmd.params.value || cmd.params.value2);
            }
            return true;
        case CommandType.LOGIC_NOT:
            if (cmd.params.varName) {
                hardwareStateRef.current.variables[cmd.params.varName] = !Boolean(cmd.params.value);
            }
            return true;

        // --- COMPONENT OBJECT METHODS ---
        case CommandType.COMP_METHOD: {
            const { executeComponentMethod } = await import('../../services/componentObjects');
            const compId = cmd.params.componentId || '';
            const methodName = cmd.params.methodName || '';
            const args = cmd.params.args || [];
            const targetComp = circuitComponents?.find(c => c.id === compId);
            if (targetComp) {
                const result = executeComponentMethod(targetComp, methodName, args, hardwareStateRef.current);
                if (cmd.params.varName && result !== null && result !== undefined) {
                    hardwareStateRef.current.variables[cmd.params.varName] = result;
                }
                playSound('click');
                setConsoleLogs(prev => [...prev, `${targetComp.type}.${methodName}(${args.join(', ')}) → ${JSON.stringify(result)}`].slice(-50));
                if (!showConsole && result !== null) setShowConsole(true);
            } else {
                setConsoleLogs(prev => [...prev, `Error: Component ${compId} not found`].slice(-50));
            }
            return true;
        }
        case CommandType.COMP_GET_PROP: {
            const { COMPONENT_SCHEMA } = await import('../../services/componentObjects');
            const compId = cmd.params.componentId;
            const propName = cmd.params.propName;
            const targetComp = circuitComponents?.find(c => c.id === compId);
            if (targetComp && cmd.params.varName) {
                const type = targetComp.type;
                let value: string | number | boolean | null | undefined = null;
                if (type.startsWith('LED')) value = hardwareStateRef.current.pins[targetComp.pin];
                else if (type === 'FAN') value = hardwareStateRef.current.fanSpeed;
                else if (type === 'SERVO') value = hardwareStateRef.current.servoAngle;
                else if (type === 'MOTOR_DC') value = hardwareStateRef.current.motorLoad ?? 0;
                else if (type === 'POTENTIOMETER') value = hardwareStateRef.current.potentiometerValue;
                else if (type === 'RELAY' || type === 'RELAY_MODULE') value = hardwareStateRef.current.relayState;
                else if (type === 'LASER') value = hardwareStateRef.current.laserActive;
                else if (type === 'BUZZER') value = hardwareStateRef.current.buzzerActive;
                else if (type === 'DHT11' || type === 'DHT22') {
                    if (propName === 'temperature') value = hardwareStateRef.current.temperature;
                    else if (propName === 'humidity') value = hardwareStateRef.current.humidity;
                }
                else if (type === 'ULTRASONIC') value = hardwareStateRef.current.distance;
                else if (type === 'COMPASS') value = hardwareStateRef.current.compassHeading;
                else if (type === 'HEARTBEAT') value = hardwareStateRef.current.heartbeatRate;
                else value = hardwareStateRef.current.variables[`${compId}_${propName}`];
                hardwareStateRef.current.variables[cmd.params.varName] = value;
            }
            return true;
        }
        case CommandType.COMP_SET_PROP: {
            const compId = cmd.params.componentId;
            const propName = cmd.params.propName;
            const propValue = cmd.params.propValue;
            const targetComp = circuitComponents?.find(c => c.id === compId);
            if (targetComp) {
                const type = targetComp.type;
                if (propName === 'on' || propName === 'isOn') {
                    hardwareStateRef.current.pins[targetComp.pin] = Boolean(propValue);
                } else if (propName === 'speed' && type === 'FAN') {
                    hardwareStateRef.current.fanSpeed = Number(propValue);
                } else if (propName === 'angle' && type === 'SERVO') {
                    hardwareStateRef.current.servoAngle = Number(propValue);
                } else if (propName === 'speed' && type === 'MOTOR_DC') {
                    hardwareStateRef.current.motorLoad = Number(propValue);
                } else if (propName === 'active' && (type === 'RELAY' || type === 'RELAY_MODULE')) {
                    hardwareStateRef.current.relayState = Boolean(propValue);
                } else if (propName === 'on' && type === 'LASER') {
                    hardwareStateRef.current.laserActive = Boolean(propValue);
                } else if (propName === 'brightness' && type.startsWith('LED')) {
                    hardwareStateRef.current.pins[targetComp.pin] = Number(propValue) > 0;
                } else if (propName === 'color' && type === 'RGB_LED') {
                    hardwareStateRef.current.rgbLedColor = String(propValue);
                }
                playSound('click');
            }
            return true;
        }
        case CommandType.COMP_WAIT_EVENT: {
            const compId = cmd.params.componentId;
            const eventName = cmd.params.eventName;
            const targetComp = circuitComponents?.find(c => c.id === compId);
            if (targetComp) {
                setConsoleLogs(prev => [...prev, `Waiting for ${targetComp.type} event: ${eventName}...`].slice(-50));
                if (!showConsole) setShowConsole(true);
                await wait(1000);
            }
            return true;
        }
        case CommandType.COMP_IS_READY: {
            const compId = cmd.params.componentId;
            const targetComp = circuitComponents?.find(c => c.id === compId);
            if (targetComp && cmd.params.varName) {
                hardwareStateRef.current.variables[cmd.params.varName] = true;
            }
            return true;
        }

        // --- GAME CORE ---
        // All game commands (SHOOT, SPAWN, THINK, SHOW, HIDE, etc.) are now handled via IR above.

        // --- 3D COMMANDS ---
        case CommandType.SET_VIEW_3D:
        case CommandType.SWITCH_TO_3D_MODE:
            spriteStateRef.current.is3D = true;
            return true;
        case CommandType.SWITCH_TO_2D_MODE:
            spriteStateRef.current.is3D = false;
            return true;
        case CommandType.MOVE_Z:
            spriteStateRef.current.z += (cmd.params.value || 0);
            return true;
        case CommandType.ROTATE_X:
            spriteStateRef.current.rotationX += (cmd.params.value || 0);
            return true;
        case CommandType.ROTATE_Y:
            spriteStateRef.current.rotationY += (cmd.params.value || 0);
            return true;
        case CommandType.ROTATE_Z:
            spriteStateRef.current.rotationZ += (cmd.params.value || 0);
            return true;
        case CommandType.SET_CAMERA_CONSTRAINT:
            spriteStateRef.current.cameraConstraints = {
                 minX: cmd.params.x ?? undefined,
                 maxX: cmd.params.y ?? undefined,
            };
            return true;
        case CommandType.SET_LIGHTING:
            spriteStateRef.current.lighting = {
                 ambientColor: cmd.params.color ?? undefined,
                 ambientIntensity: cmd.params.value ?? 1,
            };
            return true;
        case CommandType.SET_CAMERA:
        case CommandType.SET_3D_CAMERA:
            if (spriteStateRef.current.is3D) {
                spriteStateRef.current.cameraMode = (cmd.params.text as SpriteState['cameraMode']) || 'third_person';
            }
            return true;
        case CommandType.GENERATE_ENVIRONMENT:
            if (spriteStateRef.current.is3D) {
                const prompt = cmd.params.text || 'plains';
                spriteStateRef.current.worldPrompt = prompt;
                let hash = 0;
                for (let i = 0; i < prompt.length; i++) {
                    hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
                    hash |= 0;
                }
                spriteStateRef.current.worldSeed = Math.abs(hash);
                setConsoleLogs(prev => [...prev, `🌍 Generating environment: ${prompt}...`].slice(-50));
            }
            return true;
        case CommandType.SPAWN_3D_MODEL:
        case CommandType.SPAWN_3D_OBJECT: {
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
            return true;
        }
        case CommandType.SET_3D_POSITION:
            spriteStateRef.current.x = cmd.params.x ?? spriteStateRef.current.x;
            spriteStateRef.current.y = cmd.params.y ?? spriteStateRef.current.y;
            spriteStateRef.current.z = cmd.params.z ?? spriteStateRef.current.z;
            return true;
        case CommandType.ROTATE_3D_MODEL:
            spriteStateRef.current.rotationX = cmd.params.x ?? spriteStateRef.current.rotationX;
            spriteStateRef.current.rotationY = cmd.params.y ?? spriteStateRef.current.rotationY;
            spriteStateRef.current.rotationZ = cmd.params.z ?? spriteStateRef.current.rotationZ;
            return true;
        case CommandType.SCALE_3D_MODEL:
            spriteStateRef.current.scale = cmd.params.value ?? spriteStateRef.current.scale;
            return true;
        case CommandType.PLAY_3D_ANIMATION:
            spriteStateRef.current.currentAnimation = cmd.params.text || 'idle';
            return true;
        case CommandType.SET_3D_LIGHTING:
            setConsoleLogs(prev => [...prev, `💡 Setting 3D Lighting: ${cmd.params.color} (${cmd.params.intensity})`].slice(-50));
            return true;
        case CommandType.ENABLE_PHYSICS_3D:
            setConsoleLogs(prev => [...prev, `⚡ 3D Physics: ${cmd.params.condition === 'true' ? 'Enabled' : 'Disabled'}`].slice(-50));
            return true;
        case CommandType.BROADCAST:
            eventBus.emit(`msg_${cmd.params.text}`);
            return true;

        // --- PHYSICS 2.0 ---
        case CommandType.SET_PHYSICS_TYPE:
            return true;
        case CommandType.CREATE_JOINT:
            return true;
        case CommandType.APPLY_FORCE:
            spriteStateRef.current.vx += (cmd.params.x || 0);
            spriteStateRef.current.vy += (cmd.params.y || 0);
            return true;

        // --- GAME STATE ---
        // CHANGE_SCORE, SET_SCORE, CHANGE_HEALTH, SET_HEALTH, WIN_GAME, GAME_OVER, PLAY_ANIMATION are now handled via IR above.

        // --- ADVANCED PLATFORMER ---
        // WALL_JUMP_ENABLED, CEILING_CLING, etc. stay inline (not in IR)
        // DASH, DOUBLE_JUMP, WALL_JUMP, GRAPPLE are now handled via IR above.
        case CommandType.WALL_JUMP_ENABLED:
            spriteStateRef.current.variables['_wall_jump_enabled'] = cmd.params.condition === 'true';
            spriteStateRef.current.canDoubleJump = true;
            return true;
        case CommandType.CEILING_CLING:
            spriteStateRef.current.vy = 0;
            return true;
        case CommandType.AIR_DASH:
            spriteStateRef.current.vx += (cmd.params.value || 15);
            playSound('dash');
            return true;
        case CommandType.GROUND_SLAM:
            spriteStateRef.current.vy = (cmd.params.value || 20);
            spriteStateRef.current.effectTrigger = { type: 'explosion', x: spriteStateRef.current.x, y: spriteStateRef.current.y + 40, color: '#78716c' };
            playSound('explosion');
            return true;
        case CommandType.CLIMB_VINE:
            spriteStateRef.current.vy = -(cmd.params.value || 5);
            return true;
        case CommandType.SWING_ROPE:
            spriteStateRef.current.vx += (cmd.params.value || 10);
            spriteStateRef.current.vy = -8;
            return true;
        case CommandType.RIDE_PLATFORM:
            spriteStateRef.current.vx += (cmd.params.value || 3);
            return true;
        case CommandType.ACTIVATE_SWITCH:
            spriteStateRef.current.variables[`_switch_${cmd.params.text}`] = true;
            playSound('click');
            return true;
        case CommandType.MOVE_PLATFORM:
            spriteStateRef.current.vx += (cmd.params.value || 5);
            return true;
        case CommandType.DEACTIVATE_TRAP:
            spriteStateRef.current.variables['_traps_disabled'] = true;
            return true;
        case CommandType.COLLECT_STAR:
            spriteStateRef.current.score += (cmd.params.value || 1) * 100;
            playSound('coin');
            return true;
        case CommandType.ENTER_PORTAL:
            spriteStateRef.current.variables['_next_level'] = cmd.params.text || 'next_level';
            playSound('powerup');
            return true;

        // --- ADDITIONAL COMMANDS ---
        // SAY, SET_EMOJI, SET_BACKGROUND_MUSIC, PLAY_MUSIC, STOP_MUSIC,
        // ADD_TO_INVENTORY, REMOVE_FROM_INVENTORY, SET_SCENE, GO_TO_XY, TURN_RIGHT, TURN_LEFT,
        // SET_MUSIC_VOLUME, PLAY_AMBIENT, SLOW_MOTION are now handled via IR above.

        // --- RPG SYSTEM COMMANDS ---
        case CommandType.ADD_XP: {
            const { addXP: addXpFn, calculateXPGain: calcXpGain, getDifficulty: getDiff } = await import('../../services/rpgEngine');
            const xpAmount = cmd.params.value || 50;
            const diff = getDiff(spriteStateRef.current);
            const scaledXP = calcXpGain(xpAmount, diff);
            const xpResult = addXpFn(spriteStateRef.current, scaledXP);
            spriteStateRef.current = xpResult.state;
            if (xpResult.leveledUp) {
                setConsoleLogs(prev => [...prev, `⬆️ Level Up! Now Level ${xpResult.newLevel}! (+${xpResult.statGains.str} STR, +${xpResult.statGains.def} DEF, +${xpResult.statGains.spd} SPD)`].slice(-50));
                playSound('powerup');
            } else {
                setConsoleLogs(prev => [...prev, `⭐ +${scaledXP} XP`].slice(-50));
            }
            return true;
        }
        case CommandType.LEVEL_UP: {
            const { addXP: addXpFn2, getCharacterStats: getStats } = await import('../../services/rpgEngine');
            const currentStats = getStats(spriteStateRef.current);
            const neededXP = currentStats.xpToLevel - currentStats.xp;
            const xpResult2 = addXpFn2(spriteStateRef.current, neededXP + 1);
            spriteStateRef.current = xpResult2.state;
            if (xpResult2.leveledUp) {
                setConsoleLogs(prev => [...prev, `⬆️ Level Up! Now Level ${xpResult2.newLevel}!`].slice(-50));
                playSound('powerup');
            }
            return true;
        }
        case CommandType.SET_STAT: {
            const { setCharacterStat: setStat } = await import('../../services/rpgEngine');
            const statName = cmd.params.text || 'strength';
            const statValue = cmd.params.value || 10;
            const statMap: Record<string, keyof CharacterStats> = {
                strength: 'strength', defense: 'defense', speed: 'speed',
                maxHP: 'maxHP', criticalChance: 'criticalChance', criticalDamage: 'criticalDamage',
                level: 'level', xp: 'xp', xpToLevel: 'xpToLevel',
            };
            const mappedStat = statMap[statName] || statName;
            spriteStateRef.current = setStat(spriteStateRef.current, mappedStat, statValue);
            setConsoleLogs(prev => [...prev, `📊 Set ${statName} to ${statValue}`].slice(-50));
            return true;
        }
        case CommandType.APPLY_STATUS: {
            const { applyStatusEffect: applyStatus, createStatusEffect: createStatus } = await import('../../services/rpgEngine');
            const statusType = (cmd.params.text || 'poison') as any;
            const statusValue = cmd.params.value || 3;
            const effect = createStatus(statusType, 3, statusValue);
            spriteStateRef.current = applyStatus(spriteStateRef.current, effect);
            setConsoleLogs(prev => [...prev, `✨ Applied ${statusType} for 3 turns`].slice(-50));
            return true;
        }
        case CommandType.REMOVE_STATUS: {
            const { removeStatusEffectByType: removeStatus } = await import('../../services/rpgEngine');
            const removeType = (cmd.params.text || 'poison') as any;
            spriteStateRef.current = removeStatus(spriteStateRef.current, removeType);
            setConsoleLogs(prev => [...prev, `✨ Removed ${removeType}`].slice(-50));
            return true;
        }
        case CommandType.DROP_LOOT: {
            const { rollLoot: roll, addLootToInventory: addLoot, getDifficulty: getDiff2 } = await import('../../services/rpgEngine');
            const enemyType = cmd.params.text || 'slime';
            const { LOOT_TABLES } = await import('../../constants/shadowRealmGame');
            const table = LOOT_TABLES[enemyType] || LOOT_TABLES['slime'];
            const diff2 = getDiff2(spriteStateRef.current);
            const drops = roll(table, diff2);
            if (drops.length > 0) {
                spriteStateRef.current = addLoot(spriteStateRef.current, drops);
                const dropNames = drops.map(d => `${d.quantity}x ${d.item.name}`).join(', ');
                setConsoleLogs(prev => [...prev, `🎁 Loot: ${dropNames}`].slice(-50));
            }
            return true;
        }
        case CommandType.SET_DIFFICULTY: {
            const { setDifficulty: setDiff } = await import('../../services/rpgEngine');
            const difficulty = (cmd.params.text || 'normal') as any;
            spriteStateRef.current = setDiff(spriteStateRef.current, difficulty);
            setConsoleLogs(prev => [...prev, `🎮 Difficulty set to ${difficulty}`].slice(-50));
            return true;
        }
        case CommandType.ACCEPT_QUEST: {
            const { acceptQuest: accept } = await import('../../services/rpgEngine');
            const { GAME_QUESTS } = await import('../../constants/shadowRealmGame');
            const questDef = GAME_QUESTS.find(q => q.name === (cmd.params.text || ''));
            if (questDef) {
                spriteStateRef.current = accept(spriteStateRef.current, questDef);
                setConsoleLogs(prev => [...prev, `📜 Quest accepted: ${questDef.name}`].slice(-50));
            }
            return true;
        }
        case CommandType.OPEN_SHOP:
            setConsoleLogs(prev => [...prev, `🏪 Shop opened: ${cmd.params.text || 'General Store'}`].slice(-50));
            return true;
        case CommandType.BUY_ITEM: {
            const { spendGold: spend } = await import('../../services/rpgEngine');
            const price = cmd.params.value || 10;
            const result = spend(spriteStateRef.current, price);
            if (result.success) {
                spriteStateRef.current = result.state;
                setConsoleLogs(prev => [...prev, `🛒 Bought ${cmd.params.text} for ${price} gold`].slice(-50));
                playSound('coin');
            } else {
                setConsoleLogs(prev => [...prev, `❌ Not enough gold!`].slice(-50));
            }
            return true;
        }
        case CommandType.START_WAVE:
            setConsoleLogs(prev => [...prev, `⚔️ Wave ${cmd.params.value || 1} started!`].slice(-50));
            spriteStateRef.current.variables.currentWave = cmd.params.value || 1;
            return true;
        case CommandType.NEXT_WAVE: {
            const currentWave = (spriteStateRef.current.variables.currentWave as number) || 1;
            spriteStateRef.current.variables.currentWave = currentWave + 1;
            setConsoleLogs(prev => [...prev, `⚔️ Wave ${currentWave + 1} incoming!`].slice(-50));
            return true;
        }
        case CommandType.TRIGGER_BOSS_PHASE:
            if (spriteStateRef.current.activeBoss) {
                spriteStateRef.current.activeBoss.phase = cmd.params.value || 2;
                spriteStateRef.current.activeBoss.isInvulnerable = true;
                setConsoleLogs(prev => [...prev, `💀 Boss Phase ${cmd.params.value || 2}!`].slice(-50));
                playSound('explosion');
                setTimeout(() => {
                    if (spriteStateRef.current.activeBoss) {
                        spriteStateRef.current.activeBoss.isInvulnerable = false;
                    }
                }, 2000);
            }
            return true;

        // --- COMBAT ENGINE COMMANDS ---
        case CommandType.ATTACK_ENEMY: {
            const { createMeleeHitbox, checkHitboxCollision, calculateDamageWithVariance, applyKnockback } = await import('../../services/combatEngine');
            const dir = spriteStateRef.current.scaleX ?? 1;
            const hitbox = createMeleeHitbox(
                spriteStateRef.current.x, spriteStateRef.current.y,
                dir, 50, 40, cmd.params.value || 10
            );
            const hitEnemies = spriteStateRef.current.enemies.filter(e =>
                checkHitboxCollision(hitbox, e)
            );
            if (hitEnemies.length > 0) {
                const dmg = calculateDamageWithVariance(cmd.params.value || 10);
                spriteStateRef.current.enemies = spriteStateRef.current.enemies.map(e => {
                    if (hitEnemies.find(h => h.id === e.id)) {
                        const kb = applyKnockback(e.x, e.y, spriteStateRef.current.x, spriteStateRef.current.y);
                        return { ...e, vx: kb.vx, vy: kb.vy };
                    }
                    return e;
                });
                setConsoleLogs(prev => [...prev, `⚔️ Hit ${hitEnemies.length} enemy(ies) for ${dmg} damage`].slice(-50));
                playSound('hit');
            } else {
                playSound('swish');
            }
            return true;
        }
        case CommandType.CRITICAL_HIT: {
            const critMult = cmd.params.value || 2;
            const critDmg = Math.round(10 * critMult);
            spriteStateRef.current.enemies.forEach(e => {
                const dx = Math.abs(e.x - spriteStateRef.current.x);
                const dy = Math.abs(e.y - spriteStateRef.current.y);
                if (dx < 80 && dy < 80 && e.behavior !== 'teammate') {
                    e.x += (e.x > spriteStateRef.current.x ? critDmg * 2 : -critDmg * 2);
                }
            });
            spriteStateRef.current.score += critDmg * 10;
            spriteStateRef.current.effectTrigger = { type: 'explosion', x: spriteStateRef.current.x, y: spriteStateRef.current.y, color: '#ef4444' };
            playSound('explosion');
            return true;
        }

        default:
            return false;
    }
};
