/**
 * Game Analytics Dashboard - Ported from Timeframe Analytics
 * Real-time play tracking, heatmaps, retention, performance metrics
 */

export interface PlaySession {
  id: string;
  startTime: number;
  endTime: number;
  totalDeaths: number;
  totalKills: number;
  totalCoins: number;
  maxCombo: number;
  levelsCompleted: string[];
  itemsUsed: Record<string, number>;
  positions: { x: number; y: number; time: number }[];
  damageTaken: { amount: number; x: number; y: number; source: string; time: number }[];
  damageDealt: { amount: number; x: number; y: number; target: string; time: number }[];
  inputs: { key: string; time: number; duration: number }[];
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number; // 0-1
  type: 'death' | 'kill' | 'coin' | 'damage' | 'movement';
}

export interface AnalyticsReport {
  session: PlaySession;
  metrics: {
    avgDeathsPerMinute: number;
    avgKillsPerMinute: number;
    survivalTime: number;
    efficiency: number; // kills per death
    exploredPercent: number;
    mostUsedItem: string;
    deathHotspots: HeatmapPoint[];
    killHotspots: HeatmapPoint[];
    movementHeatmap: HeatmapPoint[];
  };
  achievements: string[];
}

export class GameAnalytics {
  private session: PlaySession;
  private positionSampleRate: number = 1000; // ms
  private lastPositionSample: number = 0;

  constructor() {
    this.session = this.createNewSession();
  }

  private createNewSession(): PlaySession {
    return {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      endTime: 0,
      totalDeaths: 0,
      totalKills: 0,
      totalCoins: 0,
      maxCombo: 0,
      levelsCompleted: [],
      itemsUsed: {},
      positions: [],
      damageTaken: [],
      damageDealt: [],
      inputs: [],
    };
  }

  reset(): void {
    this.session = this.createNewSession();
  }

  trackDeath(x: number, y: number, source: string): void {
    this.session.totalDeaths++;
    this.session.damageTaken.push({ amount: 999, x, y, source, time: Date.now() - this.session.startTime });
  }

  trackKill(x: number, y: number, target: string): void {
    this.session.totalKills++;
    this.session.damageDealt.push({ amount: 10, x, y, target, time: Date.now() - this.session.startTime });
  }

  trackCoin(x: number, y: number): void {
    this.session.totalCoins++;
  }

  trackCombo(combo: number): void {
    this.session.maxCombo = Math.max(this.session.maxCombo, combo);
  }

  trackLevelComplete(levelId: string): void {
    this.session.levelsCompleted.push(levelId);
  }

  trackItemUse(itemId: string): void {
    this.session.itemsUsed[itemId] = (this.session.itemsUsed[itemId] || 0) + 1;
  }

  trackPosition(x: number, y: number): void {
    const now = Date.now();
    if (now - this.lastPositionSample > this.positionSampleRate) {
      this.session.positions.push({ x, y, time: now - this.session.startTime });
      this.lastPositionSample = now;
    }
  }

  trackInput(key: string, duration: number): void {
    this.session.inputs.push({ key, time: Date.now() - this.session.startTime, duration });
  }

  endSession(): AnalyticsReport {
    this.session.endTime = Date.now();
    return this.generateReport();
  }

