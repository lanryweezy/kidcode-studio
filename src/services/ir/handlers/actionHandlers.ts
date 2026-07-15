import { IRNode } from '../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound } = ctx;

  switch (node.kind) {
    case 'swing_weapon': {
      state.enemies.forEach(e => {
        const dx = Math.abs(e.x - state.x);
        const dy = Math.abs(e.y - state.y);
        if (dx < 50 && dy < 50 && e.behavior !== 'teammate') {
          e.x += (e.x > state.x ? 30 : -30);
          e.y += (e.y > state.y ? 20 : -20);
        }
      });
      playSound?.('attack');
      return true;
    }
    case 'combo_attack': {
      for (let i = 0; i < node.hits; i++) {
        state.enemies.forEach(e => {
          const dx = Math.abs(e.x - state.x);
          const dy = Math.abs(e.y - state.y);
          if (dx < 60 && dy < 60 && e.behavior !== 'teammate') {
            e.x += (e.x > state.x ? 15 : -15);
          }
        });
      }
      playSound?.('attack');
      return true;
    }
    case 'dodge_roll':
      state.vx += (state.scale > 0 ? node.distance : -node.distance);
      playSound?.('dash');
      return true;
    case 'block_attack':
      state.powerups.shield = 30;
      return true;
    case 'special_move':
      state.enemies.forEach(e => {
        const dx = Math.abs(e.x - state.x);
        const dy = Math.abs(e.y - state.y);
        if (dx < 120 && dy < 120) {
          e.x += (e.x > state.x ? 80 : -80);
          e.y += (e.y > state.y ? 60 : -60);
        }
      });
      state.effectTrigger = { type: 'explosion', x: state.x, y: state.y, color: '#a855f7' };
      playSound?.('explosion');
      return true;
    case 'switch_weapon':
      state.variables['_weapon'] = node.weapon;
      return true;
    case 'charge_attack': {
      state.enemies.forEach(e => {
        const dx = Math.abs(e.x - state.x);
        const dy = Math.abs(e.y - state.y);
        if (dx < 80 && dy < 80 && e.behavior !== 'teammate') {
          e.x += (e.x > state.x ? 50 : -50);
        }
      });
      playSound?.('attack');
      return true;
    }

    default:
      return false;
  }
}
