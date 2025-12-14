
import { AppMode, CommandBlock, HardwareState, SpriteState, AppState, CircuitComponent } from '../types';
import { INITIAL_HARDWARE_STATE, INITIAL_SPRITE_STATE, INITIAL_APP_STATE } from '../constants';

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

export const getProjects = (): SavedProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load projects", e);
    return [];
  }
};

export const saveProject = (project: SavedProject) => {
  try {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.unshift(project);
    }
    
    // Keep only last 10 projects to save space
    if (projects.length > 10) projects.pop();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save project", e);
  }
};

export const deleteProject = (id: string) => {
  try {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to delete project", e);
  }
};

export const createNewProject = (mode: AppMode): SavedProject => {
  return {
    id: crypto.randomUUID(),
    name: `My ${mode === AppMode.GAME ? 'Game' : mode === AppMode.APP ? 'App' : 'Circuit'} Project`,
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
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
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
