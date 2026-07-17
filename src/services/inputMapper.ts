export interface InputAction {
  id: string;
  name: string;
  category: 'movement' | 'action' | 'ui' | 'combat';
  defaultKeys: string[];
  currentKeys: string[];
  icon: string;
}

export const DEFAULT_INPUT_ACTIONS: InputAction[] = [
  { id: 'move_left', name: 'Move Left', category: 'movement', defaultKeys: ['ArrowLeft', 'KeyA'], currentKeys: ['ArrowLeft', 'KeyA'], icon: '⬅️' },
  { id: 'move_right', name: 'Move Right', category: 'movement', defaultKeys: ['ArrowRight', 'KeyD'], currentKeys: ['ArrowRight', 'KeyD'], icon: '➡️' },
  { id: 'move_up', name: 'Move Up', category: 'movement', defaultKeys: ['ArrowUp', 'KeyW'], currentKeys: ['ArrowUp', 'KeyW'], icon: '⬆️' },
  { id: 'move_down', name: 'Move Down', category: 'movement', defaultKeys: ['ArrowDown', 'KeyS'], currentKeys: ['ArrowDown', 'KeyS'], icon: '⬇️' },
  { id: 'jump', name: 'Jump', category: 'action', defaultKeys: ['Space'], currentKeys: ['Space'], icon: '🦘' },
  { id: 'shoot', name: 'Shoot', category: 'combat', defaultKeys: ['KeyZ', 'Space'], currentKeys: ['KeyZ', 'Space'], icon: '🔫' },
  { id: 'dash', name: 'Dash', category: 'action', defaultKeys: ['ShiftLeft', 'ShiftRight'], currentKeys: ['ShiftLeft', 'ShiftRight'], icon: '💨' },
  { id: 'interact', name: 'Interact', category: 'action', defaultKeys: ['KeyE'], currentKeys: ['KeyE'], icon: '🤝' },
  { id: 'inventory', name: 'Inventory', category: 'ui', defaultKeys: ['KeyI', 'Tab'], currentKeys: ['KeyI', 'Tab'], icon: '🎒' },
  { id: 'pause', name: 'Pause', category: 'ui', defaultKeys: ['Escape', 'KeyP'], currentKeys: ['Escape', 'KeyP'], icon: '⏸️' },
];

const STORAGE_KEY = 'kidcode_input_bindings';

const GAMEPAD_BUTTON_MAP: Record<string, string[]> = {
  'jump': ['GamepadButton0'],
  'shoot': ['GamepadButton1'],
  'dash': ['GamepadButton2'],
  'interact': ['GamepadButton3'],
  'inventory': ['GamepadButton4'],
  'pause': ['GamepadButton9'],
};

const GAMEPAD_AXIS_DEADZONE = 0.2;

export class InputMapper {
  private actions: InputAction[];
  private pressedKeys: Set<string> = new Set();
  private listeners: Map<string, Set<() => void>> = new Map();
  private gamepadPollId: number = 0;
  private gamepadConnected: boolean = false;
  private prevGamepadButtons: Map<number, boolean> = new Map();

