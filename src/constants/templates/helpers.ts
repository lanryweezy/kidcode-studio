import { CommandType, CommandBlock } from '../../types';

let templateIdCounter = 0;
const nextId = () => `tpl_${++templateIdCounter}`;

export const createIntro = (title: string, subtitle: string): CommandBlock[] => [
  { id: nextId(), type: CommandType.TRIGGER_CUTSCENE, params: { text: 'intro' } },
  { id: nextId(), type: CommandType.SAY, params: { text: title } },
  { id: nextId(), type: CommandType.WAIT, params: { value: 1 } },
  { id: nextId(), type: CommandType.SAY, params: { text: subtitle } },
  { id: nextId(), type: CommandType.WAIT, params: { value: 1 } },
  { id: nextId(), type: CommandType.FADE_IN, params: { value: 1 } },
];

export const createMovement = (): CommandBlock[] => [
  { id: nextId(), type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 37 } },
  { id: nextId(), type: CommandType.MOVE_X, params: { value: -5 } },
  { id: nextId(), type: CommandType.END_IF, params: {} },
  { id: nextId(), type: CommandType.IF, params: { condition: 'IS_PRESSED', pin: 39 } },
  { id: nextId(), type: CommandType.MOVE_X, params: { value: 5 } },
  { id: nextId(), type: CommandType.END_IF, params: {} },
];

export const createGameLoop = (movement: CommandBlock[], actions: CommandBlock[], conditions: CommandBlock[]): CommandBlock[] => [
  ...movement,
  ...actions,
  ...conditions,
];
