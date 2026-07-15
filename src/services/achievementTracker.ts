import { getGameEventBus, GameEvent } from './gameEventBus';

export interface AchievementDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  xpReward: number;
}

export interface GameStats {
  totalKills: number;
  totalDeaths: number;
  totalScore: number;
  highestWave: number;
  highestCombo: number;
  totalPlayTime: number;
  itemsCollected: number;
  bossesDefeated: number;
  gamesPlayed: number;
  victories: number;
  fuelCollected: number;
  shieldCollected: number;
}

const INITIAL_STATS: GameStats = {
  totalKills: 0,
  totalDeaths: 0,
  totalScore: 0,
  highestWave: 0,
  highestCombo: 0,
  totalPlayTime: 0,
  itemsCollected: 0,
  bossesDefeated: 0,
  gamesPlayed: 0,
  victories: 0,
  fuelCollected: 0,
  shieldCollected: 0,
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first_kill', name: 'First Blood', emoji: '🗡️', description: 'Defeat your first enemy', condition: s => s.totalKills >= 1, xpReward: 25 },
  { id: 'kill_10', name: 'Monster Slayer', emoji: '💀', description: 'Defeat 10 enemies', condition: s => s.totalKills >= 10, xpReward: 50 },
  { id: 'kill_50', name: 'Legendary Hunter', emoji: '⚔️', description: 'Defeat 50 enemies', condition: s => s.totalKills >= 50, xpReward: 100 },
  { id: 'kill_100', name: 'Destroyer of Worlds', emoji: '🌟', description: 'Defeat 100 enemies', condition: s => s.totalKills >= 100, xpReward: 200 },
  { id: 'combo_5', name: 'Combo Master', emoji: '🔥', description: 'Reach a 5x combo', condition: s => s.highestCombo >= 5, xpReward: 50 },
  { id: 'combo_10', name: 'Untouchable', emoji: '💫', description: 'Reach a 10x combo', condition: s => s.highestCombo >= 10, xpReward: 100 },
  { id: 'wave_5', name: 'Wave Rider', emoji: '🌊', description: 'Reach wave 5', condition: s => s.highestWave >= 5, xpReward: 50 },
  { id: 'wave_10', name: 'Endless Survivor', emoji: '🏆', description: 'Reach wave 10', condition: s => s.highestWave >= 10, xpReward: 100 },
  { id: 'score_1000', name: 'High Scorer', emoji: '⭐', description: 'Score 1000 points', condition: s => s.totalScore >= 1000, xpReward: 75 },
  { id: 'score_10000', name: 'Point Master', emoji: '👑', description: 'Score 10,000 points', condition: s => s.totalScore >= 10000, xpReward: 150 },
  { id: 'first_victory', name: 'Champion', emoji: '🏅', description: 'Win your first game', condition: s => s.victories >= 1, xpReward: 100 },
  { id: 'boss_slayer', name: 'Boss Slayer', emoji: '🐉', description: 'Defeat 5 bosses', condition: s => s.bossesDefeated >= 5, xpReward: 150 },
  { id: 'collector', name: 'Item Collector', emoji: '🎒', description: 'Collect 50 items', condition: s => s.itemsCollected >= 50, xpReward: 75 },
  { id: 'veteran', name: 'Veteran Player', emoji: '🎖️', description: 'Play 10 games', condition: s => s.gamesPlayed >= 10, xpReward: 50 },
  { id: 'no_damage', name: 'Untouchable', emoji: '🛡️', description: 'Complete a wave without taking damage', condition: s => s.totalDeaths === 0 && s.highestWave >= 3, xpReward: 200 },
];

export class AchievementTracker {
  private stats: GameStats = { ...INITIAL_STATS };
  private unlockedAchievements: Set<string> = new Set();
  private pendingNotifications: { id: string; name: string; emoji: string; description: string }[] = [];
  private unsubscribers: (() => void)[] = [];

  constructor() {
    this.loadStats();
    this.setupListeners();
  }

  private setupListeners() {
    const bus = getGameEventBus();
    this.unsubscribers.push(
      bus.on('enemy_defeated', (e) => {
        this.stats.totalKills++;
        if (e.type === 'enemy_defeated' && e.enemyType === 'boss') {
          this.stats.bossesDefeated++;
        }
      }),
      bus.on('item_collected', () => { this.stats.itemsCollected++; }),
      bus.on('player_damaged', () => { this.stats.totalDeaths++; }),
      bus.on('wave_complete', (e) => {
        if (e.type === 'wave_complete') {
          this.stats.highestWave = Math.max(this.stats.highestWave, e.wave);
        }
      }),
      bus.on('combo_achieved', (e) => {
        if (e.type === 'combo_achieved') {
          this.stats.highestCombo = Math.max(this.stats.highestCombo, e.combo);
        }
      }),
      bus.on('victory', (e) => {
        this.stats.victories++;
        if (e.type === 'victory') {
          this.stats.totalScore += e.score;
        }
      }),
      bus.on('game_over', (e) => {
        this.stats.gamesPlayed++;
        if (e.type === 'game_over') {
          this.stats.totalScore += e.score;
        }
      }),
    );
  }

  checkAchievements() {
    for (const achievement of ACHIEVEMENTS) {
      if (!this.unlockedAchievements.has(achievement.id) && achievement.condition(this.stats)) {
        this.unlockedAchievements.add(achievement.id);
        this.pendingNotifications.push({
          id: achievement.id,
          name: achievement.name,
          emoji: achievement.emoji,
          description: achievement.description,
        });
        this.saveStats();
      }
    }
  }

  getPendingNotification() {
    return this.pendingNotifications.shift() || null;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getUnlockedAchievements(): string[] {
    return [...this.unlockedAchievements];
  }

  reset() {
    this.stats = { ...INITIAL_STATS };
    this.unlockedAchievements.clear();
    this.pendingNotifications = [];
    this.saveStats();
  }

  private saveStats() {
    try {
      localStorage.setItem('kidcode_achievements', JSON.stringify({
        stats: this.stats,
        unlocked: [...this.unlockedAchievements],
      }));
    } catch { /* localStorage unavailable */ }
  }

  private loadStats() {
    try {
      const data = localStorage.getItem('kidcode_achievements');
      if (data) {
        const parsed = JSON.parse(data);
        this.stats = { ...INITIAL_STATS, ...parsed.stats };
        this.unlockedAchievements = new Set(parsed.unlocked || []);
      }
    } catch { /* localStorage unavailable or corrupt — use defaults */ }
  }

  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}
