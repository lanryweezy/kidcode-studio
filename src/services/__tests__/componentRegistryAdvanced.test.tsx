import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import {
  registerComponent,
  getComponent,
  unregisterComponent,
  listComponents,
  hasComponent,
  getComponentInfo,
  getComponentsByCategory,
  searchComponents,
  createCustomComponent,
  isUserComponent,
  getUserComponents,
  removeUserComponent,
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  trackUsage,
  getUsageStats,
  registerDependencies,
  getDependencies,
  getDependents,
  ComponentType,
} from '../componentRegistry';

const MockComp: ComponentType = ({ element }) =>
  React.createElement('div', null, element.content);

describe('componentRegistry advanced features', () => {
  beforeEach(() => {
    listComponents().forEach(type => unregisterComponent(type));
    getUserComponents().forEach((_, key) => removeUserComponent(key));
  });

  describe('custom component creation', () => {
    it('creates and registers a custom component', () => {
      const key = createCustomComponent('MyWidget', '🎯', 'Custom', MockComp);
      expect(hasComponent(key)).toBe(true);
      expect(isUserComponent(key)).toBe(true);
    });

    it('uses provided type key', () => {
      const key = createCustomComponent('Widget2', '📦', 'Custom', MockComp, 'custom_widget');
      expect(key).toBe('custom_widget');
      expect(hasComponent('custom_widget')).toBe(true);
    });

    it('derives type key from name', () => {
      const key = createCustomComponent('My Cool Widget', '✨', 'Custom', MockComp);
      expect(key).toBe('my_cool_widget');
    });

    it('returns all user components', () => {
      createCustomComponent('W1', '1', 'Cat', MockComp);
      createCustomComponent('W2', '2', 'Cat', MockComp);
      const users = getUserComponents();
      expect(users.size).toBe(2);
    });

    it('removes a user component', () => {
      const key = createCustomComponent('Removable', '🗑️', 'Test', MockComp);
      expect(hasComponent(key)).toBe(true);
      const removed = removeUserComponent(key);
      expect(removed).toBe(true);
      expect(hasComponent(key)).toBe(false);
      expect(isUserComponent(key)).toBe(false);
    });

    it('returns false when removing non-existent user component', () => {
      expect(removeUserComponent('nonexistent')).toBe(false);
    });

    it('provides info for custom components', () => {
      createCustomComponent('InfoWidget', '🎯', 'Custom', MockComp, 'info_widget');
      const info = getComponentInfo('info_widget');
      expect(info).toEqual({ name: 'InfoWidget', icon: '🎯', category: 'Custom' });
    });
  });

  describe('component search', () => {
    beforeEach(() => {
      registerComponent('button', MockComp);
      registerComponent('my_slider', MockComp);
      registerComponent('input_field', MockComp);
    });

    it('searches by type name', () => {
      const results = searchComponents('button');
      expect(results).toContain('button');
    });

    it('searches by partial match', () => {
      const results = searchComponents('slid');
      expect(results).toContain('my_slider');
    });

    it('searches is case-insensitive', () => {
      const results = searchComponents('BUTTON');
      expect(results).toContain('button');
    });

    it('returns empty for no matches', () => {
      const results = searchComponents('xyz_nonexistent');
      expect(results).toHaveLength(0);
    });

    it('searches categories via getComponentInfo', () => {
      registerBuiltIn();
      const results = searchComponents('interactive');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('component favorites', () => {
    it('adds and retrieves favorites', () => {
      addFavorite('button');
      expect(isFavorite('button')).toBe(true);
      expect(getFavorites()).toContain('button');
    });

    it('removes favorites', () => {
      addFavorite('button');
      removeFavorite('button');
      expect(isFavorite('button')).toBe(false);
    });

    it('does not duplicate favorites', () => {
      addFavorite('button');
      addFavorite('button');
      expect(getFavorites().filter(f => f === 'button')).toHaveLength(1);
    });

    it('returns empty when no favorites', () => {
      removeFavorite('nonexistent');
      expect(getFavorites()).not.toContain('nonexistent');
    });
  });

  describe('usage statistics', () => {
    it('tracks component usage', () => {
      trackUsage('button');
      trackUsage('button');
      trackUsage('input');
      const stats = getUsageStats();
      const btnStat = stats.find(s => s.type === 'button');
      expect(btnStat?.count).toBe(2);
    });

    it('returns stats sorted by frequency', () => {
      trackUsage('input');
      trackUsage('button');
      trackUsage('button');
      trackUsage('button');
      const stats = getUsageStats();
      expect(stats[0].type).toBe('button');
      expect(stats[0].count).toBeGreaterThanOrEqual(stats[1]?.count || 0);
    });

    it('handles usage of untracked components', () => {
      trackUsage('new_comp');
      const stats = getUsageStats();
      expect(stats.find(s => s.type === 'new_comp')?.count).toBe(1);
    });
  });

  describe('dependency tracking', () => {
    it('registers and retrieves dependencies', () => {
      registerDependencies('display', ['sensor', 'battery']);
      expect(getDependencies('display')).toEqual(['sensor', 'battery']);
    });

    it('returns empty for unregistered', () => {
      expect(getDependencies('unknown')).toEqual([]);
    });

    it('finds dependents of a component', () => {
      registerDependencies('a', ['b']);
      registerDependencies('c', ['b']);
      registerDependencies('d', ['x']);
      const dependents = getDependents('b');
      expect(dependents).toContain('a');
      expect(dependents).toContain('c');
      expect(dependents).not.toContain('d');
    });
  });

  function registerBuiltIn() {
    registerComponent('button', MockComp);
    registerComponent('input', MockComp);
    registerComponent('text', MockComp);
    registerComponent('image', MockComp);
  }
});
