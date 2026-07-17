import { IRNode } from './types';

export interface DebugInfo {
  nodeId: string;
  kind: string;
  description: string;
  stateBefore: Record<string, unknown>;
  stateAfter: Record<string, unknown>;
  duration: number;
}

export class IRDebugger {
  private trace: DebugInfo[] = [];
  private enabled = false;

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }

  logExecution(node: IRNode, stateBefore: Record<string, unknown>, stateAfter: Record<string, unknown>, duration: number) {
    if (!this.enabled) return;
    this.trace.push({
      nodeId: Math.random().toString(36).slice(2),
      kind: node.kind,
      description: describeNode(node),
      stateBefore,
      stateAfter,
      duration,
    });
  }

  getTrace(): DebugInfo[] { return [...this.trace]; }
  clear() { this.trace = []; }
  getSummary() {
    const total = this.trace.reduce((sum, t) => sum + t.duration, 0);
    const byKind = new Map<string, number>();
    this.trace.forEach(t => byKind.set(t.kind, (byKind.get(t.kind) || 0) + t.duration));
    return { totalMs: total, nodeCount: this.trace.length, byKind: Object.fromEntries(byKind) };
  }
}

function describeNode(node: IRNode): string {
  switch (node.kind) {
    case 'move_x': return `Move X by ${node.dx}`;
    case 'move_y': return `Move Y by ${node.dy}`;
    case 'set_gravity': return `Set gravity to ${node.enabled}`;
    case 'jump': return `Jump with force ${node.force}`;
    default: return node.kind;
  }
}
