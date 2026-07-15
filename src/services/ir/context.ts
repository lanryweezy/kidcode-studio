import { SpriteState } from '../../types';

export interface ExecutionContext {
  spriteState: SpriteState;
  playSound?: (type: string) => void;
  setNpcChat?: (chat: { name: string; message: string } | null) => void;
  wait?: (ms: number) => Promise<void>;
  stopExecution?: { current: boolean };
  setGameState?: (state: string) => void;
  particleSettings?: { type: string; color: string };
}
