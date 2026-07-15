interface GameSession {
  id: string;
  gameName: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  wave: number;
  enemiesDefeated: number;
  itemsCollected: number;
  deaths: number;
  highestCombo: number;
  result: 'victory' | 'game_over' | 'abandoned';
}

interface GameStatistics {
  totalSessions: number;
  totalPlayTime: number;
  totalScore: number;
  totalKills: number;
  totalDeaths: number;
  highestScore: number;
  highestWave: number;
  highestCombo: number;
  favoriteGame: string;
  averageSessionDuration: number;
  winRate: number;
  recentSessions: GameSession[];
}

const STORAGE_KEY = 'kidcode_game_stats';
const MAX_RECENT = 20;

function loadStats(): GameStatistics {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* localStorage unavailable or corrupt — use defaults */ }
  return {
    totalSessions: 0, totalPlayTime: 0, totalScore: 0,
    totalKills: 0, totalDeaths: 0, highestScore: 0,
    highestWave: 0, highestCombo: 0, favoriteGame: '',
    averageSessionDuration: 0, winRate: 0, recentSessions: [],
  };
}

function saveStats(stats: GameStatistics) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* localStorage unavailable */ }
}

export function recordGameSession(session: Omit<GameSession, 'id' | 'duration'>) {
  const stats = loadStats();
  const duration = Math.floor((session.endTime - session.startTime) / 1000);
  const fullSession: GameSession = {
    ...session,
    id: `session_${Date.now()}`,
    duration,
  };
  stats.totalSessions++;
  stats.totalPlayTime += duration;
  stats.totalScore += session.score;
  stats.totalKills += session.enemiesDefeated;
  stats.totalDeaths += session.deaths;
  stats.highestScore = Math.max(stats.highestScore, session.score);
  stats.highestWave = Math.max(stats.highestWave, session.wave);
  stats.highestCombo = Math.max(stats.highestCombo, session.highestCombo);
  stats.averageSessionDuration = Math.floor(stats.totalPlayTime / stats.totalSessions);
  const victories = stats.recentSessions.filter(s => s.result === 'victory').length + (session.result === 'victory' ? 1 : 0);
  stats.winRate = stats.totalSessions > 0 ? Math.round((victories / stats.totalSessions) * 100) : 0;
  stats.recentSessions.unshift(fullSession);
  if (stats.recentSessions.length > MAX_RECENT) stats.recentSessions.pop();
  // Track favorite game
  const gameCounts: Record<string, number> = {};
  stats.recentSessions.forEach(s => { gameCounts[s.gameName] = (gameCounts[s.gameName] || 0) + 1; });
  stats.favoriteGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  saveStats(stats);
}

export function getGameStatistics(): GameStatistics {
  return loadStats();
}

export function resetGameStatistics() {
  saveStats({
    totalSessions: 0, totalPlayTime: 0, totalScore: 0,
    totalKills: 0, totalDeaths: 0, highestScore: 0,
    highestWave: 0, highestCombo: 0, favoriteGame: '',
    averageSessionDuration: 0, winRate: 0, recentSessions: [],
  });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export type { GameSession, GameStatistics };
