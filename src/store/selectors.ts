import { useShallow } from 'zustand/react/shallow';
import { StoreState } from './useStore';
import { useCallback } from 'react';

export const selectCommands = (s: StoreState) => s.commands;
export const selectHardwareState = (s: StoreState) => s.hardwareState;
export const selectSpriteState = (s: StoreState) => s.spriteState;
export const selectAppState = (s: StoreState) => s.appState;
export const selectMode = (s: StoreState) => s.mode;
export const selectActiveTab = (s: StoreState) => s.activeTab;
export const selectShowConsole = (s: StoreState) => s.showConsole;
export const selectShowHelp = (s: StoreState) => s.showHelp;
export const selectShowProfile = (s: StoreState) => s.showProfile;
export const selectShowPricing = (s: StoreState) => s.showPricing;
export const selectShowMissions = (s: StoreState) => s.showMissions;
export const selectShowPixelEditor = (s: StoreState) => s.showPixelEditor;
export const selectShowSoundEditor = (s: StoreState) => s.showSoundEditor;
export const selectShowVariables = (s: StoreState) => s.showVariables;
export const selectShowStats = (s: StoreState) => s.showStats;
export const selectShowAssetManager = (s: StoreState) => s.showAssetManager;
export const selectShowMusicStudio = (s: StoreState) => s.showMusicStudio;
export const selectShowSoundRecorder = (s: StoreState) => s.showSoundRecorder;
export const selectShowTutorial = (s: StoreState) => s.showTutorial;
export const selectShowFirstWinCelebration = (s: StoreState) => s.showFirstWinCelebration;
export const selectShowCodePageManager = (s: StoreState) => s.showCodePageManager;
export const selectShowAI3DCreator = (s: StoreState) => s.showAI3DCreator;
export const selectShowMusicGenerator = (s: StoreState) => s.showMusicGenerator;
export const selectShowSpriteExtractor = (s: StoreState) => s.showSpriteExtractor;
export const selectShowGallery = (s: StoreState) => s.showGallery;
export const selectShowHome = (s: StoreState) => s.showHome;
export const selectShowLanding = (s: StoreState) => s.showLanding;
export const selectShowShortcuts = (s: StoreState) => s.showShortcuts;
export const selectShowQuestEditor = (s: StoreState) => s.showQuestEditor;
export const selectShowEquipment = (s: StoreState) => s.showEquipment;
export const selectShowCrafting = (s: StoreState) => s.showCrafting;
export const selectShowSkillTree = (s: StoreState) => s.showSkillTree;
export const selectShowShopOverlay = (s: StoreState) => s.showShopOverlay;
export const selectShowNPCDialogue = (s: StoreState) => s.showNPCDialogue;
export const selectShowParticleEditor = (s: StoreState) => s.showParticleEditor;
export const selectCurrentProject = (s: StoreState) => s.currentProject;
export const selectSaveStatus = (s: StoreState) => s.saveStatus;
export const selectCircuitComponents = (s: StoreState) => s.circuitComponents;
export const selectWires = (s: StoreState) => s.wires;
export const selectPcbColor = (s: StoreState) => s.pcbColor;
export const selectUserProfile = (s: StoreState) => s.userProfile;
export const selectConsoleLogs = (s: StoreState) => s.consoleLogs;
export const selectLeftPanelWidth = (s: StoreState) => s.leftPanelWidth;
export const selectRightPanelWidth = (s: StoreState) => s.rightPanelWidth;
export const selectHackerMode = (s: StoreState) => s.hackerMode;
export const selectHighContrast = (s: StoreState) => s.highContrast;
export const selectIs3DMode = (s: StoreState) => s.is3DMode;
export const selectAdvancedPhysics = (s: StoreState) => s.advancedPhysics;
export const selectActiveMission = (s: StoreState) => s.activeMission;
export const selectActiveTycoonGame = (s: StoreState) => s.activeTycoonGame;
export const selectNpcChat = (s: StoreState) => s.npcChat;
export const selectGameState = (s: StoreState) => s.gameState;
export const selectCollaborators = (s: StoreState) => s.collaborators;

export const useModeAndTab = () => useShallow(useCallback((s: StoreState) => ({
  mode: s.mode,
  activeTab: s.activeTab,
}), []));

export const useCommandsAndHistory = () => useShallow(useCallback((s: StoreState) => ({
  commands: s.commands,
  history: s.history,
  redoStack: s.redoStack,
}), []));

export const useHardwarePanel = () => useShallow(useCallback((s: StoreState) => ({
  hardwareState: s.hardwareState,
  updateHardwareState: s.updateHardwareState,
  circuitComponents: s.circuitComponents,
  setCircuitComponents: s.setCircuitComponents,
  wires: s.wires,
  setWires: s.setWires,
  pcbColor: s.pcbColor,
  setPcbColor: s.setPcbColor,
}), []));

export const useGamePanel = () => useShallow(useCallback((s: StoreState) => ({
  spriteState: s.spriteState,
  updateSpriteState: s.updateSpriteState,
  appState: s.appState,
  updateAppState: s.updateAppState,
}), []));

export const useModalToggles = () => useShallow(useCallback((s: StoreState) => ({
  showProfile: s.showProfile,
  showPricing: s.showPricing,
  showPixelEditor: s.showPixelEditor,
  showSoundEditor: s.showSoundEditor,
  showMusicStudio: s.showMusicStudio,
  showSoundRecorder: s.showSoundRecorder,
  showAssetManager: s.showAssetManager,
  showVariables: s.showVariables,
  showMissions: s.showMissions,
  showFirstWinCelebration: s.showFirstWinCelebration,
  showCodePageManager: s.showCodePageManager,
  showAI3DCreator: s.showAI3DCreator,
  showMusicGenerator: s.showMusicGenerator,
  showSpriteExtractor: s.showSpriteExtractor,
  showTutorial: s.showTutorial,
  showStats: s.showStats,
  showQuestEditor: s.showQuestEditor,
  showEquipment: s.showEquipment,
  showCrafting: s.showCrafting,
  showSkillTree: s.showSkillTree,
  showShopOverlay: s.showShopOverlay,
  showHelp: s.showHelp,
  showParticleEditor: s.showParticleEditor,
  showNPCDialogue: s.showNPCDialogue,
}), []));
