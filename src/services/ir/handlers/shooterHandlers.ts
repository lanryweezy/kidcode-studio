import { IRNode } from '../types';
import { GameEntity } from '../../../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound } = ctx;

  switch (node.kind) {
    case 'reload':
      state.variables['_ammo'] = 30;
      playSound?.('click');
      return true;
    case 'throw_grenade': {
      const grenade: GameEntity = {
        id: crypto.randomUUID(),
        x: state.x, y: state.y,
        type: 'projectile', emoji: '💣', vx: 3, vy: -5, lifeTime: 60
      };
      state.projectiles.push(grenade);
      playSound?.('explosion');
      return true;
    }
    case 'take_cover':
      state.vx = 0;
      state.vy = 0;
      state.powerups.shield = 20;
      return true;
    case 'aim':
      state.scale = node.zoom * 0.5;
      return true;
    case 'swap_weapon':
      state.variables['_weapon'] = node.weapon;
      return true;
    case 'drop_weapon':
      state.variables['_weapon'] = null;
      return true;
    case 'pickup_weapon':
      state.variables['_weapon'] = node.weapon;
      playSound?.('powerup');
      return true;

    default:
      return false;
  }
}
