import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameAnalytics } from './gameAnalytics';

describe('GameAnalytics', () => {
  let analytics: GameAnalytics;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    analytics = new GameAnalytics();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a new session on init', () => {
    const report = analytics.generateReport();
    expect(report.session.id).toMatch(/^session_/);
    expect(report.session.totalDeaths).toBe(0);
    expect(report.session.totalKills).toBe(0);
  });

  it('tracks death', () => {
    analytics.trackDeath(100, 200, 'enemy');
    const report = analytics.generateReport();
    expect(report.session.totalDeaths).toBe(1);
    expect(report.session.damageTaken).toHaveLength(1);
    expect(report.session.damageTaken[0].source).toBe('enemy');
  });

  it('tracks kill', () => {
    analytics.trackKill(150, 250, 'goblin');
    const report = analytics.generateReport();
    expect(report.session.totalKills).toBe(1);
    expect(report.session.damageDealt).toHaveLength(1);
    expect(report.session.damageDealt[0].target).toBe('goblin');
  });

  it('tracks coin', () => {
    analytics.trackCoin(50, 50);
    const report = analytics.generateReport();
    expect(report.session.totalCoins).toBe(1);
  });

  it('tracks combo', () => {
    analytics.trackCombo(5);
    analytics.trackCombo(3);
    const report = analytics.generateReport();
    expect(report.session.maxCombo).toBe(5);
  });

  it('tracks level complete', () => {
    analytics.trackLevelComplete('level_1');
    analytics.trackLevelComplete('level_2');
    const report = analytics.generateReport();
    expect(report.session.levelsCompleted).toEqual(['level_1', 'level_2']);
  });

  it('tracks item use', () => {
    analytics.trackItemUse('sword');
    analytics.trackItemUse('sword');
    analytics.trackItemUse('shield');
    const report = analytics.generateReport();
    expect(report.session.itemsUsed['sword']).toBe(2);
    expect(report.session.itemsUsed['shield']).toBe(1);
  });

  it('tracks input', () => {
    analytics.trackInput('ArrowRight', 100);
    const report = analytics.generateReport();
    expect(report.session.inputs).toHaveLength(1);
    expect(report.session.inputs[0].key).toBe('ArrowRight');
  });

  it('resets session', () => {
    analytics.trackDeath(0, 0, 'fall');
    analytics.reset();
    const report = analytics.generateReport();
    expect(report.session.totalDeaths).toBe(0);
  });

  it('endSession sets endTime', () => {
    vi.advanceTimersByTime(5000);
    const report = analytics.endSession();
    expect(report.session.endTime).toBeGreaterThan(0);
  });

  it('generates report with metrics', () => {
    vi.advanceTimersByTime(60000);
    analytics.trackDeath(100, 100, 'lava');
    analytics.trackKill(200, 200, 'enemy');
    const report = analytics.generateReport();
    expect(report.metrics).toBeDefined();
    expect(report.metrics.avgDeathsPerMinute).toBeGreaterThanOrEqual(0);
    expect(report.metrics.avgKillsPerMinute).toBeGreaterThanOrEqual(0);
  });

  it('generates achievements', () => {
    vi.advanceTimersByTime(65000);
    analytics.trackCombo(10);
    const report = analytics.generateReport();
    expect(report.achievements).toContain('Combo King');
  });
});
