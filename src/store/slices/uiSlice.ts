import { StateCreator } from 'zustand';
import { StoreState } from '../useStore';
import { AppMode, Mission } from '../../types';

export interface UISlice {
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
    showMusicGenerator: boolean;
    activeMission: Mission | null;
    circuitSearch: string;
    blockSearch: string;
    expandedCategories: Record<string, boolean>;
    consoleLogs: string[];

    // Actions
    setMode: (mode: AppMode) => void;
    setShowHome: (show: boolean) => void;
    setActiveTab: (tab: string) => void;
    setDarkMode: (dark: boolean) => void;
    toggleConsole: () => void;
    setShowProfile: (show: boolean) => void;
    setShowPricing: (show: boolean) => void;
    setShowMissions: (show: boolean) => void;
    setShowPixelEditor: (show: boolean) => void;
    setShowSoundEditor: (show: boolean) => void;
    setShowVariables: (show: boolean) => void;
    setNpcChat: (chat: { name: string, message: string } | null) => void;
    setGameState: (state: 'playing' | 'won' | 'over') => void;
    setShowParticleEditor: (show: boolean) => void;
    setParticleSettings: (settings: Partial<UISlice['particleSettings']>) => void;
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
    setShowMusicGenerator: (show: boolean) => void;
    setActiveMission: (mission: Mission | null) => void;
    setCircuitSearch: (search: string) => void;
    setBlockSearch: (search: string) => void;
    setExpandedCategories: (categories: Record<string, boolean>) => void;
    setConsoleLogs: (logs: string[]) => void;
    clearLogs: () => void;
    setLeftPanelWidth: (width: number | ((prev: number) => number)) => void;
    setRightPanelWidth: (width: number | ((prev: number) => number)) => void;
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
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
    showMusicGenerator: false,
    activeMission: null,
    circuitSearch: '',
    blockSearch: '',
    expandedCategories: {},
    consoleLogs: [],

    setMode: (mode) => set({ mode }),
    setShowHome: (show) => set({ showHome: show }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setDarkMode: (dark) => set({ darkMode: dark }),
    toggleConsole: () => set((state) => ({ showConsole: !state.showConsole })),
    setShowProfile: (showProfile) => set({ showProfile }),
    setShowPricing: (showPricing) => set({ showPricing }),
    setShowMissions: (showMissions) => set({ showMissions }),
    setShowPixelEditor: (showPixelEditor) => set({ showPixelEditor }),
    setShowSoundEditor: (showSoundEditor) => set({ showSoundEditor }),
    setShowVariables: (showVariables) => set({ showVariables }),
    setNpcChat: (npcChat) => set({ npcChat }),
    setGameState: (gameState) => set({ gameState }),
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
    setShowTutorial: (show) => set({ showTutorial: show }),
    setIsLive: (live) => set({ isLive: live }),
    setShowMarketplace: (show) => set({ showMarketplace: show }),
    setShowMusicGenerator: (show) => set({ showMusicGenerator: show }),
    setActiveMission: (mission) => set({ activeMission: mission }),
    setCircuitSearch: (circuitSearch) => set({ circuitSearch }),
    setBlockSearch: (blockSearch) => set({ blockSearch }),
    setExpandedCategories: (expandedCategories) => set({ expandedCategories }),
    setConsoleLogs: (consoleLogs) => set({ consoleLogs }),
    clearLogs: () => set({ consoleLogs: [] }),
    setLeftPanelWidth: (width) => set((state) => ({ leftPanelWidth: typeof width === 'function' ? width(state.leftPanelWidth) : (width as number) })),
    setRightPanelWidth: (width) => set((state) => ({ rightPanelWidth: typeof width === 'function' ? width(state.rightPanelWidth) : (width as number) })),
});
