/**
 * AI Service Wrapper with Retry Logic and Error Handling
 * 
 * Provides robust error handling, retry mechanisms, and fallback providers
 * for all AI service calls (Meshy, Tripo, Luma, Meta AI, etc.)
 * 
 * Features:
 * - Exponential backoff retry logic
 * - Multiple provider fallback
 * - Progress tracking
 * - Timeout handling
 * - Error classification (retryable vs non-retryable)
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  timeout?: number; // ms
}

export interface GenerationProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  eta?: number; // seconds
  result?: unknown;
}

export interface AIErrorOptions {
  code?: string;
  provider?: string;
  retryable?: boolean;
  status?: number;
}

/**
 * AI Error Class with metadata
 */
export class AIError extends Error {
  code: string;
  provider: string;
  retryable: boolean;
  status?: number;

  constructor(
    message: string,
    options: AIErrorOptions = {}
  ) {
    super(message);
    this.name = 'AIError';
    this.code = options.code || 'UNKNOWN';
    this.provider = options.provider || 'unknown';
    this.retryable = options.retryable ?? true;
    this.status = options.status;
  }

  static fromError(error: unknown, provider: string): AIError {
    const isRetryable = classifyError(error);
    const err = error as Record<string, unknown>;
    
    return new AIError(
      (typeof err.message === 'string' ? err.message : null) || 'Unknown AI error',
      {
        code: (typeof err.code === 'string' ? err.code : null) || (typeof err.type === 'string' ? err.type : null) || 'UNKNOWN',
        provider,
        retryable: isRetryable,
        status: typeof err.status === 'number' ? err.status : undefined
      }
    );
  }
}

/**
 * Classify if an error is retryable
 */
const classifyError = (error: unknown): boolean => {
  if (!error) return false;
  
  const err = error as Record<string, unknown>;
  
  // Network errors are retryable
  if (typeof err.message === 'string' && (err.message.includes('network') || 
      err.message.includes('fetch') ||
      err.message.includes('ETIMEDOUT'))) {
    return true;
  }
  
  // Rate limits are retryable (with longer delay)
  if (err.status === 429 || 
      err.code === 'RATE_LIMIT_EXCEEDED' ||
      (typeof err.message === 'string' && err.message.includes('rate limit'))) {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (typeof err.status === 'number' && err.status >= 500 && err.status < 600) {
    return true;
  }
  
  // Timeout errors are retryable
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    return true;
  }
  
  // Client errors (4xx except 429) are NOT retryable
  if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
    return false;
  }
  
  // Default: retryable
  return true;
};

/**
 * Exponential backoff delay calculator
 */
const calculateBackoffDelay = (
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a function with retry logic and exponential backoff
 */
export const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  provider: string = 'unknown'
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 300000
  } = config;

  const errors: AIError[] = [];
  const startTime = Date.now();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new AIError('Operation timed out', {
          code: 'TIMEOUT',
          provider,
          retryable: false
        });
      }

      const result = await fn();
      return result;
    } catch (error: unknown) {
      const aiError = AIError.fromError(error, provider);
      errors.push(aiError);

      // Don't retry non-retryable errors
      if (!aiError.retryable) {
        throw aiError;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries - 1) {
        break;
      }

      // Wait before retry with exponential backoff
      const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay);
      await sleep(delay);
    }
  }

  // All attempts failed
  throw new AggregateAIError(errors, 'All retry attempts failed');
};

/**
 * Execute multiple providers with fallback
 */
export const executeWithFallback = async <T>(
  providers: Array<{ name: string; fn: () => Promise<T> }>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const errors: AIError[] = [];

  for (const provider of providers) {
    try {
      return await executeWithRetry(provider.fn, config, provider.name);
    } catch (error: unknown) {
      const aiError = error instanceof AIError ? error : AIError.fromError(error, provider.name);
      errors.push(aiError);

      // Continue to next provider if this was retryable
      if (aiError.retryable) {
        continue;
      }

      // Non-retryable error, throw immediately
      throw aiError;
    }
  }

  // All providers failed
  throw new AggregateAIError(errors, 'All providers failed');
};

/**
 * Poll an async operation with progress tracking
 */
