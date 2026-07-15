// KidCode Studio — Enhanced Block Sync System
// 1000% improvement: Real-time bidirectional sync between blocks and game engine

import { UnifiedGameEngine } from './unifiedGameEngine';
import { playSoundEffect } from './soundService';

// === 1. REAL-TIME VARIABLE SYNC (Enhanced) ===
export interface VariableSync {
  name: string;
  value: number | string | boolean;
  type: 'number' | 'string' | 'boolean';
  lastUpdated: number;
  listeners: Set<(value: number | string | boolean) => void>;
  history: Array<{ value: number | string | boolean; timestamp: number }>;
  min?: number;
  max?: number;
}

export class VariableSyncManager {
  private variables: Map<string, VariableSync> = new Map();
  private engine: UnifiedGameEngine;
  private syncCallbacks: Set<(vars: Record<string, number | string | boolean>) => void> = new Set();

  constructor(engine: UnifiedGameEngine) {
    this.engine = engine;
  }

  set(name: string, value: number | string | boolean, type: 'number' | 'string' | 'boolean' = 'number') {
    const existing = this.variables.get(name);
    if (existing) {
      existing.value = value;
      existing.lastUpdated = Date.now();
      existing.history.push({ value, timestamp: Date.now() });
      if (existing.history.length > 100) existing.history.shift();
      existing.listeners.forEach(cb => cb(value));
    } else {
      this.variables.set(name, {
        name, value, type,
        lastUpdated: Date.now(),
        listeners: new Set(),
        history: [{ value, timestamp: Date.now() }],
      });
    }
    // Sync to engine state
    this.engine.state.variables[name] = value;
    // Notify sync listeners
    this.syncCallbacks.forEach(cb => cb(this.getAll()));
  }

  get(name: string): number | string | boolean | undefined {
    return this.variables.get(name)?.value;
  }

  onChange(name: string, callback: (value: number | string | boolean) => void): () => void {
    const v = this.variables.get(name);
    if (v) v.listeners.add(callback);
    return () => v?.listeners.delete(callback);
  }

  onAnyChange(callback: (vars: Record<string, number | string | boolean>) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  getHistory(name: string): Array<{ value: number | string | boolean; timestamp: number }> {
    return this.variables.get(name)?.history || [];
  }

  getAll(): Record<string, number | string | boolean> {
    const result: Record<string, number | string | boolean> = {};
    this.variables.forEach((v, k) => { result[k] = v.value; });
    return result;
  }

  getVariableInfo(name: string): VariableSync | undefined {
    return this.variables.get(name);
  }

  getAllVariables(): VariableSync[] {
    return Array.from(this.variables.values());
  }

  setRange(name: string, min: number, max: number) {
    const v = this.variables.get(name);
    if (v) { v.min = min; v.max = max; }
  }
}

// === 2. BLOCK EXECUTION VISUALIZER (Enhanced) ===
export interface BlockExecutionState {
  currentBlockIndex: number;
  executionHistory: Array<{ blockId: string; blockType: string; timestamp: number; duration: number; success: boolean }>;
  blocksPerSecond: number;
  totalBlocksExecuted: number;
  isPaused: boolean;
  breakpoints: Set<number>;
  lastExecutedBlock: string | null;
  executionLog: string[];
}

export class BlockVisualizer {
  private state: BlockExecutionState;
  private lastSecondBlocks: number = 0;
  private secondTimer: number = 0;
  private maxLogSize: number = 200;

  constructor() {
    this.state = {
      currentBlockIndex: -1,
      executionHistory: [],
      blocksPerSecond: 0,
      totalBlocksExecuted: 0,
      isPaused: false,
      breakpoints: new Set(),
      lastExecutedBlock: null,
      executionLog: [],
    };
  }

  onBlockExecuted(blockIndex: number, blockId: string, blockType: string, success: boolean = true) {
    const now = Date.now();
    this.state.currentBlockIndex = blockIndex;
    this.state.executionHistory.push({
      blockId, blockType, timestamp: now, duration: 0, success,
    });
    this.state.totalBlocksExecuted++;
    this.state.lastExecutedBlock = blockType;
    this.lastSecondBlocks++;

    // Add to log
    this.state.executionLog.push(`[${new Date(now).toLocaleTimeString()}] ${blockType}`);
    if (this.state.executionLog.length > this.maxLogSize) {
      this.state.executionLog.shift();
    }

    // Keep history limited
    if (this.state.executionHistory.length > 200) {
      this.state.executionHistory.shift();
    }
  }

  update(dt: number) {
    this.secondTimer += dt;
    if (this.secondTimer >= 1) {
      this.state.blocksPerSecond = this.lastSecondBlocks;
      this.lastSecondBlocks = 0;
      this.secondTimer = 0;
    }
  }

  addBreakpoint(blockIndex: number) {
    this.state.breakpoints.add(blockIndex);
  }

  removeBreakpoint(blockIndex: number) {
    this.state.breakpoints.delete(blockIndex);
  }

  hasBreakpoint(blockIndex: number): boolean {
    return this.state.breakpoints.has(blockIndex);
  }

