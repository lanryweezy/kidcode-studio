import { IRNode } from './types';

export interface ProfileEntry {
  kind: string;
  count: number;
  totalMs: number;
  avgMs: number;
  maxMs: number;
}

export class IRProfiler {
  private entries: Map<string, { count: number; totalMs: number; maxMs: number }> = new Map();

  record(kind: string, durationMs: number): void {
    const existing = this.entries.get(kind);
    if (existing) {
      existing.count++;
      existing.totalMs += durationMs;
      existing.maxMs = Math.max(existing.maxMs, durationMs);
    } else {
      this.entries.set(kind, { count: 1, totalMs: durationMs, maxMs: durationMs });
    }
  }

  getReport(): ProfileEntry[] {
    return Array.from(this.entries.entries())
      .map(([kind, data]) => ({
        kind,
        count: data.count,
        totalMs: data.totalMs,
        avgMs: data.totalMs / data.count,
        maxMs: data.maxMs,
      }))
      .sort((a, b) => b.totalMs - a.totalMs);
  }

  clear(): void {
    this.entries.clear();
  }

  getSlowest(n: number = 5): ProfileEntry[] {
    return this.getReport().slice(0, n);
  }
}
