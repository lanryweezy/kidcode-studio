import React, { useState } from 'react';
import { Plus, Trash2, Play, Pause, Camera, MessageSquare, Music, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

type CutsceneActionType = 'camera_move' | 'dialogue' | 'fade' | 'shake' | 'music' | 'spawn' | 'wait';

interface CutsceneAction {
  id: string;
  type: CutsceneActionType;
  duration: number;
  params: Record<string, any>;
}

interface CutsceneEditorProps {
  onClose: () => void;
  onSave: (actions: CutsceneAction[]) => void;
  initialActions?: CutsceneAction[];
}

const ACTION_TYPES: { type: CutsceneActionType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'camera_move', label: 'Camera Move', icon: <Camera size={14} />, color: 'bg-blue-500' },
  { type: 'dialogue', label: 'Dialogue', icon: <MessageSquare size={14} />, color: 'bg-amber-500' },
  { type: 'fade', label: 'Fade', icon: <div className="w-3 h-3 bg-gradient-to-b from-white to-black rounded" />, color: 'bg-slate-500' },
  { type: 'shake', label: 'Screen Shake', icon: <Zap size={14} />, color: 'bg-red-500' },
  { type: 'music', label: 'Play Music', icon: <Music size={14} />, color: 'bg-purple-500' },
  { type: 'spawn', label: 'Spawn Effect', icon: <Zap size={14} />, color: 'bg-orange-500' },
  { type: 'wait', label: 'Wait', icon: <Pause size={14} />, color: 'bg-slate-400' },
];

const createAction = (type: CutsceneActionType): CutsceneAction => {
  const base = { id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type, duration: 1 };
  switch (type) {
    case 'camera_move': return { ...base, params: { x: 0, y: 0, zoom: 1 } };
    case 'dialogue': return { ...base, params: { speaker: 'Narrator', text: 'Once upon a time...' } };
    case 'fade': return { ...base, params: { direction: 'in', color: '#000000' } };
    case 'shake': return { ...base, params: { intensity: 5 } };
    case 'music': return { ...base, params: { track: 'battle', volume: 0.8 } };
    case 'spawn': return { ...base, params: { effect: 'sparkle', x: 100, y: 100 } };
    case 'wait': return { ...base, params: {} };
  }
};

export const CutsceneEditor: React.FC<CutsceneEditorProps> = ({ onClose, onSave, initialActions }) => {
  const [actions, setActions] = useState<CutsceneAction[]>(initialActions || []);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const addAction = (type: CutsceneActionType) => {
    const newAction = createAction(type);
    setActions([...actions, newAction]);
    setSelectedAction(newAction.id);
  };

  const deleteAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
    if (selectedAction === id) setSelectedAction(null);
  };

  const updateAction = (id: string, updates: Partial<CutsceneAction>) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const updateParams = (id: string, paramUpdates: Record<string, any>) => {
    setActions(actions.map(a => a.id === id ? { ...a, params: { ...a.params, ...paramUpdates } } : a));
  };

  const selected = actions.find(a => a.id === selectedAction);
  const totalTime = actions.reduce((sum, a) => sum + a.duration, 0);

  const handleSave = () => {
    onSave(actions);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Cutscene Editor</h3>
          <p className="text-[10px] text-slate-400">{actions.length} actions • {totalTime.toFixed(1)}s total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="xs" icon={isPlaying ? <Pause size={12} /> : <Play size={12} />} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>

      {/* Action List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {actions.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No actions yet. Add one below.
          </div>
        )}
        {actions.map((action, i) => {
          const actionType = ACTION_TYPES.find(t => t.type === action.type);
          return (
            <div
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                selectedAction === action.id
                  ? 'bg-violet-100 border border-violet-300'
                  : 'bg-slate-50 border border-transparent hover:border-slate-200'
              }`}
            >
              <span className="text-xs text-slate-400 w-4">{i + 1}</span>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-white ${actionType?.color}`}>
                {actionType?.icon}
              </span>
              <span className="text-xs font-bold text-slate-700 flex-1">{actionType?.label}</span>
              <span className="text-[10px] text-slate-400">{action.duration}s</span>
              <button onClick={(e) => { e.stopPropagation(); deleteAction(action.id); }} className="p-1 text-slate-400 hover:text-red-500">
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Editor */}
      {selected && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase">Edit Action</div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Duration (seconds)</label>
            <input
              type="number"
              value={selected.duration}
              onChange={(e) => updateAction(selected.id, { duration: parseFloat(e.target.value) || 1 })}
              min={0.1}
              max={30}
              step={0.1}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
            />
          </div>

          {selected.type === 'dialogue' && (
            <>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Speaker</label>
                <input
                  type="text"
                  value={selected.params.speaker || ''}
                  onChange={(e) => updateParams(selected.id, { speaker: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Text</label>
                <textarea
                  value={selected.params.text || ''}
                  onChange={(e) => updateParams(selected.id, { text: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm resize-none h-16"
                />
              </div>
            </>
          )}

          {selected.type === 'camera_move' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">X</label>
                <input type="number" value={selected.params.x || 0} onChange={(e) => updateParams(selected.id, { x: parseInt(e.target.value) })} className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Y</label>
                <input type="number" value={selected.params.y || 0} onChange={(e) => updateParams(selected.id, { y: parseInt(e.target.value) })} className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Zoom</label>
                <input type="number" value={selected.params.zoom || 1} onChange={(e) => updateParams(selected.id, { zoom: parseFloat(e.target.value) })} step={0.1} className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs" />
              </div>
            </div>
          )}

          {selected.type === 'shake' && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Intensity</label>
              <input
                type="range"
                value={selected.params.intensity || 5}
                onChange={(e) => updateParams(selected.id, { intensity: parseInt(e.target.value) })}
                min={1}
                max={20}
                className="w-full"
              />
            </div>
          )}

          {selected.type === 'fade' && (
            <div className="flex gap-2">
              <button
                onClick={() => updateParams(selected.id, { direction: 'in' })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${selected.params.direction === 'in' ? 'bg-violet-500 text-white' : 'bg-slate-200'}`}>
                Fade In
              </button>
              <button
                onClick={() => updateParams(selected.id, { direction: 'out' })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${selected.params.direction === 'out' ? 'bg-violet-500 text-white' : 'bg-slate-200'}`}>
                Fade Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Action Buttons */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Add Action</div>
        <div className="grid grid-cols-4 gap-1">
          {ACTION_TYPES.map(actionType => (
            <button
              key={actionType.type}
              onClick={() => addAction(actionType.type)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-white ${actionType.color} hover:opacity-90 transition-opacity`}
            >
              {actionType.icon}
              <span className="text-[9px] font-bold">{actionType.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={handleSave}>Save Cutscene</Button>
    </div>
  );
};
