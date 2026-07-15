import { IRNode } from '../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound } = ctx;

  switch (node.kind) {
    case 'gather': {
      const currentRes = Number(state.variables[node.resource] || 0);
      state.variables[node.resource] = currentRes + node.amount;
      playSound?.('hit');
      return true;
    }
    case 'craft': {
      const wood = Number(state.variables['wood'] || 0);
      if (wood >= node.cost) {
        state.variables['wood'] = wood - node.cost;
        state.variables[`_crafted_${node.item}`] = true;
        playSound?.('powerup');
      }
      return true;
    }
    case 'eat': {
      const hunger = Number(state.variables['hunger'] || 0);
      state.variables['hunger'] = Math.min(100, hunger + node.amount);
      playSound?.('powerup');
      return true;
    }
    case 'drink': {
      const water = Number(state.variables['fresh_water'] || state.variables['hydration'] || 0);
      state.variables['fresh_water'] = Math.min(100, water + node.amount);
      playSound?.('powerup');
      return true;
    }
    case 'build': {
      const buildWood = Number(state.variables['wood'] || 0);
      if (buildWood >= node.cost) {
        state.variables['wood'] = buildWood - node.cost;
        state.variables[`_built_${node.structure}`] = true;
        state.items.push({
          id: crypto.randomUUID(),
          x: state.x + 40, y: state.y,
          type: 'item', emoji: '🏠', width: 40, height: 40
        });
        playSound?.('hit');
      }
      return true;
    }
    case 'place_torch':
      state.items.push({ id: crypto.randomUUID(), x: state.x, y: state.y - 20, type: 'item', emoji: '🔥', width: 16, height: 16 });
      return true;
    case 'shelter': {
      const shelterLevel = Number(state.variables['_shelter_level'] || 0);
      state.variables['_shelter_level'] = shelterLevel + node.level;
      playSound?.('powerup');
      return true;
    }

    default:
      return false;
  }
}
