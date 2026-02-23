import { UserProfile, Badge, Quest, Trophy } from '../types';
import { updateUserName, updateUserAvatar } from './userService';

const USER_STORAGE_KEY = 'kidcode_user_profile';
const QUESTS_STORAGE_KEY = 'kidcode_quests';
const TROPHIES_STORAGE_KEY = 'kidcode_trophies';

// === BADGE DEFINITIONS (20+ Badges) ===
export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  // Getting Started (5)
  { id: 'first_steps', name: 'First Steps', icon: '🏆', description: 'Complete your first project', xpReward: 50 },
  { id: 'hello_world', name: 'Hello World', icon: '👋', description: 'Run your first block of code', xpReward: 20 },
  { id: 'explorer', name: 'Explorer', icon: '🧭', description: 'Try all 3 modes (App, Game, Hardware)', xpReward: 100 },
  { id: 'tinkerer', name: 'Tinkerer', icon: '🔧', description: 'Edit 10 blocks', xpReward: 30 },
  { id: 'saved_work', name: 'Saver', icon: '💾', description: 'Save your first project', xpReward: 25 },

  // Coding Skills (5)
  { id: 'loop_master', name: 'Loop Master', icon: '🔄', description: 'Use 20 loop blocks', xpReward: 75 },
  { id: 'logic_wizard', name: 'Logic Wizard', icon: '🧙', description: 'Use 30 IF/ELSE blocks', xpReward: 100 },
  { id: 'variable_virtuoso', name: 'Variable Virtuoso', icon: '📦', description: 'Create 10 variables', xpReward: 60 },
  { id: 'debug_detective', name: 'Debug Detective', icon: '🔍', description: 'Fix 5 bugs in your code', xpReward: 80 },
  { id: 'efficient_coder', name: 'Efficient Coder', icon: '⚡', description: 'Complete a project with under 20 blocks', xpReward: 50 },

  // Creativity (4)
  { id: 'artist', name: 'Artist', icon: '🎨', description: 'Create 5 custom sprites', xpReward: 70 },
  { id: 'storyteller', name: 'Storyteller', icon: '📖', description: 'Create a game with dialogue', xpReward: 80 },
  { id: 'music_maker', name: 'Music Maker', icon: '🎵', description: 'Add sound to 3 projects', xpReward: 60 },
  { id: 'designer', name: 'Designer', icon: '✨', description: 'Create a beautiful UI with 10+ elements', xpReward: 75 },

  // Persistence (3)
  { id: 'dedicated', name: 'Dedicated', icon: '🔥', description: '7-day login streak', xpReward: 200 },
  { id: 'committed', name: 'Committed', icon: '💪', description: '30-day login streak', xpReward: 500 },
  { id: 'legendary', name: 'Legendary', icon: '👑', description: '100-day login streak', xpReward: 1000 },

  // Community (3)
  { id: 'sharer', name: 'Sharer', icon: '📤', description: 'Publish your first project', xpReward: 100 },
  { id: 'remixer', name: 'Remixer', icon: '🎛️', description: 'Remix 5 projects', xpReward: 75 },
  { id: 'community_star', name: 'Community Star', icon: '🌟', description: 'Get 100 likes on a project', xpReward: 300 },

  // Advanced (3)
  { id: 'python_exporter', name: 'Python Pro', icon: '🐍', description: 'Export a project to Python', xpReward: 100 },
  { id: 'js_exporter', name: 'JavaScript Jedi', icon: '📜', description: 'Export a project to JavaScript', xpReward: 100 },
  { id: 'hardware_hero', name: 'Hardware Hero', icon: '🤖', description: 'Connect to real hardware', xpReward: 200 },
];

