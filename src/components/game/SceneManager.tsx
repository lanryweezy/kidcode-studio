import React, { useState } from 'react';
import { Plus, Trash2, Copy, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';

interface Scene {
  id: string;
  name: string;
  emoji: string;
  visible: boolean;
}

interface SceneManagerProps {
  scenes: Scene[];
  activeScene: string;
  onSceneSelect: (id: string) => void;
  onSceneAdd: () => void;
  onSceneDelete: (id: string) => void;
  onSceneDuplicate: (id: string) => void;
  onSceneRename: (id: string, name: string) => void;
  onSceneToggle: (id: string) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  scenes,
  activeScene,
  onSceneSelect,
  onSceneAdd,
  onSceneDelete,
  onSceneDuplicate,
  onSceneRename,
  onSceneToggle,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scenes</div>
        <Button variant="ghost" size="xs" icon={<Plus size={12} />} onClick={onSceneAdd}>Add</Button>
      </div>

      <div className="space-y-1">
        {scenes.map((scene, i) => (
          <div
            key={scene.id}
            onClick={() => onSceneSelect(scene.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
              activeScene === scene.id
                ? 'bg-violet-100 border border-violet-300'
                : 'bg-slate-50 border border-transparent hover:border-slate-200'
            }`}
          >
            <GripVertical size={12} className="text-slate-300 cursor-grab" />
            <span className="text-lg">{scene.emoji}</span>
            <input
              type="text"
              value={scene.name}
              onChange={(e) => { e.stopPropagation(); onSceneRename(scene.id, e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-xs font-bold bg-transparent border-none outline-none text-slate-700"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onSceneToggle(scene.id); }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                {scene.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSceneDuplicate(scene.id); }}
                className="p-1 text-slate-400 hover:text-blue-500"
              >
                <Copy size={12} />
              </button>
              {scenes.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSceneDelete(scene.id); }}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-400 text-center py-2">
        {scenes.length} scene{scenes.length !== 1 ? 's' : ''} • Drag to reorder
      </div>
    </div>
  );
};
