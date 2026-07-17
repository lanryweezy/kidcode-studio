import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { AppMode } from '../types';
import HardwareStage from './HardwareStage';
import GameStage from './GameStage';
import ErrorBoundary from './ErrorBoundary';
import Stage3D from './Stage3D';
import AppStage from './AppStage';
import { captureThumbnail } from '../services/storageService';

export interface StageHandle {
    getCanvas: () => HTMLCanvasElement | null;
    getGameSize: () => { w: number; h: number };
    getThumbnail: () => string | null;
}

interface StageProps {
    mode: AppMode;
    hardwareState: any;
    hardwareStateRef: React.MutableRefObject<any>;
    spriteState: any;
    spriteStateRef: React.MutableRefObject<any>;
    appState: any;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    circuitComponents: any[];
    onCircuitUpdate: (components: any[]) => void;
    pcbColor: string;
    setPcbColor: (color: string) => void;
    isExecuting: boolean;
    onNavigate: (screen: string) => void;
    highlightPin: number | null;
    inputState: any;
    onInput: (id: string, value: boolean) => void;
    onHardwareInput: (pin: number, value: any) => void;
    onUpdateSpriteState: (state: any) => void;
    shakeAmount: number;
    onAppInteraction: (varName: string, value: any) => void;
    onTick?: () => void;
    wires?: any[];
    onWiresUpdate?: (wires: any[]) => void;
}

const Stage = forwardRef(({
    mode,
    hardwareState,
    hardwareStateRef,
    spriteState,
    spriteStateRef,
    appState,
    canvasRef,
    circuitComponents,
    onCircuitUpdate,
    pcbColor,
    setPcbColor,
    isExecuting,
    onNavigate,
    highlightPin,
    inputState,
    onInput,
    onHardwareInput,
    onUpdateSpriteState,
    shakeAmount,
    onAppInteraction,
    onTick,
    wires,
    onWiresUpdate
}: StageProps, ref) => {
    const [gameCanvasSize, setGameCanvasSize] = useState({ w: 400, h: 400 });

    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        getGameSize: () => gameCanvasSize,
        getThumbnail: () => {
            if (canvasRef.current) return captureThumbnail(canvasRef.current);
            return null;
        }
    }));

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all duration-300"
                style={{
                    backgroundColor: isExecuting ? 'rgb(234 179 8 / 0.1)' : 'rgb(241 245 249 / 0.8)',
                    borderColor: isExecuting ? 'rgb(234 179 8 / 0.3)' : 'rgb(226 232 240 / 0.8)',
                    color: isExecuting ? '#a16207' : '#64748b'
                }}
            >
                <span className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                {isExecuting ? 'Running' : 'Ready'}
            </div>
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full blur-[120px]" />
            </div>

            {mode === AppMode.HARDWARE && (
                <HardwareStage
                    hardwareState={hardwareState}
                    hardwareStateRef={hardwareStateRef}
                    circuitComponents={circuitComponents}
                    pcbColor={pcbColor}
                    onCircuitUpdate={onCircuitUpdate}
                    isExecuting={isExecuting}
                    onHardwareInput={onHardwareInput}
                    wires={wires}
                    onWiresUpdate={onWiresUpdate}
                />
            )}

            {mode === AppMode.GAME && (
                spriteState.is3D ? (
                    <Stage3D
                        spriteState={spriteState}
                        spriteStateRef={spriteStateRef}
                        isExecuting={isExecuting}
                        shakeAmount={shakeAmount}
                        gameCanvasSize={gameCanvasSize}
                        onInput={onInput}
                        inputState={inputState}
                    />
                ) : (
                    <ErrorBoundary fallback={({ error }) => (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <h2 className="text-2xl font-bold text-red-500 mb-4">Game crashed</h2>
                            <p className="text-slate-600 mb-4">{error?.message || 'An unexpected error occurred'}</p>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                onClick={() => window.location.reload()}
                            >
                                Restart
                            </button>
                        </div>
                    )}>
                        <GameStage
                            spriteState={spriteState}
                            spriteStateRef={spriteStateRef}
                            appState={appState}
                            canvasRef={canvasRef}
                            isExecuting={isExecuting}
                            shakeAmount={shakeAmount}
                            onUpdateSpriteState={onUpdateSpriteState}
                            gameCanvasSize={gameCanvasSize}
                            onGameCanvasResize={(w: number, h: number) => setGameCanvasSize({ w, h })}
                            onInput={onInput}
                            onTick={onTick}
                        />
                    </ErrorBoundary>
                )
            )}

            {mode === AppMode.APP && (
                <AppStage
                    appState={appState}
                    onNavigate={onNavigate}
                    onAppInteraction={onAppInteraction}
                />
            )}
        </div>
    );
});

export default Stage;
