import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { CADObject3D, CADSketch } from '../../types/cad';

interface ModelTreeProps {
  objects: CADObject3D[];
  sketches: CADSketch[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const ModelTree: React.FC<ModelTreeProps> = ({
  objects,
  sketches,
  selectedIds,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename,
}) => {
  const [expanded, setExpanded] = React.useState({ objects: true, sketches: true });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleRenameConfirm = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'box': return '▣';
      case 'cylinder': return '◎';
      case 'sphere': return '●';
      case 'extrude': return '⬒';
      case 'revolve': return '↻';
      case 'boolean': return '⊕';
      case 'fillet': return '◎';
      case 'chamfer': return '◇';
      case 'shell': return '▢';
      case 'pattern': return '⊞';
      case 'sweep': return '⟿';
      case 'loft': return '⊿';
      default: return '◆';
    }
  };

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-700 text-[11px]">MODEL TREE</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-1">
          <button
            onClick={() => setExpanded(e => ({ ...e, objects: !e.objects }))}
            className="flex items-center gap-1 w-full px-2 py-1 rounded hover:bg-slate-100 text-slate-600 font-bold transition-colors"
          >
            {expanded.objects ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Objects ({objects.length})
          </button>
          {expanded.objects && (
            <div className="ml-2">
              {objects.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => onSelect(obj.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${
                    selectedIds.includes(obj.id)
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="text-sm">{getTypeIcon(obj.type)}</span>
                  {editingId === obj.id ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => handleRenameConfirm(obj.id)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameConfirm(obj.id)}
                      className="flex-1 px-1 py-0.5 border border-cyan-300 rounded text-xs outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="flex-1 truncate font-medium"
                      onDoubleClick={() => handleDoubleClick(obj.id, obj.name)}
                    >
                      {obj.name}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); onToggleVisibility(obj.id); }}
                      className="p-0.5 rounded hover:bg-slate-200"
                      title={obj.visible ? 'Hide' : 'Show'}
                    >
                      {obj.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onToggleLock(obj.id); }}
                      className="p-0.5 rounded hover:bg-slate-200"
                      title={obj.locked ? 'Unlock' : 'Lock'}
                    >
                      {obj.locked ? <Lock size={11} /> : <Unlock size={11} />}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDuplicate(obj.id); }}
                      className="p-0.5 rounded hover:bg-slate-200"
                      title="Duplicate"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(obj.id); }}
                      className="p-0.5 rounded hover:bg-red-100 text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {objects.length === 0 && (
                <p className="px-2 py-2 text-slate-400 italic">No objects yet</p>
              )}
            </div>
          )}
        </div>

        <div className="px-2 py-1">
          <button
            onClick={() => setExpanded(e => ({ ...e, sketches: !e.sketches }))}
            className="flex items-center gap-1 w-full px-2 py-1 rounded hover:bg-slate-100 text-slate-600 font-bold transition-colors"
          >
            {expanded.sketches ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Sketches ({sketches.length})
          </button>
          {expanded.sketches && (
            <div className="ml-2">
              {sketches.map(sk => (
                <div
                  key={sk.id}
                  onClick={() => onSelect(sk.id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-600 transition-colors group"
                >
                  <span className="text-sm">✎</span>
                  <span className="flex-1 truncate font-medium">{sk.name}</span>
                  <span className="text-[10px] text-slate-400">{sk.shapes.length} shapes</span>
                </div>
              ))}
              {sketches.length === 0 && (
                <p className="px-2 py-2 text-slate-400 italic">No sketches yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ModelTree);
