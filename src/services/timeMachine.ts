/**
 * Time Machine - Project History System
 * Ported from Timeframe's delta-based history (500-step depth, O(Modification Size) memory).
 * Records every creative action and allows instant branching and restoration.
 */

export interface TimeMachineCommand {
  id: string;
  label: string;
  emoji: string;
  timestamp: number;
  space: string;
  undoPatch: Record<string, unknown>;
  redoPatch: Record<string, unknown>;
  thumbnail?: string;
  tags: string[];
}

export interface TimeBranch {
  id: string;
  name: string;
  commands: TimeMachineCommand[];
  createdAt: number;
  parentBranchId?: string;
}

export interface TimeCheckpoint {
  id: string;
  label: string;
  timestamp: number;
  branchId: string;
  commandIndex: number;
  fullSnapshot: Record<string, unknown> | null;
  thumbnail?: string;
}

const MAX_HISTORY = 500;
const AUTO_CHECKPOINT_INTERVAL = 30; // Auto-checkpoint every 30 commands

export class TimeMachine {
  private branches: Map<string, TimeBranch> = new Map();
  private currentBranchId: string = 'main';
  private currentIndex: number = 0;
  private checkpoints: TimeCheckpoint[] = [];
  private listeners: Set<(event: string, data: unknown) => void> = new Set();

  constructor() {
    this.branches.set('main', {
      id: 'main',
      name: 'Main',
      commands: [],
      createdAt: Date.now(),
    });
  }

  // === Command Management ===

  pushCommand(command: Omit<TimeMachineCommand, 'id' | 'timestamp'>): TimeMachineCommand {
    const branch = this.getCurrentBranch();
    const fullCommand: TimeMachineCommand = {
      ...command,
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };

    // Remove future commands (branching point)
    branch.commands = branch.commands.slice(0, this.currentIndex);
    branch.commands.push(fullCommand);
    this.currentIndex = branch.commands.length;

    // Limit history depth
    if (branch.commands.length > MAX_HISTORY) {
      branch.commands.shift();
      this.currentIndex--;
    }

    // Auto-checkpoint
    if (branch.commands.length % AUTO_CHECKPOINT_INTERVAL === 0) {
      this.createCheckpoint(`Auto-save at step ${branch.commands.length}`);
    }

    this.emit('command', fullCommand);
    return fullCommand;
  }

  undo(): TimeMachineCommand | null {
    const branch = this.getCurrentBranch();
    if (this.currentIndex <= 0) return null;

    this.currentIndex--;
    const command = branch.commands[this.currentIndex];
    this.emit('undo', command);
    return command;
  }

  redo(): TimeMachineCommand | null {
    const branch = this.getCurrentBranch();
    if (this.currentIndex >= branch.commands.length) return null;

    const command = branch.commands[this.currentIndex];
    this.currentIndex++;
    this.emit('redo', command);
    return command;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    const branch = this.getCurrentBranch();
    return this.currentIndex < branch.commands.length;
  }

  // === Branching ===

  createBranch(name: string, fromBranchId?: string): TimeBranch {
    const sourceId = fromBranchId || this.currentBranchId;
    const source = this.branches.get(sourceId);
    if (!source) throw new Error(`Branch ${sourceId} not found`);

    const newBranch: TimeBranch = {
      id: `branch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      commands: [...source.commands.slice(0, this.currentIndex)],
      createdAt: Date.now(),
      parentBranchId: sourceId,
    };

    this.branches.set(newBranch.id, newBranch);
    this.emit('branchCreated', newBranch);
    return newBranch;
  }

  switchBranch(branchId: string): boolean {
    if (!this.branches.has(branchId)) return false;
    this.currentBranchId = branchId;
    this.currentIndex = this.getCurrentBranch().commands.length;
    this.emit('branchSwitched', branchId);
    return true;
  }

  deleteBranch(branchId: string): boolean {
    if (branchId === 'main') return false;
    if (branchId === this.currentBranchId) return false;
    this.branches.delete(branchId);
    this.emit('branchDeleted', branchId);
    return true;
  }

  // === Checkpoints ===

  createCheckpoint(label: string): TimeCheckpoint {
    const checkpoint: TimeCheckpoint = {
      id: `cp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label,
      timestamp: Date.now(),
      branchId: this.currentBranchId,
      commandIndex: this.currentIndex,
      fullSnapshot: null, // Would be populated with actual state
    };
    this.checkpoints.push(checkpoint);
    this.emit('checkpoint', checkpoint);
    return checkpoint;
  }

  restoreCheckpoint(checkpointId: string): boolean {
    const checkpoint = this.checkpoints.find(c => c.id === checkpointId);
    if (!checkpoint) return false;

    this.switchBranch(checkpoint.branchId);
    this.currentIndex = checkpoint.commandIndex;
    this.emit('checkpointRestored', checkpoint);
    return true;
  }

  // === Timeline View ===

  getTimeline(): TimeMachineCommand[] {
    const branch = this.getCurrentBranch();
    return branch.commands;
  }

  getTimelineUpTo(index: number): TimeMachineCommand[] {
    return this.getCurrentBranch().commands.slice(0, index);
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getBranches(): TimeBranch[] {
    return Array.from(this.branches.values());
  }

  getCurrentBranch(): TimeBranch {
    return this.branches.get(this.currentBranchId)!;
  }

  getCheckpoints(): TimeCheckpoint[] {
    return [...this.checkpoints];
  }

  // === Search ===

  searchCommands(query: string): TimeMachineCommand[] {
    const lower = query.toLowerCase();
    const results: TimeMachineCommand[] = [];
    this.branches.forEach(branch => {
      branch.commands.forEach(cmd => {
        if (cmd.label.toLowerCase().includes(lower) ||
            cmd.tags.some(t => t.toLowerCase().includes(lower))) {
          results.push(cmd);
        }
      });
    });
    return results;
  }

  getCommandsBySpace(space: string): TimeMachineCommand[] {
    return this.getCurrentBranch().commands.filter(c => c.space === space);
  }

  getCommandsByTag(tag: string): TimeMachineCommand[] {
    return this.getCurrentBranch().commands.filter(c => c.tags.includes(tag));
  }

  // === Statistics ===

  getStats() {
    let totalCommands = 0;
    this.branches.forEach(b => { totalCommands += b.commands.length; });
    return {
      totalCommands,
      totalBranches: this.branches.size,
      totalCheckpoints: this.checkpoints.length,
      currentBranch: this.currentBranchId,
      currentIndex: this.currentIndex,
    };
  }

  // === Events ===

  on(event: string, listener: (data: unknown) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: string, data: unknown) {
    this.listeners.forEach(fn => fn(event, data));
  }
}

let instance: TimeMachine | null = null;

export function getTimeMachine(): TimeMachine {
  if (!instance) instance = new TimeMachine();
  return instance;
}
