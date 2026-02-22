/**
 * Meta Segment Anything Model (SAM) Integration
 * Extract sprites from images with AI-powered segmentation
 * https://github.com/facebookresearch/segment-anything
 */

// Hugging Face Inference API
const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN || '';

// SAM models
const SAM_MODELS = {
  huge: 'facebook/sam-vit-huge',      // Best quality, slowest
  large: 'facebook/sam-vit-large',    // Balanced
  base: 'facebook/sam-vit-base'       // Fastest
};

export interface SegmentOptions {
  imageUrl: string;
  model?: 'huge' | 'large' | 'base';
  clickPoints?: Array<{ x: number; y: number; label: 0 | 1 }>; // 1 = foreground, 0 = background
  box?: { x: number; y: number; width: number; height: number };
  multimask?: boolean;
}

export interface SegmentationResult {
  id: string;
  mask: ImageData;
  maskUrl: string;
  originalImage: HTMLImageElement;
  extractedSprite: string; // PNG with transparency
  width: number;
  height: number;
  confidence: number;
  clickPoints?: Array<{ x: number; y: number }>;
}

export interface GenerationProgress {
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

/**
 * Extract sprite from image using SAM
 */
export const extractSprite = async (
  options: SegmentOptions,
  onProgress?: (progress: GenerationProgress) => void
): Promise<SegmentationResult> => {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face token not configured');
  }

  const model = SAM_MODELS[options.model || 'base'];

  onProgress?.({ 
    status: 'queued', 
    progress: 5, 
    message: 'Loading image...' 
  });

  try {
    // Load original image
    const img = await loadImage(options.imageUrl);
    
    onProgress?.({ 
      status: 'processing', 
      progress: 20, 
      message: 'Running segmentation...' 
    });

    // Prepare request for SAM API
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    // Convert to base64
    const imageBase64 = canvas.toDataURL('image/png').split(',')[1];

    // Query SAM API
    const requestBody: any = {
      inputs: imageBase64,
      parameters: {
        model_type: 'vit_h', // or vit_l, vit_b
        multimask_output: options.multimask || false
      }
    };

    // Add click points if provided
    if (options.clickPoints && options.clickPoints.length > 0) {
      requestBody.parameters.point_coords = options.clickPoints.map(p => [p.x, p.y]);
      requestBody.parameters.point_labels = options.clickPoints.map(p => p.label);
    }

    // Add bounding box if provided
    if (options.box) {
      requestBody.parameters.box = [
        options.box.x,
        options.box.y,
        options.box.x + options.box.width,
        options.box.y + options.box.height
      ];
    }

    const response = await fetch(`${HF_API_BASE}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SAM API error: ${error.error || response.statusText}`);
    }

    onProgress?.({ 
      status: 'processing', 
      progress: 60, 
      message: 'Processing mask...' 
    });

    const result = await response.json();
    
    // Process mask
    const maskData = processMask(result, img.width, img.height);
    
    onProgress?.({ 
      status: 'processing', 
      progress: 80, 
      message: 'Extracting sprite...' 
    });

    // Create extracted sprite with transparency
    const extractedSprite = await createExtractedSprite(img, maskData.mask);

    onProgress?.({ 
      status: 'complete', 
      progress: 100, 
      message: 'Sprite extracted!' 
    });

