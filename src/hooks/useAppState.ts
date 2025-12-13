
import { useState, useCallback, useRef } from 'react';
import { HardwareState, SpriteState, AppState, CircuitComponent, CommandBlock, Mission, BlockDefinition, CommandType, ComponentType } from '../types/types';
import { INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE } from '../constants/constants';

export const useAppState = () => {
  const [hardwareState, setHardwareState] = useState<HardwareState>(INITIAL_HARDWARE_STATE);
  const [spriteState, setSpriteState] = useState<SpriteState>(INITIAL_SPRITE_STATE);
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([]);
  const [pcbColor, setPcbColor] = useState<string>('#059669');
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [darkMode, setDarkMode] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  const [showMissions, setShowMissions] = useState(false);
  const [showPixelEditor, setShowPixelEditor] = useState(false);
  const [showSoundEditor, setShowSoundEditor] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [draggedToolType, setDraggedToolType] = useState<CommandType | ComponentType | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeInputs = useRef<Set<string>>(new Set());

  const updateSpriteState = useCallback((newState: Partial<SpriteState>) => {
    setSpriteState(prev => ({ ...prev, ...newState }));
  }, []);

  return {
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
    showHome,
    setShowHome,
    activeTab,
    setActiveTab,
    darkMode,
    setDarkMode,
    draggedBlockId,
    setDraggedBlockId,
    isOverTrash,
    setIsOverTrash,
    leftPanelWidth,
    setLeftPanelWidth,
    rightPanelWidth,
    setRightPanelWidth,
    showMissions,
    setShowMissions,
    showPixelEditor,
    setShowPixelEditor,
    showSoundEditor,
    setShowSoundEditor,
    showVariables,
    setShowVariables,
    showCode,
    setShowCode,
    draggedToolType,
    setDraggedToolType,
    activeMission,
    setActiveMission,
    isDraggingLeft,
    isDraggingRight,
    canvasRef,
    activeInputs,
  };
};
