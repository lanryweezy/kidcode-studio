import React, { useMemo } from 'react';
import { CADObject3D, PRINT_BED } from '../../types/cad';
import { calculatePrintVolume } from '../../services/cadParametrics';

interface PrintPreviewProps {
  objects: CADObject3D[];
}

const FILAMENT_DENSITY = 1.24;
const PRINT_SPEED = 10;

const PrintPreview: React.FC<PrintPreviewProps> = ({ objects }) => {
  const visibleObjects = objects.filter(o => o.visible && o.geometry);
  const bounds = useMemo(() => calculatePrintVolume(visibleObjects), [visibleObjects]);

  const fits = bounds.width <= PRINT_BED.width && bounds.depth <= PRINT_BED.depth && bounds.height <= PRINT_BED.depth;
  const totalVolume = visibleObjects.reduce((sum, obj) => {
    if (!obj.geometry) return sum;
    let vol = 0;
    obj.geometry.computeBoundingBox();
    if (obj.geometry.boundingBox) {
      const s = obj.geometry.boundingBox.getSize(new (require('three').Vector3)());
      vol = (s.x * 10 * obj.scale.x) * (s.y * 10 * obj.scale.y) * (s.z * 10 * obj.scale.z);
    }
    return sum + vol;
  }, 0);

  const filamentGrams = (totalVolume / 1000) * FILAMENT_DENSITY;
  const printTimeMin = totalVolume / 1000 / PRINT_SPEED;
  const bedUsage = PRINT_BED.width * PRINT_BED.depth > 0
    ? (bounds.width * bounds.depth) / (PRINT_BED.width * PRINT_BED.depth) * 100
    : 0;

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-700 text-[11px]">PRINT PREVIEW</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="relative bg-slate-100 rounded-xl p-4 border-2 border-dashed border-slate-300">
          <div className="relative mx-auto" style={{ width: '100%', maxWidth: '200px', aspectRatio: '1' }}>
            <div className="absolute inset-0 bg-slate-200 rounded-lg border border-slate-300">
              <div className="absolute inset-2 border border-dashed border-slate-400 rounded" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="bg-cyan-400/60 rounded border border-cyan-500"
                  style={{
                    width: `${Math.min(100, (bounds.width / PRINT_BED.width) * 100)}%`,
                    height: `${Math.min(100, (bounds.depth / PRINT_BED.depth) * 100)}%`,
                    minWidth: '20px',
                    minHeight: '20px',
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-500">
            Top View — {PRINT_BED.width}×{PRINT_BED.depth} mm bed
          </div>
        </div>

        <div className={`p-3 rounded-xl border-2 ${fits ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{fits ? '✅' : '❌'}</span>
            <div>
              <div className="font-bold text-[11px]">{fits ? 'Fits on Print Bed' : 'Too Large for Print Bed'}</div>
              <div className="text-[10px] opacity-70">
                {fits ? 'Model is within print volume' : 'Model exceeds print volume'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide mb-2">Dimensions</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Width', value: bounds.width, limit: PRINT_BED.width, unit: 'mm' },
              { label: 'Height', value: bounds.height, limit: PRINT_BED.depth, unit: 'mm' },
              { label: 'Depth', value: bounds.depth, limit: PRINT_BED.depth, unit: 'mm' },
            ].map(d => (
              <div key={d.label} className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[9px] text-slate-400 uppercase">{d.label}</div>
                <div className="font-mono font-bold text-slate-700">{d.value.toFixed(1)}</div>
                <div className="text-[9px] text-slate-400">{d.unit}</div>
                {d.value > d.limit && (
                  <div className="text-[9px] text-red-500 font-bold mt-0.5">Max: {d.limit}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide mb-2">Estimates</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Print Time</span>
              <span className="font-mono font-bold text-slate-700">
                {printTimeMin < 60 ? `${printTimeMin.toFixed(0)} min` : `${(printTimeMin / 60).toFixed(1)} hr`}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Filament</span>
              <span className="font-mono font-bold text-slate-700">{filamentGrams.toFixed(1)} g</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Volume</span>
              <span className="font-mono font-bold text-slate-700">{(totalVolume / 1000).toFixed(2)} cm³</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Bed Usage</span>
              <span className="font-mono font-bold text-slate-700">{bedUsage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <h4 className="font-bold text-amber-700 text-[11px] mb-1">Print Tips</h4>
          <ul className="space-y-0.5 text-[10px] text-amber-600">
            <li>• Enable supports for overhangs over 45°</li>
            <li>• Use 20% infill for strong parts</li>
            <li>• PLA bed temp: 60°C, nozzle: 200°C</li>
            <li>• Add brim for better bed adhesion</li>
          </ul>
        </div>

        {objects.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>Add objects to see print preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PrintPreview);