// === QUEST DEFINITIONS ===
export const DAILY_QUESTS: Omit<Quest, 'completed'>[] = [
  { id: 'daily_run_code', name: 'Quick Run', description: 'Run your code 5 times', xpReward: 30, difficulty: 'easy' },
  { id: 'daily_add_blocks', name: 'Builder', description: 'Add 10 blocks to any project', xpReward: 40, difficulty: 'easy' },
  { id: 'daily_save', name: 'Safe Keeper', description: 'Save a project', xpReward: 20, difficulty: 'easy' },
  { id: 'daily_try_mode', name: 'Explorer', description: 'Switch to a different mode', xpReward: 25, difficulty: 'easy' },
  { id: 'daily_ai_chat', name: 'AI Learner', description: 'Ask the AI assistant a question', xpReward: 35, difficulty: 'medium' },
];

export const WEEKLY_QUESTS: Omit<Quest, 'completed'>[] = [
  { id: 'weekly_projects', name: 'Prolific Creator', description: 'Create 3 projects', xpReward: 150, difficulty: 'medium' },
  { id: 'weekly_game', name: 'Game Developer', description: 'Complete a game with win condition', xpReward: 200, difficulty: 'hard' },
  { id: 'weekly_app', name: 'App Developer', description: 'Build an app with 3+ screens', xpReward: 200, difficulty: 'hard' },
  { id: 'weekly_circuit', name: 'Engineer', description: 'Build a working circuit simulation', xpReward: 200, difficulty: 'hard' },
  { id: 'weekly_export', name: 'Code Exporter', description: 'Export a project to text code', xpReward: 150, difficulty: 'medium' },
  { id: 'weekly_share', name: 'Community Contributor', description: 'Publish or share a project', xpReward: 175, difficulty: 'medium' },
];

// === TROPHY DEFINITIONS (Rare Achievements) ===
export const TROPHY_DEFINITIONS: Omit<Trophy, 'unlockedAt'>[] = [
  { id: 'grand_master', name: 'Grand Master', icon: '🏅', description: 'Reach level 50', rarity: 'legendary' },
  { id: 'code_ninja', name: 'Code Ninja', icon: '🥷', description: 'Use 500 blocks in a single project', rarity: 'legendary' },
  { id: 'innovation_award', name: 'Innovation Award', icon: '💡', description: 'Create a project with 1000+ likes', rarity: 'legendary' },
  { id: 'mentor', name: 'Mentor', icon: '🎓', description: 'Help 50 other learners (via remixes/comments)', rarity: 'epic' },
  { id: 'marathon_coder', name: 'Marathon Coder', icon: '🏃', description: 'Code for 5 hours in a single session', rarity: 'epic' },
  { id: 'polyglot', name: 'Polyglot', icon: '🌍', description: 'Export to Python, JavaScript, and Arduino', rarity: 'epic' },
  { id: 'game_designer', name: 'Game Designer', icon: '🎮', description: 'Create 10 complete games', rarity: 'rare' },
  { id: 'app_master', name: 'App Master', icon: '📱', description: 'Create 10 complete apps', rarity: 'rare' },
  { id: 'circuit_wizard', name: 'Circuit Wizard', icon: '⚡', description: 'Build 10 working circuits', rarity: 'rare' },
  { id: 'year_coder', name: 'Year of Code', icon: '📅', description: '365-day login streak', rarity: 'legendary' },
];

// === HELPER FUNCTIONS ===

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultValue();
  } catch {
    return getDefaultValue();
  }
};

const getDefaultValue = (): UserProfile => ({
  id: 'default-user',
  name: 'Junior Coder',
  avatar: '🚀',
  xp: 0,
  level: 1,
  coins: 0,
  plan: 'free',
  streak: 1,
  badges: [],
  quests: [],
  trophies: [],
  projects: [],
  creatorScore: 0,
  skillTree: [],
  cosmetics: [],
  leaderboards: []
});

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
};

// === STREAK SYSTEM ===

