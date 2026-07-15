
import { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from '../services/gameEngine';
import { playSoundEffect } from '../services/soundService';
import { saveGameState, loadGameState } from '../services/gameSaveSystem';
import { Tile, GameEntity } from '../types';
import { GameState } from '../services/engine/types';

export interface ToolState {
  tiles?: Tile[];
  enemies?: GameEntity[];
  items?: GameEntity[];
  weather?: string;
  health?: number;
  maxHp?: number;
  score?: number;
  gravity?: boolean;
  gravityForce?: number;
}

interface UseGameEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  toolState: ToolState;
  templateId?: string;
  onStateChange?: (state: GameState) => void;
  onGameOver?: () => void;
  onVictory?: () => void;
  onWaveComplete?: (wave: number) => void;
}

export const useGameEngine = ({
  canvasRef,
  toolState,
  templateId,
  onStateChange,
  onGameOver,
  onVictory,
  onWaveComplete,
}: UseGameEngineProps) => {
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStateChange: (state) => {
        setGameState(state);
        onStateChange?.(state);
      },
      onGameOver: () => {
        setIsRunning(false);
        onGameOver?.();
      },
      onVictory: () => {
        setIsRunning(false);
        onVictory?.();
      },
      onWaveComplete: (wave) => {
        onWaveComplete?.(wave);
        playSoundEffect('powerup');
      },
      onEnemyDefeated: (enemy) => {
        playSoundEffect('explosion');
      },
      onItemCollected: (item) => {
        playSoundEffect('coin');
      },
      onDamage: (amount) => {
        playSoundEffect('hurt');
      },
      onHeal: (amount) => {
        playSoundEffect('powerup');
      },
    });

    if (templateId) {
      engine.setTemplateId(templateId);
    }

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, [canvasRef, templateId]);

  useEffect(() => {
    if (engineRef.current && toolState) {
      engineRef.current.loadFromToolState(toolState);
    }
  }, [toolState]);

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
    engineRef.current?.restart();
    setIsRunning(true);
  }, []);

  const saveGame = useCallback((name: string) => {
    if (!engineRef.current) return null;
    const state = engineRef.current.getState();
    return saveGameState(name, {
      score: state.score,
      wave: state.wave,
      health: state.health,
      maxHealth: state.maxHealth,
      variables: state.variables,
      weather: state.weather,
      scene: state.scene,
      enemies: state.enemies.map(e => ({
        id: e.id,
        x: e.x,
        y: e.y,
        emoji: e.emoji,
        hp: e.hp,
        behavior: e.behavior,
      })),
      items: state.items.map(i => ({
        id: i.id,
        x: i.x,
        y: i.y,
        emoji: i.emoji,
      })),
      tiles: state.tiles.map(t => ({
        x: t.x,
        y: t.y,
        type: t.type,
        emoji: t.emoji,
        solid: t.solid,
      })),
      camera: state.camera ? {
        x: state.camera.x,
        y: state.camera.y,
        followPlayer: state.camera.followPlayer,
        worldWidth: state.camera.worldWidth,
        worldHeight: state.camera.worldHeight,
      } : undefined,
    });
  }, []);

  const loadGame = useCallback((saveId: string) => {
    if (!engineRef.current) return false;
    const snapshot = loadGameState(saveId);
    if (!snapshot) return false;
    engineRef.current.loadState({
      score: snapshot.score,
      health: snapshot.health,
      variables: snapshot.variables,
      wave: snapshot.wave,
    });
    return true;
  }, []);

  return {
    gameState,
    isRunning,
    start,
    stop,
    pause,
    resume,
    restart,
    saveGame,
    loadGame,
  };
};
