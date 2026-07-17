
import React from 'react';
import { Code2, Cpu, Layout, Gamepad2, Settings, ArrowLeft, Sparkles, UserCircle2, Ghost, Terminal, BarChart2 } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarDockProps {
  mode: AppMode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onHome: () => void;
  onOpenProfile: () => void;
  onShowStats: () => void;
}

const SidebarDock: React.FC<SidebarDockProps> = ({ mode, activeTab, onTabChange, onHome, onOpenProfile, onShowStats }) => {
  return (
    <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 shrink-0 z-30">
      <button
        onClick={onHome}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mb-2"
        title="Back to Home"
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} />
      </button>

      <DockItem
        icon={Sparkles}
        label="AI Agent"
        isActive={activeTab === 'ai'}
        onClick={() => onTabChange('ai')}
      />

      <div className="w-8 h-px bg-slate-200 my-1" />

      <DockItem
        icon={Code2}
        label="Code"
        isActive={activeTab === 'code'}
        onClick={() => onTabChange('code')}
      />

      {mode === AppMode.HARDWARE && (
        <DockItem
          icon={Cpu}
          label="Parts"
          isActive={activeTab === 'components'}
          onClick={() => onTabChange('components')}
        />
      )}

      {mode === AppMode.APP && (
        <DockItem
          icon={Layout}
          label="Design"
          isActive={activeTab === 'design'}
          onClick={() => onTabChange('design')}
        />
      )}

      {mode === AppMode.GAME && (
        <DockItem
          icon={Ghost}
          label="Sprite"
          isActive={activeTab === 'design'}
          onClick={() => onTabChange('design')}
        />
      )}

      <div className="flex-1" />

      <DockItem
        icon={BarChart2}
        label="Stats"
        isActive={false}
        onClick={onShowStats}
      />

      <button
        onClick={onOpenProfile}
        className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-colors mb-2"
        title="My Profile"
        aria-label="My Profile"
      >
        <UserCircle2 size={20} />
      </button>

      <DockItem
        icon={Terminal}
        label="Export"
        isActive={activeTab === 'export'}
        onClick={() => onTabChange('export')}
      />

      <DockItem
        icon={Settings}
        label="Settings"
        isActive={activeTab === 'settings'}
        onClick={() => onTabChange('settings')}
      />
    </div>
  );
};

const DockItem: React.FC<{ icon: any, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`
      flex flex-col items-center justify-center w-full gap-1 py-3 px-1 transition-all relative group
      ${isActive ? 'text-violet-600 bg-violet-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
    `}
  >
    <Icon size={20} className={`transition-all ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);

export default SidebarDock;
