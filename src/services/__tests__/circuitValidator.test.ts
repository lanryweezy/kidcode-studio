import { describe, it, expect } from 'vitest';
import { validateCircuit } from '../circuitValidator';
import { CircuitComponent, Wire } from '../../types';

function battery(id = 'b1'): CircuitComponent {
  return { id, type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
}

function resistor(id = 'r1', resistance = 330): CircuitComponent {
  return { id, type: 'RESISTOR', x: 100, y: 0, pin: 0, resistance };
}

function led(id = 'led1'): CircuitComponent {
  return { id, type: 'LED_RED', x: 200, y: 0, pin: 13 };
}

function wire(a: string, b: string, id = 'w1'): Wire {
  return { id, fromComponentId: a, fromPin: 0, toComponentId: b, toPin: 0 };
}

describe('circuitValidator', () => {
  describe('empty circuit', () => {
    it('returns info message for empty circuit', () => {
      const result = validateCircuit([], []);
      expect(result.isValid).toBe(false);
      expect(result.infos.length).toBeGreaterThan(0);
      expect(result.infos.some(i => i.message.includes('empty'))).toBe(true);
    });
  });

  describe('no power source', () => {
    it('returns error when no battery present', () => {
      const components = [led(), resistor()];
      const wires = [wire('r1', 'led1')];
      const result = validateCircuit(components, wires);
      expect(result.errors.some(e => e.id === 'no-power')).toBe(true);
    });
  });

  describe('multiple batteries', () => {
    it('warns when multiple batteries present', () => {
      const b1 = battery('b1');
      const b2: CircuitComponent = { id: 'b2', type: 'BATTERY_AA', x: 100, y: 0, pin: 0 };
      const result = validateCircuit([b1, b2], []);
      expect(result.warnings.some(w => w.id === 'multiple-batteries')).toBe(true);
    });
  });

  describe('short circuit detection', () => {
    it('detects short circuit when battery connected with no load', () => {
      const b1 = battery('b1');
      const b2: CircuitComponent = { id: 'b2', type: 'BATTERY_AA', x: 100, y: 0, pin: 0 };
      const wires = [wire('b1', 'b2')];
      const result = validateCircuit([b1, b2], wires);
      expect(result.errors.some(e => e.id.startsWith('short-circuit'))).toBe(true);
    });
  });

  describe('disconnected components', () => {
    it('warns about disconnected output components', () => {
      const b1 = battery();
      const l1 = led();
      const result = validateCircuit([b1, l1], []);
      expect(result.warnings.some(w => w.id.startsWith('disconnected'))).toBe(true);
    });
  });

  describe('high current warning', () => {
    it('warns about high current for low-resistance components', () => {
      const b1 = battery();
      const motor: CircuitComponent = { id: 'm1', type: 'MOTOR_DC', x: 100, y: 0, pin: 3 };
      const wires = [wire('b1', 'm1')];
      const result = validateCircuit([b1, motor], wires);
      expect(result.warnings.some(w => w.id.startsWith('high-current'))).toBe(true);
    });
  });

  describe('valid circuit', () => {
    it('no errors for battery + resistor + LED', () => {
      const b1 = battery();
      const r1 = resistor();
      const l1 = led();
      const wires = [
        wire('b1', 'r1', 'w1'),
        wire('r1', 'led1', 'w2'),
      ];
      const result = validateCircuit([b1, r1, l1], wires);
      expect(result.errors).toHaveLength(0);
    });

    it('is valid when no errors', () => {
      const b1 = battery();
      const r1 = resistor();
      const l1 = led();
      const wires = [
        wire('b1', 'r1', 'w1'),
        wire('r1', 'led1', 'w2'),
      ];
      const result = validateCircuit([b1, r1, l1], wires);
      expect(result.isValid).toBe(true);
    });
  });

  describe('floating input detection', () => {
    it('warns about floating button input', () => {
      const b1 = battery();
      const btn: CircuitComponent = { id: 'btn1', type: 'BUTTON', x: 100, y: 0, pin: 0 };
      const wires = [wire('b1', 'btn1')];
      const result = validateCircuit([b1, btn], wires);
      expect(result.infos.some(i => i.id.startsWith('floating-input'))).toBe(true);
    });

    it('no floating input warning when connected to microcontroller', () => {
      const b1 = battery();
      const btn: CircuitComponent = { id: 'btn1', type: 'BUTTON', x: 100, y: 0, pin: 0 };
      const mc: CircuitComponent = { id: 'mc1', type: 'ARDUINO_UNO', x: 200, y: 0, pin: 0 };
      const wires = [
        wire('b1', 'mc1', 'w1'),
        wire('btn1', 'mc1', 'w2'),
      ];
      const result = validateCircuit([b1, btn, mc], wires);
      expect(result.infos.some(i => i.id.startsWith('floating-input') && i.componentIds.includes('btn1'))).toBe(false);
    });
  });

  describe('unconnected component info', () => {
    it('generates info for unconnected components', () => {
      const b1 = battery();
      const r1 = resistor();
      const result = validateCircuit([b1, r1], []);
      expect(result.infos.some(i => i.id.startsWith('unconnected'))).toBe(true);
    });
  });

  describe('validation result structure', () => {
    it('returns isValid, errors, warnings, infos arrays', () => {
      const result = validateCircuit([], []);
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('infos');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.infos)).toBe(true);
    });
  });
});
