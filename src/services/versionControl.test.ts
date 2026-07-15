import { describe, it, expect, vi } from 'vitest';
import { VersionControl } from './versionControl';

describe('VersionControl', () => {
  it('creates a snapshot', () => {
    const vc = new VersionControl();
    const snapshot = vc.createSnapshot('Test', { x: 1 }, 'A test snapshot');
    expect(snapshot.name).toBe('Test');
    expect(snapshot.description).toBe('A test snapshot');
    expect(snapshot.author).toBe('Player');
  });

  it('restores a snapshot', () => {
    const vc = new VersionControl();
    const data = { tiles: [1, 2, 3], enemies: [] };
    const snapshot = vc.createSnapshot('Save', data);
    const restored = vc.restoreSnapshot(snapshot.id);
    expect(restored).toEqual(data);
  });

  it('returns null for non-existent snapshot', () => {
    const vc = new VersionControl();
    expect(vc.restoreSnapshot('nonexistent')).toBeNull();
  });

  it('lists snapshots in reverse order', () => {
    const vc = new VersionControl();
    vc.createSnapshot('First', {});
    vc.createSnapshot('Second', {});
    vc.createSnapshot('Third', {});
    const snapshots = vc.getSnapshots();
    expect(snapshots[0].name).toBe('Third');
    expect(snapshots[2].name).toBe('First');
  });

  it('gets snapshot by id', () => {
    const vc = new VersionControl();
    const s = vc.createSnapshot('Find me', {});
    expect(vc.getSnapshot(s.id)).toBeDefined();
    expect(vc.getSnapshot(s.id)!.name).toBe('Find me');
  });

  it('deletes snapshot', () => {
    const vc = new VersionControl();
    const s = vc.createSnapshot('Delete me', {});
    expect(vc.deleteSnapshot(s.id)).toBe(true);
    expect(vc.getSnapshot(s.id)).toBeUndefined();
  });

  it('returns false when deleting non-existent snapshot', () => {
    const vc = new VersionControl();
    expect(vc.deleteSnapshot('nope')).toBe(false);
  });

  it('tags snapshots', () => {
    const vc = new VersionControl();
    const s = vc.createSnapshot('Tagged', {});
    vc.tagSnapshot(s.id, 'important');
    const tagged = vc.getSnapshotsByTag('important');
    expect(tagged).toHaveLength(1);
  });

  it('does not add duplicate tags', () => {
    const vc = new VersionControl();
    const s = vc.createSnapshot('Tagged', {});
    vc.tagSnapshot(s.id, 'v1');
    vc.tagSnapshot(s.id, 'v1');
    const tagged = vc.getSnapshotsByTag('v1');
    expect(tagged).toHaveLength(1);
  });

  it('getSnapshotsByTag returns empty for unknown tag', () => {
    const vc = new VersionControl();
    expect(vc.getSnapshotsByTag('unknown')).toEqual([]);
  });

  it('autoSave creates a snapshot', () => {
    const vc = new VersionControl();
    const s = vc.autoSave({ level: 1 });
    expect(s.name).toBe('Auto Save');
    expect(s.author).toBe('System');
  });

  it('getStorageSize returns non-negative', () => {
    const vc = new VersionControl();
    vc.createSnapshot('Big', { data: 'x'.repeat(1000) });
    expect(vc.getStorageSize()).toBeGreaterThan(0);
  });

  it('exportHistory returns JSON string', () => {
    const vc = new VersionControl();
    vc.createSnapshot('Exported', { a: 1 });
    const json = vc.exportHistory();
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].name).toBe('Exported');
  });

  it('enforces max snapshots limit', () => {
    const vc = new VersionControl();
    for (let i = 0; i < 55; i++) {
      vc.createSnapshot(`Snap ${i}`, {});
    }
    const snapshots = vc.getSnapshots();
    expect(snapshots.length).toBeLessThanOrEqual(50);
  });
});
