import { StateCreator } from 'zustand';
import { StoreState } from '../useStore';
import { UserProfile } from '../../types';

export interface UserSlice {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
    addCoins: (amount: number) => void;
    spendCoins: (amount: number) => boolean;
}

export const createUserSlice: StateCreator<StoreState, [], [], UserSlice> = (set, get) => ({
    userProfile: null as any, // Initialized in main store or via DEFAULT_USER in slice
    setUserProfile: (userProfile) => set({ userProfile }),
    addCoins: (amount) => set((state) => ({
        userProfile: { ...state.userProfile, coins: state.userProfile.coins + amount }
    })),
    spendCoins: (amount) => {
        const { userProfile } = get();
        if (userProfile.coins >= amount) {
            set((state) => ({ userProfile: { ...state.userProfile, coins: state.userProfile.coins - amount } }));
            return true;
        }
        return false;
    },
});