export const pollWithProgress = async <T>(
  submitFn: () => Promise<{ id: string }>,
  pollFn: (id: string) => Promise<{
    status: string;
    progress?: number;
    result?: T;
    error?: string;
  }>,
  onProgress: (progress: GenerationProgress) => void,
  config: {
    pollInterval?: number;
    timeout?: number;
  } = {}
): Promise<T> => {
  const {
    pollInterval = 2000,
    timeout = 300000 // 5 minutes
  } = config;

  const startTime = Date.now();
  const { id } = await submitFn();

  onProgress({
    status: 'pending',
    progress: 0,
    message: 'Starting generation...'
  });

  while (true) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      throw new AIError('Generation timed out', {
        code: 'TIMEOUT',
        retryable: false
      });
    }

    const result = await pollFn(id);

    if (result.status === 'completed' || result.status === 'succeeded') {
      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Generation complete!',
        result: result.result
      });
      return result.result!;
    }

    if (result.status === 'failed' || result.status === 'error') {
      throw new AIError(result.error || 'Generation failed', {
        code: 'GENERATION_FAILED',
        retryable: false
      });
    }

    // Calculate progress and ETA
    const progress = result.progress || 0;
    const elapsed = (Date.now() - startTime) / 1000;
    const eta = progress > 0 ? ((elapsed / progress) * (100 - progress)) / 60 : undefined;

    onProgress({
      status: 'processing',
      progress,
      message: `Generating... ${Math.round(progress)}%`,
      eta: eta ? Math.round(eta) : undefined
    });

    await sleep(pollInterval);
  }
};

/**
 * Aggregate AI Error for multiple failures
 */
export class AggregateAIError extends Error {
  errors: AIError[];
  providerErrors: Record<string, AIError[]>;

  constructor(errors: AIError[], message: string) {
    super(message);
    this.name = 'AggregateAIError';
    this.errors = errors;
    
    // Group by provider
    this.providerErrors = errors.reduce((acc, error) => {
      if (!acc[error.provider]) {
        acc[error.provider] = [];
      }
      acc[error.provider].push(error);
      return acc;
    }, {} as Record<string, AIError[]>);
  }

  getSummary(): string {
    const lines: string[] = [this.message];
    
    Object.entries(this.providerErrors).forEach(([provider, errors]) => {
      lines.push(`\n${provider}:`);
      errors.forEach(error => {
        lines.push(`  - ${error.code}: ${error.message}`);
      });
    });
    
    return lines.join('\n');
  }
}

/**
 * Create a retry wrapper for AI service functions
 */
export const createRetryableAI = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  provider: string,
  config: Partial<RetryConfig> = {}
) => {
  return async (...args: T): Promise<R> => {
    return executeWithRetry(() => fn(...args), config, provider);
  };
};

/**
 * Higher-order function to add progress tracking
 */
export const withProgress = <T>(
  fn: (onProgress: (progress: number, message: string) => void) => Promise<T>,
  onProgress?: (progress: number, message: string) => void
): Promise<T> => {
  const wrappedProgress = onProgress || (() => {});
  
  return fn((progress, message) => {
    wrappedProgress(progress, message);
  });
};

/**
 * Utility to check API key availability
 */
export const checkAPIKey = (keyName: string): boolean => {
  const key = import.meta.env[keyName];
  return !!key && key !== 'your_api_key_here' && key.length > 10;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof AIError) {
    switch (error.code) {
      case 'TIMEOUT':
        return '⏱️ The request took too long. Please try again.';
      case 'RATE_LIMIT_EXCEEDED':
        return '🚦 Rate limit reached. Please wait a moment and try again.';
      case 'AUTHENTICATION_FAILED':
        return '🔑 API key is invalid. Please check your settings.';
      case 'QUOTA_EXCEEDED':
        return '📊 Quota exceeded. Please upgrade your plan.';
      case 'GENERATION_FAILED':
        return '❌ Generation failed. Please try again.';
      default:
        return `⚠️ ${error.message}`;
    }
  }

  const err = error as Record<string, unknown>;
  if (typeof err.message === 'string' && err.message.includes('network')) {
    return '🌐 Network error. Please check your internet connection.';
  }

  return '😕 Something went wrong. Please try again.';
};

/**
 * Default retry configurations
 */
export const RetryPresets = {
  // Quick operations (text generation, etc.)
  quick: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 3000,
    timeout: 30000
  },

  // Standard operations (image generation)
  standard: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    timeout: 120000
  },

  // Slow operations (3D model generation)
  slow: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 10000,
    timeout: 300000
  },

  // Very slow operations (video generation)
  verySlow: {
    maxRetries: 2,
    baseDelay: 5000,
    maxDelay: 15000,
    timeout: 600000
  }
};
