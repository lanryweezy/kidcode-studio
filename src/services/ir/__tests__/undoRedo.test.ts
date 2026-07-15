import { describe, it, expect } from 'vitest';
import {
  createUndoRedoState,
  captureState,
  pushDelta,
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInfo,
  clearHistory,
} from '../undoRedo';
import { INITIAL_SPRITE_STATE } from '../../../constants';

describe('IR Undo/Redo System', () => {
  const makeState = (overrides: Record<string, any> = {}) => ({
    ...INITIAL_SPRITE_STATE,
    ...overrides,
  });

  describe('createUndoRedoState', () => {
    it('creates empty state', () => {
      const ur = createUndoRedoState();
      expect(ur.history).toHaveLength(0);
      expect(ur.pointer).toBe(-1);
      expect(ur.maxDepth).toBe(200);
    });

    it('respects custom maxDepth', () => {
      const ur = createUndoRedoState(10);
      expect(ur.maxDepth).toBe(10);
    });
  });

  describe('captureState', () => {
    it('captures current state', () => {
      const state = makeState({ x: 100, y: 200, health: 50, score: 100 });
      const snapshot = captureState(state);
      expect(snapshot.x).toBe(100);
      expect(snapshot.y).toBe(200);
      expect(snapshot.health).toBe(50);
      expect(snapshot.score).toBe(100);
    });

    it('deep copies variables', () => {
      const state = makeState({ variables: { level: 3 } });
      const snapshot = captureState(state);
      expect(snapshot.variables?.level).toBe(3);
      // Modify original — snapshot should be unaffected
      state.variables.level = 5;
      expect(snapshot.variables?.level).toBe(3);
    });
  });

  describe('pushDelta', () => {
    it('adds a delta to history', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'moved right', { x: 100 }, { x: 110 });
      expect(ur.history).toHaveLength(1);
      expect(ur.pointer).toBe(0);
      expect(ur.history[0].description).toBe('moved right');
    });

    it('truncates future on new delta', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'action 1', { x: 100 }, { x: 110 });
      ur = pushDelta(ur, 'action 2', { x: 110 }, { x: 120 });
      ur = pushDelta(ur, 'action 3', { x: 120 }, { x: 130 });
      // Undo twice
      ur = undo(ur).newState;
      ur = undo(ur).newState;
      // Push new action — should truncate action 3
      ur = pushDelta(ur, 'action 4', { x: 100 }, { x: 115 });
      expect(ur.history).toHaveLength(2);
      expect(ur.history[1].description).toBe('action 4');
    });

    it('enforces max depth', () => {
      let ur = createUndoRedoState(3);
      for (let i = 0; i < 5; i++) {
        ur = pushDelta(ur, `action ${i}`, { x: i }, { x: i + 1 });
      }
      expect(ur.history).toHaveLength(3);
      expect(ur.pointer).toBe(2);
    });
  });

  describe('undo', () => {
    it('restores previous state', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'moved right', { x: 100 }, { x: 110 });
      ur = pushDelta(ur, 'moved down', { y: 200 }, { y: 210 });
      const { state, newState } = undo(ur);
      expect(state).toEqual({ y: 200 }); // before of last action
      expect(newState.pointer).toBe(0);
    });

    it('returns null when nothing to undo', () => {
      const ur = createUndoRedoState();
      const { state } = undo(ur);
      expect(state).toBeNull();
    });
  });

  describe('redo', () => {
    it('re-applies undone action', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'action', { x: 100 }, { x: 110 });
      ur = undo(ur).newState;
      const { state, newState } = redo(ur);
      expect(state).toEqual({ x: 110 }); // after of the action
      expect(newState.pointer).toBe(0);
    });

    it('returns null when nothing to redo', () => {
      const ur = createUndoRedoState();
      const { state } = redo(ur);
      expect(state).toBeNull();
    });
  });

  describe('canUndo / canRedo', () => {
    it('canUndo is false initially', () => {
      expect(canUndo(createUndoRedoState())).toBe(false);
    });

    it('canUndo is true after push', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'action', {}, {});
      expect(canUndo(ur)).toBe(true);
    });

    it('canRedo is false initially', () => {
      expect(canRedo(createUndoRedoState())).toBe(false);
    });

    it('canRedo is true after undo', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'action', {}, {});
      ur = undo(ur).newState;
      expect(canRedo(ur)).toBe(true);
    });
  });

  describe('getHistoryInfo', () => {
    it('returns correct info', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'action 1', {}, {});
      ur = pushDelta(ur, 'action 2', {}, {});
      const info = getHistoryInfo(ur);
      expect(info.total).toBe(2);
      expect(info.position).toBe(2);
      expect(info.currentDescription).toBe('action 2');
    });

    it('returns null description when empty', () => {
      const info = getHistoryInfo(createUndoRedoState());
      expect(info.currentDescription).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('resets to empty state', () => {
      let ur = createUndoRedoState();
      ur = pushDelta(ur, 'action', {}, {});
      ur = clearHistory(ur);
      expect(ur.history).toHaveLength(0);
      expect(ur.pointer).toBe(-1);
    });
  });

  describe('full undo/redo workflow', () => {
    it('handles complete undo/redo cycle', () => {
      const state = makeState({ x: 100, y: 200 });
      let ur = createUndoRedoState();

      // Action 1: move right
      let before = captureState(state);
      state.x += 10;
      let after = captureState(state);
      ur = pushDelta(ur, 'move right', before, after);

      // Action 2: move down
      before = captureState(state);
      state.y += 20;
      after = captureState(state);
      ur = pushDelta(ur, 'move down', before, after);

      // Action 3: jump
      before = captureState(state);
      state.vy = -15;
      state.isJumping = true;
      after = captureState(state);
      ur = pushDelta(ur, 'jump', before, after);

      // Undo jump
      let result = undo(ur);
      state.vy = result.state?.vy ?? 0;
      state.isJumping = result.state?.isJumping ?? false;
      ur = result.newState;
      expect(state.vy).toBe(0);
      expect(state.isJumping).toBe(false);

      // Undo move down
      result = undo(ur);
      state.y = result.state?.y ?? 200;
      ur = result.newState;
      expect(state.y).toBe(200);

      // Redo move down
      result = redo(ur);
      state.y = result.state?.y ?? 200;
      ur = result.newState;
      expect(state.y).toBe(220);

      // Redo jump
      result = redo(ur);
      state.vy = result.state?.vy ?? 0;
      state.isJumping = result.state?.isJumping ?? false;
      ur = result.newState;
      expect(state.vy).toBe(-15);
      expect(state.isJumping).toBe(true);
    });
  });
});
