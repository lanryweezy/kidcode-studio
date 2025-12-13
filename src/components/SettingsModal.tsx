
import React from 'react';
import { Moon, Sun, Download, Upload, Keyboard, FileJson, X } from 'lucide-react';

interface SettingsModalProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ darkMode, setDarkMode, onExport, onImport }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const shortcuts = [
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y', desc: 'Redo' },
    { key: 'Ctrl + S', desc: 'Save Project' },
    { key: 'Drag', desc: 'Move Block' },
    { key: 'Right Click', desc: 'Context Menu' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 transition-colors">
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Settings</h3>
        <p className="text-xs text-slate-400">Preferences & Tools</p>
      </div>
      
      <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        
        {/* Appearance */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appearance</h4>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-orange-100 text-orange-500'}`}>
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <div className="font-bold text-slate-700 dark:text-slate-200">Dark Mode</div>
                <div className="text-xs text-slate-400">Easier on the eyes at night</div>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Data</h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onExport}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 rounded-xl transition-all group"
            >
              <Download size={24} className="text-slate-400 group-hover:text-violet-500" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-violet-600">Export JSON</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-xl transition-all group"
            >
              <Upload size={24} className="text-slate-400 group-hover:text-emerald-500" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600">Import JSON</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImport(e.target.files[0]);
                  e.target.value = ''; // Reset
                }
              }}
            />
          </div>
        </section>

        {/* Shortcuts */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Keyboard size={14} /> Keyboard Shortcuts
          </h4>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{s.desc}</span>
                <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold text-slate-500 dark:text-slate-400 shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsModal;
