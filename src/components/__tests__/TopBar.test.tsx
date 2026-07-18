import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TopBar from '../TopBar';
import { AppMode } from '../../types';

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

vi.mock('../../services/standaloneExporter', () => ({
  exportToStandaloneHTML: vi.fn(() => '<html></html>'),
}));

vi.mock('../../services/codeExporter', () => ({
  downloadArduinoCode: vi.fn(),
  exportToArduino: vi.fn(() => 'void setup() {}'),
}));

vi.mock('../../services/webSerialService', () => ({
  serialService: {
    isConnected: vi.fn(() => false),
    sendCode: vi.fn(),
  },
}));

vi.mock('../../services/multiplayerService', () => ({
  multiplayerService: {
    joinRoom: vi.fn(),
  },
}));

vi.mock('../../services/errorDiagnosis', () => ({
  diagnoseCode: vi.fn(() => ({
    errors: [],
    suggestions: [],
  })),
}));

vi.mock('../../components/ErrorDiagnosisHelp', () => ({
  ErrorDiagnosisHelp: vi.fn(() => <div data-testid="error-diagnosis-help" />),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

describe('TopBar', () => {
  const defaultProps = {
    isPlaying: false,
    debugMode: false,
    setDebugMode: vi.fn(),
    isPaused: false,
    runCode: vi.fn(),
    stopCode: vi.fn(),
    resumeCode: vi.fn(),
    currentProject: {
      id: '1',
      name: 'Test Project',
      mode: 'game' as any,
      lastEdited: Date.now(),
      data: {
        commands: [],
        hardwareState: {} as any,
        spriteState: {} as any,
        appState: {} as any,
        circuitComponents: [],
        wires: [],
        pcbColor: '#00ff00',
      },
    },
    setProject: vi.fn(),
    saveStatus: 'saved',
    onOpenCodePages: vi.fn(),
    is3DMode: false,
    onToggle3D: vi.fn(),
  };

  beforeEach(() => {
    mockUseStore.mockReturnValue({
      setShowHome: vi.fn(),
      mode: AppMode.GAME,
      undo: vi.fn(),
      redo: vi.fn(),
      setShowHelp: vi.fn(),
      setLeftPanelWidth: vi.fn(),
      leftPanelWidth: 280,
      circuitComponents: [],
      pcbColor: '#00ff00',
      isLive: false,
      setIsLive: vi.fn(),
      setShowMarketplace: vi.fn(),
      setShowTutorial: vi.fn(),
      commands: [],
    });
  });

  it('renders the TopBar component', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /go to home/i })).toBeTruthy();
  });

  it('displays project name', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByDisplayValue('Test Project')).toBeTruthy();
  });

  it('displays save status', () => {
    render(<TopBar {...defaultProps} saveStatus="saved" />);
    expect(screen.getByText('topbar.saved')).toBeTruthy();
  });

  it('calls undo when undo button is clicked', () => {
    const undo = vi.fn();
    mockUseStore.mockReturnValue({
      ...mockUseStore(),
      undo,
    });
    render(<TopBar {...defaultProps} />);
    const undoButton = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(undoButton);
    expect(undo).toHaveBeenCalled();
  });

  it('calls redo when redo button is clicked', () => {
    const redo = vi.fn();
    mockUseStore.mockReturnValue({
      ...mockUseStore(),
      redo,
    });
    render(<TopBar {...defaultProps} />);
    const redoButton = screen.getByRole('button', { name: /redo/i });
    fireEvent.click(redoButton);
    expect(redo).toHaveBeenCalled();
  });

  it('calls runCode when run button is clicked', () => {
    const runCode = vi.fn();
    render(<TopBar {...defaultProps} runCode={runCode} />);
    const runButton = screen.getByRole('button', { name: /run/i });
    fireEvent.click(runButton);
    expect(runCode).toHaveBeenCalled();
  });

  it('calls stopCode when stop button is clicked while playing', () => {
    const stopCode = vi.fn();
    render(<TopBar {...defaultProps} isPlaying={true} stopCode={stopCode} />);
    const stopButton = screen.getByRole('button', { name: /stop/i });
    fireEvent.click(stopButton);
    expect(stopCode).toHaveBeenCalled();
  });

  it('toggles debug mode when debug button is clicked', () => {
    const setDebugMode = vi.fn();
    render(<TopBar {...defaultProps} setDebugMode={setDebugMode} />);
    const debugButton = screen.getByRole('button', { name: /toggle debugger/i });
    fireEvent.click(debugButton);
    expect(setDebugMode).toHaveBeenCalledWith(true);
  });

  it('displays publish button', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /publish/i })).toBeTruthy();
  });

  it('displays help button', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /help/i })).toBeTruthy();
  });

  it('displays marketplace button', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /marketplace/i })).toBeTruthy();
  });

  it('displays run code button', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /run/i })).toBeTruthy();
  });

  it('shows step over button in debug mode', () => {
    render(<TopBar {...defaultProps} debugMode={true} />);
    expect(screen.getByRole('button', { name: /step/i })).toBeTruthy();
  });

  it('displays project name input', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByDisplayValue('Test Project')).toBeTruthy();
  });
});
