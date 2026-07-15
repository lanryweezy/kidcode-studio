import { InventoryItem } from '../types/game';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ItemEffect {
  type: 'heal' | 'speed' | 'shield' | 'damage' | 'teleport' | 'damage_over_time';
  value: number;
  duration?: number;
}

export interface EquipmentSlots {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  accessory: InventoryItem | null;
}

export interface InventoryState {
  items: InventoryItem[];
  maxSlots: number;
  equipment: EquipmentSlots;
  equippedActiveEffects: ItemEffect[];
}

const RARITY_ORDER: Record<ItemRarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const EQUIPMENT_SLOTS_BY_TYPE: Record<string, keyof EquipmentSlots> = {
  weapon: 'weapon',
  armor: 'armor',
  accessory: 'accessory',
};

let inventoryState: InventoryState = {
  items: [],
  maxSlots: 20,
  equipment: { weapon: null, armor: null, accessory: null },
  equippedActiveEffects: [],
};

export function getInventoryState(): InventoryState {
  return { ...inventoryState };
}

export function setInventoryState(state: InventoryState): void {
  inventoryState = { ...state, items: [...state.items], equipment: { ...state.equipment } };
}

export function resetInventoryState(): void {
  inventoryState = {
    items: [],
    maxSlots: 20,
    equipment: { weapon: null, armor: null, accessory: null },
    equippedActiveEffects: [],
  };
}

