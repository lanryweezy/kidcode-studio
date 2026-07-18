import * as THREE from 'three';
import { saveAs } from 'file-saver';
import { CADObject3D, CADExportOptions, CADMaterialType, CAD_MATERIALS } from '../types/cad';

export interface MeshValidationResult {
  valid: boolean;
  degenerateTriangles: number;
  flippedNormals: number;
  looseVertices: number;
  issues: string[];
}

export function validateMesh(geo: THREE.BufferGeometry): MeshValidationResult {
  const result: MeshValidationResult = {
    valid: true,
    degenerateTriangles: 0,
    flippedNormals: 0,
    looseVertices: 0,
    issues: [],
  };

  if (!geo) {
    result.valid = false;
    result.issues.push('No geometry provided');
    return result;
  }

  const pos = geo.attributes.position;
  if (!pos) {
    result.valid = false;
    result.issues.push('No position attribute');
    return result;
  }

  const index = geo.index;
  const triCount = index ? index.count / 3 : pos.count / 3;
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), cross = new THREE.Vector3();
  const normal = new THREE.Vector3();

  const count = index ? index.count : pos.count;

  for (let i = 0; i < count; i += 3) {
    const a = index ? index.getX(i) : i;
    const b = index ? index.getX(i + 1) : i + 1;
    const c = index ? index.getX(i + 2) : i + 2;

    v1.fromBufferAttribute(pos as THREE.BufferAttribute, a);
    v2.fromBufferAttribute(pos as THREE.BufferAttribute, b);
    v3.fromBufferAttribute(pos as THREE.BufferAttribute, c);

    e1.subVectors(v2, v1);
    e2.subVectors(v3, v1);
    cross.crossVectors(e1, e2);
    const area = cross.length();

    if (area < 1e-10) {
      result.degenerateTriangles++;
    }

    if (geo.attributes.normal) {
      const normAttr = geo.attributes.normal as THREE.BufferAttribute;
      normal.fromBufferAttribute(normAttr, a);
      if (cross.dot(normal) < 0) {
        result.flippedNormals++;
      }
    }
  }

  if (result.degenerateTriangles > 0) {
    result.issues.push(`${result.degenerateTriangles} degenerate triangles found`);
  }
  if (result.flippedNormals > triCount * 0.1) {
    result.issues.push(`${result.flippedNormals} triangles with flipped normals`);
  }
  if (result.issues.length > 0) result.valid = false;

  return result;
}

export function fixMesh(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  let fixed = geo.clone();
  fixed = mergeCloseVertices(fixed);
  fixed.computeVertexNormals();
  fixFlippedNormals(fixed);
  return fixed;
}

function mergeCloseVertices(geo: THREE.BufferGeometry, threshold: number = 0.001): THREE.BufferGeometry {
  return geo;
}

function fixFlippedNormals(geo: THREE.BufferGeometry): void {
  const pos = geo.attributes.position;
  const index = geo.index;
  if (!pos || !index) return;

  geo.computeVertexNormals();
}

