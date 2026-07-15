import React, { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from './Button';

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Y'], description: 'Redo' },
  { keys: ['Ctrl', 'S'], description: 'Save project' },
  { keys: ['Ctrl', 'R'], description: 'Run / Stop code' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Escape'], description: 'Close modal / cancel' },
  { keys: ['Delete'], description: 'Delete selected block' },
  { keys: ['Ctrl', 'C'], description: 'Copy block' },
  { keys: ['Ctrl', 'V'], description: 'Paste block' },
  { keys: ['Ctrl', 'A'], description: 'Select all blocks' },
  { keys: ['Ctrl', 'D'], description: 'Duplicate selection' },
  { keys: ['Space'], description: 'Play / Pause game' },
  { keys: ['Arrow Keys'], description: 'Move selected element' },
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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-glass-lg border border-slate-200 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-violet-500" />
            <h2 className="text-lg font-bold text-slate-900">Shortcuts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {SHORTCUTS.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <React.Fragment key={j}>
                      <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm">
                        {key}
                      </kbd>
                      {j < shortcut.keys.length - 1 && <span className="text-slate-400 text-xs">+</span>}
                    </React.Fragment>
                  ))}
                </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
