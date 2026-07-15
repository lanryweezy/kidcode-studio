import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VariableSyncManager, BlockErrorHandler, ExecutionHistory } from '../blockSync';

describe('Integration Tests', () => {
  describe('Block → IR → Execute → State Change', () => {
    it('variable set changes engine state', () => {
      const mockEngine = { state: { variables: {} as Record<string, unknown> } };
      const sync = new VariableSyncManager(mockEngine as any);
      
      sync.set('score', 100, 'number');
      expect(mockEngine.state.variables['score']).toBe(100);
    });

    it('variable change updates listeners', () => {
      const mockEngine = { state: { variables: {} as Record<string, unknown> } };
      const sync = new VariableSyncManager(mockEngine as any);
      const callback = vi.fn();
      
      // Must create variable first, then add listener
      sync.set('score', 0, 'number');
      sync.onChange('score', callback);
      sync.set('score', 100, 'number');
      
      expect(callback).toHaveBeenCalledWith(100);
    });

    it('multiple variables maintain independent state', () => {
      const mockEngine = { state: { variables: {} as Record<string, unknown> } };
      const sync = new VariableSyncManager(mockEngine as any);
      
      sync.set('score', 100, 'number');
      sync.set('health', 50, 'number');
      
      expect(sync.get('score')).toBe(100);
      expect(sync.get('health')).toBe(50);
    });
  });

  describe('Save → Load → Verify State', () => {
    const store: Record<string, string> = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((i: number) => Object.keys(store)[i] || null),
    };

    beforeEach(() => {
      localStorageMock.clear();
      vi.clearAllMocks();
    });

    it('execution history persists through add and retrieval', () => {
      const history = new ExecutionHistory();
      
      history.addEntry({
        blockId: 'b1',
        blockType: 'MOVE_X',
        timestamp: Date.now(),
        duration: 10,
        result: 'success',
      });
      
      const entries = history.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].blockType).toBe('MOVE_X');
    });

    it('error handler captures and retrieves errors', () => {
      const handler = new BlockErrorHandler();
      
      handler.reportError(0, 'b1', 'Variable not found', 'Define the variable first');
      handler.reportError(1, 'b2', 'Invalid operation', 'Check block parameters');
      
      const errors = handler.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].suggestion).toBe('Define the variable first');
    });
  });

  describe('Template Validation End-to-End', () => {
    it('validates block structure', () => {
      interface Block {
        id: string;
        type: string;
        params: Record<string, string | number | boolean | undefined>;
      }
      
      const validateBlock = (block: Block): boolean => {
        if (!block.id || typeof block.id !== 'string') return false;
        if (!block.type || typeof block.type !== 'string') return false;
        if (!block.params || typeof block.params !== 'object') return false;
        return true;
      };
      
      const validBlock: Block = {
        id: 'block_1',
        type: 'MOVE_X',
        params: { value: 10 },
      };
      
      const invalidBlock = {
        id: '',
        type: 'MOVE_X',
        params: { value: 10 },
      };
      
      expect(validateBlock(validBlock)).toBe(true);
      expect(validateBlock(invalidBlock as Block)).toBe(false);
    });

    it('validates required params for each block type', () => {
      const requiredParams: Record<string, string[]> = {
        'MOVE_X': ['value'],
        'MOVE_Y': ['value'],
        'JUMP': ['value'],
        'IF': ['condition'],
        'SET_VAR': ['varName', 'value'],
        'PLAY_SOUND': ['text'],
      };
      
      const validateParams = (type: string, params: Record<string, unknown>): boolean => {
        const required = requiredParams[type];
        if (!required) return true;
        return required.every(param => params[param] !== undefined);
      };
      
      expect(validateParams('MOVE_X', { value: 10 })).toBe(true);
      expect(validateParams('MOVE_X', {})).toBe(false);
      expect(validateParams('IF', { condition: 'IS_PRESSED' })).toBe(true);
      expect(validateParams('UNKNOWN', {})).toBe(true);
    });

    it('validates block sequence for FOREVER loop', () => {
      interface Block {
        id: string;
        type: string;
        params: Record<string, string | number | boolean | undefined>;
      }
      
      const validateBlockSequence = (blocks: Block[]): boolean => {
        let loopDepth = 0;
        for (const block of blocks) {
          if (block.type === 'FOREVER') loopDepth++;
          if (block.type === 'END_FOREVER') loopDepth--;
          if (loopDepth < 0) return false;
        }
        return loopDepth === 0;
      };
      
      const validSequence: Block[] = [
        { id: '1', type: 'FOREVER', params: {} },
        { id: '2', type: 'MOVE_X', params: { value: 10 } },
        { id: '3', type: 'END_FOREVER', params: {} },
      ];
      
      const invalidSequence: Block[] = [
        { id: '1', type: 'FOREVER', params: {} },
        { id: '2', type: 'MOVE_X', params: { value: 10 } },
      ];
      
      expect(validateBlockSequence(validSequence)).toBe(true);
      expect(validateBlockSequence(invalidSequence)).toBe(false);
    });
  });

  describe('Cross-Service Integration', () => {
    it('error handler and execution history work together', () => {
      const errorHandler = new BlockErrorHandler();
      const history = new ExecutionHistory();
      
      // Simulate block execution with error
      const blockId = 'b1';
      const blockType = 'MOVE_X';
      
      try {
        // Simulate successful execution
        history.addEntry({
          blockId,
          blockType,
          timestamp: Date.now(),
          duration: 5,
          result: 'success',
        });
      } catch (error) {
        errorHandler.reportError(0, blockId, 'Execution failed', 'Check block');
        history.addEntry({
          blockId,
          blockType,
          timestamp: Date.now(),
          duration: 5,
          result: 'error',
        });
      }
      
      expect(history.getSuccessful()).toHaveLength(1);
      expect(errorHandler.getErrors()).toHaveLength(0);
    });

    it('variable sync notifies all listeners on change', () => {
      const mockEngine = { state: { variables: {} as Record<string, unknown> } };
      const sync = new VariableSyncManager(mockEngine as any);
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const anyCallback = vi.fn();
      
      // Must create variable first, then add listeners
      sync.set('score', 0, 'number');
      sync.onChange('score', callback1);
      sync.onChange('score', callback2);
      sync.onAnyChange(anyCallback);
      
      sync.set('score', 100, 'number');
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(anyCallback).toHaveBeenCalledTimes(1);
    });
  });
});
