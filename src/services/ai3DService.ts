/**
 * AI 3D Asset Generation Service
 * Supports multiple providers: Meshy AI, Luma Genie, Tripo AI, Microsoft TRELLIS
 *
 * SECURITY NOTE: API keys are handled server-side via /api/ai3d proxy
 */

import { executeWithRetry, executeWithFallback, RetryPresets } from './aiServiceWrapper';

/**
 * Proxy fetch helper to call AI services through Vercel serverless functions
 */
const proxyFetch = async (provider: string, path: string, options: RequestInit = {}) => {
  const response = await fetch(`/api/ai3d?provider=${provider}&path=${encodeURIComponent(path)}`, options);
  return response;
};

export interface AI3DProvider {
  id: string;
  name: string;
  quality: 'standard' | 'high' | 'ultra';
  speed: 'fast' | 'balanced' | 'quality';
  costPerGen: number;
  freeTierLimit: number;
}

export interface Generate3DOptions {
  prompt?: string;
  imageUrl?: string;
  style?: 'cartoon' | 'realistic' | 'lowpoly' | 'anime' | 'voxel';
  category?: 'character' | 'prop' | 'vehicle' | 'building' | 'environment';
  provider?: 'meshy' | 'luma' | 'tripo' | 'trellis';
  quality?: 'standard' | 'high' | 'ultra';
  autoRig?: boolean;
  optimizeForGame?: boolean;
  speed?: 'fast' | 'balanced' | 'quality';
}

export interface Generated3DAsset {
  id: string;
  url: string;
  thumbnailUrl: string;
  format: 'glb' | 'gltf' | 'fbx' | 'obj';
  vertices: number;
  textures: string[];
  isRigged: boolean;
  animations?: string[];
  provider: string;
  prompt: string;
  createdAt: number;
  downloadUrl?: string;
}

export interface GenerationProgress {
  status: 'queued' | 'processing' | 'texturing' | 'finalizing' | 'complete' | 'error';
  progress: number; // 0-100
  estimatedTimeRemaining?: number;
  message?: string;
  error?: string;
}

// Provider configurations
const PROVIDERS: Record<string, AI3DProvider> = {
  meshy: {
    id: 'meshy',
    name: 'Meshy AI',
    quality: 'high',
    speed: 'balanced',
    costPerGen: 0.25,
    freeTierLimit: 10
  },
  luma: {
    id: 'luma',
    name: 'Luma Genie',
    quality: 'high',
    speed: 'fast',
    costPerGen: 0.20,
    freeTierLimit: 5
  },
  tripo: {
    id: 'tripo',
    name: 'Tripo AI',
    quality: 'standard',
    speed: 'fast',
    costPerGen: 0.10,
    freeTierLimit: 20
  },
  trellis: {
    id: 'trellis',
    name: 'Microsoft TRELLIS',
    quality: 'ultra',
    speed: 'quality',
    costPerGen: 0.50,
    freeTierLimit: 5
  }
};

/**
 * Generate 3D model from text or image
 */
