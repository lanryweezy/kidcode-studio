import { CommandBlock, CommandType, AppMode } from '../types';

/**
 * Error Diagnosis Service
 * Analyzes code blocks and provides helpful error messages and suggestions
 */

export interface DiagnosisResult {
  hasError: boolean;
  errors: DiagnosisError[];
  suggestions: string[];
}

export interface DiagnosisError {
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  blockIndex?: number;
  fix?: () => CommandBlock[];
}

/**
 * Diagnose code for common errors
 */
export const diagnoseCode = (commands: CommandBlock[], mode: AppMode): DiagnosisResult => {
  const errors: DiagnosisError[] = [];
  const suggestions: string[] = [];

  // Check for empty code
  if (commands.length === 0) {
    errors.push({
      type: 'info',
      message: 'Your code is empty!',
      suggestion: 'Add blocks from the library to start building',
      blockIndex: 0
    });
    return { hasError: true, errors, suggestions };
  }

  // Check for missing start block (look for any event block)
  const hasStartBlock = commands.some(cmd => 
    cmd.type === CommandType.WHEN_I_RECEIVE ||
    cmd.type === CommandType.ON_CLICK ||
    cmd.type === CommandType.ON_COLLIDE
  );

  if (!hasStartBlock && mode === AppMode.GAME && commands.length > 0) {
    errors.push({
      type: 'warning',
      message: 'No event block found',
      suggestion: 'Add an event block like "When Clicked" or "On Collide" to start your program',
      blockIndex: 0
    });
  }

  // Check for unmatched control structures
  const controlStack: { type: CommandType; index: number }[] = [];
  
  commands.forEach((cmd, idx) => {
    // Push opening blocks
    if ([CommandType.REPEAT, CommandType.IF, CommandType.FOREVER].includes(cmd.type)) {
      controlStack.push({ type: cmd.type, index: idx });
    }
    
    // Check closing blocks
    if (cmd.type === CommandType.END_REPEAT) {
      const last = controlStack.pop();
      if (!last || last.type !== CommandType.REPEAT) {
        errors.push({
          type: 'error',
          message: 'END_REPEAT without matching REPEAT',
          suggestion: 'Add a REPEAT block before this or remove END_REPEAT',
          blockIndex: idx,
          fix: () => commands.filter((_, i) => i !== idx)
        });
      }
    }
    
    if (cmd.type === CommandType.ELSE) {
      const last = controlStack[controlStack.length - 1];
      if (!last || last.type !== CommandType.IF) {
        errors.push({
          type: 'error',
          message: 'ELSE without matching IF',
          suggestion: 'Add an IF block before this or remove ELSE',
          blockIndex: idx
        });
      }
    }
    
    if (cmd.type === CommandType.END_IF) {
      const last = controlStack.pop();
      if (!last || last.type !== CommandType.IF) {
        errors.push({
          type: 'error',
          message: 'END_IF without matching IF',
          suggestion: 'Add an IF block before this or remove END_IF',
          blockIndex: idx,
          fix: () => commands.filter((_, i) => i !== idx)
        });
      }
    }
  });

  // Check for unclosed blocks
  controlStack.forEach(item => {
    errors.push({
      type: 'error',
      message: `Unclosed ${getControlBlockName(item.type)} block`,
      suggestion: `Add the matching end block for ${getControlBlockName(item.type)}`,
      blockIndex: item.index
    });
  });

  // Mode-specific checks
  if (mode === AppMode.GAME) {
    // Check for movement without sprite
    const hasMovement = commands.some(cmd => 
      cmd.type === CommandType.MOVE_X || 
      cmd.type === CommandType.MOVE_Y ||
      cmd.type === CommandType.JUMP
    );
    
    if (hasMovement && !hasStartBlock) {
      suggestions.push('💡 Tip: Add "When Start Clicked" before movement blocks');
    }
  }

  if (mode === AppMode.APP) {
    // Check for UI without screen
    const hasUI = commands.some(cmd => 
      cmd.type === CommandType.ADD_BUTTON ||
      cmd.type === CommandType.ADD_INPUT
    );
    
    if (hasUI && commands.length < 2) {
      suggestions.push('💡 Tip: Create a screen first, then add UI elements');
    }
  }

  if (mode === AppMode.HARDWARE) {
    // Check for output without component
    const hasOutput = commands.some(cmd => 
      cmd.type === CommandType.LED_ON ||
      cmd.type === CommandType.LED_OFF
    );
    
    if (hasOutput) {
      suggestions.push('💡 Tip: Make sure you\'ve added the component in Circuit Designer');
    }
  }

  // Add positive feedback if no errors
  if (errors.length === 0 && commands.length > 0) {
    suggestions.push('✅ Code looks good! Click RUN to test it.');
  }

  return {
    hasError: errors.some(e => e.type === 'error'),
    errors,
    suggestions
  };
};

/**
 * Get human-readable name for control block type
 */
const getControlBlockName = (type: CommandType): string => {
  switch (type) {
    case CommandType.REPEAT: return 'REPEAT';
    case CommandType.IF: return 'IF';
    case CommandType.FOREVER: return 'FOREVER';
    default: return 'control';
  }
};

/**
 * Get quick fix for common errors
 */
export const getQuickFix = (error: DiagnosisError, commands: CommandBlock[]): CommandBlock[] | null => {
  if (error.fix) {
    return error.fix();
  }
  
  // Auto-fix suggestions
  if (error.message.includes('END_REPEAT without matching REPEAT')) {
    return commands.filter((_, i) => i !== error.blockIndex);
  }
  
  if (error.message.includes('END_IF without matching IF')) {
    return commands.filter((_, i) => i !== error.blockIndex);
  }
  
  return null;
};
