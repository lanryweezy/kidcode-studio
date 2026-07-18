import { StateCreator } from 'zustand';
import { StoreState } from '../useStore';
import { AppMode, Mission } from '../../types';

export interface UISlice {
    showLanding: boolean;
    showHome: boolean;
    mode: AppMode;
    activeTab: string;
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
    activeTycoonGame: string | null;
    showCodePageManager: boolean;
    is3DMode: boolean;
    showFirstWinCelebration: boolean;
    showQuestEditor: boolean;
    showEquipment: boolean;
    showCrafting: boolean;
    showSkillTree: boolean;
    showShopOverlay: boolean;
    showNPCDialogue: boolean;
    showShortcuts: boolean;
    highContrast: boolean;
    isGameMode: boolean;
    showStudioManager: boolean;
    showStudioDetail: string | null;
    showAddToStudio: string | null;
    showChallenges: boolean;

    // UI/UX Enhancements for Kids
    customAccentColor: string;
    showJoyride: boolean;
    workspaceZoom: number;
    workspacePan: { x: number, y: number };

    // Actions
    setMode: (mode: AppMode) => void;
    setShowLanding: (show: boolean) => void;
    setShowHome: (show: boolean) => void;
    setActiveTab: (tab: string) => void;
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
    setActiveTycoonGame: (game: string | null) => void;
    setShowCodePageManager: (show: boolean) => void;
    setIs3DMode: (mode: boolean) => void;
    setShowFirstWinCelebration: (show: boolean) => void;
    setShowQuestEditor: (show: boolean) => void;
    setShowEquipment: (show: boolean) => void;
    setShowCrafting: (show: boolean) => void;
    setShowSkillTree: (show: boolean) => void;
    setShowShopOverlay: (show: boolean) => void;
    setShowNPCDialogue: (show: boolean) => void;
    setShowShortcuts: (show: boolean) => void;
    setHighContrast: (hc: boolean) => void;
    setIsGameMode: (isGameMode: boolean) => void;
    setShowStudioManager: (show: boolean) => void;
    setShowStudioDetail: (studioId: string | null) => void;
    setShowAddToStudio: (projectId: string | null) => void;
    setShowChallenges: (show: boolean) => void;

    // UI/UX Actions
    setCustomAccentColor: (color: string) => void;
    setShowJoyride: (show: boolean) => void;
    setWorkspaceZoom: (zoom: number) => void;
    setWorkspacePan: (pan: { x: number, y: number }) => void;
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (set) => ({
    showLanding: true,
    showHome: false,
    mode: AppMode.GAME,
    activeTab: 'code',
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
    activeTycoonGame: null,
    showCodePageManager: false,
    is3DMode: false,
    showFirstWinCelebration: false,
    showQuestEditor: false,
    showEquipment: false,
    showCrafting: false,
    showSkillTree: false,
    showShopOverlay: false,
    showNPCDialogue: false,
    showShortcuts: false,
    highContrast: false,
    isGameMode: false,
    showStudioManager: false,
    showStudioDetail: null,
    showAddToStudio: null,
    showChallenges: false,
    customAccentColor: '#8b5cf6', // Default violet-500
    showJoyride: false,
    workspaceZoom: 1,
    workspacePan: { x: 0, y: 0 },

    setMode: (mode) => set({ mode }),
    setShowLanding: (show) => set({ showLanding: show }),
    setShowHome: (show) => set({ showHome: show }),
    setActiveTab: (tab) => set({ activeTab: tab }),
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
    setConsoleLogs: (consoleLogs) => set({ consoleLogs: consoleLogs.slice(-500) }),
    clearLogs: () => set({ consoleLogs: [] }),
    setLeftPanelWidth: (width) => set((state) => ({ leftPanelWidth: typeof width === 'function' ? width(state.leftPanelWidth) : (width as number) })),
    setRightPanelWidth: (width) => set((state) => ({ rightPanelWidth: typeof width === 'function' ? width(state.rightPanelWidth) : (width as number) })),
    setActiveTycoonGame: (game) => set({ activeTycoonGame: game }),
    setShowCodePageManager: (show) => set({ showCodePageManager: show }),
    setIs3DMode: (mode) => set({ is3DMode: mode }),
    setShowFirstWinCelebration: (show) => set({ showFirstWinCelebration: show }),
    setShowQuestEditor: (show) => set({ showQuestEditor: show }),
    setShowEquipment: (show) => set({ showEquipment: show }),
    setShowCrafting: (show) => set({ showCrafting: show }),
    setShowSkillTree: (show) => set({ showSkillTree: show }),
    setShowShopOverlay: (show) => set({ showShopOverlay: show }),
    setShowNPCDialogue: (show) => set({ showNPCDialogue: show }),
    setShowShortcuts: (show) => set({ showShortcuts: show }),
    setHighContrast: (hc) => set({ highContrast: hc }),
    setIsGameMode: (isGameMode) => set({ isGameMode }),
    setShowStudioManager: (showStudioManager) => set({ showStudioManager }),
    setShowStudioDetail: (showStudioDetail) => set({ showStudioDetail }),
    setShowAddToStudio: (showAddToStudio) => set({ showAddToStudio }),
    setShowChallenges: (showChallenges) => set({ showChallenges }),
    setCustomAccentColor: (customAccentColor) => set({ customAccentColor }),
    setShowJoyride: (showJoyride) => set({ showJoyride }),
    setWorkspaceZoom: (workspaceZoom) => set({ workspaceZoom }),
    setWorkspacePan: (workspacePan) => set({ workspacePan }),
});
