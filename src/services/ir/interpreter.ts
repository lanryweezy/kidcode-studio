/**
 * IR Interpreter — Executes typed IR nodes against game state.
 * 
 * Both the interpreter and code generator read from the SAME IR types.
 * If the IR node has a field, both paths use it. If it doesn't, neither does.
 */

import { IRNode } from './types';
import { dispatchIRNode } from './handlers';
import type { ExecutionContext } from './context';

export type { ExecutionContext } from './context';

/**
 * Execute a single IR node against the game state.
 * Returns true if the node was handled, false otherwise.
 */
export async function executeIRNode(node: IRNode, ctx: ExecutionContext): Promise<boolean> {
  return dispatchIRNode(node, ctx);
}
