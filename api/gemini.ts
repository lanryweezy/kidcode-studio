
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

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
- Movement: MOVE_X, MOVE_Y, MOVE_Z (3D), GO_TO_XY, GLIDE_TO_XY, POINT_DIR.
- Physics: JUMP, SET_GRAVITY, SET_VELOCITY_X/Y, BOUNCE_ON_EDGE.
- Looks: SAY, THINK, SET_EMOJI, SET_SIZE, CHANGE_EFFECT, SHOW/HIDE.
- 3D: SET_VIEW_3D (condition: 'true'/'false'), ROTATE_Y, GENERATE_ENVIRONMENT (text: description).
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

export default async function handler(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API Key missing on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { action, payload } = await req.json();
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    if (action === 'generateCodeStream') {
      const { userPrompt, currentMode } = payload;
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      const finalPrompt = `
        Current Mode: ${currentMode}
        User Request: ${userPrompt}

        If the request implies creating a sequence of actions, generate the JSON code.
        If it's just a question, answer it textually.
      `;

      const result = await model.generateContentStream(finalPrompt);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (action === 'reviewCode') {
      const { commands, mode } = payload;
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });
      const prompt = `
            You are a friendly senior coding mentor for kids.
            Review this ${mode} project which uses these blocks: ${JSON.stringify(commands)}.

            1. Find any potential bugs (e.g. forever loop without a wait).
            2. Suggest 1 cool feature they could add.
            3. Explain 1 coding concept they used well.
            Keep it very encouraging, simple, and use emojis! Max 150 words.
        `;
      const result = await model.generateContent(prompt);
      return new Response(JSON.stringify({ text: result.response.text() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'getFixedCode') {
      const { commands, mode } = payload;
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });
      const prompt = `
            You are an expert KidCode block fixer.
            Fix the bugs in this ${mode} project: ${JSON.stringify(commands)}.
            Focus on logic errors (infinite loops, missing variables).
            Only return a valid JSON array of CommandBlocks. No text. No IDs.
        `;
      const result = await model.generateContent(prompt);
      return new Response(JSON.stringify({ text: result.response.text() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'generateSprite') {
        const { description } = payload;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(
            `Generate a cute pixel art sprite of ${description}, single character, white background, suitable for a video game.`
        );

        let dataUri = null;
        for (const part of result.response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                dataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
        return new Response(JSON.stringify({ dataUri }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (action === 'generateSpeech') {
        const { text } = payload;
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });
        const result = await model.generateContent(text);
        const base64Audio = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return new Response(JSON.stringify({ base64Audio }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
