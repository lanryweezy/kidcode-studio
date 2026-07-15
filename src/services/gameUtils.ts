/**
 * Shared Game Utilities
 * Extracted from duplicated patterns across the codebase
 */

// ─── Console Logging ───
// Replaces 30+ duplicate setConsoleLogs patterns

export type ConsoleLogger = React.Dispatch<React.SetStateAction<string[]>>;

export function logToConsole(logger: ConsoleLogger, message: string, maxLines: number = 50): void {
  logger(prev => [...prev, message].slice(-maxLines));
}

// ─── Entity Proximity ───
// Replaces 5+ duplicate Math.abs proximity checks

export function isNearEntity(
  x1: number, y1: number,
  x2: number, y2: number,
  range: number = 30
): boolean {
  return Math.hypot(x2 - x1, y2 - y1) < range;
}

export function isNearEntityRect(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

export function distanceBetween(
  x1: number, y1: number,
  x2: number, y2: number
): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

// ─── Sprite State Adapter ───
// Replaces 3 duplicate setSpriteState adapter patterns

export function createSpriteStateAdapter<T>(
  updateFn: (state: T) => void,
  currentState: T
): (state: T | ((prev: T) => T)) => void {
  return (state: T | ((prev: T) => T)) => {
    if (typeof state === 'function') {
      updateFn((state as (prev: T) => T)(currentState));
    } else {
      updateFn(state);
    }
  };
}

// ─── Collision Helpers ───
// Replaces duplicated AABB collision checks

export function aabbCollision(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

export function circleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return dist < r1 + r2;
}

// ─── Inventory Helpers ───
// Replaces hand-rolled inventory manipulation

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  maxStack: number;
}

export function addItemsToInventory(
  inventory: InventoryItem[],
  itemId: string,
  itemName: string,
  itemIcon: string,
  quantity: number,
  maxStack: number = 99,
  maxInventorySize: number = 30
): InventoryItem[] {
  const newInventory = [...inventory];
  const existing = newInventory.find(i => i.id === itemId);

  if (existing && existing.quantity < maxStack) {
    existing.quantity = Math.min(maxStack, existing.quantity + quantity);
  } else if (newInventory.length < maxInventorySize) {
    newInventory.push({
      id: itemId,
      name: itemName,
      icon: itemIcon,
      quantity,
      maxStack,
    });
  }

  return newInventory;
}

export function removeItemsFromInventory(
  inventory: InventoryItem[],
  itemId: string,
  quantity: number
): InventoryItem[] {
  return inventory
    .map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity - quantity };
      }
      return item;
    })
    .filter(item => item.quantity > 0);
}

export function hasItem(inventory: InventoryItem[], itemId: string, quantity: number = 1): boolean {
  const item = inventory.find(i => i.id === itemId);
  return item ? item.quantity >= quantity : false;
}

// ─── Clamp & Lerp ───
// Common math utilities

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// ─── String Helpers ───

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// ─── Color Helpers ───

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
}

// ─── Array Helpers ───

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function uniqueById<T extends { id: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// ─── Time Helpers ───

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}
