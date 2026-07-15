export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: SkillCategoryId;
  xpReward: number;
  requirements: SkillRequirement[];
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export type SkillCategoryId = 'coding' | 'game-design' | 'electronics' | 'creativity' | 'problem-solving';

export interface SkillRequirement {
  type: 'xp' | 'badge' | 'skill' | 'project-count';
  value: string | number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: AchievementCriteria;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export interface AchievementCriteria {
  type: 'xp-total' | 'projects-completed' | 'skills-mastered' | 'streak-days' | 'blocks-used' | 'export-count' | 'badges-earned' | 'custom';
  target: number;
  current?: number;
}

export interface CurriculumStandard {
  id: string;
  name: string;
  organization: string;
  skills: string[];
  grade: string;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badges: number;
  projects: number;
  streak: number;
  lastActive: string;
}

const STORAGE_KEY = 'kidcode_education';

interface EducationState {
  xp: number;
  level: number;
  skills: Record<string, number>;
  achievements: string[];
  completedProjects: number;
  blocksUsed: number;
  exportCount: number;
  badgesEarned: number;
  streakDays: number;
  lastActivity: string;
}

const getDefaultState = (): EducationState => ({
  xp: 0,
  level: 1,
  skills: {},
  achievements: [],
  completedProjects: 0,
  blocksUsed: 0,
  exportCount: 0,
  badgesEarned: 0,
  streakDays: 0,
  lastActivity: new Date().toISOString()
});

const loadState = (): EducationState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch {
    return getDefaultState();
  }
};

