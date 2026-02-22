
import { UserProfile } from '../types';

const USER_STORAGE_KEY = 'kidcode_user_profile';

export const DEFAULT_USER: UserProfile = {
  id: 'default-user',
  name: 'Junior Coder',
  avatar: '🚀',
  xp: 0,
  level: 1,
  coins: 100,
  plan: 'free',
  streak: 1,
  badges: [],
  quests: [],
  projects: []
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
};

export const updateStreak = (): UserProfile => {
    const profile = getUserProfile();
    const now = new Date();
    const lastLoginStr = localStorage.getItem('kidcode_last_login');
    
    if (lastLoginStr) {
        const lastLogin = new Date(lastLoginStr);
        const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            profile.streak += 1;
        } else if (diffDays > 1) {
            profile.streak = 1;
        }
    } else {
        profile.streak = 1;
    }
    
    localStorage.setItem('kidcode_last_login', now.toISOString());
    saveUserProfile(profile);
    return profile;
};

export const checkAndUnlockBadge = (badgeId: string, badgeName: string, icon: string): { profile: UserProfile, unlocked: boolean } => {
    const profile = getUserProfile();
    const hasBadge = profile.badges.some(b => b.id === badgeId);
    
    if (!hasBadge) {
        profile.badges.push({
            id: badgeId,
            name: badgeName,
            icon: icon,
            unlockedAt: new Date().toISOString()
        });
        saveUserProfile(profile);
        return { profile, unlocked: true };
    }
    
    return { profile, unlocked: false };
};

export const addXp = (amount: number): { profile: UserProfile, leveledUp: boolean } => {
    const profile = getUserProfile();
    const oldLevel = profile.level;
    
    profile.xp += amount;
    // Simple level up logic: Level = 1 + floor(xp / 100)
    const newLevel = 1 + Math.floor(profile.xp / 100);
    
    profile.level = newLevel;
    
    saveUserProfile(profile);
    
    return { profile, leveledUp: newLevel > oldLevel };
}

export const updateUserAvatar = (avatar: string) => {
    const profile = getUserProfile();
    profile.avatar = avatar;
    saveUserProfile(profile);
    return profile;
}

export const updateUserName = (name: string) => {
    const profile = getUserProfile();
    profile.name = name;
    saveUserProfile(profile);
    return profile;
}

export const upgradeUserPlan = (newPlan: import('../types').PlanType): UserProfile => {
    const profile = getUserProfile();
    profile.plan = newPlan;
    saveUserProfile(profile);
    return profile;
}