export function simplifyMesh(geo: THREE.BufferGeometry, targetRatio: number): THREE.BufferGeometry {
  const simplified = geo.clone();
  const pos = simplified.attributes.position;
  const index = simplified.index;

  if (!pos || !index || targetRatio >= 1) return simplified;

  const currentVertexCount = pos.count;
  const targetVertexCount = Math.floor(currentVertexCount * targetRatio);

  if (targetVertexCount >= currentVertexCount) return simplified;

  const edges: { length: number; v1: number; v2: number }[] = [];
  const edgeMap = new Map<string, { v1: number; v2: number }>();

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    const pairs = [[a, b], [b, c], [c, a]];
    for (const [v1, v2] of pairs) {
      const key = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
      if (!edgeMap.has(key)) {
        const p1 = new THREE.Vector3().fromBufferAttribute(pos as THREE.BufferAttribute, v1);
        const p2 = new THREE.Vector3().fromBufferAttribute(pos as THREE.BufferAttribute, v2);
        const length = p1.distanceTo(p2);
        edgeMap.set(key, { v1, v2 });
        edges.push({ length, v1, v2 });
      }
    }
  }

  edges.sort((a, b) => a.length - b.length);

  const vertexMapping = new Map<number, number>();
  let collapsedCount = 0;

  for (const edge of edges) {
    if (pos.count - collapsedCount <= targetVertexCount) break;

    const v1 = edge.v1;
    const v2 = edge.v2;

    const mappedV1 = vertexMapping.get(v1) ?? v1;
    const mappedV2 = vertexMapping.get(v2) ?? v2;

    if (mappedV1 === mappedV2) continue;

    vertexMapping.set(mappedV2, mappedV1);
    collapsedCount++;
  }

  const newPositions: number[] = [];
  const newIndices: number[] = [];
  const keptVertices = new Map<number, number>();
  let newIndex = 0;

  for (let i = 0; i < pos.count; i++) {
    const mapped = vertexMapping.get(i) ?? i;
    if (!keptVertices.has(mapped)) {
      keptVertices.set(mapped, newIndex);
      newPositions.push(
        pos.getX(mapped),
        pos.getY(mapped),
        pos.getZ(mapped)
      );
      newIndex++;
    }
  }

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    const newA = keptVertices.get(vertexMapping.get(a) ?? a)!;
    const newB = keptVertices.get(vertexMapping.get(b) ?? b)!;
    const newC = keptVertices.get(vertexMapping.get(c) ?? c)!;

    if (newA !== newB && newB !== newC && newC !== newA) {
      newIndices.push(newA, newB, newC);
    }
  }

  simplified.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  simplified.setIndex(newIndices);
  simplified.computeVertexNormals();

  return simplified;
}

export function detectNonManifoldEdges(geo: THREE.BufferGeometry): number {
  const pos = geo.attributes.position;
  const index = geo.index;

  if (!pos || !index) return 0;

  const edgeTriangleCount = new Map<string, number>();

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    const pairs = [[a, b], [b, c], [c, a]];
    for (const [v1, v2] of pairs) {
      const key = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
      edgeTriangleCount.set(key, (edgeTriangleCount.get(key) || 0) + 1);
    }
  }

  let nonManifoldCount = 0;
  edgeTriangleCount.forEach((count) => {
    if (count > 2) {
      nonManifoldCount++;
    }
  });

  return nonManifoldCount;
}

export function autoRepairMesh(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const repaired = geo.clone();
  repaired.computeVertexNormals();

  const pos = repaired.attributes.position;
  const index = repaired.index;

  if (!pos || !index) return repaired;

  const validIndices: number[] = [];
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), cross = new THREE.Vector3();

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    v1.fromBufferAttribute(pos as THREE.BufferAttribute, a);
    v2.fromBufferAttribute(pos as THREE.BufferAttribute, b);
    v3.fromBufferAttribute(pos as THREE.BufferAttribute, c);

    e1.subVectors(v2, v1);
    e2.subVectors(v3, v1);
    cross.crossVectors(e1, e2);
    const area = cross.length();

    if (area >= 1e-10) {
      validIndices.push(a, b, c);
    }
  }

  repaired.setIndex(validIndices);
  repaired.computeVertexNormals();

  return repaired;
}

