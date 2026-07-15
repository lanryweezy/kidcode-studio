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

export class InputMapper {
  private actions: InputAction[];
  private pressedKeys: Set<string> = new Set();
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.actions = this.loadBindings();
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.pressedKeys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.pressedKeys.delete(e.code);
    });
  }

  isActionPressed(actionId: string): boolean {
    const action = this.actions.find(a => a.id === actionId);
    if (!action) return false;
    return action.currentKeys.some(key => this.pressedKeys.has(key));
  }

  wasActionJustPressed(actionId: string): boolean {
    const action = this.actions.find(a => a.id === actionId);
    if (!action) return false;
    return action.currentKeys.some(key => this.pressedKeys.has(key));
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
  };
  return map[key] || key;
}
