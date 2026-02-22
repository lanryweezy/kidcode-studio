/**
 * Meta Code Llama Integration
 * AI-powered code assistance for KidCode Studio
 * https://github.com/facebookresearch/codellama
 */

// Hugging Face Inference API
const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN || '';

// Code Llama models
const CODE_LLAMA_MODELS = {
  '7b': 'codellama/CodeLlama-7b-Instruct-hf',
  '13b': 'codellama/CodeLlama-13b-Instruct-hf',
  '34b': 'codellama/CodeLlama-34b-Instruct-hf',
  'python': 'codellama/CodeLlama-34b-Instruct-hf' // Optimized for Python
};

export interface CodeAssistanceOptions {
  question: string;
  context?: {
    mode: 'APP' | 'GAME' | 'HARDWARE';
    currentBlocks?: any[];
    projectType?: string;
  };
  model?: '7b' | '13b' | '34b' | 'python';
  maxTokens?: number;
  temperature?: number;
}

export interface CodeAssistanceResponse {
  id: string;
  answer: string;
  suggestedBlocks?: any[];
  codeExample?: string;
  explanation?: string;
  confidence: number;
  createdAt: number;
}

export interface GenerationProgress {
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

/**
 * Get code assistance from Code Llama
 */
export const getCodeAssistance = async (
  options: CodeAssistanceOptions,
  onProgress?: (progress: GenerationProgress) => void
): Promise<CodeAssistanceResponse> => {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face token not configured');
  }

  const model = CODE_LLAMA_MODELS[options.model || '13b'];

  onProgress?.({ 
    status: 'queued', 
    progress: 5, 
    message: 'Submitting to Code Llama...' 
  });

  try {
    // Build prompt with context
    const prompt = buildPrompt(options);

    onProgress?.({ 
      status: 'processing', 
      progress: 30, 
      message: 'Analyzing code...' 
    });

    const response = await fetch(`${HF_API_BASE}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Code Llama API error: ${error.error || response.statusText}`);
    }

    onProgress?.({ 
      status: 'processing', 
      progress: 80, 
      message: 'Generating response...' 
    });

    const result = await response.json();
    const answer = result[0]?.generated_text || 'I couldn\'t generate a response. Please try again.';

    // Parse response for suggested blocks
    const suggestedBlocks = parseSuggestedBlocks(answer, options.context?.mode);
    const codeExample = parseCodeExample(answer);
    const explanation = parseExplanation(answer);

    onProgress?.({ 
      status: 'complete', 
      progress: 100, 
      message: 'Response ready!' 
    });

