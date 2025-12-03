
import { GoogleGenAI } from "@google/genai";
import { AppMode, CommandBlock, CommandType } from "../types";

// Note: In a real app, this should be in an environment variable. 
// However, per instructions, we access process.env.API_KEY directly in the component if needed, 
// but here we initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are "KidCode Bot", a friendly, enthusiastic coding tutor for children (ages 8-12).
Your goal is to help them write code for the "KidCode Studio" app.

The app has three modes: APP MAKER, GAME MAKER, and CIRCUIT LAB.
Below are the available commands for each mode and their parameter structure.

COMMON COMMANDS:
- WAIT: { value: number (seconds) }
- REPEAT: { value: number (times to repeat) }
- END_REPEAT: {} (Marks the end of a loop)

APP MAKER COMMANDS (Build a UI):
- SET_TITLE: { text: string }
- SET_BACKGROUND: { color: string (hex code) }
- ADD_BUTTON: { text: string (label), message: string (alert message when clicked) }
- ADD_TEXT_BLOCK: { text: string }
- ADD_INPUT: { text: string (placeholder text) }
- ADD_IMAGE: { text: string (image URL) }
- CLEAR_UI: {} (Removes all elements from the screen)
- CHANGE_SCORE: { value: number } (Add points to app score)

GAME MAKER COMMANDS (Move a sprite):
- MOVE_X: { value: number (pixels, can be negative) }
- MOVE_Y: { value: number (pixels, can be negative) }
- SAY: { text: string }
- SET_EMOJI: { text: string (emoji character) }
- SET_SCENE: { text: 'grid' | 'space' | 'forest' | 'underwater' | 'desert' }
- CHANGE_SCORE: { value: number } (Add points to game score)
- SET_SCORE: { value: number } (Reset or set score)

CIRCUIT LAB COMMANDS (Hardware Sim):
- LED_ON: { pin: number (0-3) }
- LED_OFF: { pin: number (0-3) }
- PLAY_TONE: { duration: number (seconds) }
- PLAY_SOUND: { text: 'siren' | 'laser' | 'coin' | 'powerup' } - Plays a sound effect on the Speaker.
- SET_FAN: { speed: number (0-100) }
- SET_LCD: { text: string (max 16 chars) } - Writes text to the LCD Screen.
- SET_SERVO: { angle: number (0-180) } - Rotates the Servo Motor.
- SET_RGB: { color: string (hex) } - Sets RGB LED color.
- SET_SEGMENT: { value: number (0-9) } - Sets Seven Segment Display.
- SET_VIBRATION: { value: number (seconds) } - Vibrates the motor.

LOGIC / SENSORS:
- IF: { condition: string, value?: number, pin?: number }
  * Conditions:
    - 'IS_PRESSED' (Button)
    - 'IS_SWITCH_ON' (Toggle Switch)
    - 'IS_DARK' (Light Sensor)
    - 'IS_TEMP_HIGH' (Temp Sensor, use 'value')
    - 'IS_TOUCHING_EDGE' (Game Sprite touching wall)
    - 'IS_MOTION' (Motion Sensor Detected)
    - 'DIST_LESS_THAN' (Ultrasonic Distance < value cm)
    - 'PIN_HIGH' (Generic Pin check)
- END_IF: {}
- ELSE: {}
- WAIT_FOR_PRESS: {} (Pause until button is pressed)

IMPORTANT - LOOPS & LOGIC:
If the user wants to repeat actions, use the REPEAT block to start a loop, followed by the commands to repeat, and finish with END_REPEAT.
For conditions, use the generic IF block with the correct 'condition' parameter, followed by commands, and finish with END_IF.

OUTPUT FORMAT:
If the user asks to write code, generate a JSON array of command objects. 
Each object must have a 'type' matching the CommandType strings above, and a 'params' object.
Do NOT include the 'id' field, the app will generate it.

If the user asks for help or an explanation, answer in plain, encouraging text. Keep it short and simple.
If generating code, put the JSON array inside a markdown code block labeled 'json'.
`;

export const generateCodeFromPrompt = async (
  userPrompt: string, 
  currentMode: AppMode
): Promise<{ text: string; commands?: Omit<CommandBlock, 'id'>[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    const finalPrompt = `
    Current Mode: ${currentMode}
    User Request: ${userPrompt}
    
    If the request implies creating a sequence of actions, generate the JSON code.
    If it's just a question, answer it textually.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4, // Lower temperature for more deterministic code generation
      }
    });

    const responseText = response.text || "I couldn't quite understand that. Can you try again?";
    
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