export async function exportSTLPerBody(
  objects: CADObject3D[],
  options: CADExportOptions
): Promise<void> {
  const onProgress = options.onProgress;
  const unitScale = options.unit === 'mm' ? 10 : options.unit === 'cm' ? 1 : 2.54;
  const binary = options.format === 'stl_binary';

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if (!obj.mesh) continue;

    onProgress?.((i / objects.length) * 100, `Exporting ${obj.name}...`);

    const scene = new THREE.Scene();
    const clone = obj.mesh.clone();
    clone.position.set(obj.position.x, obj.position.y, obj.position.z);
    clone.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
    clone.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
    scene.add(clone);

    if (binary) {
      let triangles = 0;
      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry.index) {
            triangles += mesh.geometry.index.count / 3;
          } else {
            triangles += mesh.geometry.attributes.position.count / 3;
          }
        }
      });

      const headerText = 'KidCode Studio CAD Export';
      const bufferLength = 80 + 4 + triangles * 50;
      const buffer = new ArrayBuffer(bufferLength);
      const dataView = new DataView(buffer);

      for (let j = 0; j < 80; j++) {
        dataView.setUint8(j, j < headerText.length ? headerText.charCodeAt(j) : 0);
      }
      dataView.setUint32(80, triangles, true);

      let offset = 84;
      const tempNormal = new THREE.Vector3();
      const tempVertex = new THREE.Vector3();

      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const geo = mesh.geometry.clone();
          geo.scale(unitScale, unitScale, unitScale);
          mesh.updateMatrixWorld();
          geo.applyMatrix4(mesh.matrixWorld);

          const positions = geo.attributes.position;
          const geoIndex = geo.index;
          const count = geoIndex ? geoIndex.count : positions.count;

          for (let j = 0; j < count; j += 3) {
            const a = geoIndex ? geoIndex.getX(j) : j;
            const b = geoIndex ? geoIndex.getX(j + 1) : j + 1;
            const c = geoIndex ? geoIndex.getX(j + 2) : j + 2;

            tempVertex.fromBufferAttribute(positions, a);
            const v1 = new THREE.Vector3().copy(tempVertex);
            tempVertex.fromBufferAttribute(positions, b);
            const v2 = new THREE.Vector3().copy(tempVertex);
            tempVertex.fromBufferAttribute(positions, c);
            const v3 = new THREE.Vector3().copy(tempVertex);

            const edge1 = new THREE.Vector3().subVectors(v2, v1);
            const edge2 = new THREE.Vector3().subVectors(v3, v1);
            tempNormal.crossVectors(edge1, edge2).normalize();

            dataView.setFloat32(offset, tempNormal.x, true); offset += 4;
            dataView.setFloat32(offset, tempNormal.y, true); offset += 4;
            dataView.setFloat32(offset, tempNormal.z, true); offset += 4;

            [v1, v2, v3].forEach(v => {
              dataView.setFloat32(offset, v.x, true); offset += 4;
              dataView.setFloat32(offset, v.y, true); offset += 4;
              dataView.setFloat32(offset, v.z, true); offset += 4;
            });

            dataView.setUint16(offset, 0, true); offset += 2;
          }
          geo.dispose();
        }
      });

      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `${obj.name}.stl`);
    } else {
      let stl = `solid ${obj.name}\n`;
      const tempNormal = new THREE.Vector3();
      const tempVertex = new THREE.Vector3();

      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const geo = mesh.geometry.clone();
          geo.scale(unitScale, unitScale, unitScale);
          mesh.updateMatrixWorld();
          geo.applyMatrix4(mesh.matrixWorld);

          const positions = geo.attributes.position;
          const geoIndex = geo.index;
          const count = geoIndex ? geoIndex.count : positions.count;

          for (let j = 0; j < count; j += 3) {
            const a = geoIndex ? geoIndex.getX(j) : j;
            const b = geoIndex ? geoIndex.getX(j + 1) : j + 1;
            const c = geoIndex ? geoIndex.getX(j + 2) : j + 2;

            tempVertex.fromBufferAttribute(positions, a);
            const v1 = new THREE.Vector3().copy(tempVertex);
            tempVertex.fromBufferAttribute(positions, b);
            const v2 = new THREE.Vector3().copy(tempVertex);
            tempVertex.fromBufferAttribute(positions, c);
            const v3 = new THREE.Vector3().copy(tempVertex);

            const edge1 = new THREE.Vector3().subVectors(v2, v1);
            const edge2 = new THREE.Vector3().subVectors(v3, v1);
            tempNormal.crossVectors(edge1, edge2).normalize();

            stl += `  facet normal ${tempNormal.x} ${tempNormal.y} ${tempNormal.z}\n`;
            stl += '    outer loop\n';
            stl += `      vertex ${v1.x} ${v1.y} ${v1.z}\n`;
            stl += `      vertex ${v2.x} ${v2.y} ${v2.z}\n`;
            stl += `      vertex ${v3.x} ${v3.y} ${v3.z}\n`;
            stl += '    endloop\n';
            stl += '  endfacet\n';
          }
          geo.dispose();
        }
      });

      stl += `endsolid ${obj.name}\n`;
      const blob = new Blob([stl], { type: 'text/plain' });
      saveAs(blob, `${obj.name}.stl`);
    }
  }

  onProgress?.(100, 'Per-body export complete!');
}