export const generate3DModel = async (
  options: Generate3DOptions,
  onProgress?: (progress: GenerationProgress) => void
): Promise<Generated3DAsset> => {
  const provider = options.provider || 'tripo'; // Default to Tripo (faster)

  if (!options.prompt && !options.imageUrl) {
    throw new Error('Either prompt or imageUrl is required');
  }

  try {
    const isImage = !!options.imageUrl;

    const tripoFn = async () => {
        if (isImage) {
            return await tripoAPI.generateFromImage(options.imageUrl!, onProgress);
        } 
            return await tripoAPI.generateFromText(
              options.prompt!,
              options.style || 'cartoon',
              onProgress
            );
        
    };

    const meshyFn = async () => {
        if (isImage) {
            return await meshyAPI.generateFromImage(options.imageUrl!, onProgress);
        } 
            return await meshyAPI.generateFromText(
              options.prompt!,
              options.style || 'cartoon',
              onProgress
            );
        
    };

    if (provider === 'tripo' || provider === 'meshy') {
        const providers = provider === 'tripo' ?
            [{ name: 'tripo', fn: tripoFn }, { name: 'meshy', fn: meshyFn }] :
            [{ name: 'meshy', fn: meshyFn }, { name: 'tripo', fn: tripoFn }];

        try {
            return await executeWithFallback(providers, RetryPresets.slow);
        } catch (error) {
             onProgress?.({
                status: 'error',
                progress: 0,
                message: 'All generation attempts failed',
                error: error instanceof Error ? error.message : 'Unknown error'
             });
             throw error;
        }
    }

    // Fallback to mock generation for other providers
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const updateProgress = (status: GenerationProgress['status'], progress: number, message?: string) => {
      onProgress?.({ status, progress, message });
    };

    updateProgress('queued', 5, 'Submitting to AI...');
    await sleep(1000);
    updateProgress('processing', 25, 'Generating 3D shape...');
    await sleep(2000);
    updateProgress('texturing', 60, 'Applying textures...');
    await sleep(2000);
    updateProgress('finalizing', 85, 'Finalizing model...');
    await sleep(1000);
    updateProgress('complete', 100, 'Generation complete!');

    const asset: Generated3DAsset = {
      id: generationId,
      url: `https://storage.kidcode.io/models/${generationId}.glb`,
      thumbnailUrl: `https://storage.kidcode.io/thumbnails/${generationId}.png`,
      format: 'glb' as const,
      vertices: Math.floor(Math.random() * 10000) + 5000,
      textures: ['diffuse', 'normal', 'roughness', 'metallic'],
      isRigged: options.autoRig || false,
      animations: options.autoRig ? ['idle', 'walk', 'run', 'jump'] : undefined,
      provider,
      prompt: options.prompt || 'Image upload',
      createdAt: Date.now(),
      downloadUrl: `https://storage.kidcode.io/download/${generationId}.glb`
    };

    return asset;
  } catch (error) {
    onProgress?.({ 
      status: 'error', 
      progress: 0, 
      message: 'Generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Get generation status
 */
export const getGenerationStatus = async (generationId: string): Promise<GenerationProgress> => {
  // In production, this would poll the API
  return {
    status: 'complete',
    progress: 100
  };
};

/**
 * Cancel generation
 */
export const cancelGeneration = async (generationId: string): Promise<void> => {
  // In production, this would call the API to cancel
};

/**
 * Get available providers
 */
export const getAvailableProviders = (): AI3DProvider[] => {
  return Object.values(PROVIDERS);
};

/**
 * Get recommended provider based on options
 */
export const getRecommendedProvider = (options: Generate3DOptions): string => {
  if (options.quality === 'ultra') return 'trellis';
  if (options.quality === 'high') return 'meshy';
  if (options.speed === 'fast') return 'tripo';
  return 'meshy'; // Default
};

/**
 * Estimate cost for generation
 */
export const estimateCost = (options: Generate3DOptions): { credits: number; usd: number } => {
  const provider = options.provider || getRecommendedProvider(options);
  const config = PROVIDERS[provider];
  
  let multiplier = 1;
  if (options.quality === 'high') multiplier = 1.5;
  if (options.quality === 'ultra') multiplier = 2;
  if (options.autoRig) multiplier += 0.5;

  return {
    credits: Math.round(config.freeTierLimit * multiplier),
    usd: config.costPerGen * multiplier
  };
};

/**
 * Auto-rig a 3D character model
 */
export const autoRigCharacter = async (modelUrl: string): Promise<Generated3DAsset> => {
  // In production, this would call Mixamo or similar API
  return {
    id: `rig_${Date.now()}`,
    url: modelUrl,
    thumbnailUrl: '',
    format: 'glb' as const,
    vertices: 0,
    textures: [],
    isRigged: true,
    animations: ['idle', 'walk', 'run', 'jump', 'attack'],
    provider: 'mixamo',
    prompt: 'Auto-rigged character',
    createdAt: Date.now()
  };
};

/**
 * Optimize 3D model for games
 */
export const optimizeForGames = async (modelUrl: string, targetPolyCount?: number): Promise<string> => {
  // In production, this would run mesh optimization
  // - Decimation
  // - Texture compression
  // - LOD generation
  return modelUrl; // Return optimized URL
};

/**
 * Generate texture from text
 */
export const generateTexture = async (
  prompt: string,
  options: {
    size?: number;
    seamless?: boolean;
    pbr?: boolean;
  } = {}
): Promise<{ url: string; type: string }> => {
  // In production, this would call Leonardo AI or Stable Diffusion
  return {
    url: `https://storage.kidcode.io/textures/tex_${Date.now()}.png`,
    type: options.pbr ? 'pbr' : 'diffuse'
  };
};

/**
 * Convert 2D sprite to 3D model
 */
export const convert2DTo3D = async (spriteUrl: string): Promise<Generated3DAsset> => {
  // In production, this would use AI depth estimation + extrusion
  return {
    id: `conv_${Date.now()}`,
    url: `https://storage.kidcode.io/converted/conv_${Date.now()}.glb`,
    thumbnailUrl: '',
    format: 'glb' as const,
    vertices: 2000,
    textures: ['diffuse'],
    isRigged: false,
    provider: 'kidcode',
    prompt: '2D to 3D conversion',
    createdAt: Date.now()
  };
};

// Helper function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tripo AI API Integration
 * Fast 3D generation (10-30 seconds)
 */
const tripoAPI = {
  /**
   * Generate 3D model from text prompt
   */
  async generateFromText(
    prompt: string,
    style: string = 'cartoon',
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    return executeWithRetry(async () => {
        onProgress?.({ status: 'queued', progress: 5, message: 'Submitting to Tripo AI...' });

        // Step 1: Create task
        const createResponse = await proxyFetch('tripo', 'task', {
          method: 'POST',
          body: JSON.stringify({
            type: 'text_to_model',
            prompt: prompt,
            style: style
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(`Tripo API error: ${errorData.error || createResponse.statusText}`);
        }

        const createData = await createResponse.json();
        const taskId = createData.data.task_id;

        // Step 2: Poll for completion (Tripo is fast - 10-30 seconds)
        onProgress?.({ status: 'processing', progress: 20, message: 'Generating 3D model...' });

        while (true) {
          const statusResponse = await proxyFetch('tripo', `task/${taskId}`);

          if (!statusResponse.ok) {
            const errorData = await statusResponse.json().catch(() => ({}));
            throw new Error(`Tripo API error: ${errorData.error || statusResponse.statusText}`);
          }

          const statusData = await statusResponse.json();
          
          if (statusData.data.status === 'success') {
            onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

            const output = statusData.data.output;

            return {
              id: taskId,
              url: output.model || output.glb_file,
              thumbnailUrl: output.thumbnail || '',
              format: 'glb' as const,
              vertices: 5000,
              textures: ['diffuse', 'normal', 'roughness'],
              isRigged: false,
              provider: 'tripo',
              prompt: prompt,
              createdAt: Date.now(),
              downloadUrl: output.model || output.glb_file
            };
          } else if (statusData.data.status === 'failed') {
            throw new Error('Tripo generation failed');
          }

          const progress = statusData.data.progress || 50;
          onProgress?.({
            status: 'processing',
            progress,
            message: `Generating... ${progress}%`
          });

          await sleep(2000); // Poll every 2 seconds
        }
    }, RetryPresets.slow, 'tripo').catch(error => {
      onProgress?.({ 
        status: 'error', 
        progress: 0, 
        message: 'Tripo generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    });
  },

  /**
   * Generate 3D model from image
   * Tripo excels at image-to-3D (faster than Meshy)
   */
  async generateFromImage(
    imageUrl: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    return executeWithRetry(async () => {
        onProgress?.({ status: 'queued', progress: 5, message: 'Submitting to Tripo AI...' });

        // Step 1: Create task
        const createResponse = await proxyFetch('tripo', 'task', {
          method: 'POST',
          body: JSON.stringify({
            type: 'image_to_model',
            image_url: imageUrl,
            quality: 'high'
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(`Tripo API error: ${errorData.error || createResponse.statusText}`);
        }

        const createData = await createResponse.json();
        const taskId = createData.data.task_id;

        // Step 2: Poll for completion
        onProgress?.({ status: 'processing', progress: 20, message: 'Processing image...' });

        while (true) {
          const statusResponse = await proxyFetch('tripo', `task/${taskId}`);

          if (!statusResponse.ok) {
            const errorData = await statusResponse.json().catch(() => ({}));
            throw new Error(`Tripo API error: ${errorData.error || statusResponse.statusText}`);
          }

          const statusData = await statusResponse.json();
          
          if (statusData.data.status === 'success') {
            onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

            const output = statusData.data.output;

            return {
              id: taskId,
              url: output.model || output.glb_file,
              thumbnailUrl: output.thumbnail || '',
              format: 'glb' as const,
              vertices: 5000,
              textures: ['diffuse', 'normal', 'roughness'],
              isRigged: false,
              provider: 'tripo',
              prompt: 'Image upload',
              createdAt: Date.now(),
              downloadUrl: output.model || output.glb_file
            };
          } else if (statusData.data.status === 'failed') {
            throw new Error('Tripo generation failed');
          }

          const progress = statusData.data.progress || 50;
          onProgress?.({
            status: 'processing',
            progress,
            message: `Processing... ${progress}%`
          });

          await sleep(2000);
        }
    }, RetryPresets.slow, 'tripo').catch(error => {
      onProgress?.({ 
        status: 'error', 
        progress: 0, 
        message: 'Tripo generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    });
  }
};

/**
 * Meshy AI API Integration
 */
const meshyAPI = {
  /**
   * Generate 3D model from text prompt
   */
  async generateFromText(
    prompt: string, 
    style: string = 'cartoon',
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    // Step 1: Create task
    const createResponse = await executeWithRetry(() => proxyFetch('meshy', 'text-to-3d', {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt,
        style: style,
        format: 'glb',
        enable_pbr: true,
        enable_rig: false
      })
    }), RetryPresets.standard, 'meshy');

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(`Meshy API error: ${errorData.error || createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // Step 2: Poll for completion
    onProgress?.({ status: 'processing', progress: 10, message: 'Generating 3D model...' });

    while (true) {
      const statusResponse = await executeWithRetry(() => proxyFetch('meshy', `tasks/${taskId}`), RetryPresets.standard, 'meshy');

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({}));
        throw new Error(`Meshy API error: ${errorData.error || statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });
        
        return {
          id: taskId,
          url: statusData.output.model,
          thumbnailUrl: statusData.output.thumbnail || '',
          format: 'glb' as const,
          vertices: statusData.output.vertex_count || 5000,
          textures: ['diffuse', 'normal', 'roughness', 'metallic'],
          isRigged: false,
          provider: 'meshy',
          prompt: prompt,
          createdAt: Date.now()
        };
      } else if (statusData.status === 'failed') {
        throw new Error('Meshy generation failed');
      }

      onProgress?.({ 
        status: 'processing', 
        progress: statusData.progress || 50, 
        message: `Generating... ${statusData.progress || 50}%` 
      });

      await sleep(3000); // Poll every 3 seconds
    }
  },

  /**
   * Generate 3D model from image
   */
  async generateFromImage(
    imageUrl: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    // Step 1: Create task
    const createResponse = await executeWithRetry(() => proxyFetch('meshy', 'image-to-3d', {
      method: 'POST',
      body: JSON.stringify({
        image_url: imageUrl,
        format: 'glb',
        enable_pbr: true,
        enable_rig: false
      })
    }), RetryPresets.standard, 'meshy');

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(`Meshy API error: ${errorData.error || createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // Step 2: Poll for completion
    onProgress?.({ status: 'processing', progress: 10, message: 'Processing image...' });

    while (true) {
      const statusResponse = await executeWithRetry(() => proxyFetch('meshy', `tasks/${taskId}`), RetryPresets.standard, 'meshy');

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({}));
        throw new Error(`Meshy API error: ${errorData.error || statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });
        
        return {
          id: taskId,
          url: statusData.output.model,
          thumbnailUrl: statusData.output.thumbnail || '',
          format: 'glb' as const,
          vertices: statusData.output.vertex_count || 5000,
          textures: ['diffuse', 'normal', 'roughness', 'metallic'],
          isRigged: false,
          provider: 'meshy',
          prompt: 'Image upload',
          createdAt: Date.now()
        };
      } else if (statusData.status === 'failed') {
        throw new Error('Meshy generation failed');
      }

      onProgress?.({ 
        status: 'processing', 
        progress: statusData.progress || 50, 
        message: `Processing... ${statusData.progress || 50}%` 
      });

      await sleep(3000);
    }
  },

  /**
   * Auto-rig a character model
   */
  async autoRig(modelUrl: string): Promise<Generated3DAsset> {
    const response = await executeWithRetry(() => proxyFetch('meshy', 'rig', {
      method: 'POST',
      body: JSON.stringify({
        model_url: modelUrl,
        format: 'glb'
      })
    }), RetryPresets.standard, 'meshy');

    if (!response.ok) {
      throw new Error('Rigging failed');
    }

    const data = await response.json();

    return {
      id: data.id,
      url: data.output.model,
      thumbnailUrl: data.output.thumbnail || '',
      format: 'glb' as const,
      vertices: 5000,
      textures: ['diffuse'],
      isRigged: true,
      animations: ['idle', 'walk', 'run', 'jump'],
      provider: 'meshy',
      prompt: 'Auto-rigged character',
      createdAt: Date.now()
    };
  }
};

/**
 * Get user's AI generation quota
 */
export const getGenerationQuota = (): {
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  plan: 'free' | 'maker' | 'inventor';
} => {
  // In production, this would fetch from user's account
  return {
    used: 3,
    limit: 10,
    remaining: 7,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    plan: 'free'
  };
};

/**
 * Purchase additional generations
 */
export const purchaseGenerations = async (count: number): Promise<void> => {
  // In production, this would process payment
};
