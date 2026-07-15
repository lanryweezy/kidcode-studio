import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GameStage from '../GameStage';
import { SpriteState, AppState } from '../../types';
import { AppMode } from '../../types/enums';

vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(cb, 0) as unknown as number);
vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));

vi.mock('../../services/soundService', () => ({
  playSoundEffect: vi.fn(),
}));

vi.mock('../../services/keyframeAnimation', () => ({
  AnimationManager: vi.fn().mockImplementation(() => ({
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    update: vi.fn(),
    getTracks: vi.fn(() => []),
  })),
}));

function createDefaultSpriteState(overrides: Partial<SpriteState> = {}): SpriteState {
  return {
    x: 100,
    y: 100,
    z: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    emoji: '🧙',
    texture: null,
    frames: [],
    animations: {},
    currentAnimation: null,
    animationSpeed: 1,
    speech: null,
    weather: 'none',
    score: 0,
    keys: 0,
    health: 100,
    maxHealth: 100,
    variables: {},
    is3D: false,
    cameraMode: 'third_person',
    powerups: {},
    vx: 0,
    vy: 0,
    gravity: true,
    isJumping: false,
    jumpForce: 12,
    enemies: [],
    items: [],
    projectiles: [],
    tilemap: [],
    inventory: [],
    maxInventorySize: 30,
    ...overrides,
  } as SpriteState;
}

function createDefaultAppState(overrides: Partial<AppState> = {}): AppState {
  return {
    activeTab: 'blocks',
    showHome: false,
    showProfile: false,
    showSettings: false,
    showHelp: false,
    showStats: false,
    showQuestEditor: false,
    showPixelEditor: false,
    showParticleEditor: false,
    showMusicStudio: false,
    showSoundRecorder: false,
    showAssetManager: false,
    showAI3DCreator: false,
    showMusicGenerator: false,
    showSpriteExtractor: false,
    activeLevelTool: null,
    mode: AppMode.GAME,
    leftPanelWidth: 300,
    rightPanelWidth: 300,
    ...overrides,
  } as AppState;
}

describe('GameStage', () => {
  let spriteState: SpriteState;
  let spriteStateRef: React.MutableRefObject<SpriteState>;
  let appState: AppState;
  let canvasRef: React.RefObject<HTMLCanvasElement>;
  let onUpdateSpriteState: ReturnType<typeof vi.fn>;
  let onInput: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    spriteState = createDefaultSpriteState();
    spriteStateRef = { current: spriteState };
    appState = createDefaultAppState();
    canvasRef = { current: document.createElement('canvas') } as React.RefObject<HTMLCanvasElement>;
    onUpdateSpriteState = vi.fn();
    onInput = vi.fn();
  });

  it('renders without crashing', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={false}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
  });

  it('renders canvas element', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={false}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('applies default canvas dimensions', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={false}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    const canvas = document.querySelector('canvas');
    expect(canvas?.getAttribute('width')).toBeTruthy();
  });

  it('shows virtual buttons when executing', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={true}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onInput when virtual button is pressed', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={true}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.pointerDown(buttons[0]);
      expect(onInput).toHaveBeenCalled();
    }
  });

  it('calls onInput release on pointer up', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={true}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.pointerDown(buttons[0]);
      fireEvent.pointerUp(buttons[0]);
      expect(onInput).toHaveBeenCalled();
    }
  });

  it('does not show virtual buttons when not executing', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={false}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    expect(screen.queryByLabelText('up button')).toBeNull();
  });

  it('does not show RPG HUD when not executing', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={false}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
      />
    );
    expect(screen.queryByTestId('rpg-hud')).toBeNull();
  });

  it('renders with custom dimensions', () => {
    render(
      <GameStage
        spriteState={spriteState}
        spriteStateRef={spriteStateRef}
        appState={appState}
        canvasRef={canvasRef}
        isExecuting={false}
        shakeAmount={0}
        onUpdateSpriteState={onUpdateSpriteState}
        onInput={onInput}
        gameCanvasSize={{ w: 600, h: 400 }}
      />
    );
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});
