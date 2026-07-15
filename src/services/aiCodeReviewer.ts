import { CommandBlock, CommandType } from '../types';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface ReviewIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  blockId: string;
  blockType: CommandType;
  category: 'bug' | 'logic' | 'performance' | 'style';
  fixSuggestion: string;
  fixCommands?: Omit<CommandBlock, 'id'>[];
}

export interface ReviewResult {
  issues: ReviewIssue[];
  score: number;
  summary: string;
}

const BLOCK_COMMAND_TYPES: Set<string> = new Set([
  CommandType.REPEAT,
  CommandType.END_REPEAT,
  CommandType.FOREVER,
  CommandType.END_FOREVER,
  CommandType.IF,
  CommandType.ELSE,
  CommandType.END_IF,
]);

const CONTROL_FLOW_OPENERS: Set<string> = new Set([
  CommandType.REPEAT,
  CommandType.FOREVER,
  CommandType.IF,
  CommandType.WHEN_I_RECEIVE,
  CommandType.ON_COLLIDE,
  CommandType.ON_CLICK,
]);

const CONTROL_FLOW_CLOSERS: Set<string> = new Set([
  CommandType.END_REPEAT,
  CommandType.END_FOREVER,
  CommandType.END_IF,
  CommandType.END_EVENT,
]);

const MOVEMENT_COMMANDS: Set<string> = new Set([
  CommandType.MOVE_X,
  CommandType.MOVE_Y,
  CommandType.GO_TO_XY,
  CommandType.GLIDE_TO_XY,
  CommandType.JUMP,
  CommandType.DASH,
  CommandType.WALL_JUMP,
  CommandType.DOUBLE_JUMP,
]);

const GAME_ACTION_COMMANDS: Set<string> = new Set([
  CommandType.SHOOT,
  CommandType.SPAWN_ENEMY,
  CommandType.SPAWN_ITEM,
  CommandType.SPAWN_PARTICLES,
  CommandType.CHANGE_SCORE,
  CommandType.WIN_GAME,
  CommandType.GAME_OVER,
  CommandType.SET_HEALTH,
  CommandType.CHANGE_HEALTH,
]);

