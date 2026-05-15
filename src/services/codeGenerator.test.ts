import { describe, it, expect } from 'vitest';
import { generateCode } from './codeGenerator';
import { AppMode, CommandType, CommandBlock } from '../types';

describe('codeGenerator', () => {
  it('should generate Serial.println for LOG_DATA in HARDWARE mode', () => {
    const commands: CommandBlock[] = [
      {
        id: '1',
        type: CommandType.LOG_DATA,
        params: { text: 'Hello World' }
      }
    ];
    const result = generateCode(commands, AppMode.HARDWARE);
    expect(result.code).toContain('Serial.println("Hello World");');
    expect(result.code).not.toContain('console.log');
  });

  it('should generate console.info for LOG_DATA in APP mode', () => {
    const commands: CommandBlock[] = [
      {
        id: '1',
        type: CommandType.LOG_DATA,
        params: { text: 'Hello World' }
      }
    ];
    const result = generateCode(commands, AppMode.APP);
    expect(result.code).toContain('console.info("Hello World");');
    expect(result.code).not.toContain('console.log');
  });

  it('should generate console.info for LOG_DATA in GAME mode', () => {
    const commands: CommandBlock[] = [
      {
        id: '1',
        type: CommandType.LOG_DATA,
        params: { text: 'Hello World' }
      }
    ];
    const result = generateCode(commands, AppMode.GAME);
    expect(result.code).toContain('console.info("Hello World");');
    expect(result.code).not.toContain('console.log');
  });
});
