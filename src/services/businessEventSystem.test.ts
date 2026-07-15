import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateEvent,
  applyEvent,
  MARKET_EVENTS,
  CUSTOMER_EVENTS,
  PRODUCTION_EVENTS,
  EventTemplate,
  GameEvent,
} from './businessEventSystem';

describe('businessEventSystem', () => {
  describe('generateEvent', () => {
    it('returns null when random exceeds chance threshold', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      const result = generateEvent(MARKET_EVENTS, 1, 0.3);
      expect(result).toBeNull();
      vi.restoreAllMocks();
    });

    it('generates an event when random is below chance threshold', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const result = generateEvent(MARKET_EVENTS, 1, 0.3);
      expect(result).not.toBeNull();
      expect(result!.id).toMatch(/^event_/);
      expect(result!.text).toBeDefined();
      expect(result!.impact).toBeDefined();
      expect(result!.affectedSector).toBeDefined();
      expect(result!.severity).toBeDefined();
      expect(result!.timestamp).toBeGreaterThan(0);
      vi.restoreAllMocks();
    });

    it('scales severity by difficulty', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const result1 = generateEvent(MARKET_EVENTS, 1, 1);
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const result2 = generateEvent(MARKET_EVENTS, 2, 1);
      expect(Math.abs(result2!.severity)).toBeGreaterThan(Math.abs(result1!.severity));
      vi.restoreAllMocks();
    });

    it('returns events from provided templates', () => {
      const customTemplates: EventTemplate[] = [
        { text: 'Custom Event', impact: 'positive', affectedSector: 'tech', baseSeverity: 0.1 },
      ];
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const result = generateEvent(customTemplates, 1, 1);
      expect(result!.text).toBe('Custom Event');
      expect(result!.affectedSector).toBe('tech');
      vi.restoreAllMocks();
    });
  });

  describe('applyEvent', () => {
    it('applies positive impact to all items when sector is "all"', () => {
      const event: GameEvent = {
        id: 'test_1',
        text: 'Test',
        impact: 'positive',
        affectedSector: 'all',
        severity: 0.1,
        timestamp: Date.now(),
      };
      const items = [
        { price: 100, sector: 'tech' },
        { price: 200, sector: 'energy' },
      ];
      const result = applyEvent(items, event);
      expect(result[0].price).toBeGreaterThan(100);
      expect(result[1].price).toBeGreaterThan(200);
    });

    it('applies negative impact to matching sector only', () => {
      const event: GameEvent = {
        id: 'test_2',
        text: 'Test',
        impact: 'negative',
        affectedSector: 'tech',
        severity: -0.1,
        timestamp: Date.now(),
      };
      const items = [
        { price: 100, sector: 'tech' },
        { price: 200, sector: 'energy' },
      ];
      const result = applyEvent(items, event);
      expect(result[0].price).toBeLessThan(100);
      expect(result[1].price).toBe(200);
    });

    it('clamps price to minimum of 1', () => {
      const event: GameEvent = {
        id: 'test_3',
        text: 'Test',
        impact: 'negative',
        affectedSector: 'all',
        severity: -0.9,
        timestamp: Date.now(),
      };
      const items = [{ price: 10 }];
      const result = applyEvent(items, event);
      expect(result[0].price).toBeGreaterThanOrEqual(1);
    });

    it('updates revenue when present', () => {
      const event: GameEvent = {
        id: 'test_4',
        text: 'Test',
        impact: 'positive',
        affectedSector: 'all',
        severity: 0.2,
        timestamp: Date.now(),
      };
      const items = [{ revenue: 1000 }];
      const result = applyEvent(items, event);
      expect(result[0].revenue).toBeGreaterThan(1000);
    });

    it('updates satisfaction when present', () => {
      const event: GameEvent = {
        id: 'test_5',
        text: 'Test',
        impact: 'positive',
        affectedSector: 'all',
        severity: 0.5,
        timestamp: Date.now(),
      };
      const items = [{ satisfaction: 50 }];
      const result = applyEvent(items, event);
      expect(result[0].satisfaction).toBeGreaterThan(50);
      expect(result[0].satisfaction).toBeLessThanOrEqual(100);
    });

    it('clamps satisfaction to max of 100', () => {
      const event: GameEvent = {
        id: 'test_6',
        text: 'Test',
        impact: 'positive',
        affectedSector: 'all',
        severity: 1.0,
        timestamp: Date.now(),
      };
      const items = [{ satisfaction: 90 }];
      const result = applyEvent(items, event);
      expect(result[0].satisfaction).toBeLessThanOrEqual(100);
    });

    it('clamps satisfaction to min of 0', () => {
      const event: GameEvent = {
        id: 'test_7',
        text: 'Test',
        impact: 'negative',
        affectedSector: 'all',
        severity: -1.0,
        timestamp: Date.now(),
      };
      const items = [{ satisfaction: 10 }];
      const result = applyEvent(items, event);
      expect(result[0].satisfaction).toBeGreaterThanOrEqual(0);
    });

    it('returns empty array for empty items', () => {
      const event: GameEvent = {
        id: 'test_8',
        text: 'Test',
        impact: 'positive',
        affectedSector: 'all',
        severity: 0.1,
        timestamp: Date.now(),
      };
      const result = applyEvent([], event);
      expect(result).toEqual([]);
    });
  });

  describe('event templates', () => {
    it('MARKET_EVENTS has at least 10 entries', () => {
      expect(MARKET_EVENTS.length).toBeGreaterThanOrEqual(10);
    });

    it('CUSTOMER_EVENTS has at least 5 entries', () => {
      expect(CUSTOMER_EVENTS.length).toBeGreaterThanOrEqual(5);
    });

    it('PRODUCTION_EVENTS has at least 5 entries', () => {
      expect(PRODUCTION_EVENTS.length).toBeGreaterThanOrEqual(5);
    });

    it('all market events have required fields', () => {
      MARKET_EVENTS.forEach(e => {
        expect(e.text).toBeDefined();
        expect(['positive', 'negative', 'neutral']).toContain(e.impact);
        expect(e.affectedSector).toBeDefined();
        expect(typeof e.baseSeverity).toBe('number');
      });
    });
  });
});
