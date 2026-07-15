import { describe, it, expect } from 'vitest';
import {
  calculateCapacitiveReactance,
  calculateInductiveReactance,
  calculateACImpedance,
  simulateTransistor,
  simulateOpAmp,
  simulateCapacitorCharge,
  simulateInductor,
  formatValue,
} from './circuitSimulator';

describe('Circuit Simulator - AC Analysis', () => {
  describe('calculateCapacitiveReactance', () => {
    it('calculates Xc for given values', () => {
      const xc = calculateCapacitiveReactance(0.000001, 1000);
      expect(xc).toBeCloseTo(159.15, 1);
    });

    it('returns Infinity for zero frequency', () => {
      const xc = calculateCapacitiveReactance(0.000001, 0);
      expect(xc).toBe(Infinity);
    });

    it('decreases with higher frequency', () => {
      const xc1 = calculateCapacitiveReactance(0.000001, 100);
      const xc2 = calculateCapacitiveReactance(0.000001, 1000);
      expect(xc2).toBeLessThan(xc1);
    });
  });

  describe('calculateInductiveReactance', () => {
    it('calculates Xl for given values', () => {
      const xl = calculateInductiveReactance(0.01, 1000);
      expect(xl).toBeCloseTo(62.83, 1);
    });

    it('increases with higher frequency', () => {
      const xl1 = calculateInductiveReactance(0.01, 100);
      const xl2 = calculateInductiveReactance(0.01, 1000);
      expect(xl2).toBeGreaterThan(xl1);
    });
  });

  describe('calculateACImpedance', () => {
    it('calculates impedance for RLC circuit', () => {
      const result = calculateACImpedance(100, 0.000001, 0.01, 1000);
      expect(result.impedance).toBeGreaterThan(0);
      expect(result.phaseShift).toBeDefined();
      expect(result.frequency).toBe(1000);
    });

    it('calculates resonance frequency', () => {
      const result = calculateACImpedance(100, 0.000001, 0.01, 1000);
      expect(result.resonanceFreq).toBeCloseTo(1591.55, 0);
    });

    it('calculates quality factor', () => {
      const result = calculateACImpedance(100, 0.000001, 0.01, 1000);
      expect(result.qualityFactor).toBeGreaterThan(0);
    });
  });
});

describe('Circuit Simulator - Transistor Simulation', () => {
  describe('simulateTransistor', () => {
    it('simulates NPN transistor in cutoff', () => {
      const state = simulateTransistor('NPN', 0, 5, 200, 0, 1000);
      expect(state.mode).toBe('cutoff');
      expect(state.collectorCurrent).toBe(0);
    });

    it('simulates NPN transistor with base current', () => {
      const state = simulateTransistor('NPN', 5, 9, 200, 100, 1000);
      expect(state.collectorCurrent).toBeGreaterThan(0);
      expect(state.mode).toMatch(/active|saturation/);
    });

    it('simulates NPN transistor with high base voltage', () => {
      const state = simulateTransistor('NPN', 10, 5, 200, 10, 100);
      expect(state.collectorCurrent).toBeGreaterThan(0);
    });

    it('simulates PNP transistor', () => {
      const state = simulateTransistor('PNP', 0, 5, 200, 100, 1000);
      expect(state.type).toBe('PNP');
    });

    it('calculates power dissipation', () => {
      const state = simulateTransistor('NPN', 5, 9, 200, 100, 1000);
      expect(state.powerDissipation).toBeGreaterThanOrEqual(0);
    });

    it('calculates emitter current', () => {
      const state = simulateTransistor('NPN', 5, 9, 200, 100, 1000);
      expect(state.emitterCurrent).toBeGreaterThanOrEqual(state.collectorCurrent);
    });
  });
});

describe('Circuit Simulator - Op-Amp Simulation', () => {
  describe('simulateOpAmp', () => {
    it('simulates op-amp with output', () => {
      const state = simulateOpAmp('OPAMP_358', 0.1, 0, 5, 10000, 1000);
      expect(state.outputVoltage).toBeDefined();
      expect(state.bandwidth).toBeGreaterThan(0);
    });

    it('simulates op-amp saturated high', () => {
      const state = simulateOpAmp('OPAMP_358', 10, 0, 5, 10000, 1000);
      expect(state.isSaturated).toBe(true);
      expect(state.mode).toBe('saturated_high');
    });

    it('simulates op-amp saturated low', () => {
      const state = simulateOpAmp('OPAMP_358', 0, 10, 5, 10000, 1000);
      expect(state.isSaturated).toBe(true);
      expect(state.mode).toBe('saturated_low');
    });

    it('calculates gain', () => {
      const state = simulateOpAmp('OPAMP_358', 0.01, 0, 5, 10000, 1000);
      expect(state.gain).toBeGreaterThanOrEqual(0);
    });

    it('calculates bandwidth', () => {
      const state = simulateOpAmp('OPAMP_358', 1, 0, 5, 10000, 1000);
      expect(state.bandwidth).toBeGreaterThan(0);
    });

    it('OPAMP_072 has higher slew rate', () => {
      const state358 = simulateOpAmp('OPAMP_358', 1, 0, 5);
      const state072 = simulateOpAmp('OPAMP_072', 1, 0, 5);
      expect(state072.slewRate).toBeGreaterThan(state358.slewRate);
    });
  });
});