export async function exportCADModel(
  objects: CADObject3D[],
  options: CADExportOptions
): Promise<void> {
  const onProgress = options.onProgress;
  onProgress?.(0, 'Preparing export...');

  if (options.perBody) {
    await exportSTLPerBody(objects, options);
    return;
  }

  const scene = new THREE.Scene();
  objects.forEach(obj => {
    if (obj.mesh) {
      const clone = obj.mesh.clone();
      clone.position.set(obj.position.x, obj.position.y, obj.position.z);
      clone.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
      clone.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
      scene.add(clone);
    }
  });

  const unitScale = options.unit === 'mm' ? 10 : options.unit === 'cm' ? 1 : 2.54;

  onProgress?.(10, 'Validating meshes...');
  let allValid = true;
  scene.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        const result = validateMesh(mesh.geometry);
        if (!result.valid) {
          mesh.geometry = fixMesh(mesh.geometry);
        }
      }
    }
  });

  if (!allValid) {
    onProgress?.(20, 'Fixed mesh issues, continuing export...');
  }

  if (options.simplifyOption !== undefined && options.simplifyOption < 1) {
    onProgress?.(25, 'Simplifying meshes...');
    scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry = simplifyMesh(mesh.geometry, options.simplifyOption!);
        }
      }
    });
  }

  switch (options.format) {
    case 'stl':
      await exportSTL(scene, unitScale, false, onProgress);
      break;
    case 'stl_binary':
      await exportSTL(scene, unitScale, true, onProgress);
      break;
    case 'obj':
      await exportOBJ(scene, unitScale, onProgress);
      break;
    case 'gltf':
    case 'glb':
      await exportGLTF(scene, options.format === 'glb', onProgress);
      break;
    case '3mf':
      await export3MF(scene, unitScale, objects, onProgress);
      break;
    case 'step':
      onProgress?.(100, 'STEP export requires an external tool like FreeCAD or OpenCASCADE. Please export as STL or OBJ and convert externally.');
      return;
  }

  onProgress?.(100, 'Export complete!');
}

