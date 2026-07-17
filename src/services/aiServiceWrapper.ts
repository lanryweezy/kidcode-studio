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

// ─── Item 7: Rate Limiting ───

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_PER_MINUTE = 10;
const RATE_LIMIT_PER_HOUR = 50;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const getRateLimitKey = (userId: string, endpoint: string): string => {
  return `${userId}:${endpoint}`;
};

const pruneTimestamps = (timestamps: number[], windowMs: number): number[] => {
  const now = Date.now();
  return timestamps.filter((t) => now - t < windowMs);
};

export const checkRateLimit = (
  userId: string,
  endpoint: string
): { allowed: boolean; retryAfterMs?: number } => {
  const key = getRateLimitKey(userId, endpoint);
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  entry.timestamps = pruneTimestamps(entry.timestamps, HOUR_MS);

  const perMinute = pruneTimestamps(entry.timestamps, MINUTE_MS);
  if (perMinute.length >= RATE_LIMIT_PER_MINUTE) {
    const oldestInWindow = Math.min(...perMinute);
    const retryAfterMs = MINUTE_MS - (Date.now() - oldestInWindow);
    return { allowed: false, retryAfterMs };
  }

  const perHour = entry.timestamps;
  if (perHour.length >= RATE_LIMIT_PER_HOUR) {
    const oldestInWindow = Math.min(...perHour);
    const retryAfterMs = HOUR_MS - (Date.now() - oldestInWindow);
    return { allowed: false, retryAfterMs };
  }

  return { allowed: true };
};

export const recordAIRequest = (userId: string, endpoint: string): void => {
  const key = getRateLimitKey(userId, endpoint);
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }
  entry.timestamps.push(Date.now());
};

export const getRateLimitInfo = (
  userId: string,
  endpoint: string
): { requestsThisMinute: number; requestsThisHour: number } => {
  const key = getRateLimitKey(userId, endpoint);
  const entry = rateLimitStore.get(key);
  if (!entry) return { requestsThisMinute: 0, requestsThisHour: 0 };

  const perMinute = pruneTimestamps(entry.timestamps, MINUTE_MS);
  const perHour = pruneTimestamps(entry.timestamps, HOUR_MS);
  return { requestsThisMinute: perMinute.length, requestsThisHour: perHour.length };
};

