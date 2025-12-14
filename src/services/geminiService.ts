
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppMode, CommandBlock, CommandType } from "../types";

const SYSTEM_PROMPT = `
You are "KidCode Bot", a friendly, enthusiastic coding tutor for children (ages 8-12).
Your goal is to help them write code for the "KidCode Studio" app.

The app has three modes: APP MAKER, GAME MAKER, and CIRCUIT LAB.
The user has access to a MASSIVE library of hundreds of blocks and components.

COMMON LOGIC:
- REPEAT (Loop), FOREVER, IF/ELSE, WAIT.
- VARIABLES: SET_VAR, CHANGE_VAR.
- MATH: CALC_ADD, CALC_SUB, CALC_RANDOM (Set result to variable).

APP MAKER (UI):
- Screens: CREATE_SCREEN, NAVIGATE.
- Widgets: ADD_BUTTON, ADD_INPUT, ADD_TEXT_BLOCK, ADD_IMAGE, ADD_SWITCH, ADD_SLIDER, ADD_MAP, ADD_VIDEO, ADD_DATE_PICKER.
- Actions: SHOW_ALERT, SPEAK, VIBRATE_DEVICE, OPEN_URL.

GAME MAKER (Sprites):
- Movement: MOVE_X, MOVE_Y, GO_TO_XY, GLIDE_TO_XY, POINT_DIR.
- Physics: JUMP, SET_GRAVITY, SET_VELOCITY_X/Y, BOUNCE_ON_EDGE.
- Looks: SAY, THINK, SET_EMOJI, SET_SIZE, CHANGE_EFFECT, SHOW/HIDE.
- World: SET_SCENE, SET_WEATHER, SET_CAMERA, SHAKE_CAMERA.
- Actions: SHOOT, SPAWN_ENEMY, SPAWN_ITEM, CREATE_CLONE.
- Sound: PLAY_SOUND, PLAY_TONE.

CIRCUIT LAB (Electronics):
- Outputs: LED_ON, LED_OFF, SET_RGB, SET_SERVO, SET_FAN, SET_RELAY, SET_LASER.
- Displays: SET_LCD, SET_OLED_TEXT, SET_SEGMENT, CLEAR_LCD.
- Inputs: READ_DIGITAL, READ_ANALOG, WAIT_FOR_PRESS.
- Comms: LOG_DATA, SEND_HTTP.

OUTPUT FORMAT:
If the user asks to write code, generate a JSON array of command objects. 
Each object must have a 'type' matching the CommandType enums, and a 'params' object.
Do NOT include the 'id' field.

Example JSON:
[
  { "type": "SET_SCENE", "params": { "text": "space" } },
  { "type": "SET_GRAVITY", "params": { "condition": "true" } },
  { "type": "REPEAT", "params": { "value": 10 } },
  { "type": "MOVE_X", "params": { "value": 10 } },
  { "type": "END_REPEAT", "params": {} }
]

If the user asks for help or an explanation, answer in plain, encouraging text. Keep it short and simple.
If generating code, put the JSON array inside a markdown code block labeled 'json'.
`;

export const generateCodeFromPrompt = async (
  userPrompt: string, 
  currentMode: AppMode
): Promise<{ text: string; commands?: Omit<CommandBlock, 'id'>[] }> => {
  try {
    // Lazily initialize to avoid crash if process is missing on load in some browser envs
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    if (!apiKey) {
        console.warn("API Key missing");
        return { text: "I can't access my brain right now (API Key missing)." };
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const finalPrompt = `
    Current Mode: ${currentMode}
    User Request: ${userPrompt}

    If the request implies creating a sequence of actions, generate the JSON code.
    If it's just a question, answer it textually.
    `;

    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.4,
      }
    });

    const result = await model.generateContent(finalPrompt);
    const response = result.response;

    const responseText = typeof response.text === 'function' ? response.text() : response.text || "I couldn't quite understand that. Can you try again?";

    // Extract JSON if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let commands: Omit<CommandBlock, 'id'>[] | undefined;

    if (jsonMatch && jsonMatch[1]) {
      try {
        commands = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse generated JSON", e);
      }
    }

    // Clean up the text to remove the JSON block so we don't show raw JSON to the kid in the chat bubble
    const cleanText = responseText.replace(/```json[\s\S]*?```/, '').trim();

    return {
      text: cleanText || "Here is the code for you! Press the Green Play button to see it happen.",
      commands
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Oops! My brain froze. Check your internet or API key." };
  }
};

export const generateSprite = async (description: string): Promise<string | null> => {
    try {
        const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
        if (!apiKey) return null;
        const ai = new GoogleGenerativeAI(apiKey);
        const spriteModel = ai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

        const result = await spriteModel.generateContent(
            `Generate a cute pixel art sprite of ${description}, single character, white background, suitable for a video game.`
        );
        const response = result.response;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Sprite Gen Error", e);
        return null;
    }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
    try {
        const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
        if (!apiKey) return null;
        const ai = new GoogleGenerativeAI(apiKey);
        const speechModel = ai.getGenerativeModel({
            model: "gemini-2.5-flash-preview-tts",
            generationConfig: {
                responseMimeType: "audio/wav",
            },
            voice: {
                name: 'Puck' // Puck is nice and friendly for kids
            },
        });

        const result = await speechModel.generateContent(text);
        const response = result.response;

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        // Convert base64 to AudioBuffer
        const audioResponse = await fetch(`data:audio/wav;base64,${base64Audio}`);
        const audioArrayBuffer = await audioResponse.arrayBuffer();

        // Create AudioContext and decode
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
        return audioBuffer;
    } catch (e) {
        console.error("Speech Gen Error", e);
        return null;
    }
};