function generateId(): string {
  return `issue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function checkInfiniteLoops(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === CommandType.FOREVER) {
      let hasBreak = false;
      for (let j = i + 1; j < blocks.length; j++) {
        if (blocks[j].type === CommandType.END_FOREVER) break;
        if (blocks[j].type === CommandType.BREAK) {
          hasBreak = true;
          break;
        }
      }
      if (!hasBreak) {
        const innerCommands = blocks.slice(i + 1).filter(
          b => b.type !== CommandType.END_FOREVER && b.type !== CommandType.BREAK
        );
        if (innerCommands.length === 0) {
          issues.push({
            id: generateId(),
            severity: 'warning',
            title: 'Empty forever loop',
            description: 'This forever loop has no commands inside it and will run forever doing nothing.',
            blockId: block.id,
            blockType: block.type,
            category: 'bug',
            fixSuggestion: 'Add commands inside the loop or remove it.',
          });
        } else {
          const hasMovement = innerCommands.some(b => MOVEMENT_COMMANDS.has(b.type));
          const hasAction = innerCommands.some(b => GAME_ACTION_COMMANDS.has(b.type));
          if (!hasMovement && !hasAction) {
            issues.push({
              id: generateId(),
              severity: 'warning',
              title: 'Forever loop without clear purpose',
              description: 'This forever loop runs but has no movement or game actions. It might not do what you expect.',
              blockId: block.id,
              blockType: block.type,
              category: 'logic',
              fixSuggestion: 'Add movement or game actions inside the loop, or use a REPEAT block instead.',
            });
          }
        }
      }
    }
  }
  return issues;
}

function checkMissingWinLose(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  const hasWin = blocks.some(b => b.type === CommandType.WIN_GAME);
  const hasGameOver = blocks.some(b => b.type === CommandType.GAME_OVER);
  const hasEnemies = blocks.some(b => b.type === CommandType.SPAWN_ENEMY);
  const hasScore = blocks.some(
    b => b.type === CommandType.CHANGE_SCORE || b.type === CommandType.SET_SCORE
  );
  const hasHealth = blocks.some(
    b => b.type === CommandType.SET_HEALTH || b.type === CommandType.CHANGE_HEALTH
  );

  if (blocks.length > 0) {
    if (!hasWin && !hasGameOver) {
      if (hasEnemies || hasScore || hasHealth) {
        issues.push({
          id: generateId(),
          severity: 'warning',
          title: 'No win or lose condition',
          description: 'Your game has enemies, score, or health but no way to win or lose!',
          blockId: blocks[0].id,
          blockType: blocks[0].type,
          category: 'logic',
          fixSuggestion: 'Add a WIN_GAME block when the player reaches a goal, and a GAME_OVER block when health reaches 0.',
        });
      }
    } else if (!hasWin && hasGameOver) {
      issues.push({
        id: generateId(),
        severity: 'info',
        title: 'No win condition',
        description: 'Your game can end but there is no way to win. Add a WIN_GAME block!',
        blockId: blocks[0].id,
        blockType: blocks[0].type,
        category: 'logic',
        fixSuggestion: 'Add a WIN_GAME block when the player completes the objective.',
      });
    } else if (hasWin && !hasGameOver) {
      issues.push({
        id: generateId(),
        severity: 'info',
        title: 'No lose condition',
        description: 'Your game can be won but there is no way to lose. Players might find it too easy!',
        blockId: blocks[0].id,
        blockType: blocks[0].type,
        category: 'logic',
        fixSuggestion: 'Add a GAME_OVER block when health reaches 0 or time runs out.',
      });
    }
  }

  return issues;
}

function checkUnreachableCode(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  let reachedEnd = false;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === CommandType.WIN_GAME || block.type === CommandType.GAME_OVER) {
      reachedEnd = true;
      continue;
    }

    if (reachedEnd && !BLOCK_COMMAND_TYPES.has(block.type)) {
      issues.push({
        id: generateId(),
        severity: 'warning',
        title: 'Unreachable code',
        description: `This block comes after a WIN_GAME or GAME_OVER and will never run.`,
        blockId: block.id,
        blockType: block.type,
        category: 'logic',
        fixSuggestion: 'Move this block before the WIN_GAME or GAME_OVER block.',
      });
    }
  }

  return issues;
}

function checkUnusedVariables(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const definedVars = new Map<string, CommandBlock>();
  const usedVars = new Set<string>();

  for (const block of blocks) {
    if (block.type === CommandType.SET_VAR && block.params.varName) {
      definedVars.set(block.params.varName, block);
    }
    if (
      block.type === CommandType.CHANGE_VAR ||
      block.type === CommandType.CALC_ADD ||
      block.type === CommandType.CALC_SUB ||
      block.type === CommandType.CALC_MUL ||
      block.type === CommandType.CALC_DIV
    ) {
      if (block.params.varName) usedVars.add(block.params.varName);
    }
    if (block.params.condition) {
      const varMatches = block.params.condition.match(/[a-zA-Z_]\w*/g);
      if (varMatches) varMatches.forEach(v => usedVars.add(v));
    }
  }

  for (const [varName, block] of definedVars) {
    if (varName === 'score' || varName === 'health') continue;
    if (!usedVars.has(varName)) {
      issues.push({
        id: generateId(),
        severity: 'info',
        title: `Unused variable "${varName}"`,
        description: `You set "${varName}" but never use it anywhere.`,
        blockId: block.id,
        blockType: block.type,
        category: 'style',
        fixSuggestion: `Use "${varName}" in a condition, display it on screen, or remove the SET_VAR block.`,
      });
    }
  }

  return issues;
}

function checkPerformanceIssues(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  let foreverDepth = 0;
  let maxForeverDepth = 0;

  for (const block of blocks) {
    if (block.type === CommandType.FOREVER) {
      foreverDepth++;
      maxForeverDepth = Math.max(maxForeverDepth, foreverDepth);
    }
    if (block.type === CommandType.END_FOREVER) {
      foreverDepth--;
    }
  }

  if (maxForeverDepth > 1) {
    issues.push({
      id: generateId(),
      severity: 'error',
      title: 'Nested forever loops',
      description: 'Forever loops inside other forever loops will run extremely slowly!',
      blockId: blocks.find(b => b.type === CommandType.FOREVER)?.id || blocks[0].id,
      blockType: CommandType.FOREVER,
      category: 'performance',
      fixSuggestion: 'Use a single loop with a REPEAT block inside if you need to repeat something multiple times.',
    });
  }

  let spawnEnemyCount = 0;
  for (const block of blocks) {
    if (block.type === CommandType.SPAWN_ENEMY) spawnEnemyCount++;
  }
  if (spawnEnemyCount > 20) {
    issues.push({
      id: generateId(),
      severity: 'warning',
      title: 'Too many enemy spawns',
      description: `You spawn ${spawnEnemyCount} enemies. This might slow down the game!`,
      blockId: blocks.find(b => b.type === CommandType.SPAWN_ENEMY)?.id || blocks[0].id,
      blockType: CommandType.SPAWN_ENEMY,
      category: 'performance',
      fixSuggestion: 'Use fewer enemies or spawn them in waves instead of all at once.',
    });
  }

  return issues;
}

function checkBlockStructure(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const stack: CommandBlock[] = [];

  for (const block of blocks) {
    if (CONTROL_FLOW_OPENERS.has(block.type)) {
      stack.push(block);
    }
    if (CONTROL_FLOW_CLOSERS.has(block.type)) {
      if (stack.length === 0) {
        issues.push({
          id: generateId(),
          severity: 'error',
          title: 'Missing opening block',
          description: `This ${block.type} block doesn't have a matching opening block.`,
          blockId: block.id,
          blockType: block.type,
          category: 'bug',
          fixSuggestion: `Add a matching opening block before this one.`,
        });
      } else {
        stack.pop();
      }
    }
  }

  for (const unclosed of stack) {
    issues.push({
      id: generateId(),
      severity: 'error',
      title: 'Missing closing block',
      description: `This ${unclosed.type} block is never closed.`,
      blockId: unclosed.id,
      blockType: unclosed.type,
      category: 'bug',
      fixSuggestion: `Add a matching closing block after this block.`,
    });
  }

  return issues;
}

