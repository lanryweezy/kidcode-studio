import { CommandType, CommandBlock } from '../types';

export interface ValidationError {
  blockId: string;
  type: 'missing_command' | 'missing_param' | 'broken_win_condition' | 'unknown_command'
    | 'missing_win_lose' | 'missing_sound' | 'missing_score_tracking'
    | 'incomplete_structure' | 'no_difficulty_progression';
  message: string;
  severity?: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  templateId: string;
  templateName: string;
}

export interface QualityCheckResult {
  templateId: string;
  templateName: string;
  passed: boolean;
  checks: {
    hasWinLose: boolean;
    hasSoundEffects: boolean;
    hasScoreTracking: boolean;
    isComplete: boolean;
    hasDifficultyProgression: boolean;
  };
  warnings: ValidationError[];
}

export interface QualityReport {
  totalTemplates: number;
  passedChecks: Record<string, { passed: number; failed: number }>;
  templatesWithIssues: Array<{
    id: string;
    name: string;
    failedChecks: string[];
  }>;
}

const REQUIRED_PARAMS: Partial<Record<CommandType, string[]>> = {
  [CommandType.IF]: ['condition'],
  [CommandType.SET_VAR]: ['varName'],
  [CommandType.CHANGE_VAR]: ['varName'],
  [CommandType.REPEAT]: ['value'],
  [CommandType.MOVE_X]: ['value'],
  [CommandType.MOVE_Y]: ['value'],
  [CommandType.PLAY_SOUND]: ['text'],
  [CommandType.SAY]: ['text'],
  [CommandType.SET_EMOJI]: ['text'],
  [CommandType.SET_SCENE]: ['text'],
  [CommandType.SET_WEATHER]: ['text'],
  [CommandType.SHOOT_BALL]: ['text', 'value'],
  [CommandType.KICK_BALL]: ['text', 'value'],
  [CommandType.DRIBBLE]: ['value'],
  [CommandType.SPAWN_BALL]: ['text'],
  [CommandType.SPAWN_TEAMMATE]: ['text'],
  [CommandType.SPAWN_OPPONENT]: ['text'],
  [CommandType.SET_FORMATION]: ['text'],
  [CommandType.SWING_WEAPON]: ['text', 'value'],
  [CommandType.COMBO_ATTACK]: ['value'],
  [CommandType.DODGE_ROLL]: ['value'],
  [CommandType.SCREEN_SHAKE]: ['value'],
  [CommandType.FADE_IN]: ['value'],
  [CommandType.WAIT]: ['value'],
  [CommandType.TRIGGER_CUTSCENE]: ['text'],
  [CommandType.PASS_BALL]: ['text'],
  [CommandType.SET_TIMER]: ['value'],
  [CommandType.SPAWN_ENEMY]: ['text'],
  [CommandType.SPAWN_ITEM]: ['text'],
};

