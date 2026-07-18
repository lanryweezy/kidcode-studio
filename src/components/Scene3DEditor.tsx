import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronDown, ChevronRight,
  Plus, Grid3x3, Move, RotateCcw, Box, Circle, Cylinder, Cone,
  Triangle, Square, Sun, Lightbulb, Zap, Play, Pause, Square as StopIcon,
  Repeat, Download, Upload, Save, Globe, Target, Layers, X,
  MousePointer2, Type as TypeIcon, HelpCircle, Undo2, Redo2, Group, Ungroup,
  Palette, Mountain, Wind, Sparkles, TreePine
} from 'lucide-react';
import {
  Scene3DObject, Scene3DLight, Animation3D, Scene3DData,
  createCube, createSphere, createCylinder, createCone, createTorus, createPlane,
  createLight, createDefaultScene, MATERIAL_PRESETS
} from '../services/scene3DPrimitives';
import { createThreeLight, updateThreeLight, createLightHelper } from '../services/scene3DLighting';
import { EASING_NAMES, interpolateKeyframes, getAnimationDuration, addKeyframe } from '../services/scene3DAnimations';
import { PREFABS, PrefabDefinition } from '../services/scene3DPrefabs';

interface Scene3DEditorProps {
  onClose: () => void;
  onSave?: (data: Scene3DData) => void;
  initialData?: Scene3DData;
}

const GEOMETRY_ICONS: Record<string, React.ReactNode> = {
  cube: <Box size={14} />,
  sphere: <Circle size={14} />,
  cylinder: <Cylinder size={14} />,
  cone: <Cone size={14} />,
  torus: <Triangle size={14} />,
  plane: <Square size={14} />,
  model: <Box size={14} />,
};

const LIGHT_ICONS: Record<string, React.ReactNode> = {
  ambient: <Sun size={14} />,
  directional: <Sun size={14} />,
  point: <Lightbulb size={14} />,
  spot: <Zap size={14} />,
};

type TransformMode = 'translate' | 'rotate' | 'scale';

const CAMERA_PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  'Front (1)': { position: [0, 2, 8], target: [0, 0, 0] },
  'Back (2)': { position: [0, 2, -8], target: [0, 0, 0] },
  'Left (3)': { position: [-8, 2, 0], target: [0, 0, 0] },
  'Right (4)': { position: [8, 2, 0], target: [0, 0, 0] },
  'Top (5)': { position: [0, 10, 0.01], target: [0, 0, 0] },
  'Bottom (6)': { position: [0, -10, 0.01], target: [0, 0, 0] },
  'Isometric (7)': { position: [5, 5, 5], target: [0, 0, 0] },
  'Free (0)': { position: [5, 5, 10], target: [0, 0, 0] },
};

interface HistoryEntry {
  objects: Scene3DObject[];
  lights: Scene3DLight[];
  animations: Animation3D[];
  backgroundColor: string;
}

interface SceneGroup {
  id: string;
  name: string;
  childIds: string[];
}

