import { CommandBlock, CommandType } from '../types';

export interface TestConfig {
  blocks: CommandBlock[];
  template?: string;
  maxSteps?: number;
  seed?: number;
}

export type GameAction =
  | 'move_right'
  | 'move_left'
  | 'jump'
  | 'shoot'
  | 'collect'
  | 'wait'
  | 'idle';

export interface TestEvent {
  step: number;
  action: GameAction;
  state: SimulatedState;
  result: string;
}

export interface SimulatedState {
  playerX: number;
  playerY: number;
  score: number;
  health: number;
  alive: boolean;
  won: boolean;
  itemsCollected: number;
  enemiesDefeated: number;
  projectilesFired: number;
  stepsTaken: number;
  variables: Record<string, number>;
  positions: string[];
}

export interface TestBug {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  reproductionSteps: string[];
  category: 'crash' | 'stuck' | 'broken_mechanic' | 'edge_case' | 'logic';
}

export interface TestImprovement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TestReport {
  passed: boolean;
  totalSteps: number;
  events: TestEvent[];
  bugs: TestBug[];
  improvements: TestImprovement[];
  summary: {
    score: number;
    health: number;
    itemsCollected: number;
    enemiesDefeated: number;
    projectilesFired: number;
    reachableEnd: boolean;
    stuckDetected: boolean;
    infiniteLoopSuspected: boolean;
  };
}

function createInitialState(): SimulatedState {
  return {
    playerX: 200,
    playerY: 300,
    score: 0,
    health: 100,
    alive: true,
    won: false,
    itemsCollected: 0,
    enemiesDefeated: 0,
    projectilesFired: 0,
    stepsTaken: 0,
    variables: {},
    positions: [],
  };
}

function stateKey(state: SimulatedState): string {
  return `${Math.round(state.playerX)},${Math.round(state.playerY)},${state.score}`;
}

function hasBlockType(blocks: CommandBlock[], type: CommandType): boolean {
  return blocks.some(b => b.type === type);
}

function countBlockType(blocks: CommandBlock[], type: CommandType): number {
  return blocks.filter(b => b.type === type).length;
}

function detectStuck(state: SimulatedState): boolean {
  const positions = state.positions;
  if (positions.length < 10) return false;
  const last10 = positions.slice(-10);
  return last10.every(p => p === last10[0]);
}

function detectInfiniteLoop(blocks: CommandBlock[]): boolean {
  let foreverCount = 0;
  let hasBreak = false;
  for (const block of blocks) {
    if (block.type === CommandType.FOREVER) foreverCount++;
    if (block.type === CommandType.BREAK) hasBreak = true;
  }
  return foreverCount > 0 && !hasBreak;
}

function generateRandomActions(maxSteps: number, seed?: number): GameAction[] {
  const rng = seed !== undefined
    ? (() => { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })()
    : () => Math.random();

  const actions: GameAction[] = [];
  const pool: GameAction[] = ['move_right', 'move_left', 'jump', 'shoot', 'collect', 'wait'];

  for (let i = 0; i < maxSteps; i++) {
    actions.push(pool[Math.floor(rng() * pool.length)]);
  }
  return actions;
}

function simulateAction(
  state: SimulatedState,
  action: GameAction,
  blocks: CommandBlock[]
): { newState: SimulatedState; result: string } {
  const s = { ...state, variables: { ...state.variables }, positions: [...state.positions] };

  s.stepsTaken++;

  switch (action) {
    case 'move_right':
      s.playerX += 20;
      if (hasBlockType(blocks, CommandType.BOUNCE_ON_EDGE) && s.playerX > 400) {
        s.playerX = 400;
      }
      break;
    case 'move_left':
      s.playerX -= 20;
      if (hasBlockType(blocks, CommandType.BOUNCE_ON_EDGE) && s.playerX < 0) {
        s.playerX = 0;
      }
      break;
    case 'jump':
      if (hasBlockType(blocks, CommandType.JUMP) || hasBlockType(blocks, CommandType.SET_GRAVITY)) {
        s.playerY -= 40;
        s.playerY = Math.max(0, s.playerY);
      }
      break;
    case 'shoot':
      if (hasBlockType(blocks, CommandType.SHOOT)) {
        s.projectilesFired++;
        const enemyCount = countBlockType(blocks, CommandType.SPAWN_ENEMY);
        if (enemyCount > 0 && s.enemiesDefeated < enemyCount) {
          s.enemiesDefeated++;
          s.score += 10;
        }
      }
      break;
    case 'collect':
      if (hasBlockType(blocks, CommandType.SPAWN_ITEM)) {
        s.itemsCollected++;
        s.score += 10;
        const coinBlock = blocks.find(b => b.type === CommandType.CHANGE_SCORE);
        if (coinBlock?.params.value) {
          s.score += coinBlock.params.value;
        }
      }
      break;
    case 'wait':
      break;
  }

  const posKey = stateKey(s);
  s.positions.push(posKey);

  const hasWin = hasBlockType(blocks, CommandType.WIN_GAME);
  const scoreTarget = blocks.find(b => b.type === CommandType.SET_SCORE)?.params.value || 100;

  if (hasWin && s.score >= scoreTarget) {
    s.won = true;
    return { newState: s, result: 'Won the game!' };
  }

  if (s.health <= 0) {
    s.alive = false;
    return { newState: s, result: 'Player died' };
  }

  return { newState: s, result: `Moved ${action}` };
}

