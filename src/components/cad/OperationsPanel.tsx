import React from 'react';
import { ArrowUpDown, RotateCcw, GitMerge, Minus, Box, Cylinder, Circle, Plus } from 'lucide-react';
import { CADState, CADObject3D, CADOperationType } from '../../types/cad';

interface OperationsPanelProps {
  state: CADState;
  onOperation: (type: CADOperationType, params: Record<string, number>) => void;
  onStateChange: (updates: Partial<CADState>) => void;
}

const OPERATIONS = [
  { type: 'extrude' as const, label: 'Extrude', icon: ArrowUpDown, color: 'from-cyan-500 to-blue-500', description: 'Pull a 2D shape into 3D' },
  { type: 'revolve' as const, label: 'Revolve', icon: RotateCcw, color: 'from-violet-500 to-purple-500', description: 'Spin a profile around an axis' },
  { type: 'sweep' as const, label: 'Sweep', icon: GitMerge, color: 'from-pink-500 to-rose-500', description: 'Extrude along a path' },
  { type: 'loft' as const, label: 'Loft', icon: Plus, color: 'from-amber-500 to-orange-500', description: 'Blend between profiles' },
];

const BOOLEANS = [
  { type: 'union' as const, label: 'Union', description: 'Merge objects together' },
  { type: 'subtract' as const, label: 'Subtract', description: 'Cut one from another' },
  { type: 'intersect' as const, label: 'Intersect', description: 'Keep overlapping volume' },
];

const OperationsPanel: React.FC<OperationsPanelProps> = ({
  state,
  onOperation,
  onStateChange,
}) => {
  const [extrudeHeight, setExtrudeHeight] = React.useState(20);
  const [extrudeDraft, setExtrudeDraft] = React.useState(0);
  const [revolveAngle, setRevolveAngle] = React.useState(360);

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-700 text-[11px]">3D OPERATIONS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Operations</h4>
          <div className="space-y-2">
            {OPERATIONS.map(op => {
              const Icon = op.icon;
              return (
                <div key={op.type}>
                  <button
                    onClick={() => {
                      if (op.type === 'extrude') {
                        onOperation('extrude', { distance: extrudeHeight, draftAngle: extrudeDraft });
                      } else if (op.type === 'revolve') {
                        onOperation('revolve', { angle: revolveAngle });
                      } else {
                        onOperation(op.type, {});
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r ${op.color} text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all`}
                  >
                    <Icon size={16} />
                    <div className="text-left">
                      <div className="text-xs font-bold">{op.label}</div>
                      <div className="text-[10px] opacity-80 font-normal">{op.description}</div>
                    </div>
                  </button>

                  {op.type === 'extrude' && (
                    <div className="mt-2 ml-1 space-y-2 p-2 bg-slate-50 rounded-lg">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-slate-500">Height</span>
                          <span className="font-mono text-[10px]">{extrudeHeight}mm</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={200}
                          step={1}
                          value={extrudeHeight}
                          onChange={e => setExtrudeHeight(parseInt(e.target.value))}
                          className="w-full h-1 rounded-full appearance-none bg-slate-200 accent-cyan-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-slate-500">Draft Angle</span>
                          <span className="font-mono text-[10px]">{extrudeDraft}°</span>
                        </div>
                        <input
                          type="range"
                          min={-45}
                          max={45}
                          step={0.5}
                          value={extrudeDraft}
                          onChange={e => setExtrudeDraft(parseFloat(e.target.value))}
                          className="w-full h-1 rounded-full appearance-none bg-slate-200 accent-cyan-500"
                        />
                      </div>
                    </div>
                  )}

                  {op.type === 'revolve' && (
                    <div className="mt-2 ml-1 space-y-2 p-2 bg-slate-50 rounded-lg">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-slate-500">Angle</span>
                          <span className="font-mono text-[10px]">{revolveAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={360}
                          step={1}
                          value={revolveAngle}
                          onChange={e => setRevolveAngle(parseInt(e.target.value))}
                          className="w-full h-1 rounded-full appearance-none bg-slate-200 accent-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Boolean</h4>
          <div className="space-y-1.5">
            {BOOLEANS.map(b => (
              <button
                key={b.type}
                onClick={() => onOperation(b.type, {})}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 transition-all text-left"
              >
                <GitMerge size={14} className="text-cyan-500" />
                <div>
                  <div className="text-[11px] font-bold">{b.label}</div>
                  <div className="text-[10px] text-slate-400">{b.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Measure</h4>
          <div className="space-y-1.5">
            {[
              { mode: 'distance' as const, label: 'Distance', icon: '📏' },
              { mode: 'angle' as const, label: 'Angle', icon: '📐' },
              { mode: 'area' as const, label: 'Area', icon: '⬡' },
              { mode: 'volume' as const, label: 'Volume', icon: '🧊' },
            ].map(m => (
              <button
                key={m.mode}
                onClick={() => onStateChange({ measureMode: state.measureMode === m.mode ? 'none' : m.mode })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                  state.measureMode === m.mode
                    ? 'bg-cyan-100 border border-cyan-300 text-cyan-700'
                    : 'border border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span>{m.icon}</span>
                <span className="text-[11px] font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OperationsPanel);
