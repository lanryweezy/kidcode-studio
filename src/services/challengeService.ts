import { DAILY_CHALLENGES, DailyChallenge } from '../constants/dailyChallenges';

const STORAGE_KEY = 'kidcode_progress';

export interface ChallengeProgress {
  completedChallenges: string[];
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string;
  todayCompleted: string[];
  totalXpEarned: number;
  totalCoinsEarned: number;
  challengesAttempted: Record<string, { attempts: number; bestTime: number; completed: boolean }>;
}

function loadProgress(): ChallengeProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    completedChallenges: [],
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: '',
    todayCompleted: [],
    totalXpEarned: 0,
    totalCoinsEarned: 0,
    challengesAttempted: {},
  };
}

function saveProgress(progress: ChallengeProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getDateSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return year * 10000 + (month + 1) * 100 + day;
}

export function getTodayChallenges(): DailyChallenge[] {
  const progress = loadProgress();
  const today = getTodayString();

  if (progress.lastPlayDate !== today) {
    progress.todayCompleted = [];
    progress.lastPlayDate = today;
    saveProgress(progress);
  }

  const seed = getDateSeed(new Date());
  const rng = seededRandom(seed);

  const easy = DAILY_CHALLENGES.filter(c => c.difficulty === 'easy');
  const medium = DAILY_CHALLENGES.filter(c => c.difficulty === 'medium');
  const hard = DAILY_CHALLENGES.filter(c => c.difficulty === 'hard');

  const pickOne = (arr: DailyChallenge[]): DailyChallenge => {
    const idx = Math.floor(rng() * arr.length);
    return arr[idx];
  };

  return [pickOne(easy), pickOne(medium), pickOne(hard)];
}

export function isChallengeCompletedToday(challengeId: string): boolean {
  const progress = loadProgress();
  return progress.todayCompleted.includes(challengeId);
}

export function completeChallenge(challenge: DailyChallenge, timeSpent: number): { xp: number; coins: number; badge?: string } {
  const progress = loadProgress();
  const today = getTodayString();

  if (progress.lastPlayDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (progress.lastPlayDate === yesterdayStr) {
      progress.currentStreak++;
    } else if (progress.lastPlayDate !== today) {
      progress.currentStreak = 1;
    }
    progress.lastPlayDate = today;
    progress.todayCompleted = [];
  }

  if (!progress.todayCompleted.includes(challenge.id)) {
    progress.todayCompleted.push(challenge.id);
  }

  if (!progress.completedChallenges.includes(challenge.id)) {
    progress.completedChallenges.push(challenge.id);
  }

  const attempt = progress.challengesAttempted[challenge.id] || { attempts: 0, bestTime: Infinity, completed: false };
  attempt.attempts++;
  attempt.bestTime = Math.min(attempt.bestTime, timeSpent);
  attempt.completed = true;
  progress.challengesAttempted[challenge.id] = attempt;

  progress.totalXpEarned += challenge.rewards.xp;
  progress.totalCoinsEarned += challenge.rewards.coins;
  progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);

  saveProgress(progress);

  return challenge.rewards;
}

export function validateChallenge(challenge: DailyChallenge, commands: any[]): { passed: boolean; missing: string[] } {
  const blockTypes = new Set<string>();
  for (const cmd of commands) {
    if (cmd.type) blockTypes.add(cmd.type);
    if (cmd.blockType) blockTypes.add(cmd.blockType);
  }

  const missing: string[] = [];
  for (const required of challenge.requiredBlocks) {
    let found = false;
    for (const bt of blockTypes) {
      if (bt.includes(required) || required.includes(bt)) {
        found = true;
        break;
      }
    }
    if (!found) missing.push(required);
  }

  return { passed: missing.length === 0, missing };
}

export function getChallengeProgress(): ChallengeProgress {
  return loadProgress();
}

export function getStreakDays(): number {
  return loadProgress().currentStreak;
}

export function getTotalChallengesCompleted(): number {
  return loadProgress().completedChallenges.length;
}

export function updateStreak(): void {
  const progress = loadProgress();
  const today = getTodayString();

  if (progress.lastPlayDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (progress.lastPlayDate === yesterdayStr) {
    progress.currentStreak++;
  } else if (progress.lastPlayDate !== today) {
    progress.currentStreak = 1;
  }

  progress.lastPlayDate = today;
  saveProgress(progress);
}