export const executeWithRateLimit = async <T>(
  userId: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> => {
  const check = checkRateLimit(userId, endpoint);
  if (!check.allowed) {
    const waitSeconds = Math.ceil((check.retryAfterMs || 0) / 1000);
    throw new AIError(
      `Rate limit exceeded. Please try again in ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''}.`,
      {
        code: 'RATE_LIMIT_EXCEEDED',
        provider: endpoint,
        retryable: true,
      }
    );
  }

  recordAIRequest(userId, endpoint);
  return fn();
};

// ─── Item 87: Content Moderation ───

type FilterCategory = 'violence' | 'profanity' | 'inappropriate' | 'drugs' | 'weapons' | 'harmful' | 'security';

interface BlockedPattern {
  pattern: RegExp;
  category: FilterCategory;
  reason: string;
}

const BLOCKED_PATTERNS: BlockedPattern[] = [
  // Violence
  { pattern: /\b(kill|murder|assassin|slaughter|butcher)\b/i, category: 'violence', reason: 'This involves violence. Try something more creative!' },
  { pattern: /\b(death|dead|die|dying|corpse|murderer)\b/i, category: 'violence', reason: 'This is too violent. Let\'s create something fun instead!' },
  { pattern: /\b(fight|battle|war|combat|struggle|beat up|punch|kick)\b/i, category: 'violence', reason: 'Violence isn\'t allowed. How about a peaceful game?' },
  { pattern: /\b(blood|bleed|gore|wound|injury|hurt|pain|suffer)\b/i, category: 'violence', reason: 'This is too graphic. Let\'s keep it kid-friendly!' },
  { pattern: /\b(torture|abuse|bully|torment|cruelty)\b/i, category: 'violence', reason: 'This involves harm. Let\'s create something positive!' },
  { pattern: /\b(explosive|detonate|blow up|terrorist|terrorism)\b/i, category: 'violence', reason: 'This is not allowed. Let\'s try a different idea!' },

  // Profanity
  { pattern: /\b(damn|hell|crap|stupid|idiot|dumb|loser)\b/i, category: 'profanity', reason: 'Let\'s use kind words instead!' },
  { pattern: /\b(shut up|shutup|go away|get lost)\b/i, category: 'profanity', reason: 'Let\'s be nice to each other!' },
  { pattern: /\b(f+u+c+k|f+u+k|f+u+c+).*\b/i, category: 'profanity', reason: 'That word isn\'t allowed. Try something else!' },
  { pattern: /\b(s+h+i+t|s+h+i+t+)\b/i, category: 'profanity', reason: 'Let\'s keep our language clean!' },
  { pattern: /\b(a+s+s+h+o+l+e|a+s+s|h+o+l+)\b/i, category: 'profanity', reason: 'That\'s not a nice word. Let\'s be kind!' },
  { pattern: /\b(b+i+t+c+h|b+i+t+c+)\b/i, category: 'profanity', reason: 'That word isn\'t appropriate. Let\'s try again!' },
  { pattern: /\b(f+u+c+k+.*\w+|w+o+r+d+.*f+u+c+k+)\b/i, category: 'profanity', reason: 'That\'s not allowed. Please use different words!' },

  // Inappropriate content
  { pattern: /\b(sex|sexual|nude|naked|porn|xxx|adult|nsfw)\b/i, category: 'inappropriate', reason: 'This is not appropriate for kids. Try a different topic!' },
  { pattern: /\b(gay|lesbian|bisexual|transgender|queer|homo)\b/i, category: 'inappropriate', reason: 'Let\'s keep our content family-friendly!' },
  { pattern: /\b(boyfriend|girlfriend|kiss|date|romance|love)\b/i, category: 'inappropriate', reason: 'This isn\'t appropriate for this app. Let\'s focus on coding!' },
  { pattern: /\b(dick|cock|penis|vagina|boob|breast|butt)\b/i, category: 'inappropriate', reason: 'That\'s not appropriate. Let\'s try something else!' },
  { pattern: /\b(strip|stripper|prostitute|escort)\b/i, category: 'inappropriate', reason: 'This is not appropriate content. Let\'s create something fun!' },

  // Drugs
  { pattern: /\b(drug|weed|cocaine|heroin|meth|methamphetamine|ecstasy|lsd|acid)\b/i, category: 'drugs', reason: 'Drugs are not allowed. Stay healthy and creative!' },
  { pattern: /\b(alcohol|beer|wine|vodka|whiskey|drunk|intoxicated)\b/i, category: 'drugs', reason: 'Alcohol content isn\'t appropriate for kids!' },
  { pattern: /\b(smoke|smoking|cigarette|tobacco|vape|vaping)\b/i, category: 'drugs', reason: 'Smoking isn\'t allowed. Let\'s focus on healthy activities!' },
  { pattern: /\b(get high|high on|stoned|wasted)\b/i, category: 'drugs', reason: 'This is not appropriate. Let\'s try a different idea!' },

  // Weapons
  { pattern: /\b(gun|rifle|shotgun|pistol|revolver|weapon|firearm)\b/i, category: 'weapons', reason: 'Weapons are not allowed. Let\'s create something peaceful!' },
  { pattern: /\b(knife|blade|sword|dagger|axe|machete)\b/i, category: 'weapons', reason: 'Sharp weapons aren\'t appropriate. Try a different idea!' },
  { pattern: /\b(bomb|grenade|missile|rocket|explosive|tnt|dynamite)\b/i, category: 'weapons', reason: 'Explosives are not allowed. Let\'s be creative instead!' },
  { pattern: /\b(ammunition|bullet|ammo|magazine)\b/i, category: 'weapons', reason: 'This isn\'t appropriate. Let\'s try something else!' },

  // Harmful behavior
  { pattern: /\b(suicide|kill yourself|end it|self-harm|cut yourself)\b/i, category: 'harmful', reason: 'If you\'re feeling down, please talk to a trusted adult. You\'re not alone!' },
  { pattern: /\b(hate|hate speech|racist|sexist|bigot)\b/i, category: 'harmful', reason: 'Hate speech is not allowed. Let\'s spread kindness!' },
  { pattern: /\b(hack|phish|exploit|malware|ransomware|virus)\b/i, category: 'harmful', reason: 'Hacking is not allowed. Let\'s code responsibly!' },
  { pattern: /\b(steal|theft|rob|robbery|fraud|scam)\b/i, category: 'harmful', reason: 'Illegal activities are not allowed. Let\'s create something positive!' },

  // Security
  { pattern: /\b(password|passwd|credentials|token|secret key)\b/i, category: 'security', reason: 'Never share passwords or secrets!' },
  { pattern: /\b(api key|private key|access token|auth)\b/i, category: 'security', reason: 'Keep your keys private and safe!' },
];

const KID_FRIENDLY_MESSAGES: Record<FilterCategory, string> = {
  violence: '暴力内容不被允许。让我们创建有趣的东西吧！',
  profanity: '让我们使用友善的语言！',
  inappropriate: '这不适合小朋友。让我们专注于学习和创造！',
  drugs: '药物内容不适合孩子。让我们保持健康！',
  weapons: '武器不被允许。让我们创建和平的内容！',
  harmful: '如果需要帮助，请告诉信任的大人。你并不孤单！',
  security: '保护你的私人信息很重要！',
};

const BLOCKED_RESPONSE = "This prompt can't be used. Please try a different idea!";

interface ContentFilterResult {
  safe: boolean;
  reason?: string;
  category?: FilterCategory;
  originalText: string;
}

const blockedAttemptsLog: Array<{
  timestamp: number;
  text: string;
  category: FilterCategory;
  reason: string;
}> = [];

const MAX_LOG_SIZE = 1000;

export const classifyPrompt = (prompt: string): ContentFilterResult => {
  const normalized = prompt.toLowerCase().trim();
  if (normalized.length === 0) {
    return { safe: false, reason: 'Empty prompt', originalText: prompt };
  }

  for (const entry of BLOCKED_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      const result: ContentFilterResult = {
        safe: false,
        reason: entry.reason,
        category: entry.category,
        originalText: prompt,
      };

      blockedAttemptsLog.push({
        timestamp: Date.now(),
        text: prompt,
        category: entry.category,
        reason: entry.reason,
      });

      if (blockedAttemptsLog.length > MAX_LOG_SIZE) {
        blockedAttemptsLog.splice(0, blockedAttemptsLog.length - MAX_LOG_SIZE);
      }

      return result;
    }
  }

  return { safe: true, originalText: prompt };
};

