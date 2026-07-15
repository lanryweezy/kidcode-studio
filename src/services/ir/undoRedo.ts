/**
 * IR Undo/Redo System
 * 
 * Uses IR nodes as deltas for efficient undo/redo.
 * Each action creates a delta (before/after state snapshot).
 * Undo reverses the delta. Redo re-applies it.
 * 
 * Design:
 * - Delta = { timestamp, description, before: Partial<SpriteState>, after: Partial<SpriteState> }
 * - History = Delta[] with pointer
 * - Max depth = 200 steps (configurable)
 */

import { SpriteState } from '../../types';

export interface UndoDelta {
  timestamp: number;
  description: string;
  before: Partial<SpriteState>;
  after: Partial<SpriteState>;
}

export interface UndoRedoState {
  history: UndoDelta[];
  pointer: number; // -1 = empty, 0+ = position in history
  maxDepth: number;
}

/**
 * Create a new undo/redo state.
 */
export function createUndoRedoState(maxDepth: number = 200): UndoRedoState {
  return {
    history: [],
    pointer: -1,
    maxDepth,
  };
}

/**
 * Capture the current state as a snapshot (for before/after comparison).
 */
export function captureState(state: SpriteState): Partial<SpriteState> {
  return {
    x: state.x,
    y: state.y,
    vx: state.vx,
    vy: state.vy,
    rotation: state.rotation,
    scale: state.scale,
    opacity: state.opacity,
    health: state.health,
    score: state.score,
    gravity: state.gravity,
    friction: state.friction,
    restitution: state.restitution,
    isJumping: state.isJumping,
    variables: { ...state.variables },
    inventory: state.inventory.map(i => ({ ...i })),
  };
}

/**
 * Push a new delta onto the history.
 * Truncates any future redo states.
 */
export function pushDelta(
  ur: UndoRedoState,
  description: string,
  before: Partial<SpriteState>,
  after: Partial<SpriteState>
): UndoRedoState {
  const delta: UndoDelta = {
    timestamp: Date.now(),
    description,
    before,
    after,
  };

  // Truncate future states (we've diverged from the timeline)
  const newHistory = ur.history.slice(0, ur.pointer + 1);
  newHistory.push(delta);

  // Enforce max depth
  if (newHistory.length > ur.maxDepth) {
    newHistory.shift();
  }

  return {
    ...ur,
    history: newHistory,
    pointer: newHistory.length - 1,
  };
}

/**
 * Undo the last action.
 * Returns the state that should be restored, or null if nothing to undo.
 */
export function undo(ur: UndoRedoState): { state: Partial<SpriteState> | null; newState: UndoRedoState } {
  if (ur.pointer < 0) {
    return { state: null, newState: ur };
  }

  const delta = ur.history[ur.pointer];
  return {
    state: delta.before,
    newState: {
      ...ur,
      pointer: ur.pointer - 1,
    },
  };
}

/**
 * Redo the next action.
 * Returns the state that should be restored, or null if nothing to redo.
 */
export function redo(ur: UndoRedoState): { state: Partial<SpriteState> | null; newState: UndoRedoState } {
  if (ur.pointer >= ur.history.length - 1) {
    return { state: null, newState: ur };
  }

  const delta = ur.history[ur.pointer + 1];
  return {
    state: delta.after,
    newState: {
      ...ur,
      pointer: ur.pointer + 1,
    },
  };
}

/**
 * Check if undo is available.
 */
export function canUndo(ur: UndoRedoState): boolean {
  return ur.pointer >= 0;
}

/**
 * Check if redo is available.
 */
export function canRedo(ur: UndoRedoState): boolean {
  return ur.pointer < ur.history.length - 1;
}

/**
 * Get the current position description.
 */
export function getHistoryInfo(ur: UndoRedoState): {
  total: number;
  position: number;
  currentDescription: string | null;
} {
  return {
    total: ur.history.length,
    position: ur.pointer + 1,
    currentDescription: ur.pointer >= 0 ? ur.history[ur.pointer].description : null,
  };
}

/**
 * Clear all history.
 */
export function clearHistory(ur: UndoRedoState): UndoRedoState {
  return {
    ...ur,
    history: [],
    pointer: -1,
  };
}

/**
 * Save undo/redo history to localStorage for persistence.
 */
export async function saveHistory(ur: UndoRedoState, projectId: string): Promise<void> {
  const key = `kidcode_history_${projectId}`;
  const data = JSON.stringify({
    history: ur.history.slice(-100), // Keep last 100 steps
    pointer: Math.min(ur.pointer, 99),
  });
  try {
    localStorage.setItem(key, data);
  } catch (e) {
    // Storage full — trim to 50 steps
    const trimmed = JSON.stringify({
      history: ur.history.slice(-50),
      pointer: Math.min(ur.pointer, 49),
    });
    localStorage.setItem(key, trimmed);
  }
}

/**
 * Load undo/redo history from localStorage.
 */
export function loadHistory(projectId: string): UndoRedoState | null {
  const key = `kidcode_history_${projectId}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return {
      history: parsed.history || [],
      pointer: parsed.pointer ?? -1,
      maxDepth: 200,
    };
  } catch {
    return null;
  }
}
