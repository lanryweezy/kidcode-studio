import React, { useState } from 'react';
import { ArrowUpDown, RotateCcw, GitMerge, Ruler, Copy, FlipHorizontal2, Grid3x3 } from 'lucide-react';
import { CADState, CADOperationType, CADMirrorPlane } from '../../types/cad';

interface OperationsPanelProps {
  state: CADState;
  onOperation: (type: CADOperationType, params: Record<string, number | string>) => void;
  onStateChange: (updates: Partial<CADState>) => void;
  hasSelection: boolean;
}

const OperationsPanel: React.FC<OperationsPanelProps> = ({
  state,
  onOperation,
  onStateChange,
  hasSelection,
}) => {
  const [extrudeHeight, setExtrudeHeight] = useState(20);
  const [extrudeDraft, setExtrudeDraft] = useState(0);
  const [revolveAngle, setRevolveAngle] = useState(360);
  const [filletRadius, setFilletRadius] = useState(2);
  const [chamferDist, setChamferDist] = useState(2);
  const [shellThickness, setShellThickness] = useState(2);
  const [linearCount, setLinearCount] = useState(5);
  const [linearSpacing, setLinearSpacing] = useState(20);
  const [linearAxis, setLinearAxis] = useState<'X' | 'Y' | 'Z'>('X');
  const [circularCount, setCircularCount] = useState(8);
  const [circularRadius, setCircularRadius] = useState(30);
  const [circularAxis, setCircularAxis] = useState<'Y' | 'X' | 'Z'>('Y');
  const [mirrorPlane, setMirrorPlane] = useState<CADMirrorPlane>('XY');
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (section: string) => setOpenSection(openSection === section ? null : section);

  const btnClass = (active: boolean = false) =>
    `w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-[11px] font-bold ${
      active
        ? 'bg-cyan-100 border-cyan-300 text-cyan-700'
        : 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600'
    }`;

  const disabledNote = !hasSelection && (
    <p className="text-[10px] text-amber-500 italic px-1">Select an object first</p>
  );

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-700 text-[11px]">OPERATIONS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <Section title="Create" isOpen={openSection === 'create'} onToggle={() => toggle('create')}>
          <div className="space-y-1.5">
            {[
              { type: 'extrude' as const, label: 'Extrude', desc: 'Pull 2D shape into 3D', color: 'from-cyan-500 to-blue-500' },
              { type: 'revolve' as const, label: 'Revolve', desc: 'Spin profile around axis', color: 'from-violet-500 to-purple-500' },
              { type: 'sweep' as const, label: 'Sweep', desc: 'Extrude along a path', color: 'from-pink-500 to-rose-500' },
              { type: 'loft' as const, label: 'Loft', desc: 'Blend between profiles', color: 'from-amber-500 to-orange-500' },
            ].map(op => (
              <div key={op.type}>
                <button
                  onClick={() => {
                    if (op.type === 'extrude') onOperation('extrude', { distance: extrudeHeight, draftAngle: extrudeDraft });
                    else if (op.type === 'revolve') onOperation('revolve', { angle: revolveAngle });
                    else onOperation(op.type, {});
                  }}
                  disabled={!hasSelection && op.type !== 'extrude'}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r ${op.color} text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50`}
                >
                  <div className="text-left">
                    <div className="text-xs font-bold">{op.label}</div>
                    <div className="text-[10px] opacity-80 font-normal">{op.desc}</div>
                  </div>
                </button>
                {op.type === 'extrude' && (
                  <div className="mt-1.5 ml-1 space-y-2 p-2 bg-slate-50 rounded-lg">
                    <Slider label="Height" value={extrudeHeight} min={1} max={200} unit="mm" onChange={setExtrudeHeight} />
                    <Slider label="Draft" value={extrudeDraft} min={-45} max={45} unit="°" step={0.5} onChange={setExtrudeDraft} />
                  </div>
                )}
                {op.type === 'revolve' && (
                  <div className="mt-1.5 ml-1 space-y-2 p-2 bg-slate-50 rounded-lg">
                    <Slider label="Angle" value={revolveAngle} min={1} max={360} unit="°" onChange={setRevolveAngle} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Modify" isOpen={openSection === 'modify'} onToggle={() => toggle('modify')}>
          {disabledNote}
          <div className="space-y-1.5">
            <button onClick={() => onOperation('fillet', { radius: filletRadius })} disabled={!hasSelection} className={btnClass()}>
              <span className="text-cyan-500">◎</span>
              <div>
                <div>Fillet</div>
                <div className="text-[10px] text-slate-400 font-normal">Round edges</div>
              </div>
            </button>
            <Slider label="Radius" value={filletRadius} min={0.5} max={50} unit="mm" step={0.5} onChange={setFilletRadius} />

            <button onClick={() => onOperation('chamfer', { distance: chamferDist })} disabled={!hasSelection} className={btnClass()}>
              <span className="text-cyan-500">◇</span>
              <div>
                <div>Chamfer</div>
                <div className="text-[10px] text-slate-400 font-normal">Bevel edges at 45°</div>
              </div>
            </button>
            <Slider label="Distance" value={chamferDist} min={0.5} max={50} unit="mm" step={0.5} onChange={setChamferDist} />

            <button onClick={() => onOperation('shell', { wallThickness: shellThickness })} disabled={!hasSelection} className={btnClass()}>
              <span className="text-cyan-500">▢</span>
              <div>
                <div>Shell</div>
                <div className="text-[10px] text-slate-400 font-normal">Hollow out with wall thickness</div>
              </div>
            </button>
            <Slider label="Wall" value={shellThickness} min={0.5} max={50} unit="mm" step={0.5} onChange={setShellThickness} />
          </div>
        </Section>

        <Section title="Pattern" isOpen={openSection === 'pattern'} onToggle={() => toggle('pattern')}>
          {disabledNote}
          <div className="space-y-1.5">
            <button onClick={() => onOperation('linear_array', { count: linearCount, spacing: linearSpacing, axis: linearAxis })} disabled={!hasSelection} className={btnClass()}>
              <Copy size={14} className="text-cyan-500" />
              <div>
                <div>Linear Array</div>
                <div className="text-[10px] text-slate-400 font-normal">Duplicate along axis</div>
              </div>
            </button>
            <div className="ml-1 space-y-2 p-2 bg-slate-50 rounded-lg">
              <div className="flex gap-1">
                {(['X', 'Y', 'Z'] as const).map(ax => (
                  <button key={ax} onClick={() => setLinearAxis(ax)} className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${linearAxis === ax ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{ax}</button>
                ))}
              </div>
              <Slider label="Count" value={linearCount} min={2} max={100} unit="" onChange={setLinearCount} />
              <Slider label="Spacing" value={linearSpacing} min={1} max={500} unit="mm" onChange={setLinearSpacing} />
            </div>

            <button onClick={() => onOperation('circular_array', { count: circularCount, radius: circularRadius, axis: circularAxis })} disabled={!hasSelection} className={btnClass()}>
              <Grid3x3 size={14} className="text-cyan-500" />
              <div>
                <div>Circular Array</div>
                <div className="text-[10px] text-slate-400 font-normal">Duplicate around axis</div>
              </div>
            </button>
            <div className="ml-1 space-y-2 p-2 bg-slate-50 rounded-lg">
              <div className="flex gap-1">
                {(['Y', 'X', 'Z'] as const).map(ax => (
                  <button key={ax} onClick={() => setCircularAxis(ax)} className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${circularAxis === ax ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{ax}</button>
                ))}
              </div>
              <Slider label="Count" value={circularCount} min={2} max={100} unit="" onChange={setCircularCount} />
              <Slider label="Radius" value={circularRadius} min={1} max={500} unit="mm" onChange={setCircularRadius} />
            </div>

            <button onClick={() => onOperation('mirror', { plane: mirrorPlane as unknown as number })} disabled={!hasSelection} className={btnClass()}>
              <FlipHorizontal2 size={14} className="text-cyan-500" />
              <div>
                <div>Mirror</div>
                <div className="text-[10px] text-slate-400 font-normal">Mirror across plane</div>
              </div>
            </button>
            <div className="ml-1 p-2 bg-slate-50 rounded-lg">
              <div className="flex gap-1">
                {(['XY', 'XZ', 'YZ'] as CADMirrorPlane[]).map(p => (
                  <button key={p} onClick={() => setMirrorPlane(p)} className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${mirrorPlane === p ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Boolean" isOpen={openSection === 'boolean'} onToggle={() => toggle('boolean')}>
          {disabledNote}
          <div className="space-y-1.5">
            {[
              { type: 'union' as const, label: 'Union', desc: 'Merge objects together' },
              { type: 'subtract' as const, label: 'Subtract', desc: 'Cut one from another' },
              { type: 'intersect' as const, label: 'Intersect', desc: 'Keep overlapping volume' },
            ].map(b => (
              <button key={b.type} onClick={() => onOperation(b.type, {})} disabled={!hasSelection} className={btnClass()}>
                <GitMerge size={14} className="text-cyan-500" />
                <div>
                  <div>{b.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{b.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Measure" isOpen={openSection === 'measure'} onToggle={() => toggle('measure')}>
          <div className="space-y-1.5">
            {[
              { mode: 'distance' as const, label: 'Distance', icon: '📏' },
              { mode: 'angle' as const, label: 'Angle', icon: '📐' },
              { mode: 'radius' as const, label: 'Radius', icon: '⭕' },
              { mode: 'area' as const, label: 'Area', icon: '⬡' },
              { mode: 'volume' as const, label: 'Volume', icon: '🧊' },
            ].map(m => (
              <button
                key={m.mode}
                onClick={() => onStateChange({ measureMode: state.measureMode === m.mode ? 'none' : m.mode, measurePoints: [] })}
                className={btnClass(state.measureMode === m.mode)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({
  title, isOpen, onToggle, children,
}) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors">
      <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wide">{title}</span>
      <span className="text-slate-400 text-[10px]">{isOpen ? '▾' : '▸'}</span>
    </button>
    {isOpen && <div className="p-2 space-y-2">{children}</div>}
  </div>
);

const Slider: React.FC<{
  label: string; value: number; min: number; max: number; unit: string; step?: number; onChange: (v: number) => void;
}> = ({ label, value, min, max, unit, step = 1, onChange }) => (
  <div>
    <div className="flex justify-between mb-0.5">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="font-mono text-[10px]">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1 rounded-full appearance-none bg-slate-200 accent-cyan-500"
    />
  </div>
);

export default React.memo(OperationsPanel);
