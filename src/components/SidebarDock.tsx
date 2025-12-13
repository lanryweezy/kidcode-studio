
import React from 'react';
import { Code2, Cpu, Layout, Gamepad2, Settings, ArrowLeft, Sparkles, UserCircle2 } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarDockProps {
  mode: AppMode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onHome: () => void;
  onOpenProfile: () => void;
}

const SidebarDock: React.FC<SidebarDockProps> = ({ mode, activeTab, onTabChange, onHome, onOpenProfile }) => {
  return (
    <div className="w-16 bg-slate-900 dark:bg-slate-950 flex flex-col items-center py-4 gap-4 shrink-0 z-30">
      {/* Home Button */}
      <button 
        onClick={onHome}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-4"
        title="Back to Home"
      >
        <ArrowLeft size={20} />
      </button>

      {/* AI Agent (Primary Tool) */}
      <DockItem 
        icon={Sparkles} 
        label="AI Agent" 
        isActive={activeTab === 'ai'} 
        onClick={() => onTabChange('ai')} 
      />

      <div className="w-8 h-px bg-slate-800 my-1" />

      {/* Code Tab (Always available) */}
      <DockItem 
        icon={Code2} 
        label="Code" 
        isActive={activeTab === 'code'} 
        onClick={() => onTabChange('code')} 
      />

      {/* Mode Specific Tabs */}
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
          icon={Gamepad2} 
          label="Config" 
          isActive={activeTab === 'config'} 
          onClick={() => onTabChange('config')} 
        />
      )}

      <div className="flex-1" />

      {/* Profile Button */}
      <button 
        onClick={onOpenProfile}
        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-violet-400 hover:text-white hover:bg-violet-600 transition-all shadow-lg mb-2"
        title="My Profile"
      >
        <UserCircle2 size={24} />
      </button>

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
    className={`
      flex flex-col items-center justify-center w-full gap-1 py-3 px-1 transition-all relative group
      ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
    `}
  >
    {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-violet-500 rounded-r-full" />}
    <Icon size={24} className={`transition-all ${isActive ? 'text-violet-400 scale-110' : 'group-hover:scale-105'}`} />
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);

export default SidebarDock;