export function validateTemplate(template: {
  id: string;
  name: string;
  commands: CommandBlock[];
}): ValidationResult {
  const errors: ValidationError[] = [];

  for (const block of template.commands) {
    const cmdType = block.type as string;

    if (!Object.values(CommandType).includes(cmdType as CommandType)) {
      errors.push({
        blockId: block.id,
        type: 'unknown_command',
        message: `Unknown command type: ${cmdType}`,
      });
    }

    const required = REQUIRED_PARAMS[block.type as CommandType];
    if (required) {
      const params = block.params as Record<string, unknown>;
      for (const param of required) {
        if (params[param] === undefined || params[param] === null || params[param] === '') {
          errors.push({
            blockId: block.id,
            type: 'missing_param',
            message: `Command ${block.type} is missing required param: ${param}`,
          });
        }
      }
    }

    if (block.type === CommandType.IF && block.params.condition === 'EQUALS') {
      const params = block.params as Record<string, unknown>;
      if (!params.varName || params.varName === '') {
        errors.push({
          blockId: block.id,
          type: 'broken_win_condition',
          message: 'IF EQUALS condition has no varName — game will never match this condition',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    templateId: template.id,
    templateName: template.name,
  };
}

export function validateAllTemplates(templates: Array<{
  id: string;
  name: string;
  commands: CommandBlock[];
}>): ValidationResult[] {
  return templates.map(t => {
    const basicResult = validateTemplate(t);
    const qualityResult = qualityCheckTemplate(t);
    return {
      ...basicResult,
      errors: [...basicResult.errors, ...qualityResult.warnings],
      valid: basicResult.valid && qualityResult.warnings.filter(w => w.severity === 'error').length === 0,
    };
  });
}

export function qualityCheckTemplate(template: {
  id: string;
  name: string;
  commands: CommandBlock[];
}): QualityCheckResult {
  const warnings: ValidationError[] = [];
  const cmdTypes = template.commands.map(b => b.type);
  const hasEnemySpawn = cmdTypes.some(t =>
    t === CommandType.SPAWN_ENEMY || t === CommandType.SPAWN_BOSS ||
    t === CommandType.SPAWN_WAVE_ENEMIES || t === CommandType.NPC_TALK
  );

  const hasWinLose = cmdTypes.some(t =>
    t === CommandType.WIN_GAME || t === CommandType.GAME_OVER
  );
  if (!hasWinLose) {
    warnings.push({
      blockId: '',
      type: 'missing_win_lose',
      message: 'Template has no WIN_GAME or GAME_OVER command',
      severity: 'warning',
    });
  }

  const hasSoundEffects = cmdTypes.some(t =>
    t === CommandType.PLAY_SOUND || t === CommandType.PLAY_MUSIC ||
    t === CommandType.PLAY_TONE || t === CommandType.PLAY_AMBIENT ||
    t === CommandType.SET_BACKGROUND_MUSIC
  );
  if (!hasSoundEffects) {
    warnings.push({
      blockId: '',
      type: 'missing_sound',
      message: 'Template has no sound effect commands',
      severity: 'warning',
    });
  }

  const hasScoreTracking = cmdTypes.some(t =>
    t === CommandType.CHANGE_SCORE || t === CommandType.SET_SCORE ||
    t === CommandType.CHANGE_VAR || t === CommandType.SET_VAR
  );
  if (!hasScoreTracking) {
    warnings.push({
      blockId: '',
      type: 'missing_score_tracking',
      message: 'Template has no score tracking commands',
      severity: 'warning',
    });
  }

  const hasLoop = cmdTypes.some(t =>
    t === CommandType.FOREVER || t === CommandType.REPEAT
  );
  const totalCommands = template.commands.length;
  const hasIntro = cmdTypes.some(t =>
    t === CommandType.TRIGGER_CUTSCENE || t === CommandType.SAY ||
    t === CommandType.FADE_IN || t === CommandType.CREATE_DIALOGUE
  );
  const isComplete = hasLoop && totalCommands >= 5 && hasIntro;
  if (!isComplete) {
    const missing: string[] = [];
    if (!hasLoop) missing.push('FOREVER/REPEAT loop');
    if (totalCommands < 5) missing.push('at least 5 commands');
    if (!hasIntro) missing.push('intro sequence');
    warnings.push({
      blockId: '',
      type: 'incomplete_structure',
      message: `Incomplete structure: missing ${missing.join(', ')}`,
      severity: 'warning',
    });
  }

  let hasDifficultyProgression = true;
  if (hasEnemySpawn) {
    const hasDifficultyChange = cmdTypes.some(t =>
      t === CommandType.SET_DIFFICULTY || t === CommandType.NEXT_WAVE ||
      t === CommandType.SPAWN_WAVE_ENEMIES || t === CommandType.BOSS_PHASE ||
      t === CommandType.TRIGGER_BOSS_PHASE || t === CommandType.LEVEL_UP
    );
    hasDifficultyProgression = hasDifficultyChange;
    if (!hasDifficultyChange) {
      warnings.push({
        blockId: '',
        type: 'no_difficulty_progression',
        message: 'Template spawns enemies but has no difficulty progression',
        severity: 'warning',
      });
    }
  }

  return {
    templateId: template.id,
    templateName: template.name,
    passed: warnings.length === 0,
    checks: {
      hasWinLose,
      hasSoundEffects,
      hasScoreTracking,
      isComplete,
      hasDifficultyProgression,
    },
    warnings,
  };
}

export function generateQualityReport(templates: Array<{
  id: string;
  name: string;
  commands: CommandBlock[];
}>): QualityReport {
  const results = templates.map(qualityCheckTemplate);
  const checkNames = ['hasWinLose', 'hasSoundEffects', 'hasScoreTracking', 'isComplete', 'hasDifficultyProgression'];
  const passedChecks: Record<string, { passed: number; failed: number }> = {};
  for (const name of checkNames) {
    passedChecks[name] = { passed: 0, failed: 0 };
  }
  const templatesWithIssues: QualityReport['templatesWithIssues'] = [];

  for (const result of results) {
    const failedChecks: string[] = [];
    for (const name of checkNames) {
      const key = name as keyof typeof result.checks;
      if (result.checks[key]) {
        passedChecks[name].passed++;
      } else {
        passedChecks[name].failed++;
        failedChecks.push(name);
      }
    }
    if (failedChecks.length > 0) {
      templatesWithIssues.push({
        id: result.templateId,
        name: result.templateName,
        failedChecks,
      });
    }
  }

  return {
    totalTemplates: templates.length,
    passedChecks,
    templatesWithIssues,
  };
}