export const moderatePrompt = (prompt: string): string | null => {
  const result = classifyPrompt(prompt);
  return result.safe ? null : (result.reason || BLOCKED_RESPONSE);
};

export const moderateResponse = (response: string): ContentFilterResult => {
  return classifyPrompt(response);
};

export const getBlockedAttemptsLog = (): Array<{
  timestamp: number;
  text: string;
  category: FilterCategory;
  reason: string;
}> => {
  return [...blockedAttemptsLog];
};

export const clearBlockedAttemptsLog = (): void => {
  blockedAttemptsLog.length = 0;
};

// ─── Item 90: In-Memory Cache ───

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

const aiCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const hashPrompt = (prompt: string, provider: string): string => {
  let hash = 0;
  const str = `${provider}:${prompt}`;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `ai_cache_${hash}`;
};

export const getCachedResult = <T>(prompt: string, provider: string): T | null => {
  const key = hashPrompt(prompt, provider);
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    aiCache.delete(key);
    return null;
  }
  return entry.value as T;
};

export const setCachedResult = <T>(prompt: string, provider: string, value: T): void => {
  const key = hashPrompt(prompt, provider);
  aiCache.set(key, { value, timestamp: Date.now() });
};

export const clearAICache = (): void => {
  aiCache.clear();
};

export const getAICacheSize = (): number => {
  return aiCache.size;
};

