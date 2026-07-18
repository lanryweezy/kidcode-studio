import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { CADObject3D } from '../../types/cad';

interface MeasurementToolProps {
  objects: CADObject3D[];
  measureMode: 'none' | 'distance' | 'angle' | 'area' | 'volume' | 'radius';
  measurePoints: { x: number; y: number; id: string }[];
  onPointAdd: (point: { x: number; y: number; id: string }) => void;
  onClear: () => void;
}

const MeasurementTool: React.FC<MeasurementToolProps> = ({
  objects,
  measureMode,
  measurePoints,
  onPointAdd,
  onClear,
}) => {
  if (measureMode === 'none') return null;

  const result = computeMeasurement(measureMode, measurePoints, objects);

  return (
    <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
          {measureMode === 'distance' && '📏 Distance'}
          {measureMode === 'angle' && '📐 Angle'}
          {measureMode === 'radius' && '⭕ Radius'}
          {measureMode === 'area' && '⬡ Area'}
          {measureMode === 'volume' && '🧊 Volume'}
        </h4>
        <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">Clear</button>
      </div>

      {result !== null && (
        <div className="text-lg font-bold text-cyan-600 font-mono">
          {result}
        </div>
      )}

      <div className="mt-2 text-[10px] text-slate-400">
        {measureMode === 'distance' && `${measurePoints.length}/2 points — click two points`}
        {measureMode === 'angle' && `${measurePoints.length}/3 points — click three points`}
        {measureMode === 'radius' && 'Click a circle edge'}
        {measureMode === 'area' && `${measurePoints.length} points — double-click to close`}
        {measureMode === 'volume' && 'Select a 3D object'}
      </div>
    </div>
  );
};

function computeMeasurement(
  mode: string,
  points: { x: number; y: number; id: string }[],
  objects: CADObject3D[]
): string | null {
  if (mode === 'distance' && points.length === 2) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy) / 10;
    return `${dist.toFixed(2)} mm`;
  }

  if (mode === 'angle' && points.length === 3) {
    const v1x = points[0].x - points[1].x;
    const v1y = points[0].y - points[1].y;
    const v2x = points[2].x - points[1].x;
    const v2y = points[2].y - points[1].y;
    const dot = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
    if (mag1 === 0 || mag2 === 0) return null;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    return `${(angle * 180 / Math.PI).toFixed(1)}°`;
  }

  if (mode === 'area' && points.length >= 3) {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return `${(Math.abs(area) / 200).toFixed(2)} mm²`;
  }

  if (mode === 'volume' && objects.length > 0) {
    const obj = objects[0];
    if (obj.geometry) {
      const geo = obj.geometry.clone();
      geo.computeBoundingBox();
      if (geo.boundingBox) {
        const size = new THREE.Vector3();
        geo.boundingBox.getSize(size);
        const vol = (size.x * 10) * (size.y * 10) * (size.z * 10);
        return `${vol.toFixed(1)} mm³ (${(vol / 1000).toFixed(2)} cm³)`;
      }
    }
  }

  return null;
}

export default React.memo(MeasurementTool);
