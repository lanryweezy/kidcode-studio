import {
  listProjectsIndexedDB,
  listAssetsIndexedDB,
  loadProjectIndexedDB,
  loadAssetIndexedDB,
  clearAllIndexedDB,
} from './storageIndexedDB';
import {
  generateAnalyticsReport,
  clearAnalytics,
  AnalyticsReport,
} from './kidcodeAnalytics';
import { getEducationState } from './educationSystem';

const EDUCATION_STORAGE_KEY = 'kidcode_education';
const INPUT_MAPPER_KEY = 'kidcode_input_bindings';

interface UserDataExport {
  exportDate: string;
  version: string;
  projects: Array<{
    id: string;
    name: string;
    mode: string;
    timestamp: number;
    data: unknown;
  }>;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    timestamp: number;
    data: string | null;
  }>;
  analytics: AnalyticsReport;
  education: unknown;
  inputBindings: unknown;
  localStorageKeys: string[];
}

export const exportAllData = async (): Promise<void> => {
  const projects = await listProjectsIndexedDB();
  const projectData = await Promise.all(
    projects.map(async (p) => ({
      id: p.id,
      name: p.name,
      mode: p.mode,
      timestamp: p.timestamp,
      data: await loadProjectIndexedDB(p.id),
    }))
  );

  const assets = await listAssetsIndexedDB();
  const assetData = await Promise.all(
    assets.map(async (a) => ({
      ...a,
      data: await loadAssetIndexedDB(a.id),
    }))
  );

  let education = null;
  try {
    education = JSON.parse(localStorage.getItem(EDUCATION_STORAGE_KEY) || 'null');
  } catch {
    // ignore
  }

  let inputBindings = null;
  try {
    inputBindings = JSON.parse(localStorage.getItem(INPUT_MAPPER_KEY) || 'null');
  } catch {
    // ignore
  }

  const localStorageKeys = Object.keys(localStorage).filter((k) =>
    k.startsWith('kidcode_')
  );

  const exportData: UserDataExport = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    projects: projectData,
    assets: assetData,
    analytics: generateAnalyticsReport(),
    education,
    inputBindings,
    localStorageKeys,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kidcode-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const deleteAllData = async (): Promise<void> => {
  await clearAllIndexedDB();

  clearAnalytics();

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('kidcode_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((n) => caches.delete(n)));
    } catch {
      // ignore
    }
  }
};