  generateReport(): AnalyticsReport {
    const s = this.session;
    const duration = (s.endTime || Date.now()) - s.startTime;
    const minutes = duration / 60000;

    // Generate heatmaps
    const deathHotspots = this.generateHeatmap(
      s.damageTaken.filter(d => d.amount >= 999).map(d => ({ x: d.x, y: d.y })),
      800, 600, 'death'
    );

    const killHotspots = this.generateHeatmap(
      s.damageDealt.map(d => ({ x: d.x, y: d.y })),
      800, 600, 'kill'
    );

    const movementHeatmap = this.generateHeatmap(
      s.positions.map(p => ({ x: p.x, y: p.y })),
      800, 600, 'movement'
    );

    // Find most used item
    let mostUsedItem = 'none';
    let maxUses = 0;
    for (const [item, count] of Object.entries(s.itemsUsed)) {
      if (count > maxUses) { maxUses = count; mostUsedItem = item; }
    }

    // Check achievements
    const achievements: string[] = [];
    if (s.totalKills === 0 && duration > 60000) achievements.push('Pacifist');
    if (s.totalDeaths === 0 && duration > 60000) achievements.push('Untouchable');
    if (s.maxCombo >= 10) achievements.push('Combo King');
    if (s.totalCoins >= 50) achievements.push('Treasure Hunter');
    if (s.levelsCompleted.length >= 3) achievements.push('Explorer');
    if (duration > 300000) achievements.push('Dedicated');

    return {
      session: s,
      metrics: {
        avgDeathsPerMinute: minutes > 0 ? s.totalDeaths / minutes : 0,
        avgKillsPerMinute: minutes > 0 ? s.totalKills / minutes : 0,
        survivalTime: duration,
        efficiency: s.totalDeaths > 0 ? s.totalKills / s.totalDeaths : s.totalKills,
        exploredPercent: Math.min(100, (s.positions.length / 100) * 100),
        mostUsedItem,
        deathHotspots,
        killHotspots,
        movementHeatmap,
      },
      achievements,
    };
  }

  private generateHeatmap(points: { x: number; y: number }[], width: number, height: number, type: HeatmapPoint['type']): HeatmapPoint[] {
    const gridSize = 40;
    const grid: Record<string, number> = {};

    for (const p of points) {
      const gx = Math.floor(p.x / gridSize);
      const gy = Math.floor(p.y / gridSize);
      const key = `${gx},${gy}`;
      grid[key] = (grid[key] || 0) + 1;
    }

    const maxVal = Math.max(1, ...Object.values(grid));
    return Object.entries(grid).map(([key, count]) => {
      const [gx, gy] = key.split(',').map(Number);
      return {
        x: gx * gridSize + gridSize / 2,
        y: gy * gridSize + gridSize / 2,
        intensity: count / maxVal,
        type,
      };
    });
  }

  get currentSession(): PlaySession { return this.session; }
}

export const gameAnalytics = new GameAnalytics();

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 12 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── Session History ───

export interface SessionHistory {
  sessions: PlaySession[];
  totalPlayTime: number;
  totalSessions: number;
  averageSessionLength: number;
}

export class SessionHistoryManager {
  private sessions: PlaySession[] = [];
  private maxSessions: number = 50;

  addSession(session: PlaySession): void {
    this.sessions.push(session);
    if (this.sessions.length > this.maxSessions) {
      this.sessions.shift();
    }
  }

  getHistory(): SessionHistory {
    const totalPlayTime = this.sessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    const totalSessions = this.sessions.length;
    const averageSessionLength = totalSessions > 0 ? totalPlayTime / totalSessions : 0;

    return {
      sessions: [...this.sessions],
      totalPlayTime,
      totalSessions,
      averageSessionLength,
    };
  }

  getRecentSessions(count: number = 10): PlaySession[] {
    return this.sessions.slice(-count);
  }

  getBestSession(): PlaySession | null {
    if (this.sessions.length === 0) return null;
    return this.sessions.reduce((best, s) => 
      (s as any).score > ((best as any).score || 0) ? s : best
    , this.sessions[0]);
  }

  getTrend(metric: 'kills' | 'deaths' | 'score', lastN: number = 5): number[] {
    const recent = this.sessions.slice(-lastN);
    return recent.map(s => {
      switch (metric) {
        case 'kills': return s.totalKills;
        case 'deaths': return s.totalDeaths;
        case 'score': return (s as any).score || 0;
        default: return 0;
      }
    });
  }
}

export const sessionHistory = new SessionHistoryManager();

// ─── Performance Metrics ───

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  memoryUsage: number;
  loadTime: number;
}