async function exportSTL(
  scene: THREE.Scene,
  unitScale: number,
  binary: boolean,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  let triangles = 0;
  const meshes: THREE.Mesh[] = [];
  scene.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      meshes.push(mesh);
      const geo = mesh.geometry;
      if (geo.index) {
        triangles += geo.index.count / 3;
      } else {
        triangles += geo.attributes.position.count / 3;
      }
    }
  });

  onProgress?.(30, `Writing ${triangles} triangles...`);

  if (binary) {
    const headerText = 'KidCode Studio CAD Export';
    const bufferLength = 80 + 4 + triangles * 50;
    const buffer = new ArrayBuffer(bufferLength);
    const dataView = new DataView(buffer);

    for (let i = 0; i < 80; i++) {
      dataView.setUint8(i, i < headerText.length ? headerText.charCodeAt(i) : 0);
    }
    dataView.setUint32(80, triangles, true);

    let offset = 84;
    const tempNormal = new THREE.Vector3();
    const tempVertex = new THREE.Vector3();

    let processed = 0;
    for (const mesh of meshes) {
      const geo = mesh.geometry.clone();
      geo.scale(unitScale, unitScale, unitScale);
      mesh.updateMatrixWorld();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.attributes.position;
      const geoIndex = geo.index;
      const count = geoIndex ? geoIndex.count : positions.count;

      for (let i = 0; i < count; i += 3) {
        const a = geoIndex ? geoIndex.getX(i) : i;
        const b = geoIndex ? geoIndex.getX(i + 1) : i + 1;
        const c = geoIndex ? geoIndex.getX(i + 2) : i + 2;

        tempVertex.fromBufferAttribute(positions, a);
        const v1 = new THREE.Vector3().copy(tempVertex);
        tempVertex.fromBufferAttribute(positions, b);
        const v2 = new THREE.Vector3().copy(tempVertex);
        tempVertex.fromBufferAttribute(positions, c);
        const v3 = new THREE.Vector3().copy(tempVertex);

        const edge1 = new THREE.Vector3().subVectors(v2, v1);
        const edge2 = new THREE.Vector3().subVectors(v3, v1);
        tempNormal.crossVectors(edge1, edge2).normalize();

        dataView.setFloat32(offset, tempNormal.x, true); offset += 4;
        dataView.setFloat32(offset, tempNormal.y, true); offset += 4;
        dataView.setFloat32(offset, tempNormal.z, true); offset += 4;

        [v1, v2, v3].forEach(v => {
          dataView.setFloat32(offset, v.x, true); offset += 4;
          dataView.setFloat32(offset, v.y, true); offset += 4;
          dataView.setFloat32(offset, v.z, true); offset += 4;
        });

        dataView.setUint16(offset, 0, true); offset += 2;
        processed++;
      }
      geo.dispose();

      onProgress?.(30 + (processed / triangles) * 60, 'Writing binary STL...');
    }

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'model.stl');
  } else {
    let stl = 'solid exported_model\n';
    const tempNormal = new THREE.Vector3();
    const tempVertex = new THREE.Vector3();

    let processed = 0;
    for (const mesh of meshes) {
      const geo = mesh.geometry.clone();
      geo.scale(unitScale, unitScale, unitScale);
      mesh.updateMatrixWorld();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.attributes.position;
      const geoIndex = geo.index;
      const count = geoIndex ? geoIndex.count : positions.count;

      for (let i = 0; i < count; i += 3) {
        const a = geoIndex ? geoIndex.getX(i) : i;
        const b = geoIndex ? geoIndex.getX(i + 1) : i + 1;
        const c = geoIndex ? geoIndex.getX(i + 2) : i + 2;

        tempVertex.fromBufferAttribute(positions, a);
        const v1 = new THREE.Vector3().copy(tempVertex);
        tempVertex.fromBufferAttribute(positions, b);
        const v2 = new THREE.Vector3().copy(tempVertex);
        tempVertex.fromBufferAttribute(positions, c);
        const v3 = new THREE.Vector3().copy(tempVertex);

        const edge1 = new THREE.Vector3().subVectors(v2, v1);
        const edge2 = new THREE.Vector3().subVectors(v3, v1);
        tempNormal.crossVectors(edge1, edge2).normalize();

        stl += `  facet normal ${tempNormal.x} ${tempNormal.y} ${tempNormal.z}\n`;
        stl += '    outer loop\n';
        stl += `      vertex ${v1.x} ${v1.y} ${v1.z}\n`;
        stl += `      vertex ${v2.x} ${v2.y} ${v2.z}\n`;
        stl += `      vertex ${v3.x} ${v3.y} ${v3.z}\n`;
        stl += '    endloop\n';
        stl += '  endfacet\n';
        processed++;
      }
      geo.dispose();

      onProgress?.(30 + (processed / triangles) * 60, 'Writing ASCII STL...');
    }

    stl += 'endsolid exported_model\n';
    const blob = new Blob([stl], { type: 'text/plain' });
    saveAs(blob, 'model.stl');
  }

  onProgress?.(95, 'Finalizing...');
}

