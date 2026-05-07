import { describe, it, expect, afterEach } from 'vitest';
import { checkAPIKey } from './aiServiceWrapper';

describe('aiServiceWrapper', () => {
  describe('checkAPIKey', () => {
    const keyName = 'VITE_TEST_API_KEY';

    afterEach(() => {
      delete process.env[keyName];
    });

    it('should return false if the key is missing', () => {
      delete process.env[keyName];
      expect(checkAPIKey(keyName)).toBe(false);
    });

    it('should return false if the key is empty', () => {
        process.env[keyName] = '';
        expect(checkAPIKey(keyName)).toBe(false);
      });

    it('should return false if the key is the default placeholder', () => {
      process.env[keyName] = 'your_api_key_here';
      expect(checkAPIKey(keyName)).toBe(false);
    });

    it('should return false if the key is too short', () => {
      process.env[keyName] = '1234567890'; // length 10
      expect(checkAPIKey(keyName)).toBe(false);
    });

    it('should return true if the key is valid and long enough', () => {
      process.env[keyName] = '12345678901'; // length 11
      expect(checkAPIKey(keyName)).toBe(true);
    });

    it('should return true for a typical API key', () => {
      process.env[keyName] = 'AIzaSyA_abcdefghijklmnopqrstuvwxyz123';
      expect(checkAPIKey(keyName)).toBe(true);
    });
  });
});
