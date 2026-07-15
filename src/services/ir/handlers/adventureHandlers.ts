import { IRNode } from '../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound, setNpcChat } = ctx;

  switch (node.kind) {
    case 'examine':
      if (setNpcChat) setNpcChat({ name: 'System', message: `You examine the ${node.target}...` });
      return true;
    case 'use_item': {
      const inv = state.inventory;
      const uIdx = inv.findIndex(i => i.name.toLowerCase().includes(node.item.toLowerCase()));
      if (uIdx >= 0) {
        if (inv[uIdx].effect?.type === 'heal') {
          state.health = Math.min(state.maxHealth, state.health + (inv[uIdx].effect?.value || 0));
        }
        inv[uIdx].quantity--;
        if (inv[uIdx].quantity <= 0) inv.splice(uIdx, 1);
        playSound?.('powerup');
      }
      return true;
    }
    case 'combine_items': {
      const inv2 = state.inventory;
      const idx1 = inv2.findIndex(i => i.name.toLowerCase().includes(node.item1.toLowerCase()));
      const idx2 = inv2.findIndex(i => i.name.toLowerCase().includes(node.item2.toLowerCase()));
      if (idx1 >= 0 && idx2 >= 0) {
        inv2[idx1].quantity--;
        inv2[idx2].quantity--;
        if (inv2[idx1].quantity <= 0) inv2.splice(idx1, 1);
        if (inv2[idx2] && inv2[idx2].quantity <= 0) inv2.splice(idx2, 1);
        inv2.push({ id: crypto.randomUUID(), name: 'Combined Item', icon: '🔨', type: 'weapon', quantity: 1, maxStack: 1, description: 'Crafted from two items' });
        playSound?.('powerup');
      }
      return true;
    }
    case 'talk_to':
      if (setNpcChat) setNpcChat({ name: node.npc, message: 'Hello there!' });
      return true;
    case 'add_quest':
      state.variables['_quest'] = node.name;
      return true;
    case 'complete_quest':
      state.variables['_quest_complete'] = true;
      state.score += 500;
      playSound?.('victory');
      return true;
    case 'discover':
      state.variables['_discovered'] = node.location;
      state.score += 100;
      playSound?.('powerup');
      return true;
    case 'trigger_puzzle':
      if (setNpcChat) setNpcChat({ name: 'Puzzle', message: `Solve the ${node.type}!` });
      return true;

    default:
      return false;
  }
}