const saveState = (state: EducationState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'coding',
    name: 'Coding',
    description: 'Master programming fundamentals',
    icon: '💻',
    skills: [
      { id: 'blocks-basics', name: 'Block Basics', description: 'Use 10 code blocks', icon: '🧱', category: 'coding', xpReward: 50, requirements: [], unlocked: false, progress: 0, maxProgress: 10 },
      { id: 'loops', name: 'Loop Master', description: 'Use 20 loop blocks', icon: '🔄', category: 'coding', xpReward: 75, requirements: [{ type: 'skill', value: 'blocks-basics', }], unlocked: false, progress: 0, maxProgress: 20 },
      { id: 'conditions', name: 'Condition Pro', description: 'Use 15 IF/ELSE blocks', icon: '🔀', category: 'coding', xpReward: 75, requirements: [{ type: 'skill', value: 'blocks-basics' }], unlocked: false, progress: 0, maxProgress: 15 },
      { id: 'variables', name: 'Variable Virtuoso', description: 'Create 10 variables', icon: '📦', category: 'coding', xpReward: 100, requirements: [{ type: 'skill', value: 'loops' }, { type: 'skill', value: 'conditions' }], unlocked: false, progress: 0, maxProgress: 10 },
      { id: 'functions', name: 'Function Finder', description: 'Master code organization', icon: '⚡', category: 'coding', xpReward: 120, requirements: [{ type: 'skill', value: 'variables' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'advanced-logic', name: 'Logic Legend', description: 'Complex nested conditions', icon: '🧠', category: 'coding', xpReward: 150, requirements: [{ type: 'skill', value: 'functions' }], unlocked: false, progress: 0, maxProgress: 1 },
    ]
  },
  {
    id: 'game-design',
    name: 'Game Design',
    description: 'Learn to create amazing games',
    icon: '🎮',
    skills: [
      { id: 'first-game', name: 'First Game', description: 'Complete your first game', icon: '🏆', category: 'game-design', xpReward: 100, requirements: [], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'platformer', name: 'Platformer Pro', description: 'Create a platformer game', icon: '🏃', category: 'game-design', xpReward: 150, requirements: [{ type: 'skill', value: 'first-game' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'puzzle-creator', name: 'Puzzle Architect', description: 'Build a puzzle game', icon: '🧩', category: 'game-design', xpReward: 150, requirements: [{ type: 'skill', value: 'first-game' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'rpg-builder', name: 'RPG Builder', description: 'Design an RPG with quests', icon: '⚔️', category: 'game-design', xpReward: 200, requirements: [{ type: 'skill', value: 'platformer' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'physics-games', name: 'Physics Master', description: 'Use physics in games', icon: '🌍', category: 'game-design', xpReward: 175, requirements: [{ type: 'skill', value: 'puzzle-creator' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'game-master', name: 'Game Master', description: 'Create 10 complete games', icon: '👑', category: 'game-design', xpReward: 500, requirements: [{ type: 'skill', value: 'rpg-builder' }, { type: 'skill', value: 'physics-games' }], unlocked: false, progress: 0, maxProgress: 10 },
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Connect code to the real world',
    icon: '🔌',
    skills: [
      { id: 'led-basics', name: 'LED Starter', description: 'Control LEDs', icon: '💡', category: 'electronics', xpReward: 50, requirements: [], unlocked: false, progress: 0, maxProgress: 5 },
      { id: 'sensors', name: 'Sensor Explorer', description: 'Read sensor data', icon: '📡', category: 'electronics', xpReward: 75, requirements: [{ type: 'skill', value: 'led-basics' }], unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'servos', name: 'Servo Specialist', description: 'Control servo motors', icon: '⚙️', category: 'electronics', xpReward: 100, requirements: [{ type: 'skill', value: 'led-basics' }], unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'circuits', name: 'Circuit Builder', description: 'Build complex circuits', icon: '🔧', category: 'electronics', xpReward: 125, requirements: [{ type: 'skill', value: 'sensors' }, { type: 'skill', value: 'servos' }], unlocked: false, progress: 0, maxProgress: 5 },
      { id: 'iot-projects', name: 'IoT Inventor', description: 'Create IoT projects', icon: '🌐', category: 'electronics', xpReward: 150, requirements: [{ type: 'skill', value: 'circuits' }], unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'robotics', name: 'Robotics Pro', description: 'Build a working robot', icon: '🤖', category: 'electronics', xpReward: 200, requirements: [{ type: 'skill', value: 'iot-projects' }], unlocked: false, progress: 0, maxProgress: 1 },
    ]
  },
  {
    id: 'creativity',
    name: 'Creativity',
    description: 'Express yourself through creation',
    icon: '🎨',
    skills: [
      { id: 'pixel-art', name: 'Pixel Artist', description: 'Create 5 custom sprites', icon: '🖌️', category: 'creativity', xpReward: 50, requirements: [], unlocked: false, progress: 0, maxProgress: 5 },
      { id: 'sound-design', name: 'Sound Designer', description: 'Add sounds to projects', icon: '🎵', category: 'creativity', xpReward: 60, requirements: [], unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'storytelling', name: 'Storyteller', description: 'Create narrative games', icon: '📖', category: 'creativity', xpReward: 80, requirements: [{ type: 'skill', value: 'pixel-art' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'ui-designer', name: 'UI Designer', description: 'Design beautiful interfaces', icon: '✨', category: 'creativity', xpReward: 75, requirements: [{ type: 'skill', value: 'pixel-art' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'animation', name: 'Animator', description: 'Create smooth animations', icon: '🎬', category: 'creativity', xpReward: 100, requirements: [{ type: 'skill', value: 'storytelling' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'creative-master', name: 'Creative Master', description: 'Master all creative skills', icon: '🌟', category: 'creativity', xpReward: 250, requirements: [{ type: 'skill', value: 'animation' }, { type: 'skill', value: 'ui-designer' }], unlocked: false, progress: 0, maxProgress: 1 },
    ]
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Think like a computer scientist',
    icon: '🧩',
    skills: [
      { id: 'debugging', name: 'Bug Hunter', description: 'Fix 5 bugs', icon: '🐛', category: 'problem-solving', xpReward: 60, requirements: [], unlocked: false, progress: 0, maxProgress: 5 },
      { id: 'optimization', name: 'Optimizer', description: 'Improve code efficiency', icon: '⚡', category: 'problem-solving', xpReward: 80, requirements: [{ type: 'skill', value: 'debugging' }], unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'algorithmic', name: 'Algorithm Thinker', description: 'Solve algorithmic challenges', icon: '🧮', category: 'problem-solving', xpReward: 100, requirements: [{ type: 'skill', value: 'optimization' }], unlocked: false, progress: 0, maxProgress: 5 },
      { id: 'pattern-recognition', name: 'Pattern Finder', description: 'Identify code patterns', icon: '🔍', category: 'problem-solving', xpReward: 75, requirements: [], unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'system-design', name: 'System Architect', description: 'Design complex systems', icon: '🏗️', category: 'problem-solving', xpReward: 150, requirements: [{ type: 'skill', value: 'algorithmic' }], unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'cs-master', name: 'CS Master', description: 'Master problem solving', icon: '🎓', category: 'problem-solving', xpReward: 300, requirements: [{ type: 'skill', value: 'system-design' }], unlocked: false, progress: 0, maxProgress: 1 },
    ]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first project', icon: '🎯', xpReward: 100, rarity: 'common', criteria: { type: 'projects-completed', target: 1 }, unlocked: false, progress: 0 },
  { id: 'five-projects', name: 'Prolific Creator', description: 'Complete 5 projects', icon: '🌟', xpReward: 250, rarity: 'uncommon', criteria: { type: 'projects-completed', target: 5 }, unlocked: false, progress: 0 },
  { id: 'ten-projects', name: 'Game Developer', description: 'Complete 10 projects', icon: '🎮', xpReward: 500, rarity: 'rare', criteria: { type: 'projects-completed', target: 10 }, unlocked: false, progress: 0 },
  { id: 'xp-1000', name: 'XP Hunter', description: 'Earn 1000 XP total', icon: '💎', xpReward: 100, rarity: 'common', criteria: { type: 'xp-total', target: 1000 }, unlocked: false, progress: 0 },
  { id: 'xp-5000', name: 'XP Master', description: 'Earn 5000 XP total', icon: '💎', xpReward: 250, rarity: 'uncommon', criteria: { type: 'xp-total', target: 5000 }, unlocked: false, progress: 0 },
  { id: 'xp-25000', name: 'XP Legend', description: 'Earn 25000 XP total', icon: '👑', xpReward: 1000, rarity: 'legendary', criteria: { type: 'xp-total', target: 25000 }, unlocked: false, progress: 0 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day coding streak', icon: '🔥', xpReward: 200, rarity: 'uncommon', criteria: { type: 'streak-days', target: 7 }, unlocked: false, progress: 0 },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day coding streak', icon: '🔥', xpReward: 500, rarity: 'rare', criteria: { type: 'streak-days', target: 30 }, unlocked: false, progress: 0 },
  { id: 'streak-100', name: 'Century Coder', description: '100-day coding streak', icon: '🏆', xpReward: 2000, rarity: 'legendary', criteria: { type: 'streak-days', target: 100 }, unlocked: false, progress: 0 },
  { id: 'blocks-100', name: 'Block Builder', description: 'Use 100 code blocks', icon: '🧱', xpReward: 150, rarity: 'common', criteria: { type: 'blocks-used', target: 100 }, unlocked: false, progress: 0 },
  { id: 'blocks-1000', name: 'Code Master', description: 'Use 1000 code blocks', icon: '💻', xpReward: 500, rarity: 'rare', criteria: { type: 'blocks-used', target: 1000 }, unlocked: false, progress: 0 },
  { id: 'export-5', name: 'Code Exporter', description: 'Export 5 projects', icon: '📤', xpReward: 200, rarity: 'uncommon', criteria: { type: 'export-count', target: 5 }, unlocked: false, progress: 0 },
  { id: 'skills-10', name: 'Skill Collector', description: 'Unlock 10 skills', icon: '⭐', xpReward: 300, rarity: 'uncommon', criteria: { type: 'skills-mastered', target: 10 }, unlocked: false, progress: 0 },
  { id: 'skills-25', name: 'Skill Expert', description: 'Unlock 25 skills', icon: '🌟', xpReward: 750, rarity: 'epic', criteria: { type: 'skills-mastered', target: 25 }, unlocked: false, progress: 0 },
];

export const CURRICULUM_STANDARDS: CurriculumStandard[] = [
  { id: 'csa-1', name: 'Computational Thinking', organization: 'CSTA', skills: ['debugging', 'pattern-recognition', 'algorithmic'], grade: 'K-2', description: 'Break problems into smaller parts' },
  { id: 'csa-2', name: 'Creating Programs', organization: 'CSTA', skills: ['blocks-basics', 'loops', 'conditions'], grade: 'K-2', description: 'Develop programs with sequences and events' },
  { id: 'csa-3', name: 'Data & Analysis', organization: 'CSTA', skills: ['variables', 'optimization'], grade: '3-5', description: 'Collect and analyze data using variables' },
  { id: 'csa-4', name: 'Algorithms & Programs', organization: 'CSTA', skills: ['functions', 'advanced-logic'], grade: '3-5', description: 'Design and implement programs with functions' },
  { id: 'csa-5', name: 'Software Engineering', organization: 'CSTA', skills: ['system-design', 'game-master'], grade: '6-8', description: 'Develop software using engineering practices' },
  { id: 'csa-6', name: 'Impacts of Computing', organization: 'CSTA', skills: ['creative-master', 'cs-master'], grade: '6-8', description: 'Understand computing impacts on society' },
  { id: 'iste-1', name: 'Empowered Learner', organization: 'ISTE', skills: ['first-game', 'platformer'], grade: 'K-12', description: 'Students leverage technology to take ownership of learning' },
  { id: 'iste-2', name: 'Digital Citizen', organization: 'ISTE', skills: ['storytelling', 'ui-designer'], grade: 'K-12', description: 'Students understand digital citizenship' },
  { id: 'iste-3', name: 'Knowledge Constructor', organization: 'ISTE', skills: ['pixel-art', 'sound-design'], grade: 'K-12', description: 'Students curate information from digital resources' },
  { id: 'iste-4', name: 'Innovative Designer', organization: 'ISTE', skills: ['animation', 'creative-master'], grade: 'K-12', description: 'Students use design thinking to solve problems' },
];

export const addXP = (amount: number): { level: number; leveledUp: boolean } => {
  const state = loadState();
  const oldLevel = state.level;
  state.xp += amount;
  state.level = Math.floor(state.xp / 100) + 1;
  state.lastActivity = new Date().toISOString();
  saveState(state);
  return { level: state.level, leveledUp: state.level > oldLevel };
};

export const updateSkillProgress = (skillId: string, progress: number): boolean => {
  const state = loadState();
  state.skills[skillId] = Math.min((state.skills[skillId] || 0) + progress, 999);
  state.lastActivity = new Date().toISOString();
  saveState(state);
  return true;
};

export const getSkillProgress = (skillId: string): number => {
  const state = loadState();
  return state.skills[skillId] || 0;
};

export const getLevelFromXP = (xp: number): number => Math.floor(xp / 100) + 1;

export const getXPForLevel = (level: number): number => (level - 1) * 100;

export const getXPProgress = (xp: number): { current: number; needed: number; percent: number } => {
  const level = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, percent: Math.min(100, (current / needed) * 100) };
};

export const checkAchievements = (): Achievement[] => {
  const state = loadState();
  const unlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (state.achievements.includes(achievement.id)) continue;

    let current = 0;
    switch (achievement.criteria.type) {
      case 'xp-total':
        current = state.xp;
        break;
      case 'projects-completed':
        current = state.completedProjects;
        break;
      case 'skills-mastered':
        current = Object.keys(state.skills).length;
        break;
      case 'streak-days':
        current = state.streakDays;
        break;
      case 'blocks-used':
        current = state.blocksUsed;
        break;
      case 'export-count':
        current = state.exportCount;
        break;
      case 'badges-earned':
        current = state.badgesEarned;
        break;
    }

    if (current >= achievement.criteria.target) {
      state.achievements.push(achievement.id);
      state.xp += achievement.xpReward;
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      unlocked.push(achievement);
    } else {
      achievement.progress = current;
    }
  }

  saveState(state);
  return unlocked;
};

export const recordProjectComplete = (): void => {
  const state = loadState();
  state.completedProjects++;
  saveState(state);
};

export const recordBlocksUsed = (count: number): void => {
  const state = loadState();
  state.blocksUsed += count;
  saveState(state);
};

export const recordExport = (): void => {
  const state = loadState();
  state.exportCount++;
  saveState(state);
};

export const updateStreak = (): { streak: number; isNewRecord: boolean } => {
  const state = loadState();
  const lastDate = new Date(state.lastActivity).toDateString();
  const today = new Date().toDateString();

  if (lastDate === today) return { streak: state.streakDays, isNewRecord: false };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    state.streakDays++;
  } else if (lastDate !== today) {
    state.streakDays = 1;
  }

  state.lastActivity = new Date().toISOString();
  saveState(state);
  return { streak: state.streakDays, isNewRecord: state.streakDays > 1 };
};

export const getEducationState = (): EducationState => loadState();

export const getLeaderboard = (): LeaderboardEntry[] => {
  const state = loadState();
  const entries: LeaderboardEntry[] = [
    { rank: 1, userId: 'ai_code_master', name: 'CodeMaster AI', avatar: '🤖', xp: 50000, level: 500, badges: 20, projects: 100, streak: 365, lastActive: new Date().toISOString() },
    { rank: 2, userId: 'pixel_pro', name: 'PixelPro', avatar: '🎨', xp: 45000, level: 450, badges: 18, projects: 85, streak: 300, lastActive: new Date().toISOString() },
    { rank: 3, userId: 'game_guru', name: 'GameGuru', avatar: '🎮', xp: 40000, level: 400, badges: 16, projects: 75, streak: 250, lastActive: new Date().toISOString() },
    { rank: 4, userId: 'robot_ranger', name: 'RobotRanger', avatar: '🤖', xp: 35000, level: 350, badges: 15, projects: 60, streak: 200, lastActive: new Date().toISOString() },
    { rank: 5, userId: 'logic_lord', name: 'LogicLord', avatar: '🧠', xp: 30000, level: 300, badges: 14, projects: 50, streak: 180, lastActive: new Date().toISOString() },
  ];

  entries.push({
    rank: entries.length + 1,
    userId: 'current-user',
    name: 'You',
    avatar: '🚀',
    xp: state.xp,
    level: state.level,
    badges: state.achievements.length,
    projects: state.completedProjects,
    streak: state.streakDays,
    lastActive: state.lastActivity
  });

  entries.sort((a, b) => b.xp - a.xp);
  entries.forEach((e, i) => e.rank = i + 1);

  return entries;
};
