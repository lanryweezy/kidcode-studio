import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import {
  registerComponent,
  getComponent,
  unregisterComponent,
  listComponents,
  hasComponent,
  registerBuiltInComponents,
  getComponentInfo,
  getComponentsByCategory,
  ComponentType
} from './componentRegistry';

// Mock component for testing
const MockComponent: ComponentType = ({ element }: any) => (
  React.createElement('div', { 'data-testid': 'mock-component' }, element.content)
);

describe('componentRegistry', () => {
  beforeEach(() => {
    // Clear the registry before each test by unregistering everything
    const components = listComponents();
    components.forEach(type => unregisterComponent(type));
  });

  it('should register and get a component', () => {
    registerComponent('test-comp', MockComponent);
    expect(hasComponent('test-comp')).toBe(true);
    expect(getComponent('test-comp')).toBe(MockComponent);
  });

  it('should unregister a component', () => {
    registerComponent('test-comp', MockComponent);
    expect(hasComponent('test-comp')).toBe(true);
    unregisterComponent('test-comp');
    expect(hasComponent('test-comp')).toBe(false);
    expect(getComponent('test-comp')).toBeUndefined();
  });

  it('should list all registered components', () => {
    registerComponent('comp1', MockComponent);
    registerComponent('comp2', MockComponent);
    const components = listComponents();
    expect(components).toContain('comp1');
    expect(components).toContain('comp2');
    expect(components.length).toBe(2);
  });

  it('should register built-in components', () => {
    registerBuiltInComponents();
    const components = listComponents();
    expect(components).toContain('button');
    expect(components).toContain('text');
    expect(components).toContain('input');
    expect(components.length).toBeGreaterThan(10);
  });

  it('should return correct component info', () => {
    const info = getComponentInfo('button');
    expect(info).toEqual({ name: 'Button', icon: '🔘', category: 'Interactive' });

    const nonExistentInfo = getComponentInfo('non-existent');
    expect(nonExistentInfo).toBeNull();
  });

  it('should group components by category', () => {
    registerBuiltInComponents();
    const categories = getComponentsByCategory();

    expect(categories).toHaveProperty('Interactive');
    expect(categories).toHaveProperty('Content');
    expect(categories).toHaveProperty('Layout');

    const interactive = categories['Interactive'];
    expect(interactive.some(c => c.type === 'button')).toBe(true);
    expect(interactive.some(c => c.type === 'input')).toBe(true);
  });
});