async function exportOBJ(
  scene: THREE.Scene,
  unitScale: number,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  let objContent = '# Exported by KidCode Studio CAD\n';
  let vertexOffset = 0;

  onProgress?.(30, 'Writing OBJ...');

  scene.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geo = mesh.geometry.clone();
      geo.scale(unitScale, unitScale, unitScale);
      mesh.updateMatrixWorld();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.attributes.position;
      const geoIndex = geo.index;

      for (let i = 0; i < positions.count; i++) {
        objContent += `v ${positions.getX(i)} ${positions.getY(i)} ${positions.getZ(i)}\n`;
      }

      if (geoIndex) {
        for (let i = 0; i < geoIndex.count; i += 3) {
          objContent += `f ${geoIndex.getX(i) + 1 + vertexOffset} ${geoIndex.getX(i + 1) + 1 + vertexOffset} ${geoIndex.getX(i + 2) + 1 + vertexOffset}\n`;
        }
      } else {
        for (let i = 0; i < positions.count; i += 3) {
          objContent += `f ${i + 1 + vertexOffset} ${i + 2 + vertexOffset} ${i + 3 + vertexOffset}\n`;
        }
      }

      vertexOffset += positions.count;
      geo.dispose();
    }
  });

  onProgress?.(80, 'Saving file...');
  const blob = new Blob([objContent], { type: 'text/plain' });
  saveAs(blob, 'model.obj');
}

async function exportGLTF(
  scene: THREE.Scene,
  binary: boolean,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  onProgress?.(30, 'Exporting GLTF...');
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: binary ? 'model/gltf-binary' : 'model/gltf+json' });
          saveAs(blob, binary ? 'model.glb' : 'model.gltf');
        } else {
          const output = JSON.stringify(result, null, 2);
          const blob = new Blob([output], { type: 'model/gltf+json' });
          saveAs(blob, 'model.gltf');
        }
        onProgress?.(100, 'GLTF export complete');
        resolve();
      },
      (error) => reject(error),
      { binary }
    );
  });
}

async function export3MF(
  scene: THREE.Scene,
  unitScale: number,
  objects: CADObject3D[],
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  onProgress?.(30, 'Building 3MF package...');

  let meshesXml = '';
  let objectIndex = 1;
  const buildItems: string[] = [];

  const materialsMap = new Map<string, number>();
  let materialId = 1;
  let baseMaterials = '';

  for (const obj of objects) {
    if (!obj.mesh) continue;

    const matConfig = CAD_MATERIALS[obj.materialId as CADMaterialType] || CAD_MATERIALS.PLA;
    const colorHex = matConfig.color.replace('#', '');

    if (!materialsMap.has(colorHex)) {
      materialsMap.set(colorHex, materialId);
      baseMaterials += `<base name="Material${materialId}" displaycolor="#${colorHex}" />\n`;
      materialId++;
    }

    const mesh = obj.mesh.clone();
    mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
    mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
    mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);

    const geo = mesh.geometry.clone();
    geo.scale(unitScale, unitScale, unitScale);
    mesh.updateMatrixWorld();
    geo.applyMatrix4(mesh.matrixWorld);

    const pos = geo.attributes.position;
    const idx = geo.index;
    const pid = materialsMap.get(colorHex) || 1;

    let verticesXml = '';
    for (let i = 0; i < pos.count; i++) {
      verticesXml += `<vertex x="${pos.getX(i)}" y="${pos.getY(i)}" z="${pos.getZ(i)}" />\n`;
    }

    let trianglesXml = '';
    const triCount = idx ? idx.count / 3 : pos.count / 3;
    for (let i = 0; i < triCount; i++) {
      const a = idx ? idx.getX(i * 3) : i * 3;
      const b = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
      const c = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;
      trianglesXml += `<triangle v1="${a}" v2="${b}" v3="${c}" />\n`;
    }

    meshesXml += `<object id="${objectIndex}"><mesh><vertices>\n${verticesXml}</vertices><triangles>\n${trianglesXml}</triangles></mesh></object>\n`;
    buildItems.push(`<item objectid="${objectIndex}" />\n`);
    objectIndex++;
    geo.dispose();
  }

  let materialsXml = '';
  if (baseMaterials) {
    materialsXml = `<basematerials id="1">\n${baseMaterials}</basematerials>\n`;
  }

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    ${materialsXml}
    ${meshesXml}
  </resources>
  <build>
    ${buildItems.join('')}
  </build>
</model>`;

  onProgress?.(80, 'Saving 3MF...');
  const blob = new Blob([content], { type: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml' });
  saveAs(blob, 'model.3mf');
}
