
import React, { useState } from 'react';
import { Download, Upload, Keyboard, Eye, Loader2, Check, FileJson, Trash2 } from 'lucide-react';
import { exportAllData, deleteAllData } from '../services/gdprService';

interface SettingsModalProps {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ highContrast, setHighContrast, onExport, onImport }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportAllSuccess, setExportAllSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    await new Promise(r => setTimeout(r, 600));
    onExport();
    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportSuccess(false);
    await new Promise(r => setTimeout(r, 600));
    onImport(file);
    setIsImporting(false);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 2000);
  };

  const handleExportAll = async () => {
    setIsExportingAll(true);
    setExportAllSuccess(false);
    try {
      await exportAllData();
      setExportAllSuccess(true);
      setTimeout(() => setExportAllSuccess(false), 2000);
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    setDeleteSuccess(false);
    try {
      await deleteAllData();
      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
      setTimeout(() => setDeleteSuccess(false), 2000);
    } finally {
      setIsDeleting(false);
    }
  };

  const shortcuts = [
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y', desc: 'Redo' },
    { key: 'Ctrl + S', desc: 'Save Project' },
    { key: 'Drag', desc: 'Move Block' },
    { key: 'Right Click', desc: 'Context Menu' },
  ];

  return (
    <div className="h-full flex flex-col bg-white transition-colors">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-slate-700 text-lg">Settings</h3>
        <p className="text-xs text-slate-400">Preferences & Tools</p>
      </div>
      
      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        
        {/* Visual Grouping Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display & Accessibility</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Accessibility */}
        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Accessibility</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-yellow-100 text-yellow-600">
                <Eye size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-700">High Contrast</div>
                <div className="text-xs text-slate-400">Increases visibility for low vision</div>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${highContrast ? 'bg-yellow-500' : 'bg-slate-300'}`}
              aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${highContrast ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Visual Grouping Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data & Shortcuts</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Data Management */}
        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Project Data</h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 hover:border-violet-200 rounded-xl transition-all group hover:shadow-md disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={24} className="text-violet-500 animate-spin" />
              ) : exportSuccess ? (
                <Check size={24} className="text-green-500" />
              ) : (
                <Download size={24} className="text-slate-400 group-hover:text-violet-500 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-bold text-slate-600 group-hover:text-violet-600">
                {isExporting ? 'Exporting...' : exportSuccess ? 'Done!' : 'Export JSON'}
              </span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 hover:border-emerald-200 rounded-xl transition-all group hover:shadow-md disabled:opacity-50"
            >
              {isImporting ? (
                <Loader2 size={24} className="text-emerald-500 animate-spin" />
              ) : importSuccess ? (
                <Check size={24} className="text-green-500" />
              ) : (
                <Upload size={24} className="text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600">
                {isImporting ? 'Importing...' : importSuccess ? 'Loaded!' : 'Import JSON'}
              </span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImport(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </section>

        {/* Privacy & Data Rights */}
        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Privacy & Data Rights</h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExportAll}
              disabled={isExportingAll}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 hover:border-blue-200 rounded-xl transition-all group hover:shadow-md disabled:opacity-50"
            >
              {isExportingAll ? (
                <Loader2 size={24} className="text-blue-500 animate-spin" />
              ) : exportAllSuccess ? (
                <Check size={24} className="text-green-500" />
              ) : (
                <FileJson size={24} className="text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">
                {isExportingAll ? 'Exporting...' : exportAllSuccess ? 'Downloaded!' : 'Export All Data'}
              </span>
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 hover:border-red-200 rounded-xl transition-all group hover:shadow-md disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 size={24} className="text-red-500 animate-spin" />
              ) : deleteSuccess ? (
                <Check size={24} className="text-green-500" />
              ) : (
                <Trash2 size={24} className="text-slate-400 group-hover:text-red-500 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-bold text-slate-600 group-hover:text-red-600">
                {isDeleting ? 'Deleting...' : deleteSuccess ? 'Deleted!' : 'Delete All Data'}
              </span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Your data is stored locally on this device only.
          </p>
        </section>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
              <h4 className="font-bold text-slate-700 text-lg mb-2">Delete All Data?</h4>
              <p className="text-slate-500 text-sm mb-4">
                This will permanently remove all projects, settings, and analytics from this device. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Everything'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Grouping Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Legal</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Legal Links */}
        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Legal Documents</h4>
          <div className="space-y-2">
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-violet-200 transition-colors group"
            >
              <span className="text-sm font-bold text-slate-600 group-hover:text-violet-600">Privacy Policy</span>
              <span className="text-xs text-slate-400">↗</span>
            </a>
            <a
              href="/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-violet-200 transition-colors group"
            >
              <span className="text-sm font-bold text-slate-600 group-hover:text-violet-600">Terms of Service</span>
              <span className="text-xs text-slate-400">↗</span>
            </a>
          </div>
        </section>

        {/* Shortcuts */}
        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Keyboard size={14} /> Keyboard Shortcuts
          </h4>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-3">
                <span className="text-sm font-medium text-slate-600">{s.desc}</span>
                <kbd className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-500 shadow-sm">
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