describe('Circuit Simulator - Capacitor Charging', () => {
  describe('simulateCapacitorCharge', () => {
    it('charges capacitor over time', () => {
      const state = simulateCapacitorCharge(0.001, 1000, 5, 0, 1, true);
      expect(state.voltage).toBeGreaterThan(0);
      expect(state.isCharging).toBe(true);
    });

    it('capacitor voltage approaches supply voltage', () => {
      const state = simulateCapacitorCharge(0.001, 1000, 5, 0, 5, true);
      expect(state.voltage).toBeGreaterThan(3);
    });

    it('discharges capacitor over time', () => {
      const state = simulateCapacitorCharge(0.001, 1000, 5, 5, 1, false);
      expect(state.voltage).toBeLessThan(5);
      expect(state.isCharging).toBe(false);
    });

    it('calculates time constant', () => {
      const state = simulateCapacitorCharge(0.001, 1000, 5, 0, 0, true);
      expect(state.timeConstant).toBeCloseTo(1, 0);
    });

    it('calculates energy stored', () => {
      const state = simulateCapacitorCharge(0.001, 1000, 5, 0, 5, true);
      expect(state.energyStored).toBeGreaterThan(0);
    });

    it('charge percentage is correct', () => {
      const state = simulateCapacitorCharge(0.001, 1000, 5, 0, 0, true);
      expect(state.chargePercent).toBeCloseTo(0, 0);
    });

    it('current decreases during charging', () => {
      const state1 = simulateCapacitorCharge(0.001, 1000, 5, 0, 0.1, true);
      const state2 = simulateCapacitorCharge(0.001, 1000, 5, 0, 2, true);
      expect(state2.current).toBeLessThan(state1.current);
    });
  });
});

describe('Circuit Simulator - Inductor Behavior', () => {
  describe('simulateInductor', () => {
    it('charges inductor over time', () => {
      const state = simulateInductor(0.1, 10, 5, 0, 0.01, true);
      expect(state.current).toBeGreaterThan(0);
      expect(state.isCharging).toBe(true);
    });

    it('current approaches steady state', () => {
      const state = simulateInductor(0.1, 10, 5, 0, 1, true);
      expect(state.current).toBeCloseTo(0.5, 0);
    });

    it('discharges inductor over time', () => {
      const state = simulateInductor(0.1, 10, 5, 0.5, 0.1, false);
      expect(state.current).toBeLessThan(0.5);
      expect(state.isCharging).toBe(false);
    });

    it('calculates energy stored', () => {
      const state = simulateInductor(0.1, 10, 5, 0, 0.1, true);
      expect(state.energyStored).toBeGreaterThanOrEqual(0);
    });

    it('calculates back EMF', () => {
      const state = simulateInductor(0.1, 10, 5, 0, 0.001, true);
      expect(state.backEmf).toBeDefined();
    });

    it('calculates time constant', () => {
      const state = simulateInductor(0.1, 10, 5, 0, 0, true);
      expect(state.timeConstant).toBeCloseTo(0.01, 2);
    });
  });
});

describe('Circuit Simulator - Format Value', () => {
  it('formats resistance values', () => {
    expect(formatValue(1500000, 'Ω')).toContain('MΩ');
    expect(formatValue(1500, 'Ω')).toContain('kΩ');
    expect(formatValue(100, 'Ω')).toContain('Ω');
  });

  it('formats capacitance values', () => {
    expect(formatValue(0.001, 'F')).toContain('mF');
    expect(formatValue(0.000001, 'F')).toContain('µF');
  });

  it('formats voltage values', () => {
    expect(formatValue(3.14, 'V')).toContain('V');
  });

  it('formats current values', () => {
    expect(formatValue(1.5, 'A')).toContain('A');
    expect(formatValue(0.015, 'A')).toContain('mA');
  });

  it('formats power values', () => {
    expect(formatValue(0.5, 'W')).toContain('mW');
    expect(formatValue(1.5, 'W')).toContain('W');
  });
});
