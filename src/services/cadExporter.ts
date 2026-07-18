import * as THREE from 'three';
import { saveAs } from 'file-saver';
import { CADObject3D, CADExportOptions, CADMaterialType } from '../types/cad';

export async function exportCADModel(
  objects: CADObject3D[],
  options: CADExportOptions
): Promise<void> {
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

  switch (options.format) {
    case 'stl':
      await exportSTL(scene, unitScale, false);
      break;
    case 'stl_binary':
      await exportSTL(scene, unitScale, true);
      break;
    case 'obj':
      await exportOBJ(scene, unitScale);
      break;
    case 'gltf':
    case 'glb':
      await exportGLTF(scene, options.format === 'glb');
      break;
    case '3mf':
      await exportSTL(scene, unitScale, true);
      break;
  }
}

async function exportSTL(scene: THREE.Scene, unitScale: number, binary: boolean): Promise<void> {
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

  if (binary) {
    const bufferLength = 80 + 4 + triangles * 50;
    const buffer = new ArrayBuffer(bufferLength);
    const dataView = new DataView(buffer);

    for (let i = 0; i < 80; i++) dataView.setUint8(i, 0);
    dataView.setUint32(80, triangles, true);

    let offset = 84;
    const tempNormal = new THREE.Vector3();
    const tempVertex = new THREE.Vector3();

    meshes.forEach(mesh => {
      const geo = mesh.geometry.clone();
      geo.scale(unitScale, unitScale, unitScale);
      mesh.updateMatrixWorld();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.attributes.position;
      const index = geo.index;
      const count = index ? index.count : positions.count;

      for (let i = 0; i < count; i += 3) {
        const a = index ? index.getX(i) : i;
        const b = index ? index.getX(i + 1) : i + 1;
        const c = index ? index.getX(i + 2) : i + 2;

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
        geo.dispose();
      }
    });

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'model.stl');
  } else {
    let stl = 'solid exported_model\n';
    const tempNormal = new THREE.Vector3();
    const tempVertex = new THREE.Vector3();

    meshes.forEach(mesh => {
      const geo = mesh.geometry.clone();
      geo.scale(unitScale, unitScale, unitScale);
      mesh.updateMatrixWorld();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.attributes.position;
      const index = geo.index;
      const count = index ? index.count : positions.count;

      for (let i = 0; i < count; i += 3) {
        const a = index ? index.getX(i) : i;
        const b = index ? index.getX(i + 1) : i + 1;
        const c = index ? index.getX(i + 2) : i + 2;

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
        geo.dispose();
      }
    });

    stl += 'endsolid exported_model\n';
    const blob = new Blob([stl], { type: 'text/plain' });
    saveAs(blob, 'model.stl');
  }
}

async function exportOBJ(scene: THREE.Scene, unitScale: number): Promise<void> {
  let objContent = '# Exported by KidCode Studio CAD\n';
  let vertexOffset = 0;

  scene.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geo = mesh.geometry.clone();
      geo.scale(unitScale, unitScale, unitScale);
      mesh.updateMatrixWorld();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.attributes.position;
      const index = geo.index;

      for (let i = 0; i < positions.count; i++) {
        objContent += `v ${positions.getX(i)} ${positions.getY(i)} ${positions.getZ(i)}\n`;
      }

      if (index) {
        for (let i = 0; i < index.count; i += 3) {
          objContent += `f ${index.getX(i) + 1 + vertexOffset} ${index.getX(i + 1) + 1 + vertexOffset} ${index.getX(i + 2) + 1 + vertexOffset}\n`;
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

  const blob = new Blob([objContent], { type: 'text/plain' });
  saveAs(blob, 'model.obj');
}

async function exportGLTF(scene: THREE.Scene, binary: boolean): Promise<void> {
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
        resolve();
      },
      (error) => reject(error),
      { binary }
    );
  });
}