  constructor() {
    this.actions = this.loadBindings();
    this.setupListeners();
    this.setupGamepad();
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.pressedKeys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.pressedKeys.delete(e.code);
    });
  }

  private setupGamepad() {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.gamepadConnected = true;
      this.startGamepadPolling();
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadConnected = false;
      this.stopGamepadPolling();
    });

    if (navigator.getGamepads && navigator.getGamepads().length > 0) {
      this.gamepadConnected = true;
      this.startGamepadPolling();
    }
  }

  private startGamepadPolling() {
    if (this.gamepadPollId) return;
    const poll = () => {
      this.pollGamepad();
      this.gamepadPollId = requestAnimationFrame(poll);
    };
    this.gamepadPollId = requestAnimationFrame(poll);
  }

  private stopGamepadPolling() {
    if (this.gamepadPollId) {
      cancelAnimationFrame(this.gamepadPollId);
      this.gamepadPollId = 0;
    }
  }

  private pollGamepad() {
    if (!this.gamepadConnected) return;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return;

    const axisActions: { actionId: string; axisIndex: number; direction: number }[] = [
      { actionId: 'move_left', axisIndex: 0, direction: -1 },
      { actionId: 'move_right', axisIndex: 0, direction: 1 },
      { actionId: 'move_up', axisIndex: 1, direction: -1 },
      { actionId: 'move_down', axisIndex: 1, direction: 1 },
    ];

    for (const mapping of axisActions) {
      const value = gp.axes[mapping.axisIndex] || 0;
      const key = `GamepadAxis${mapping.axisIndex}_${mapping.direction > 0 ? 'Pos' : 'Neg'}`;
      if ((mapping.direction > 0 && value > GAMEPAD_AXIS_DEADZONE) ||
          (mapping.direction < 0 && value < -GAMEPAD_AXIS_DEADZONE)) {
        this.pressedKeys.add(key);
      } else {
        this.pressedKeys.delete(key);
      }
    }

    for (let i = 0; i < gp.buttons.length; i++) {
      const pressed = gp.buttons[i].pressed;
      const prevPressed = this.prevGamepadButtons.get(i) || false;
      const key = `GamepadButton${i}`;

      if (pressed) {
        this.pressedKeys.add(key);
      } else {
        this.pressedKeys.delete(key);
      }

      if (pressed && !prevPressed) {
        for (const [actionId, buttons] of Object.entries(GAMEPAD_BUTTON_MAP)) {
          if (buttons.includes(key)) {
            this.fireListeners(actionId);
          }
        }
      }

      this.prevGamepadButtons.set(i, pressed);
    }
  }

  private fireListeners(actionId: string) {
    const listeners = this.listeners.get(actionId);
    if (listeners) {
      listeners.forEach(cb => cb());
    }
  }

  isActionPressed(actionId: string): boolean {
    const action = this.actions.find(a => a.id === actionId);
    if (!action) return false;
    if (action.currentKeys.some(key => this.pressedKeys.has(key))) return true;

    const gamepadButtons = GAMEPAD_BUTTON_MAP[actionId];
    if (gamepadButtons) {
      return gamepadButtons.some(btn => this.pressedKeys.has(btn));
    }

    if (actionId === 'move_left') return this.pressedKeys.has('GamepadAxis0_Neg');
    if (actionId === 'move_right') return this.pressedKeys.has('GamepadAxis0_Pos');
    if (actionId === 'move_up') return this.pressedKeys.has('GamepadAxis1_Neg');
    if (actionId === 'move_down') return this.pressedKeys.has('GamepadAxis1_Pos');

    return false;
  }

  wasActionJustPressed(actionId: string): boolean {
    return this.isActionPressed(actionId);
  }

  getGamepadAxes(): { leftX: number; leftY: number; rightX: number; rightY: number } {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return { leftX: 0, leftY: 0, rightX: 0, rightY: 0 };
    return {
      leftX: Math.abs(gp.axes[0] || 0) > GAMEPAD_AXIS_DEADZONE ? gp.axes[0]! : 0,
      leftY: Math.abs(gp.axes[1] || 0) > GAMEPAD_AXIS_DEADZONE ? gp.axes[1]! : 0,
      rightX: Math.abs(gp.axes[2] || 0) > GAMEPAD_AXIS_DEADZONE ? gp.axes[2]! : 0,
      rightY: Math.abs(gp.axes[3] || 0) > GAMEPAD_AXIS_DEADZONE ? gp.axes[3]! : 0,
    };
  }

  isGamepadConnected(): boolean {
    return this.gamepadConnected;
  }

  rebindAction(actionId: string, newKeys: string[]) {
    const action = this.actions.find(a => a.id === actionId);
    if (action) {
      action.currentKeys = newKeys;
      this.saveBindings();
    }
  }

  resetToDefaults() {
    this.actions = DEFAULT_INPUT_ACTIONS.map(a => ({ ...a, currentKeys: [...a.defaultKeys] }));
    this.saveBindings();
  }

  getActions(): InputAction[] {
    return [...this.actions];
  }

  getActionsByCategory(category: InputAction['category']): InputAction[] {
    return this.actions.filter(a => a.category === category);
  }

  private saveBindings() {
    try {
      const bindings = this.actions.map(a => ({ id: a.id, keys: a.currentKeys }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
    } catch { /* localStorage unavailable — best-effort persistence */ }
  }

  private loadBindings(): InputAction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const bindings = JSON.parse(data);
        return DEFAULT_INPUT_ACTIONS.map(defaultAction => {
          const saved = bindings.find((b: { id: string; keys: string[] }) => b.id === defaultAction.id);
          return saved ? { ...defaultAction, currentKeys: saved.keys } : { ...defaultAction };
        });
      }
    } catch { /* localStorage unavailable — use defaults */ }
    return DEFAULT_INPUT_ACTIONS.map(a => ({ ...a }));
  }
}

let instance: InputMapper | null = null;

export function getInputMapper(): InputMapper {
  if (!instance) instance = new InputMapper();
  return instance;
}

export function keyNameToDisplay(key: string): string {
  const map: Record<string, string> = {
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
    Space: 'Space', ShiftLeft: 'LShift', ShiftRight: 'RShift',
    ControlLeft: 'LCtrl', ControlRight: 'RCtrl',
    Enter: 'Enter', Escape: 'Esc', Tab: 'Tab',
    KeyA: 'A', KeyB: 'B', KeyC: 'C', KeyD: 'D', KeyE: 'E', KeyF: 'F',
    KeyG: 'G', KeyH: 'H', KeyI: 'I', KeyJ: 'J', KeyK: 'K', KeyL: 'L',
    KeyM: 'M', KeyN: 'N', KeyO: 'O', KeyP: 'P', KeyQ: 'Q', KeyR: 'R',
    KeyS: 'S', KeyT: 'T', KeyU: 'U', KeyV: 'V', KeyW: 'W', KeyX: 'X',
    KeyY: 'Y', KeyZ: 'Z',
    GamepadButton0: 'GP A', GamepadButton1: 'GP B', GamepadButton2: 'GP X',
    GamepadButton3: 'GP Y', GamepadButton4: 'GP LB', GamepadButton5: 'GP RB',
    GamepadButton8: 'GP Select', GamepadButton9: 'GP Start',
    GamepadAxis0_Neg: 'GP ←', GamepadAxis0_Pos: 'GP →',
    GamepadAxis1_Neg: 'GP ↑', GamepadAxis1_Pos: 'GP ↓',
  };
  return map[key] || key;
}
