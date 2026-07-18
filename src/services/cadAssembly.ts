import { CADObject3D, CADAssemblyConstraint, CADAssemblyNode } from '../types/cad';

export function createAssemblyNode(objectId: string, parentId?: string): CADAssemblyNode {
  return {
    id: Math.random().toString(36).substring(2, 10),
    objectId,
    children: [],
    parentId,
    constraints: [],
  };
}

export function applyPlanarMate(
  objects: CADObject3D[],
  constraint: CADAssemblyConstraint
): CADObject3D[] {
  const objA = objects.find(o => o.id === constraint.objectIdA);
  const objB = objects.find(o => o.id === constraint.objectIdB);
  if (!objA || !objB) return objects;

  const avgY = (objA.position.y + objB.position.y) / 2;

  return objects.map(o => {
    if (o.id === objA.id) {
      return { ...o, position: { ...o.position, y: avgY } };
    }
    if (o.id === objB.id) {
      return { ...o, position: { ...o.position, y: avgY } };
    }
    return o;
  });
}

export function applyAxialMate(
  objects: CADObject3D[],
  constraint: CADAssemblyConstraint
): CADObject3D[] {
  const objA = objects.find(o => o.id === constraint.objectIdA);
  const objB = objects.find(o => o.id === constraint.objectIdB);
  if (!objA || !objB) return objects;

  const axisA = constraint.axisA || 'Y';
  const axisB = constraint.axisB || 'Y';

  return objects.map(o => {
    if (o.id === objB.id) {
      const newPos = { ...o.position };
      if (axisA === 'X' && axisB === 'Y') {
        newPos.x = objA.position.x;
        newPos.z = objA.position.z;
      } else if (axisA === 'Y' && axisB === 'Y') {
        newPos.x = objA.position.x;
        newPos.z = objA.position.z;
      } else if (axisA === 'Z' && axisB === 'Y') {
        newPos.x = objA.position.x;
        newPos.y = objA.position.y;
      }
      return { ...o, position: newPos };
    }
    return o;
  });
}

export function applyPointMate(
  objects: CADObject3D[],
  constraint: CADAssemblyConstraint
): CADObject3D[] {
  const objA = objects.find(o => o.id === constraint.objectIdA);
  const objB = objects.find(o => o.id === constraint.objectIdB);
  if (!objA || !objB) return objects;

  return objects.map(o => {
    if (o.id === objB.id) {
      return { ...o, position: { ...objA.position } };
    }
    return o;
  });
}

export function applyAssemblyConstraint(
  objects: CADObject3D[],
  constraint: CADAssemblyConstraint
): CADObject3D[] {
  switch (constraint.type) {
    case 'planar':
      return applyPlanarMate(objects, constraint);
    case 'axial':
      return applyAxialMate(objects, constraint);
    case 'point':
      return applyPointMate(objects, constraint);
    default:
      return objects;
  }
}

export function buildAssemblyTree(
  objects: CADObject3D[],
  constraints: CADAssemblyConstraint[]
): CADAssemblyNode[] {
  const nodes = objects.map(obj => createAssemblyNode(obj.id));

  for (const constraint of constraints) {
    const nodeA = nodes.find(n => n.objectId === constraint.objectIdA);
    const nodeB = nodes.find(n => n.objectId === constraint.objectIdB);

    if (nodeA && nodeB) {
      nodeA.children.push(nodeB.id);
      nodeB.parentId = nodeA.id;
      nodeA.constraints.push(constraint);
    }
  }

  return nodes.filter(n => !n.parentId);
}

export function calculateAssemblyBounds(
  objects: CADObject3D[]
): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const obj of objects) {
    const geo = obj.geometry;
    if (!geo) continue;
    geo.computeBoundingBox();
    if (!geo.boundingBox) continue;

    const bb = geo.boundingBox;
    const sx = obj.scale.x, sy = obj.scale.y, sz = obj.scale.z;
    const px = obj.position.x, py = obj.position.y, pz = obj.position.z;

    minX = Math.min(minX, bb.min.x * sx + px);
    maxX = Math.max(maxX, bb.max.x * sx + px);
    minY = Math.min(minY, bb.min.y * sy + py);
    maxY = Math.max(maxY, bb.max.y * sy + py);
    minZ = Math.min(minZ, bb.min.z * sz + pz);
    maxZ = Math.max(maxZ, bb.max.z * sz + pz);
  }

  return {
    minX: isFinite(minX) ? minX : 0,
    maxX: isFinite(maxX) ? maxX : 0,
    minY: isFinite(minY) ? minY : 0,
    maxY: isFinite(maxY) ? maxY : 0,
    minZ: isFinite(minZ) ? minZ : 0,
    maxZ: isFinite(maxZ) ? maxZ : 0,
  };
}

