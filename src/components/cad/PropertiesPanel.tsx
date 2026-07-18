import React from 'react';
import { CADObject3D, CADParameter, CADMaterialType, CAD_MATERIALS } from '../../types/cad';
import { calculateObjectVolume } from '../../services/cadParametrics';

interface PropertiesPanelProps {
  selectedObject: CADObject3D | null;
  materialId: string;
  onParameterChange: (objectId: string, paramName: string, value: number) => void;
  onMaterialChange: (materialId: string) => void;
  onPositionChange: (objectId: string, axis: 'x' | 'y' | 'z', value: number) => void;
  onRotationChange: (objectId: string, axis: 'x' | 'y' | 'z', value: number) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  materialId,
  onParameterChange,
  onMaterialChange,
  onPositionChange,
  onRotationChange,
}) => {
  const volume = selectedObject?.geometry ? calculateObjectVolume(selectedObject.geometry) : 0;

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-700 text-[11px]">PROPERTIES</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Material</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(CAD_MATERIALS) as CADMaterialType[]).map(type => {
              const mat = CAD_MATERIALS[type];
              return (
                <button
                  key={type}
                  onClick={() => onMaterialChange(type)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-left ${
                    materialId === type
                      ? 'border-cyan-400 bg-cyan-50 ring-1 ring-cyan-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-slate-200 shadow-inner"
                    style={{ backgroundColor: mat.color }}
                  />
                  <span className="font-medium text-[11px]">{mat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedObject && (
          <>
            <div>
              <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Position</h4>
              <div className="space-y-1">
                {(['x', 'y', 'z'] as const).map(axis => (
                  <div key={axis} className="flex items-center gap-2">
                    <span className="w-4 font-bold text-slate-400 text-center">{axis.toUpperCase()}</span>
                    <input
                      type="number"
                      value={selectedObject.position[axis]}
                      onChange={e => onPositionChange(selectedObject.id, axis, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-cyan-400 transition-colors bg-white"
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Rotation</h4>
              <div className="space-y-1">
                {(['x', 'y', 'z'] as const).map(axis => (
                  <div key={axis} className="flex items-center gap-2">
                    <span className="w-4 font-bold text-slate-400 text-center">{axis.toUpperCase()}</span>
                    <input
                      type="number"
                      value={Math.round(selectedObject.rotation[axis] * (180 / Math.PI))}
                      onChange={e => onRotationChange(selectedObject.id, axis, (parseFloat(e.target.value) || 0) * (Math.PI / 180))}
                      className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-cyan-400 transition-colors bg-white"
                      step={5}
                    />
                    <span className="text-[10px] text-slate-400">deg</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedObject.parameters.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-600 mb-2 text-[11px] uppercase tracking-wide">Dimensions</h4>
                <div className="space-y-2">
                  {selectedObject.parameters.map(param => (
                    <ParameterSlider
                      key={param.name}
                      param={param}
                      onChange={value => onParameterChange(selectedObject.id, param.name, value)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-600 mb-1 text-[11px] uppercase tracking-wide">Info</h4>
              <div className="space-y-1 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium text-slate-700 capitalize">{selectedObject.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono text-[10px]">{selectedObject.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume</span>
                  <span className="font-mono text-[10px]">{(volume).toFixed(1)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span>Volume</span>
                  <span className="font-mono text-[10px]">{(volume / 1000).toFixed(2)} cm³</span>
                </div>
              </div>
            </div>
          </>
        )}

        {!selectedObject && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Select an object to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ParameterSlider: React.FC<{ param: CADParameter; onChange: (value: number) => void }> = ({
  param,
  onChange,
}) => {
  const [localValue, setLocalValue] = React.useState(param.value);

  React.useEffect(() => {
    setLocalValue(param.value);
  }, [param.value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalValue(val);
  };

  const handleSliderEnd = () => {
    onChange(localValue);
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-medium text-slate-600 text-[11px]">{param.label}</span>
        <span className="font-mono text-slate-500 text-[11px]">{localValue.toFixed(param.step < 1 ? 1 : 0)}{param.type === 'angle' ? '°' : 'mm'}</span>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={localValue}
        onChange={handleSliderChange}
        onMouseUp={handleSliderEnd}
        onTouchEnd={handleSliderEnd}
        className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-cyan-500 cursor-pointer"
      />
      <div className="flex justify-between text-[9px] text-slate-400">
        <span>{param.min}</span>
        <span>{param.max}</span>
      </div>
    </div>
  );
};

export default React.memo(PropertiesPanel);
