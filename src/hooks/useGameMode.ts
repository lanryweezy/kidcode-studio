import { useRef, useCallback, useState, useEffect } from 'react';
import { GameModeManager } from '../services/gameModeManager';
import { CommandBlock } from '../types';
import { GameState } from '../services/engine/types';
import { useStore } from '../store/useStore';

interface UseGameModeProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useGameMode = ({ canvasRef }: UseGameModeProps) => {
  const managerRef = useRef<GameModeManager | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const { setGameState: setUIGameState, isGameMode } = useStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [canvasRef]);

  const play = useCallback((blocks: CommandBlock[], toolState?: Parameters<GameModeManager['start']>[1]) => {
    if (!canvasRef.current) return;
    if (isActive) return;

    const manager = new GameModeManager(canvasRef.current, {
      onStateChange: (state) => {
        setGameState(state);
        if (state.gameOver) setUIGameState('over');
        else if (state.victory) setUIGameState('won');
        else if (state.isPlaying) setUIGameState('playing');
      },
      onGameOver: () => {
        setIsActive(false);
        setUIGameState('over');
      },
      onVictory: () => {
        setIsActive(false);
        setUIGameState('won');
      },
    });

    managerRef.current = manager;
    manager.start(blocks, toolState);
    setIsActive(true);
    setUIGameState('playing');
  }, [canvasRef, isActive, setUIGameState]);

  const stop = useCallback(() => {
    managerRef.current?.stop();
    managerRef.current?.destroy();
    managerRef.current = null;
    setIsActive(false);
    setGameState(null);
  }, []);

  const pause = useCallback(() => {
    managerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    managerRef.current?.resume();
  }, []);

  return {
    gameState,
    isActive,
    isGameMode,
    play,
    stop,
    pause,
    resume,
  };
};
