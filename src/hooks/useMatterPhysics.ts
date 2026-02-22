
import { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { SpriteState, GameEntity } from '../types';

interface UseMatterPhysicsProps {
  spriteState: SpriteState;
  setSpriteState: React.Dispatch<React.SetStateAction<SpriteState>>;
  spriteStateRef: React.MutableRefObject<SpriteState>;
  gameCanvasSizeRef: React.MutableRefObject<{ w: number, h: number }>;
  isExecuting: boolean;
}

export const useMatterPhysics = ({
  spriteStateRef,
  gameCanvasSizeRef,
  isExecuting
}: UseMatterPhysicsProps) => {
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesMap = useRef<Map<string, Matter.Body>>(new Map());

  // Initialize Engine
  useEffect(() => {
    const engine = Matter.Engine.create();
    engineRef.current = engine;
    engine.gravity.y = 1; // Default gravity

    return () => {
      Matter.Engine.clear(engine);
    };
  }, []);

  // Sync State to Physics World
  const syncToPhysics = useCallback(() => {
    if (!engineRef.current) return;
    const world = engineRef.current.world;
    const state = spriteStateRef.current;
    const { w, h } = gameCanvasSizeRef.current;

    // 1. Create/Update Player Body
    let playerBody = bodiesMap.current.get('player');
    if (!playerBody) {
      playerBody = Matter.Bodies.rectangle(state.x, state.y, 40, 40, {
        label: 'player',
        inertia: Infinity, // Prevent rotation for platformer feel by default
        friction: 0.05
      });
      Matter.Composite.add(world, playerBody);
      bodiesMap.current.set('player', playerBody);
    }

    // 2. Create/Update Static World Bodies (Tiles)
    // In a real implementation, we would diff the tilemap to avoid recreating every frame.
    // For this prototype, we'll assume static tiles are created once on start or handled separately.
    
    // 3. Update Forces based on State (e.g. Jump)
    if (state.vy !== 0 && !state.isJumping) {
        // Apply manual velocity override if needed
        Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: state.vy });
    }
  }, [spriteStateRef, gameCanvasSizeRef]);

  // Sync Physics World to State
  const syncFromPhysics = useCallback(() => {
    if (!engineRef.current) return;
    const playerBody = bodiesMap.current.get('player');
    
    if (playerBody) {
        spriteStateRef.current.x = playerBody.position.x;
        spriteStateRef.current.y = playerBody.position.y;
        spriteStateRef.current.rotation = (playerBody.angle * 180) / Math.PI;
    }
  }, [spriteStateRef]);

  // The Physics Loop
  const tick = useCallback(() => {
    if (!isExecuting || !engineRef.current) return;

    // 1. Sync React State -> Matter.js
    // (In a full implementation, we only push "Input" forces here, not full state overrides)
    
    // 2. Step Physics
    Matter.Engine.update(engineRef.current, 1000 / 60);

    // 3. Sync Matter.js -> React State
    syncFromPhysics();

  }, [isExecuting, syncFromPhysics]);

  return {
    engineRef,
    bodiesMap,
    tick
  };
};