    const id = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      answer: cleanResponse(answer),
      suggestedBlocks,
      codeExample,
      explanation,
      confidence: 0.85,
      createdAt: Date.now()
    };
  } catch (error) {
    onProgress?.({ 
      status: 'error', 
      progress: 0, 
      message: 'Code assistance failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Build prompt for Code Llama with KidCode context
 */
const buildPrompt = (options: CodeAssistanceOptions): string => {
  const { question, context } = options;

  let prompt = `You are KidCode Bot, a friendly coding tutor for kids ages 8-12.
You help them learn programming using visual blocks in KidCode Studio.

Current Mode: ${context?.mode || 'GAME'}
`;

  if (context?.currentBlocks && context.currentBlocks.length > 0) {
    prompt += `
Current Blocks in Project:
${JSON.stringify(context.currentBlocks.slice(0, 10), null, 2)}
`;
  }

  prompt += `
Your Task:
1. Answer the question in simple, encouraging language
2. Suggest specific blocks they can use
3. Provide a code example if helpful
4. Keep it under 200 words
5. Use emojis to make it fun! 🎮✨

Question: ${question}

Answer:`;

  return prompt;
};

/**
 * Parse suggested blocks from response
 */
const parseSuggestedBlocks = (response: string, mode?: string): any[] => {
  const blocks: any[] = [];
  
  // Look for block suggestions in response
  const blockPatterns = [
    /MOVE_X.*?value.*?(\d+)/i,
    /JUMP.*?value.*?(\d+)/i,
    /IF.*?condition.*?(\w+)/i,
    /SET_VAR.*?varName.*?(\w+).*?value.*?(\w+)/i
  ];

  // Example parsing logic (simplified)
  if (response.includes('jump') || response.includes('JUMP')) {
    blocks.push({
      type: 'JUMP',
      params: { value: 15 }
    });
  }

  if (response.includes('move') || response.includes('MOVE')) {
    blocks.push({
      type: 'MOVE_X',
      params: { value: 10 }
    });
  }

  return blocks;
};

/**
 * Parse code example from response
 */
const parseCodeExample = (response: string): string | undefined => {
  const codeBlockMatch = response.match(/```[\s\S]*?```/);
  return codeBlockMatch ? codeBlockMatch[0] : undefined;
};

/**
 * Parse explanation from response
 */
const parseExplanation = (response: string): string => {
  // Remove code blocks and return plain text explanation
  return response.replace(/```[\s\S]*?```/g, '').trim();
};

/**
 * Clean response text
 */
const cleanResponse = (response: string): string => {
  return response
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n\s*\n/g, '\n') // Remove extra newlines
    .trim();
};

/**
 * Debug current project and suggest improvements
 */
export const debugProject = async (
  blocks: any[],
  mode: 'APP' | 'GAME' | 'HARDWARE',
  onProgress?: (progress: GenerationProgress) => void
): Promise<CodeAssistanceResponse> => {
  const question = `Please review my ${mode} project and suggest improvements. Are there any bugs or better ways to organize my code?`;
  
  return getCodeAssistance({
    question,
    context: {
      mode,
      currentBlocks: blocks
    },
    model: '34b',
    maxTokens: 800
  }, onProgress);
};

/**
 * Explain what a specific block does
 */
export const explainBlock = async (
  blockType: string,
  blockParams: any,
  onProgress?: (progress: GenerationProgress) => void
): Promise<CodeAssistanceResponse> => {
  const question = `What does the ${blockType} block do? How should I use it?`;
  
  return getCodeAssistance({
    question,
    context: {
      mode: 'GAME',
      currentBlocks: [{ type: blockType, params: blockParams }]
    },
    model: '13b',
    maxTokens: 300
  }, onProgress);
};

/**
 * Suggest blocks for a specific feature
 */
export const suggestBlocksForFeature = async (
  feature: string,
  mode: 'APP' | 'GAME' | 'HARDWARE',
  onProgress?: (progress: GenerationProgress) => void
): Promise<CodeAssistanceResponse> => {
  const question = `I want to add ${feature} to my ${mode}. What blocks should I use? Please suggest specific blocks and how to connect them.`;
  
  return getCodeAssistance({
    question,
    context: { mode },
    model: '34b',
    maxTokens: 600
  }, onProgress);
};

/**
 * Convert blocks to text code explanation
 */
export const explainCodeStructure = async (
  blocks: any[],
  targetLanguage: 'python' | 'javascript' | 'arduino',
  onProgress?: (progress: GenerationProgress) => void
): Promise<CodeAssistanceResponse> => {
  const question = `Explain how these KidCode blocks would work in ${targetLanguage}. What's the equivalent code?`;
  
  return getCodeAssistance({
    question,
    context: {
      mode: 'GAME',
      currentBlocks: blocks
    },
    model: 'python',
    maxTokens: 700
  }, onProgress);
};

/**
 * Generate tutorial from project
 */
export const generateTutorial = async (
  blocks: any[],
  mode: 'APP' | 'GAME' | 'HARDWARE',
  onProgress?: (progress: GenerationProgress) => void
): Promise<CodeAssistanceResponse> => {
  const question = `Create a step-by-step tutorial explaining how this ${mode} project works. Break it down into simple steps that a beginner can follow.`;
  
  return getCodeAssistance({
    question,
    context: {
      mode,
      currentBlocks: blocks
    },
    model: '34b',
    maxTokens: 1000
  }, onProgress);
};

/**
 * Preset help topics for KidCode Studio
 */
export const HELP_TOPICS = [
  {
    id: 'movement',
    name: 'Character Movement',
    icon: '🏃',
    question: 'How do I make my character move and jump?'
  },
  {
    id: 'collision',
    name: 'Collision Detection',
    icon: '💥',
    question: 'How do I detect when my character touches something?'
  },
  {
    id: 'score',
    name: 'Score System',
    icon: '🏆',
    question: 'How do I create a score system for my game?'
  },
  {
    id: 'enemies',
    name: 'Enemy AI',
    icon: '👾',
    question: 'How do I make enemies chase the player?'
  },
  {
    id: 'dialogue',
    name: 'Dialogue System',
    icon: '💬',
    question: 'How do I create dialogue between characters?'
  },
  {
    id: 'inventory',
    name: 'Inventory System',
    icon: '🎒',
    question: 'How do I create an inventory for collecting items?'
  },
  {
    id: 'animation',
    name: 'Character Animation',
    icon: '🎬',
    question: 'How do I animate my character?'
  },
  {
    id: 'sound',
    name: 'Sound & Music',
    icon: '🎵',
    question: 'How do I add sound effects and music?'
  }
];

/**
 * Quick tips for common tasks
 */
export const QUICK_TIPS = [
  {
    task: 'Make character jump',
    blocks: ['SET_GRAVITY', 'JUMP'],
    tip: 'Enable gravity first, then use JUMP block when space is pressed!'
  },
  {
    task: 'Collect coins',
    blocks: ['IF (IS_TOUCHING)', 'CHANGE_SCORE', 'DELETE_CLONE'],
    tip: 'Use IF block to check collision, then increase score and remove coin!'
  },
  {
    task: 'Game over screen',
    blocks: ['IF (HEALTH <= 0)', 'GAME_OVER'],
    tip: 'Check if health reaches zero, then trigger game over!'
  },
  {
    task: 'Moving platform',
    blocks: ['FOREVER', 'MOVE_X', 'WAIT', 'MOVE_X', 'WAIT'],
    tip: 'Use FOREVER loop with WAIT blocks to create back-and-forth motion!'
  }
];
