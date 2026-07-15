import { useEffect, useRef } from 'react';
import { useGameAnnouncer } from '../components/ui/AriaLiveRegion';

interface GameState {
  health?: number;
  maxHealth?: number;
  score?: number;
  level?: number;
  coins?: number;
  lives?: number;
  gameOver?: boolean;
  victory?: boolean;
  wave?: number;
}

export function useGameAccessibility(gameState: GameState | null) {
  const { announceGameEvent, announceScore, announceHealth, announceLevel } = useGameAnnouncer();
  const prevGameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    if (!gameState) return;

    const prev = prevGameStateRef.current;

    // Announce health changes
    if (gameState.health !== undefined && gameState.maxHealth !== undefined) {
      if (!prev || prev.health !== gameState.health) {
        announceHealth(gameState.health, gameState.maxHealth);
      }
    }

    // Announce score changes (only significant changes)
    if (gameState.score !== undefined && prev?.score !== undefined) {
      const diff = gameState.score - prev.score;
      if (diff >= 50 || gameState.score === 0) {
        announceScore(gameState.score);
      }
    }

    // Announce level changes
    if (gameState.level !== undefined && prev?.level !== gameState.level) {
      announceLevel(gameState.level);
    }

    // Announce wave changes
    if (gameState.wave !== undefined && prev?.wave !== gameState.wave) {
      announceGameEvent(`Wave ${gameState.wave} started`, 'assertive');
    }

    // Announce game over
    if (gameState.gameOver && !prev?.gameOver) {
      announceGameEvent('Game Over', 'assertive');
    }

    // Announce victory
    if (gameState.victory && !prev?.victory) {
      announceGameEvent('Victory! Level Complete!', 'assertive');
    }

    prevGameStateRef.current = gameState;
  }, [gameState, announceGameEvent, announceScore, announceHealth, announceLevel]);
}
