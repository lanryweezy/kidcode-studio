
import { UserProfile } from '../types';

const USER_STORAGE_KEY = 'kidcode_user_profile';

export const DEFAULT_USER: UserProfile = {
  name: 'Junior Coder',
  avatar: '🚀',
  xp: 0,
  level: 1,
  badges: []
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
