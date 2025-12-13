
import { useState, useEffect } from 'react';
import { UserProfile } from '../types/types';
import { getUserProfile, DEFAULT_USER } from '../services/userService';
import { SavedProject } from '../services/storageService';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setUserProfile(getUserProfile());
  }, []);

  const handleLoadProject = (
    project: SavedProject,
    setCurrentProject: (project: SavedProject) => void,
    setCommands: (commands: any) => void,
    setMode: (mode: any) => void,
    setShowHome: (show: boolean) => void
  ) => {
    setCurrentProject(project);
    setCommands(project.data.commands);
    setMode(project.mode);
    setShowHome(false);
  };

  return {
    userProfile,
    setUserProfile,
    showProfile,
    setShowProfile,
    handleLoadProject,
  };
};
