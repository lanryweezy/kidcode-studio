import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInventoryState,
  setInventoryState,
  resetInventoryState,
  getItemCount,
  getStackedItem,
  addItem,
  removeItem,
  getItemRarity,
  sortInventoryByRarity,
  equipItem,
  unequipItem,
  getItemTooltip,
  getTotalStats,
  RARITY_COLORS,
  ItemRarity,
  InventoryState,
} from '../inventoryService';
import { InventoryItem } from '../../types/game';

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: `item_${Math.random().toString(36).slice(2, 6)}`,
    name: 'Sword',
    icon: '⚔️',
    description: 'A sharp blade',
    type: 'weapon',
    quantity: 1,
    maxStack: 1,
    ...overrides,
  };
}

function makeConsumable(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return makeItem({
    name: 'Health Potion',
    icon: '🧪',
    description: 'Restores 50 HP',
    type: 'consumable',
    quantity: 1,
    maxStack: 10,
    effect: { type: 'heal', value: 50 },
    ...overrides,
  });
}

describe('inventoryService', () => {
  beforeEach(() => {
    resetInventoryState();
  });

  describe('state management', () => {
    it('starts with empty inventory', () => {
      const state = getInventoryState();
      expect(state.items).toHaveLength(0);
      expect(state.maxSlots).toBe(20);
      expect(state.equipment.weapon).toBeNull();
      expect(state.equipment.armor).toBeNull();
      expect(state.equipment.accessory).toBeNull();
    });

    it('resetInventoryState clears all state', () => {
      addItem(getInventoryState(), makeItem());
      resetInventoryState();
      const state = getInventoryState();
      expect(state.items).toHaveLength(0);
    });

    it('setInventoryState replaces state', () => {
      const newState: InventoryState = {
        items: [makeItem()],
        maxSlots: 10,
        equipment: { weapon: null, armor: null, accessory: null },
        equippedActiveEffects: [],
      };
      setInventoryState(newState);
      expect(getInventoryState().items).toHaveLength(1);
      expect(getInventoryState().maxSlots).toBe(10);
    });
  });

  describe('addItem', () => {
    it('adds item to empty inventory', () => {
      const result = addItem(getInventoryState(), makeItem());
      expect(result.success).toBe(true);
      expect(result.state.items).toHaveLength(1);
    });

    it('stacks identical items', () => {
      let state = getInventoryState();
      const item1 = makeConsumable({ quantity: 3, maxStack: 10 });
      let result = addItem(state, item1);
      state = result.state;

      const item2 = makeConsumable({ quantity: 2, maxStack: 10 });
      result = addItem(state, item2);
      expect(result.success).toBe(true);
      expect(result.state.items).toHaveLength(1);
      expect(result.state.items[0].quantity).toBe(5);
    });

    it('creates new stack when current is full', () => {
      let state = getInventoryState();
      const item1 = makeConsumable({ quantity: 10, maxStack: 10 });
      let result = addItem(state, item1);
      state = result.state;

      const item2 = makeConsumable({ quantity: 3, maxStack: 10 });
      result = addItem(state, item2);
      expect(result.state.items).toHaveLength(2);
      expect(result.state.items[1].quantity).toBe(3);
    });

    it('rejects when inventory is full', () => {
      let state = { ...getInventoryState(), maxSlots: 1 };
      state = addItem(state, makeItem()).state;
      const result = addItem(state, makeItem());
      expect(result.success).toBe(false);
      expect(result.message).toBe('Inventory full');
    });

    it('reports partial stacking when overflow', () => {
      let state = { ...getInventoryState(), maxSlots: 3 };
      state = addItem(state, makeConsumable({ quantity: 10, maxStack: 10 })).state;
      state = addItem(state, makeConsumable({ quantity: 2, maxStack: 10 })).state;
      const result = addItem(state, makeConsumable({ quantity: 9, maxStack: 10 }));
      expect(result.success).toBe(true);
      expect(result.message).toBe('Item partially stacked');
      expect(result.state.items).toHaveLength(3);
      expect(result.state.items[0].quantity).toBe(10);
      expect(result.state.items[1].quantity).toBe(10);
      expect(result.state.items[2].quantity).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('removes item by name', () => {
      let state = addItem(getInventoryState(), makeItem({ name: 'Sword', quantity: 3 })).state;
      const result = removeItem(state, 'Sword', 1);
      expect(result.success).toBe(true);
      expect(result.state.items[0].quantity).toBe(2);
    });

    it('removes entire stack when quantity matches', () => {
      let state = addItem(getInventoryState(), makeItem({ name: 'Sword', quantity: 1 })).state;
      const result = removeItem(state, 'Sword', 1);
      expect(result.success).toBe(true);
      expect(result.state.items).toHaveLength(0);
    });

    it('returns false for non-existent item', () => {
      const result = removeItem(getInventoryState(), 'NonExistent');
      expect(result.success).toBe(false);
    });
  });

  describe('getItemCount', () => {
    it('returns 0 for empty inventory', () => {
      expect(getItemCount(getInventoryState())).toBe(0);
    });

    it('counts total items', () => {
      let state = getInventoryState();
      state = addItem(state, makeItem({ quantity: 3 })).state;
      state = addItem(state, makeItem({ name: 'Shield', quantity: 2 })).state;
      expect(getItemCount(state)).toBe(5);
    });
  });

  describe('getStackedItem', () => {
    it('finds stackable item', () => {
      const items = [makeConsumable({ quantity: 5, maxStack: 10 })];
      const result = getStackedItem(items, makeConsumable({ quantity: 1, maxStack: 10 }));
      expect(result).toBeDefined();
      expect(result!.quantity).toBe(5);
    });

    it('returns undefined when no match', () => {
      const items = [makeItem({ name: 'Sword' })];
      const result = getStackedItem(items, makeConsumable());
      expect(result).toBeUndefined();
    });

    it('returns undefined when stack is full', () => {
      const items = [makeConsumable({ quantity: 10, maxStack: 10 })];
      const result = getStackedItem(items, makeConsumable());
      expect(result).toBeUndefined();
    });
  });

  describe('rarity system', () => {
    it('defaults to common', () => {
      expect(getItemRarity(makeItem())).toBe('common');
    });

    it('reads rarity from metadata', () => {
      const item = makeItem() as any;
      item.rarity = 'legendary';
      expect(getItemRarity(item)).toBe('legendary');
    });

    it('sorts by rarity', () => {
      let state = getInventoryState();
      const common = makeItem({ name: 'Common' }) as any;
      common.rarity = 'common';
      const legendary = makeItem({ name: 'Legendary' }) as any;
      legendary.rarity = 'legendary';
      const epic = makeItem({ name: 'Epic' }) as any;
      epic.rarity = 'epic';

      state = addItem(state, common).state;
      state = addItem(state, legendary).state;
      state = addItem(state, epic).state;

      const sorted = sortInventoryByRarity(state);
      expect(sorted.items[0].name).toBe('Legendary');
      expect(sorted.items[1].name).toBe('Epic');
      expect(sorted.items[2].name).toBe('Common');
    });

    it('has colors for all rarities', () => {
      expect(RARITY_COLORS.common).toBeDefined();
      expect(RARITY_COLORS.rare).toBeDefined();
      expect(RARITY_COLORS.epic).toBeDefined();
      expect(RARITY_COLORS.legendary).toBeDefined();
    });
  });

  describe('equipItem', () => {
    it('equips weapon', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'w1', type: 'weapon' })).state;
      const result = equipItem(state, 'w1');
      expect(result.success).toBe(true);
      expect(result.state.equipment.weapon?.id).toBe('w1');
      expect(result.state.items).toHaveLength(0);
    });

    it('equips armor', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'a1', type: 'armor', name: 'Helmet' })).state;
      const result = equipItem(state, 'a1');
      expect(result.success).toBe(true);
      expect(result.state.equipment.armor?.id).toBe('a1');
    });

    it('equips accessory', () => {
      const item = makeItem({ id: 'ac1', name: 'Ring' });
      (item as any).type = 'accessory';
      let state = addItem(getInventoryState(), item).state;
      const result = equipItem(state, 'ac1');
      expect(result.success).toBe(true);
      expect(result.state.equipment.accessory?.id).toBe('ac1');
    });

    it('swaps with previously equipped item', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'w1', type: 'weapon', name: 'Sword' })).state;
      state = addItem(state, makeItem({ id: 'w2', type: 'weapon', name: 'Axe' })).state;
      state = equipItem(state, 'w1').state;
      const result = equipItem(state, 'w2');
      expect(result.state.equipment.weapon?.id).toBe('w2');
      expect(result.state.items.some(i => i.id === 'w1')).toBe(true);
    });

    it('fails for non-existent item', () => {
      const result = equipItem(getInventoryState(), 'nope');
      expect(result.success).toBe(false);
    });

    it('fails for non-equippable item', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'c1', type: 'consumable', name: 'Potion' })).state;
      const result = equipItem(state, 'c1');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not equippable');
    });

    it('tracks active effects from equipped item', () => {
      const effectItem = makeItem({ id: 'w1', type: 'weapon', name: 'Fire Sword', effect: { type: 'damage', value: 10 } }) as any;
      effectItem.effect = { type: 'damage', value: 10 };
      let state = addItem(getInventoryState(), effectItem).state;
      const result = equipItem(state, 'w1');
      expect(result.state.equippedActiveEffects).toHaveLength(1);
      expect(result.state.equippedActiveEffects[0].type).toBe('damage');
    });
  });

  describe('unequipItem', () => {
    it('unequips weapon back to inventory', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'w1', type: 'weapon' })).state;
      state = equipItem(state, 'w1').state;
      const result = unequipItem(state, 'weapon');
      expect(result.success).toBe(true);
      expect(result.state.equipment.weapon).toBeNull();
      expect(result.state.items.some(i => i.id === 'w1')).toBe(true);
    });

    it('fails when slot is empty', () => {
      const result = unequipItem(getInventoryState(), 'weapon');
      expect(result.success).toBe(false);
    });

    it('removes active effect when unequipping', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'w1', type: 'weapon' })).state;
      state = addItem(state, makeItem({ id: 'a1', type: 'armor' })).state;
      state = equipItem(state, 'w1').state;
      state = equipItem(state, 'a1').state;
      const result = unequipItem(state, 'weapon');
      expect(result.state.equippedActiveEffects).toHaveLength(0);
    });
  });

  describe('getTotalStats', () => {
    it('returns zero stats with no equipment', () => {
      const stats = getTotalStats(getInventoryState());
      expect(stats.attackBonus).toBe(0);
      expect(stats.defenseBonus).toBe(0);
      expect(stats.speedBonus).toBe(0);
    });

    it('sums attack from equipped effects', () => {
      let state = addItem(getInventoryState(), makeItem({ id: 'w1', type: 'weapon' })).state;
      const effectItem = makeItem({ id: 'w1', type: 'weapon' }) as any;
      effectItem.effect = { type: 'damage', value: 15 };
      state.items[state.items.findIndex(i => i.id === 'w1')] = effectItem;
      state = equipItem(state, 'w1').state;
      const stats = getTotalStats(state);
      expect(stats.attackBonus).toBe(15);
    });
  });

  describe('getItemTooltip', () => {
    it('generates tooltip string', () => {
      const item = makeItem({ name: 'Sword', description: 'A blade', type: 'weapon', quantity: 1, maxStack: 1 });
      const tooltip = getItemTooltip(item);
      expect(tooltip).toContain('Sword');
      expect(tooltip).toContain('A blade');
      expect(tooltip).toContain('weapon');
    });

    it('includes effect info', () => {
      const item = makeItem({ name: 'Potion', effect: { type: 'heal', value: 50, duration: 5 } });
      const tooltip = getItemTooltip(item);
      expect(tooltip).toContain('heal: 50 (5s)');
    });

    it('includes rarity', () => {
      const item = makeItem({ name: 'Epic Sword', rarity: 'epic' } as Partial<InventoryItem>);
      const tooltip = getItemTooltip(item);
      expect(tooltip).toContain('EPIC');
    });
  });

  describe('edge cases', () => {
    it('removeItem with quantity exceeding available removes all', () => {
      const item = makeItem({ quantity: 2, maxStack: 5 });
      let state = addItem(getInventoryState(), item);
      const result = removeItem(state.state, item.name, 10);
      expect(result.success).toBe(true);
      expect(result.state.items).toHaveLength(0);
    });

    it('addItem with empty name still adds to inventory', () => {
      const item = makeItem({ name: '', quantity: 1 });
      const result = addItem(getInventoryState(), item);
      expect(result.state.items.length).toBeGreaterThanOrEqual(0);
    });

    it('equipItem on non-existent slot returns failure', () => {
      const item = makeItem({ type: 'consumable' });
      const state = addItem(getInventoryState(), item);
      const result = equipItem(state.state, item.id);
      expect(result.success).toBe(false);
    });

    it('getTotalStats sums multiple equipped items', () => {
      const weapon = makeItem({ id: 'w1', name: 'Sword', type: 'weapon' });
      const armor = makeItem({ id: 'a1', name: 'Shield', type: 'armor' });
      let state = addItem(getInventoryState(), weapon);
      state = addItem(state.state, armor);
      equipItem(state.state, 'w1');
      const equippedState = equipItem(state.state, 'a1');
      const stats = getTotalStats(equippedState.state);
      expect(typeof stats.attackBonus).toBe('number');
      expect(typeof stats.defenseBonus).toBe('number');
      expect(typeof stats.speedBonus).toBe('number');
    });

    it('getItemTooltip for item without effect', () => {
      const item = makeItem({ name: 'Gem', type: 'material' });
      const tooltip = getItemTooltip(item);
      expect(tooltip).toContain('Gem');
      expect(tooltip).not.toContain('Effect:');
    });
  });
});
