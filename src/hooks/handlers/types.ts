import React from 'react';
import {
    CommandBlock,
    SpriteState,
    AppState,
    HardwareState,
    CircuitComponent,
    AppElement,
    GameEntity,
    AppMode
} from '../../types';
import { playSoundEffect } from '../../services/soundService';
import { eventBus } from '../../services/eventBus';

export interface HandlerContext {
    cmd: CommandBlock;
    mode: AppMode;
    spriteStateRef: React.MutableRefObject<SpriteState>;
    appStateRef: React.MutableRefObject<AppState>;
    hardwareStateRef: React.MutableRefObject<HardwareState>;
    setNpcChat: (chat: { name: string; message: string } | null) => void;
    playSound: typeof playSoundEffect;
    setConsoleLogs: React.Dispatch<React.SetStateAction<string[]>>;
    stopExecution: React.MutableRefObject<boolean>;
    wait: (ms: number) => Promise<unknown>;
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    setSpriteState: React.Dispatch<React.SetStateAction<SpriteState>>;
    setHardwareState: React.Dispatch<React.SetStateAction<HardwareState>>;
    hardwareState: HardwareState;
    isPlaying: boolean;
    isBoardConnected: boolean;
    showConsole: boolean;
    setShowConsole: React.Dispatch<React.SetStateAction<boolean>>;
    plugins: Record<string, unknown>;
    addPlugin: (name: string, elements: AppElement[]) => void;
    renderingScreen: React.MutableRefObject<string>;
    particleSettings: { type: string; color: string; count: number; speed: number; size: number };
    circuitComponents: CircuitComponent[];
    setGameState: (state: 'playing' | 'won' | 'over') => void;
    addAppElement: (type: AppElement['type'] | 'news_feed' | 'chat_bubble', defaultContent: string, extraParams?: Record<string, unknown>) => void;
    eventBus: typeof eventBus;
}
