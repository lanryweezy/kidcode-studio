import React from 'react';
import {
  Box, Cylinder, Circle, Undo2, Redo2, Grid3x3, Eye, EyeOff,
  Scissors, Ruler, Download, Maximize2, Crosshair, RotateCw, Printer, Table2, Settings2,
} from 'lucide-react';
import { CADState, CADViewPreset, CADExportOptions } from '../../types/cad';

interface CADToolbarProps {
  state: CADState;
  onStateChange: (updates: Partial<CADState>) => void;
  onExport: (options: CADExportOptions) => void;
  onAddObject: (type: 'box' | 'cylinder' | 'sphere') => void;
  onUndo: () => void;
  onRedo: () => void;
}

const VIEW_PRESETS: { preset: CADViewPreset; label: string; icon: string }[] = [
  { preset: 'front', label: 'Front', icon: 'F' },
  { preset: 'back', label: 'Back', icon: 'B' },
  { preset: 'left', label: 'Left', icon: 'L' },
  { preset: 'right', label: 'Right', icon: 'R' },
  { preset: 'top', label: 'Top', icon: 'T' },
  { preset: 'bottom', label: 'Bottom', icon: 'Bo' },
  { preset: 'isometric', label: 'Iso', icon: '3D' },
  { preset: 'home', label: 'Home', icon: 'H' },
];

const CADToolbar: React.FC<CADToolbarProps> = ({
  state,
  onStateChange,
  onExport,
  onAddObject,
  onUndo,
  onRedo,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showViewMenu, setShowViewMenu] = React.useState(false);

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto">
      <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
        <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded-lg transition-colors ${canUndo ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-700' : 'text-slate-300 cursor-not-allowed'}`} title="Undo (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded-lg transition-colors ${canRedo ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-700' : 'text-slate-300 cursor-not-allowed'}`} title="Redo (Ctrl+Y)">
          <Redo2 size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 px-3 border-r border-slate-200">
        <button onClick={() => onAddObject('box')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors text-xs font-medium" title="Add Box">
          <Box size={16} />
          <span className="hidden md:inline">Box</span>
        </button>
        <button onClick={() => onAddObject('cylinder')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors text-xs font-medium" title="Add Cylinder">
          <Cylinder size={16} />
          <span className="hidden md:inline">Cylinder</span>
        </button>
        <button onClick={() => onAddObject('sphere')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors text-xs font-medium" title="Add Sphere">
          <Circle size={16} />
          <span className="hidden md:inline">Sphere</span>
        </button>
      </div>

      <div className="flex items-center gap-1 px-3 border-r border-slate-200">
        <button onClick={() => onStateChange({ showGrid: !state.showGrid })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.showGrid ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Toggle Grid">
          <Grid3x3 size={16} />
        </button>
        <button onClick={() => onStateChange({ wireframeMode: !state.wireframeMode })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.wireframeMode ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Wireframe">
          <Eye size={16} />
        </button>
        <button onClick={() => onStateChange({ showDimensions: !state.showDimensions })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.showDimensions ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Dimensions">
          <Ruler size={16} />
        </button>
        <button onClick={() => onStateChange({ crossSectionEnabled: !state.crossSectionEnabled })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.crossSectionEnabled ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Cross Section">
          <Scissors size={16} />
        </button>
        <button onClick={() => onStateChange({ explodedView: !state.explodedView })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.explodedView ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Exploded View">
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 px-3 border-r border-slate-200 relative">
        <button onClick={() => setShowViewMenu(!showViewMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors text-xs font-medium">
          <Crosshair size={14} />
          <span>View</span>
        </button>
        {showViewMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowViewMenu(false)} />
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 min-w-[140px]">
              {VIEW_PRESETS.map(v => (
                <button key={v.preset} onClick={() => { onStateChange({ viewPreset: v.preset }); setShowViewMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 text-xs font-medium transition-colors">
                  <span className="w-5 text-center text-[10px] font-bold bg-slate-100 rounded">{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 px-3 border-r border-slate-200">
        <button onClick={() => onStateChange({ activePanel: state.activePanel === 'bom' ? 'properties' : 'bom' })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.activePanel === 'bom' ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Bill of Materials">
          <Table2 size={16} />
        </button>
        <button onClick={() => onStateChange({ activePanel: state.activePanel === 'print' ? 'properties' : 'print' })} className={`p-1.5 rounded-lg transition-colors text-xs ${state.activePanel === 'print' ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Print Preview">
          <Printer size={16} />
        </button>
      </div>

      <div className="flex-1" />

      <div className="relative">
        <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all">
          <Download size={14} />
          Export
        </button>
        {showExportMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
            <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 min-w-[180px]">
              {[
                { format: 'stl' as const, label: 'STL (ASCII)' },
                { format: 'stl_binary' as const, label: 'STL (Binary)' },
                { format: 'obj' as const, label: 'OBJ' },
                { format: 'gltf' as const, label: 'GLTF' },
                { format: 'glb' as const, label: 'GLB' },
                { format: '3mf' as const, label: '3MF' },
                { format: 'step' as const, label: 'STEP (stub)' },
              ].map(opt => (
                <button key={opt.format} onClick={() => { onExport({ format: opt.format, unit: 'mm', includeColors: false }); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-50 text-slate-600 text-xs font-medium transition-colors">
                  <Download size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(CADToolbar);
