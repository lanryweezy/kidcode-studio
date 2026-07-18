import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppMode } from '../types';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] || null),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

// Make Object.keys(localStorage) return store keys (for listProjectsIndexedDB)
const originalObjectKeys = Object.keys;
Object.keys = function(obj: Record<string, unknown>) {
  if (obj === localStorageMock || obj === globalThis.localStorage) {
    return originalObjectKeys(store);
  }
  return originalObjectKeys(obj);
} as typeof Object.keys;

vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.reject(new Error('IndexedDB not available'))),
}));

vi.mock('lz-string', () => ({
  compress: vi.fn((s: string) => `compressed:${s}`),
  decompress: vi.fn((s: string) => s.replace('compressed:', '')),
}));

describe('storageIndexedDB', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('module can be imported', async () => {
    const mod = await import('./storageIndexedDB');
    expect(mod).toBeDefined();
  });

  it('saveProjectIndexedDB falls back to localStorage on failure', async () => {
    const { saveProjectIndexedDB } = await import('./storageIndexedDB');
    const project = {
      id: 'proj1', name: 'Test', mode: AppMode.GAME,
      lastEdited: Date.now(), data: { commands: [] } as any,
    };
    await saveProjectIndexedDB(project);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'kidcode_project_proj1',
      expect.any(String)
    );
  });

  it('loadProjectIndexedDB falls back to localStorage', async () => {
    const { saveProjectIndexedDB, loadProjectIndexedDB } = await import('./storageIndexedDB');
    const project = {
      id: 'proj2', name: 'Load Test', mode: AppMode.GAME,
      lastEdited: Date.now(), data: { commands: [] } as any,
    };
    await saveProjectIndexedDB(project);
    const loaded = await loadProjectIndexedDB('proj2');
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe('Load Test');
  });

  it('loadProjectIndexedDB returns null for missing project', async () => {
    const { loadProjectIndexedDB } = await import('./storageIndexedDB');
    const loaded = await loadProjectIndexedDB('nonexistent');
    expect(loaded).toBeNull();
  });

  it('deleteProjectIndexedDB removes from localStorage', async () => {
    const { saveProjectIndexedDB, deleteProjectIndexedDB } = await import('./storageIndexedDB');
    const project = {
      id: 'proj3', name: 'Delete Test', mode: AppMode.GAME,
      lastEdited: Date.now(), data: { commands: [] } as any,
    };
    await saveProjectIndexedDB(project);
    await deleteProjectIndexedDB('proj3');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('kidcode_project_proj3');
  });

  it('listProjectsIndexedDB lists from localStorage', async () => {
    const { saveProjectIndexedDB, listProjectsIndexedDB } = await import('./storageIndexedDB');
    await saveProjectIndexedDB({
      id: 'p1', name: 'A', mode: AppMode.GAME, lastEdited: 100, data: { commands: [] } as any,
    });
    await saveProjectIndexedDB({
      id: 'p2', name: 'B', mode: AppMode.GAME, lastEdited: 200, data: { commands: [] } as any,
    });
    const list = await listProjectsIndexedDB();
    expect(list).toHaveLength(2);
  });

  it('saveAssetIndexedDB falls back to localStorage', async () => {
    const { saveAssetIndexedDB } = await import('./storageIndexedDB');
    await saveAssetIndexedDB('asset1', 'Image', 'image', 'base64data');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'kidcode_asset_asset1',
      expect.any(String)
    );
  });

  it('loadAssetIndexedDB falls back to localStorage', async () => {
    const { saveAssetIndexedDB, loadAssetIndexedDB } = await import('./storageIndexedDB');
    await saveAssetIndexedDB('a1', 'Test', 'image', 'data123');
    const data = await loadAssetIndexedDB('a1');
    expect(data).toBe('data123');
  });

  it('loadAssetIndexedDB returns null for missing asset', async () => {
    const { loadAssetIndexedDB } = await import('./storageIndexedDB');
    const data = await loadAssetIndexedDB('missing');
    expect(data).toBeNull();
  });

  it('deleteAssetIndexedDB removes from localStorage', async () => {
    const { deleteAssetIndexedDB } = await import('./storageIndexedDB');
    await deleteAssetIndexedDB('a1');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('kidcode_asset_a1');
  });

  it('listAssetsIndexedDB lists from localStorage', async () => {
    const { saveAssetIndexedDB, listAssetsIndexedDB } = await import('./storageIndexedDB');
    await saveAssetIndexedDB('a1', 'Img', 'image', 'data');
    await saveAssetIndexedDB('a2', 'Snd', 'audio', 'data2');
    const list = await listAssetsIndexedDB();
    expect(list).toHaveLength(2);
  });

  it('getStorageStats returns counts', async () => {
    const { saveProjectIndexedDB, saveAssetIndexedDB, getStorageStats } = await import('./storageIndexedDB');
    await saveProjectIndexedDB({
      id: 'p1', name: 'P', mode: AppMode.GAME, lastEdited: 0, data: { commands: [] } as any,
    });
    await saveAssetIndexedDB('a1', 'A', 'image', 'd');
    const stats = await getStorageStats();
    expect(stats.projectCount).toBe(1);
    expect(stats.assetCount).toBe(1);
  });

  it('clearAllIndexedDB clears kidcode keys', async () => {
    const { saveProjectIndexedDB, clearAllIndexedDB } = await import('./storageIndexedDB');
    await saveProjectIndexedDB({
      id: 'p1', name: 'P', mode: AppMode.GAME, lastEdited: 0, data: { commands: [] } as any,
    });
    await clearAllIndexedDB();
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
