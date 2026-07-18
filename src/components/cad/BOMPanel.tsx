import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Download } from 'lucide-react';
import { CADObject3D, CADMaterialType, CAD_MATERIALS } from '../../types/cad';
import { calculateObjectVolume } from '../../services/cadParametrics';
import { saveAs } from 'file-saver';

interface BOMPanelProps {
  objects: CADObject3D[];
}

const FILAMENT_DENSITY = 1.24;
const PRINT_SPEED_MM3_PER_SEC = 10;

const BOMPanel: React.FC<BOMPanelProps> = ({ objects }) => {
  const bomItems = useMemo(() => {
    const nameCount = new Map<string, number>();
    const nameObjects = new Map<string, CADObject3D[]>();

    for (const obj of objects) {
      if (!obj.visible) continue;
      const count = nameCount.get(obj.name) || 0;
      nameCount.set(obj.name, count + 1);
      const list = nameObjects.get(obj.name) || [];
      list.push(obj);
      nameObjects.set(obj.name, list);
    }

    const items: Array<{
      name: string;
      quantity: number;
      volume: number;
      material: CADMaterialType;
      estimatedPrintTime: number;
      width: number;
      height: number;
      depth: number;
    }> = [];

    for (const [name, objs] of nameObjects) {
      const firstObj = objs[0];
      let totalVolume = 0;
      let w = 0, h = 0, d = 0;

      for (const obj of objs) {
        if (obj.geometry) {
          totalVolume += calculateObjectVolume(obj.geometry) * obj.scale.x * obj.scale.y * obj.scale.z;
          obj.geometry.computeBoundingBox();
          if (obj.geometry.boundingBox) {
            const size = new THREE.Vector3();
            obj.geometry.boundingBox.getSize(size);
            w = Math.max(w, size.x * 10 * obj.scale.x);
            h = Math.max(h, size.y * 10 * obj.scale.y);
            d = Math.max(d, size.z * 10 * obj.scale.z);
          }
        }
      }

      const printTime = totalVolume / 1000 / PRINT_SPEED_MM3_PER_SEC / 60;

      items.push({
        name,
        quantity: objs.length,
        volume: totalVolume,
        material: (firstObj.materialId as CADMaterialType) || 'PLA',
        estimatedPrintTime: printTime,
        width: w,
        height: h,
        depth: d,
      });
    }

    return items;
  }, [objects]);

  const totalVolume = bomItems.reduce((sum, item) => sum + item.volume * item.quantity, 0);
  const totalFilament = (totalVolume / 1000) * FILAMENT_DENSITY;
  const totalTime = bomItems.reduce((sum, item) => sum + item.estimatedPrintTime * item.quantity, 0);

  const exportCSV = () => {
    let csv = 'Name,Quantity,Volume (mm³),Volume (cm³),Material,Print Time (min),Width (mm),Height (mm),Depth (mm)\n';
    for (const item of bomItems) {
      csv += `"${item.name}",${item.quantity},${item.volume.toFixed(1)},${(item.volume / 1000).toFixed(2)},${item.material},${item.estimatedPrintTime.toFixed(1)},${item.width.toFixed(1)},${item.height.toFixed(1)},${item.depth.toFixed(1)}\n`;
    }
    csv += `\nTotal Volume: ${(totalVolume / 1000).toFixed(2)} cm³\n`;
    csv += `Estimated Filament: ${totalFilament.toFixed(1)}g\n`;
    csv += `Total Print Time: ${totalTime.toFixed(0)} min\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, 'bill_of_materials.csv');
  };

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="font-bold text-slate-700 text-[11px]">BILL OF MATERIALS</span>
        {bomItems.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500 text-white text-[10px] font-bold hover:bg-cyan-600 transition-colors">
            <Download size={10} />
            CSV
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {bomItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No objects in scene</p>
          </div>
        ) : (
          <>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-2 py-1.5 text-left font-bold text-slate-600">Name</th>
                  <th className="px-2 py-1.5 text-center font-bold text-slate-600">Qty</th>
                  <th className="px-2 py-1.5 text-right font-bold text-slate-600">Volume</th>
                  <th className="px-2 py-1.5 text-left font-bold text-slate-600">Material</th>
                </tr>
              </thead>
              <tbody>
                {bomItems.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-1.5 font-medium text-slate-700 truncate max-w-[80px]">{item.name}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{item.quantity}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{(item.volume / 1000).toFixed(1)} cm³</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CAD_MATERIALS[item.material]?.color }} />
                        {item.material}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-3 space-y-1.5 border-t border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-600 text-[10px] uppercase">Summary</h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Volume</span>
                  <span className="font-mono font-bold text-slate-700">{(totalVolume / 1000).toFixed(2)} cm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Filament</span>
                  <span className="font-mono font-bold text-slate-700">{totalFilament.toFixed(1)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Print Time</span>
                  <span className="font-mono font-bold text-slate-700">
                    {totalTime < 60 ? `${totalTime.toFixed(0)} min` : `${(totalTime / 60).toFixed(1)} hr`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Objects</span>
                  <span className="font-mono font-bold text-slate-700">{objects.filter(o => o.visible).length}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(BOMPanel);
