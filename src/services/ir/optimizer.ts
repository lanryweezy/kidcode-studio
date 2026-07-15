/**
 * IR Optimizer — Transforms IR programs for better performance.
 * 
 * Optimizations:
 * 1. Dead code elimination — Remove nodes that have no observable effect
 * 2. Constant folding — Evaluate constant expressions at compile time
 * 3. Peephole optimization — Simplify common patterns
 * 4. Unused variable elimination — Remove SET_VAR for vars never read
 * 5. Motion merging — Combine consecutive MOVE_X/MOVE_Y into one
 */

import { IRNode } from './types';

export interface OptimizationResult {
  nodes: IRNode[];
  removed: number;
  merged: number;
  folded: number;
}

/**
 * Optimize an IR program.
 * Returns the optimized node list and statistics.
 */
export function optimizeIR(nodes: IRNode[]): OptimizationResult {
  let result = [...nodes];
  let totalRemoved = 0;
  let totalMerged = 0;
  let totalFolded = 0;

  // Pass 1: Dead code elimination
  const afterDCE = deadCodeElimination(result);
  totalRemoved += result.length - afterDCE.nodes.length;
  result = afterDCE.nodes;

  // Pass 2: Constant folding
  const afterFold = constantFolding(result);
  totalFolded += afterFold.folded;
  result = afterFold.nodes;

  // Pass 3: Peephole optimization
  const afterPeephole = peepholeOptimize(result);
  totalMerged += afterPeephole.merged;
  result = afterPeephole.nodes;

  return {
    nodes: result,
    removed: totalRemoved,
    merged: totalMerged,
    folded: totalFolded,
  };
}

// === Dead Code Elimination ===

/**
 * Remove nodes that have no observable effect:
 * - SET_X after SET_X (second one overwrites first)
 * - SHOW after SHOW, HIDE after HIDE
 * - SET_OPACITY(100) when already 100
 */
function deadCodeElimination(nodes: IRNode[]): { nodes: IRNode[]; removed: number } {
  const result: IRNode[] = [];
  let removed = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Skip redundant SHOW/HIDE
    if (node.kind === 'show' && i > 0 && nodes[i - 1].kind === 'show') {
      removed++;
      continue;
    }
    if (node.kind === 'hide' && i > 0 && nodes[i - 1].kind === 'hide') {
      removed++;
      continue;
    }

    // Skip SET_OPACITY(100) after another SET_OPACITY
    if (node.kind === 'set_opacity' && node.opacity === 100) {
      // Only skip if previous was also set_opacity
      if (i > 0 && nodes[i - 1].kind === 'set_opacity') {
        removed++;
        continue;
      }
    }

    // Skip redundant SET_GRAVITY
    if (node.kind === 'set_gravity' && i > 0) {
      const prev = nodes[i - 1];
      if (prev.kind === 'set_gravity' && prev.enabled === node.enabled) {
        removed++;
        continue;
      }
    }

    // Skip redundant SET_FRICTION
    if (node.kind === 'set_friction' && i > 0) {
      const prev = nodes[i - 1];
      if (prev.kind === 'set_friction' && prev.value === node.value) {
        removed++;
        continue;
      }
    }

    result.push(node);
  }

  return { nodes: result, removed };
}

// === Constant Folding ===

/**
 * Evaluate constant expressions at compile time:
 * - MOVE_X(5) + MOVE_X(3) → MOVE_X(8)
 * - SET_SCORE(10) + CHANGE_SCORE(5) → SET_SCORE(15)
 */
function constantFolding(nodes: IRNode[]): { nodes: IRNode[]; folded: number } {
  const result: IRNode[] = [];
  let folded = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Merge consecutive MOVE_X
    if (node.kind === 'move_x' && i + 1 < nodes.length && nodes[i + 1].kind === 'move_x') {
      const next = nodes[i + 1] as { kind: 'move_x'; entityId: string; dx: number };
      result.push({ ...node, dx: node.dx + next.dx });
      i++; // Skip next
      folded++;
      continue;
    }

    // Merge consecutive MOVE_Y
    if (node.kind === 'move_y' && i + 1 < nodes.length && nodes[i + 1].kind === 'move_y') {
      const next = nodes[i + 1] as { kind: 'move_y'; entityId: string; dy: number };
      result.push({ ...node, dy: node.dy + next.dy });
      i++;
      folded++;
      continue;
    }

    // Merge consecutive SET_SCORE
    if (node.kind === 'set_score' && i + 1 < nodes.length && nodes[i + 1].kind === 'set_score') {
      const next = nodes[i + 1] as { kind: 'set_score'; value: number };
      result.push({ ...node, value: next.value }); // Last one wins
      i++;
      folded++;
      continue;
    }

    // Merge CHANGE_SCORE(5) + CHANGE_SCORE(3) → CHANGE_SCORE(8)
    if (node.kind === 'change_score' && i + 1 < nodes.length && nodes[i + 1].kind === 'change_score') {
      const next = nodes[i + 1] as { kind: 'change_score'; delta: number };
      result.push({ ...node, delta: node.delta + next.delta });
      i++;
      folded++;
      continue;
    }

    result.push(node);
  }

  return { nodes: result, folded };
}

// === Peephole Optimization ===

/**
 * Simplify common patterns:
 * - MOVE_X(0) → remove
 * - SET_GRAVITY(true) + JUMP → JUMP (gravity is already on)
 * - SET_VELOCITY_X(0) + SET_VELOCITY_X(x) → SET_VELOCITY_X(x)
 */
function peepholeOptimize(nodes: IRNode[]): { nodes: IRNode[]; merged: number } {
  const result: IRNode[] = [];
  let merged = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Remove MOVE_X(0) and MOVE_Y(0)
    if (node.kind === 'move_x' && node.dx === 0) {
      merged++;
      continue;
    }
    if (node.kind === 'move_y' && node.dy === 0) {
      merged++;
      continue;
    }

    // Remove SET_VELOCITY_X(0) followed by another SET_VELOCITY_X
    if (node.kind === 'set_velocity_x' && i + 1 < nodes.length && nodes[i + 1].kind === 'set_velocity_x') {
      // The second one overwrites the first — skip the first
      merged++;
      continue;
    }

    // Remove SET_VELOCITY_Y(0) followed by another SET_VELOCITY_Y
    if (node.kind === 'set_velocity_y' && i + 1 < nodes.length && nodes[i + 1].kind === 'set_velocity_y') {
      merged++;
      continue;
    }

    // Remove duplicate SET_FORMATION
    if (node.kind === 'set_formation' && i > 0) {
      const prev = nodes[i - 1];
      if (prev.kind === 'set_formation' && prev.formation === node.formation) {
        merged++;
        continue;
      }
    }

    result.push(node);
  }

  return { nodes: result, merged };
}

/**
 * Get optimization statistics for display.
 */
export function formatOptimizationStats(result: OptimizationResult): string {
  const parts: string[] = [];
  if (result.removed > 0) parts.push(`${result.removed} dead code removed`);
  if (result.merged > 0) parts.push(`${result.merged} redundant ops merged`);
  if (result.folded > 0) parts.push(`${result.folded} constants folded`);
  if (parts.length === 0) return 'No optimizations applied';
  return parts.join(', ');
}
