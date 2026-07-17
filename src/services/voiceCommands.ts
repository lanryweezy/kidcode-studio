import { CommandType, AppMode } from '../types';
import { useStore } from '../store/useStore';
import { playSoundEffect } from './soundService';

export interface VoiceCommandResult {
  recognized: boolean;
  command?: string;
  action?: string;
  error?: string;
}

export interface VoiceCommandsConfig {
  onResult?: (result: VoiceCommandResult) => void;
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const COMMAND_PATTERNS: Array<{
  patterns: RegExp[];
  action: string;
  blockType?: CommandType;
  params?: Record<string, unknown>;
}> = [
  {
    patterns: [/\b(add|create)\s+(a\s+)?(loop|repeat)\b/i, /\b(loop|repeat)\s+block\b/i],
    action: 'add_loop',
    blockType: CommandType.REPEAT,
    params: { value: 3 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?forever\b/i, /\bforever\s+loop\b/i],
    action: 'add_forever',
    blockType: CommandType.FOREVER
  },
  {
    patterns: [/\bmove\s+(right|forward|left|up|down)\b/i],
    action: 'add_move',
    blockType: CommandType.MOVE_X,
    params: { value: 50 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?(move\s+right|right\s+move)\s+block\b/i, /\bmove\s+right\s+block\b/i],
    action: 'add_move_right',
    blockType: CommandType.MOVE_X,
    params: { value: 50 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?(move\s+left|left\s+move)\s+block\b/i, /\bmove\s+left\s+block\b/i],
    action: 'add_move_left',
    blockType: CommandType.MOVE_X,
    params: { value: -50 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?(move\s+up|up\s+move)\s+block\b/i, /\bmove\s+up\s+block\b/i],
    action: 'add_move_up',
    blockType: CommandType.MOVE_Y,
    params: { value: 50 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?(move\s+down|down\s+move)\s+block\b/i, /\bmove\s+down\s+block\b/i],
    action: 'add_move_down',
    blockType: CommandType.MOVE_Y,
    params: { value: -50 }
  },
  {
    patterns: [/\b(jump|jumping)\s+block\b/i, /\b(add|create)\s+(a\s+)?jump\b/i],
    action: 'add_jump',
    blockType: CommandType.JUMP,
    params: { value: 10 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?wait\s+block\b/i, /\bwait\s+block\b/i, /\b(delay|pause)\b/i],
    action: 'add_wait',
    blockType: CommandType.WAIT,
    params: { value: 1 }
  },
  {
    patterns: [/\b(run|start|play|go)\s+(the\s+)?(game|code|program)\b/i, /\b(execute|start)\b/i],
    action: 'run_game'
  },
  {
    patterns: [/\b(stop|pause|halt)\s+(the\s+)?(game|code|program)\b/i],
    action: 'stop_game'
  },
  {
    patterns: [/\b(undo|go\s+back)\b/i],
    action: 'undo'
  },
  {
    patterns: [/\b(redo)\b/i],
    action: 'redo'
  },
  {
    patterns: [/\b(save|store)\s+(the\s+)?(game|project|code)\b/i],
    action: 'save_game'
  },
  {
    patterns: [/\b(clear|delete|remove)\s+(all\s+)?(blocks?|code)\b/i, /\b(clear|empty)\s+(the\s+)?code\b/i],
    action: 'clear_code'
  },
  {
    patterns: [/\b(switch\s+to\s+)?(game\s+)?mode\b/i, /\b(game\s+mode)\b/i],
    action: 'set_mode_game'
  },
  {
    patterns: [/\b(switch\s+to\s+)?app\s+mode\b/i, /\b(app\s+mode)\b/i],
    action: 'set_mode_app'
  },
  {
    patterns: [/\b(switch\s+to\s+)?hardware\s+mode\b/i, /\b(hardware\s+mode)\b/i],
    action: 'set_mode_hardware'
  },
  {
    patterns: [/\b(turn\s+right|right\s+turn)\s+block\b/i, /\b(add|create)\s+(a\s+)?turn\s+right\b/i],
    action: 'add_turn_right',
    blockType: CommandType.TURN_RIGHT,
    params: { value: 15 }
  },
  {
    patterns: [/\b(turn\s+left|left\s+turn)\s+block\b/i, /\b(add|create)\s+(a\s+)?turn\s+left\b/i],
    action: 'add_turn_left',
    blockType: CommandType.TURN_LEFT,
    params: { value: 15 }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?(if|conditional)\s+block\b/i, /\bif\s+block\b/i],
    action: 'add_if',
    blockType: CommandType.IF,
    params: { condition: 'true' }
  },
  {
    patterns: [/\b(add|create)\s+(a\s+)?(set|change)\s+(score|points)\b/i, /\badd\s+score\b/i],
    action: 'add_score',
    blockType: CommandType.CHANGE_SCORE,
    params: { value: 1 }
  },
  {
    patterns: [/\b(say|speak|talk)\s+(.+)/i],
    action: 'add_say',
    blockType: CommandType.SAY,
    params: { text: '' }
  },
  {
    patterns: [/\b(show|display)\s+(.+)/i],
    action: 'add_show',
    blockType: CommandType.SHOW,
    params: {}
  },
  {
    patterns: [/\b(hide|hide)\s+(.+)/i],
    action: 'add_hide',
    blockType: CommandType.HIDE,
    params: {}
  },
  {
    patterns: [/\b(rotate|spin)\s+block\b/i, /\b(add|create)\s+(a\s+)?rotate\b/i],
    action: 'add_rotate',
    blockType: CommandType.TURN_RIGHT,
    params: { value: 360 }
  }
];