export const updateStreak = (): { profile: UserProfile, isNewStreak: boolean } => {
  const profile = getUserProfile();
  const now = new Date();
  const lastLoginStr = localStorage.getItem('kidcode_last_login');
  let isNewStreak = false;

  if (lastLoginStr) {
    const lastLogin = new Date(lastLoginStr);
    const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      profile.streak += 1;
      isNewStreak = true;
      // Check streak badges
      checkAndUnlockBadge(profile, 'dedicated'); // 7 days
      checkAndUnlockBadge(profile, 'committed'); // 30 days
      checkAndUnlockBadge(profile, 'legendary'); // 100 days
    } else if (diffDays > 1) {
      profile.streak = 1;
    }
  } else {
    profile.streak = 1;
    isNewStreak = true;
  }

  localStorage.setItem('kidcode_last_login', now.toISOString());
  saveUserProfile(profile);
  return { profile, isNewStreak };
};

// === BADGE SYSTEM ===

export const checkAndUnlockBadge = (profile: UserProfile, badgeId: string): boolean => {
  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
  if (!badgeDef) return false;

  const hasBadge = profile.badges.some(b => b.id === badgeId);
  if (!hasBadge) {
    profile.badges.push({
      ...badgeDef,
      unlockedAt: new Date().toISOString()
    });
    profile.xp += badgeDef.xpReward || 50;
    saveUserProfile(profile);
    return true;
  }
  return false;
};

export const unlockBadge = (badgeId: string): { unlocked: boolean; badge?: Badge } => {
  const profile = getUserProfile();
  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);

  if (!badgeDef) return { unlocked: false };

  const hasBadge = profile.badges.some(b => b.id === badgeId);
  if (!hasBadge) {
    const badge: Badge = {
      ...badgeDef,
      unlockedAt: new Date().toISOString()
    };
    profile.badges.push(badge);
    profile.xp += badgeDef.xpReward || 50;
    saveUserProfile(profile);
    return { unlocked: true, badge };
  }
  return { unlocked: false };
};

export const getAllBadges = (): (Badge & { progress?: number; maxProgress?: number })[] => {
  const profile = getUserProfile();
  return BADGE_DEFINITIONS.map(def => {
    const unlocked = profile.badges.find(b => b.id === def.id);
    return {
      ...def,
      unlockedAt: unlocked?.unlockedAt,
      progress: unlocked ? 100 : 0,
      maxProgress: 100
    };
  });
};

// === QUEST SYSTEM ===

export const getDailyQuests = (): Quest[] => {
  const stored = localStorage.getItem(QUESTS_STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    if (data.date === today) {
      return data.quests;
    }
  }

  // Generate new daily quests
  const shuffled = [...DAILY_QUESTS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3).map(q => ({ ...q, completed: false }));

  localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify({
    date: new Date().toDateString(),
    quests: selected
  }));

  return selected;
};

export const getWeeklyQuests = (): Quest[] => {
  const stored = localStorage.getItem('kidcode_weekly_quests');
  const currentWeekStart = getWeekStart(new Date());

  if (stored) {
    const data = JSON.parse(stored);
    if (data.weekStart === currentWeekStart) {
      return data.quests;
    }
  }

  const shuffled = [...WEEKLY_QUESTS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2).map(q => ({ ...q, completed: false }));

  localStorage.setItem('kidcode_weekly_quests', JSON.stringify({
    weekStart: currentWeekStart,
    quests: selected
  }));

  return selected;
};

const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toDateString();
};

export const updateQuestProgress = (questId: string, progress: number): boolean => {
  const profile = getUserProfile();
  let questCompleted = false;

  // Update daily quests
  const dailyQuests = getDailyQuests();
  dailyQuests.forEach(quest => {
    if (quest.id === questId && !quest.completed) {
      if (progress >= 100) {
        quest.completed = true;
        profile.xp += quest.xpReward;
        questCompleted = true;
      }
    }
  });

  // Update weekly quests
  const weeklyQuests = getWeeklyQuests();
  weeklyQuests.forEach(quest => {
    if (quest.id === questId && !quest.completed) {
      if (progress >= 100) {
        quest.completed = true;
        profile.xp += quest.xpReward;
        questCompleted = true;
      }
    }
  });

  profile.quests = [...dailyQuests, ...weeklyQuests];
  saveUserProfile(profile);
  return questCompleted;
};

