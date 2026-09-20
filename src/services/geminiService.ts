import { AppMode, CommandBlock } from "../types";
import { executeWithRetry, RetryPresets } from "./aiServiceWrapper";

/**
 * SECURITY NOTE: API keys are handled server-side via /api/gemini proxy
 */

/**
 * 🤖 Astra: [AI quality improvement]
 * Validates raw AI JSON output before casting it to CommandBlock array.
 * Prevents downstream crashes if the model hallucinates an invalid structure.
 */
const safeParseCommands = (jsonStr: string): Omit<CommandBlock, 'id'>[] => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error("AI output is not an array");
    }
    // Filter out invalid items
    const validCommands = parsed.filter(item =>
      item && typeof item === 'object' && typeof item.type === 'string'
    );
    if (validCommands.length === 0 && parsed.length > 0) {
        throw new Error("AI output array contained no valid CommandBlocks");
    }
    return validCommands;
  } catch (error) {
    console.error("AI Validation Error:", error);
    throw error;
  }
};



export const generateCodeFromPromptStream = async function* (
  userPrompt: string,
  currentMode: AppMode
): AsyncGenerator<{ text: string; isDone: boolean; commands?: Omit<CommandBlock, 'id'>[] }, void, unknown> {
  try {
    const response = await executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateCodeStream',
                payload: { userPrompt, currentMode }
            }),
            signal: controller.signal
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            // 🤖 Astra: [AI quality improvement] Attach HTTP status to Error for proper retry classification
            const error = new Error(errorData.error || `AI API returned status ${res.status}`) as Error & { status?: number };
            error.status = res.status;
            throw error;
        }
        return res;
      } finally {
        clearTimeout(timeoutId);
      }
    }, RetryPresets.quick, 'gemini');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    let fullText = "";
    const textDecoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = textDecoder.decode(value);
      fullText += chunkText;

      // Only yield text that is not part of a markdown code block (yet). We'll parse the code at the end.
      const cleanTextSoFar = fullText.replace(/```json[\s\S]*?(```|$)/g, '').trim();
      yield { text: cleanTextSoFar, isDone: false };
    }

    // Done streaming, now parse the final output
    // 🤖 Astra: [AI quality improvement]
    // Use robust array extraction to handle cases where the model includes conversational preamble
    // before the JSON block, which bypasses naive regex stripping and crashes JSON.parse.
    const startIdx = fullText.indexOf('[');
    const endIdx = fullText.lastIndexOf(']');
    let commands: Omit<CommandBlock, 'id'>[] | undefined;

    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
      try {
        commands = safeParseCommands(fullText.substring(startIdx, endIdx + 1));
      } catch (e) {
        console.error("Failed to parse or validate generated JSON", e);
      }
    }

    const cleanText = fullText.replace(/```json[\s\S]*?```/, '').trim();
    yield {
        text: cleanText || "Here is the code for you! Press the Green Play button to see it happen.",
        isDone: true,
        commands
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    yield { text: "Oops! My brain froze. Check your internet or API key.", isDone: true };
  }
};

export const generateCodeFromPrompt = async (
  userPrompt: string,
  currentMode: AppMode
): Promise<{ text: string; commands?: Omit<CommandBlock, 'id'>[] }> => {
  const gen = generateCodeFromPromptStream(userPrompt, currentMode);
  let lastResult = { text: "", commands: undefined as Omit<CommandBlock, 'id'>[] | undefined };
  for await (const result of gen) {
    lastResult = { text: result.text, commands: result.commands };
  }
  return lastResult;
};

export const reviewCode = async (commands: CommandBlock[], mode: AppMode): Promise<string> => {
    try {
        const response = await executeWithRetry(async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            try {
                const res = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'reviewCode',
                        payload: { commands, mode }
                    }),
                    signal: controller.signal
                });
                if (!res.ok) {
                    // 🤖 Astra: [AI quality improvement] Attach HTTP status to Error for proper retry classification
                    const error = new Error(`AI API returned status ${res.status}`) as Error & { status?: number };
                    error.status = res.status;
                    throw error;
                }
                return res;
            } finally {
                clearTimeout(timeoutId);
            }
        }, RetryPresets.quick, 'gemini');

        const data = await response.json();
        return data.text || "I couldn't review your code right now, but keep building! 🚀";
    } catch (e) {
        console.error("AI Review error:", e);
        return "I couldn't review your code right now, but keep building! 🚀";
    }
};

export const getFixedCode = async (commands: CommandBlock[], mode: AppMode): Promise<Omit<CommandBlock, 'id'>[] | null> => {
    try {
        const response = await executeWithRetry(async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            try {
                const res = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'getFixedCode',
                        payload: { commands, mode }
                    }),
                    signal: controller.signal
                });
                if (!res.ok) {
                    // 🤖 Astra: [AI quality improvement] Attach HTTP status to Error for proper retry classification
                    const error = new Error(`AI API returned status ${res.status}`) as Error & { status?: number };
                    error.status = res.status;
                    throw error;
                }
                return res;
            } finally {
                clearTimeout(timeoutId);
            }
        }, RetryPresets.quick, 'gemini');

        const data = await response.json();
        const text = data.text;
        if (!text) return null;
        
        // 🤖 Astra: [AI quality improvement]
        // Used greedy indexOf/lastIndexOf to extract the JSON payload array instead of a non-greedy regex match.
        // A non-greedy regex (/\[[\s\S]*?\]/) halts at the *first* closing bracket it sees, which results in silent
        // JSON parsing crashes if the AI output array contains nested arrays (e.g., parameter objects with list values).
        const startIdx = text.indexOf('[');
        const endIdx = text.lastIndexOf(']');

        if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
            return safeParseCommands(text.substring(startIdx, endIdx + 1));
        }
        return null;
    } catch (e) {
        console.error("AI Fix error:", e);
        return null;
    }
};

export const generateSprite = async (description: string): Promise<string | null> => {
    try {
        const response = await executeWithRetry(async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            try {
                const res = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generateSprite',
                        payload: { description }
                    }),
                    signal: controller.signal
                });
                if (!res.ok) {
                    // 🤖 Astra: [AI quality improvement] Attach HTTP status to Error for proper retry classification
                    const error = new Error(`AI API returned status ${res.status}`) as Error & { status?: number };
                    error.status = res.status;
                    throw error;
                }
                return res;
            } finally {
                clearTimeout(timeoutId);
            }
        }, RetryPresets.standard, 'gemini');

        const data = await response.json();
        return data.dataUri || null;
    } catch (e) {
        console.error("Sprite Gen Error", e);
        return null;
    }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
    try {
        const response = await executeWithRetry(async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            try {
                const res = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generateSpeech',
                        payload: { text }
                    }),
                    signal: controller.signal
                });
                if (!res.ok) {
                    // 🤖 Astra: [AI quality improvement] Attach HTTP status to Error for proper retry classification
                    const error = new Error(`AI API returned status ${res.status}`) as Error & { status?: number };
                    error.status = res.status;
                    throw error;
                }
                return res;
            } finally {
                clearTimeout(timeoutId);
            }
        }, RetryPresets.standard, 'gemini');

        const data = await response.json();
        const base64Audio = data.base64Audio;
        if (!base64Audio) return null;

        // Convert base64 to AudioBuffer
        const audioResponse = await fetch(`data:audio/wav;base64,${base64Audio}`);
        const audioArrayBuffer = await audioResponse.arrayBuffer();

        // Create AudioContext and decode
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
        return audioBuffer;
    } catch (e) {
        console.error("Speech Gen Error", e);
        return null;
    }
};
