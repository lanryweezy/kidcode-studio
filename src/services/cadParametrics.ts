import * as THREE from 'three';
import { CADObject3D, CADParameter } from '../types/cad';

export function createBoxParameters(width: number, height: number, depth: number): CADParameter[] {
  return [
    { name: 'width', type: 'length', value: width, min: 1, max: 500, step: 1, label: 'Width' },
    { name: 'height', type: 'length', value: height, min: 1, max: 500, step: 1, label: 'Height' },
    { name: 'depth', type: 'length', value: depth, min: 1, max: 500, step: 1, label: 'Depth' },
  ];
}

export function createCylinderParameters(radius: number, height: number, segments: number): CADParameter[] {
  return [
    { name: 'radius', type: 'length', value: radius, min: 1, max: 250, step: 1, label: 'Radius' },
    { name: 'height', type: 'length', value: height, min: 1, max: 500, step: 1, label: 'Height' },
    { name: 'segments', type: 'count', value: segments, min: 6, max: 128, step: 1, label: 'Sides' },
  ];
}

export function createSphereParameters(radius: number, widthSegments: number, heightSegments: number): CADParameter[] {
  return [
    { name: 'radius', type: 'length', value: radius, min: 1, max: 250, step: 1, label: 'Radius' },
    { name: 'widthSegments', type: 'count', value: widthSegments, min: 6, max: 64, step: 1, label: 'Width Segments' },
    { name: 'heightSegments', type: 'count', value: heightSegments, min: 4, max: 64, step: 1, label: 'Height Segments' },
  ];
}

export function createExtrudeParameters(distance: number, draftAngle: number): CADParameter[] {
  return [
    { name: 'distance', type: 'length', value: distance, min: 1, max: 500, step: 1, label: 'Height' },
    { name: 'draftAngle', type: 'angle', value: draftAngle, min: -45, max: 45, step: 0.5, label: 'Draft Angle' },
  ];
}

export function createRevolveParameters(angle: number): CADParameter[] {
  return [
    { name: 'angle', type: 'angle', value: angle, min: 1, max: 360, step: 1, label: 'Angle' },
  ];
}

export function rebuildGeometry(obj: CADObject3D): THREE.BufferGeometry | null {
  const params = obj.parameters;
  const getParam = (name: string) => params.find(p => p.name === name)?.value ?? 0;

  switch (obj.type) {
    case 'box': {
      const w = getParam('width') / 10;
      const h = getParam('height') / 10;
      const d = getParam('depth') / 10;
      return new THREE.BoxGeometry(w, h, d);
    }
    case 'cylinder': {
      const r = getParam('radius') / 10;
      const h = getParam('height') / 10;
      const seg = Math.max(6, Math.round(getParam('segments')));
      return new THREE.CylinderGeometry(r, r, h, seg);
    }
    case 'sphere': {
      const r = getParam('radius') / 10;
      const ws = Math.max(6, Math.round(getParam('widthSegments')));
      const hs = Math.max(4, Math.round(getParam('heightSegments')));
      return new THREE.SphereGeometry(r, ws, hs);
    }
    default:
      return obj.geometry ? obj.geometry.clone() : null;
  }
}

export function updateObjectFromParameters(obj: CADObject3D): CADObject3D {
  const geometry = rebuildGeometry(obj);
  if (geometry) {
    return { ...obj, geometry };
  }
  return obj;
}

export function setParameterValue(obj: CADObject3D, paramName: string, value: number): CADObject3D {
  const params = obj.parameters.map(p =>
    p.name === paramName ? { ...p, value: Math.max(p.min, Math.min(p.max, value)) } : p
  );
  return updateObjectFromParameters({ ...obj, parameters: params });
}

export function calculatePrintVolume(objects: CADObject3D[]): { width: number; height: number; depth: number; volume: number } {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  objects.forEach(obj => {
    const geo = obj.geometry;
    if (!geo) return;
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const pos = obj.position;
    const scale = obj.scale;
    minX = Math.min(minX, bb.min.x * scale.x + pos.x);
    maxX = Math.max(maxX, bb.max.x * scale.x + pos.x);
    minY = Math.min(minY, bb.min.y * scale.y + pos.y);
    maxY = Math.max(maxY, bb.max.y * scale.y + pos.y);
    minZ = Math.min(minZ, bb.min.z * scale.z + pos.z);
    maxZ = Math.max(maxZ, bb.max.z * scale.z + pos.z);
  });

  if (!isFinite(minX)) return { width: 0, height: 0, depth: 0, volume: 0 };

  const width = (maxX - minX) * 10;
  const height = (maxY - minY) * 10;
  const depth = (maxZ - minZ) * 10;
  return { width, height, depth, volume: width * height * depth };
}
