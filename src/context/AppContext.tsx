
import React, { createContext, useContext, useRef } from 'react';
import { useProject } from '../hooks/useProject';
import { useExecution } from '../hooks/useExecution';
import { useEditor } from '../hooks/useEditor';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAppState } from '../hooks/useAppState';
import { AppMode, CommandBlock, HardwareState, SpriteState, AppState, CircuitComponent, UserProfile, SavedProject, Mission, ComponentType, CommandType } from '../types/types';

interface AppContextProps {
  // Project
  currentProject: SavedProject | null;
  setCurrentProject: (project: SavedProject | null) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  saveCurrentProject: (isAutoSave?: boolean) => void;

  // Execution
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  executionSpeed: number;
  setExecutionSpeed: (speed: number) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  resumeRef: React.MutableRefObject<() => void>;
  runCode: () => void;
  stopCode: () => void;
  handleStep: () => void;

  // Editor
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  pushToHistory: (commands: CommandBlock[]) => void;
  handleUpdateBlock: (id: string, params: any) => void;
  handleDeleteBlock: (id: string) => void;
  handleDuplicateBlock: (id: string) => void;

  // User Profile
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  handleLoadProject: (project: SavedProject, setCurrentProject: (project: SavedProject) => void, setCommands: (commands: any) => void, setMode: (mode: any) => void, setShowHome: (show: boolean) => void) => void;

  // App State
  hardwareState: HardwareState;
  setHardwareState: (state: HardwareState) => void;
  spriteState: SpriteState;
  setSpriteState: (state: SpriteState) => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
  showConsole: boolean;
  setShowConsole: (show: boolean) => void;
  updateSpriteState: (newState: Partial<SpriteState>) => void;
  circuitComponents: CircuitComponent[];
  setCircuitComponents: (components: CircuitComponent[]) => void;
  pcbColor: string;
  setPcbColor: (color: string) => void;

  // Other
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  stageRef: React.RefObject<any>;
  highlightedPin: number | null;
  showHome: boolean;
  setShowHome: (show: boolean) => void;
  draggedBlockId: string | null;
  setDraggedBlockId: (id: string | null) => void;
  isOverTrash: boolean;
  setIsOverTrash: (over: boolean) => void;
  leftPanelWidth: number;
  setLeftPanelWidth: (width: number) => void;
  rightPanelWidth: number;
  setRightPanelWidth: (width: number) => void;
  showMissions: boolean;
  setShowMissions: (show: boolean) => void;
  showPixelEditor: boolean;
  setShowPixelEditor: (show: boolean) => void;
  showSoundEditor: boolean;
  setShowSoundEditor: (show: boolean) => void;
  showVariables: boolean;
  setShowVariables: (show: boolean) => void;
  showCode: boolean;
  setShowCode: (show: boolean) => void;
  draggedToolType: CommandType | ComponentType | null;
  setDraggedToolType: (type: CommandType | ComponentType | null) => void;
  activeMission: Mission | null;
  setActiveMission: (mission: Mission | null) => void;
  isDraggingLeft: React.MutableRefObject<boolean>;
  isDraggingRight: React.MutableRefObject<boolean>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  activeInputs: React.MutableRefObject<Set<string>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC = ({ children }) => {
  const [mode, setMode] = useState<AppMode>(AppMode.APP);
  const stageRef = useRef<any>(null);

  const {
    hardwareState,
    setHardwareState,
    spriteState,
    setSpriteState,
    appState,
    setAppState,
    consoleLogs,
    setConsoleLogs,
    showConsole,
    setShowConsole,
    updateSpriteState,
    circuitComponents,
    setCircuitComponents,
    pcbColor,
    setPcbColor,
    ...appStateProps
  } = useAppState();

  const editorProps = useEditor();

  const {
    currentProject,
    setCurrentProject,
    saveStatus,
    setSaveStatus,
    saveCurrentProject,
  } = useProject(editorProps.commands, hardwareState, spriteState, appState, circuitComponents, pcbColor, stageRef);

  const {
    isPlaying,
    setIsPlaying,
    highlightedPin,
    ...executionProps
  } = useExecution(editorProps.commands, hardwareState, spriteState, appState, setHardwareState, setSpriteState, setAppState, setConsoleLogs, setShowConsole, mode, appStateProps.activeMission, appStateProps.setActiveMission);

  const userProfileProps = useUserProfile();

  const value = {
    currentProject,
    setCurrentProject,
    saveStatus,
    setSaveStatus,
    saveCurrentProject,
    isPlaying,
    setIsPlaying,
    ...executionProps,
    ...editorProps,
    ...userProfileProps,
    hardwareState,
    setHardwareState,
    spriteState,
    setSpriteState,
    appState,
    setAppState,
    consoleLogs,
    setConsoleLogs,
    showConsole,
    setShowConsole,
    updateSpriteState,
    circuitComponents,
    setCircuitComponents,
    pcbColor,
    setPcbColor,
    mode,
    setMode,
    stageRef,
    highlightedPin,
    ...appStateProps,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