export class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 500;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 60;

  startFrame(): void {
    this.lastFrameTime = performance.now();
  }

  endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.frameCount++;

    if (now - this.lastFPSUpdate > this.fpsUpdateInterval) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = now;

      this.metrics.push({
        fps: this.currentFPS,
        frameTime,
        drawCalls: 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        loadTime: 0,
      });

      if (this.metrics.length > 100) {
        this.metrics.shift();
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics[this.metrics.length - 1] || {
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      memoryUsage: 0,
      loadTime: 0,
    };
  }

  getAverageFPS(lastN: number = 30): number {
    const recent = this.metrics.slice(-lastN);
    if (recent.length === 0) return 60;
    return Math.round(recent.reduce((sum, m) => sum + m.fps, 0) / recent.length);
  }

  getPerformanceRating(): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgFPS = this.getAverageFPS();
    if (avgFPS >= 55) return 'excellent';
    if (avgFPS >= 45) return 'good';
    if (avgFPS >= 30) return 'fair';
    return 'poor';
  }
}

export const performanceTracker = new PerformanceTracker();

// ─── Player Behavior Analysis ───

export interface PlayerBehavior {
  avgReactionTime: number;
  avgAccuracy: number;
  favoriteWeapon: string;
  playStyle: 'aggressive' | 'defensive' | 'balanced' | 'explorer';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export function analyzePlayerBehavior(session: PlaySession): PlayerBehavior {
  // Calculate average reaction time
  const reactionTimes = session.inputs
    .filter(i => i.key === 'Space' || i.key === 'KeyX')
    .map(i => i.duration);
  const avgReactionTime = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 500;

  // Calculate accuracy (kills / total attacks)
  const totalAttacks = session.inputs.filter(i => i.key === 'KeyX').length;
  const accuracy = totalAttacks > 0 ? session.totalKills / totalAttacks : 0;

  // Determine play style
  const killsPerMinute = session.totalKills / Math.max(1, (session.endTime - session.startTime) / 60000);
  const deathsPerMinute = session.totalDeaths / Math.max(1, (session.endTime - session.startTime) / 60000);

  let playStyle: PlayerBehavior['playStyle'] = 'balanced';
  if (killsPerMinute > 5) playStyle = 'aggressive';
  else if (deathsPerMinute < 0.5) playStyle = 'defensive';
  else if (session.totalCoins > session.totalKills * 2) playStyle = 'explorer';

  // Determine skill level
  let skillLevel: PlayerBehavior['skillLevel'] = 'beginner';
  if (session.maxCombo >= 10) skillLevel = 'expert';
  else if (session.maxCombo >= 5) skillLevel = 'advanced';
  else if (session.maxCombo >= 2) skillLevel = 'intermediate';

  return {
    avgReactionTime,
    avgAccuracy: accuracy,
    favoriteWeapon: 'sword',
    playStyle,
    skillLevel,
  };
}

// ─── Achievement Tracking ───

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (session: PlaySession) => boolean;
  xpReward: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Get your first kill',
    icon: '⚔️',
    condition: (s) => s.totalKills >= 1,
    xpReward: 50,
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Get a 10x combo',
    icon: '🔥',
    condition: (s) => s.maxCombo >= 10,
    xpReward: 100,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Complete a session without dying',
    icon: '🛡️',
    condition: (s) => s.totalDeaths === 0 && s.totalKills >= 5,
    xpReward: 150,
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Complete a level in under 60 seconds',
    icon: '⚡',
    condition: (s) => (s.endTime - s.startTime) < 60000 && s.levelsCompleted.length > 0,
    xpReward: 200,
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Collect 100 coins',
    icon: '💰',
    condition: (s) => s.totalCoins >= 100,
    xpReward: 75,
  },
  {
    id: 'pacifist',
    name: 'Pacifist',
    description: 'Complete a level without killing anyone',
    icon: '☮️',
    condition: (s) => s.totalKills === 0 && s.levelsCompleted.length > 0,
    xpReward: 200,
  },
];

export function checkAchievements(session: PlaySession): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => a.condition(session));
}
