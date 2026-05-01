import { describe, it, expect, vi } from 'vitest';
import { reviewCode } from './geminiService';
import { AppMode } from '../types';

describe('geminiService', () => {
    describe('reviewCode', () => {
        it('should return an error message when VITE_GEMINI_API_KEY is missing', async () => {
            // Mock VITE_GEMINI_API_KEY to be undefined
            vi.stubGlobal('VITE_GEMINI_API_KEY', undefined);

            const result = await reviewCode([], AppMode.GAME);

            expect(result).toBe("I can't review your code without my AI brain! (API Key missing)");
        });
    });
});
