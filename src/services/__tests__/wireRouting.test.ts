import { describe, it, expect } from 'vitest';
import { findConnectedGroups, calculateNodeVoltages } from '../circuitSimulator';
import type { CircuitComponent, Wire } from '../../types';

function makeComp(id: string, type: CircuitComponent['type'], pin: number, x = 0, y = 0): CircuitComponent {
  return { id, type, x, y, pin };
}

function makeWire(id: string, fromId: string, fromPin: number, toId: string, toPin: number): Wire {
  return { id, fromComponentId: fromId, fromPin, toComponentId: toId, toPin };
}

describe('Wire Routing - findConnectedGroups', () => {
  it('2 components and 1 wire returns single group', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const wire = makeWire('w1', 'b1', 0, 'r1', 1);

    const groups = findConnectedGroups([battery, resistor], [wire]);
    expect(groups.length).toBe(1);
    expect(groups[0]).toContain('b1');
    expect(groups[0]).toContain('r1');
  });

  it('disconnected components return multiple groups', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const wire = makeWire('w1', 'b1', 0, 'led1', 2);

    const groups = findConnectedGroups([battery, resistor, led], [wire]);
    expect(groups.length).toBe(2);
  });

  it('no wires returns individual groups per component', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);

    const groups = findConnectedGroups([battery, resistor, led], []);
    expect(groups.length).toBe(3);
  });

  it('circular connections (A→B→C→A) returns single group', () => {
    const a = makeComp('a', 'BATTERY_9V', 0);
    const b = makeComp('b', 'RESISTOR', 1);
    const c = makeComp('c', 'LED_RED', 2);

    const wires = [
      makeWire('w1', 'a', 0, 'b', 1),
      makeWire('w2', 'b', 1, 'c', 2),
      makeWire('w3', 'c', 2, 'a', 0),
    ];

    const groups = findConnectedGroups([a, b, c], wires);
    expect(groups.length).toBe(1);
    expect(groups[0]).toHaveLength(3);
    expect(groups[0]).toContain('a');
    expect(groups[0]).toContain('b');
    expect(groups[0]).toContain('c');
  });

  it('empty component list returns empty groups', () => {
    const groups = findConnectedGroups([], []);
    expect(groups.length).toBe(0);
  });

  it('single component with no wires returns one group', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const groups = findConnectedGroups([battery], []);
    expect(groups.length).toBe(1);
    expect(groups[0]).toEqual(['b1']);
  });

  it('chain of 4 components returns single group', () => {
    const a = makeComp('a', 'BATTERY_9V', 0);
    const b = makeComp('b', 'RESISTOR', 1);
    const c = makeComp('c', 'LED_RED', 2);
    const d = makeComp('d', 'MOTOR_DC', 3);

    const wires = [
      makeWire('w1', 'a', 0, 'b', 1),
      makeWire('w2', 'b', 1, 'c', 2),
      makeWire('w3', 'c', 2, 'd', 3),
    ];

    const groups = findConnectedGroups([a, b, c, d], wires);
    expect(groups.length).toBe(1);
    expect(groups[0]).toHaveLength(4);
  });
});

describe('Wire Routing - Wire color generation', () => {
  it('wire has a color property', () => {
    const wire = makeWire('w1', 'b1', 0, 'r1', 1);
    expect(wire).toHaveProperty('id');
    expect(wire.fromComponentId).toBe('b1');
    expect(wire.toComponentId).toBe('r1');
  });

  it('wire with color set', () => {
    const wire: Wire = {
      id: 'w1', fromComponentId: 'b1', fromPin: 0,
      toComponentId: 'r1', toPin: 1, color: 'red',
    };
    expect(wire.color).toBe('red');
  });
});

describe('Wire Routing - calculateNodeVoltages', () => {
  it('single battery + resistor circuit has voltage', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const wire = makeWire('w1', 'b1', 0, 'r1', 1);

    const voltages = calculateNodeVoltages([battery, resistor], [wire], 9.0);
    expect(voltages.size).toBeGreaterThan(0);

    const resistorVoltage = voltages.get('r1');
    expect(resistorVoltage).toBeDefined();
    expect(resistorVoltage!.voltage).toBeGreaterThanOrEqual(0);
  });

  it('node voltage drops across series components', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const r1 = makeComp('r1', 'RESISTOR', 1);
    const r2 = makeComp('r2', 'RESISTOR', 2);
    const wires = [
      makeWire('w1', 'b1', 0, 'r1', 1),
      makeWire('w2', 'r1', 1, 'r2', 2),
    ];

    const voltages = calculateNodeVoltages([battery, r1, r2], wires, 9.0);

    const v1 = voltages.get('r1');
    const v2 = voltages.get('r2');
    expect(v1).toBeDefined();
    expect(v2).toBeDefined();
    expect(v1!.current).toBeGreaterThan(0);
    expect(v2!.current).toBeGreaterThan(0);
  });

  it('unpowered group returns 0V', () => {
    const resistor = makeComp('r1', 'RESISTOR', 1);
    const led = makeComp('led1', 'LED_RED', 2);
    const wire = makeWire('w1', 'r1', 1, 'led1', 2);

    const voltages = calculateNodeVoltages([resistor, led], [wire], 9.0);

    const r1V = voltages.get('r1');
    const led1V = voltages.get('led1');
    expect(r1V).toBeDefined();
    expect(led1V).toBeDefined();
    expect(r1V!.voltage).toBe(0);
    expect(led1V!.voltage).toBe(0);
  });

  it('empty circuit returns empty map', () => {
    const voltages = calculateNodeVoltages([], [], 9.0);
    expect(voltages.size).toBe(0);
  });

  it('battery alone has source voltage', () => {
    const battery = makeComp('b1', 'BATTERY_9V', 0);
    const voltages = calculateNodeVoltages([battery], [], 9.0);
    expect(voltages.size).toBe(1);
    const batteryNode = voltages.get('b1');
    expect(batteryNode).toBeDefined();
  });
});
