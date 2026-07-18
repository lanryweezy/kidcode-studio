import { AppMode } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'coding' | 'building' | 'social' | 'exploration' | 'mastery';
  requirement: {
    type: 'blocks_placed' | 'projects_created' | 'challenges_completed' | 'lines_of_code' | 'time_spent' | 'modes_tried' | 'exports_made' | 'likes_received' | 'remixes_made' | 'streak';
    count: number;
  };
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a01', name: 'First Block', description: 'Place your first block', icon: '🧩', category: 'coding', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a02', name: 'Block Builder', description: 'Place 100 blocks', icon: '🏗️', category: 'coding', requirement: { type: 'blocks_placed', count: 100 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a03', name: 'Code Artist', description: 'Place 1000 blocks', icon: '🎨', category: 'coding', requirement: { type: 'blocks_placed', count: 1000 }, xpReward: 200, rarity: 'rare' },
  { id: 'a04', name: 'Loop Master', description: 'Use 10 REPEAT blocks in one project', icon: '🔁', category: 'coding', requirement: { type: 'blocks_placed', count: 10 }, xpReward: 25, rarity: 'common' },
  { id: 'a05', name: 'Conditional Genius', description: 'Use 5 IF blocks in one project', icon: '🤔', category: 'coding', requirement: { type: 'blocks_placed', count: 5 }, xpReward: 25, rarity: 'common' },
  { id: 'a06', name: 'Variable Virtuoso', description: 'Use 10 different variables', icon: '📊', category: 'coding', requirement: { type: 'blocks_placed', count: 10 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a07', name: 'Event Expert', description: 'Use 5 different event blocks', icon: '⚡', category: 'coding', requirement: { type: 'blocks_placed', count: 5 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a08', name: 'Sound Designer', description: 'Use 10 sound blocks', icon: '🎵', category: 'coding', requirement: { type: 'blocks_placed', count: 10 }, xpReward: 25, rarity: 'common' },
  { id: 'a09', name: 'Motion Maestro', description: 'Use all movement blocks in one project', icon: '🏃', category: 'coding', requirement: { type: 'blocks_placed', count: 8 }, xpReward: 100, rarity: 'rare' },
  { id: 'a10', name: 'Full Stack', description: 'Use blocks from all categories', icon: '🌟', category: 'coding', requirement: { type: 'blocks_placed', count: 20 }, xpReward: 300, rarity: 'epic' },

  { id: 'a11', name: 'First Project', description: 'Create your first project', icon: '📁', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a12', name: 'Prolific Creator', description: 'Create 10 projects', icon: '📚', category: 'building', requirement: { type: 'projects_created', count: 10 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a13', name: 'Project Master', description: 'Create 50 projects', icon: '🏆', category: 'building', requirement: { type: 'projects_created', count: 50 }, xpReward: 200, rarity: 'rare' },
  { id: 'a14', name: 'Game Maker', description: 'Create a game project', icon: '🎮', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 25, rarity: 'common' },
  { id: 'a15', name: 'App Builder', description: 'Create an app project', icon: '📱', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 25, rarity: 'common' },
  { id: 'a16', name: 'Circuit Wizard', description: 'Create a hardware project', icon: '🔌', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 25, rarity: 'common' },
  { id: 'a17', name: 'Minecraft Architect', description: 'Create a Minecraft project', icon: '⛏️', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 25, rarity: 'common' },
  { id: 'a18', name: 'CAD Engineer', description: 'Create a CAD project', icon: '📐', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 25, rarity: 'common' },
  { id: 'a19', name: '3D Modeler', description: 'Create a 3D scene', icon: '🧊', category: 'building', requirement: { type: 'projects_created', count: 1 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a20', name: 'Polyglot', description: 'Create projects in all 5 modes', icon: '🌍', category: 'building', requirement: { type: 'modes_tried', count: 5 }, xpReward: 500, rarity: 'epic' },

  { id: 'a21', name: 'First Share', description: 'Publish your first project', icon: '📤', category: 'social', requirement: { type: 'exports_made', count: 1 }, xpReward: 25, rarity: 'common' },
  { id: 'a22', name: 'Popular', description: 'Get 10 likes on a project', icon: '👍', category: 'social', requirement: { type: 'likes_received', count: 10 }, xpReward: 100, rarity: 'uncommon' },
  { id: 'a23', name: 'Star Creator', description: 'Get 100 likes', icon: '⭐', category: 'social', requirement: { type: 'likes_received', count: 100 }, xpReward: 300, rarity: 'rare' },
  { id: 'a24', name: 'Remix Artist', description: 'Remix 5 projects', icon: '🔀', category: 'social', requirement: { type: 'remixes_made', count: 5 }, xpReward: 25, rarity: 'common' },
  { id: 'a25', name: 'Community Helper', description: 'Comment on 10 projects', icon: '💬', category: 'social', requirement: { type: 'likes_received', count: 10 }, xpReward: 25, rarity: 'common' },
  { id: 'a26', name: 'Trending', description: 'Get a project in the trending list', icon: '📈', category: 'social', requirement: { type: 'likes_received', count: 50 }, xpReward: 200, rarity: 'rare' },
  { id: 'a27', name: 'Viral', description: 'Get 500 likes on a project', icon: '🔥', category: 'social', requirement: { type: 'likes_received', count: 500 }, xpReward: 1000, rarity: 'legendary' },
  { id: 'a28', name: 'Collaborator', description: 'Share a project viewed 50 times', icon: '🤝', category: 'social', requirement: { type: 'exports_made', count: 50 }, xpReward: 100, rarity: 'uncommon' },
  { id: 'a29', name: 'Inspiration', description: 'Get 5 remixes of your project', icon: '💡', category: 'social', requirement: { type: 'remixes_made', count: 5 }, xpReward: 200, rarity: 'rare' },
  { id: 'a30', name: 'Hall of Fame', description: 'Get 1000 likes total', icon: '👑', category: 'social', requirement: { type: 'likes_received', count: 1000 }, xpReward: 2000, rarity: 'legendary' },

  { id: 'a31', name: 'Explorer', description: 'Try all sidebar tabs', icon: '🧭', category: 'exploration', requirement: { type: 'modes_tried', count: 5 }, xpReward: 10, rarity: 'common' },
  { id: 'a32', name: 'Keyboard Warrior', description: 'Use 10 keyboard shortcuts', icon: '⌨️', category: 'exploration', requirement: { type: 'blocks_placed', count: 10 }, xpReward: 25, rarity: 'common' },
  { id: 'a33', name: 'Pixel Perfect', description: 'Use the pixel editor', icon: '🖼️', category: 'exploration', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a34', name: 'Music Maker', description: 'Use the music studio', icon: '🎹', category: 'exploration', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a35', name: 'Sound Lab', description: 'Record a custom sound', icon: '🎤', category: 'exploration', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a36', name: 'AI Assistant', description: 'Use the AI chat', icon: '🤖', category: 'exploration', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a37', name: '3D Explorer', description: 'Open the 3D Design Studio', icon: '🌐', category: 'exploration', requirement: { type: 'modes_tried', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a38', name: 'CAD Cadet', description: 'Use an extrude operation', icon: '🔲', category: 'exploration', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 10, rarity: 'common' },
  { id: 'a39', name: 'Export Pro', description: 'Export a project in 3 different formats', icon: '📦', category: 'exploration', requirement: { type: 'exports_made', count: 3 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'a40', name: 'Tour Guide', description: 'Complete the first-run tutorial', icon: '🎓', category: 'exploration', requirement: { type: 'blocks_placed', count: 1 }, xpReward: 10, rarity: 'common' },

  { id: 'a41', name: 'Streak Starter', description: '3-day coding streak', icon: '🔥', category: 'mastery', requirement: { type: 'streak', count: 3 }, xpReward: 25, rarity: 'common' },
  { id: 'a42', name: 'Week Warrior', description: '7-day coding streak', icon: '⚔️', category: 'mastery', requirement: { type: 'streak', count: 7 }, xpReward: 100, rarity: 'uncommon' },
  { id: 'a43', name: 'Month Master', description: '30-day coding streak', icon: '🗓️', category: 'mastery', requirement: { type: 'streak', count: 30 }, xpReward: 500, rarity: 'rare' },
  { id: 'a44', name: 'Challenge Champion', description: 'Complete 10 challenges', icon: '🏅', category: 'mastery', requirement: { type: 'challenges_completed', count: 10 }, xpReward: 100, rarity: 'uncommon' },
  { id: 'a45', name: 'Challenge Legend', description: 'Complete 50 challenges', icon: '🎖️', category: 'mastery', requirement: { type: 'challenges_completed', count: 50 }, xpReward: 500, rarity: 'rare' },
  { id: 'a46', name: 'Challenge God', description: 'Complete all 30 challenges', icon: '💎', category: 'mastery', requirement: { type: 'challenges_completed', count: 30 }, xpReward: 1000, rarity: 'epic' },
  { id: 'a47', name: 'Speed Runner', description: 'Complete a timed challenge in under 60 seconds', icon: '⚡', category: 'mastery', requirement: { type: 'challenges_completed', count: 1 }, xpReward: 200, rarity: 'rare' },
  { id: 'a48', name: 'Perfectionist', description: 'Get 3 stars on 10 challenges', icon: '🌟', category: 'mastery', requirement: { type: 'challenges_completed', count: 10 }, xpReward: 500, rarity: 'epic' },
  { id: 'a49', name: 'Completionist', description: 'Unlock all other achievements', icon: '🏆', category: 'mastery', requirement: { type: 'challenges_completed', count: 30 }, xpReward: 5000, rarity: 'legendary' },
  { id: 'a50', name: 'KidCode Legend', description: 'Reach level 50', icon: '👑', category: 'mastery', requirement: { type: 'streak', count: 50 }, xpReward: 10000, rarity: 'legendary' },
];

const ACHIEVEMENTS_STORAGE_KEY = 'kidcode_achievements_data';

export interface AchievementState {
  unlocked: string[];
  pendingPopups: Achievement[];
}

let achievementState: AchievementState = {
  unlocked: [],
  pendingPopups: [],
};

function loadAchievementState(): void {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      achievementState.unlocked = parsed.unlocked || [];
    }
  } catch {}
}

function saveAchievementState(): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify({
      unlocked: achievementState.unlocked,
    }));
  } catch {}
}

loadAchievementState();

let userStats: Record<string, number> = {};
let modesUsed: Set<string> = new Set();

function loadUserStats(): void {
  try {
    const raw = localStorage.getItem('kidcode_user_stats');
    if (raw) {
      const parsed = JSON.parse(raw);
      userStats = parsed.stats || {};
      modesUsed = new Set(parsed.modesUsed || []);
    }
  } catch {}
}

function saveUserStats(): void {
  try {
    localStorage.setItem('kidcode_user_stats', JSON.stringify({
      stats: userStats,
      modesUsed: Array.from(modesUsed),
    }));
  } catch {}
}

loadUserStats();

export function trackAction(actionType: string, count: number = 1): void {
  userStats[actionType] = (userStats[actionType] || 0) + count;
  saveUserStats();
}

export function trackModeUsed(mode: AppMode): void {
  modesUsed.add(mode);
  saveUserStats();
}

export function getStatCount(statType: string): number {
  return userStats[statType] || 0;
}

export function getModesUsed(): string[] {
  return Array.from(modesUsed);
}

function checkAchievement(achievement: Achievement, stats: Record<string, number>, modes: Set<string>): boolean {
  const { type, count } = achievement.requirement;

  switch (type) {
    case 'blocks_placed':
      return (stats['blocks_placed'] || 0) >= count;
    case 'projects_created':
      return (stats['projects_created'] || 0) >= count;
    case 'challenges_completed':
      return (stats['challenges_completed'] || 0) >= count;
    case 'lines_of_code':
      return (stats['lines_of_code'] || 0) >= count;
    case 'time_spent':
      return (stats['time_spent'] || 0) >= count;
    case 'modes_tried':
      return modes.size >= count;
    case 'exports_made':
      return (stats['exports_made'] || 0) >= count;
    case 'likes_received':
      return (stats['likes_received'] || 0) >= count;
    case 'remixes_made':
      return (stats['remixes_made'] || 0) >= count;
    case 'streak':
      return (stats['streak'] || 0) >= count;
    default:
      return false;
  }
}

export function checkAndUnlockAchievements(): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (achievementState.unlocked.includes(achievement.id)) continue;
    if (checkAchievement(achievement, userStats, modesUsed)) {
      achievementState.unlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveAchievementState();
    achievementState.pendingPopups.push(...newlyUnlocked);
  }

  return newlyUnlocked;
}

export function getNextAchievement(): Achievement | null {
  return achievementState.pendingPopups.shift() || null;
}

export function hasPendingAchievements(): boolean {
  return achievementState.pendingPopups.length > 0;
}

export function getUnlockedAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => achievementState.unlocked.includes(a.id));
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getUnlockedCount(): number {
  return achievementState.unlocked.length;
}

export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length;
}

export function getAllAchievements(): Achievement[] {
  return [...ACHIEVEMENTS];
}

export function isAchievementUnlocked(id: string): boolean {
  return achievementState.unlocked.includes(id);
}
