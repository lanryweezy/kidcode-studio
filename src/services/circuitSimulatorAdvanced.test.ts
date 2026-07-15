import { describe, it, expect } from 'vitest';
import {
  calculateBodePlot,
  simulateTransient,
  analyzeNoise,
  runMonteCarloSimulation,
  runParametricSweep,
} from './circuitSimulator';

describe('Circuit Simulator - Advanced Analysis', () => {
  describe('Bode Plot (Frequency Response)', () => {
    it('generates bode plot data points', () => {
      const result = calculateBodePlot(1000, 0.000001, 0, 1, 1000000, 50);
      expect(result.points).toHaveLength(50);
      expect(result.points[0].frequency).toBeCloseTo(1, 0);
      expect(result.points[49].frequency).toBeCloseTo(1000000, 0);
    });

    it('calculates magnitude in dB', () => {
      const result = calculateBodePlot(1000, 0.000001, 0, 1, 1000000);
      result.points.forEach(point => {
        expect(point.magnitudeDb).toBeDefined();
        expect(typeof point.magnitudeDb).toBe('number');
      });
    });

    it('calculates phase shift', () => {
      const result = calculateBodePlot(1000, 0.000001, 0, 1, 1000000);
      result.points.forEach(point => {
        expect(point.phaseDegrees).toBeDefined();
        expect(point.phaseDegrees).toBeGreaterThanOrEqual(-180);
        expect(point.phaseDegrees).toBeLessThanOrEqual(180);
      });
    });

    it('finds cutoff frequency', () => {
      const result = calculateBodePlot(100, 0.00001, 0.01, 1, 100000);
      expect(result.cutoffFrequency).toBeGreaterThan(0);
      expect(result.cutoffFrequency).toBeLessThanOrEqual(100000);
    });

    it('calculates bandwidth', () => {
      const result = calculateBodePlot(1000, 0.000001, 0, 1, 1000000);
      expect(result.bandwidth).toBeGreaterThanOrEqual(0);
    });

    it('reports DC gain', () => {
      const result = calculateBodePlot(1000, 0.000001, 0, 1, 1000000);
      expect(result.gainAtDC).toBeGreaterThan(0);
    });

    it('handles RLC circuit', () => {
      const result = calculateBodePlot(100, 0.000001, 0.01, 10, 100000);
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.cutoffFrequency).toBeGreaterThan(0);
    });
  });

  describe('Transient Analysis', () => {
    it('simulates step response', () => {
      const result = simulateTransient(1000, 0.001, 0, 5, 0.01, 0.0001, 'step');
      expect(result.points).toBeDefined();
      expect(result.points.length).toBeGreaterThan(0);
      expect(result.finalValue).toBeGreaterThanOrEqual(0);
    });

    it('calculates rise time', () => {
      const result = simulateTransient(1000, 0.001, 0, 5, 0.01, 0.0001, 'step');
      expect(result.riseTime).toBeGreaterThanOrEqual(0);
    });

    it('calculates settling time', () => {
      const result = simulateTransient(1000, 0.001, 0, 5, 0.01, 0.0001, 'step');
      expect(result.settlingTime).toBeGreaterThanOrEqual(0);
    });

    it('simulates pulse response', () => {
      const result = simulateTransient(1000, 0.001, 0, 5, 0.1, 0.001, 'pulse', 10);
      expect(result.points.length).toBeGreaterThan(0);
    });

    it('simulates sine response', () => {
      const result = simulateTransient(1000, 0.001, 0, 5, 0.1, 0.001, 'sine', 50);
      expect(result.points.length).toBeGreaterThan(0);
    });

    it('tracks overshoot', () => {
      const result = simulateTransient(100, 0.001, 0.01, 5, 0.05, 0.0001, 'step');
      expect(result.overshoot).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Noise Analysis', () => {
    it('calculates thermal noise', () => {
      const result = analyzeNoise(1000, 0.001, 300, 1000);
      expect(result.thermalNoise).toBeGreaterThan(0);
    });

    it('calculates shot noise', () => {
      const result = analyzeNoise(1000, 0.001, 300, 1000);
      expect(result.shotNoise).toBeGreaterThan(0);
    });

    it('calculates flicker noise', () => {
      const result = analyzeNoise(1000, 0.001, 300, 1000);
      expect(result.flickerNoise).toBeGreaterThanOrEqual(0);
    });

    it('calculates total noise', () => {
      const result = analyzeNoise(1000, 0.001, 300, 1000);
      expect(result.totalNoise).toBeGreaterThan(0);
      expect(result.totalNoise).toBeGreaterThanOrEqual(result.thermalNoise);
    });

    it('calculates SNR', () => {
      const result = analyzeNoise(1000, 0.01, 300, 1000);
      expect(result.signalToNoiseRatio).toBeDefined();
      expect(typeof result.signalToNoiseRatio).toBe('number');
    });

    it('calculates noise density', () => {
      const result = analyzeNoise(1000, 0.001, 300, 1000);
      expect(result.noiseDensity).toBeGreaterThan(0);
    });

    it('provides noise sources', () => {
      const result = analyzeNoise(1000, 0.001, 300, 1000);
      expect(result.sources).toHaveLength(3);
      expect(result.sources.map(s => s.type)).toContain('thermal');
      expect(result.sources.map(s => s.type)).toContain('shot');
      expect(result.sources.map(s => s.type)).toContain('flicker');
    });
  });

  describe('Monte Carlo Simulation', () => {
    it('runs simulation with specified samples', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0] * vals[1],
        [{ nominal: 1000, tolerance: 5, distribution: 'uniform' }],
        1000
      );
      expect(result.results).toHaveLength(1000);
    });

    it('calculates mean and standard deviation', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0],
        [{ nominal: 1000, tolerance: 5, distribution: 'uniform' }],
        1000
      );
      expect(result.mean).toBeCloseTo(1000, -1);
      expect(result.stdDev).toBeGreaterThan(0);
    });

    it('calculates min and max', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0],
        [{ nominal: 1000, tolerance: 10, distribution: 'uniform' }],
        1000
      );
      expect(result.min).toBeLessThan(result.max);
      expect(result.min).toBeGreaterThan(800);
      expect(result.max).toBeLessThan(1200);
    });

    it('generates histogram', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0],
        [{ nominal: 1000, tolerance: 5, distribution: 'uniform' }],
        1000
      );
      expect(result.histogram.length).toBe(20);
    });

    it('calculates percentiles', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0],
        [{ nominal: 1000, tolerance: 5, distribution: 'uniform' }],
        1000
      );
      expect(result.percentiles.p5).toBeLessThan(result.percentiles.p50);
      expect(result.percentiles.p50).toBeLessThan(result.percentiles.p95);
    });

    it('calculates within spec percentage', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0],
        [{ nominal: 1000, tolerance: 5, distribution: 'uniform' }],
        1000,
        950,
        1050
      );
      expect(result.withinSpec).toBeGreaterThan(0);
      expect(result.withinSpec).toBeLessThanOrEqual(100);
    });

    it('supports Gaussian distribution', () => {
      const result = runMonteCarloSimulation(
        (vals) => vals[0],
        [{ nominal: 1000, tolerance: 5, distribution: 'gaussian' }],
        1000
      );
      expect(result.mean).toBeCloseTo(1000, -1);
    });
  });

  describe('Parametric Sweep', () => {
    it('sweeps parameter values', () => {
      const result = runParametricSweep(
        (r) => ({ result: 5 / r }),
        'Resistance',
        'Ω',
        'Current',
        'A',
        100,
        10000,
        10
      );
      expect(result.points).toHaveLength(10);
      expect(result.points[0].paramValue).toBe(100);
      expect(result.points[9].paramValue).toBe(10000);
    });

    it('calculates results for each point', () => {
      const result = runParametricSweep(
        (r) => ({ result: 5 / r }),
        'Resistance',
        'Ω',
        'Current',
        'A',
        100,
        1000,
        5
      );
      result.points.forEach(point => {
        expect(point.result).toBeGreaterThan(0);
      });
    });

    it('finds optimal value', () => {
      const result = runParametricSweep(
        (r) => ({ result: -((r - 500) ** 2) + 250000 }),
        'Resistance',
        'Ω',
        'Power',
        'mW',
        100,
        1000,
        100
      );
      expect(result.optimalValue).toBeCloseTo(500, -1);
    });

    it('calculates sensitivity', () => {
      const result = runParametricSweep(
        (r) => ({ result: 5 / r }),
        'Resistance',
        'Ω',
        'Current',
        'A',
        100,
        10000,
        50
      );
      expect(result.sensitivity).toBeDefined();
      expect(typeof result.sensitivity).toBe('number');
    });

    it('includes additional results', () => {
      const result = runParametricSweep(
        (r) => ({
          result: 5 / r,
          additional: { power: 25 / r, voltage: 5 },
        }),
        'Resistance',
        'Ω',
        'Current',
        'A',
        100,
        1000,
        5
      );
      result.points.forEach(point => {
        expect(point.additionalResults).toBeDefined();
        expect(point.additionalResults?.power).toBeGreaterThan(0);
      });
    });
  });
});
