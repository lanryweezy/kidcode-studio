import { describe, it, expect } from 'vitest';
import {
  createNotificationState,
  addNotification,
  dismissNotification,
  isNotificationExpired,
  getNotificationColor,
  NOTIFICATION_PRESETS,
} from './notificationSystem';

describe('notificationSystem', () => {
  describe('createNotificationState', () => {
    it('creates empty state', () => {
      const state = createNotificationState();
      expect(state.queue).toEqual([]);
      expect(state.active).toBeNull();
      expect(state.maxVisible).toBe(1);
    });

    it('accepts custom maxVisible', () => {
      const state = createNotificationState(5);
      expect(state.maxVisible).toBe(5);
    });
  });

  describe('addNotification', () => {
    it('sets as active when no active notification', () => {
      const state = createNotificationState();
      const result = addNotification(state, 'Test');
      expect(result.active).not.toBeNull();
      expect(result.active!.text).toBe('Test');
    });

    it('queues when active notification exists', () => {
      let state = createNotificationState();
      state = addNotification(state, 'First');
      state = addNotification(state, 'Second');
      expect(state.active!.text).toBe('First');
      expect(state.queue).toHaveLength(1);
      expect(state.queue[0].text).toBe('Second');
    });

    it('sets default emoji', () => {
      const state = createNotificationState();
      const result = addNotification(state, 'Test');
      expect(result.active!.emoji).toBe('📢');
    });

    it('accepts custom emoji, type, and duration', () => {
      const state = createNotificationState();
      const result = addNotification(state, 'Error', '❌', 'error', 5000);
      expect(result.active!.emoji).toBe('❌');
      expect(result.active!.type).toBe('error');
      expect(result.active!.duration).toBe(5000);
    });
  });

  describe('dismissNotification', () => {
    it('clears active when queue is empty', () => {
      let state = createNotificationState();
      state = addNotification(state, 'Test');
      state = dismissNotification(state);
      expect(state.active).toBeNull();
    });

    it('moves next from queue to active', () => {
      let state = createNotificationState();
      state = addNotification(state, 'First');
      state = addNotification(state, 'Second');
      state = addNotification(state, 'Third');
      state = dismissNotification(state);
      expect(state.active!.text).toBe('Second');
      expect(state.queue).toHaveLength(1);
    });
  });

  describe('isNotificationExpired', () => {
    it('returns true for expired notification', () => {
      const notif = {
        id: '1', text: 'Test', emoji: '📢', type: 'info' as const,
        duration: 1, timestamp: Date.now() - 100,
      };
      expect(isNotificationExpired(notif)).toBe(true);
    });

    it('returns false for active notification', () => {
      const notif = {
        id: '1', text: 'Test', emoji: '📢', type: 'info' as const,
        duration: 5000, timestamp: Date.now(),
      };
      expect(isNotificationExpired(notif)).toBe(false);
    });
  });

  describe('getNotificationColor', () => {
    it('returns correct colors for types', () => {
      expect(getNotificationColor('success')).toBe('bg-green-500');
      expect(getNotificationColor('error')).toBe('bg-red-500');
      expect(getNotificationColor('info')).toBe('bg-blue-500');
      expect(getNotificationColor('warning')).toBe('bg-yellow-500');
      expect(getNotificationColor('achievement')).toBe('bg-purple-500');
    });
  });

  describe('NOTIFICATION_PRESETS', () => {
    it('has correct sale preset', () => {
      const preset = NOTIFICATION_PRESETS.sale(100);
      expect(preset.text).toBe('Sale! +$100');
      expect(preset.type).toBe('success');
    });

    it('has correct purchase preset', () => {
      const preset = NOTIFICATION_PRESETS.purchase('Sword');
      expect(preset.text).toBe('Purchased Sword');
      expect(preset.type).toBe('info');
    });

    it('has correct hire preset', () => {
      const preset = NOTIFICATION_PRESETS.hire('Alice');
      expect(preset.text).toBe('Hired Alice');
    });

    it('has correct fire preset', () => {
      const preset = NOTIFICATION_PRESETS.fire('Bob');
      expect(preset.text).toBe('Fired Bob');
      expect(preset.type).toBe('warning');
    });

    it('has correct upgrade preset', () => {
      const preset = NOTIFICATION_PRESETS.upgrade('Factory');
      expect(preset.text).toBe('Upgraded Factory');
    });

    it('has correct achievement preset', () => {
      const preset = NOTIFICATION_PRESETS.achievement('First Kill');
      expect(preset.text).toBe('Achievement: First Kill');
      expect(preset.type).toBe('achievement');
    });

    it('has correct event preset', () => {
      const preset = NOTIFICATION_PRESETS.event('New event');
      expect(preset.type).toBe('info');
    });

    it('has correct error preset', () => {
      const preset = NOTIFICATION_PRESETS.error('Something broke');
      expect(preset.type).toBe('error');
    });

    it('has correct warning preset', () => {
      const preset = NOTIFICATION_PRESETS.warning('Careful!');
      expect(preset.type).toBe('warning');
    });
  });
});