export const checkQuestCompletion = (criteria: {
  action?: string;
  count?: number;
  mode?: string;
}): boolean => {
  // This would be called after various actions to check if any quest is completed
  // For simplicity, we'll just return false and let individual actions handle it
  return false;
};

// === TROPHY SYSTEM ===

export const checkAndUnlockTrophy = (trophyId: string): { unlocked: boolean; trophy?: Trophy } => {
  const profile = getUserProfile();
  const trophyDef = TROPHY_DEFINITIONS.find(t => t.id === trophyId);

  if (!trophyDef) return { unlocked: false };

  const hasTrophy = profile.trophies?.some(t => t.id === trophyId);
  if (!hasTrophy) {
    const trophy: Trophy = {
      ...trophyDef,
      unlockedAt: new Date().toISOString()
    };
    profile.trophies = [...(profile.trophies || []), trophy];
    profile.xp += trophyDef.xpReward || 500;
    saveUserProfile(profile);
    return { unlocked: true, trophy };
  }
  return { unlocked: false };
};

export const getAllTrophies = (): Trophy[] => {
  const profile = getUserProfile();
  return TROPHY_DEFINITIONS.map(def => {
    const unlocked = profile.trophies?.find(t => t.id === def.id);
    return {
      ...def,
      unlockedAt: unlocked?.unlockedAt
    };
  });
};

// === XP & LEVEL SYSTEM ===

export const addXP = (amount: number): { profile: UserProfile, leveledUp: boolean, newLevel: number } => {
  const profile = getUserProfile();
  const oldLevel = profile.level;

  profile.xp += amount;
  const newLevel = 1 + Math.floor(profile.xp / 100);
  profile.level = Math.max(1, newLevel);

  saveUserProfile(profile);

  return {
    profile,
    leveledUp: newLevel > oldLevel,
    newLevel
  };
};

export const getXPForLevel = (level: number): number => {
  return (level - 1) * 100;
};

export const getProgressToNextLevel = (profile: UserProfile): { current: number; max: number; percent: number } => {
  const currentLevelXP = getXPForLevel(profile.level);
  const nextLevelXP = getXPForLevel(profile.level + 1);
  const progress = profile.xp - currentLevelXP;
  const max = nextLevelXP - currentLevelXP;

  return {
    current: progress,
    max,
    percent: Math.min(100, Math.max(0, (progress / max) * 100))
  };
};

// === CREATOR SCORE (Based on community engagement) ===

export const updateCreatorScore = (action: 'like' | 'remix' | 'comment' | 'publish'): number => {
  const profile = getUserProfile();
  const points = {
    like: 1,
    remix: 5,
    comment: 2,
    publish: 10
  };

  profile.creatorScore = (profile.creatorScore || 0) + points[action];
  saveUserProfile(profile);
  return profile.creatorScore;
};

// === SKILL TREE ===

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirements: string[]; // Badge IDs or XP thresholds
  category: 'coding' | 'creativity' | 'community' | 'mastery';
}