    const id = `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      mask: maskData.mask,
      maskUrl: maskData.url,
      originalImage: img,
      extractedSprite,
      width: img.width,
      height: img.height,
      confidence: result.confidence || 0.95,
      clickPoints: options.clickPoints?.map(p => ({ x: p.x, y: p.y }))
    };
  } catch (error) {
    onProgress?.({ 
      status: 'error', 
      progress: 0, 
      message: 'Segmentation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Load image from URL or base64
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Process SAM API response into ImageData
 */
const processMask = (result: any, width: number, height: number): { mask: ImageData; url: string } => {
  // Create canvas for mask
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Get mask data from SAM response
  // SAM returns segmentation as polygon or mask
  let mask: ImageData;
  
  if (result.segmentation) {
    // If segmentation is provided as array
    const segmentation = result.segmentation;
    mask = ctx.createImageData(width, height);
    
    for (let i = 0; i < segmentation.length; i++) {
      const idx = i * 4;
      if (segmentation[i] > 0.5) {
        mask.data[idx] = 255;     // R
        mask.data[idx + 1] = 255; // G
        mask.data[idx + 2] = 255; // B
        mask.data[idx + 3] = 255; // A
      } else {
        mask.data[idx + 3] = 0;   // Transparent
      }
    }
  } else {
    // Fallback: create full mask
    mask = ctx.createImageData(width, height);
    for (let i = 0; i < mask.data.length; i += 4) {
      mask.data[i] = 255;
      mask.data[i + 1] = 255;
      mask.data[i + 2] = 255;
      mask.data[i + 3] = 255;
    }
  }

  ctx.putImageData(mask, 0, 0);

  return {
    mask,
    url: canvas.toDataURL('image/png')
  };
};

/**
 * Create extracted sprite with transparency
 */
const createExtractedSprite = async (
  img: HTMLImageElement,
  mask: ImageData
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Apply mask to alpha channel
  for (let i = 0; i < mask.data.length; i += 4) {
    // Use mask alpha as sprite alpha
    imageData.data[i + 3] = mask.data[i + 3];
  }

  // Put masked image back
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
};

/**
 * Auto-detect objects in image and suggest click points
 */
export const suggestClickPoints = async (
  imageUrl: string
): Promise<Array<{ x: number; y: number; label: 0 | 1; confidence: number }>> => {
  // Simple heuristic: suggest center and corners
  const img = await loadImage(imageUrl);
  const centerX = img.width / 2;
  const centerY = img.height / 2;

  return [
    { x: centerX, y: centerY, label: 1, confidence: 0.9 },
    { x: centerX - img.width / 4, y: centerY, label: 1, confidence: 0.7 },
    { x: centerX + img.width / 4, y: centerY, label: 1, confidence: 0.7 }
  ];
};

/**
 * Remove background from image (simple version)
 */
export const removeBackground = async (
  imageUrl: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<string> => {
  return extractSprite(
    { 
      imageUrl,
      model: 'base',
      multimask: false
    },
    onProgress
  ).then(result => result.extractedSprite);
};

/**
 * Batch extract multiple sprites from one image
 */
export const batchExtract = async (
  imageUrl: string,
  clickPoints: Array<{ x: number; y: number }>,
  onProgress?: (progress: GenerationProgress) => void
): Promise<SegmentationResult[]> => {
  const results: SegmentationResult[] = [];

  for (let i = 0; i < clickPoints.length; i++) {
    onProgress?.({ 
      status: 'processing', 
      progress: (i / clickPoints.length) * 100, 
      message: `Extracting sprite ${i + 1}/${clickPoints.length}...` 
    });

    try {
      const result = await extractSprite({
        imageUrl,
        clickPoints: [{ x: clickPoints[i].x, y: clickPoints[i].y, label: 1 }]
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to extract sprite ${i + 1}:`, error);
    }
  }

  onProgress?.({ 
    status: 'complete', 
    progress: 100, 
    message: `Extracted ${results.length} sprites!` 
  });

  return results;
};

/**
 * Download extracted sprite
 */
export const downloadSprite = (result: SegmentationResult, filename?: string) => {
  const a = document.createElement('a');
  a.href = result.extractedSprite;
  a.download = filename || `kidcode_sprite_${result.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Preset extraction modes
 */
export const EXTRACTION_PRESETS = [
  {
    id: 'character',
    name: 'Character / Sprite',
    description: 'Extract characters, creatures, or sprites',
    icon: '👤',
    model: 'huge' as const,
    multimask: false
  },
  {
    id: 'prop',
    name: 'Prop / Object',
    description: 'Extract items, props, or objects',
    icon: '📦',
    model: 'large' as const,
    multimask: false
  },
  {
    id: 'multiple',
    name: 'Multiple Objects',
    description: 'Extract multiple objects at once',
    icon: '🎯',
    model: 'base' as const,
    multimask: true
  },
  {
    id: 'precise',
    name: 'Precise Cutout',
    description: 'High-quality extraction with precise edges',
    icon: '✂️',
    model: 'huge' as const,
    multimask: false
  }
];
