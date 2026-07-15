/**
 * Version Control for Game Projects - Ported from Timeframe
 * Snapshot-based version history with diff and rollback
 */

import { compress, decompress } from 'lz-string';

export interface VersionSnapshot {
  id: string;
  name: string;
  timestamp: number;
  description: string;
  data: string; // compressed game state
  thumbnail?: string;
  author: string;
  tags: string[];
}

export interface VersionDiff {
  tilesAdded: number;
  tilesRemoved: number;
  tilesModified: number;
  entitiesAdded: number;
  entitiesRemoved: number;
  commandsAdded: number;
  commandsRemoved: number;
}

export class VersionControl {
  private snapshots: VersionSnapshot[] = [];
  private maxSnapshots: number = 50;

  createSnapshot(name: string, data: Record<string, unknown> | string, description: string = '', author: string = 'Player'): VersionSnapshot {
    const snapshot: VersionSnapshot = {
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      timestamp: Date.now(),
      description,
      data: compress(JSON.stringify(data)),
      author,
      tags: [],
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  restoreSnapshot(id: string): Record<string, unknown> | null {
    const snapshot = this.snapshots.find(s => s.id === id);
    if (!snapshot) return null;
    try {
      const json = decompress(snapshot.data);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  getSnapshots(): VersionSnapshot[] {
    return [...this.snapshots].reverse();
  }

  getSnapshot(id: string): VersionSnapshot | undefined {
    return this.snapshots.find(s => s.id === id);
  }

  deleteSnapshot(id: string): boolean {
    const idx = this.snapshots.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.snapshots.splice(idx, 1);
      return true;
    }
    return false;
  }

  tagSnapshot(id: string, tag: string): void {
    const snapshot = this.snapshots.find(s => s.id === id);
    if (snapshot && !snapshot.tags.includes(tag)) {
      snapshot.tags.push(tag);
    }
  }

  getSnapshotsByTag(tag: string): VersionSnapshot[] {
    return this.snapshots.filter(s => s.tags.includes(tag));
  }

  autoSave(data: Record<string, unknown>): VersionSnapshot {
    return this.createSnapshot('Auto Save', data, 'Automatic save', 'System');
  }

  getStorageSize(): number {
    return this.snapshots.reduce((total, s) => total + s.data.length, 0);
  }

  exportHistory(): string {
    return JSON.stringify(this.snapshots.map(s => ({
      id: s.id,
      name: s.name,
      timestamp: s.timestamp,
      description: s.description,
      author: s.author,
      tags: s.tags,
    })), null, 2);
  }
}

export const versionControl = new VersionControl();
