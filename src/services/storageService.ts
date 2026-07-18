
import { AppMode, CommandBlock, HardwareState, SpriteState, AppState, CircuitComponent } from '../types';
import { INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE } from '../constants';
import { saveProjectIndexedDB, deleteProjectIndexedDB, listProjectsIndexedDB, loadProjectIndexedDB } from './storageIndexedDB';

export interface SavedProject {
  id: string;
  name: string;
  mode: AppMode;
  lastEdited: number; // Timestamp
  thumbnail?: string; // Base64 data URL
  data: {
    commands: CommandBlock[];
    hardwareState: HardwareState;
    spriteState: SpriteState;
    appState: AppState;
    circuitComponents: CircuitComponent[];
    pcbColor: string;
  };
}

const STORAGE_KEY = 'kidcode_projects';

export type SaveProjectResult = 'saved' | 'limit-warning' | 'limit-reached';

export const getProjectsSync = (): SavedProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load projects", e);
    return [];
  }
};

export const getProjects = (): SavedProject[] => getProjectsSync();

export const getProjectsAsync = async (): Promise<SavedProject[]> => {
  try {
    const idbProjects = await listProjectsIndexedDB();
    if (idbProjects.length > 0) {
      const projects = await Promise.all(
        idbProjects.map(async (p) => {
          const full = await loadProjectIndexedDB(p.id);
          return full || ({ id: p.id, name: p.name, mode: p.mode as AppMode, lastEdited: p.timestamp, data: { commands: [], hardwareState: { ...INITIAL_HARDWARE_STATE }, spriteState: { ...INITIAL_SPRITE_STATE }, appState: { ...INITIAL_APP_STATE }, circuitComponents: [], pcbColor: '#059669' } } as SavedProject);
        })
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return projects;
    }
    return getProjectsSync();
  } catch {
    return getProjectsSync();
  }
};

export const captureThumbnail = (canvas: HTMLCanvasElement): string => {
    try {
        return canvas.toDataURL('image/jpeg', 0.5); // Low quality for storage size
    } catch (e) {
        console.error("Failed to capture thumbnail", e);
        return '';
    }
};

export const saveProject = async (project: SavedProject, thumbnail?: string): Promise<SaveProjectResult> => {
  try {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (thumbnail) {
        project.thumbnail = thumbnail;
    }
    
    if (index >= 0) {
        if (!thumbnail && projects[index].thumbnail) {
            project.thumbnail = projects[index].thumbnail;
        }
        projects[index] = project;
    } else {
      projects.unshift(project);
    }

    let result: SaveProjectResult = 'saved';

    if (projects.length >= 10 && index < 0) {
      result = 'limit-reached';
    } else if (projects.length >= 8 && index < 0) {
      result = 'limit-warning';
    }
    
    if (result === 'limit-reached') {
      return result;
    }
    
    try {
      await saveProjectIndexedDB(project);
    } catch (e) {
      console.warn('IndexedDB save failed, falling back to localStorage:', e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  } catch (e) {
    console.error("Failed to save project", e);
  }
  return 'saved';
};

export const remixProject = async (project: SavedProject): Promise<SavedProject> => {
    const remixed: SavedProject = {
        ...project,
        id: crypto.randomUUID(),
        name: `${project.name} (Remix)`,
        lastEdited: Date.now()
    };
    await saveProject(remixed);
    return remixed;
};

export const deleteProject = async (id: string) => {
  try {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    await deleteProjectIndexedDB(id);
  } catch (e) {
    console.error("Failed to delete project", e);
  }
};

export const createNewProject = (mode: AppMode): SavedProject => {
  return {
    id: crypto.randomUUID(),
    name: `My ${mode === AppMode.GAME ? 'Game' : mode === AppMode.APP ? 'App' : mode === AppMode.MINECRAFT ? 'Minecraft' : mode === AppMode.CAD ? '3D Model' : 'Circuit'} Project`,
    mode,
    lastEdited: Date.now(),
    data: {
      commands: [],
      hardwareState: { ...INITIAL_HARDWARE_STATE },
      spriteState: { ...INITIAL_SPRITE_STATE },
      appState: { ...INITIAL_APP_STATE },
      circuitComponents: mode === AppMode.HARDWARE ? [
         { id: '1', type: 'LED_RED', x: 40, y: 60, pin: 0, rotation: 0 },
         { id: '2', type: 'BUTTON', x: 100, y: 320, pin: 4, rotation: 0 },
         { id: '3', type: 'LIGHT_SENSOR', x: 160, y: 320, pin: 5, rotation: 0 },
         { id: '4', type: 'LCD', x: 180, y: 320, pin: 95, rotation: 0 }
      ] : [],
      pcbColor: '#059669'
    }
  };
};

// --- EXPORT / IMPORT FEATURES ---

export const exportProjectToFile = (project: SavedProject) => {
  const dataStr = `data:text/json;charset=utf-8,${  encodeURIComponent(JSON.stringify(project, null, 2))}`;
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_kidcode.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importProjectFromFile = (file: File): Promise<SavedProject> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.id || !json.mode || !json.data) {
          throw new Error("Invalid project file");
        }
        // Force a new ID to avoid collisions with existing projects
        json.id = crypto.randomUUID();
        json.name = `${json.name} (Imported)`;
        json.lastEdited = Date.now();
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};