let recognition: SpeechRecognitionInstance | null = null;
let isListening = false;
let config: VoiceCommandsConfig = {};

const SpeechRecognitionClass = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition || (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

const getRecognition = () => {
  if (!SpeechRecognitionClass) return null;
  if (!recognition) {
    recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  }
  return recognition;
};

export const isVoiceRecognitionSupported = (): boolean => {
  return !!SpeechRecognitionClass;
};

const matchCommand = (transcript: string): VoiceCommandResult => {
  const normalized = transcript.toLowerCase().trim();

  for (const entry of COMMAND_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(normalized)) {
        const blockParams = entry.params ? { ...entry.params } : {};

        if ((entry.action === 'add_say' || entry.action === 'add_show' || entry.action === 'add_hide') && entry.blockType) {
          const textMatch = transcript.match(/(?:say|speak|talk|show|display|hide)\s+(.+)/i);
          if (textMatch && textMatch[1]) {
            blockParams.text = textMatch[1].trim();
          }
        }

        return {
          recognized: true,
          command: transcript,
          action: entry.action,
        };
      }
    }
  }

  return { recognized: false, command: transcript };
};

const executeCommand = (result: VoiceCommandResult): void => {
  if (!result.recognized || !result.action) return;

  const store = useStore.getState();

  switch (result.action) {
    case 'run_game': {
      const event = new CustomEvent('voice-run-game');
      window.dispatchEvent(event);
      playSoundEffect('powerup');
      break;
    }
    case 'stop_game': {
      const event = new CustomEvent('voice-stop-game');
      window.dispatchEvent(event);
      break;
    }
    case 'undo': {
      store.undo();
      playSoundEffect('click');
      break;
    }
    case 'redo': {
      store.redo();
      playSoundEffect('click');
      break;
    }
    case 'clear_code': {
      store.pushHistory();
      store.setCommands([]);
      playSoundEffect('click');
      break;
    }
    case 'set_mode_game': {
      store.setMode(AppMode.GAME);
      playSoundEffect('powerup');
      break;
    }
    case 'set_mode_app': {
      store.setMode(AppMode.APP);
      playSoundEffect('powerup');
      break;
    }
    case 'set_mode_hardware': {
      store.setMode(AppMode.HARDWARE);
      playSoundEffect('powerup');
      break;
    }
    default: {
      const blockEntry = COMMAND_PATTERNS.find(e => e.action === result.action);
      if (blockEntry && blockEntry.blockType) {
        const event = new CustomEvent('voice-add-block', {
          detail: {
            type: blockEntry.blockType,
            params: blockEntry.params || {}
          }
        });
        window.dispatchEvent(event);
        playSoundEffect('click');
      }
      break;
    }
  }
};

export const startVoiceCommands = (voiceConfig: VoiceCommandsConfig = {}): boolean => {
  const rec = getRecognition();
  if (!rec) {
    voiceConfig.onError?.('Voice recognition is not supported in this browser.');
    return false;
  }

  if (isListening) return true;

  config = voiceConfig;
  isListening = true;

  rec.onresult = (event: { resultIndex: number; results: SpeechRecognitionResultList }) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript) {
      config.onTranscript?.(interimTranscript);
    }

    if (finalTranscript) {
      config.onTranscript?.(finalTranscript);
      const result = matchCommand(finalTranscript);
      executeCommand(result);
      config.onResult?.(result);
    }
  };

  rec.onerror = (event: { error: string }) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      config.onError?.(`Voice error: ${event.error}`);
    }
  };

  rec.onend = () => {
    isListening = false;
  };

  try {
    rec.start();
    return true;
  } catch (e) {
    isListening = false;
    config.onError?.('Failed to start voice recognition.');
    return false;
  }
};

export const stopVoiceCommands = (): void => {
  const rec = getRecognition();
  if (rec && isListening) {
    try {
      rec.stop();
    } catch { void 0; }
    isListening = false;
  }
};

export const isVoiceListening = (): boolean => isListening;

export const getVoiceCommandList = (): string[] => {
  return [
    'Add a loop block',
    'Add a move right block',
    'Add a move left block',
    'Add a jump block',
    'Add a wait block',
    'Add a turn right block',
    'Add a forever loop',
    'Run the game',
    'Stop the game',
    'Undo',
    'Redo',
    'Clear code',
    'Switch to game mode',
    'Switch to app mode',
  ];
};
