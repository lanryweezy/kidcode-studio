import * as THREE from 'three';
import { CADObject3D, CADParameter, CADMirrorPlane } from '../types/cad';

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

export function createFilletParameters(radius: number): CADParameter[] {
  return [
    { name: 'filletRadius', type: 'length', value: radius, min: 0.5, max: 50, step: 0.5, label: 'Fillet Radius' },
  ];
}

export function createChamferParameters(distance: number): CADParameter[] {
  return [
    { name: 'chamferDistance', type: 'length', value: distance, min: 0.5, max: 50, step: 0.5, label: 'Chamfer Distance' },
  ];
}

export function createShellParameters(wallThickness: number): CADParameter[] {
  return [
    { name: 'wallThickness', type: 'length', value: wallThickness, min: 0.5, max: 50, step: 0.5, label: 'Wall Thickness' },
  ];
}

export function createLinearArrayParameters(count: number, spacing: number): CADParameter[] {
  return [
    { name: 'arrayCount', type: 'count', value: count, min: 2, max: 100, step: 1, label: 'Count' },
    { name: 'arraySpacing', type: 'length', value: spacing, min: 1, max: 500, step: 1, label: 'Spacing' },
  ];
}

export function createCircularArrayParameters(count: number, radius: number): CADParameter[] {
  return [
    { name: 'circularCount', type: 'count', value: count, min: 2, max: 100, step: 1, label: 'Count' },
    { name: 'circularRadius', type: 'length', value: radius, min: 1, max: 500, step: 1, label: 'Radius' },
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

export function calculateObjectVolume(geo: THREE.BufferGeometry): number {
  if (!geo) return 0;
  const cloned = geo.clone();
  cloned.computeBoundingBox();
  const bb = cloned.boundingBox;
  if (!bb) return 0;
  const size = new THREE.Vector3();
  bb.getSize(size);
  return (size.x * 10) * (size.y * 10) * (size.z * 10);
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

export function applyFillet(sourceGeo: THREE.BufferGeometry, radius: number): THREE.BufferGeometry {
  if (!sourceGeo) return sourceGeo;
  const r = radius / 10;
  const geo = sourceGeo.clone();
  geo.computeVertexNormals();
  const posAttr = geo.attributes.position;
  const normalAttr = geo.attributes.normal;
  if (!posAttr || !normalAttr) return geo;

  const positions = posAttr as THREE.BufferAttribute;
  const normals = normalAttr as THREE.BufferAttribute;
  const count = positions.count;

  const pos = new THREE.Vector3();
  const norm = new THREE.Vector3();
  const min = new THREE.Vector3();
  const max = new THREE.Vector3();
  geo.computeBoundingBox();
  if (geo.boundingBox) {
    min.copy(geo.boundingBox.min);
    max.copy(geo.boundingBox.max);
  }
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
  const halfSize = new THREE.Vector3().subVectors(max, min).multiplyScalar(0.5);

  for (let i = 0; i < count; i++) {
    pos.fromBufferAttribute(positions, i);
    norm.fromBufferAttribute(normals, i);

    const rel = new THREE.Vector3().subVectors(pos, center);
    const edgeDist = new THREE.Vector3(
      halfSize.x - Math.abs(rel.x),
      halfSize.y - Math.abs(rel.y),
      halfSize.z - Math.abs(rel.z),
    );

    let factor = 1;
    const edgeR = r * 0.8;
    if (edgeDist.x < edgeR && edgeDist.y < edgeR) {
      const blend = Math.max(0, 1 - Math.sqrt(edgeDist.x * edgeDist.x + edgeDist.y * edgeDist.y) / edgeR);
      factor = 1 - blend * 0.3;
    }
    if (edgeDist.x < edgeR && edgeDist.z < edgeR) {
      const blend = Math.max(0, 1 - Math.sqrt(edgeDist.x * edgeDist.x + edgeDist.z * edgeDist.z) / edgeR);
      factor = Math.min(factor, 1 - blend * 0.3);
    }
    if (edgeDist.y < edgeR && edgeDist.z < edgeR) {
      const blend = Math.max(0, 1 - Math.sqrt(edgeDist.y * edgeDist.y + edgeDist.z * edgeDist.z) / edgeR);
      factor = Math.min(factor, 1 - blend * 0.3);
    }

    const scaledRel = rel.clone().multiplyScalar(factor);
    pos.copy(center).add(scaledRel);
    positions.setXYZ(i, pos.x, pos.y, pos.z);
  }

  posAttr.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function applyChamfer(sourceGeo: THREE.BufferGeometry, distance: number): THREE.BufferGeometry {
  if (!sourceGeo) return sourceGeo;
  const d = distance / 10;
  const geo = sourceGeo.clone();
  geo.computeVertexNormals();
  const posAttr = geo.attributes.position;
  if (!posAttr) return geo;

  const positions = posAttr as THREE.BufferAttribute;
  const count = positions.count;

  geo.computeBoundingBox();
  if (!geo.boundingBox) return geo;
  const min = geo.boundingBox.min.clone();
  const max = geo.boundingBox.max.clone();
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
  const halfSize = new THREE.Vector3().subVectors(max, min).multiplyScalar(0.5);

  const pos = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    pos.fromBufferAttribute(positions, i);
    const rel = new THREE.Vector3().subVectors(pos, center);

    const edgesX = halfSize.x - Math.abs(rel.x);
    const edgesY = halfSize.y - Math.abs(rel.y);
    const edgesZ = halfSize.z - Math.abs(rel.z);

    const chamferZone = d * 0.7;
    let offsetX = 0, offsetY = 0, offsetZ = 0;

    if (edgesX < chamferZone) {
      const t = 1 - edgesX / chamferZone;
      offsetX = -Math.sign(rel.x) * d * t * 0.3;
    }
    if (edgesY < chamferZone) {
      const t = 1 - edgesY / chamferZone;
      offsetY = -Math.sign(rel.y) * d * t * 0.3;
    }
    if (edgesZ < chamferZone) {
      const t = 1 - edgesZ / chamferZone;
      offsetZ = -Math.sign(rel.z) * d * t * 0.3;
    }

    const cornerDist = Math.sqrt(edgesX * edgesX + edgesY * edgesY + edgesZ * edgesZ);
    if (cornerDist < chamferZone) {
      const t = 1 - cornerDist / chamferZone;
      offsetX += -Math.sign(rel.x) * d * t * 0.15;
      offsetY += -Math.sign(rel.y) * d * t * 0.15;
      offsetZ += -Math.sign(rel.z) * d * t * 0.15;
    }

    pos.x += offsetX;
    pos.y += offsetY;
    pos.z += offsetZ;
    positions.setXYZ(i, pos.x, pos.y, pos.z);
  }

  posAttr.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function applyShell(sourceGeo: THREE.BufferGeometry, wallThickness: number): THREE.BufferGeometry {
  if (!sourceGeo) return sourceGeo;
  const wt = wallThickness / 10 / 2;
  const geo = sourceGeo.clone();
  geo.computeBoundingBox();
  if (!geo.boundingBox) return geo;
  const min = geo.boundingBox.min.clone();
  const max = geo.boundingBox.max.clone();
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
  const halfSize = new THREE.Vector3().subVectors(max, min).multiplyScalar(0.5);

  const posAttr = geo.attributes.position;
  const positions = posAttr as THREE.BufferAttribute;
  const count = positions.count;
  const pos = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    pos.fromBufferAttribute(positions, i);
    const rel = new THREE.Vector3().subVectors(pos, center);

    const sx = halfSize.x > 0 ? (halfSize.x - wt) / halfSize.x : 1;
    const sy = halfSize.y > 0 ? (halfSize.y - wt) / halfSize.y : 1;
    const sz = halfSize.z > 0 ? (halfSize.z - wt) / halfSize.z : 1;

    rel.x *= sx;
    rel.y *= sy;
    rel.z *= sz;

    pos.copy(center).add(rel);
    positions.setXYZ(i, pos.x, pos.y, pos.z);
  }

  posAttr.needsUpdate = true;
  const normals = geo.attributes.normal;
  if (normals) {
    const normArr = normals.array as Float32Array;
    for (let i = 0; i < normArr.length; i++) {
      normArr[i] *= -1;
    }
    (normals as THREE.BufferAttribute).needsUpdate = true;
  }
  geo.computeVertexNormals();
  return geo;
}

export function applyLinearArray(
  sourceGeo: THREE.BufferGeometry,
  axis: 'X' | 'Y' | 'Z',
  count: number,
  spacing: number
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const s = spacing / 10;

  for (let i = 0; i < count; i++) {
    const clone = sourceGeo.clone();
    const offset = new THREE.Vector3();
    if (axis === 'X') offset.x = i * s;
    else if (axis === 'Y') offset.y = i * s;
    else offset.z = i * s;

    clone.translate(offset.x, offset.y, offset.z);
    geometries.push(clone);
  }

  return mergeBufferGeometries(geometries);
}

export function applyCircularArray(
  sourceGeo: THREE.BufferGeometry,
  axis: 'X' | 'Y' | 'Z',
  count: number,
  radius: number
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const r = radius / 10;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const clone = sourceGeo.clone();
    const cos = Math.cos(angle) * r;
    const sin = Math.sin(angle) * r;

    if (axis === 'X') {
      clone.translate(0, cos, sin);
    } else if (axis === 'Y') {
      clone.translate(cos, 0, sin);
    } else {
      clone.translate(cos, sin, 0);
    }
    geometries.push(clone);
  }

  return mergeBufferGeometries(geometries);
}

export function applyMirror(
  sourceGeo: THREE.BufferGeometry,
  plane: CADMirrorPlane
): THREE.BufferGeometry {
  const geo = sourceGeo.clone();
  switch (plane) {
    case 'XY':
      geo.scale(1, 1, -1);
      break;
    case 'XZ':
      geo.scale(1, -1, 1);
      break;
    case 'YZ':
      geo.scale(-1, 1, 1);
      break;
  }
  geo.computeVertexNormals();
  return geo;
}

function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];

  let totalVertices = 0;
  let totalIndices = 0;

  for (const geo of geometries) {
    totalVertices += geo.attributes.position.count;
    if (geo.index) {
      totalIndices += geo.index.count;
    } else {
      totalIndices += geo.attributes.position.count;
    }
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices: number[] = [];
  let vertexOffset = 0;
  let indexOffset = 0;

  for (const geo of geometries) {
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const normAttr = geo.attributes.normal as THREE.BufferAttribute;

    for (let i = 0; i < posAttr.count; i++) {
      positions[(vertexOffset + i) * 3] = posAttr.getX(i);
      positions[(vertexOffset + i) * 3 + 1] = posAttr.getY(i);
      positions[(vertexOffset + i) * 3 + 2] = posAttr.getZ(i);
    }

    if (normAttr) {
      for (let i = 0; i < normAttr.count; i++) {
        normals[(vertexOffset + i) * 3] = normAttr.getX(i);
        normals[(vertexOffset + i) * 3 + 1] = normAttr.getY(i);
        normals[(vertexOffset + i) * 3 + 2] = normAttr.getZ(i);
      }
    }

    if (geo.index) {
      for (let i = 0; i < geo.index.count; i++) {
        indices.push(geo.index.getX(i) + vertexOffset);
      }
    } else {
      for (let i = 0; i < posAttr.count; i++) {
        indices.push(i + vertexOffset);
      }
    }

    vertexOffset += posAttr.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}
