import { describe, it, expect, vi } from 'vitest';
import {
  logToConsole,
  isNearEntity,
  isNearEntityRect,
  distanceBetween,
  aabbCollision,
  circleCollision,
  addItemsToInventory,
  removeItemsFromInventory,
  hasItem,
  clamp,
  lerp,
  randomRange,
  randomInt,
  capitalize,
  truncate,
  slugify,
  hexToRgb,
  rgbToHex,
  shuffleArray,
  uniqueById,
  formatDuration,
  formatTimestamp,
  createSpriteStateAdapter,
} from './gameUtils';

describe('gameUtils', () => {
  describe('logToConsole', () => {
    it('appends messages to the logger', () => {
      const logger = vi.fn();
      logToConsole(logger, 'Hello');
      expect(logger).toHaveBeenCalled();
    });
  });

  describe('isNearEntity', () => {
    it('returns true when within range', () => {
      expect(isNearEntity(0, 0, 10, 10, 30)).toBe(true);
    });

    it('returns false when out of range', () => {
      expect(isNearEntity(0, 0, 100, 100, 30)).toBe(false);
    });

    it('uses default range of 30', () => {
      expect(isNearEntity(0, 0, 20, 20)).toBe(true);
      expect(isNearEntity(0, 0, 50, 50)).toBe(false);
    });
  });

  describe('isNearEntityRect', () => {
    it('returns true for overlapping rects', () => {
      expect(isNearEntityRect(10, 10, 20, 20, 20, 20, 20, 20)).toBe(true);
    });

    it('returns false for non-overlapping rects', () => {
      expect(isNearEntityRect(0, 0, 10, 10, 100, 100, 10, 10)).toBe(false);
    });
  });

  describe('distanceBetween', () => {
    it('computes distance between two points', () => {
      expect(distanceBetween(0, 0, 3, 4)).toBe(5);
    });

    it('returns 0 for same point', () => {
      expect(distanceBetween(5, 5, 5, 5)).toBe(0);
    });
  });

  describe('aabbCollision', () => {
    it('returns true for overlapping boxes', () => {
      expect(aabbCollision(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true);
    });

    it('returns false for separate boxes', () => {
      expect(aabbCollision(0, 0, 5, 5, 10, 10, 5, 5)).toBe(false);
    });

    it('returns false for touching edges (no overlap)', () => {
      expect(aabbCollision(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false);
    });
  });

  describe('circleCollision', () => {
    it('returns true for overlapping circles', () => {
      expect(circleCollision(0, 0, 5, 3, 0, 5)).toBe(true);
    });

    it('returns false for separated circles', () => {
      expect(circleCollision(0, 0, 5, 20, 0, 5)).toBe(false);
    });

    it('returns false for touching edges', () => {
      expect(circleCollision(0, 0, 5, 10, 0, 5)).toBe(false);
    });
  });

  describe('addItemsToInventory', () => {
    it('adds new item to empty inventory', () => {
      const result = addItemsToInventory([], 'sword', 'Sword', '⚔️', 1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sword');
      expect(result[0].quantity).toBe(1);
    });

    it('stacks with existing item', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 2, maxStack: 10 }];
      const result = addItemsToInventory(inv, 'potion', 'Potion', '🧪', 3);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5);
    });

    it('does not exceed maxStack', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 8, maxStack: 10 }];
      const result = addItemsToInventory(inv, 'potion', 'Potion', '🧪', 5, 10);
      expect(result[0].quantity).toBe(10);
    });

    it('does not add if inventory is full', () => {
      const inv = Array.from({ length: 30 }, (_, i) => ({
        id: `item${i}`, name: `Item ${i}`, icon: '📦', quantity: 1, maxStack: 10,
      }));
      const result = addItemsToInventory(inv, 'new', 'New', '🆕', 1);
      expect(result).toHaveLength(30);
    });
  });

  describe('removeItemsFromInventory', () => {
    it('reduces quantity', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 5, maxStack: 10 }];
      const result = removeItemsFromInventory(inv, 'potion', 2);
      expect(result[0].quantity).toBe(3);
    });

    it('removes item when quantity reaches 0', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 2, maxStack: 10 }];
      const result = removeItemsFromInventory(inv, 'potion', 2);
      expect(result).toHaveLength(0);
    });

    it('does nothing for non-existent item', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 1, maxStack: 10 }];
      const result = removeItemsFromInventory(inv, 'missing', 1);
      expect(result).toHaveLength(1);
    });
  });

  describe('hasItem', () => {
    it('returns true when item exists with sufficient quantity', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 5, maxStack: 10 }];
      expect(hasItem(inv, 'potion', 3)).toBe(true);
    });

    it('returns false when quantity insufficient', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 2, maxStack: 10 }];
      expect(hasItem(inv, 'potion', 5)).toBe(false);
    });

    it('returns false for missing item', () => {
      expect(hasItem([], 'potion')).toBe(false);
    });
  });

  describe('clamp', () => {
    it('clamps value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('interpolates between two values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('randomRange', () => {
    it('returns value within range', () => {
      for (let i = 0; i < 50; i++) {
        const val = randomRange(5, 15);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThan(15);
      }
    });
  });

  describe('randomInt', () => {
    it('returns integer within range', () => {
      for (let i = 0; i < 50; i++) {
        const val = randomInt(1, 10);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });

    it('does not truncate short strings', () => {
      expect(truncate('hi', 5)).toBe('hi');
    });
  });

  describe('slugify', () => {
    it('converts to slug', () => {
      expect(slugify('Hello World!')).toBe('hello_world');
      expect(slugify('Test 123')).toBe('test_123');
    });
  });

  describe('hexToRgb', () => {
    it('converts hex to rgb', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('not-hex')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('converts rgb to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    });
  });

  describe('shuffleArray', () => {
    it('returns same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled).toHaveLength(5);
    });

    it('does not mutate original', () => {
      const arr = [1, 2, 3];
      shuffleArray(arr);
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('uniqueById', () => {
    it('removes duplicate ids', () => {
      const items = [
        { id: 'a', x: 1 },
        { id: 'b', x: 2 },
        { id: 'a', x: 3 },
      ];
      const result = uniqueById(items);
      expect(result).toHaveLength(2);
    });
  });

  describe('formatDuration', () => {
    it('formats milliseconds to human-readable', () => {
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(3661000)).toBe('1h 1m');
    });

    it('formats zero seconds', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });

  describe('formatTimestamp', () => {
    it('formats a timestamp to locale string', () => {
      const ts = 1700000000000;
      const result = formatTimestamp(ts);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('isNearEntityRect edge cases', () => {
    it('returns true for contained rect', () => {
      expect(isNearEntityRect(5, 5, 5, 5, 0, 0, 20, 20)).toBe(true);
    });

    it('returns false for zero-size rects', () => {
      expect(isNearEntityRect(10, 10, 0, 0, 10, 10, 5, 5)).toBe(false);
    });
  });

  describe('aabbCollision edge cases', () => {
    it('returns true for fully contained boxes', () => {
      expect(aabbCollision(5, 5, 2, 2, 0, 0, 10, 10)).toBe(true);
    });

    it('handles negative coordinates', () => {
      expect(aabbCollision(-10, -10, 5, 5, -8, -8, 5, 5)).toBe(true);
    });
  });

  describe('circleCollision edge cases', () => {
    it('handles zero-radius circles', () => {
      expect(circleCollision(5, 5, 0, 5, 5, 5)).toBe(true);
    });

    it('handles same center point', () => {
      expect(circleCollision(10, 10, 5, 10, 10, 3)).toBe(true);
    });
  });

  describe('clamp edge cases', () => {
    it('handles min equals max', () => {
      expect(clamp(5, 5, 5)).toBe(5);
    });

    it('handles negative ranges', () => {
      expect(clamp(0, -10, -5)).toBe(-5);
    });
  });

  describe('lerp edge cases', () => {
    it('handles negative interpolation', () => {
      expect(lerp(10, 0, -1)).toBe(20);
    });

    it('handles values beyond 1', () => {
      expect(lerp(0, 10, 2)).toBe(20);
    });
  });

  describe('slugify edge cases', () => {
    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('handles special characters only', () => {
      expect(slugify('!@#$%')).toBe('');
    });
  });

  describe('hexToRgb edge cases', () => {
    it('handles hex without #', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('rgbToHex edge cases', () => {
    it('rounds floating point values', () => {
      expect(rgbToHex(128.6, 0, 255.4)).toBe('#8100ff');
    });
  });

  describe('shuffleArray edge cases', () => {
    it('handles empty array', () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(shuffleArray([1])).toEqual([1]);
    });
  });

  describe('uniqueById edge cases', () => {
    it('handles empty array', () => {
      expect(uniqueById([])).toEqual([]);
    });

    it('handles all duplicates', () => {
      const items = [{ id: 'a' }, { id: 'a' }, { id: 'a' }];
      expect(uniqueById(items)).toHaveLength(1);
    });
  });

  describe('addItemsToInventory edge cases', () => {
    it('adds item with custom maxInventorySize', () => {
      const inv = addItemsToInventory([], 'item', 'Item', '📦', 1, 99, 5);
      expect(inv).toHaveLength(1);
    });
  });

  describe('hasItem edge cases', () => {
    it('returns true when quantity matches exactly', () => {
      const inv = [{ id: 'potion', name: 'Potion', icon: '🧪', quantity: 5, maxStack: 10 }];
      expect(hasItem(inv, 'potion', 5)).toBe(true);
    });
  });

  describe('createSpriteStateAdapter', () => {
    it('calls updateFn with state object', () => {
      const updateFn = vi.fn();
      const adapter = createSpriteStateAdapter(updateFn, { x: 0 } as any);
      adapter({ x: 5 } as any);
      expect(updateFn).toHaveBeenCalledWith({ x: 5 });
    });

    it('calls updateFn with function result', () => {
      const updateFn = vi.fn();
      const adapter = createSpriteStateAdapter<{ x: number }>(updateFn, { x: 10 });
      adapter((prev: { x: number }) => ({ x: prev.x + 5 }));
      expect(updateFn).toHaveBeenCalledWith({ x: 15 });
    });
  });
});
