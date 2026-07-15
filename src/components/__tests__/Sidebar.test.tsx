import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Sidebar from '../Sidebar';
import { AppMode } from '../../types/enums';

const mockUseStore = vi.fn();

vi.mock('../../store/useStore', () => ({
  useStore: (...args: unknown[]) => mockUseStore(...args),
}));

vi.mock('../../components/ui/Toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('../../components/ui/Button', () => ({
  Button: vi.fn(({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>{children}</button>
  )),
}));

vi.mock('../../components/SidebarDock', () => ({
  default: vi.fn(({ onTabChange }: { onTabChange: (tab: string) => void }) => (
    <div data-testid="sidebar-dock">
      <button onClick={() => onTabChange('blocks')}>Blocks</button>
      <button onClick={() => onTabChange('design')}>Design</button>
      <button onClick={() => onTabChange('components')}>Components</button>
    </div>
  )),
}));

vi.mock('../../components/AIChat', () => ({
  default: vi.fn(() => <div data-testid="ai-chat" />),
}));

vi.mock('../../components/AnimationSequencer', () => ({
  default: vi.fn(() => <div data-testid="animation-sequencer" />),
}));

vi.mock('../../components/MissionProgress', () => ({
  MissionProgress: vi.fn(() => <div data-testid="mission-progress" />),
}));

vi.mock('../../components/game/TilePalette', () => ({
  TilePalette: vi.fn(() => <div data-testid="tile-palette" />),
}));

vi.mock('../../components/game/WeatherPicker', () => ({
  WeatherPicker: vi.fn(() => <div data-testid="weather-picker" />),
}));

vi.mock('../../components/game/EntityPlacer', () => ({
  EntityPlacer: vi.fn(() => <div data-testid="entity-placer" />),
}));

vi.mock('../../components/game/BossDesigner', () => ({
  BossDesigner: vi.fn(() => <div data-testid="boss-designer" />),
}));

vi.mock('../../components/game/PhysicsPlayground', () => ({
  PhysicsPlayground: vi.fn(() => <div data-testid="physics-playground" />),
}));

vi.mock('../../components/game/DayNightCycle', () => ({
  DayNightCycle: vi.fn(() => <div data-testid="daynight-cycle" />),
}));

vi.mock('../../components/game/CutsceneEditor', () => ({
  CutsceneEditor: vi.fn(() => <div data-testid="cutscene-editor" />),
}));

vi.mock('../../components/game/InventoryBuilder', () => ({
  InventoryBuilder: vi.fn(() => <div data-testid="inventory-builder" />),
}));

vi.mock('../../components/game/SoundEffectBuilder', () => ({
  SoundEffectBuilder: vi.fn(() => <div data-testid="sound-builder" />),
}));

vi.mock('../../components/game/PluginManager', () => ({
  default: vi.fn(() => <div data-testid="plugin-manager" />),
}));

vi.mock('../../components/ComponentThumbnail', () => ({
  default: vi.fn(() => <div data-testid="component-thumbnail" />),
}));

vi.mock('../../services/codeExporter', () => ({
  exportToPython: vi.fn(() => 'print("hello")'),
  exportToJavaScript: vi.fn(() => 'console.log("hello")'),
}));

vi.mock('../../services/pluginSystem', () => ({
  pluginSystem: {
    getRegisteredBlocks: vi.fn(() => new Map()),
  },
}));

function createStoreState(overrides: Record<string, unknown> = {}) {
  return {
    mode: AppMode.GAME,
    activeTab: 'blocks',
    setActiveTab: vi.fn(),
    setShowHome: vi.fn(),
    setShowProfile: vi.fn(),
    setShowStats: vi.fn(),
    leftPanelWidth: 300,
    setLeftPanelWidth: vi.fn(),
    appState: {},
    updateAppState: vi.fn(),
    spriteState: { emoji: '🧙', texture: null, frames: [] },
    updateSpriteState: vi.fn(),
    commands: [],
    setShowPixelEditor: vi.fn(),
    setShowParticleEditor: vi.fn(),
    setShowMusicStudio: vi.fn(),
    setShowSoundRecorder: vi.fn(),
    setShowAssetManager: vi.fn(),
    setShowAI3DCreator: vi.fn(),
    setShowMusicGenerator: vi.fn(),
    setShowSpriteExtractor: vi.fn(),
    circuitSearch: '',
    setCircuitSearch: vi.fn(),
    blockSearch: '',
    setBlockSearch: vi.fn(),
    expandedCategories: {},
    setExpandedCategories: vi.fn(),
    activeMission: null,
    setActiveMission: vi.fn(),
    ...overrides,
  };
}

describe('Sidebar', () => {
  const defaultProps = {
    handleAppendCode: vi.fn(),
    handleReplaceCode: vi.fn(),
    handleGenerateSprite: vi.fn(),
    isGeneratingSprite: false,
    setShowQuestEditor: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockReturnValue(createStoreState());
  });

  it('renders without crashing', () => {
    render(<Sidebar {...defaultProps} />);
  });

  it('shows sidebar dock', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByTestId('sidebar-dock')).toBeTruthy();
  });

  it('shows block library in default tab', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Block Library')).toBeTruthy();
  });

  it('shows search input for blocks', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search blocks...')).toBeTruthy();
  });

  it('shows beginner friendly badge', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText(/Beginner Friendly/)).toBeTruthy();
  });

  it('shows starter blocks section', async () => {
    render(<Sidebar {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Starter Blocks')).toBeTruthy();
    });
  });

  it('shows export tab content', () => {
    mockUseStore.mockReturnValue(createStoreState({ activeTab: 'export' }));
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Code Export')).toBeTruthy();
  });

  it('shows Python and JavaScript code blocks in export tab', () => {
    mockUseStore.mockReturnValue(createStoreState({ activeTab: 'export' }));
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Python')).toBeTruthy();
    expect(screen.getByText('JavaScript')).toBeTruthy();
  });

  it('shows AI chat in ai tab', () => {
    mockUseStore.mockReturnValue(createStoreState({ activeTab: 'ai' }));
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByTestId('ai-chat')).toBeTruthy();
  });

  it('shows design tools in design tab for GAME mode', () => {
    mockUseStore.mockReturnValue(createStoreState({ activeTab: 'design', mode: AppMode.GAME }));
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Sprite')).toBeTruthy();
    expect(screen.getByText('Anims')).toBeTruthy();
  });

  it('shows components search in hardware mode', () => {
    mockUseStore.mockReturnValue(createStoreState({ activeTab: 'components', mode: AppMode.HARDWARE }));
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search parts...')).toBeTruthy();
  });

  it('shows no blocks message when search has no results', () => {
    mockUseStore.mockReturnValue(createStoreState({ blockSearch: 'zzzzzzzznonexistent' }));
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText(/No blocks/)).toBeTruthy();
  });

  it('switches tabs via dock', () => {
    render(<Sidebar {...defaultProps} />);
    const designBtn = screen.getByText('Design');
    fireEvent.click(designBtn);
  });
});