// Combined: moderate + cache-aware wrapper
export const cachedAndModeratedCall = async <T>(
  prompt: string,
  provider: string,
  fn: () => Promise<T>,
  moderateResponseFn?: (response: T) => ContentFilterResult
): Promise<T> => {
  const moderationResult = moderatePrompt(prompt);
  if (moderationResult) {
    throw new AIError(moderationResult, {
      code: 'CONTENT_MODERATED',
      provider,
      retryable: false,
    });
  }

  const cached = getCachedResult<T>(prompt, provider);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();

  if (moderateResponseFn) {
    const responseCheck = moderateResponseFn(result);
    if (!responseCheck.safe) {
      throw new AIError(responseCheck.reason || BLOCKED_RESPONSE, {
        code: 'CONTENT_MODERATED',
        provider,
        retryable: false,
      });
    }
  }

  setCachedResult(prompt, provider, result);
  return result;
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

// ─── Item 86: AI Code Explanation ───

interface ExplanationBlock {
  type: string;
  params?: Record<string, unknown>;
}

const BLOCK_DESCRIPTIONS: Record<string, (params: Record<string, unknown>) => string> = {
  MOVE_X: (p) => {
    const val = typeof p.value === 'number' ? p.value : 0;
    if (val > 0) return `Move the character ${val} pixels to the right`;
    if (val < 0) return `Move the character ${Math.abs(val)} pixels to the left`;
    return `Move the character horizontally`;
  },
  MOVE_Y: (p) => {
    const val = typeof p.value === 'number' ? p.value : 0;
    if (val > 0) return `Move the character ${val} pixels up`;
    if (val < 0) return `Move the character ${Math.abs(val)} pixels down`;
    return `Move the character vertically`;
  },
  JUMP: (p) => {
    const val = typeof p.value === 'number' ? p.value : 10;
    return `Make the character jump with force ${val}`;
  },
  WAIT: (p) => {
    const val = typeof p.value === 'number' ? p.value : 1;
    return `Wait for ${val} second${val !== 1 ? 's' : ''}`;
  },
  REPEAT: (p) => {
    const val = typeof p.value === 'number' ? p.value : 3;
    return `Repeat the following ${val} times`;
  },
  FOREVER: () => `Repeat the following forever in a loop`,
  END_REPEAT: () => `End of repeat loop`,
  END_FOREVER: () => `End of forever loop`,
  IF: (p) => `Check condition: ${p.condition || 'true'} and do the following if met`,
  ELSE: () => `Otherwise, do the following instead`,
  END_IF: () => `End of if-check`,
  SET_VAR: (p) => `Set variable "${p.varName || 'x'}" to ${p.value ?? 'value'}`,
  CHANGE_VAR: (p) => `Change variable "${p.varName || 'x'}" by ${p.value ?? 1}`,
  TURN_RIGHT: (p) => `Turn right by ${typeof p.value === 'number' ? p.value : 15} degrees`,
  TURN_LEFT: (p) => `Turn left by ${typeof p.value === 'number' ? p.value : 15} degrees`,
  GO_TO_XY: (p) => `Move to position (${p.x ?? 0}, ${p.y ?? 0})`,
  GLIDE_TO_XY: (p) => `Glide smoothly to position (${p.x ?? 0}, ${p.y ?? 0})`,
  SET_SIZE: (p) => `Set the sprite size to ${typeof p.value === 'number' ? p.value : 100}%`,
  SAY: (p) => `Display speech bubble saying "${p.text || 'Hello'}"`,
  THINK: (p) => `Display thought bubble saying "${p.text || 'Hmm'}"`,
  SHOW: () => `Make the sprite visible`,
  HIDE: () => `Make the sprite invisible`,
  SET_EMOJI: (p) => `Change the character's appearance to ${p.text || '😊'}`,
  SET_GRAVITY: (p) => `Set gravity force to ${typeof p.value === 'number' ? p.value : 1}`,
  SPAWN_ENEMY: (p) => `Spawn an enemy at (${p.x ?? 0}, ${p.y ?? 0})`,
  SPAWN_ITEM: (p) => `Spawn an item at (${p.x ?? 0}, ${p.y ?? 0})`,
  ADD_PLATFORM: (p) => `Add a platform at (${p.x ?? 0}, ${p.y ?? 0})`,
  SHOOT: () => `Fire a projectile`,
  SET_SCENE: (p) => `Change the scene to "${p.text || 'default'}"`,
  SET_WEATHER: (p) => `Set weather to ${p.text || 'none'}`,
  BOUNCE_ON_EDGE: () => `Bounce the sprite off the screen edges`,
  CHANGE_SCORE: (p) => `Change the score by ${typeof p.value === 'number' ? p.value : 1}`,
  SET_SCORE: (p) => `Set the score to ${typeof p.value === 'number' ? p.value : 0}`,
  GAME_OVER: () => `End the game`,
  WIN_GAME: () => `Show the win screen`,
  ADD_BUTTON: (p) => `Add a button labeled "${p.text || 'Button'}"`,
  ADD_TEXT_BLOCK: (p) => `Add text saying "${p.text || 'Text'}"`,
  ADD_INPUT: (p) => `Add an input field for "${p.text || 'Input'}"`,
  PLAY_SOUND: (p) => `Play sound effect "${p.text || 'sound'}"`,
  PLAY_MUSIC: (p) => `Play music track "${p.text || 'music'}"`,
  STOP_MUSIC: () => `Stop the currently playing music`,
  SET_BACKGROUND_MUSIC: (p) => `Set background music to "${p.text || 'music'}"`,
  LED_ON: (p) => `Turn on LED at pin ${p.pin ?? 0}`,
  LED_OFF: (p) => `Turn off LED at pin ${p.pin ?? 0}`,
  READ_TEMPERATURE: () => `Read the temperature sensor`,
  READ_DISTANCE: () => `Read the ultrasonic distance sensor`,
  COMMENT: (p) => `Comment: ${p.text || '...'}`,
  ON_COLLIDE: (p) => `When colliding with "${p.text || 'object'}", do the following`,
  ON_CLICK: () => `When the sprite is clicked, do the following`,
  END_EVENT: () => `End of event handler`,
};

export const explainCodeBlocks = (blocks: ExplanationBlock[]): string => {
  if (!blocks || blocks.length === 0) {
    return 'No blocks to explain! Add some blocks to your code first.';
  }

  const lines: string[] = [];
  let indentLevel = 0;
  const indent = () => '  '.repeat(indentLevel);

  for (const block of blocks) {
    const desc = BLOCK_DESCRIPTIONS[block.type];
    const params = block.params || {};

    if (block.type === 'END_REPEAT' || block.type === 'END_FOREVER' || block.type === 'END_IF' || block.type === 'ELSE' || block.type === 'END_EVENT') {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    if (desc) {
      lines.push(`${indent()}${desc(params)}`);
    } else {
      lines.push(`${indent()}Execute ${block.type.replace(/_/g, ' ').toLowerCase()}${params.text ? ` with "${params.text}"` : ''}`);
    }

    if (block.type === 'REPEAT' || block.type === 'FOREVER' || block.type === 'IF' || block.type === 'ON_COLLIDE' || block.type === 'ON_CLICK') {
      indentLevel++;
    }
  }

  if (lines.length === 1) {
    return `This code does one thing: ${lines[0].trim()}.`;
  }

  return `Here's what your code does:\n\n${lines.join('\n')}\n\nIn short: your code runs through ${blocks.length} block${blocks.length !== 1 ? 's' : ''} in sequence.`;
};

// ─── Item 83: Context-Aware AI Tutor ───

interface TutorContext {
  commands: Array<{ type: string; params?: Record<string, unknown> }>;
  consoleLogs: string[];
  gameMode: string;
  gameState?: string;
}

export const buildContextAwarePrompt = (userPrompt: string, context: TutorContext): string => {
  const helpKeywords = ['help', 'how', 'why', 'what', 'explain', 'fix', 'error', 'bug', 'broken', 'issue', 'wrong', 'stuck', 'stuck', 'problem', 'tutorial', 'teach', 'guide'];
  const isHelpRequest = helpKeywords.some(kw => userPrompt.toLowerCase().includes(kw));

  if (!isHelpRequest) return userPrompt;

  const parts: string[] = [userPrompt, '', '--- CONTEXT ---'];

  parts.push(`Current game mode: ${context.gameMode}`);
  if (context.gameState) {
    parts.push(`Game state: ${context.gameState}`);
  }

  if (context.commands.length > 0) {
    parts.push(`\nCurrent block script (${context.commands.length} blocks):`);
    const preview = context.commands.slice(0, 20);
    for (const cmd of preview) {
      const paramStr = cmd.params ? JSON.stringify(cmd.params) : '';
      parts.push(`  - ${cmd.type}${paramStr ? `(${paramStr})` : ''}`);
    }
    if (context.commands.length > 20) {
      parts.push(`  ... and ${context.commands.length - 20} more blocks`);
    }
  } else {
    parts.push('\nCurrent block script: (empty)');
  }

  if (context.consoleLogs.length > 0) {
    parts.push(`\nRecent console logs (last ${Math.min(5, context.consoleLogs.length)} entries):`);
    const recentLogs = context.consoleLogs.slice(-5);
    for (const log of recentLogs) {
      parts.push(`  > ${log}`);
    }
  }

  parts.push('--- END CONTEXT ---');
  parts.push('\nPlease use this context to give a helpful, kid-friendly answer.');

  return parts.join('\n');
};
