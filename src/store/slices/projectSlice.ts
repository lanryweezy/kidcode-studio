import { StateCreator } from 'zustand';
import { StoreState } from '../useStore';
import {
    CommandBlock,
    HardwareState,
    SpriteState,
    AppState,
    CircuitComponent,
    Wire,
    AppElement
} from '../../types';
import {
    INITIAL_HARDWARE_STATE,
    INITIAL_SPRITE_STATE,
    INITIAL_APP_STATE
} from '../../constants';

export interface VersionSnapshot {
    commands: CommandBlock[];
    timestamp: number;
    label?: string;
}

export interface ProjectSlice {
    currentProject: any;
    commands: CommandBlock[];
    hardwareState: HardwareState;
    spriteState: SpriteState;
    appState: AppState;
    circuitComponents: CircuitComponent[];
    wires: Wire[];
    pcbColor: string;
    assets: Array<{ id: string, name: string, type: 'image' | 'model', url: string }>;
    advancedPhysics: boolean;
    history: CommandBlock[][];
    redoStack: CommandBlock[][];
    saveStatus: 'saved' | 'saving' | 'unsaved';
    plugins: Record<string, AppElement[]>;
    versionHistory: VersionSnapshot[];

    // Actions
    setProject: (project: any) => void;
    setCommands: (commands: CommandBlock[]) => void;
    updateHardwareState: (state: Partial<HardwareState>) => void;
    updateSpriteState: (state: Partial<SpriteState>) => void;
    updateAppState: (state: Partial<AppState>) => void;
    setCircuitComponents: (components: CircuitComponent[]) => void;
    setWires: (wires: Wire[]) => void;
    setPcbColor: (color: string) => void;
    setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
    addAsset: (asset: { name: string, type: 'image' | 'model', url: string }) => void;
    addPlugin: (name: string, elements: AppElement[]) => void;
    setAdvancedPhysics: (advanced: boolean) => void;

    // Batch update actions for performance
    batchUpdateSpriteState: (updates: Partial<SpriteState>) => void;
    batchUpdateHardwareState: (updates: Partial<HardwareState>) => void;
    batchUpdateAppState: (updates: Partial<AppState>) => void;

    // History Actions
    pushHistory: () => void;
    undo: () => void;
    redo: () => void;

    // Version History Actions
    saveVersion: (label?: string) => void;
    restoreVersion: (index: number) => void;
    getVersionHistory: () => VersionSnapshot[];
}

export const createProjectSlice: StateCreator<StoreState, [], [], ProjectSlice> = (set, get) => ({
    currentProject: null,
    commands: [],
    hardwareState: INITIAL_HARDWARE_STATE,
    spriteState: INITIAL_SPRITE_STATE,
    appState: INITIAL_APP_STATE,
    circuitComponents: [],
    wires: [],
    pcbColor: '#059669',
    assets: [],
    advancedPhysics: false,
    history: [],
    redoStack: [],
    saveStatus: 'saved',
    plugins: {},
    versionHistory: [],

    setProject: (project) => set({
        currentProject: project,
        commands: project.data.commands,
        hardwareState: project.data.hardwareState,
        spriteState: project.data.spriteState,
        appState: project.data.appState,
        circuitComponents: project.data.circuitComponents,
        pcbColor: project.data.pcbColor,
        mode: project.mode,
        showHome: false,
        showGallery: false,
        saveStatus: 'saved'
    }),

    setCommands: (commands) => set({ commands, saveStatus: 'unsaved' }),

    updateHardwareState: (state) => set((prev) => ({
        hardwareState: { ...prev.hardwareState, ...state }
    })),

    updateSpriteState: (state) => set((prev) => ({
        spriteState: { ...prev.spriteState, ...state }
    })),

    updateAppState: (state) => set((prev) => ({
        appState: { ...prev.appState, ...state }
    })),

    setCircuitComponents: (circuitComponents) => set({ circuitComponents, saveStatus: 'unsaved' }),
    setWires: (wires) => set({ wires, saveStatus: 'unsaved' }),
    setPcbColor: (pcbColor) => set({ pcbColor, saveStatus: 'unsaved' }),
    setSaveStatus: (saveStatus) => set({ saveStatus }),
    addAsset: (asset) => set((state) => ({
        assets: [{ ...asset, id: crypto.randomUUID() }, ...state.assets]
    })),
    addPlugin: (name, elements) => set((state) => ({
        plugins: { ...state.plugins, [name]: elements }
    })),
    setAdvancedPhysics: (advancedPhysics) => set({ advancedPhysics }),

    // Batch updates for performance (reduces re-renders)
    batchUpdateSpriteState: (updates) => set((prev) => ({
        spriteState: { ...prev.spriteState, ...updates }
    })),

    batchUpdateHardwareState: (updates) => set((prev) => ({
        hardwareState: { ...prev.hardwareState, ...updates }
    })),

    batchUpdateAppState: (updates) => set((prev) => ({
        appState: { ...prev.appState, ...updates }
    })),

    pushHistory: () => {
        const { commands, history } = get();
        set({
            history: [...history.slice(-20), commands],
            redoStack: []
        });
    },

    undo: () => set((state) => {
        if (state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        return {
            commands: previous,
            history: newHistory,
            redoStack: [state.commands, ...state.redoStack]
        };
    }),

    redo: () => set((state) => {
        if (state.redoStack.length === 0) return state;
        const next = state.redoStack[0];
        const newRedo = state.redoStack.slice(1);
        return {
            commands: next,
            history: [...state.history, state.commands],
            redoStack: newRedo
        };
    }),

    saveVersion: (label) => set((state) => ({
        versionHistory: [
            ...state.versionHistory.slice(-49),
            { commands: [...state.commands], timestamp: Date.now(), label }
        ]
    })),

    restoreVersion: (index) => set((state) => {
        const version = state.versionHistory[index];
        if (!version) return state;
        return {
            commands: [...version.commands],
            history: [...state.history, state.commands],
            redoStack: [],
            saveStatus: 'unsaved'
        };
    }),

    getVersionHistory: () => {
        return get().versionHistory;
    }
});