function getWorldBounds(obj: CADObject3D): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } | null {
  const geo = obj.geometry;
  if (!geo) return null;
  geo.computeBoundingBox();
  if (!geo.boundingBox) return null;

  const bb = geo.boundingBox;
  const sx = obj.scale.x, sy = obj.scale.y, sz = obj.scale.z;
  const px = obj.position.x, py = obj.position.y, pz = obj.position.z;

  return {
    minX: bb.min.x * sx + px,
    maxX: bb.max.x * sx + px,
    minY: bb.min.y * sy + py,
    maxY: bb.max.y * sy + py,
    minZ: bb.min.z * sz + pz,
    maxZ: bb.max.z * sz + pz,
  };
}

export function detectInterference(objects: CADObject3D[]): Array<{objectIdA: string; objectIdB: string; volume: number}> {
  const results: Array<{objectIdA: string; objectIdB: string; volume: number}> = [];

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const boundsA = getWorldBounds(objects[i]);
      const boundsB = getWorldBounds(objects[j]);
      if (!boundsA || !boundsB) continue;

      const overlapX = Math.min(boundsA.maxX, boundsB.maxX) - Math.max(boundsA.minX, boundsB.minX);
      const overlapY = Math.min(boundsA.maxY, boundsB.maxY) - Math.max(boundsA.minY, boundsB.minY);
      const overlapZ = Math.min(boundsA.maxZ, boundsB.maxZ) - Math.max(boundsA.minZ, boundsB.minZ);

      if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
        results.push({
          objectIdA: objects[i].id,
          objectIdB: objects[j].id,
          volume: overlapX * overlapY * overlapZ,
        });
      }
    }
  }

  return results;
}

export function createExplodedView(objects: CADObject3D[], amount: number): CADObject3D[] {
  if (objects.length === 0) return objects;

  const bounds = calculateAssemblyBounds(objects);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;

  return objects.map(obj => {
    const dx = obj.position.x - centerX;
    const dy = obj.position.y - centerY;
    const dz = obj.position.z - centerZ;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist === 0) return obj;

    return {
      ...obj,
      position: {
        x: obj.position.x + (dx / dist) * amount,
        y: obj.position.y + (dy / dist) * amount,
        z: obj.position.z + (dz / dist) * amount,
      },
    };
  });
}

export function snapFaces(
  objA: CADObject3D,
  objB: CADObject3D,
  faceNormalA: { x: number; y: number; z: number },
  faceNormalB: { x: number; y: number; z: number }
): CADObject3D[] {
  const boundsA = getWorldBounds(objA);
  const boundsB = getWorldBounds(objB);
  if (!boundsA || !boundsB) return [objA, objB];

  const faceCenterA = {
    x: faceNormalA.x > 0 ? boundsA.maxX : faceNormalA.x < 0 ? boundsA.minX : (boundsA.minX + boundsA.maxX) / 2,
    y: faceNormalA.y > 0 ? boundsA.maxY : faceNormalA.y < 0 ? boundsA.minY : (boundsA.minY + boundsA.maxY) / 2,
    z: faceNormalA.z > 0 ? boundsA.maxZ : faceNormalA.z < 0 ? boundsA.minZ : (boundsA.minZ + boundsA.maxZ) / 2,
  };

  const faceCenterB = {
    x: faceNormalB.x > 0 ? boundsB.maxX : faceNormalB.x < 0 ? boundsB.minX : (boundsB.minX + boundsB.maxX) / 2,
    y: faceNormalB.y > 0 ? boundsB.maxY : faceNormalB.y < 0 ? boundsB.minY : (boundsB.minY + boundsB.maxY) / 2,
    z: faceNormalB.z > 0 ? boundsB.maxZ : faceNormalB.z < 0 ? boundsB.minZ : (boundsB.minZ + boundsB.maxZ) / 2,
  };

  const newBPos = {
    x: faceCenterA.x - faceCenterB.x + objB.position.x,
    y: faceCenterA.y - faceCenterB.y + objB.position.y,
    z: faceCenterA.z - faceCenterB.z + objB.position.z,
  };

  return [
    objA,
    { ...objB, position: newBPos },
  ];
}

export function groupRigidObjects(objects: CADObject3D[], groupId: string): CADObject3D[] {
  return objects.map(obj => ({ ...obj, groupId }));
}

export function ungroupObjects(objects: CADObject3D[], groupId: string): CADObject3D[] {
  return objects.map(obj => {
    if (obj.groupId === groupId) {
      const { groupId: _, ...rest } = obj;
      return rest;
    }
    return obj;
  });
}
