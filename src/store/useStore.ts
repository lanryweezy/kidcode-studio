import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createUserSlice, UserSlice } from './slices/userSlice';

export type StoreState = ProjectSlice & UISlice & UserSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createProjectSlice(...a),
  ...createUISlice(...a),
  ...createUserSlice(...a),
}));
