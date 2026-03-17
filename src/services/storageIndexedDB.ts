import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { compress, decompress } from 'lz-string';
import { SavedProject } from './storageService';

/**
 * IndexedDB Storage Service
 * 
 * Provides unlimited storage for projects and assets using IndexedDB
 * with LZ-String compression for efficient storage
 * 
 * Features:
 * - Unlimited storage (browser-dependent, typically 50MB+)
 * - Automatic compression
 * - Fallback to localStorage if IndexedDB fails
 * - Async operations with Promise API
 */

interface KidCodeDB extends DBSchema {
  projects: {
    key: string;
    value: { 
      id: string; 
      data: string; // Compressed JSON
      timestamp: number;
      name: string;
      mode: string;
      thumbnail?: string;
    };
    indexes: {
      timestamp: number;
      mode: string;
    };
  };
  assets: {
    key: string;
    value: { 
      id: string; 
      name: string; 
      type: 'image' | 'model' | 'audio'; 
      data: string; // Compressed data
      size: number;
      timestamp: number;
    };
    indexes: {
      type: 'image' | 'model' | 'audio';
      timestamp: number;
    };
  };
  metadata: {
    key: string;
    value: { value: any };
  };
}

let db: IDBPDatabase<KidCodeDB> | null = null;
let useIndexedDB = true;

/**
 * Initialize or get IndexedDB database
 */
const getDB = async (): Promise<IDBPDatabase<KidCodeDB>> => {
  if (db) return db;
  
  try {
    db = await openDB<KidCodeDB>('KidCodeDB', 1, {
      upgrade(database) {
        // Create object stores
        const projectStore = database.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('timestamp', 'timestamp');
        projectStore.createIndex('mode', 'mode');
        
        const assetStore = database.createObjectStore('assets', { keyPath: 'id' });
        assetStore.createIndex('type', 'type');
        assetStore.createIndex('timestamp', 'timestamp');
        
        database.createObjectStore('metadata', { keyPath: 'key' });
      }
    });
    
    console.log('✅ IndexedDB initialized');
    return db;
  } catch (error) {
    console.warn('⚠️ IndexedDB not available, falling back to localStorage:', error);
    useIndexedDB = false;
    throw error;
  }
};

/**
 * Save project to IndexedDB
 * @param project - Project data to save
 * @returns Promise resolving when save is complete
 */
export const saveProjectIndexedDB = async (project: SavedProject): Promise<void> => {
  if (!useIndexedDB) {
    // Fallback to localStorage
    localStorage.setItem('kidcode_project_' + project.id, JSON.stringify(project));
    return;
  }

  try {
    const database = await getDB();
    const compressed = compress(JSON.stringify(project));
    
    await database.put('projects', {
      id: project.id,
      data: compressed,
      timestamp: project.lastEdited || Date.now(),
      name: project.name,
      mode: project.mode,
      thumbnail: project.thumbnail
    });
    
    console.log('💾 Project saved to IndexedDB:', project.name);
  } catch (error) {
    console.error('❌ IndexedDB save failed, using localStorage:', error);
    localStorage.setItem('kidcode_project_' + project.id, JSON.stringify(project));
  }
};

/**
 * Load project from IndexedDB
 * @param projectId - ID of project to load
 * @returns Promise resolving to project data or null if not found
 */
export const loadProjectIndexedDB = async (projectId: string): Promise<SavedProject | null> => {
  if (!useIndexedDB) {
    // Try localStorage fallback
    const data = localStorage.getItem('kidcode_project_' + projectId);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const database = await getDB();
    const record = await database.get('projects', projectId);
    
    if (!record) return null;
    
    const decompressed = decompress(record.data);
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('❌ IndexedDB load failed:', error);
    return null;
  }
};

/**
 * List all saved projects
 * @returns Promise resolving to array of project metadata
 */
