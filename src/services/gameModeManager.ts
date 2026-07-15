import { GameEngine } from './gameEngine';
import { GameState, BlockCommand } from './engine/types';
import { CommandBlock, CommandType } from '../types';

export interface GameModeCallbacks {
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
  onVictory: () => void;
}

export class GameModeManager {
  private engine: GameEngine | null = null;
  private canvas: HTMLCanvasElement;
  private callbacks: GameModeCallbacks;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private variables: Record<string, number> = {};

  constructor(canvas: HTMLCanvasElement, callbacks: GameModeCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
  }

  private createEngine(): GameEngine {
    if (this.engine) {
      this.engine.destroy();
    }

    this.engine = new GameEngine(this.canvas, {
      onStateChange: (state) => {
        this.variables = { ...state.variables };
        this.callbacks.onStateChange(state);
      },
      onGameOver: () => {
        this.stopSync();
        this.callbacks.onGameOver();
      },
      onVictory: () => {
        this.stopSync();
        this.callbacks.onVictory();
      },
      onWaveComplete: () => {},
      onEnemyDefeated: () => {},
      onItemCollected: () => {},
      onDamage: () => {},
      onHeal: () => {},
    });

    return this.engine;
  }

  convertBlocks(blocks: CommandBlock[]): BlockCommand[] {
    return blocks
      .filter((b) => !this.isFlowBlock(b.type) && !this.isEventBlock(b.type))
      .map((b) => ({
        type: b.type,
        params: {
          value: b.params.value,
          text: b.params.text,
          varName: b.params.varName,
          condition: b.params.condition,
          duration: b.params.duration,
          speed: b.params.speed,
          x: b.params.x,
          y: b.params.y,
          width: b.params.width,
          height: b.params.height,
        },
      }));
  }

  private isFlowBlock(type: CommandType): boolean {
    return [
      CommandType.REPEAT,
      CommandType.END_REPEAT,
      CommandType.FOREVER,
      CommandType.END_FOREVER,
      CommandType.BREAK,
      CommandType.IF,
      CommandType.ELSE,
      CommandType.END_IF,
      CommandType.WAIT,
      CommandType.WAIT_FOR_PRESS,
      CommandType.COMMENT,
    ].includes(type);
  }

  private isEventBlock(type: CommandType): boolean {
    return [
      CommandType.ON_COLLIDE,
      CommandType.ON_CLICK,
      CommandType.WHEN_I_RECEIVE,
      CommandType.END_EVENT,
      CommandType.BROADCAST,
    ].includes(type);
  }

  start(blocks: CommandBlock[], toolState?: {
    tiles?: Array<{ x: number; y: number; type: string; emoji?: string }>;
    enemies?: Array<{ id?: string; x: number; y: number; emoji?: string; hp?: number; damage?: number; speed?: number; behavior?: string; initialX?: number; range?: number }>;
    items?: Array<{ id?: string; x: number; y: number; emoji?: string }>;
    weather?: string;
    health?: number;
    maxHp?: number;
    score?: number;
  }) {
    const engine = this.createEngine();

    if (toolState) {
      engine.loadFromToolState(toolState);
    }

    const blockCommands = this.convertBlocks(blocks);
    if (blockCommands.length > 0) {
      engine.processCommands(blockCommands);
    }

    engine.start();
    this.startSync();
  }

  stop() {
    if (this.engine) {
      this.engine.stop();
    }
    this.stopSync();
  }

  pause() {
    this.engine?.pause();
  }

  resume() {
    this.engine?.resume();
  }

  private startSync() {
    this.stopSync();
    this.syncInterval = setInterval(() => {
      if (this.engine) {
        const state = this.engine.getState();
        this.callbacks.onStateChange(state);
      }
    }, 50);
  }

  private stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getVariables(): Record<string, number> {
    return { ...this.variables };
  }

  getEngineState(): GameState | null {
    return this.engine?.getState() ?? null;
  }

  destroy() {
    this.stopSync();
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
  }
}
