import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { SpriteState } from '../types';
import * as THREE from 'three';
import { GameEngine3D, Camera3D, Light3D, GameObject3D, PhysicsConfig } from '../services/gameEngine3D';
import { playSoundEffect } from '../services/soundService';

export interface Stage3DHandle {
  takeScreenshot: () => string;
  getThumbnail: () => string | null;
}

interface Stage3DProps {
  spriteState: SpriteState;
  spriteStateRef?: React.MutableRefObject<SpriteState>;
  isExecuting?: boolean;
  shakeAmount?: number;
  gameCanvasSize?: { w: number; h: number };
  onInput?: (key: string, pressed: boolean) => void;
  inputState?: Set<string>;
}

const Stage3D = forwardRef<Stage3DHandle, Stage3DProps>(({
  spriteState,
  spriteStateRef,
  isExecuting,
  shakeAmount,
  gameCanvasSize,
  onInput,
  inputState
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine3D | null>(null);
  const animationFrameRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return '';
    },
    getThumbnail: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/jpeg', 0.5);
      }
      return null;
    }
  }));

  // Initialize 3D Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GameEngine3D(canvas);
    engineRef.current = engine;

    // Set initial camera
    engine.setCamera({
      type: 'perspective',
      position: { x: 0, y: 5, z: 10 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      near: 0.1,
      far: 1000
    });

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    engine.getScene().add(ground);

    setIsReady(true);

    // Start render loop
    engine.render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      engine.dispose();
    };
  }, []);

  // Update scene based on sprite state
  useEffect(() => {
    if (!engineRef.current || !isReady) return;

    const engine = engineRef.current;
    const state = isExecuting && spriteStateRef ? spriteStateRef.current : spriteState;

    // Update background color based on scene
    const sceneColors: Record<string, string> = {
      grid: '#ffffff',
      space: '#0f172a',
      forest: '#ecfccb',
      desert: '#fef3c7',
      night: '#1e1b4b'
    };
    const bgColor = sceneColors[state.scene || 'grid'] || '#87ceeb';
    engine.setBackgroundColor(bgColor);

    // Update player position
    if (state.x !== undefined && state.y !== undefined) {
      engine.setGameObjectTransform('player',
        { x: state.x - 200, y: state.y - 200, z: 0 },
        { x: 0, y: 0, z: state.rotation || 0 },
        { x: state.scale || 1, y: state.scale || 1, z: state.scale || 1 }
      );
    }

    // Screen shake
    if (shakeAmount && shakeAmount > 0) {
      const camera = engine.getCamera();
      camera.position.x += (Math.random() - 0.5) * shakeAmount;
      camera.position.y += (Math.random() - 0.5) * shakeAmount;
    }

  }, [spriteState, isExecuting, isReady, shakeAmount, spriteStateRef]);

  // Handle keyboard input
  useEffect(() => {
    if (!engineRef.current || !isReady) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputState?.has(e.code)) return;
      onInput?.(e.code, true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      onInput?.(e.code, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isReady, onInput, inputState]);

  return (
    <div
      className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        width: gameCanvasSize?.w || 400,
        height: gameCanvasSize?.h || 400
      }}
    >
      <canvas
        ref={canvasRef}
        width={gameCanvasSize?.w || 400}
        height={gameCanvasSize?.h || 400}
        className="block"
      />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-bold">Loading 3D Engine...</div>
          </div>
        </div>
      )}

      {/* 3D Controls Overlay */}
      {isReady && isExecuting && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
          {/* D-Pad */}
          <div className="flex flex-col items-center gap-1 pointer-events-auto">
            <button
              className="w-12 h-12 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white active:scale-95 transition-transform"
              onTouchStart={() => onInput?.('ArrowUp', true)}
              onTouchEnd={() => onInput?.('ArrowUp', false)}
            >
              ▲
            </button>
            <div className="flex gap-1">
              <button
                className="w-12 h-12 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white active:scale-95 transition-transform"
                onTouchStart={() => onInput?.('ArrowLeft', true)}
                onTouchEnd={() => onInput?.('ArrowLeft', false)}
              >
                ◀
              </button>
              <button
                className="w-12 h-12 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white active:scale-95 transition-transform"
                onTouchStart={() => onInput?.('ArrowDown', true)}
                onTouchEnd={() => onInput?.('ArrowDown', false)}
              >
                ▼
              </button>
              <button
                className="w-12 h-12 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white active:scale-95 transition-transform"
                onTouchStart={() => onInput?.('ArrowRight', true)}
                onTouchEnd={() => onInput?.('ArrowRight', false)}
              >
                ▶
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pointer-events-auto">
            <button
              className="w-14 h-14 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold active:scale-95 transition-transform"
              onTouchStart={() => onInput?.('KeyZ', true)}
              onTouchEnd={() => onInput?.('KeyZ', false)}
            >
              B
            </button>
            <button
              className="w-14 h-14 bg-green-500/80 hover:bg-green-600 rounded-full flex items-center justify-center text-white font-bold active:scale-95 transition-transform"
              onTouchStart={() => onInput?.('KeyX', true)}
              onTouchEnd={() => onInput?.('KeyX', false)}
            >
              A
            </button>
          </div>
        </div>
      )}

      {/* 3D Mode Badge */}
      {isReady && (
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-black rounded-full shadow-lg">
          🎮 3D MODE
        </div>
      )}
    </div>
  );
});

export default Stage3D;
