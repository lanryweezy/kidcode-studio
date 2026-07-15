import { StateCreator } from 'zustand';
import { StoreState } from '../useStore';
import { CollaborationManager, CollaboratorInfo } from '../../services/collaboration/collaborationManager';

export interface CollaborationSlice {
    collaborationManager: CollaborationManager | null;
    collaborators: CollaboratorInfo[];
    initCollaboration: (projectId: string, transportUrl?: string) => void;
    destroyCollaboration: () => void;
    addCollaborator: (info: CollaboratorInfo) => void;
    removeCollaborator: (id: string) => void;
    updateCollaboratorCursor: (id: string, position: number | null) => void;
}

export const createCollaborationSlice: StateCreator<StoreState, [], [], CollaborationSlice> = (set, get) => ({
    collaborationManager: null,
    collaborators: [],

    initCollaboration: (projectId: string, transportUrl?: string) => {
        const existing = get().collaborationManager;
        if (existing) {
            existing.onUpdate(() => {});
        }
        const manager = new CollaborationManager(projectId, transportUrl);
        manager.onUpdate((state) => {
            set({ collaborators: Array.from(state.collaborators.values()) });
        });
        set({ collaborationManager: manager, collaborators: [] });
    },

    destroyCollaboration: () => {
        set({ collaborationManager: null, collaborators: [] });
    },

    addCollaborator: (info: CollaboratorInfo) => {
        const { collaborationManager, collaborators } = get();
        if (collaborationManager) {
            collaborationManager.addCollaborator(info);
        }
        set({ collaborators: [...collaborators, info] });
    },

    removeCollaborator: (id: string) => {
        const { collaborationManager } = get();
        if (collaborationManager) {
            collaborationManager.removeCollaborator(id);
        }
        set((state) => ({
            collaborators: state.collaborators.filter(c => c.id !== id)
        }));
    },

    updateCollaboratorCursor: (id: string, position: number | null) => {
        const { collaborationManager } = get();
        if (collaborationManager) {
            collaborationManager.updateCursor(id, position);
        }
    },
});