export function simulateGame(config: TestConfig): TestReport {
  const { blocks, maxSteps = 100, seed } = config;
  const state = createInitialState();
  const events: TestEvent[] = [];
  const actions = generateRandomActions(maxSteps, seed);
  let stuckDetected = false;

  let currentState = state;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const { newState, result } = simulateAction(currentState, action, blocks);
    currentState = newState;

    events.push({ step: i, action, state: { ...currentState }, result });

    if (!currentState.alive || currentState.won) break;

    if (detectStuck(currentState)) {
      stuckDetected = true;
      break;
    }
  }

  const bugs: TestBug[] = [];
  const improvements: TestImprovement[] = [];

  if (stuckDetected) {
    bugs.push({
      id: `bug_stuck_${Date.now()}`,
      severity: 'major',
      title: 'Player gets stuck',
      description: 'The player stopped moving and couldn\'t escape. The game might have a wall or missing movement code.',
      reproductionSteps: [
        'Start the game',
        'Play normally for a while',
        'Observe the player stop moving',
      ],
      category: 'stuck',
    });
  }

  if (!hasBlockType(blocks, CommandType.WIN_GAME) && !hasBlockType(blocks, CommandType.GAME_OVER)) {
    if (blocks.length > 0) {
      bugs.push({
        id: `bug_no_end_${Date.now()}`,
        severity: 'critical',
        title: 'No win or lose condition',
        description: 'The game has no way to end! Players will play forever.',
        reproductionSteps: ['Start the game', 'Play indefinitely'],
        category: 'broken_mechanic',
      });
    }
  }

  if (detectInfiniteLoop(blocks)) {
    bugs.push({
      id: `bug_infinite_${Date.now()}`,
      severity: 'major',
      title: 'Possible infinite loop',
      description: 'A forever loop with no break was found. The game might hang.',
      reproductionSteps: ['Start the game', 'Wait for the loop to execute'],
      category: 'stuck',
    });
  }

  const enemyCount = countBlockType(blocks, CommandType.SPAWN_ENEMY);
  const itemSpawns = countBlockType(blocks, CommandType.SPAWN_ITEM);
  if (enemyCount > 15) {
    bugs.push({
      id: `bug_many_enemies_${Date.now()}`,
      severity: 'minor',
      title: 'Too many enemies',
      description: `Spawning ${enemyCount} enemies may cause lag.`,
      reproductionSteps: ['Start the game', 'Observe performance'],
      category: 'edge_case',
    });
  }

  if (enemyCount > 0 && !hasBlockType(blocks, CommandType.SHOOT) && !hasBlockType(blocks, CommandType.CHANGE_HEALTH)) {
    improvements.push({
      title: 'Add a way to fight enemies',
      description: 'You have enemies but no way to defeat them. Add SHOOT or attack blocks.',
      priority: 'high',
    });
  }

  if (itemSpawns > 0 && !currentState.variables['score']) {
    improvements.push({
      title: 'Track collected items',
      description: 'You spawn items but don\'t track score when they\'re collected.',
      priority: 'medium',
    });
  }

  if (hasBlockType(blocks, CommandType.SET_GRAVITY) && !hasBlockType(blocks, CommandType.ADD_PLATFORM)) {
    improvements.push({
      title: 'Add platforms for jumping',
      description: 'Gravity is on but there are no platforms. The player might fall forever!',
      priority: 'high',
    });
  }

  if (currentState.score === 0 && hasBlockType(blocks, CommandType.CHANGE_SCORE)) {
    improvements.push({
      title: 'Score never changes',
      description: 'The CHANGE_SCORE block exists but the score stayed at 0 during testing.',
      priority: 'medium',
    });
  }

  const hasWinCondition = hasBlockType(blocks, CommandType.WIN_GAME);
  const passed = !stuckDetected && (!hasWinCondition || currentState.won) && bugs.filter(b => b.severity === 'critical').length === 0;

  const summary = {
    score: currentState.score,
    health: currentState.health,
    itemsCollected: currentState.itemsCollected,
    enemiesDefeated: currentState.enemiesDefeated,
    projectilesFired: currentState.projectilesFired,
    reachableEnd: currentState.won,
    stuckDetected,
    infiniteLoopSuspected: detectInfiniteLoop(blocks),
  };

  return {
    passed,
    totalSteps: events.length,
    events,
    bugs,
    improvements,
    summary,
  };
}

export async function runAITest(config: TestConfig): Promise<TestReport> {
  const localReport = simulateGame(config);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'testGame',
        payload: {
          blocks: config.blocks,
          template: config.template,
          localReport: {
            passed: localReport.passed,
            bugs: localReport.bugs.map(b => b.title),
            summary: localReport.summary,
          },
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.improvements && Array.isArray(data.improvements)) {
        for (const imp of data.improvements) {
          if (imp.title && imp.description) {
            localReport.improvements.push({
              title: imp.title,
              description: imp.description,
              priority: imp.priority || 'medium',
            });
          }
        }
      }
    }
  } catch {
    // Fall back to local report
  }

  return localReport;
}
