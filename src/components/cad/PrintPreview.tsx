import React, { useMemo, useState } from 'react';
import { CADObject3D, PRINT_BED, PRINTER_PROFILES } from '../../types/cad';
import { calculatePrintVolume } from '../../services/cadParametrics';

interface PrintPreviewProps {
  objects: CADObject3D[];
}

const FILAMENT_DENSITY = 1.24;

const PrintPreview: React.FC<PrintPreviewProps> = ({ objects }) => {
  const [selectedPrinterId, setSelectedPrinterId] = useState('ender3');

  const printer = useMemo(
    () => PRINTER_PROFILES.find(p => p.id === selectedPrinterId) ?? PRINTER_PROFILES[0],
    [selectedPrinterId]
  );

  const bedDimensions = useMemo(() => ({
    width: printer.bedWidth,
    depth: printer.bedDepth,
    height: printer.bedHeight,
  }), [printer]);

  const visibleObjects = objects.filter(o => o.visible && o.geometry);

  const bounds = useMemo(() => {
    if (visibleObjects.length === 0) {
      return { width: 0, height: 0, depth: 0 };
    }
    return calculatePrintVolume(visibleObjects);
  }, [visibleObjects]);

  const fits = bounds.width <= bedDimensions.width && bounds.depth <= bedDimensions.depth && bounds.height <= bedDimensions.height;

  const totalVolume = useMemo(() => {
    return visibleObjects.reduce((sum, obj) => {
      if (!obj.geometry) return sum;
      let vol = 0;
      obj.geometry.computeBoundingBox();
      if (obj.geometry.boundingBox) {
        const s = obj.geometry.boundingBox.getSize(new (require('three').Vector3)());
        vol = (s.x * 10 * obj.scale.x) * (s.y * 10 * obj.scale.y) * (s.z * 10 * obj.scale.z);
      }
      return sum + vol;
    }, 0);
  }, [visibleObjects]);

  const filamentGrams = (totalVolume / 1000) * FILAMENT_DENSITY;

  const printTimeMin = useMemo(() => {
    return (totalVolume / 1000) / (printer.maxSpeed * 0.3);
  }, [totalVolume, printer.maxSpeed]);

  const filamentCost = filamentGrams / 1000 * printer.filamentPricePerKg;

  const bedUsage = bedDimensions.width * bedDimensions.depth > 0
    ? (bounds.width * bounds.depth) / (bedDimensions.width * bedDimensions.depth) * 100
    : 0;

  const layerCount = useMemo(() => {
    if (bounds.height <= 0 || printer.layerHeight <= 0) return 0;
    return Math.ceil(bounds.height / printer.layerHeight);
  }, [bounds.height, printer.layerHeight]);

  const supportInfo = useMemo(() => {
    const { BufferAttribute } = require('three');
    let totalUnsupportedFaces = 0;
    const objectSupports: { name: string; unsupportedFaces: number }[] = [];

    for (const obj of visibleObjects) {
      if (!obj.geometry) continue;
      const geo = obj.geometry;
      const posAttr = geo.getAttribute('position') as typeof BufferAttribute;
      if (!posAttr) continue;

      let objUnsupported = 0;
      const index = geo.getIndex();
      if (index) {
        for (let i = 0; i < index.count; i += 3) {
          const a = index.getX(i);
          const b = index.getX(i + 1);
          const c = index.getX(i + 2);

          const ax = posAttr.getX(a), ay = posAttr.getY(a), az = posAttr.getZ(a);
          const bx = posAttr.getX(b), by = posAttr.getY(b), bz = posAttr.getZ(b);
          const cx = posAttr.getX(c), cy = posAttr.getY(c), cz = posAttr.getZ(c);

          const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
          const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;

          const ny = e1z * e2x - e1x * e2z;
          if (ny < -0.5) objUnsupported++;
        }
      } else if (posAttr.count >= 3) {
        for (let i = 0; i < posAttr.count; i += 3) {
          const ax = posAttr.getX(i), ay = posAttr.getY(i);
          const bx = posAttr.getX(i + 1), by = posAttr.getY(i + 1);
          const cx = posAttr.getX(i + 2), cy = posAttr.getY(i + 2);

          const e1x = bx - ax, e1y = by - ay;
          const e2x = cx - ax, e2y = cy - ay;
          const ny = e1x * e2y - e1y * e2x;
          if (ny < -0.5) objUnsupported++;
        }
      }

      if (objUnsupported > 0) {
        objectSupports.push({ name: obj.name || 'Unnamed', unsupportedFaces: objUnsupported });
        totalUnsupportedFaces += objUnsupported;
      }
    }

    return { totalUnsupportedFaces, objectSupports };
  }, [visibleObjects]);

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-700 text-[11px]">PRINT PREVIEW</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide mb-2">Printer Profile</h4>
          <select
            value={selectedPrinterId}
            onChange={e => setSelectedPrinterId(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-mono"
          >
            {PRINTER_PROFILES.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.bedWidth}×{p.bedDepth}×{p.bedHeight}mm
              </option>
            ))}
          </select>
        </div>

        <div className="relative bg-slate-100 rounded-xl p-4 border-2 border-dashed border-slate-300">
          <div className="relative mx-auto" style={{ width: '100%', maxWidth: '200px', aspectRatio: '1' }}>
            <div className="absolute inset-0 bg-slate-200 rounded-lg border border-slate-300">
              <div className="absolute inset-2 border border-dashed border-slate-400 rounded" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="bg-cyan-400/60 rounded border border-cyan-500"
                  style={{
                    width: `${Math.min(100, (bounds.width / bedDimensions.width) * 100)}%`,
                    height: `${Math.min(100, (bounds.depth / bedDimensions.depth) * 100)}%`,
                    minWidth: '20px',
                    minHeight: '20px',
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-2 text-[10px] text-slate-500">
            Top View — {bedDimensions.width}×{bedDimensions.depth} mm bed
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
              { label: 'Width', value: bounds.width, limit: bedDimensions.width, unit: 'mm' },
              { label: 'Height', value: bounds.height, limit: bedDimensions.height, unit: 'mm' },
              { label: 'Depth', value: bounds.depth, limit: bedDimensions.depth, unit: 'mm' },
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
          <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide mb-2">Layer View</h4>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Layers</span>
              <span className="font-mono font-bold text-slate-700">{layerCount}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Layer Height</span>
              <span className="font-mono font-bold text-slate-700">{printer.layerHeight} mm</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (bounds.height / bedDimensions.height) * 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-slate-400 text-right">
              {bounds.height.toFixed(1)} / {bedDimensions.height} mm
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide mb-2">Support Structure</h4>
          <div className={`p-2 rounded-lg border ${supportInfo.totalUnsupportedFaces > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[11px]">{supportInfo.totalUnsupportedFaces > 0 ? '⚠️ Supports Recommended' : '✅ No Supports Needed'}</span>
            </div>
            {supportInfo.totalUnsupportedFaces > 0 ? (
              <div className="space-y-0.5 text-[10px] text-amber-700">
                <div className="font-mono">{supportInfo.totalUnsupportedFaces} unsupported face(s)</div>
                {supportInfo.objectSupports.map(os => (
                  <div key={os.name}>• {os.name}: {os.unsupportedFaces} face(s)</div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-green-600">All faces within 45° threshold</div>
            )}
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
              <span className="text-slate-500">Filament Cost</span>
              <span className="font-mono font-bold text-slate-700">${filamentCost.toFixed(2)}</span>
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