export function getItemCount(inventory: InventoryState): number {
  return inventory.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getStackedItem(items: InventoryItem[], item: InventoryItem): InventoryItem | undefined {
  return items.find(i =>
    i.name === item.name &&
    i.type === item.type &&
    i.icon === item.icon &&
    i.quantity < i.maxStack
  );
}

export function addItem(inventory: InventoryState, item: InventoryItem): { success: boolean; message: string; state: InventoryState } {
  const newState: InventoryState = {
    ...inventory,
    items: [...inventory.items],
    equipment: { ...inventory.equipment },
  };

  const existingStack = getStackedItem(newState.items, item);
  if (existingStack) {
    const spaceAvailable = existingStack.maxStack - existingStack.quantity;
    const toAdd = Math.min(item.quantity, spaceAvailable);
    existingStack.quantity += toAdd;
    const remainder = item.quantity - toAdd;
    if (remainder > 0) {
      if (newState.items.length >= newState.maxSlots) {
        return { success: false, message: 'Inventory full', state: newState };
      }
      newState.items.push({ ...item, quantity: remainder });
    }
    return { success: true, message: toAdd === item.quantity ? 'Item stacked' : 'Item partially stacked', state: newState };
  }

  if (newState.items.length >= newState.maxSlots) {
    return { success: false, message: 'Inventory full', state: newState };
  }

  newState.items.push({ ...item });
  return { success: true, message: 'Item added', state: newState };
}

export function removeItem(inventory: InventoryState, itemName: string, quantity: number = 1): { success: boolean; state: InventoryState } {
  const newState: InventoryState = {
    ...inventory,
    items: [...inventory.items],
    equipment: { ...inventory.equipment },
  };

  const idx = newState.items.findIndex(i => i.name === itemName);
  if (idx === -1) return { success: false, state: newState };

  const item = newState.items[idx];
  if (item.quantity <= quantity) {
    newState.items.splice(idx, 1);
  } else {
    item.quantity -= quantity;
  }
  return { success: true, state: newState };
}

export function getItemRarity(item: InventoryItem): ItemRarity {
  const meta = (item as { rarity?: ItemRarity }).rarity;
  return meta || 'common';
}

export function sortInventoryByRarity(inventory: InventoryState): InventoryState {
  const sorted = [...inventory.items].sort((a, b) => {
    return RARITY_ORDER[getItemRarity(b)] - RARITY_ORDER[getItemRarity(a)];
  });
  return { ...inventory, items: sorted };
}

export function equipItem(inventory: InventoryState, itemId: string): { success: boolean; message: string; state: InventoryState } {
  const newState: InventoryState = {
    ...inventory,
    items: [...inventory.items],
    equipment: {
      weapon: inventory.equipment.weapon ? { ...inventory.equipment.weapon } : null,
      armor: inventory.equipment.armor ? { ...inventory.equipment.armor } : null,
      accessory: inventory.equipment.accessory ? { ...inventory.equipment.accessory } : null,
    },
    equippedActiveEffects: [...inventory.equippedActiveEffects],
  };

  const itemIdx = newState.items.findIndex(i => i.id === itemId);
  if (itemIdx === -1) return { success: false, message: 'Item not found', state: newState };

  const item = newState.items[itemIdx];
  const slotName = EQUIPMENT_SLOTS_BY_TYPE[item.type];
  if (!slotName) return { success: false, message: 'Item is not equippable', state: newState };

  const prevEquipped = newState.equipment[slotName];
  if (prevEquipped) {
    newState.items.push({ ...prevEquipped });
  }

  newState.items.splice(itemIdx, 1);
  newState.equipment[slotName] = { ...item };

  if (item.effect) {
    const effect: ItemEffect = {
      type: item.effect.type as ItemEffect['type'],
      value: item.effect.value,
      duration: item.effect.duration,
    };
    newState.equippedActiveEffects.push(effect);
  }

  return { success: true, message: `Equipped ${item.name}`, state: newState };
}

export function unequipItem(inventory: InventoryState, slot: keyof EquipmentSlots): { success: boolean; state: InventoryState } {
  const newState: InventoryState = {
    ...inventory,
    items: [...inventory.items],
    equipment: {
      weapon: inventory.equipment.weapon ? { ...inventory.equipment.weapon } : null,
      armor: inventory.equipment.armor ? { ...inventory.equipment.armor } : null,
      accessory: inventory.equipment.accessory ? { ...inventory.equipment.accessory } : null,
    },
    equippedActiveEffects: [...inventory.equippedActiveEffects],
  };

  const equipped = newState.equipment[slot];
  if (!equipped) return { success: false, state: newState };

  if (newState.items.length >= newState.maxSlots) {
    return { success: false, state: newState };
  }

  newState.items.push({ ...equipped });
  newState.equipment[slot] = null;

  if (equipped.effect) {
    newState.equippedActiveEffects = newState.equippedActiveEffects.filter(
      e => !(e.type === equipped.effect!.type && e.value === equipped.effect!.value)
    );
  }

  return { success: true, state: newState };
}

export function getItemTooltip(item: InventoryItem): string {
  const rarity = getItemRarity(item);
  const lines: string[] = [
    `[${rarity.toUpperCase()}] ${item.name}`,
    item.description,
    `Type: ${item.type}`,
    `Quantity: ${item.quantity}/${item.maxStack}`,
  ];

  if (item.effect) {
    const effectStr = `${item.effect.type}: ${item.effect.value}`;
    const durStr = item.effect.duration ? ` (${item.effect.duration}s)` : '';
    lines.push(`Effect: ${effectStr}${durStr}`);
  }

  if (item.craftable && item.recipe) {
    lines.push(`Craftable with: ${item.recipe.map(r => `${r.itemId} x${r.quantity}`).join(', ')}`);
  }

  return lines.join('\n');
}

export function getTotalStats(inventory: InventoryState): { attackBonus: number; defenseBonus: number; speedBonus: number } {
  let attackBonus = 0;
  let defenseBonus = 0;
  let speedBonus = 0;

  for (const effect of inventory.equippedActiveEffects) {
    switch (effect.type) {
      case 'damage': attackBonus += effect.value; break;
      case 'shield': defenseBonus += effect.value; break;
      case 'speed': speedBonus += effect.value; break;
    }
  }

  return { attackBonus, defenseBonus, speedBonus };
}
