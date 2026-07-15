import React from 'react';
import {
  Palette, Globe, Puzzle, Music, User, Upload,
  Gamepad2, Cpu, Layout, Wand2
} from 'lucide-react';

export type GameWorkspace = 'build' | 'characters' | 'world' | 'logic' | 'audio' | 'publish';

interface WorkspaceConfig {
  id: GameWorkspace;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  tools: string[];
}

export const GAME_WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'build',
    label: 'Build',
    icon: <Wand2 size={20} />,
    color: 'text-violet-500',
    description: 'AI builds your game',
    tools: ['AI Generate', 'Templates', 'Quick Start'],
  },
  {
    id: 'characters',
    label: 'Characters',
    icon: <User size={20} />,
    color: 'text-amber-500',
    description: 'Create heroes, enemies, NPCs',
    tools: ['Character Creator', 'Sprites', 'Animations', 'Dialogue', 'AI Behaviors'],
  },
  {
    id: 'world',
    label: 'World',
    icon: <Globe size={20} />,
    color: 'text-emerald-500',
    description: 'Build levels and terrain',
    tools: ['Level Designer', 'Tiles', 'Weather', 'Lighting', 'Day/Night'],
  },
  {
    id: 'logic',
    label: 'Logic',
    icon: <Puzzle size={20} />,
    color: 'text-blue-500',
    description: 'Code game behavior',
    tools: ['Block Code', 'Events', 'Variables', 'Physics', 'AI'],
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: <Music size={20} />,
    color: 'text-rose-500',
    description: 'Music and sound effects',
    tools: ['Music Studio', 'Sound Effects', 'AI Music', 'Voice'],
  },
  {
    id: 'publish',
    label: 'Publish',
    icon: <Upload size={20} />,
    color: 'text-cyan-500',
    description: 'Share your game',
    tools: ['Export', 'Gallery', 'Share Link', 'Remix'],
  },
];

export const APP_WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'build',
    label: 'Build',
    icon: <Wand2 size={20} />,
    color: 'text-violet-500',
    description: 'AI builds your app',
    tools: ['AI Generate', 'Templates', 'Quick Start'],
  },
  {
    id: 'world',
    label: 'Design',
    icon: <Layout size={20} />,
    color: 'text-emerald-500',
    description: 'Design screens and layouts',
    tools: ['Screen Designer', 'Widgets', 'Themes', 'Navigation'],
  },
  {
    id: 'logic',
    label: 'Logic',
    icon: <Puzzle size={20} />,
    color: 'text-blue-500',
    description: 'Code app behavior',
    tools: ['Block Code', 'Variables', 'Data', 'APIs'],
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: <Music size={20} />,
    color: 'text-rose-500',
    description: 'Sound effects',
    tools: ['Sound Effects', 'AI Music'],
  },
  {
    id: 'publish',
    label: 'Publish',
    icon: <Upload size={20} />,
    color: 'text-cyan-500',
    description: 'Share your app',
    tools: ['Export', 'Gallery', 'Share Link'],
  },
];

export const HARDWARE_WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'build',
    label: 'Build',
    icon: <Wand2 size={20} />,
    color: 'text-violet-500',
    description: 'AI builds your circuit',
    tools: ['AI Generate', 'Templates', 'Quick Start'],
  },
  {
    id: 'world',
    label: 'Circuit',
    icon: <Cpu size={20} />,
    color: 'text-emerald-500',
    description: 'Design circuits',
    tools: ['Components', 'Wiring', 'Simulation'],
  },
  {
    id: 'logic',
    label: 'Code',
    icon: <Puzzle size={20} />,
    color: 'text-blue-500',
    description: 'Program the board',
    tools: ['Block Code', 'Variables', 'Sensors', 'Outputs'],
  },
  {
    id: 'publish',
    label: 'Upload',
    icon: <Upload size={20} />,
    color: 'text-cyan-500',
    description: 'Flash to hardware',
    tools: ['Upload Code', 'Serial Monitor', 'Real Hardware'],
  },
];

export const getWorkspacesForMode = (mode: string) => {
  switch (mode) {
    case 'GAME': return GAME_WORKSPACES;
    case 'APP': return APP_WORKSPACES;
    case 'HARDWARE': return HARDWARE_WORKSPACES;
    default: return GAME_WORKSPACES;
  }
};

interface GameWorkspacesProps {
  activeWorkspace: GameWorkspace;
  onWorkspaceChange: (id: GameWorkspace) => void;
  currentMode: string;
}

export const GameWorkspaces: React.FC<GameWorkspacesProps> = ({ activeWorkspace, onWorkspaceChange, currentMode }) => {
  const workspaces = getWorkspacesForMode(currentMode);

  return (
    <div className="flex items-center gap-1">
      {workspaces.map(ws => (
        <button
          key={ws.id}
          onClick={() => onWorkspaceChange(ws.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
            ${activeWorkspace === ws.id
              ? 'bg-white shadow-sm text-slate-800'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }
          `}
        >
          <span className={activeWorkspace === ws.id ? ws.color : ''}>{ws.icon}</span>
          <span className="hidden lg:inline">{ws.label}</span>
        </button>
      ))}
    </div>
  );
};
