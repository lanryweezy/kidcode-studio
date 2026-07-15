import { IRNode } from '../types';
import { ExecutionContext } from '../context';
import { handleIRNode as handleSports } from './sportsHandlers';
import { handleIRNode as handleAction } from './actionHandlers';
import { handleIRNode as handleAdventure } from './adventureHandlers';
import { handleIRNode as handleShooter } from './shooterHandlers';
import { handleIRNode as handleSurvival } from './survivalHandlers';
import { handleIRNode as handlePuzzle } from './puzzleHandlers';
import { handleIRNode as handleRacing } from './racingHandlers';
import { handleIRNode as handleCore } from './coreHandlers';

export function dispatchIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  if (handleSports(node, ctx)) return true;
  if (handleAction(node, ctx)) return true;
  if (handleAdventure(node, ctx)) return true;
  if (handleShooter(node, ctx)) return true;
  if (handleSurvival(node, ctx)) return true;
  if (handlePuzzle(node, ctx)) return true;
  if (handleRacing(node, ctx)) return true;
  if (handleCore(node, ctx)) return true;
  return false;
}
