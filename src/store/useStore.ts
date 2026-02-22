
import { create } from 'zustand';
import {
  AppMode,
  AppState,
  CommandBlock,
  HardwareState,
  SpriteState,
  CircuitComponent,
  UserProfile,
  PlanType,
  AppElement
} from '../types';
import { 
  INITIAL_HARDWARE_STATE, 
  INITIAL_SPRITE_STATE, 
  INITIAL_APP_STATE 
} from '../constants';
import { DEFAULT_USER } from '../services/userService';
import { SavedProject } from '../services/storageService';

interface ProjectState {
  currentProject: SavedProject | null;
  commands: CommandBlock[];
  hardwareState: HardwareState;
  spriteState: SpriteState;
  appState: AppState;
  circuitComponents: CircuitComponent[];
  pcbColor: string;
  assets: Array<{ id: string, name: string, type: 'image' | 'model', url: string }>;
  advancedPhysics: boolean;
  history: CommandBlock[][];
  redoStack: CommandBlock[][];
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

interface UIState {
  showHome: boolean;
  mode: AppMode;
  activeTab: string;
  darkMode: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  showConsole: boolean;
  showProfile: boolean;
  showPricing: boolean;
  showMissions: boolean;
  showPixelEditor: boolean;
  showSoundEditor: boolean;
  showVariables: boolean;
  npcChat: { name: string, message: string } | null;
  gameState: 'playing' | 'won' | 'over';
  plugins: Record<string, AppElement[]>;
  showParticleEditor: boolean;
  particleSettings: {
    color: string;
    speed: number;
    size: number;
    count: number;
    type: 'explosion' | 'sparkle' | 'poof';
  };
  showHelp: boolean;
  showGallery: boolean;
  showMusicStudio: boolean;
  isBoardConnected: boolean;
  showStats: boolean;
  hackerMode: boolean;
  showSoundRecorder: boolean;
  showAssetManager: boolean;
  showAI3DCreator: boolean;
  showSpriteExtractor: boolean;
  showTutorial: boolean;
  isLive: boolean;
  showMarketplace: boolean;
  // Search and filter states
  circuitSearch: string;
  blockSearch: string;
  expandedCategories: Record<string, boolean>;
  // Console logs
  consoleLogs: string[];
}

interface UserState {
  userProfile: UserProfile;
}

interface StoreState extends ProjectState, UIState, UserState {
  // Actions
  setMode: (mode: AppMode) => void;
  setShowHome: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  setDarkMode: (dark: boolean) => void;
  setProject: (project: SavedProject) => void;
  setCommands: (commands: CommandBlock[]) => void;
  updateHardwareState: (state: Partial<HardwareState>) => void;
  updateSpriteState: (state: Partial<SpriteState>) => void;
  updateAppState: (state: Partial<AppState>) => void;
  setCircuitComponents: (components: CircuitComponent[]) => void;
  setPcbColor: (color: string) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  setUserProfile: (profile: UserProfile) => void;
  addAsset: (asset: { name: string, type: 'image' | 'model', url: string }) => void;
  
  // UI Toggles
  toggleConsole: () => void;
  setShowProfile: (show: boolean) => void;
  setShowPricing: (show: boolean) => void;
  setShowMissions: (show: boolean) => void;
  setShowPixelEditor: (show: boolean) => void;
  setShowSoundEditor: (show: boolean) => void;
  setShowVariables: (show: boolean) => void;
  setNpcChat: (chat: { name: string, message: string } | null) => void;
  setGameState: (state: 'playing' | 'won' | 'over') => void;
  addPlugin: (name: string, elements: AppElement[]) => void;
  setShowParticleEditor: (show: boolean) => void;
  setParticleSettings: (settings: Partial<StoreState['particleSettings']>) => void;
  setShowHelp: (show: boolean) => void;
  setShowGallery: (show: boolean) => void;
  setShowMusicStudio: (show: boolean) => void;
  setIsBoardConnected: (connected: boolean) => void;
  setShowStats: (show: boolean) => void;
  setHackerMode: (hackerMode: boolean) => void;
  setShowSoundRecorder: (show: boolean) => void;
  setShowAssetManager: (show: boolean) => void;
  setShowAI3DCreator: (show: boolean) => void;
  setShowSpriteExtractor: (show: boolean) => void;
  setShowTutorial: (show: boolean) => void;
  setIsLive: (live: boolean) => void;
  setShowMarketplace: (show: boolean) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setAdvancedPhysics: (advanced: boolean) => void;
  // Search actions
  setCircuitSearch: (search: string) => void;
  setBlockSearch: (search: string) => void;
  setExpandedCategories: (categories: Record<string, boolean>) => void;
  // Console actions
  setConsoleLogs: (logs: string[]) => void;
  clearLogs: () => void;
  // Panel width actions
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  
  // History Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // --- Initial States ---
  currentProject: null,
  commands: [],
  hardwareState: INITIAL_HARDWARE_STATE,
  spriteState: INITIAL_SPRITE_STATE,
  appState: INITIAL_APP_STATE,
  circuitComponents: [],
  pcbColor: '#059669',
  assets: [],
  advancedPhysics: false,
  history: [],
  redoStack: [],
  saveStatus: 'saved',