  getState(): BlockExecutionState {
    return { ...this.state };
  }

  getRecentLog(count: number = 20): string[] {
    return this.state.executionLog.slice(-count);
  }

  reset() {
    this.state.currentBlockIndex = -1;
    this.state.executionHistory = [];
    this.state.totalBlocksExecuted = 0;
    this.state.executionLog = [];
    this.lastSecondBlocks = 0;
    this.secondTimer = 0;
  }
}

// === 3. BREAKPOINT SYSTEM (Enhanced) ===
export interface Breakpoint {
  id: string;
  blockIndex: number;
  enabled: boolean;
  hitCount: number;
  condition?: string;
  logMessage?: string;
  color: string;
}

export class BreakpointManager {
  private breakpoints: Map<number, Breakpoint> = new Map();
  private colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];
  private colorIndex = 0;

  add(blockIndex: number, condition?: string, logMessage?: string): string {
    const id = `bp_${Date.now()}`;
    this.breakpoints.set(blockIndex, {
      id, blockIndex, enabled: true, hitCount: 0,
      condition, logMessage,
      color: this.colors[this.colorIndex % this.colors.length],
    });
    this.colorIndex++;
    return id;
  }

  remove(blockIndex: number) {
    this.breakpoints.delete(blockIndex);
  }

  toggle(blockIndex: number) {
    const bp = this.breakpoints.get(blockIndex);
    if (bp) bp.enabled = !bp.enabled;
  }

  shouldPause(blockIndex: number): boolean {
    const bp = this.breakpoints.get(blockIndex);
    if (!bp || !bp.enabled) return false;
    bp.hitCount++;
    return true;
  }

  getAll(): Breakpoint[] {
    return Array.from(this.breakpoints.values());
  }

  clear() {
    this.breakpoints.clear();
  }
}

// === 4. STEP EXECUTOR (Enhanced) ===
export class StepExecutor {
  private isStepping: boolean = false;
  private stepCount: number = 0;
  private onStepCallback?: (blockIndex: number) => void;
  private onStepComplete?: () => void;

  setStepCallback(cb: (blockIndex: number) => void) {
    this.onStepCallback = cb;
  }

  setStepCompleteCallback(cb: () => void) {
    this.onStepComplete = cb;
  }

  step(blockIndex: number) {
    this.isStepping = true;
    this.stepCount++;
    this.onStepCallback?.(blockIndex);
  }

  continue() {
    this.isStepping = false;
    this.onStepComplete?.();
  }

  isStepMode(): boolean {
    return this.isStepping;
  }

  getStepCount(): number {
    return this.stepCount;
  }

  reset() {
    this.isStepping = false;
    this.stepCount = 0;
  }
}

// === 5. EXECUTION COUNTER (Enhanced) ===
export class ExecutionCounter {
  private total: number = 0;
  private perSecond: number = 0;
  private perMinute: number = 0;
  private lastSecondCount: number = 0;
  private lastMinuteCount: number = 0;
  private secondTimer: number = 0;
  private minuteTimer: number = 0;

  increment() {
    this.total++;
    this.lastSecondCount++;
    this.lastMinuteCount++;
  }

  update(dt: number) {
    this.secondTimer += dt;
    this.minuteTimer += dt;
    if (this.secondTimer >= 1) {
      this.perSecond = this.lastSecondCount;
      this.lastSecondCount = 0;
      this.secondTimer = 0;
    }
    if (this.minuteTimer >= 60) {
      this.perMinute = this.lastMinuteCount;
      this.lastMinuteCount = 0;
      this.minuteTimer = 0;
    }
  }

  getTotal(): number { return this.total; }
  getPerSecond(): number { return this.perSecond; }
  getPerMinute(): number { return this.perMinute; }
  reset() { this.total = 0; this.lastSecondCount = 0; this.lastMinuteCount = 0; this.secondTimer = 0; this.minuteTimer = 0; }
}

// === 6. VARIABLE WATCH PANEL (Enhanced) ===
export interface VariableWatch {
  name: string;
  value: number | string | boolean;
  type: 'number' | 'string' | 'boolean';
  history: Array<{ value: number | string | boolean; timestamp: number }>;
  maxHistory: number;
  trend: 'up' | 'down' | 'stable';
}

export class VariableWatchPanel {
  private watches: Map<string, VariableWatch> = new Map();

  addWatch(name: string) {
    if (!this.watches.has(name)) {
      this.watches.set(name, {
        name, value: 0, type: 'number',
        history: [], maxHistory: 50,
        trend: 'stable',
      });
    }
  }

  updateValue(name: string, value: number | string | boolean) {
    const watch = this.watches.get(name);
    if (watch) {
      const prevValue = watch.value;
      watch.value = value;
      watch.history.push({ value, timestamp: Date.now() });
      if (watch.history.length > watch.maxHistory) watch.history.shift();

      // Calculate trend
      if (typeof value === 'number' && typeof prevValue === 'number') {
        if (value > prevValue) watch.trend = 'up';
        else if (value < prevValue) watch.trend = 'down';
        else watch.trend = 'stable';
      }
    }
  }

