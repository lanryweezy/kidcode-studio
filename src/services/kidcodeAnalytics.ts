/**
 * KidCode Analytics — Block-level telemetry for product improvement
 * Anonymous only. No PII. Stored locally with optional sync.
 */

// ═══════════════════════════════════════════════════════════
// BLOCK USAGE TRACKING
// ═══════════════════════════════════════════════════════════

export interface BlockUsageEvent {
  blockType: string;
  timestamp: number;
  sessionId: string;
  params?: Record<string, unknown>;
}

export interface BlockUsageStats {
  blockType: string;
  count: number;
  lastUsed: number;
}

const blockUsageStore: BlockUsageEvent[] = [];
const MAX_STORED_EVENTS = 5000;

export function trackBlockUsage(blockType: string, sessionId: string, params?: Record<string, unknown>): void {
  blockUsageStore.push({ blockType, timestamp: Date.now(), sessionId, params });
  if (blockUsageStore.length > MAX_STORED_EVENTS) {
    blockUsageStore.splice(0, blockUsageStore.length - MAX_STORED_EVENTS);
  }
}

export function getBlockUsageStats(): BlockUsageStats[] {
  const counts: Record<string, { count: number; lastUsed: number }> = {};
  for (const event of blockUsageStore) {
    if (!counts[event.blockType]) {
      counts[event.blockType] = { count: 0, lastUsed: 0 };
    }
    counts[event.blockType].count++;
    counts[event.blockType].lastUsed = Math.max(counts[event.blockType].lastUsed, event.timestamp);
  }
  return Object.entries(counts)
    .map(([blockType, data]) => ({ blockType, ...data }))
    .sort((a, b) => b.count - a.count);
}

// ═══════════════════════════════════════════════════════════
// COMPLETION RATE TRACKING
// ═══════════════════════════════════════════════════════════

export interface CompletionEvent {
  templateId: string;
  startedAt: number;
  completedAt: number;
  success: boolean;
  blockCount: number;
  sessionId: string;
}

const completionStore: CompletionEvent[] = [];

export function trackCompletion(event: CompletionEvent): void {
  completionStore.push(event);
}

export function getCompletionRate(templateId?: string): { total: number; completed: number; rate: number } {
  const events = templateId
    ? completionStore.filter(e => e.templateId === templateId)
    : completionStore;
  const completed = events.filter(e => e.success).length;
  return { total: events.length, completed, rate: events.length > 0 ? completed / events.length : 0 };
}

// ═══════════════════════════════════════════════════════════
// ERROR PATTERN TRACKING
// ═══════════════════════════════════════════════════════════

export interface ErrorPattern {
  errorCode: string;
  message: string;
  blockType?: string;
  timestamp: number;
  count: number;
}

const errorStore: ErrorPattern[] = [];

export function trackError(errorCode: string, message: string, blockType?: string): void {
  const existing = errorStore.find(e => e.errorCode === errorCode && e.blockType === blockType);
  if (existing) {
    existing.count++;
  } else {
    errorStore.push({ errorCode, message, blockType, timestamp: Date.now(), count: 1 });
  }
}

export function getErrorPatterns(): ErrorPattern[] {
  return [...errorStore].sort((a, b) => b.count - a.count);
}

// ═══════════════════════════════════════════════════════════
// SESSION DURATION TRACKING
// ═══════════════════════════════════════════════════════════

export interface SessionDuration {
  sessionId: string;
  startTime: number;
  endTime: number;
  activeTime: number;
}

const sessionStore: SessionDuration[] = [];

export function trackSessionDuration(session: SessionDuration): void {
  sessionStore.push(session);
}

export function getAverageSessionDuration(): number {
  if (sessionStore.length === 0) return 0;
  const total = sessionStore.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
  return total / sessionStore.length;
}

// ═══════════════════════════════════════════════════════════
// FEATURE ADOPTION TRACKING
// ═══════════════════════════════════════════════════════════

export interface FeatureAdoption {
  featureId: string;
  firstUsed: number;
  lastUsed: number;
  useCount: number;
}

const featureStore: Map<string, FeatureAdoption> = new Map();

export function trackFeatureUse(featureId: string): void {
  const now = Date.now();
  const existing = featureStore.get(featureId);
  if (existing) {
    existing.lastUsed = now;
    existing.useCount++;
  } else {
    featureStore.set(featureId, { featureId, firstUsed: now, lastUsed: now, useCount: 1 });
  }
}

export function getFeatureAdoption(): FeatureAdoption[] {
  return Array.from(featureStore.values()).sort((a, b) => b.useCount - a.useCount);
}

// ═══════════════════════════════════════════════════════════
// AGGREGATE REPORT
// ═══════════════════════════════════════════════════════════

export interface AnalyticsReport {
  topBlocks: BlockUsageStats[];
  completionRate: { total: number; completed: number; rate: number };
  topErrors: ErrorPattern[];
  avgSessionDuration: number;
  topFeatures: FeatureAdoption[];
  generatedAt: number;
}

export function generateAnalyticsReport(): AnalyticsReport {
  return {
    topBlocks: getBlockUsageStats().slice(0, 10),
    completionRate: getCompletionRate(),
    topErrors: getErrorPatterns().slice(0, 10),
    avgSessionDuration: getAverageSessionDuration(),
    topFeatures: getFeatureAdoption().slice(0, 10),
    generatedAt: Date.now(),
  };
}

export function clearAnalytics(): void {
  blockUsageStore.length = 0;
  completionStore.length = 0;
  errorStore.length = 0;
  sessionStore.length = 0;
  featureStore.clear();
}
