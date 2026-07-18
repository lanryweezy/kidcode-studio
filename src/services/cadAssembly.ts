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