  showHome: true,
  mode: AppMode.APP,
  activeTab: 'code',
  darkMode: false,
  leftPanelWidth: 280,
  rightPanelWidth: 400,
  showConsole: false,
  showProfile: false,
  showPricing: false,
  showMissions: false,
  showPixelEditor: false,
  showSoundEditor: false,
  showVariables: false,
  npcChat: null,
  gameState: 'playing',
  plugins: {},
  showParticleEditor: false,
  particleSettings: {
    color: '#fbbf24',
    speed: 5,
    size: 4,
    count: 20,
    type: 'explosion'
  },
  showHelp: false,
  showGallery: false,
  showMusicStudio: false,
  isBoardConnected: false,
  showStats: false,
  hackerMode: false,
  showSoundRecorder: false,
  showAssetManager: false,
  showAI3DCreator: false,
  showSpriteExtractor: false,
  showTutorial: false,
  isLive: false,
  showMarketplace: false,
  circuitSearch: '',
  blockSearch: '',
  expandedCategories: {},
  consoleLogs: [],

  userProfile: DEFAULT_USER,

  // --- Actions ---
  setMode: (mode) => set({ mode }),
  setShowHome: (show) => set({ showHome: show }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  
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
    showGallery: false
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
  setPcbColor: (pcbColor) => set({ pcbColor, saveStatus: 'unsaved' }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setUserProfile: (userProfile) => set({ userProfile }),
  addAsset: (asset) => set((state) => ({ 
    assets: [{ ...asset, id: crypto.randomUUID() }, ...state.assets] 
  })),

  toggleConsole: () => set((state) => ({ showConsole: !state.showConsole })),
  setShowProfile: (showProfile) => set({ showProfile }),
  setShowPricing: (showPricing) => set({ showPricing }),
  setShowMissions: (showMissions) => set({ showMissions }),
  setShowPixelEditor: (showPixelEditor) => set({ showPixelEditor }),
  setShowSoundEditor: (showSoundEditor) => set({ showSoundEditor }),
  setShowVariables: (showVariables) => set({ showVariables }),
  setNpcChat: (npcChat) => set({ npcChat }),
  setGameState: (gameState) => set({ gameState }),
  addPlugin: (name, elements) => set((state) => ({
    plugins: { ...state.plugins, [name]: elements }
  })),
  setShowParticleEditor: (showParticleEditor) => set({ showParticleEditor }),
  setParticleSettings: (settings) => set((state) => ({
    particleSettings: { ...state.particleSettings, ...settings }
  })),
  setShowHelp: (showHelp) => set({ showHelp }),
  setShowGallery: (showGallery) => set({ showGallery }),
  setShowMusicStudio: (showMusicStudio) => set({ showMusicStudio }),
  setIsBoardConnected: (isBoardConnected) => set({ isBoardConnected }),
  setShowStats: (showStats) => set({ showStats }),
  setHackerMode: (hackerMode) => set({ hackerMode }),
  setShowSoundRecorder: (showSoundRecorder) => set({ showSoundRecorder }),
  setShowAssetManager: (showAssetManager) => set({ showAssetManager }),
  setShowAI3DCreator: (showAI3DCreator) => set({ showAI3DCreator }),
  setShowSpriteExtractor: (showSpriteExtractor) => set({ showSpriteExtractor }),
  setShowTutorial: (showTutorial) => set({ showTutorial }),
  setIsLive: (isLive) => set({ isLive }),
  setShowMarketplace: (showMarketplace) => set({ showMarketplace }),
  addCoins: (amount) => set((state) => ({ 
    userProfile: { ...state.userProfile, coins: state.userProfile.coins + amount } 
  })),
  spendCoins: (amount) => {
    const { userProfile } = useStore.getState();
    if (userProfile.coins >= amount) {
      set((state) => ({ userProfile: { ...state.userProfile, coins: state.userProfile.coins - amount } }));
      return true;
    }
    return false;
  },
  setAdvancedPhysics: (advancedPhysics) => set({ advancedPhysics }),
  setCircuitSearch: (circuitSearch) => set({ circuitSearch }),
  setBlockSearch: (blockSearch) => set({ blockSearch }),
  setExpandedCategories: (expandedCategories) => set({ expandedCategories }),
  setConsoleLogs: (consoleLogs) => set({ consoleLogs }),
  clearLogs: () => set({ consoleLogs: [] }),
  setLeftPanelWidth: (leftPanelWidth) => set({ leftPanelWidth }),
  setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),

  pushHistory: () => set((state) => ({
    history: [...state.history.slice(-20), state.commands],
    redoStack: []
  })),

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
  })
}));
