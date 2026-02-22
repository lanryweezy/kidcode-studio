/**
 * Meta AudioCraft (MusicGen) Integration
 * Generate royalty-free music from text prompts
 * https://github.com/facebookresearch/audiocraft
 */

// Hugging Face Inference API
const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN || '';

// MusicGen models
const MUSICGEN_MODELS = {
  small: 'facebook/musicgen-small',      // 300M params, fastest
  medium: 'facebook/musicgen-medium',    // 1.5B params, balanced
  large: 'facebook/musicgen-large',      // 3.3B params, best quality
  melody: 'facebook/musicgen-melody'     // With melody conditioning
};

export interface MusicGenerationOptions {
  prompt: string;
  duration?: 30 | 60 | 120 | 180;
  model?: 'small' | 'medium' | 'large' | 'melody';
  temperature?: number;
  topP?: number;
  guidanceScale?: number;
}

export interface GeneratedMusic {
  id: string;
  url: string;
  blob: Blob;
  duration: number;
  prompt: string;
  model: string;
  createdAt: number;
  downloadUrl: string;
}

export interface GenerationProgress {
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

/**
 * Generate music from text prompt using MusicGen
 */
export const generateMusic = async (
  options: MusicGenerationOptions,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedMusic> => {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face token not configured');
  }

  const model = MUSICGEN_MODELS[options.model || 'small'];
  const duration = options.duration || 30;

  onProgress?.({ 
    status: 'queued', 
    progress: 5, 
    message: 'Submitting to MusicGen...' 
  });

  try {
    // Query Hugging Face Inference API
    const response = await fetch(`${HF_API_BASE}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: options.prompt,
        parameters: {
          duration: duration / 1000, // Convert to seconds
          temperature: options.temperature || 1.0,
          top_p: options.topP || 0.9,
          guidance_scale: options.guidanceScale || 3.0,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`MusicGen API error: ${error.error || response.statusText}`);
    }

    onProgress?.({ 
      status: 'processing', 
      progress: 50, 
      message: 'Generating music...' 
    });

    // Get audio blob
    const audioBlob = await response.blob();
    
    onProgress?.({ 
      status: 'processing', 
      progress: 80, 
      message: 'Processing audio...' 
    });

    // Create object URL
    const url = URL.createObjectURL(audioBlob);
    
    // Get duration from blob
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const actualDuration = audioBuffer.duration * 1000; // ms

    const id = `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    onProgress?.({ 
      status: 'complete', 
      progress: 100, 
      message: 'Music generation complete!' 
    });

    return {
      id,
      url,
      blob: audioBlob,
      duration: actualDuration,
      prompt: options.prompt,
      model: model,
      createdAt: Date.now(),
      downloadUrl: url
    };
  } catch (error) {
    onProgress?.({ 
      status: 'error', 
      progress: 0, 
      message: 'Music generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Generate background music for specific game scenarios
 */
export const generateGameMusic = async (
  scenario: 'menu' | 'gameplay' | 'boss' | 'victory' | 'defeat' | 'exploration',
  style: 'orchestral' | 'electronic' | 'ambient' | 'chiptune' | 'rock' = 'orchestral',
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedMusic> => {
  const prompts: Record<string, string> = {
    menu: `${style} menu music, catchy loop, game interface`,
    gameplay: `${style} gameplay music, energetic, action-packed, adventure`,
    boss: `${style} boss battle music, epic, intense, dramatic, orchestral`,
    victory: `${style} victory fanfare, triumphant, celebratory, heroic`,
    defeat: `${style} defeat music, sad, melancholic, somber`,
    exploration: `${style} exploration music, calm, peaceful, atmospheric`
  };

  return generateMusic({
    prompt: prompts[scenario] || prompts.gameplay,
    duration: 60,
    model: 'medium'
  }, onProgress);
};

/**
 * Generate seamless looping music
 */
export const generateLoopingMusic = async (
  prompt: string,
  duration: 30 | 60 = 30,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedMusic> => {
  const loopingPrompt = `${prompt}, seamless loop, loopable, no fade out, consistent tempo`;
  
  return generateMusic({
    prompt: loopingPrompt,
    duration,
    model: 'small',
    guidanceScale: 2.5 // Lower for more consistency
  }, onProgress);
};

/**
 * Get available music styles
 */
export const getMusicStyles = (): string[] => {
  return [
    'Orchestral',
    'Electronic',
    'Ambient',
    'Chiptune',
    'Rock',
    'Jazz',
    'Classical',
    'Cinematic',
    'Fantasy',
    'Sci-Fi',
    'Horror',
    'Comedy',
    'Adventure',
    'Action',
    'Puzzle'
  ];
};

/**
 * Get available music scenarios
 */
export const getMusicScenarios = (): { value: string; label: string; icon: string }[] => {
  return [
    { value: 'menu', label: 'Menu / Title', icon: '📋' },
    { value: 'gameplay', label: 'Gameplay', icon: '🎮' },
    { value: 'boss', label: 'Boss Battle', icon: '👹' },
    { value: 'victory', label: 'Victory', icon: '🏆' },
    { value: 'defeat', label: 'Defeat', icon: '💀' },
    { value: 'exploration', label: 'Exploration', icon: '🗺️' }
  ];
};

/**
 * Preset music templates for KidCode Studio
 */
export const MUSIC_PRESETS = [
  {
    id: 'epic_battle',
    name: 'Epic Battle',
    prompt: 'Epic orchestral battle music, heroic brass, pounding drums, action adventure',
    duration: 60,
    icon: '⚔️'
  },
  {
    id: 'peaceful_village',
    name: 'Peaceful Village',
    prompt: 'Peaceful village music, calm flute, gentle strings, relaxing RPG',
    duration: 60,
    icon: '🏠'
  },
  {
    id: 'space_exploration',
    name: 'Space Exploration',
    prompt: 'Space exploration music, ambient synthesizer, cosmic, mysterious, sci-fi',
    duration: 90,
    icon: '🚀'
  },
  {
    id: 'forest_adventure',
    name: 'Forest Adventure',
    prompt: 'Forest adventure music, acoustic guitar, nature sounds, cheerful, exploration',
    duration: 60,
    icon: '🌲'
  },
  {
    id: 'underground_dungeon',
    name: 'Underground Dungeon',
    prompt: 'Dark dungeon music, ominous drones, suspenseful, mysterious, cave echoes',
    duration: 90,
    icon: '🕳️'
  },
  {
    id: 'victory_fanfare',
    name: 'Victory Fanfare',
    prompt: 'Victory fanfare, triumphant brass, celebratory, short loop, level complete',
    duration: 30,
    icon: '🎉'
  },
  {
    id: 'boss_battle',
    name: 'Boss Battle',
    prompt: 'Intense boss battle music, heavy percussion, dramatic strings, epic choir',
    duration: 120,
    icon: '👾'
  },
  {
    id: 'menu_theme',
    name: 'Menu Theme',
    prompt: 'Catchy menu theme, upbeat, loopable, game interface, welcoming',
    duration: 30,
    icon: '📋'
  }
];

/**
 * Convert blob to base64 for storage
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Download music file
 */
export const downloadMusic = (music: GeneratedMusic, filename?: string) => {
  const a = document.createElement('a');
  a.href = music.downloadUrl;
  a.download = filename || `kidcode_music_${music.id}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Play music preview
 */
export const playMusicPreview = (music: GeneratedMusic) => {
  const audio = new Audio(music.url);
  audio.play();
  return audio;
};

/**
 * Stop music playback
 */
export const stopMusicPreview = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.currentTime = 0;
};
