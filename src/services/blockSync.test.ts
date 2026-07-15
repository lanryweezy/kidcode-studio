import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  VariableSyncManager,
  BlockVisualizer,
  BreakpointManager,
  StepExecutor,
  ExecutionCounter,
  VariableWatchPanel,
  BlockErrorHandler,
  ExecutionHistory,
  ConditionalPreview,
} from './blockSync';

describe('blockSync', () => {
  describe('VariableSyncManager', () => {
    let manager: VariableSyncManager;
    const mockEngine = { state: { variables: {} as Record<string, unknown> } };

    beforeEach(() => {
      manager = new VariableSyncManager(mockEngine as any);
    });

    it('sets and gets a variable', () => {
      manager.set('score', 100, 'number');
      expect(manager.get('score')).toBe(100);
    });

    it('updates existing variable', () => {
      manager.set('score', 100, 'number');
      manager.set('score', 200, 'number');
      expect(manager.get('score')).toBe(200);
    });

    it('syncs to engine state', () => {
      manager.set('score', 100, 'number');
      expect(mockEngine.state.variables['score']).toBe(100);
    });

    it('calls onChange callback', () => {
      const callback = vi.fn();
      manager.set('score', 0, 'number');
      manager.onChange('score', callback);
      manager.set('score', 100, 'number');
      expect(callback).toHaveBeenCalledWith(100);
    });

    it('removes onChange listener', () => {
      const callback = vi.fn();
      const unsub = manager.onChange('score', callback);
      unsub();
      manager.set('score', 100, 'number');
      expect(callback).not.toHaveBeenCalled();
    });

    it('calls onAnyChange callback', () => {
      const callback = vi.fn();
      manager.onAnyChange(callback);
      manager.set('score', 100, 'number');
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ score: 100 }));
    });

    it('gets variable history', () => {
      manager.set('score', 100, 'number');
      manager.set('score', 200, 'number');
      const history = manager.getHistory('score');
      expect(history).toHaveLength(2);
      expect(history[0].value).toBe(100);
      expect(history[1].value).toBe(200);
    });

    it('gets all variables', () => {
      manager.set('score', 100, 'number');
      manager.set('health', 50, 'number');
      const all = manager.getAll();
      expect(all).toEqual({ score: 100, health: 50 });
    });

    it('sets and gets range', () => {
      manager.set('score', 50, 'number');
      manager.setRange('score', 0, 100);
      const info = manager.getVariableInfo('score');
      expect(info?.min).toBe(0);
      expect(info?.max).toBe(100);
    });

    it('returns undefined for non-existent variable', () => {
      expect(manager.get('nonexistent')).toBeUndefined();
    });
  });

  describe('BlockVisualizer', () => {
    let viz: BlockVisualizer;

    beforeEach(() => {
      viz = new BlockVisualizer();
    });

    it('tracks block execution', () => {
      viz.onBlockExecuted(0, 'b1', 'MOVE_X');
      const state = viz.getState();
      expect(state.currentBlockIndex).toBe(0);
      expect(state.totalBlocksExecuted).toBe(1);
      expect(state.lastExecutedBlock).toBe('MOVE_X');
    });

    it('maintains execution history', () => {
      viz.onBlockExecuted(0, 'b1', 'MOVE_X');
      viz.onBlockExecuted(1, 'b2', 'JUMP');
      const state = viz.getState();
      expect(state.executionHistory).toHaveLength(2);
      expect(state.executionHistory[0].blockType).toBe('MOVE_X');
    });

    it('maintains execution log', () => {
      viz.onBlockExecuted(0, 'b1', 'MOVE_X');
      const log = viz.getRecentLog();
      expect(log.length).toBe(1);
      expect(log[0]).toContain('MOVE_X');
    });

    it('tracks breakpoints', () => {
      viz.addBreakpoint(5);
      expect(viz.hasBreakpoint(5)).toBe(true);
      viz.removeBreakpoint(5);
      expect(viz.hasBreakpoint(5)).toBe(false);
    });

    it('resets state', () => {
      viz.onBlockExecuted(0, 'b1', 'MOVE_X');
      viz.reset();
      const state = viz.getState();
      expect(state.totalBlocksExecuted).toBe(0);
      expect(state.executionHistory).toHaveLength(0);
    });

    it('updates blocks per second', () => {
      viz.onBlockExecuted(0, 'b1', 'MOVE_X');
      viz.update(1.0); // 1 second
      const state = viz.getState();
      expect(state.blocksPerSecond).toBe(1);
    });
  });

  describe('BreakpointManager', () => {
    let bpm: BreakpointManager;

    beforeEach(() => {
      bpm = new BreakpointManager();
    });

    it('adds a breakpoint', () => {
      const id = bpm.add(5);
      expect(id).toMatch(/^bp_/);
      expect(bpm.shouldPause(5)).toBe(true);
    });

    it('removes a breakpoint', () => {
      bpm.add(5);
      bpm.remove(5);
      expect(bpm.shouldPause(5)).toBe(false);
    });

    it('toggles breakpoint', () => {
      bpm.add(5);
      bpm.toggle(5);
      expect(bpm.shouldPause(5)).toBe(false);
      bpm.toggle(5);
      expect(bpm.shouldPause(5)).toBe(true);
    });

    it('increments hit count', () => {
      bpm.add(5);
      bpm.shouldPause(5);
      bpm.shouldPause(5);
      const all = bpm.getAll();
      expect(all[0].hitCount).toBe(2);
    });

    it('returns all breakpoints', () => {
      bpm.add(1);
      bpm.add(2);
      bpm.add(3);
      expect(bpm.getAll()).toHaveLength(3);
    });

    it('clears all breakpoints', () => {
      bpm.add(1);
      bpm.add(2);
      bpm.clear();
      expect(bpm.getAll()).toHaveLength(0);
    });
  });

  describe('StepExecutor', () => {
    let se: StepExecutor;

    beforeEach(() => {
      se = new StepExecutor();
    });

    it('starts in non-step mode', () => {
      expect(se.isStepMode()).toBe(false);
    });

    it('enters step mode on step', () => {
      se.step(0);
      expect(se.isStepMode()).toBe(true);
    });

    it('calls step callback', () => {
      const cb = vi.fn();
      se.setStepCallback(cb);
      se.step(5);
      expect(cb).toHaveBeenCalledWith(5);
    });

    it('exits step mode on continue', () => {
      se.step(0);
      se.continue();
      expect(se.isStepMode()).toBe(false);
    });

    it('increments step count', () => {
      se.step(0);
      se.step(1);
      expect(se.getStepCount()).toBe(2);
    });

    it('resets state', () => {
      se.step(0);
      se.reset();
      expect(se.isStepMode()).toBe(false);
      expect(se.getStepCount()).toBe(0);
    });
  });

  describe('ExecutionCounter', () => {
    let counter: ExecutionCounter;

    beforeEach(() => {
      counter = new ExecutionCounter();
    });

    it('increments total', () => {
      counter.increment();
      counter.increment();
      expect(counter.getTotal()).toBe(2);
    });

    it('tracks per second', () => {
      counter.increment();
      counter.update(1.0);
      expect(counter.getPerSecond()).toBe(1);
    });

    it('resets after update', () => {
      counter.increment();
      counter.update(1.0);
      expect(counter.getPerSecond()).toBe(1);
      counter.update(1.0);
      expect(counter.getPerSecond()).toBe(0);
    });

    it('resets all counters', () => {
      counter.increment();
      counter.reset();
      expect(counter.getTotal()).toBe(0);
    });
  });

  describe('VariableWatchPanel', () => {
    let panel: VariableWatchPanel;

    beforeEach(() => {
      panel = new VariableWatchPanel();
    });

    it('adds a watch', () => {
      panel.addWatch('score');
      expect(panel.getWatch('score')).toBeDefined();
    });

    it('updates watch value', () => {
      panel.addWatch('score');
      panel.updateValue('score', 100);
      expect(panel.getWatch('score')?.value).toBe(100);
    });

    it('tracks trend up', () => {
      panel.addWatch('score');
      panel.updateValue('score', 50);
      panel.updateValue('score', 100);
      expect(panel.getTrend('score')).toBe('up');
    });

    it('tracks trend down', () => {
      panel.addWatch('score');
      panel.updateValue('score', 100);
      panel.updateValue('score', 50);
      expect(panel.getTrend('score')).toBe('down');
    });

    it('tracks trend stable', () => {
      panel.addWatch('score');
      panel.updateValue('score', 100);
      panel.updateValue('score', 100);
      expect(panel.getTrend('score')).toBe('stable');
    });

    it('gets all watches', () => {
      panel.addWatch('score');
      panel.addWatch('health');
      expect(panel.getAllWatches()).toHaveLength(2);
    });

    it('clears history', () => {
      panel.addWatch('score');
      panel.updateValue('score', 100);
      panel.clearHistory('score');
      expect(panel.getWatch('score')?.history).toHaveLength(0);
    });

    it('returns stable for non-existent watch', () => {
      expect(panel.getTrend('nonexistent')).toBe('stable');
    });
  });

  describe('BlockErrorHandler', () => {
    let handler: BlockErrorHandler;

    beforeEach(() => {
      handler = new BlockErrorHandler();
    });

    it('reports errors', () => {
      handler.reportError(0, 'b1', 'Error msg', 'Fix it');
      expect(handler.getErrors()).toHaveLength(1);
      expect(handler.getErrorCount()).toBe(1);
    });

    it('filters by severity', () => {
      handler.reportError(0, 'b1', 'Error', 'Fix', 'error');
      handler.reportError(1, 'b2', 'Warning', 'Check', 'warning');
      expect(handler.getErrorsBySeverity('error')).toHaveLength(1);
      expect(handler.getErrorsBySeverity('warning')).toHaveLength(1);
    });

    it('gets error for block', () => {
      handler.reportError(5, 'b5', 'Error', 'Fix');
      expect(handler.getErrorForBlock(5)).toBeDefined();
      expect(handler.getErrorForBlock(0)).toBeUndefined();
    });

    it('clears errors', () => {
      handler.reportError(0, 'b1', 'Error', 'Fix');
      handler.clearErrors();
      expect(handler.getErrors()).toHaveLength(0);
    });

    it('limits max errors', () => {
      for (let i = 0; i < 150; i++) {
        handler.reportError(i, `b${i}`, `Error ${i}`, 'Fix');
      }
      expect(handler.getErrorCount()).toBe(100);
    });
  });

  describe('ExecutionHistory', () => {
    let history: ExecutionHistory;

    beforeEach(() => {
      history = new ExecutionHistory();
    });

    it('adds entries', () => {
      history.addEntry({ blockId: 'b1', blockType: 'MOVE_X', timestamp: Date.now(), duration: 0, result: 'success' });
      expect(history.getEntries()).toHaveLength(1);
    });

    it('gets recent entries', () => {
      for (let i = 0; i < 10; i++) {
        history.addEntry({ blockId: `b${i}`, blockType: 'MOVE_X', timestamp: Date.now(), duration: 0, result: 'success' });
      }
      expect(history.getRecent(5)).toHaveLength(5);
    });

    it('filters by type', () => {
      history.addEntry({ blockId: 'b1', blockType: 'MOVE_X', timestamp: Date.now(), duration: 0, result: 'success' });
      history.addEntry({ blockId: 'b2', blockType: 'JUMP', timestamp: Date.now(), duration: 0, result: 'success' });
      expect(history.getByType('MOVE_X')).toHaveLength(1);
    });

    it('filters successful entries', () => {
      history.addEntry({ blockId: 'b1', blockType: 'MOVE_X', timestamp: Date.now(), duration: 0, result: 'success' });
      history.addEntry({ blockId: 'b2', blockType: 'JUMP', timestamp: Date.now(), duration: 0, result: 'error' });
      expect(history.getSuccessful()).toHaveLength(1);
      expect(history.getFailed()).toHaveLength(1);
    });

    it('clears history', () => {
      history.addEntry({ blockId: 'b1', blockType: 'MOVE_X', timestamp: Date.now(), duration: 0, result: 'success' });
      history.clear();
      expect(history.getEntries()).toHaveLength(0);
    });

    it('limits max entries', () => {
      for (let i = 0; i < 600; i++) {
        history.addEntry({ blockId: `b${i}`, blockType: 'MOVE_X', timestamp: Date.now(), duration: 0, result: 'success' });
      }
      expect(history.getEntries().length).toBeLessThanOrEqual(500);
    });
  });

  describe('ConditionalPreview', () => {
    let preview: ConditionalPreview;

    beforeEach(() => {
      preview = new ConditionalPreview();
    });

    it('preview IS_PRESSED returns false', () => {
      const result = preview.previewCondition('IS_PRESSED', {}, {});
      expect(result.willExecute).toBe(false);
    });

    it('preview EQUALS matches when equal', () => {
      const result = preview.previewCondition('EQUALS', { varName: 'score', value: 100 }, { variables: { score: 100 } });
      expect(result.willExecute).toBe(true);
    });

    it('preview EQUALS fails when not equal', () => {
      const result = preview.previewCondition('EQUALS', { varName: 'score', value: 100 }, { variables: { score: 50 } });
      expect(result.willExecute).toBe(false);
    });

    it('preview GREATER works', () => {
      const result = preview.previewCondition('GREATER', { varName: 'score', value: 50 }, { variables: { score: 100 } });
      expect(result.willExecute).toBe(true);
    });

    it('preview LESS works', () => {
      const result = preview.previewCondition('LESS', { varName: 'score', value: 100 }, { variables: { score: 50 } });
      expect(result.willExecute).toBe(true);
    });

    it('preview IS_TOUCHING checks items', () => {
      const result = preview.previewCondition('IS_TOUCHING', { text: '🪙' }, {
        items: [{ emoji: '🪙', collected: false }],
        enemies: [],
      });
      expect(result.willExecute).toBe(true);
    });

    it('preview unknown condition returns true', () => {
      const result = preview.previewCondition('UNKNOWN', {}, {});
      expect(result.willExecute).toBe(true);
    });
  });
});
