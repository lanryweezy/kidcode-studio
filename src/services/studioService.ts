import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { compress, decompress } from 'lz-string';
import { Studio } from '../types/studio';

export type { Studio } from '../types/studio';

interface StudioDB extends DBSchema {
  studios: {
    key: string;
    value: {
      id: string;
      data: string;
      updatedAt: number;
    };
    indexes: {
      updatedAt: number;
    };
  };
}

let db: IDBPDatabase<StudioDB> | null = null;
let useIndexedDB = true;

const getDB = async (): Promise<IDBPDatabase<StudioDB>> => {
  if (db) return db;

  try {
    db = await openDB<StudioDB>('KidCodeStudioDB', 1, {
      upgrade(database) {
        const store = database.createObjectStore('studios', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    });
    return db;
  } catch (error) {
    console.warn('IndexedDB not available for studios:', error);
    useIndexedDB = false;
    throw error;
  }
};

const LS_KEY = 'kidcode_studios';

const getFromLS = (): Studio[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToLS = (studios: Studio[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(studios));
};

export const createStudio = (
  name: string,
  description: string,
  createdBy: string,
  tags: string[] = [],
  coverImage?: string
): Studio => {
  const studio: Studio = {
    id: crypto.randomUUID(),
    name,
    description,
    coverImage,
    projects: [],
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags,
    isPublic: false,
    likes: 0,
    views: 0,
  };
  return studio;
};

export const saveStudio = async (studio: Studio): Promise<void> => {
  if (!useIndexedDB) {
    const studios = getFromLS();
    const idx = studios.findIndex(s => s.id === studio.id);
    if (idx >= 0) {
      studios[idx] = studio;
    } else {
      studios.unshift(studio);
    }
    saveToLS(studios);
    return;
  }

  try {
    const database = await getDB();
    const compressed = compress(JSON.stringify(studio));
    await database.put('studios', {
      id: studio.id,
      data: compressed,
      updatedAt: studio.updatedAt,
    });
  } catch (error) {
    console.error('Studio save failed:', error);
    const studios = getFromLS();
    const idx = studios.findIndex(s => s.id === studio.id);
    if (idx >= 0) {
      studios[idx] = studio;
    } else {
      studios.unshift(studio);
    }
    saveToLS(studios);
  }
};

export const getStudios = async (): Promise<Studio[]> => {
  if (!useIndexedDB) {
    return getFromLS().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  try {
    const database = await getDB();
    const records = await database.getAll('studios');
    const studios = records.map(r => {
      const decompressed = decompress(r.data);
      return JSON.parse(decompressed) as Studio;
    });
    return studios.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to load studios:', error);
    return getFromLS().sort((a, b) => b.updatedAt - a.updatedAt);
  }
};

export const getStudio = async (id: string): Promise<Studio | null> => {
  if (!useIndexedDB) {
    const studios = getFromLS();
    return studios.find(s => s.id === id) || null;
  }

  try {
    const database = await getDB();
    const record = await database.get('studios', id);
    if (!record) return null;
    const decompressed = decompress(record.data);
    return JSON.parse(decompressed) as Studio;
  } catch (error) {
    console.error('Failed to load studio:', error);
    const studios = getFromLS();
    return studios.find(s => s.id === id) || null;
  }
};

export const deleteStudio = async (id: string): Promise<void> => {
  if (!useIndexedDB) {
    const studios = getFromLS().filter(s => s.id !== id);
    saveToLS(studios);
    return;
  }

  try {
    const database = await getDB();
    await database.delete('studios', id);
  } catch (error) {
    console.error('Failed to delete studio:', error);
    const studios = getFromLS().filter(s => s.id !== id);
    saveToLS(studios);
  }
};

export const addProjectToStudio = async (studioId: string, projectId: string): Promise<Studio | null> => {
  const studio = await getStudio(studioId);
  if (!studio) return null;
  if (studio.projects.includes(projectId)) return studio;

  studio.projects.push(projectId);
  studio.updatedAt = Date.now();
  await saveStudio(studio);
  return studio;
};

export const removeProjectFromStudio = async (studioId: string, projectId: string): Promise<Studio | null> => {
  const studio = await getStudio(studioId);
  if (!studio) return null;

  studio.projects = studio.projects.filter(id => id !== projectId);
  studio.updatedAt = Date.now();
  await saveStudio(studio);
  return studio;
};

export const reorderProjectsInStudio = async (studioId: string, fromIndex: number, toIndex: number): Promise<Studio | null> => {
  const studio = await getStudio(studioId);
  if (!studio) return null;

  if (fromIndex < 0 || fromIndex >= studio.projects.length) return studio;
  if (toIndex < 0 || toIndex >= studio.projects.length) return studio;

  const [moved] = studio.projects.splice(fromIndex, 1);
  studio.projects.splice(toIndex, 0, moved);
  studio.updatedAt = Date.now();
  await saveStudio(studio);
  return studio;
};

export const updateStudio = async (id: string, updates: Partial<Pick<Studio, 'name' | 'description' | 'tags' | 'isPublic' | 'coverImage'>>): Promise<Studio | null> => {
  const studio = await getStudio(id);
  if (!studio) return null;

  Object.assign(studio, updates, { updatedAt: Date.now() });
  await saveStudio(studio);
  return studio;
};

export const clearStudioDB = async (): Promise<void> => {
  if (!useIndexedDB) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  try {
    const database = await getDB();
    await database.clear('studios');
  } catch (error) {
    console.error('Failed to clear studios:', error);
  }
};