export const listProjectsIndexedDB = async (): Promise<Array<{
  id: string;
  name: string;
  mode: string;
  timestamp: number;
  thumbnail?: string;
}>> => {
  if (!useIndexedDB) {
    // Fallback: list from localStorage
    const projects: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kidcode_project_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key!) || '{}');
          projects.push({
            id: data.id,
            name: data.name || 'Untitled',
            mode: data.mode || 'unknown',
            timestamp: data.lastModified || 0,
            thumbnail: data.thumbnail
          });
        } catch {
          // Skip invalid data
        }
      }
    }
    return projects.sort((a, b) => b.timestamp - a.timestamp);
  }

  try {
    const database = await getDB();
    const projects = await database.getAll('projects');
    
    return projects
      .map(p => ({
        id: p.id,
        name: p.name,
        mode: p.mode,
        timestamp: p.timestamp,
        thumbnail: p.thumbnail
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('❌ Failed to list projects:', error);
    return [];
  }
};

/**
 * Delete a project
 * @param projectId - ID of project to delete
 */
export const deleteProjectIndexedDB = async (projectId: string): Promise<void> => {
  if (!useIndexedDB) {
    localStorage.removeItem('kidcode_project_' + projectId);
    return;
  }

  try {
    const database = await getDB();
    await database.delete('projects', projectId);
    console.log('🗑️ Project deleted:', projectId);
  } catch (error) {
    console.error('❌ Delete failed:', error);
  }
};

/**
 * Save asset (image, model, audio) to IndexedDB
 * @param id - Unique asset ID
 * @param name - Asset name
 * @param type - Asset type (image, model, audio)
 * @param data - Asset data (base64 string, URL, etc.)
 */
export const saveAssetIndexedDB = async (
  id: string,
  name: string,
  type: 'image' | 'model' | 'audio',
  data: string
): Promise<void> => {
  if (!useIndexedDB) {
    localStorage.setItem('kidcode_asset_' + id, JSON.stringify({ id, name, type, data }));
    return;
  }

  try {
    const database = await getDB();
    const compressed = compress(data);
    
    await database.put('assets', {
      id,
      name,
      type,
      data: compressed,
      size: data.length,
      timestamp: Date.now()
    });
    
    console.log('💾 Asset saved:', name);
  } catch (error) {
    console.error('❌ Asset save failed:', error);
  }
};

/**
 * Load asset from IndexedDB
 * @param id - Asset ID
 * @returns Asset data or null if not found
 */
export const loadAssetIndexedDB = async (id: string): Promise<string | null> => {
  if (!useIndexedDB) {
    const data = localStorage.getItem('kidcode_asset_' + id);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.data;
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const database = await getDB();
    const record = await database.get('assets', id);
    
    if (!record) return null;
    
    return decompress(record.data);
  } catch (error) {
    console.error('❌ Asset load failed:', error);
    return null;
  }
};

/**
 * Delete an asset
 * @param id - Asset ID
 */
export const deleteAssetIndexedDB = async (id: string): Promise<void> => {
  if (!useIndexedDB) {
    localStorage.removeItem('kidcode_asset_' + id);
    return;
  }

  try {
    const database = await getDB();
    await database.delete('assets', id);
  } catch (error) {
    console.error('❌ Asset delete failed:', error);
  }
};

/**
 * List all assets
 * @returns Array of asset metadata
 */
export const listAssetsIndexedDB = async (): Promise<Array<{
  id: string;
  name: string;
  type: 'image' | 'model' | 'audio';
  size: number;
  timestamp: number;
}>> => {
  if (!useIndexedDB) {
    const assets: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kidcode_asset_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key!) || '{}');
          assets.push({
            id: data.id,
            name: data.name,
            type: data.type,
            size: data.data?.length || 0,
            timestamp: data.timestamp || 0
          });
        } catch {
          // Skip
        }
      }
    }
    return assets;
  }

  try {
    const database = await getDB();
    const assets = await database.getAll('assets');
    
    return assets.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      size: a.size,
      timestamp: a.timestamp
    }));
  } catch (error) {
    console.error('❌ Failed to list assets:', error);
    return [];
  }
};

/**
 * Get storage statistics
 * @returns Storage usage information
 */
export const getStorageStats = async (): Promise<{
  projectCount: number;
  assetCount: number;
  totalSize: number;
  indexedDBAvailable: boolean;
}> => {
  if (!useIndexedDB) {
    // Estimate from localStorage
    let totalSize = 0;
    let projectCount = 0;
    let assetCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        if (key.startsWith('kidcode_project_')) projectCount++;
        if (key.startsWith('kidcode_asset_')) assetCount++;
      }
    }
    
    return {
      projectCount,
      assetCount,
      totalSize,
      indexedDBAvailable: false
    };
  }

  try {
    const database = await getDB();
    const projects = await database.getAll('projects');
    const assets = await database.getAll('assets');
    
    const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
    
    return {
      projectCount: projects.length,
      assetCount: assets.length,
      totalSize,
      indexedDBAvailable: true
    };
  } catch (error) {
    return {
      projectCount: 0,
      assetCount: 0,
      totalSize: 0,
      indexedDBAvailable: false
    };
  }
};

/**
 * Clear all data from IndexedDB
 */
export const clearAllIndexedDB = async (): Promise<void> => {
  if (!useIndexedDB) {
    // Clear localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kidcode_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return;
  }

  try {
    const database = await getDB();
    await database.clear('projects');
    await database.clear('assets');
    console.log('🗑️ All IndexedDB data cleared');
  } catch (error) {
    console.error('❌ Clear failed:', error);
  }
};

/**
 * Export project to JSON file
 */
export const exportProjectToFile = async (project: SavedProject): Promise<void> => {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.kidcode`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Import project from JSON file
 */
export const importProjectFromFile = async (file: File): Promise<SavedProject> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        resolve(project);
      } catch (error) {
        reject(new Error('Invalid project file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
