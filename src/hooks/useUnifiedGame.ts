import { useRef, useEffect, useCallback, useState } from 'react';
import { UnifiedGameEngine, UnifiedGameState } from '../services/unifiedGameEngine';

interface UseUnifiedGameProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  levelData?: Record<string, unknown>;
}

export const useUnifiedGame = ({ canvasRef, levelData }: UseUnifiedGameProps) => {
  const engineRef = useRef<UnifiedGameEngine | null>(null);
  const [gameState, setGameState] = useState<UnifiedGameState | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new UnifiedGameEngine(canvasRef.current);
    engineRef.current = engine;

    // Poll state
    const interval = setInterval(() => {
      if (engineRef.current) {
        setGameState(engineRef.current.getState());
      }
    }, 100);

    return () => {
      clearInterval(interval);
      engine.destroy();
    };
  }, [canvasRef]);

  useEffect(() => {
    if (engineRef.current && levelData) {
      engineRef.current.loadLevel(levelData);
    }
  }, [levelData]);

  const start = useCallback(() => {
    engineRef.current?.start();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setIsRunning(false);
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const restart = useCallback(() => {
    engineRef.current?.destroy();
    if (canvasRef.current) {
      const engine = new UnifiedGameEngine(canvasRef.current);
      engineRef.current = engine;
      if (levelData) engine.loadLevel(levelData);
      engine.start();
      setIsRunning(true);
    }
  }, [canvasRef, levelData]);

  return {
    gameState,
    isRunning,
    start,
    stop,
    pause,
    resume,
    restart,
  };
};
