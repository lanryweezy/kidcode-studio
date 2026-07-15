import React from 'react';
import {
  Home, Palette, Globe, Puzzle, Music, User, Upload,
  Ghost, Cpu, Layout
} from 'lucide-react';
import { AppMode } from '../../types';

interface WorkspaceTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  modes?: AppMode[];
}

const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: 'home', label: 'Home', icon: <Home size={20} />, color: 'text-slate-500' },
  { id: 'design', label: 'Design', icon: <Palette size={20} />, color: 'text-pink-500', modes: [AppMode.GAME] },
  { id: 'world', label: 'World', icon: <Globe size={20} />, color: 'text-emerald-500', modes: [AppMode.GAME] },
  { id: 'logic', label: 'Logic', icon: <Puzzle size={20} />, color: 'text-violet-500', modes: [AppMode.GAME, AppMode.HARDWARE] },
  { id: 'audio', label: 'Audio', icon: <Music size={20} />, color: 'text-rose-500', modes: [AppMode.GAME] },
  { id: 'characters', label: 'Characters', icon: <User size={20} />, color: 'text-amber-500', modes: [AppMode.GAME] },
  { id: 'publish', label: 'Publish', icon: <Upload size={20} />, color: 'text-blue-500', modes: [AppMode.GAME, AppMode.HARDWARE] },
];

interface WorkspaceTabsProps {
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
  currentMode: AppMode;
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  activeWorkspace,
  onWorkspaceChange,
  currentMode,
}) => {
  const visibleTabs = WORKSPACE_TABS.filter(tab => !tab.modes || tab.modes.includes(currentMode));

  return (
    <div className="flex items-center gap-1 px-2">
      {visibleTabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onWorkspaceChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
            ${activeWorkspace === tab.id
              ? 'bg-white shadow-sm text-slate-800'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }
          `}
        >
          <span className={activeWorkspace === tab.id ? tab.color : ''}>{tab.icon}</span>
          <span className="hidden lg:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
