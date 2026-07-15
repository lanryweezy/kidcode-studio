export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
  maxQuantity: number;
  value: number;
  category: string;
}

export interface InventoryState {
  items: InventoryItem[];
  maxSlots: number;
}

export function createInventory(maxSlots: number = 20): InventoryState {
  return { items: [], maxSlots };
}

export function addItem(
  state: InventoryState,
  item: Omit<InventoryItem, 'quantity'>
): InventoryState {
  const existing = state.items.find(i => i.id === item.id);
  
  if (existing) {
    const newQty = Math.min(existing.quantity + 1, existing.maxQuantity);
    return {
      ...state,
      items: state.items.map(i =>
        i.id === item.id ? { ...i, quantity: newQty } : i
      ),
    };
  }

  if (state.items.length >= state.maxSlots) return state;

  return {
    ...state,
    items: [...state.items, { ...item, quantity: 1 }],
  };
}

export function removeItem(
  state: InventoryState,
  itemId: string,
  quantity: number = 1
): InventoryState {
  const item = state.items.find(i => i.id === itemId);
  if (!item || item.quantity < quantity) return state;

  const newQty = item.quantity - quantity;
  if (newQty <= 0) {
    return {
      ...state,
      items: state.items.filter(i => i.id !== itemId),
    };
  }

  return {
    ...state,
    items: state.items.map(i =>
      i.id === itemId ? { ...i, quantity: newQty } : i
    ),
  };
}

export function getItemCount(state: InventoryState, itemId: string): number {
  const item = state.items.find(i => i.id === itemId);
  return item?.quantity || 0;
}

export function getTotalValue(state: InventoryState): number {
  return state.items.reduce((sum, item) => sum + item.value * item.quantity, 0);
}

export function hasItem(state: InventoryState, itemId: string, quantity: number = 1): boolean {
  return getItemCount(state, itemId) >= quantity;
}