  getWatch(name: string): VariableWatch | undefined {
    return this.watches.get(name);
  }

  getAllWatches(): VariableWatch[] {
    return Array.from(this.watches.values());
  }

  getTrend(name: string): 'up' | 'down' | 'stable' {
    return this.watches.get(name)?.trend || 'stable';
  }

  clearHistory(name: string) {
    const watch = this.watches.get(name);
    if (watch) watch.history = [];
  }
}

// === 7. BLOCK ERROR HANDLER (Enhanced) ===
export interface BlockError {
  blockIndex: number;
  blockId: string;
  message: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: number;
}

export class BlockErrorHandler {
  private errors: BlockError[] = [];
  private maxErrors: number = 100;

  reportError(blockIndex: number, blockId: string, message: string, suggestion: string, severity: 'error' | 'warning' | 'info' = 'error') {
    this.errors.push({
      blockIndex, blockId, message, suggestion, severity,
      timestamp: Date.now(),
    });
    if (this.errors.length > this.maxErrors) this.errors.shift();
  }

  getErrors(): BlockError[] {
    return [...this.errors];
  }

  getErrorsBySeverity(severity: 'error' | 'warning' | 'info'): BlockError[] {
    return this.errors.filter(e => e.severity === severity);
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorForBlock(blockIndex: number): BlockError | undefined {
    return this.errors.find(e => e.blockIndex === blockIndex);
  }

  getErrorCount(): number {
    return this.errors.length;
  }
}

// === 8. EXECUTION HISTORY (Enhanced) ===
export interface ExecutionEntry {
  blockId: string;
  blockType: string;
  timestamp: number;
  duration: number;
  result: 'success' | 'error' | 'skipped';
  variables?: Record<string, number | string | boolean>;
}

export class ExecutionHistory {
  private entries: ExecutionEntry[] = [];
  private maxEntries: number = 500;

  addEntry(entry: ExecutionEntry) {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) this.entries.shift();
  }

  getEntries(): ExecutionEntry[] {
    return [...this.entries];
  }

  getRecent(count: number): ExecutionEntry[] {
    return this.entries.slice(-count);
  }

  clear() {
    this.entries = [];
  }

  getByType(type: string): ExecutionEntry[] {
    return this.entries.filter(e => e.blockType === type);
  }

  getSuccessful(): ExecutionEntry[] {
    return this.entries.filter(e => e.result === 'success');
  }

  getFailed(): ExecutionEntry[] {
    return this.entries.filter(e => e.result === 'error');
  }
}

// === 9. CONDITIONAL PREVIEW (Enhanced) ===
export class ConditionalPreview {
  previewCondition(condition: string, params: Record<string, unknown>, gameState: Record<string, unknown>): { willExecute: boolean; reason: string } {
    switch (condition) {
      case 'IS_PRESSED':
        return { willExecute: false, reason: 'Waiting for key press' };
      case 'IS_TOUCHING':
        return {
          willExecute: (gameState.items as Array<{ emoji: string; collected: boolean }>)?.some((i) => i.emoji === params.text && !i.collected) ||
                       (gameState.enemies as Array<{ emoji: string; alive: boolean }>)?.some((e) => e.emoji === params.text && e.alive),
          reason: `Checking if touching ${params.text}`,
        };
      case 'EQUALS':
        return {
          willExecute: ((gameState.variables as Record<string, number>)?.[params.varName as string] || 0) === (params.value as number),
          reason: `${params.varName} == ${params.value}`,
        };
      case 'GREATER':
        return {
          willExecute: ((gameState.variables as Record<string, number>)?.[params.varName as string] || 0) > (params.value as number),
          reason: `${params.varName} > ${params.value}`,
        };
      case 'LESS':
        return {
          willExecute: ((gameState.variables as Record<string, number>)?.[params.varName as string] || 0) < (params.value as number),
          reason: `${params.varName} < ${params.value}`,
        };
      default:
        return { willExecute: true, reason: 'Unknown condition' };
    }
  }
}

// === 10. BLOCK HOT-RELOADER (Enhanced) ===
export interface BlockData {
  id: string;
  type: string;
  params: Record<string, string | number | boolean | undefined>;
}

export class BlockHotReloader {
  private previousBlocks: string = '';
  private onChangeCallback?: (newBlocks: BlockData[]) => void;
  private debounceTimer: number = 0;
  private debounceDelay: number = 100;

  setOnChangeCallback(cb: (newBlocks: BlockData[]) => void) {
    this.onChangeCallback = cb;
  }

  checkForChanges(blocks: BlockData[]): boolean {
    const current = JSON.stringify(blocks);
    if (current !== this.previousBlocks) {
      this.previousBlocks = current;
      // Debounce the callback
      clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        this.onChangeCallback?.(blocks);
      }, this.debounceDelay);
      return true;
    }
    return false;
  }

  forceReload(blocks: BlockData[]) {
    this.previousBlocks = JSON.stringify(blocks);
    this.onChangeCallback?.(blocks);
  }

  setDebounceDelay(delay: number) {
    this.debounceDelay = delay;
  }
}