export default function Scene3DEditor({ onClose, onSave, initialData }: Scene3DEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const objectMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const lightMeshesRef = useRef<Map<string, THREE.Light>>(new Map());
  const helpersRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const transformRef = useRef<TransformControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const selectionBoxRef = useRef<THREE.Box3 | null>(null);
  const selectionHelperRef = useRef<THREE.LineSegments | null>(null);

  const [sceneData, setSceneData] = useState<Scene3DData>(initialData || createDefaultScene());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<'object' | 'light' | null>(null);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLightMenu, setShowLightMenu] = useState(false);
  const [showPrefabMenu, setShowPrefabMenu] = useState(false);
  const [spaceMode, setSpaceMode] = useState<'world' | 'local'>('world');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [snapSize, setSnapSize] = useState(1);
  const [showPresets, setShowPresets] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animTime, setAnimTime] = useState(0);
  const [animLoop, setAnimLoop] = useState(true);
  const [animDuration, setAnimDuration] = useState(5);
  const [selectedEasing, setSelectedEasing] = useState('Linear');
  const [leftPanelWidth, setLeftPanelWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isAddingKeyframe, setIsAddingKeyframe] = useState(false);
  const [keyframeObjectId, setKeyframeObjectId] = useState('');
  const [keyframeProperty, setKeyframeProperty] = useState<'position' | 'rotation' | 'scale'>('position');
  const [keyframeChannel, setKeyframeChannel] = useState<'x' | 'y' | 'z'>('y');
  const [keyframeValue, setKeyframeValue] = useState(0);
  const [keyframeTime, setKeyframeTime] = useState(0);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [cursorWorldPos, setCursorWorldPos] = useState<{ x: number; y: number; z: number } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [groups, setGroups] = useState<SceneGroup[]>([]);
  const [showEnvironment, setShowEnvironment] = useState(false);
  const [skyType, setSkyType] = useState<'solid' | 'gradient' | 'skybox'>('solid');
  const [groundType, setGroundType] = useState<'grid' | 'checkerboard' | 'grass' | 'sand'>('grid');
  const [fogType, setFogType] = useState<'none' | 'linear' | 'exponential'>('none');
  const [fogNear, setFogNear] = useState(10);
  const [fogFar, setFogFar] = useState(50);
  const [envPreset, setEnvPreset] = useState<'studio' | 'outdoor' | 'indoor' | 'night'>('outdoor');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [gridHelperRef, setGridHelperRef] = useState<THREE.GridHelper | null>(null);

  const selectedId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedObj = selectedId && selectedType === 'object' ? sceneData.objects.find((o) => o.id === selectedId) : null;
  const selectedLight = selectedId && selectedType === 'light' ? sceneData.lights.find((l) => l.id === selectedId) : null;
  const isMultiSelect = selectedIds.size > 1;

  const pushHistory = useCallback(() => {
    const entry: HistoryEntry = {
      objects: JSON.parse(JSON.stringify(sceneData.objects)),
      lights: JSON.parse(JSON.stringify(sceneData.lights)),
      animations: JSON.parse(JSON.stringify(sceneData.animations)),
      backgroundColor: sceneData.backgroundColor,
    };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(entry);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [sceneData, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const entry = history[historyIndex - 1];
    setSceneData((prev) => ({
      ...prev,
      objects: entry.objects,
      lights: entry.lights,
      animations: entry.animations,
      backgroundColor: entry.backgroundColor,
    }));
    setHistoryIndex((prev) => prev - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    setSceneData((prev) => ({
      ...prev,
      objects: entry.objects,
      lights: entry.lights,
      animations: entry.animations,
      backgroundColor: entry.backgroundColor,
    }));
    setHistoryIndex((prev) => prev + 1);
  }, [history, historyIndex]);

  const snapValue = useCallback((v: number): number => {
    if (!snapToGrid) return v;
    return Math.round(v / snapSize) * snapSize;
  }, [snapToGrid, snapSize]);

  const initThree = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneData.backgroundColor);
    scene.fog = new THREE.Fog(sceneData.backgroundColor, 50, 200);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(
      sceneData.camera.position[0],
      sceneData.camera.position[1],
      sceneData.camera.position[2]
    );
    camera.lookAt(
      sceneData.camera.target[0],
      sceneData.camera.target[1],
      sceneData.camera.target[2]
    );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI * 0.95;

    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    gridHelper.name = '__grid__';
    scene.add(gridHelper);
    setGridHelperRef(gridHelper);

    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.name = '__axes__';
    scene.add(axesHelper);

    const tc = new TransformControls(camera, canvas);
    tc.setMode('translate');
    tc.setSpace('world');
    tc.setSize(0.8);
    tc.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });
    tc.addEventListener('objectChange', () => {
      if (tc.object) {
        const objId = tc.object.name;
        const obj = sceneData.objects.find((o) => o.id === objId);
        if (obj) {
          const pos: [number, number, number] = [
            snapValue(tc.object.position.x),
            snapValue(tc.object.position.y),
            snapValue(tc.object.position.z),
          ];
          const rot: [number, number, number] = [
            tc.object.rotation.x,
            tc.object.rotation.y,
            tc.object.rotation.z,
          ];
          const scl: [number, number, number] = [
            tc.object.scale.x,
            tc.object.scale.y,
            tc.object.scale.z,
          ];
          setSceneData((prev) => ({
            ...prev,
            objects: prev.objects.map((o) =>
              o.id === objId ? { ...o, position: pos, rotation: rot, scale: scl } : o
            ),
          }));
        }
      }
    });
    scene.add(tc.getHelper());
    transformRef.current = tc;

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;

    syncSceneToThree();
    animate();
  }, []);

  const animate = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    if (controlsRef.current) controlsRef.current.update();
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  const syncSceneToThree = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    for (const [id, mesh] of objectMeshesRef.current) {
      if (!sceneData.objects.find((o) => o.id === id)) {
        scene.remove(mesh);
        objectMeshesRef.current.delete(id);
      }
    }

    for (const [id, light] of lightMeshesRef.current) {
      if (!sceneData.lights.find((l) => l.id === id)) {
        scene.remove(light);
        lightMeshesRef.current.delete(id);
        const helper = helpersRef.current.get(id);
        if (helper) {
          scene.remove(helper);
          helpersRef.current.delete(id);
        }
      }
    }

    for (const obj of sceneData.objects) {
      let mesh = objectMeshesRef.current.get(obj.id);

      if (!mesh) {
        mesh = createMeshForObject(obj);
        scene.add(mesh);
        objectMeshesRef.current.set(obj.id, mesh);
      }

      mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
      mesh.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
      mesh.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
      mesh.visible = obj.visible;

      if (mesh instanceof THREE.Mesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set(obj.material.color);
        mat.opacity = obj.material.opacity;
        mat.transparent = obj.material.opacity < 1;
        mat.metalness = obj.material.metalness;
        mat.roughness = obj.material.roughness;
        mat.wireframe = obj.material.wireframe;
        mat.side = obj.material.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
        if (obj.material.emissive) {
          mat.emissive.set(obj.material.emissive);
          mat.emissiveIntensity = obj.material.emissiveIntensity || 0;
        }
      }
    }

    for (const light of sceneData.lights) {
      let threeLight = lightMeshesRef.current.get(light.id);

      if (!threeLight) {
        threeLight = createThreeLight(light);
        scene.add(threeLight);
        lightMeshesRef.current.set(light.id, threeLight);
      } else {
        updateThreeLight(threeLight, light);
      }

      const existingHelper = helpersRef.current.get(light.id);
      if (existingHelper) {
        scene.remove(existingHelper);
        helpersRef.current.delete(light.id);
      }
      const helper = createLightHelper(light);
      if (helper) {
        scene.add(helper);
        helpersRef.current.set(light.id, helper);
      }
    }

    if (transformRef.current) {
      if (selectedIds.size === 1) {
        const mesh = objectMeshesRef.current.get(Array.from(selectedIds)[0]);
        if (mesh) {
          transformRef.current.attach(mesh);
        }
      } else {
        transformRef.current.detach();
      }
    }
  }, [sceneData, selectedIds]);

  const createMeshForObject = useCallback((obj: Scene3DObject): THREE.Mesh => {
    let geometry: THREE.BufferGeometry;

    switch (obj.type) {
      case 'cube': {
        const p = obj.geometryParams || {};
        geometry = new THREE.BoxGeometry(p.width || 1, p.height || 1, p.depth || 1);
        break;
      }
      case 'sphere': {
        const p = obj.geometryParams || {};
        geometry = new THREE.SphereGeometry(p.radius || 0.5, p.widthSegments || 32, p.heightSegments || 32);
        break;
      }
      case 'cylinder': {
        const p = obj.geometryParams || {};
        geometry = new THREE.CylinderGeometry(p.radiusTop || 0.5, p.radiusBottom || 0.5, p.height || 1, p.radialSegments || 32);
        break;
      }
      case 'cone': {
        const p = obj.geometryParams || {};
        geometry = new THREE.ConeGeometry(p.radius || 0.5, p.height || 1, p.radialSegments || 32);
        break;
      }
      case 'torus': {
        const p = obj.geometryParams || {};
        geometry = new THREE.TorusGeometry(p.radius || 0.5, p.tube || 0.2, p.radialSegments || 16, p.tubularSegments || 32);
        break;
      }
      case 'plane': {
        const p = obj.geometryParams || {};
        geometry = new THREE.PlaneGeometry(p.width || 2, p.height || 2);
        break;
      }
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({
      color: obj.material.color,
      opacity: obj.material.opacity,
      transparent: obj.material.opacity < 1,
      metalness: obj.material.metalness,
      roughness: obj.material.roughness,
      wireframe: obj.material.wireframe,
      side: obj.material.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = obj.id;
    return mesh;
  }, []);

  useEffect(() => {
    initThree();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose();
      controlsRef.current?.dispose();
      transformRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    syncSceneToThree();
  }, [sceneData, syncSceneToThree]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;

    const handleDoubleClick = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
      const meshes = Array.from(objectMeshesRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const id = hit.name;
        setSelectedIds(new Set([id]));
        setSelectedType('object');
        setRenamingId(id);
        const obj = sceneData.objects.find((o) => o.id === id);
        if (obj) {
          setRenameValue(obj.name);
          const target = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
          controlsRef.current?.target.copy(target);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const meshes = Array.from(objectMeshesRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const id = intersects[0].object.name;
        if (e.ctrlKey || e.metaKey) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
          setSelectedType('object');
        } else if (e.shiftKey) {
          setSelectedIds((prev) => new Set([...prev, id]));
          setSelectedType('object');
        } else {
          setSelectedIds(new Set([id]));
          setSelectedType('object');
        }
      } else if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setSelectedIds(new Set());
        setSelectedType(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(groundPlane, intersection);
      if (intersection) {
        setCursorWorldPos({
          x: parseFloat(intersection.x.toFixed(2)),
          y: parseFloat(intersection.y.toFixed(2)),
          z: parseFloat(intersection.z.toFixed(2)),
        });
      }
    };

    canvasRef.current.addEventListener('dblclick', handleDoubleClick);
    canvasRef.current.addEventListener('click', handleClick);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvasRef.current?.removeEventListener('dblclick', handleDoubleClick);
      canvasRef.current?.removeEventListener('click', handleClick);
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sceneData.objects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setTransformMode('translate');
        if (transformRef.current) transformRef.current.setMode('translate');
      } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setTransformMode('rotate');
        if (transformRef.current) transformRef.current.setMode('rotate');
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setTransformMode('scale');
        if (transformRef.current) transformRef.current.setMode('scale');
      } else if (e.key === 'x' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteClipboard();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        groupSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        ungroupSelected();
      } else if (e.key === '1') { setCameraPreset('Front (1)'); }
      else if (e.key === '2') { setCameraPreset('Back (2)'); }
      else if (e.key === '3') { setCameraPreset('Left (3)'); }
      else if (e.key === '4') { setCameraPreset('Right (4)'); }
      else if (e.key === '5') { setCameraPreset('Top (5)'); }
      else if (e.key === '6') { setCameraPreset('Bottom (6)'); }
      else if (e.key === '7') { setCameraPreset('Isometric (7)'); }
      else if (e.key === '0') { setCameraPreset('Free (0)'); }
      else if (e.key === 'Delete') {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, selectedType, undo, redo]);

  useEffect(() => {
    if (!isPlaying) return;
    const startTime = Date.now();
    const startAnimTime = animTime * 1000;

    const tick = () => {
      if (!isPlaying) return;
      const elapsed = (Date.now() - startTime + startAnimTime * 1000) / 1000;
      const duration = getAnimationDuration(sceneData.animations) || animDuration;
      let current = elapsed;
      if (animLoop && duration > 0) {
        current = elapsed % duration;
      } else if (elapsed >= duration) {
        setIsPlaying(false);
        setAnimTime(duration);
        return;
      }
      setAnimTime(current);
      applyAnimations(current);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, animLoop, animDuration, sceneData.animations]);

  const applyAnimations = useCallback((time: number) => {
    for (const anim of sceneData.animations) {
      const value = interpolateKeyframes(anim.keyframes, time);
      if (value === null) continue;

      const obj = sceneData.objects.find((o) => o.id === anim.objectId);
      if (!obj) continue;

      const newPos = [...obj.position] as [number, number, number];
      const newRot = [...obj.rotation] as [number, number, number];
      const newScale = [...obj.scale] as [number, number, number];

      if (anim.property === 'position') {
        if (anim.channel === 'x') newPos[0] = value;
        if (anim.channel === 'y') newPos[1] = value;
        if (anim.channel === 'z') newPos[2] = value;
      } else if (anim.property === 'rotation') {
        if (anim.channel === 'x') newRot[0] = value;
        if (anim.channel === 'y') newRot[1] = value;
        if (anim.channel === 'z') newRot[2] = value;
      } else if (anim.property === 'scale') {
        if (anim.channel === 'x') newScale[0] = value;
        if (anim.channel === 'y') newScale[1] = value;
        if (anim.channel === 'z') newScale[2] = value;
      }

      const mesh = objectMeshesRef.current.get(anim.objectId);
      if (mesh) {
        mesh.position.set(newPos[0], newPos[1], newPos[2]);
        mesh.rotation.set(newRot[0], newRot[1], newRot[2]);
        mesh.scale.set(newScale[0], newScale[1], newScale[2]);
      }
    }
  }, [sceneData.objects, sceneData.animations]);

  const updateObject = useCallback((id: string, changes: Partial<Scene3DObject>) => {
    setSceneData((prev) => ({
      ...prev,
      objects: prev.objects.map((o) => (o.id === id ? { ...o, ...changes } : o)),
    }));
  }, []);

  const updateObjectMaterial = useCallback((id: string, matChanges: Partial<Scene3DObject['material']>) => {
    setSceneData((prev) => ({
      ...prev,
      objects: prev.objects.map((o) =>
        o.id === id ? { ...o, material: { ...o.material, ...matChanges } } : o
      ),
    }));
  }, []);

  const updateLight = useCallback((id: string, changes: Partial<Scene3DLight>) => {
    setSceneData((prev) => ({
      ...prev,
      lights: prev.lights.map((l) => (l.id === id ? { ...l, ...changes } : l)),
    }));
  }, []);

  const addObject = useCallback((type: Scene3DObject['type']) => {
    pushHistory();
    const creators: Record<string, () => Scene3DObject> = {
      cube: createCube,
      sphere: createSphere,
      cylinder: createCylinder,
      cone: createCone,
      torus: createTorus,
      plane: createPlane,
    };
    const newObj = (creators[type] || createCube)();
    setSceneData((prev) => ({ ...prev, objects: [...prev.objects, newObj] }));
    setSelectedIds(new Set([newObj.id]));
    setSelectedType('object');
    setShowAddMenu(false);
  }, [pushHistory]);

  const addLight = useCallback((type: Scene3DLight['type']) => {
    pushHistory();
    const newLight = createLight(type);
    setSceneData((prev) => ({ ...prev, lights: [...prev.lights, newLight] }));
    setSelectedIds(new Set([newLight.id]));
    setSelectedType('light');
    setShowLightMenu(false);
  }, [pushHistory]);

  const addPrefab = useCallback((prefab: PrefabDefinition) => {
    pushHistory();
    const center: [number, number, number] = controlsRef.current
      ? [
          Math.round(controlsRef.current.target.x),
          0,
          Math.round(controlsRef.current.target.z),
        ]
      : [0, 0, 0];
    const objects = prefab.create(center);
    setSceneData((prev) => ({ ...prev, objects: [...prev.objects, ...objects] }));
    if (objects.length > 0) {
      setSelectedIds(new Set([objects[0].id]));
      setSelectedType('object');
    }
    setShowPrefabMenu(false);
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    pushHistory();
    if (selectedType === 'object') {
      setSceneData((prev) => ({
        ...prev,
        objects: prev.objects.filter((o) => !selectedIds.has(o.id)),
      }));
    } else {
      setSceneData((prev) => ({
        ...prev,
        lights: prev.lights.filter((l) => !selectedIds.has(l.id)),
      }));
    }
    setSelectedIds(new Set());
    setSelectedType(null);
    if (transformRef.current) transformRef.current.detach();
  }, [selectedIds, selectedType, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.size === 0 || selectedType !== 'object') return;
    pushHistory();
    const newIds: string[] = [];
    for (const id of selectedIds) {
      const obj = sceneData.objects.find((o) => o.id === id);
      if (!obj) continue;
      const newObj: Scene3DObject = {
        ...JSON.parse(JSON.stringify(obj)),
        id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: `${obj.name} Copy`,
        position: [obj.position[0] + 1, obj.position[1], obj.position[2]],
      };
      newIds.push(newObj.id);
      setSceneData((prev) => ({ ...prev, objects: [...prev.objects, newObj] }));
    }
    setSelectedIds(new Set(newIds));
  }, [selectedIds, selectedType, sceneData.objects, pushHistory]);

  const clipboardRef = useRef<Scene3DObject[]>([]);

  const copySelected = useCallback(() => {
    if (selectedType !== 'object') return;
    clipboardRef.current = sceneData.objects
      .filter((o) => selectedIds.has(o.id))
      .map((o) => JSON.parse(JSON.stringify(o)));
  }, [selectedIds, selectedType, sceneData.objects]);

  const pasteClipboard = useCallback(() => {
    if (clipboardRef.current.length === 0) return;
    pushHistory();
    const newIds: string[] = [];
    for (const obj of clipboardRef.current) {
      const newObj: Scene3DObject = {
        ...obj,
        id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: `${obj.name}`,
        position: [obj.position[0] + 2, obj.position[1], obj.position[2]],
      };
      newIds.push(newObj.id);
      setSceneData((prev) => ({ ...prev, objects: [...prev.objects, newObj] }));
    }
    setSelectedIds(new Set(newIds));
    setSelectedType('object');
  }, [pushHistory]);

  const selectAll = useCallback(() => {
    const allIds = sceneData.objects.map((o) => o.id);
    setSelectedIds(new Set(allIds));
    setSelectedType('object');
  }, [sceneData.objects]);

  const groupSelected = useCallback(() => {
    if (selectedIds.size < 2) return;
    pushHistory();
    const groupId = `grp_${Date.now()}`;
    const newGroup: SceneGroup = {
      id: groupId,
      name: `Group ${groups.length + 1}`,
      childIds: Array.from(selectedIds),
    };
    setGroups((prev) => [...prev, newGroup]);
  }, [selectedIds, groups.length, pushHistory]);

  const ungroupSelected = useCallback(() => {
    pushHistory();
    const idsToUngroup = new Set<string>();
    for (const id of selectedIds) {
      const group = groups.find((g) => g.id === id);
      if (group) {
        group.childIds.forEach((cid) => idsToUngroup.add(cid));
        idsToUngroup.add(id);
      }
    }
    setGroups((prev) => prev.filter((g) => !selectedIds.has(g.id)));
    setSelectedIds(idsToUngroup);
  }, [selectedIds, groups, pushHistory]);

  const setCameraPreset = useCallback((preset: string) => {
    const p = CAMERA_PRESETS[preset];
    if (!p || !cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(p.position[0], p.position[1], p.position[2]);
    controlsRef.current.target.set(p.target[0], p.target[1], p.target[2]);
  }, []);

  const updateEnvironment = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (fogType === 'none') {
      scene.fog = null;
    } else if (fogType === 'linear') {
      scene.fog = new THREE.Fog(sceneData.backgroundColor, fogNear, fogFar);
    } else {
      scene.fog = new THREE.FogExp2(sceneData.backgroundColor, 0.02);
    }

    const grid = scene.getObjectByName('__grid__') as THREE.GridHelper;
    if (grid) {
      grid.visible = groundType === 'grid';
    }
  }, [fogType, fogNear, fogFar, groundType, sceneData.backgroundColor]);

  useEffect(() => {
    updateEnvironment();
  }, [updateEnvironment]);

  const handleSave = useCallback(() => {
    onSave?.(sceneData);
    const json = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [sceneData, onSave]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as Scene3DData;
          setSceneData(data);
        } catch {
          console.error('Invalid scene file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleLeftResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setLeftPanelWidth(Math.max(180, Math.min(400, startWidth + delta)));
    };
    const onUp = () => {
      setIsResizingLeft(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftPanelWidth]);

  const handleRightResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      setRightPanelWidth(Math.max(220, Math.min(450, startWidth + delta)));
    };
    const onUp = () => {
      setIsResizingRight(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [rightPanelWidth]);

  const renderObjectTree = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
      {sceneData.objects.length === 0 && sceneData.lights.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Box size={32} className="mx-auto mb-2 opacity-40" />
          <p>No objects yet</p>
          <p className="mt-1">Click + to add one</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.id}>
          <div
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
              selectedIds.has(group.id)
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            onClick={() => {
              const childIds = new Set(group.childIds);
              childIds.add(group.id);
              setSelectedIds(childIds);
              setSelectedType('object');
            }}
          >
            <span className="text-indigo-400 shrink-0"><Group size={14} /></span>
            <span className="flex-1 truncate">{group.name}</span>
            <span className="text-[9px] text-slate-400">{group.childIds.length}</span>
          </div>
          {expandedObjects.has(group.id) && group.childIds.map((childId) => {
            const obj = sceneData.objects.find((o) => o.id === childId);
            if (!obj) return null;
            return (
              <div
                key={obj.id}
                className={`group flex items-center gap-1.5 pl-6 pr-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  selectedIds.has(obj.id) && selectedType === 'object'
                    ? 'bg-violet-100 text-violet-700 font-semibold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(obj.id)) next.delete(obj.id);
                      else next.add(obj.id);
                      return next;
                    });
                  } else {
                    setSelectedIds(new Set([obj.id]));
                    setSelectedType('object');
                  }
                }}
              >
                <span className="text-slate-400 shrink-0">{GEOMETRY_ICONS[obj.type]}</span>
                <span className="flex-1 truncate">{obj.name}</span>
              </div>
            );
          })}
        </div>
      ))}

      {sceneData.objects.map((obj) => {
        if (groups.some((g) => g.childIds.includes(obj.id))) return null;
        return (
          <div
            key={obj.id}
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
              selectedIds.has(obj.id) && selectedType === 'object'
                ? 'bg-violet-100 text-violet-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(obj.id)) next.delete(obj.id);
                  else next.add(obj.id);
                  return next;
                });
                setSelectedType('object');
              } else {
                setSelectedIds(new Set([obj.id]));
                setSelectedType('object');
              }
            }}
          >
            <span className="text-slate-400 shrink-0">
              {GEOMETRY_ICONS[obj.type]}
            </span>
            <span className="flex-1 truncate">{obj.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateObject(obj.id, { visible: !obj.visible });
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded"
            >
              {obj.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-300" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateObject(obj.id, { locked: !obj.locked });
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded"
            >
              {obj.locked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                pushHistory();
                setSceneData((prev) => ({
                  ...prev,
                  objects: prev.objects.filter((o) => o.id !== obj.id),
                }));
                if (selectedIds.has(obj.id)) {
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(obj.id);
                    return next;
                  });
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}

      {sceneData.lights.length > 0 && (
        <>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-3 mb-1 px-2 tracking-wider">
            Lights
          </div>
          {sceneData.lights.map((light) => (
            <div
              key={light.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedIds.has(light.id) && selectedType === 'light'
                  ? 'bg-amber-100 text-amber-700 font-semibold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={() => {
                setSelectedIds(new Set([light.id]));
                setSelectedType('light');
              }}
            >
              <span className="text-amber-400 shrink-0">
                {LIGHT_ICONS[light.type]}
              </span>
              <span className="flex-1 truncate">{light.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLight(light.id, { visible: !light.visible });
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded"
              >
                {light.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-300" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSceneData((prev) => ({
                    ...prev,
                    lights: prev.lights.filter((l) => l.id !== light.id),
                  }));
                  if (selectedIds.has(light.id)) {
                    setSelectedIds(new Set());
                    setSelectedType(null);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderTransformSection = () => {
    if (isMultiSelect) {
      return (
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Multiple Objects Selected ({selectedIds.size})
          </div>
          <div className="text-[10px] text-slate-500">
            Transform will apply to all selected objects.
          </div>
        </div>
      );
    }
    if (!selectedObj) return null;

    const fields = [
      { label: 'Position', key: 'position', values: selectedObj.position, color: 'text-rose-500' },
      { label: 'Rotation', key: 'rotation', values: selectedObj.rotation, color: 'text-blue-500' },
      { label: 'Scale', key: 'scale', values: selectedObj.scale, color: 'text-emerald-500' },
    ];

    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Transform
        </div>
        {fields.map((field) => (
          <div key={field.key}>
            <div className={`text-[10px] font-bold ${field.color} mb-1`}>
              {field.label}
            </div>
            <div className="flex gap-1">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <div key={axis} className="flex-1">
                  <div className="text-[9px] text-slate-400 font-mono">{axis}</div>
                  <input
                    type="number"
                    step={0.1}
                    value={Number(field.values[i].toFixed(2))}
                    onChange={(e) => {
                      pushHistory();
                      const newValues = [...field.values] as [number, number, number];
                      newValues[i] = parseFloat(e.target.value) || 0;
                      updateObject(selectedObj.id, { [field.key]: newValues });
                    }}
                    className="w-full px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMaterialSection = () => {
    if (isMultiSelect || !selectedObj) return null;
    const mat = selectedObj.material;

    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
          <span>Material</span>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-violet-500 normal-case tracking-normal text-[10px] font-semibold hover:text-violet-700"
          >
            Presets
          </button>
        </div>

        {showPresets && (
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(MATERIAL_PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => updateObjectMaterial(selectedObj.id, preset)}
                className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors"
              >
                <div
                  className="w-5 h-5 rounded-full border border-slate-200"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-[9px] text-slate-600">{name}</span>
              </button>
            ))}
          </div>
        )}

        <div>
          <div className="text-[10px] text-slate-500 mb-1">Color</div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={mat.color}
              onChange={(e) => updateObjectMaterial(selectedObj.id, { color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200"
            />
            <input
              type="text"
              value={mat.color}
              onChange={(e) => updateObjectMaterial(selectedObj.id, { color: e.target.value })}
              className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
            />
          </div>
        </div>

        {[
          { label: 'Opacity', key: 'opacity', min: 0, max: 1, step: 0.05 },
          { label: 'Metalness', key: 'metalness', min: 0, max: 1, step: 0.05 },
          { label: 'Roughness', key: 'roughness', min: 0, max: 1, step: 0.05 },
        ].map((slider) => (
          <div key={slider.key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-500">{slider.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {(mat[slider.key as keyof typeof mat] as number).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={mat[slider.key as keyof typeof mat] as number}
              onChange={(e) =>
                updateObjectMaterial(selectedObj.id, {
                  [slider.key]: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>
        ))}

        <div>
          <div className="text-[10px] text-slate-500 mb-1">Emissive</div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={mat.emissive || '#000000'}
              onChange={(e) => updateObjectMaterial(selectedObj.id, { emissive: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200"
            />
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={mat.emissiveIntensity || 0}
              onChange={(e) =>
                updateObjectMaterial(selectedObj.id, { emissiveIntensity: parseFloat(e.target.value) })
              }
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={mat.wireframe}
              onChange={(e) => updateObjectMaterial(selectedObj.id, { wireframe: e.target.checked })}
              className="rounded border-slate-300 accent-violet-500"
            />
            Wireframe
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={mat.doubleSided || false}
              onChange={(e) => updateObjectMaterial(selectedObj.id, { doubleSided: e.target.checked })}
              className="rounded border-slate-300 accent-violet-500"
            />
            Double Sided
          </label>
        </div>
      </div>
    );
  };

  const renderGeometrySection = () => {
    if (isMultiSelect || !selectedObj) return null;

    const params = selectedObj.geometryParams || {};

    const paramFields: Record<string, { label: string; min: number; max: number; step: number }[]> = {
      cube: [
        { label: 'width', min: 0.1, max: 20, step: 0.1 },
        { label: 'height', min: 0.1, max: 20, step: 0.1 },
        { label: 'depth', min: 0.1, max: 20, step: 0.1 },
      ],
      sphere: [
        { label: 'radius', min: 0.1, max: 10, step: 0.1 },
      ],
      cylinder: [
        { label: 'radiusTop', min: 0.1, max: 10, step: 0.1 },
        { label: 'radiusBottom', min: 0.1, max: 10, step: 0.1 },
        { label: 'height', min: 0.1, max: 20, step: 0.1 },
      ],
      cone: [
        { label: 'radius', min: 0.1, max: 10, step: 0.1 },
        { label: 'height', min: 0.1, max: 20, step: 0.1 },
      ],
      torus: [
        { label: 'radius', min: 0.1, max: 10, step: 0.1 },
        { label: 'tube', min: 0.01, max: 2, step: 0.01 },
      ],
      plane: [
        { label: 'width', min: 0.1, max: 20, step: 0.1 },
        { label: 'height', min: 0.1, max: 20, step: 0.1 },
      ],
    };

    const fields = paramFields[selectedObj.type] || [];
    if (fields.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
          <span>Geometry</span>
          <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded normal-case tracking-normal font-medium">
            {selectedObj.type}
          </span>
        </div>
        {fields.map((field) => (
          <div key={field.label}>
            <div className="text-[10px] text-slate-500 mb-1">{field.label}</div>
            <input
              type="number"
              step={field.step}
              min={field.min}
              max={field.max}
              value={params[field.label] || 1}
              onChange={(e) => {
                const newParams = { ...params, [field.label]: parseFloat(e.target.value) || field.min };
                updateObject(selectedObj.id, { geometryParams: newParams });
                const mesh = objectMeshesRef.current.get(selectedObj.id);
                if (mesh && mesh instanceof THREE.Mesh) {
                  mesh.geometry.dispose();
                  (mesh as any).geometry = createMeshForObject({ ...selectedObj, geometryParams: newParams }).geometry;
                }
              }}
              className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderLightProperties = () => {
    if (!selectedLight) return null;

    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Light Properties
        </div>

        <div>
          <div className="text-[10px] text-slate-500 mb-1">Type</div>
          <div className="text-[11px] bg-slate-100 px-2 py-1 rounded font-semibold text-slate-700 capitalize">
            {selectedLight.type}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 mb-1">Color</div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedLight.color}
              onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200"
            />
            <input
              type="text"
              value={selectedLight.color}
              onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })}
              className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500">Intensity</span>
            <span className="text-[10px] text-slate-400 font-mono">{selectedLight.intensity.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={selectedLight.intensity}
            onChange={(e) => updateLight(selectedLight.id, { intensity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {selectedLight.type !== 'ambient' && (
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Position</div>
            <div className="flex gap-1">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <div key={axis} className="flex-1">
                  <div className="text-[9px] text-slate-400 font-mono">{axis}</div>
                  <input
                    type="number"
                    step={0.5}
                    value={selectedLight.position[i]}
                    onChange={(e) => {
                      const newPos = [...selectedLight.position] as [number, number, number];
                      newPos[i] = parseFloat(e.target.value) || 0;
                      updateLight(selectedLight.id, { position: newPos });
                    }}
                    className="w-full px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedLight.castShadow}
            onChange={(e) => updateLight(selectedLight.id, { castShadow: e.target.checked })}
            className="rounded border-slate-300 accent-violet-500"
          />
          Cast Shadow
        </label>

        {selectedLight.type === 'point' && (
          <div>
            <div className="text-[10px] text-slate-500 mb-1">Distance</div>
            <input
              type="number"
              step={1}
              min={0}
              value={selectedLight.distance || 50}
              onChange={(e) => updateLight(selectedLight.id, { distance: parseFloat(e.target.value) || 50 })}
              className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
            />
          </div>
        )}

        {selectedLight.type === 'spot' && (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500">Angle</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {((selectedLight.angle || Math.PI / 6) * 180 / Math.PI).toFixed(0)}°
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={Math.PI / 2}
                step={0.05}
                value={selectedLight.angle || Math.PI / 6}
                onChange={(e) => updateLight(selectedLight.id, { angle: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500">Penumbra</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(selectedLight.penumbra || 0.3).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={selectedLight.penumbra || 0.3}
                onChange={(e) => updateLight(selectedLight.id, { penumbra: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    const totalDuration = getAnimationDuration(sceneData.animations) || animDuration;
    const progress = totalDuration > 0 ? (animTime / totalDuration) * 100 : 0;

    return (
      <div className="bg-white border-t border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1 rounded transition-colors ${
              isPlaying ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => { setIsPlaying(false); setAnimTime(0); }}
            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <StopIcon size={14} />
          </button>
          <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={animLoop}
              onChange={(e) => setAnimLoop(e.target.checked)}
              className="rounded border-slate-300 accent-violet-500"
            />
            <Repeat size={10} />
            Loop
          </label>
          <div className="flex-1" />
          <span className="text-[10px] text-slate-400 font-mono">
            {animTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
          </span>
        </div>

        <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          {sceneData.animations.map((anim, i) =>
            anim.keyframes.map((kf, j) => (
              <div
                key={`${i}-${j}`}
                className="absolute top-0 w-1.5 h-full bg-amber-400 rounded cursor-pointer"
                style={{ left: `${(kf.time / totalDuration) * 100}%` }}
                title={`${kf.time.toFixed(2)}s = ${kf.value.toFixed(2)}`}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <select
            value={selectedEasing}
            onChange={(e) => setSelectedEasing(e.target.value)}
            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
          >
            {EASING_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => setIsAddingKeyframe(true)}
            className="text-[10px] bg-violet-100 text-violet-600 hover:bg-violet-200 px-2 py-0.5 rounded font-semibold transition-colors"
          >
            + Keyframe
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              setAnimDuration(5);
              setAnimTime(0);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-600"
          >
            Duration: {animDuration}s
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100">
      <div className="h-11 bg-white border-b border-slate-200 flex items-center px-3 gap-1.5 shrink-0 shadow-sm">
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => { setShowAddMenu(!showAddMenu); setShowLightMenu(false); setShowPrefabMenu(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Plus size={14} />
            Add
            <ChevronDown size={12} />
          </button>
          {showAddMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[160px]">
              {[
                { type: 'cube' as const, label: 'Cube', icon: <Box size={14} /> },
                { type: 'sphere' as const, label: 'Sphere', icon: <Circle size={14} /> },
                { type: 'cylinder' as const, label: 'Cylinder', icon: <Cylinder size={14} /> },
                { type: 'cone' as const, label: 'Cone', icon: <Cone size={14} /> },
                { type: 'torus' as const, label: 'Torus', icon: <Triangle size={14} /> },
                { type: 'plane' as const, label: 'Plane', icon: <Square size={14} /> },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addObject(item.type)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => { setShowPrefabMenu(!showPrefabMenu); setShowAddMenu(false); setShowLightMenu(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Sparkles size={14} />
            Prefabs
            <ChevronDown size={12} />
          </button>
          {showPrefabMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[200px] max-h-[400px] overflow-y-auto">
              {PREFABS.map((prefab) => (
                <button
                  key={prefab.name}
                  onClick={() => addPrefab(prefab)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-base">{prefab.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{prefab.name}</div>
                    <div className="text-[9px] text-slate-400">{prefab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => { setShowLightMenu(!showLightMenu); setShowAddMenu(false); setShowPrefabMenu(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Lightbulb size={14} />
            Light
            <ChevronDown size={12} />
          </button>
          {showLightMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[160px]">
              {(['ambient', 'directional', 'point', 'spot'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => addLight(type)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors capitalize"
                >
                  {LIGHT_ICONS[type]}
                  {type} Light
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={() => { pushHistory(); duplicateSelected(); }}
          disabled={selectedIds.size === 0 || selectedType !== 'object'}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
          title="Duplicate (D)"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={deleteSelected}
          disabled={selectedIds.size === 0}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-30 transition-colors"
          title="Delete (X)"
        >
          <Trash2 size={14} />
        </button>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </button>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={groupSelected}
          disabled={selectedIds.size < 2}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
          title="Group (Ctrl+G)"
        >
          <Group size={14} />
        </button>
        <button
          onClick={ungroupSelected}
          disabled={selectedIds.size === 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
          title="Ungroup (Ctrl+Shift+G)"
        >
          <Ungroup size={14} />
        </button>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-1.5 rounded-lg transition-colors ${
            snapToGrid ? 'bg-violet-100 text-violet-600' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Snap to Grid"
        >
          <Grid3x3 size={14} />
        </button>
        {snapToGrid && (
          <select
            value={snapSize}
            onChange={(e) => setSnapSize(parseFloat(e.target.value))}
            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
          >
            <option value={0.1}>0.1</option>
            <option value={0.5}>0.5</option>
            <option value={1}>1.0</option>
            <option value={5}>5.0</option>
          </select>
        )}

        <div className="w-px h-5 bg-slate-200" />

        <div className="flex items-center gap-0.5">
          {([
            { mode: 'translate' as TransformMode, icon: <Move size={12} />, label: 'G' },
            { mode: 'rotate' as TransformMode, icon: <RotateCcw size={12} />, label: 'R' },
            { mode: 'scale' as TransformMode, icon: <Target size={12} />, label: 'S' },
          ]).map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                setTransformMode(item.mode);
                if (transformRef.current) transformRef.current.setMode(item.mode);
              }}
              className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
                transformMode === item.mode
                  ? 'bg-violet-100 text-violet-600'
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title={`${item.mode} (${item.label})`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSpaceMode(spaceMode === 'world' ? 'local' : 'world')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
            spaceMode === 'world' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
          }`}
          title="Toggle World/Local Space"
        >
          {spaceMode === 'world' ? 'WORLD' : 'LOCAL'}
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {Object.keys(CAMERA_PRESETS).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className="px-1.5 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors"
              title={preset}
            >
              {preset.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={() => setShowEnvironment(!showEnvironment)}
          className={`p-1.5 rounded-lg transition-colors ${
            showEnvironment ? 'bg-sky-100 text-sky-600' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Environment"
        >
          <Mountain size={14} />
        </button>

        <button
          onClick={() => setShowShortcuts(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={14} />
        </button>

        <div className="w-px h-5 bg-slate-200" />

        <button
          onClick={handleLoad}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Upload size={12} />
          Load
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
        >
          <Download size={12} />
          Export
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        <div
          className="bg-white border-r border-slate-200 flex flex-col shrink-0"
          style={{ width: leftPanelWidth }}
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Scene Objects
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              {sceneData.objects.length}
            </span>
          </div>
          {renderObjectTree()}
        </div>

        <div
          className="w-1 hover:w-1.5 bg-slate-200 hover:bg-violet-400 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleLeftResize}
        />

        <div ref={containerRef} className="flex-1 relative bg-slate-200 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className="bg-white/80 backdrop-blur text-[10px] font-mono text-slate-600 px-2 py-1 rounded-lg shadow-sm border border-slate-200">
              {transformMode === 'translate' ? 'G: Move' : transformMode === 'rotate' ? 'R: Rotate' : 'S: Scale'}
            </div>
            {cursorWorldPos && (
              <div className="bg-white/80 backdrop-blur text-[10px] font-mono text-slate-500 px-2 py-1 rounded-lg shadow-sm border border-slate-200">
                X: {cursorWorldPos.x}, Y: {cursorWorldPos.y}, Z: {cursorWorldPos.z}
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-white/80 backdrop-blur px-2 py-1 rounded-lg shadow-sm border border-slate-200">
            {sceneData.objects.length} objects | {sceneData.lights.length} lights
            {isMultiSelect && <span className="text-violet-500 ml-1">| {selectedIds.size} selected</span>}
          </div>
        </div>

        <div
          className="w-1 hover:w-1.5 bg-slate-200 hover:bg-violet-400 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleRightResize}
        />

        <div
          className="bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar"
          style={{ width: rightPanelWidth }}
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Properties
            </div>
          </div>

          {selectedObj && (
            <div className="p-3 space-y-4 border-b border-slate-100">
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Name</div>
                <input
                  type="text"
                  value={selectedObj.name}
                  onChange={(e) => updateObject(selectedObj.id, { name: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 font-semibold"
                />
              </div>
              {renderTransformSection()}
              {renderMaterialSection()}
              {renderGeometrySection()}
            </div>
          )}

          {isMultiSelect && (
            <div className="p-3 space-y-4 border-b border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Multiple Objects Selected ({selectedIds.size})
              </div>
              {renderTransformSection()}
            </div>
          )}

          {selectedLight && (
            <div className="p-3 space-y-4 border-b border-slate-100">
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Name</div>
                <input
                  type="text"
                  value={selectedLight.name}
                  onChange={(e) => updateLight(selectedLight.id, { name: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 font-semibold"
                />
              </div>
              {renderLightProperties()}
            </div>
          )}

          {!selectedObj && !selectedLight && selectedIds.size === 0 && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-slate-400">
                <MousePointer2 size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Select an object</p>
                <p className="text-[10px] mt-1 opacity-70">Click an object in the scene or tree</p>
                <p className="text-[10px] mt-2 opacity-50">Ctrl+Click for multi-select</p>
              </div>
            </div>
          )}

          <div className="px-3 py-2 border-b border-slate-100 mt-auto">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Scene
            </div>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Background</div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sceneData.backgroundColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setSceneData((prev) => ({ ...prev, backgroundColor: color }));
                    if (sceneRef.current) {
                      sceneRef.current.background = new THREE.Color(color);
                      sceneRef.current.fog = new THREE.Fog(color, 50, 200);
                    }
                  }}
                  className="w-7 h-7 rounded cursor-pointer border border-slate-200"
                />
                <input
                  type="text"
                  value={sceneData.backgroundColor}
                  onChange={(e) => {
                    setSceneData((prev) => ({ ...prev, backgroundColor: e.target.value }));
                    if (sceneRef.current) {
                      sceneRef.current.background = new THREE.Color(e.target.value);
                      sceneRef.current.fog = new THREE.Fog(e.target.value, 50, 200);
                    }
                  }}
                  className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
                />
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 mb-1">Ground</div>
              <div className="flex gap-1">
                {(['grid', 'checkerboard', 'grass', 'sand'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setGroundType(type)}
                    className={`px-2 py-1 text-[9px] rounded font-semibold capitalize transition-colors ${
                      groundType === type
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 mb-1">Fog</div>
              <div className="flex gap-1">
                {(['none', 'linear', 'exponential'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFogType(type)}
                    className={`px-2 py-1 text-[9px] rounded font-semibold capitalize transition-colors ${
                      fogType === type
                        ? 'bg-sky-100 text-sky-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {fogType === 'linear' && (
                <div className="flex gap-2 mt-1">
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-400">Near</div>
                    <input
                      type="number"
                      value={fogNear}
                      onChange={(e) => setFogNear(parseFloat(e.target.value) || 10)}
                      className="w-full px-1 py-0.5 text-[10px] bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-400">Far</div>
                    <input
                      type="number"
                      value={fogFar}
                      onChange={(e) => setFogFar(parseFloat(e.target.value) || 50)}
                      className="w-full px-1 py-0.5 text-[10px] bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] text-slate-500 mb-1">Lighting Preset</div>
              <div className="flex gap-1">
                {(['studio', 'outdoor', 'indoor', 'night'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setEnvPreset(preset);
                      const presets: Record<string, { ambient: number; directional: number; bg: string }> = {
                        studio: { ambient: 0.6, directional: 0.8, bg: '#f0f0f0' },
                        outdoor: { ambient: 0.5, directional: 1.0, bg: '#87ceeb' },
                        indoor: { ambient: 0.3, directional: 0.5, bg: '#fff8e7' },
                        night: { ambient: 0.1, directional: 0.2, bg: '#1a1a2e' },
                      };
                      const p = presets[preset];
                      setSceneData((prev) => ({ ...prev, backgroundColor: p.bg }));
                      if (sceneRef.current) {
                        sceneRef.current.background = new THREE.Color(p.bg);
                      }
                    }}
                    className={`px-2 py-1 text-[9px] rounded font-semibold capitalize transition-colors ${
                      envPreset === preset
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderTimeline()}

      {(showAddMenu || showLightMenu || showPrefabMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowAddMenu(false); setShowLightMenu(false); setShowPrefabMenu(false); }}
        />
      )}

      {renamingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-72 space-y-4 border border-slate-200">
            <div className="text-sm font-bold text-slate-800">Rename Object</div>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateObject(renamingId, { name: renameValue });
                  setRenamingId(null);
                } else if (e.key === 'Escape') {
                  setRenamingId(null);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRenamingId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateObject(renamingId, { name: renameValue });
                  setRenamingId(null);
                }}
                className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddingKeyframe && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-80 space-y-4 border border-slate-200">
            <div className="text-sm font-bold text-slate-800">Add Keyframe</div>
            <div className="space-y-2">
              <div>
                <div className="text-[10px] text-slate-500 mb-1">Object</div>
                <select
                  value={keyframeObjectId}
                  onChange={(e) => setKeyframeObjectId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400"
                >
                  <option value="">Select object...</option>
                  {sceneData.objects.map((obj) => (
                    <option key={obj.id} value={obj.id}>{obj.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Property</div>
                  <select
                    value={keyframeProperty}
                    onChange={(e) => setKeyframeProperty(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400"
                  >
                    <option value="position">Position</option>
                    <option value="rotation">Rotation</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Axis</div>
                  <select
                    value={keyframeChannel}
                    onChange={(e) => setKeyframeChannel(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400"
                  >
                    <option value="x">X</option>
                    <option value="y">Y</option>
                    <option value="z">Z</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Time (s)</div>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    value={keyframeTime}
                    onChange={(e) => setKeyframeTime(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Value</div>
                  <input
                    type="number"
                    step={0.1}
                    value={keyframeValue}
                    onChange={(e) => setKeyframeValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAddingKeyframe(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!keyframeObjectId) return;
                  const existing = sceneData.animations.find(
                    (a) => a.objectId === keyframeObjectId && a.property === keyframeProperty && a.channel === keyframeChannel
                  );
                  if (existing) {
                    const updated = addKeyframe(existing, keyframeTime, keyframeValue, selectedEasing);
                    setSceneData((prev) => ({
                      ...prev,
                      animations: prev.animations.map((a) => (a.id === updated.id ? updated : a)),
                    }));
                  } else {
                    const newAnim: Animation3D = {
                      id: `anim_${Date.now()}`,
                      objectId: keyframeObjectId,
                      property: keyframeProperty,
                      channel: keyframeChannel,
                      keyframes: [{ time: keyframeTime, value: keyframeValue, easing: selectedEasing }],
                    };
                    setSceneData((prev) => ({
                      ...prev,
                      animations: [...prev.animations, newAnim],
                    }));
                  }
                  setIsAddingKeyframe(false);
                }}
                className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-slate-800">Keyboard Shortcuts</div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'G', desc: 'Move mode' },
                { key: 'R', desc: 'Rotate mode' },
                { key: 'S', desc: 'Scale mode' },
                { key: 'X / Delete', desc: 'Delete selected' },
                { key: 'D', desc: 'Duplicate selected' },
                { key: 'Ctrl+Z', desc: 'Undo' },
                { key: 'Ctrl+Y', desc: 'Redo' },
                { key: 'Ctrl+C', desc: 'Copy' },
                { key: 'Ctrl+V', desc: 'Paste' },
                { key: 'Ctrl+D', desc: 'Duplicate' },
                { key: 'Ctrl+A', desc: 'Select all' },
                { key: 'Ctrl+Click', desc: 'Toggle selection' },
                { key: 'Shift+Click', desc: 'Add to selection' },
                { key: 'Ctrl+G', desc: 'Group objects' },
                { key: 'Ctrl+Shift+G', desc: 'Ungroup' },
                { key: 'Double-click', desc: 'Rename object' },
                { key: '1-7', desc: 'Camera presets' },
                { key: '0', desc: 'Free camera' },
                { key: '?', desc: 'Show this help' },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-2 py-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-bold min-w-[60px] text-center">
                    {shortcut.key}
                  </kbd>
                  <span className="text-slate-600">{shortcut.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
