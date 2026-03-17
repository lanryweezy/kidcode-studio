import { StoreApi } from 'zustand';
import { StoreState } from '../store/useStore';
import { CommandBlock, SpriteState, HardwareState, AppState } from '../types';

/**
 * Undo Action Interface
 * Represents a reversible action with execute and undo functions
 */
export interface UndoAction {
  id: string;
  type: string;
  description?: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
}

/**
 * Undo Manager - Manages undo/redo stack with command pattern
 * 
 * Features:
 * - Full state tracking (not just commands)
 * - Unlimited history (configurable max)
 * - Keyboard shortcut support (Ctrl+Z / Ctrl+Shift+Z)
 * - Action grouping support
 */
export class UndoManager {
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private maxHistory = 100;
  private isUndoing = false;
  private isGrouping = false;
  private groupStack: UndoAction[] = [];

  constructor(private store: StoreApi<StoreState>) {}

  /**
   * Push a new action to the undo stack
   * Executes immediately and stores the inverse operation
   */
  push(action: Omit<UndoAction, 'id' | 'timestamp'>) {
    if (this.isUndoing) return;

    const fullAction: UndoAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    // If grouping, add to group stack instead
    if (this.isGrouping) {
      this.groupStack.push(fullAction);
      fullAction.execute();
      return;
    }

    // Execute immediately
    fullAction.execute();
    
    this.undoStack.push(fullAction);
    this.redoStack = [];

    // Trim if too large
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    // Notify store of history change
    this.notifyHistoryChange();
  }

  /**
   * Undo the last action
   */
  undo() {
    const action = this.undoStack.pop();
    if (!action) return false;

    this.isUndoing = true;
    action.undo();
    this.redoStack.push(action);
    this.isUndoing = false;

    this.notifyHistoryChange();
    return true;
  }

  /**
   * Redo the last undone action
   */
  redo() {
    const action = this.redoStack.pop();
    if (!action) return false;

    this.isUndoing = true;
    action.execute();
    this.undoStack.push(action);
    this.isUndoing = false;

    this.notifyHistoryChange();
    return true;
  }

  /**
   * Start grouping multiple actions into one undo step
   */
  beginGroup() {
    this.isGrouping = true;
    this.groupStack = [];
  }

  /**
   * End grouping and commit as single undo action
   */
  endGroup(description?: string) {
    this.isGrouping = false;
    
    if (this.groupStack.length === 0) return;

    // Create a grouped action
    const groupedAction: UndoAction = {
      id: crypto.randomUUID(),
      type: 'GROUP',
      description: description || `Multiple actions (${this.groupStack.length})`,
      timestamp: Date.now(),
      execute: () => {
        this.groupStack.forEach(action => action.execute());
      },
      undo: () => {
        // Undo in reverse order
        [...this.groupStack].reverse().forEach(action => action.undo());
      }
    };

    this.undoStack.push(groupedAction);
    this.redoStack = [];
    this.groupStack = [];

    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    this.notifyHistoryChange();
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.groupStack = [];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Setup keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
   */
  setupKeyboardShortcuts() {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }

  /**
   * Notify store of history change (for UI updates)
   */
  private notifyHistoryChange() {
    const { setHistoryUI } = this.store.getState() as any;
    if (setHistoryUI) {
      setHistoryUI({
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        undoCount: this.getUndoCount(),
        redoCount: this.getRedoCount()
      });
    }
  }
}

// Helper functions to create common undo actions
export const UndoActionFactory = {
  /**
   * Create an action to add a command block
   */
  addCommand: (
    command: CommandBlock,
    getState: () => any,
    setState: (fn: any) => any
  ): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'ADD_COMMAND',
    description: `Add ${command.type} block`,
    execute: () => {
      const { commands } = getState();
      setState({ commands: [...commands, command] });
    },
    undo: () => {
      const { commands } = getState();
      setState({ commands: commands.slice(0, -1) });
    }
  }),

  /**
   * Create an action to delete a command block
   */
  deleteCommand: (
    commandId: string,
    getState: () => any,
    setState: (fn: any) => any
  ): Omit<UndoAction, 'id' | 'timestamp'> => {
    let deletedCommand: CommandBlock | null = null;

    return {
      type: 'DELETE_COMMAND',
      description: 'Delete block',
      execute: () => {
        const { commands } = getState();
        const cmd = commands.find((c: CommandBlock) => c.id === commandId);
        deletedCommand = cmd || null;
        setState({ commands: commands.filter((c: CommandBlock) => c.id !== commandId) });
      },
      undo: () => {
        if (deletedCommand) {
          const { commands } = getState();
          setState({ commands: [...commands, deletedCommand!] });
        }
      }
    };
  },

  /**
   * Create an action to update sprite state
   */
  updateSpriteState: (
    updates: Partial<SpriteState>,
    getState: () => any,
    setState: (fn: any) => any
  ): Omit<UndoAction, 'id' | 'timestamp'> => {
    let previousState: Partial<SpriteState> = {};
    
    return {
      type: 'UPDATE_SPRITE_STATE',
      description: 'Update sprite properties',
      execute: () => {
        const { spriteState } = getState();
        // Store previous values for undo
        Object.keys(updates).forEach(key => {
          (previousState as any)[key] = (spriteState as any)[key];
        });
        setState({ spriteState: { ...spriteState, ...updates } });
      },
      undo: () => {
        const { spriteState } = getState();
        setState({ spriteState: { ...spriteState, ...previousState } });
      }
    };
  },

  /**
   * Create an action to update hardware state
   */
  updateHardwareState: (
    updates: Partial<HardwareState>,
    getState: () => any,
    setState: (fn: any) => any
  ): Omit<UndoAction, 'id' | 'timestamp'> => {
    let previousState: Partial<HardwareState> = {};
    
    return {
      type: 'UPDATE_HARDWARE_STATE',
      description: 'Update hardware properties',
      execute: () => {
        const { hardwareState } = getState();
        Object.keys(updates).forEach(key => {
          (previousState as any)[key] = (hardwareState as any)[key];
        });
        setState({ hardwareState: { ...hardwareState, ...updates } });
      },
      undo: () => {
        const { hardwareState } = getState();
        setState({ hardwareState: { ...hardwareState, ...previousState } });
      }
    };
  },

  /**
   * Create an action to update app state
   */
  updateAppState: (
    updates: Partial<AppState>,
    getState: () => any,
    setState: (fn: any) => any
  ): Omit<UndoAction, 'id' | 'timestamp'> => {
    let previousState: Partial<AppState> = {};
    
    return {
      type: 'UPDATE_APP_STATE',
      description: 'Update app properties',
      execute: () => {
        const { appState } = getState();
        Object.keys(updates).forEach(key => {
          (previousState as any)[key] = (appState as any)[key];
        });
        setState({ appState: { ...appState, ...updates } });
      },
      undo: () => {
        const { appState } = getState();
        setState({ appState: { ...appState, ...previousState } });
      }
    };
  }
};

// Singleton instance - will be initialized in App.tsx
let undoManagerInstance: UndoManager | null = null;

export const getUndoManager = (store?: StoreApi<StoreState>): UndoManager => {
  if (!undoManagerInstance && store) {
    undoManagerInstance = new UndoManager(store);
  }
  if (!undoManagerInstance) {
    throw new Error('UndoManager not initialized. Call getUndoManager(store) first.');
  }
  return undoManagerInstance;
};

export const resetUndoManager = () => {
  undoManagerInstance = null;
};
