
import { useState, useRef, useCallback, useEffect } from 'react';
import { SavedProject, CommandBlock, HardwareState, SpriteState, AppState, CircuitComponent } from '../types/types';
import { saveProject as saveProjectToStorage } from '../services/storageService';

export const useProject = (
  commands: CommandBlock[],
  hardwareState: HardwareState,
  spriteState: SpriteState,
  appState: AppState,
  circuitComponents: CircuitComponent[],
  pcbColor: string,
  stageRef: React.RefObject<{ getThumbnail: () => string | undefined }>
) => {
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimeoutRef = useRef<number>();

  const saveCurrentProject = useCallback((isAutoSave = false) => {
    if (!currentProject) return;

    setSaveStatus('saving');

    const updatedProject: SavedProject = {
      ...currentProject,
      lastEdited: Date.now(),
      data: {
        commands,
        hardwareState,
        spriteState,
        appState,
        circuitComponents,
        pcbColor,
      },
      thumbnail: stageRef.current?.getThumbnail() || undefined,
    };

    saveProjectToStorage(updatedProject);
    setCurrentProject(updatedProject);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveStatus('saved');
    }, 1000);
  }, [
    currentProject,
    commands,
    hardwareState,
    spriteState,
    appState,
    circuitComponents,
    pcbColor,
    stageRef,
  ]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentProject) {
        saveCurrentProject(true);
      }
    }, 60000);

    return () => clearInterval(autoSaveInterval);
  }, [currentProject, saveCurrentProject]);

  return {
    currentProject,
    setCurrentProject,
    saveStatus,
    setSaveStatus,
    saveCurrentProject,
  };
};
