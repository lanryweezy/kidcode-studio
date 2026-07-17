import React, { useState } from 'react';
import { Save, FolderOpen, Trash2, Clock, Download, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

interface GameSaveSlot {
  id: string;
  name: string;
  timestamp: number;
  thumbnail?: string;
  level: number;
  score: number;
}

interface GameSaveLoadProps {
  saves: GameSaveSlot[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const GameSaveLoad: React.FC<GameSaveLoadProps> = ({
  saves,
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
}) => {
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName.trim());
      setSaveName('');
      setShowSaveInput(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()  } ${  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Save / Load</div>

      {/* Save Button */}
      {showSaveInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Save name..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
            autoFocus
          />
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSaveInput(false)}>Never mind</Button>
        </div>
      ) : (
        <Button variant="primary" fullWidth icon={<Save size={14} />} onClick={() => setShowSaveInput(true)}>
          Save Game State
        </Button>
      )}

      {/* Export/Import */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" fullWidth icon={<Download size={14} />} onClick={onExport}>
          Export
        </Button>
        <Button variant="secondary" size="sm" fullWidth icon={<Upload size={14} />} onClick={handleImport}>
          Import
        </Button>
      </div>

      {/* Save Slots */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {saves.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs">
            No saves yet. Save your game state to preserve progress.
          </div>
        )}
        {saves.map(save => (
          <div
            key={save.id}
            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-violet-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-700 truncate">{save.name}</div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Clock size={10} />
                {formatTime(save.timestamp)}
                <span>•</span>
                <span>Level {save.level}</span>
                <span>•</span>
                <span>{save.score} pts</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onLoad(save.id)}
                className="p-1.5 text-violet-500 hover:bg-violet-100 rounded transition-colors"
                title="Load"
              >
                <FolderOpen size={14} />
              </button>
              <button
                onClick={() => onDelete(save.id)}
                className="p-1.5 text-red-400 hover:bg-red-100 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-400 text-center">
        Saves include: tilemap, enemies, items, weather, physics, score, health
      </div>
    </div>
  );
};