export const SKILL_TREE: SkillNode[] = [
  // Coding Skills
  { id: 'basic_blocks', name: 'Block Master', description: 'Use 100 blocks', icon: '🧱', unlocked: false, requirements: [], category: 'coding' },
  { id: 'loops', name: 'Loop Expert', description: 'Master loops', icon: '🔄', unlocked: false, requirements: ['basic_blocks'], category: 'coding' },
  { id: 'conditions', name: 'Logic Master', description: 'Master conditions', icon: '🔀', unlocked: false, requirements: ['loops'], category: 'coding' },
  { id: 'variables', name: 'Variable Wizard', description: 'Master variables', icon: '📦', unlocked: false, requirements: ['conditions'], category: 'coding' },

  // Creativity Skills
  { id: 'sprite_design', name: 'Sprite Artist', description: 'Create 10 sprites', icon: '🎨', unlocked: false, requirements: [], category: 'creativity' },
  { id: 'level_design', name: 'Level Designer', description: 'Build 5 levels', icon: '🗺️', unlocked: false, requirements: ['sprite_design'], category: 'creativity' },
  { id: 'storytelling', name: 'Storyteller', description: 'Create narrative games', icon: '📖', unlocked: false, requirements: ['level_design'], category: 'creativity' },

  // Community Skills
  { id: 'sharing', name: 'Sharer', description: 'Publish first project', icon: '📤', unlocked: false, requirements: [], category: 'community' },
  { id: 'collaboration', name: 'Collaborator', description: 'Remix 10 projects', icon: '🤝', unlocked: false, requirements: ['sharing'], category: 'community' },
  { id: 'mentorship', name: 'Mentor', description: 'Help 20 learners', icon: '🎓', unlocked: false, requirements: ['collaboration'], category: 'community' },

  // Mastery Skills
  { id: 'export_code', name: 'Code Exporter', description: 'Export to text languages', icon: '📝', unlocked: false, requirements: ['variables'], category: 'mastery' },
  { id: 'hardware', name: 'Hardware Hacker', description: 'Connect real hardware', icon: '🔌', unlocked: false, requirements: ['export_code'], category: 'mastery' },
  { id: 'mastery', name: 'KidCode Master', description: 'Reach level 25', icon: '👑', unlocked: false, requirements: ['hardware', 'mentorship'], category: 'mastery' },
];

export const updateSkillTree = (): SkillNode[] => {
  const profile = getUserProfile();
  const updatedSkills = SKILL_TREE.map(skill => {
    // Check if requirements are met
    const requirementsMet = skill.requirements.every(req => {
      // Check if it's a badge requirement
      if (profile.badges.some(b => b.id === req)) return true;
      // Check if it's another skill
      return false;
    });

    // Check XP threshold (for some skills)
    const xpThresholds: Record<string, number> = {
      'mastery': 2500 // Level 25
    };

    const xpMet = !xpThresholds[skill.id] || profile.xp >= xpThresholds[skill.id];

    return {
      ...skill,
      unlocked: requirementsMet && xpMet
    };
  });

  return updatedSkills;
};

// === LEADERBOARD (Local for now, would need backend for global) ===

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  avatar: string;
}

export const getLocalLeaderboard = (): LeaderboardEntry[] => {
  // In a real app, this would fetch from a backend
  // For now, return mock data
  return [
    { rank: 1, userId: 'u1', name: 'CodeMaster', xp: 5000, level: 50, avatar: '🦸' },
    { rank: 2, userId: 'u2', name: 'GameDev123', xp: 4500, level: 45, avatar: '🎮' },
    { rank: 3, userId: 'u3', name: 'AppQueen', xp: 4000, level: 40, avatar: '👑' },
    { rank: 4, userId: 'u4', name: 'CircuitKing', xp: 3500, level: 35, avatar: '⚡' },
    { rank: 5, userId: 'u5', name: 'PixelArtist', xp: 3000, level: 30, avatar: '🎨' },
  ];
};

export const getUserRank = (): number => {
  const profile = getUserProfile();
  const leaderboard = getLocalLeaderboard();
  const sorted = [...leaderboard, {
    rank: leaderboard.length + 1,
    userId: profile.id,
    name: profile.name,
    xp: profile.xp,
    level: profile.level,
    avatar: profile.avatar
  }].sort((a, b) => b.xp - a.xp);

  return sorted.findIndex(e => e.userId === profile.id) + 1;
};
