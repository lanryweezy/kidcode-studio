import React, { useEffect } from 'react';
import { X, Keyboard, Edit3, Play, Layout, Navigation } from 'lucide-react';
import { Button } from './Button';

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  label: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: 'General',
    icon: <Keyboard size={14} className="text-violet-500" />,
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save project' },
      { keys: ['?'], description: 'Show shortcuts' },
      { keys: ['Escape'], description: 'Close modal / cancel' },
    ],
  },
  {
    label: 'Editing',
    icon: <Edit3 size={14} className="text-blue-500" />,
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'C'], description: 'Copy block' },
      { keys: ['Ctrl', 'V'], description: 'Paste block' },
      { keys: ['Ctrl', 'A'], description: 'Select all blocks' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selection' },
      { keys: ['Delete'], description: 'Delete selected block' },
    ],
  },
  {
    label: 'Playback',
    icon: <Play size={14} className="text-emerald-500" />,
    shortcuts: [
      { keys: ['Ctrl', 'R'], description: 'Run / Stop code' },
      { keys: ['Space'], description: 'Play / Pause game' },
    ],
  },
  {
    label: 'Navigation',
    icon: <Navigation size={14} className="text-amber-500" />,
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Arrow Keys'], description: 'Move selected element' },
    ],
  },
];

export const ShortcutsOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-glass-lg border border-slate-200 animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Keyboard size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Keyboard Shortcuts</h2>
              <p className="text-[10px] text-slate-500 font-medium">Quick actions at your fingertips</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close shortcuts">
            <X size={18} />
          </Button>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {SHORTCUT_GROUPS.map((group, gi) => (
            <div key={gi} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                {group.icon}
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{group.label}</span>
              </div>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut, si) => (
                  <div key={si} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-sm text-slate-700 font-medium">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono font-semibold text-slate-600 shadow-sm min-w-[28px] text-center">
                            {key}
                          </kbd>
                          {ki < shortcut.keys.length - 1 && <span className="text-slate-300 text-xs font-bold">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
