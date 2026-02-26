import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { SpriteState } from '../types';
import * as THREE from 'three';
import { GameEngine3D, Camera3D, Light3D, GameObject3D, PhysicsConfig } from '../services/gameEngine3D';
import { playSoundEffect } from '../services/soundService';
import { generateTerrain, TerrainConfig } from '../services/terrainGenerator';

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

    // Start render loop
    engine.render();

    setIsReady(true);

    return () => {
      engine.dispose();
    };
  }, []);

  const lastWorldSeed = useRef<number | undefined>(undefined);

  // Update scene based on sprite state
  useEffect(() => {
    if (!engineRef.current || !isReady) return;

    const engine = engineRef.current;
    const state = (isExecuting && spriteStateRef) ? spriteStateRef.current : spriteState;

    // Sync all baseline 3D state
    engine.updateFromSpriteState(state);

    // Sync dynamic 3D objects spawned via blocks
    engine.updateObjects3D(state.objects3d || []);

    // Reactive World Generation (Triggered by code blocks)
    if (state.worldSeed !== lastWorldSeed.current) {
      console.log('Regenerating 3D world with seed:', state.worldSeed);
      lastWorldSeed.current = state.worldSeed;

      // Clean up old environment instances
      const scene = engine.getScene();
      const toRemove: THREE.Object3D[] = [];
      scene.children.forEach(child => {
        if (child.name.endsWith('_instances')) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(c => scene.remove(c));

      const config: TerrainConfig = {
        seed: worldSeed,
        width: 50,
        height: 50,
        scale: 15,
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2.0,
        seaLevel: 0.3,
        theme: state.worldPrompt
      };

      const terrain = generateTerrain(config);
      const decorations = new Map<string, Array<any>>();
      terrain.tiles.forEach(row => {
        row.forEach(tile => {
          if (tile.decoration) {
            if (!decorations.has(tile.decoration)) decorations.set(tile.decoration, []);
            decorations.get(tile.decoration)?.push({
              position: { x: (tile.x - 25) * 2, y: 0.5, z: (tile.y - 25) * 2 },
              rotation: { x: 0, y: Math.random() * Math.PI, z: 0 },
              scale: { x: 1, y: 1, z: 1 }
            });
          }
        });
      });

      decorations.forEach((transforms, type) => {
        engine.addInstancedMesh(`${type}_instances`, `/models/${type}.glb`, transforms);
      });
    }

    // Screen shake
    if (shakeAmount && shakeAmount > 0) {
      const camera = engine.getCamera();
      camera.position.x += (Math.random() - 0.5) * shakeAmount;
      camera.position.y += (Math.random() - 0.5) * shakeAmount;
    }
  }, [spriteState.worldSeed, spriteState.objects3d, isExecuting, isReady, shakeAmount, spriteStateRef, spriteState]);

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
        <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end pointer-events-none">
          {/* Virtual Joystick */}
          <div className="relative w-32 h-32 bg-slate-800/40 rounded-full border-2 border-white/10 backdrop-blur-sm pointer-events-auto overflow-hidden">
            <div
              className="absolute inset-0 flex items-center justify-center"
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const x = touch.clientX - (rect.left + rect.width / 2);
                const y = touch.clientY - (rect.top + rect.height / 2);
                const dist = Math.sqrt(x * x + y * y);
                const angle = Math.atan2(y, x);

                // Map joystick to Arrow keys
                if (dist > 10) {
                  onInput?.('ArrowUp', y < -dist * 0.5);
                  onInput?.('ArrowDown', y > dist * 0.5);
                  onInput?.('ArrowLeft', x < -dist * 0.5);
                  onInput?.('ArrowRight', x > dist * 0.5);
                }
              }}
              onTouchEnd={() => {
                onInput?.('ArrowUp', false);
                onInput?.('ArrowDown', false);
                onInput?.('ArrowLeft', false);
                onInput?.('ArrowRight', false);
              }}
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-full shadow-lg border-2 border-white/20" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pointer-events-auto">
            <button
              className="w-16 h-16 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold active:scale-95 transition-transform"
              onTouchStart={() => onInput?.('KeyZ', true)}
              onTouchEnd={() => onInput?.('KeyZ', false)}
            >
              B
            </button>
            <button
              className="w-16 h-16 bg-green-500/80 hover:bg-green-600 rounded-full flex items-center justify-center text-white font-bold active:scale-95 transition-transform"
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
