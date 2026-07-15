import { IRNode } from '../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound } = ctx;

  switch (node.kind) {
    case 'swap_tiles':
      playSound?.('click');
      return true;
    case 'rotate_block':
      state.rotation += node.degrees;
      playSound?.('click');
      return true;
    case 'slide_puzzle':
      playSound?.('click');
      return true;
    case 'fill_color':
      state.variables['_fill_color'] = node.color;
      playSound?.('powerup');
      return true;
    case 'connect_dots':
      playSound?.('click');
      return true;
    case 'sort_items':
      playSound?.('powerup');
      return true;
    case 'unlock_pattern':
      state.variables['_pattern_unlocked'] = true;
      playSound?.('victory');
      return true;
    case 'mirror_puzzle':
      playSound?.('click');
      return true;
    case 'flip_card':
      playSound?.('click');
      return true;
    case 'check_match':
      playSound?.('powerup');
      return true;

    default:
      return false;
  }
}
