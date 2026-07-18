import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CADState, CADObject3D, CADViewPreset, CADMaterialType, CAD_MATERIALS } from '../../types/cad';
import { rebuildGeometry } from '../../services/cadParametrics';

export interface CADViewportHandle {
  getRenderer: () => THREE.WebGLRenderer | null;
  getScene: () => THREE.Scene | null;
  getCamera: () => THREE.PerspectiveCamera | null;
  getObjectById: (id: string) => CADObject3D | undefined;
  requestRender: () => void;
  focusObject: (obj: CADObject3D) => void;
}

interface CADViewportProps {
  state: CADState;
  onStateChange: (updates: Partial<CADState>) => void;
  onObjectSelect: (id: string) => void;
}

const GRID_SIZE = 10;
const GRID_DIVISIONS = 50;

const CADViewport = forwardRef<CADViewportHandle, CADViewportProps>(({
  state,
  onStateChange,
  onObjectSelect,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const sizeObserverRef = useRef<ResizeObserver | null>(null);

  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getRenderer: () => rendererRef.current,
    getScene: () => sceneRef.current,
    getCamera: () => cameraRef.current,
    getObjectById: (id: string) => state.objects.find(o => o.id === id),
    requestRender: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    },
    focusObject: (obj: CADObject3D) => {
      if (!controlsRef.current || !cameraRef.current) return;
      const center = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
      controlsRef.current.target.copy(center);
      cameraRef.current.position.set(center.x + 10, center.y + 8, center.z + 10);
      controlsRef.current.update();
    },
  }));

  const setupScene = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 600;
    const h = rect?.height || 400;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8ecae6, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    ground.name = '__ground';
    scene.add(ground);

    const grid = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, 0xcccccc, 0xe0e0e0);
    grid.name = '__grid';
    scene.add(grid);
    gridHelperRef.current = grid;

    const axes = new THREE.AxesHelper(5);
    axes.name = '__axes';
    scene.add(axes);

    const renderLoop = () => {
      controls.update();
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };
    animFrameRef.current = requestAnimationFrame(renderLoop);

    sizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      }
    });
    if (canvas.parentElement) {
      sizeObserverRef.current.observe(canvas.parentElement);
    }
  }, []);

  useEffect(() => {
    setupScene();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      sizeObserverRef.current?.disconnect();
      controlsRef.current?.dispose();
      rendererRef.current?.dispose();
    };
  }, [setupScene]);

  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = state.showGrid;
    }
  }, [state.showGrid]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach(child => {
      if (!child.name.startsWith('__')) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(obj => scene.remove(obj));

    state.objects.forEach(obj => {
      if (!obj.visible || !obj.geometry) return;

      const matConfig = CAD_MATERIALS[obj.materialId as CADMaterialType] || CAD_MATERIALS.PLA;
      let material: THREE.Material;

      if (state.wireframeMode) {
        material = new THREE.MeshBasicMaterial({
          color: matConfig.color,
          wireframe: true,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: matConfig.color,
          roughness: matConfig.roughness,
          metalness: matConfig.metalness,
          opacity: matConfig.opacity,
          transparent: matConfig.transparent,
        });
      }

      const mesh = new THREE.Mesh(obj.geometry, material);
      mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
      mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
      mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = obj.id;

      if (state.selectedObjectIds.includes(obj.id)) {
        const edgesGeo = new THREE.EdgesGeometry(obj.geometry);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00aaff, linewidth: 2 });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        mesh.add(edges);
      }

      scene.add(mesh);
    });
  }, [state.objects, state.selectedObjectIds, state.wireframeMode, state.materialId]);

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (state.crossSectionEnabled) {
      const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), state.crossSectionY / 10);
      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!mesh.name.startsWith('__')) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.clippingPlanes === undefined || mat.clippingPlanes === null) {
              mat.clippingPlanes = [clipPlane];
              mat.clipShadows = true;
            }
          }
        }
      });
      if (rendererRef.current) rendererRef.current.localClippingEnabled = true;
    } else {
      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!mesh.name.startsWith('__')) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.clippingPlanes = [];
          }
        }
      });
      if (rendererRef.current) rendererRef.current.localClippingEnabled = false;
    }
  }, [state.crossSectionEnabled, state.crossSectionY]);

  const setViewPreset = useCallback((preset: CADViewPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    let pos: [number, number, number];
    let target: [number, number, number] = [0, 0, 0];

    switch (preset) {
      case 'front': pos = [0, 0, 20]; break;
      case 'back': pos = [0, 0, -20]; break;
      case 'left': pos = [-20, 0, 0]; break;
      case 'right': pos = [20, 0, 0]; break;
      case 'top': pos = [0, 20, 0.01]; break;
      case 'bottom': pos = [0, -20, 0.01]; break;
      case 'isometric': pos = [15, 12, 15]; break;
      default: pos = [15, 12, 15]; break;
    }

    cam.position.set(...pos);
    ctrl.target.set(...target);
    ctrl.update();
  }, []);

  useEffect(() => {
    setViewPreset(state.viewPreset);
  }, [state.viewPreset, setViewPreset]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes: THREE.Object3D[] = [];
    sceneRef.current.children.forEach(child => {
      if ((child as THREE.Mesh).isMesh && !child.name.startsWith('__')) {
        meshes.push(child);
      }
    });

    const intersects = raycasterRef.current.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      onObjectSelect(hit.name);
    } else {
      onObjectSelect('');
    }
  }, [onObjectSelect]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes: THREE.Object3D[] = [];
    sceneRef.current.children.forEach(child => {
      if ((child as THREE.Mesh).isMesh && !child.name.startsWith('__')) {
        meshes.push(child);
      }
    });

    const intersects = raycasterRef.current.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      setHoveredObjectId(hit.name);
    } else {
      setHoveredObjectId(null);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-100 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />
      {hoveredObjectId && (
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 text-white text-xs font-medium rounded-lg backdrop-blur-sm pointer-events-none">
          {state.objects.find(o => o.id === hoveredObjectId)?.name || hoveredObjectId}
        </div>
      )}
    </div>
  );
});

CADViewport.displayName = 'CADViewport';
export default CADViewport;