function checkDuplicateSetup(blocks: CommandBlock[]): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const seenSetup = new Map<string, CommandBlock>();

  for (const block of blocks) {
    if (
      block.type === CommandType.SET_SCENE ||
      block.type === CommandType.SET_GRAVITY ||
      block.type === CommandType.SET_WEATHER
    ) {
      if (seenSetup.has(block.type)) {
        issues.push({
          id: generateId(),
          severity: 'info',
          title: `Duplicate ${block.type} block`,
          description: `You set the ${block.type} twice. Only the last one will be used.`,
          blockId: block.id,
          blockType: block.type,
          category: 'style',
          fixSuggestion: 'Remove the duplicate block.',
        });
      }
      seenSetup.set(block.type, block);
    }
  }

  return issues;
}

function computeScore(issues: ReviewIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'error') score -= 15;
    else if (issue.severity === 'warning') score -= 8;
    else score -= 3;
  }
  return Math.max(0, Math.min(100, score));
}

function generateSummary(issues: ReviewIssue[], score: number): string {
  if (issues.length === 0) {
    return "Your code looks great! No issues found. You're a coding star!";
  }

  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos = issues.filter(i => i.severity === 'info').length;

  let summary = `Found ${issues.length} issue${issues.length > 1 ? 's' : ''}: `;
  const parts: string[] = [];
  if (errors > 0) parts.push(`${errors} error${errors > 1 ? 's' : ''}`);
  if (warnings > 0) parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`);
  if (infos > 0) parts.push(`${infos} suggestion${infos > 1 ? 's' : ''}`);
  summary += parts.join(', ') + '. ';

  if (score >= 80) summary += 'Almost there — just a few tweaks needed!';
  else if (score >= 50) summary += 'Getting close! Fix the errors first.';
  else summary += 'Keep going! Let\'s fix the big issues first.';

  return summary;
}

export function analyzeCode(blocks: CommandBlock[]): ReviewResult {
  const allIssues: ReviewIssue[] = [
    ...checkBlockStructure(blocks),
    ...checkInfiniteLoops(blocks),
    ...checkMissingWinLose(blocks),
    ...checkUnreachableCode(blocks),
    ...checkUnusedVariables(blocks),
    ...checkPerformanceIssues(blocks),
    ...checkDuplicateSetup(blocks),
  ];

  const score = computeScore(allIssues);
  const summary = generateSummary(allIssues, score);

  return { issues: allIssues, score, summary };
}

export async function analyzeCodeWithAI(
  blocks: CommandBlock[],
  mode: string
): Promise<ReviewResult> {
  const localResult = analyzeCode(blocks);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reviewCode',
        payload: {
          commands: blocks,
          mode,
          localIssues: localResult.issues.map(i => ({
            title: i.title,
            severity: i.severity,
            category: i.category,
          })),
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.issues && Array.isArray(data.issues)) {
        for (const aiIssue of data.issues) {
          if (aiIssue.title && aiIssue.description) {
            localResult.issues.push({
              id: generateId(),
              severity: aiIssue.severity || 'info',
              title: aiIssue.title,
              description: aiIssue.description,
              blockId: aiIssue.blockId || blocks[0]?.id || '',
              blockType: (aiIssue.blockType as CommandType) || CommandType.COMMENT,
              category: aiIssue.category || 'logic',
              fixSuggestion: aiIssue.fixSuggestion || 'Review this section.',
            });
          }
        }
        localResult.score = computeScore(localResult.issues);
        localResult.summary = generateSummary(localResult.issues, localResult.score);
      }
    }
  } catch {
    // Fall back to local-only results
  }

  return localResult;
}

export function applyFix(
  blocks: CommandBlock[],
  issue: ReviewIssue
): CommandBlock[] {
  const index = blocks.findIndex(b => b.id === issue.blockId);
  if (index === -1) return blocks;

  if (issue.fixCommands && issue.fixCommands.length > 0) {
    const newBlocks = [...blocks];
    const fixBlocks = issue.fixCommands.map((cmd, i) => ({
      ...cmd,
      id: `fix_${Date.now()}_${i}`,
    })) as CommandBlock[];
    newBlocks.splice(index, 1, ...fixBlocks);
    return newBlocks;
  }

  if (issue.category === 'style' && issue.title.startsWith('Duplicate')) {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    return newBlocks;
  }

  return blocks;
}
