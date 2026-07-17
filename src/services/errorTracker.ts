interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: number;
  url: string;
  type: 'unhandled' | 'unhandledRejection' | 'reported';
}

const MAX_ERRORS = 100;
const errors: TrackedError[] = [];
let initialized = false;

const generateId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const addError = (error: TrackedError): void => {
  errors.push(error);
  if (errors.length > MAX_ERRORS) {
    errors.splice(0, errors.length - MAX_ERRORS);
  }
};

const handleError = (event: ErrorEvent): void => {
  const isDev = import.meta.env.DEV;
  const tracked: TrackedError = {
    id: generateId(),
    message: event.message || 'Unknown error',
    stack: event.error?.stack,
    context: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
    timestamp: Date.now(),
    url: window.location.href,
    type: 'unhandled',
  };
  addError(tracked);
  if (isDev) {
    console.error('[ErrorTracker]', tracked.message, tracked.context, tracked.stack);
  }
};

const handleRejection = (event: PromiseRejectionEvent): void => {
  const isDev = import.meta.env.DEV;
  const reason = event.reason;
  const tracked: TrackedError = {
    id: generateId(),
    message: reason?.message || String(reason) || 'Unhandled promise rejection',
    stack: reason?.stack,
    timestamp: Date.now(),
    url: window.location.href,
    type: 'unhandledRejection',
  };
  addError(tracked);
  if (isDev) {
    console.error('[ErrorTracker]', tracked.message, tracked.stack);
  }
};

export const initErrorTracker = (): void => {
  if (initialized) return;
  initialized = true;
  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);
};

export const reportError = (
  message: string,
  context?: Record<string, unknown>
): void => {
  const isDev = import.meta.env.DEV;
  const tracked: TrackedError = {
    id: generateId(),
    message,
    context,
    timestamp: Date.now(),
    url: window.location.href,
    type: 'reported',
  };
  addError(tracked);
  if (isDev) {
    console.error('[ErrorTracker]', message, context);
  }
};

export const getErrors = (): TrackedError[] => {
  return [...errors];
};

export const clearErrors = (): void => {
  errors.length = 0;
};

interface BlockedContent {
  id: string;
  blockType: string;
  timestamp: number;
  input: string;
  reason: string;
}

const blockedContent: BlockedContent[] = [];

export const getBlockedContent = (): BlockedContent[] => {
  return [...blockedContent];
};

export const clearBlockedContent = (): void => {
  blockedContent.length = 0;
};

interface APIUsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
}

export const getAPIUsageSummary = (): APIUsageSummary => {
  return {
    totalCalls: 0,
    totalTokens: 0,
    totalCost: 0,
    successRate: 1,
  };
};
