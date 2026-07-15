import { IRNode } from '../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound } = ctx;

  switch (node.kind) {
    case 'boost':
      state.vx += node.force;
      state.powerups.speed = 30;
      playSound?.('powerup');
      return true;
    case 'drift':
      state.vx *= 0.5;
      state.vy += node.angle;
      playSound?.('dash');
      return true;
    case 'lap_complete': {
      const laps = Number(state.variables['laps'] || 0);
      state.variables['laps'] = laps + 1;
      state.score += 100;
      playSound?.('victory');
      return true;
    }
    case 'start_race':
      state.variables['_race_started'] = true;
      return true;
    case 'set_checkpoint':
      state.variables['_checkpoint'] = true;
      playSound?.('coin');
      return true;
    case 'upgrade_car': {
      const val = Number(state.variables[`_car_${node.stat}`] || 0);
      state.variables[`_car_${node.stat}`] = val + node.amount;
      playSound?.('powerup');
      return true;
    }
    case 'pit_stop':
      state.health = state.maxHealth;
      playSound?.('powerup');
      return true;
    case 'use_boost_pad':
      state.vx += 15;
      state.effectTrigger = { type: 'sparkle', x: state.x, y: state.y, color: '#f97316' };
      playSound?.('powerup');
      return true;

    default:
      return false;
  }
}
