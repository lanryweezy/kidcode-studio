import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronDown, ChevronRight,
  Plus, Grid3x3, Move, RotateCcw, Box, Circle, Cylinder, Cone,
  Triangle, Square, Sun, Lightbulb, Zap, Play, Pause, Square as StopIcon,
  Repeat, Download, Upload, Globe, Target, Layers, X,
  MousePointer2, HelpCircle, Undo2, Redo2, Group, Ungroup,
  Palette, Mountain, Sparkles, ArrowLeft, Ruler, PenTool, Wrench, FileDown,
} from 'lucide-react';
import {
  Scene3DObject, Scene3DLight, Animation3D, Scene3DData,
  createCube, createSphere, createCylinder, createCone, createTorus, createPlane,
  createLight, createDefaultScene, MATERIAL_PRESETS,
} from '../services/scene3DPrimitives';
import { createThreeLight, updateThreeLight, createLightHelper } from '../services/scene3DLighting';
import { EASING_NAMES, interpolateKeyframes, getAnimationDuration, addKeyframe } from '../services/scene3DAnimations';
import { PREFABS, PrefabDefinition } from '../services/scene3DPrefabs';
import {
  CADState, CADObject3D, CADOperationType, CADSketch, CADSketchShape, CADSketchTool,
  CADMeasureResult, CADPoint, CADMirrorPlane, CADMaterialType, CAD_MATERIALS,
  CADConstraint, CADConstraintType, CADExportOptions, INITIAL_CAD_STATE,
} from '../types/cad';
import {
  createBoxParameters, createCylinderParameters, createSphereParameters, setParameterValue,
  applyFillet, applyChamfer, applyShell, applyLinearArray, applyCircularArray, applyMirror,
  calculateObjectVolume,
} from '../services/cadParametrics';
import { exportCADModel } from '../services/cadExporter';
import OperationsPanel from './cad/OperationsPanel';
import BOMPanel from './cad/BOMPanel';
import PrintPreview from './cad/PrintPreview';
import { CAD_TEMPLATES, CADTemplate } from './cad/CADTemplates';

type StudioMode = 'scene' | 'sketch' | 'design' | 'measure' | 'export';
type TransformMode = 'translate' | 'rotate' | 'scale';

const genId = () => Math.random().toString(36).substring(2, 10);

const GEOMETRY_ICONS: Record<string, React.ReactNode> = {
  cube: <Box size={14} />, sphere: <Circle size={14} />, cylinder: <Cylinder size={14} />,
  cone: <Cone size={14} />, torus: <Triangle size={14} />, plane: <Square size={14} />,
  model: <Box size={14} />,
};

const LIGHT_ICONS: Record<string, React.ReactNode> = {
  ambient: <Sun size={14} />, directional: <Sun size={14} />,
  point: <Lightbulb size={14} />, spot: <Zap size={14} />,
};

const CAD_TYPE_ICONS: Record<string, string> = {
  box: '▣', cylinder: '◎', sphere: '●', extrude: '⬒', revolve: '↻',
  boolean: '⊕', fillet: '◎', chamfer: '◇', shell: '▢', pattern: '⊞',
  sweep: '⟿', loft: '⊿', imported: '◆',
};

const CAMERA_PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  'Front (1)': { position: [0, 2, 8], target: [0, 0, 0] },
  'Back (2)': { position: [0, 2, -8], target: [0, 0, 0] },
  'Left (3)': { position: [-8, 2, 0], target: [0, 0, 0] },
  'Right (4)': { position: [8, 2, 0], target: [0, 0, 0] },
  'Top (5)': { position: [0, 10, 0.01], target: [0, 0, 0] },
  'Bottom (6)': { position: [0, -10, 0.01], target: [0, 0, 0] },
  'Isometric (7)': { position: [5, 5, 5], target: [0, 0, 0] },
};

interface UnifiedDesignStudioProps {
  onClose: () => void;
  onSave?: (data: Scene3DData) => void;
  initialData?: Scene3DData;
}

export default function UnifiedDesignStudio({ onClose, onSave, initialData }: UnifiedDesignStudioProps) {
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
  const geometryPoolRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const materialPoolRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const frustumRef = useRef<THREE.Frustum>(new THREE.Frustum());
  const projScreenMatrixRef = useRef<THREE.Matrix4>(new THREE.Matrix4());

  const [mode, setMode] = useState<StudioMode>('scene');
  const [sceneData, setSceneData] = useState<Scene3DData>(initialData || createDefaultScene());
  const [cadState, setCADState] = useState<CADState>(INITIAL_CAD_STATE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<'object' | 'light' | 'cad' | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [spaceMode, setSpaceMode] = useState<'world' | 'local'>('world');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [snapSize, setSnapSize] = useState(1);
  const [cursorWorldPos, setCursorWorldPos] = useState<{ x: number; y: number; z: number } | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(220);
  const [rightPanelWidth, setRightPanelWidth] = useState(260);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [rightTab, setRightTab] = useState<'properties' | 'operations' | 'bom' | 'print'>('properties');

  const [isPlaying, setIsPlaying] = useState(false);
  const [animTime, setAnimTime] = useState(0);
  const [animLoop, setAnimLoop] = useState(true);
  const [animDuration, setAnimDuration] = useState(5);
  const [selectedEasing, setSelectedEasing] = useState('Linear');
  const [isAddingKeyframe, setIsAddingKeyframe] = useState(false);
  const [keyframeObjectId, setKeyframeObjectId] = useState('');
  const [keyframeProperty, setKeyframeProperty] = useState<'position' | 'rotation' | 'scale'>('position');
  const [keyframeChannel, setKeyframeChannel] = useState<'x' | 'y' | 'z'>('y');
  const [keyframeValue, setKeyframeValue] = useState(0);
  const [keyframeTime, setKeyframeTime] = useState(0);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLightMenu, setShowLightMenu] = useState(false);
  const [showPrefabMenu, setShowPrefabMenu] = useState(false);
  const [groups, setGroups] = useState<Array<{ id: string; name: string; childIds: string[] }>>([]);
  const [history, setHistory] = useState<Array<{
    objects: Scene3DObject[]; lights: Scene3DLight[]; animations: Animation3D[]; backgroundColor: string; label: string;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showEnvironment, setShowEnvironment] = useState(false);
  const [fogType, setFogType] = useState<'none' | 'linear' | 'exponential'>('none');
  const [fogNear, setFogNear] = useState(10);
  const [fogFar, setFogFar] = useState(50);

  const [sketchActive, setSketchActive] = useState(false);
  const [sketchTool, setSketchTool] = useState<CADSketchTool>('none');
  const [sketchPoints, setSketchPoints] = useState<CADPoint[]>([]);
  const [sketchDragStart, setSketchDragStart] = useState<CADPoint | null>(null);
  const [sketchDragCurrent, setSketchDragCurrent] = useState<CADPoint | null>(null);
  const [sketchPan, setSketchPan] = useState({ x: 0, y: 0 });
  const [sketchZoom, setSketchZoom] = useState(1);

  const [measureMode, setMeasureMode] = useState<'none' | 'distance' | 'angle' | 'area' | 'volume' | 'radius'>('none');
  const [measurePoints, setMeasurePoints] = useState<CADPoint[]>([]);

  const [exportFormat, setExportFormat] = useState<'stl' | 'stl_binary' | 'obj' | 'gltf' | 'glb' | '3mf'>('stl');
  const [exportUnit, setExportUnit] = useState<'mm' | 'cm' | 'inch'>('mm');
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const [cadMaterialId, setCadMaterialId] = useState<string>('PLA');

  const selectedId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedObj = selectedId && selectedType === 'object' ? sceneData.objects.find((o) => o.id === selectedId) : null;
  const selectedLight = selectedId && selectedType === 'light' ? sceneData.lights.find((l) => l.id === selectedId) : null;
  const selectedCADObj = selectedId && selectedType === 'cad' ? cadState.objects.find((o) => o.id === selectedId) : null;
  const isMultiSelect = selectedIds.size > 1;

  const pushHistory = useCallback((label = '') => {
    const entry = {
      objects: JSON.parse(JSON.stringify(sceneData.objects)),
      lights: JSON.parse(JSON.stringify(sceneData.lights)),
      animations: JSON.parse(JSON.stringify(sceneData.animations)),
      backgroundColor: sceneData.backgroundColor,
      label,
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

  const pushCADHistory = useCallback((label = '') => {
    setCADState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack.slice(-30), { objects: prev.objects, label }],
      redoStack: [],
    }));
  }, []);

  const undoCAD = useCallback(() => {
    setCADState(prev => {
      if (prev.undoStack.length === 0) return prev;
      const prevEntry = prev.undoStack[prev.undoStack.length - 1];
      const prevObjects = prevEntry.objects;
      return {
        ...prev,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [{ objects: prev.objects, label: '' }, ...prev.redoStack],
        objects: prevObjects,
        selectedObjectIds: [],
      };
    });
  }, []);

  const redoCAD = useCallback(() => {
    setCADState(prev => {
      if (prev.redoStack.length === 0) return prev;
      const nextEntry = prev.redoStack[0];
      const nextObjects = nextEntry.objects;
      return {
        ...prev,
        redoStack: prev.redoStack.slice(1),
        undoStack: [...prev.undoStack, { objects: prev.objects, label: '' }],
        objects: nextObjects,
        selectedObjectIds: [],
      };
    });
  }, []);

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
    camera.position.set(sceneData.camera.position[0], sceneData.camera.position[1], sceneData.camera.position[2]);
    camera.lookAt(sceneData.camera.target[0], sceneData.camera.target[1], sceneData.camera.target[2]);

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
            tc.object.rotation.x, tc.object.rotation.y, tc.object.rotation.z,
          ];
          const scl: [number, number, number] = [
            tc.object.scale.x, tc.object.scale.y, tc.object.scale.z,
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
      if (cameraRef.current) {
        projScreenMatrixRef.current.multiplyMatrices(cameraRef.current.projectionMatrix, cameraRef.current.matrixWorldInverse);
        frustumRef.current.setFromProjectionMatrix(projScreenMatrixRef.current);
        const camPos = cameraRef.current.position;
        objectMeshesRef.current.forEach((mesh) => {
          if (transformRef.current && mesh === transformRef.current.object) return;
          if (mesh instanceof THREE.Mesh) {
            const dist = mesh.position.distanceTo(camPos);
            mesh.visible = dist < 200;
          }
        });
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  const syncSceneToThree = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    for (const [id, mesh] of objectMeshesRef.current) {
      const isSceneObj = sceneData.objects.find((o) => o.id === id);
      const isCADObj = cadState.objects.find((o) => o.id === id);
      if (!isSceneObj && !isCADObj) {
        if (mesh instanceof THREE.Mesh) {
          const m = mesh as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose());
            else m.material.dispose();
          }
        }
        scene.remove(mesh);
        objectMeshesRef.current.delete(id);
      }
    }

    for (const [id, light] of lightMeshesRef.current) {
      if (!sceneData.lights.find((l) => l.id === id)) {
        if (light instanceof THREE.Mesh) {
          const m = light as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose());
            else m.material.dispose();
          }
        }
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

    for (const obj of cadState.objects) {
      if (!obj.visible) {
        const existing = objectMeshesRef.current.get(obj.id);
        if (existing) existing.visible = false;
        continue;
      }
      let mesh = objectMeshesRef.current.get(obj.id);
      const matConfig = CAD_MATERIALS[(obj.materialId as CADMaterialType)] || CAD_MATERIALS.PLA;

      if (mesh && mesh instanceof THREE.Mesh && obj.geometry) {
        if (mesh.geometry !== obj.geometry) {
          mesh.geometry.dispose();
          mesh.geometry = obj.geometry;
        }
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set(matConfig.color);
        mat.roughness = matConfig.roughness;
        mat.metalness = matConfig.metalness;
        mat.opacity = matConfig.opacity;
        mat.transparent = matConfig.transparent;
      } else if (obj.geometry) {
        const material = new THREE.MeshStandardMaterial({
          color: matConfig.color,
          roughness: matConfig.roughness,
          metalness: matConfig.metalness,
          opacity: matConfig.opacity,
          transparent: matConfig.transparent,
        });
        mesh = new THREE.Mesh(obj.geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = obj.id;
        scene.add(mesh);
        objectMeshesRef.current.set(obj.id, mesh);
      }

      if (mesh) {
        mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
        mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
        mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
        mesh.visible = obj.visible;
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
          mesh.visible = true;
          transformRef.current.attach(mesh);
        }
      } else {
        transformRef.current.detach();
      }
    }
  }, [sceneData, cadState.objects, selectedIds]);

  function getLODSegments(baseSegments: number, distance: number): number {
    if (distance > 50) return Math.max(4, Math.floor(baseSegments * 0.25));
    if (distance > 20) return Math.max(8, Math.floor(baseSegments * 0.5));
    return baseSegments;
  }

  const createMeshForObject = useCallback((obj: Scene3DObject): THREE.Mesh => {
    const cameraPos = cameraRef.current?.position;
    const objPos = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
    const distance = cameraPos ? cameraPos.distanceTo(objPos) : 0;
    let geometry: THREE.BufferGeometry;
    switch (obj.type) {
      case 'cube': {
        const p = obj.geometryParams || {};
        const key = `cube_${p.width || 1}_${p.height || 1}_${p.depth || 1}`;
        const pooled = geometryPoolRef.current.get(key);
        geometry = pooled ? pooled : new THREE.BoxGeometry(p.width || 1, p.height || 1, p.depth || 1);
        if (!pooled) geometryPoolRef.current.set(key, geometry);
        break;
      }
      case 'sphere': {
        const p = obj.geometryParams || {};
        const segs = getLODSegments(p.widthSegments || 32, distance);
        const key = `sphere_${p.radius || 0.5}_${segs}`;
        const pooled = geometryPoolRef.current.get(key);
        geometry = pooled ? pooled : new THREE.SphereGeometry(p.radius || 0.5, segs, getLODSegments(p.heightSegments || 32, distance));
        if (!pooled) geometryPoolRef.current.set(key, geometry);
        break;
      }
      case 'cylinder': {
        const p = obj.geometryParams || {};
        const segs = getLODSegments(p.radialSegments || 32, distance);
        const key = `cylinder_${p.radiusTop || 0.5}_${p.radiusBottom || 0.5}_${p.height || 1}_${segs}`;
        const pooled = geometryPoolRef.current.get(key);
        geometry = pooled ? pooled : new THREE.CylinderGeometry(p.radiusTop || 0.5, p.radiusBottom || 0.5, p.height || 1, segs);
        if (!pooled) geometryPoolRef.current.set(key, geometry);
        break;
      }
      case 'cone': {
        const p = obj.geometryParams || {};
        const segs = getLODSegments(p.radialSegments || 32, distance);
        const key = `cone_${p.radius || 0.5}_${p.height || 1}_${segs}`;
        const pooled = geometryPoolRef.current.get(key);
        geometry = pooled ? pooled : new THREE.ConeGeometry(p.radius || 0.5, p.height || 1, segs);
        if (!pooled) geometryPoolRef.current.set(key, geometry);
        break;
      }
      case 'torus': {
        const p = obj.geometryParams || {};
        const rSegs = getLODSegments(p.radialSegments || 16, distance);
        const tSegs = getLODSegments(p.tubularSegments || 32, distance);
        const key = `torus_${p.radius || 0.5}_${p.tube || 0.2}_${rSegs}_${tSegs}`;
        const pooled = geometryPoolRef.current.get(key);
        geometry = pooled ? pooled : new THREE.TorusGeometry(p.radius || 0.5, p.tube || 0.2, rSegs, tSegs);
        if (!pooled) geometryPoolRef.current.set(key, geometry);
        break;
      }
      case 'plane': {
        const p = obj.geometryParams || {};
        const key = `plane_${p.width || 2}_${p.height || 2}`;
        const pooled = geometryPoolRef.current.get(key);
        geometry = pooled ? pooled : new THREE.PlaneGeometry(p.width || 2, p.height || 2);
        if (!pooled) geometryPoolRef.current.set(key, geometry);
        break;
      }
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    const colorKey = `${obj.material.color}_${obj.material.opacity}_${obj.material.metalness}_${obj.material.roughness}_${obj.material.wireframe}_${obj.material.doubleSided}`;
    let material = materialPoolRef.current.get(colorKey);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: obj.material.color,
        opacity: obj.material.opacity,
        transparent: obj.material.opacity < 1,
        metalness: obj.material.metalness,
        roughness: obj.material.roughness,
        wireframe: obj.material.wireframe,
        side: obj.material.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      });
      materialPoolRef.current.set(colorKey, material);
    }
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
    const handleClick = (e: MouseEvent) => {
      if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const meshes = Array.from(objectMeshesRef.current.values()).filter(m => m.visible);
      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const id = intersects[0].object.name;
        const isSceneObj = sceneData.objects.find(o => o.id === id);
        if (isSceneObj) {
          if (e.ctrlKey || e.metaKey) {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id); else next.add(id);
              return next;
            });
            setSelectedType('object');
          } else {
            setSelectedIds(new Set([id]));
            setSelectedType('object');
          }
        } else {
          const isCAD = cadState.objects.find(o => o.id === id);
          if (isCAD) {
            if (e.ctrlKey || e.metaKey) {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id); else next.add(id);
                return next;
              });
              setSelectedType('cad');
            } else {
              setSelectedIds(new Set([id]));
              setSelectedType('cad');
            }
          }
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

    canvasRef.current.addEventListener('click', handleClick);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvasRef.current?.removeEventListener('click', handleClick);
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sceneData.objects, cadState.objects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); setTransformMode('translate');
        if (transformRef.current) transformRef.current.setMode('translate');
      } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); setTransformMode('rotate');
        if (transformRef.current) transformRef.current.setMode('rotate');
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); setTransformMode('scale');
        if (transformRef.current) transformRef.current.setMode('scale');
      } else if (e.key === 'x' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); deleteSelected();
      } else if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); duplicateSelected();
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault(); setShowShortcuts(v => !v);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault(); selectAll();
      } else if (e.key === '1') { setCameraPreset('Front (1)'); }
      else if (e.key === '2') { setCameraPreset('Back (2)'); }
      else if (e.key === '3') { setCameraPreset('Left (3)'); }
      else if (e.key === '4') { setCameraPreset('Right (4)'); }
      else if (e.key === '5') { setCameraPreset('Top (5)'); }
      else if (e.key === '6') { setCameraPreset('Bottom (6)'); }
      else if (e.key === '7') { setCameraPreset('Isometric (7)'); }
      else if (e.key === 'Tab') {
        e.preventDefault();
        setMode(prev => {
          const modes: StudioMode[] = ['scene', 'sketch', 'design', 'measure', 'export'];
          const idx = modes.indexOf(prev);
          return modes[(idx + 1) % modes.length];
        });
      } else if (e.key === 'Delete') {
        e.preventDefault(); deleteSelected();
      } else if (e.key === 'X' && e.shiftKey) {
        e.preventDefault();
        if (transformRef.current) {
          transformRef.current.showX = true;
          transformRef.current.showY = false;
          transformRef.current.showZ = false;
        }
      } else if (e.key === 'Y' && e.shiftKey) {
        e.preventDefault();
        if (transformRef.current) {
          transformRef.current.showX = false;
          transformRef.current.showY = true;
          transformRef.current.showZ = false;
        }
      } else if (e.key === 'Z' && e.shiftKey) {
        e.preventDefault();
        if (transformRef.current) {
          transformRef.current.showX = false;
          transformRef.current.showY = false;
          transformRef.current.showZ = true;
        }
      } else if (e.key === 'Escape') {
        if (transformRef.current) {
          transformRef.current.showX = true;
          transformRef.current.showY = true;
          transformRef.current.showZ = true;
        }
        setSelectedIds(new Set());
        setSelectedType(null);
      } else if (e.key === 'W' && e.shiftKey) {
        e.preventDefault();
        setSpaceMode(prev => {
          const next = prev === 'world' ? 'local' : 'world';
          if (transformRef.current) transformRef.current.setSpace(next);
          return next;
        });
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSceneExport();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault(); duplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIds.size > 1) {
          const groupId = `grp_${Date.now()}`;
          const childIds = Array.from(selectedIds);
          setGroups(prev => [...prev, { id: groupId, name: `Group ${prev.length + 1}`, childIds }]);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && e.shiftKey) {
        e.preventDefault();
        setGroups(prev => prev.filter(g => {
          if (selectedIds.has(g.id)) {
            return false;
          }
          return true;
        }));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setMode('export');
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
    pushHistory('Add Object');
    const creators: Record<string, () => Scene3DObject> = {
      cube: createCube, sphere: createSphere, cylinder: createCylinder,
      cone: createCone, torus: createTorus, plane: createPlane,
    };
    const newObj = (creators[type] || createCube)();
    setSceneData((prev) => ({ ...prev, objects: [...prev.objects, newObj] }));
    setSelectedIds(new Set([newObj.id]));
    setSelectedType('object');
    setShowAddMenu(false);
  }, [pushHistory]);

  const addLight = useCallback((type: Scene3DLight['type']) => {
    pushHistory('Add Light');
    const newLight = createLight(type);
    setSceneData((prev) => ({ ...prev, lights: [...prev.lights, newLight] }));
    setSelectedIds(new Set([newLight.id]));
    setSelectedType('light');
    setShowLightMenu(false);
  }, [pushHistory]);

  const addPrefab = useCallback((prefab: PrefabDefinition) => {
    pushHistory('Add Prefab');
    const center: [number, number, number] = controlsRef.current
      ? [Math.round(controlsRef.current.target.x), 0, Math.round(controlsRef.current.target.z)]
      : [0, 0, 0];
    const objects = prefab.create(center);
    setSceneData((prev) => ({ ...prev, objects: [...prev.objects, ...objects] }));
    if (objects.length > 0) {
      setSelectedIds(new Set([objects[0].id]));
      setSelectedType('object');
    }
    setShowPrefabMenu(false);
  }, [pushHistory]);

  const addCADObject = useCallback((type: 'box' | 'cylinder' | 'sphere') => {
    pushCADHistory('Add CAD Object');
    const id = genId();
    let obj: CADObject3D;
    switch (type) {
      case 'box':
        obj = {
          id, name: `Box ${cadState.objects.length + 1}`, type: 'box',
          materialId: cadMaterialId,
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(30, 30, 30),
          geometry: new THREE.BoxGeometry(3, 3, 3),
        };
        break;
      case 'cylinder':
        obj = {
          id, name: `Cylinder ${cadState.objects.length + 1}`, type: 'cylinder',
          materialId: cadMaterialId,
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(15, 30, 24),
          geometry: new THREE.CylinderGeometry(1.5, 1.5, 3, 24),
        };
        break;
      case 'sphere':
        obj = {
          id, name: `Sphere ${cadState.objects.length + 1}`, type: 'sphere',
          materialId: cadMaterialId,
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createSphereParameters(15, 24, 16),
          geometry: new THREE.SphereGeometry(1.5, 24, 16),
        };
        break;
    }
    setCADState(s => ({
      ...s,
      objects: [...s.objects, obj!],
      selectedObjectIds: [id],
    }));
    setSelectedIds(new Set([id]));
    setSelectedType('cad');
  }, [cadState.objects.length, cadMaterialId, pushCADHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    pushHistory('Delete Selected');
    if (selectedType === 'object') {
      setSceneData((prev) => ({
        ...prev,
        objects: prev.objects.filter((o) => !selectedIds.has(o.id)),
      }));
    } else if (selectedType === 'light') {
      setSceneData((prev) => ({
        ...prev,
        lights: prev.lights.filter((l) => !selectedIds.has(l.id)),
      }));
    } else if (selectedType === 'cad') {
      setCADState(s => ({
        ...s,
        objects: s.objects.filter(o => !selectedIds.has(o.id)),
        selectedObjectIds: s.selectedObjectIds.filter(sid => !selectedIds.has(sid)),
      }));
    }
    setSelectedIds(new Set());
    setSelectedType(null);
    if (transformRef.current) transformRef.current.detach();
  }, [selectedIds, selectedType, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    pushHistory('Duplicate');
    const newIds: string[] = [];
    for (const id of selectedIds) {
      const obj = sceneData.objects.find((o) => o.id === id);
      if (obj) {
        const newObj: Scene3DObject = {
          ...JSON.parse(JSON.stringify(obj)),
          id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: `${obj.name} Copy`,
          position: [obj.position[0] + 1, obj.position[1], obj.position[2]],
        };
        newIds.push(newObj.id);
        setSceneData((prev) => ({ ...prev, objects: [...prev.objects, newObj] }));
      }
      const cadObj = cadState.objects.find(o => o.id === id);
      if (cadObj) {
        const newId = genId();
        const dup: CADObject3D = {
          ...cadObj, id: newId, name: `${cadObj.name} (Copy)`,
          position: { x: cadObj.position.x + 2, y: cadObj.position.y, z: cadObj.position.z + 2 },
          geometry: cadObj.geometry?.clone(),
          parameters: cadObj.parameters.map(p => ({ ...p })),
        };
        newIds.push(newId);
        setCADState(s => ({ ...s, objects: [...s.objects, dup] }));
      }
    }
    setSelectedIds(new Set(newIds));
  }, [selectedIds, sceneData.objects, cadState.objects, pushHistory]);

  const selectAll = useCallback(() => {
    const allIds = [
      ...sceneData.objects.map(o => o.id),
      ...cadState.objects.map(o => o.id),
    ];
    setSelectedIds(new Set(allIds));
    setSelectedType('object');
  }, [sceneData.objects, cadState.objects]);

  const setCameraPreset = useCallback((preset: string) => {
    const p = CAMERA_PRESETS[preset];
    if (!p || !cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(p.position[0], p.position[1], p.position[2]);
    controlsRef.current.target.set(p.target[0], p.target[1], p.target[2]);
  }, []);

  const handleLeftResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
    const startX = e.clientX;
    const startWidth = leftPanelWidth;
    const onMove = (ev: MouseEvent) => {
      setLeftPanelWidth(Math.max(180, Math.min(400, startWidth + (ev.clientX - startX))));
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
      setRightPanelWidth(Math.max(220, Math.min(450, startWidth + (startX - ev.clientX))));
    };
    const onUp = () => {
      setIsResizingRight(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [rightPanelWidth]);

  const handleCADOperation = useCallback((type: CADOperationType, params: Record<string, number | string>) => {
    if (cadState.selectedObjectIds.length === 0 && type !== 'extrude') return;
    pushCADHistory('CAD Operation');

    if (type === 'fillet' || type === 'chamfer' || type === 'shell') {
      const targetObj = cadState.objects.find(o => cadState.selectedObjectIds.includes(o.id));
      if (!targetObj || !targetObj.geometry) return;
      let newGeo: THREE.BufferGeometry;
      if (type === 'fillet') newGeo = applyFillet(targetObj.geometry, params.radius as number);
      else if (type === 'chamfer') newGeo = applyChamfer(targetObj.geometry, params.distance as number);
      else newGeo = applyShell(targetObj.geometry, params.wallThickness as number);
      const newType = type === 'fillet' ? 'fillet' as const : type === 'chamfer' ? 'chamfer' as const : 'shell' as const;
      setCADState(s => ({
        ...s,
        objects: s.objects.map(o =>
          o.id === targetObj.id
            ? {
              ...o, type: newType, geometry: newGeo, name: `${targetObj.name} (${type})`,
              parameters: [
                ...o.parameters,
                ...(type === 'fillet'
                  ? [{ name: 'filletRadius', type: 'length' as const, value: params.radius as number, min: 0.5, max: 50, step: 0.5, label: 'Fillet Radius' }]
                  : type === 'chamfer'
                    ? [{ name: 'chamferDistance', type: 'length' as const, value: params.distance as number, min: 0.5, max: 50, step: 0.5, label: 'Chamfer Distance' }]
                    : [{ name: 'wallThickness', type: 'length' as const, value: params.wallThickness as number, min: 0.5, max: 50, step: 0.5, label: 'Wall Thickness' }]
                ),
              ],
            }
            : o
        ),
      }));
      return;
    }

    if (type === 'linear_array' || type === 'circular_array' || type === 'mirror') {
      const targetObj = cadState.objects.find(o => cadState.selectedObjectIds.includes(o.id));
      if (!targetObj || !targetObj.geometry) return;
      let newGeo: THREE.BufferGeometry;
      const count = (params.count as number) || 5;
      const spacing = (params.spacing as number) || 20;
      const radius = (params.radius as number) || 30;
      const axis = (params.axis as 'X' | 'Y' | 'Z') || 'X';
      const plane = (params.plane as CADMirrorPlane) || 'XY';
      if (type === 'linear_array') newGeo = applyLinearArray(targetObj.geometry, axis, count, spacing);
      else if (type === 'circular_array') newGeo = applyCircularArray(targetObj.geometry, axis, count, radius);
      else newGeo = applyMirror(targetObj.geometry, plane);
      const newId = genId();
      const newObj: CADObject3D = {
        ...targetObj, id: newId, name: `${targetObj.name} (${type.replace('_', ' ')})`,
        type: 'pattern', geometry: newGeo,
        position: { ...targetObj.position }, parameters: [],
      };
      setCADState(s => ({
        ...s, objects: [...s.objects, newObj], selectedObjectIds: [newId],
      }));
      return;
    }

    if (type === 'union' || type === 'subtract' || type === 'intersect') {
      if (cadState.selectedObjectIds.length < 2) return;
      const objs = cadState.selectedObjectIds
        .map(id => cadState.objects.find(o => o.id === id))
        .filter((o): o is CADObject3D => !!o && !!o.geometry);
      if (objs.length < 2) return;
      const newId = genId();
      const geo1 = objs[0].geometry!.clone();
      const geo2 = objs[1].geometry!.clone();
      geo2.translate(
        objs[1].position.x - objs[0].position.x,
        objs[1].position.y - objs[0].position.y,
        objs[1].position.z - objs[0].position.z,
      );
      let resultGeo: THREE.BufferGeometry;
      if (type === 'union') {
        resultGeo = mergeSimple(geo1, geo2);
      } else if (type === 'subtract') {
        geo2.scale(-1, -1, -1);
        geo2.computeVertexNormals();
        resultGeo = mergeSimple(geo1, geo2);
      } else {
        resultGeo = geo1;
      }
      const newObj: CADObject3D = {
        id: newId, name: `${objs[0].name} ${type} ${objs[1].name}`, type: 'boolean',
        materialId: objs[0].materialId,
        position: { ...objs[0].position }, rotation: { ...objs[0].rotation },
        scale: { ...objs[0].scale }, visible: true, locked: false,
        children: [], parameters: [], geometry: resultGeo,
      };
      setCADState(s => ({
        ...s,
        objects: [...s.objects.filter(o => !cadState.selectedObjectIds.includes(o.id)), newObj],
        selectedObjectIds: [newId],
      }));
      return;
    }
  }, [cadState.selectedObjectIds, cadState.objects, pushCADHistory]);

  const handleExport = useCallback(async (options: CADExportOptions) => {
    const visibleObjects = cadState.objects.filter(o => o.visible && o.geometry);
    if (visibleObjects.length === 0) return;
    setExportProgress('Preparing export...');
    try {
      await exportCADModel(visibleObjects, options);
      setExportProgress('Export complete!');
    } catch (err) {
      setExportProgress('Export failed');
    }
  }, [cadState.objects]);

  const handleSceneExport = useCallback(() => {
    const json = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'scene.json'; a.click();
    URL.revokeObjectURL(url);
  }, [sceneData]);

  const computeMeasurement = useCallback(() => {
    if (measureMode === 'distance' && measurePoints.length === 2) {
      const dx = measurePoints[1].x - measurePoints[0].x;
      const dy = measurePoints[1].y - measurePoints[0].y;
      return `${(Math.sqrt(dx * dx + dy * dy) / 10).toFixed(2)} mm`;
    }
    if (measureMode === 'angle' && measurePoints.length === 3) {
      const v1x = measurePoints[0].x - measurePoints[1].x;
      const v1y = measurePoints[0].y - measurePoints[1].y;
      const v2x = measurePoints[2].x - measurePoints[1].x;
      const v2y = measurePoints[2].y - measurePoints[1].y;
      const dot = v1x * v2x + v1y * v2y;
      const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
      const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
      if (mag1 === 0 || mag2 === 0) return null;
      return `${(Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180 / Math.PI).toFixed(1)}°`;
    }
    if (measureMode === 'volume' && selectedCADObj?.geometry) {
      const vol = calculateObjectVolume(selectedCADObj.geometry);
      return `${vol.toFixed(1)} mm³ (${(vol / 1000).toFixed(2)} cm³)`;
    }
    return null;
  }, [measureMode, measurePoints, selectedCADObj]);

  const renderObjectTree = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
      {sceneData.objects.length === 0 && sceneData.lights.length === 0 && cadState.objects.length === 0 && (
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
              selectedIds.has(group.id) ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'
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
        </div>
      ))}

      {sceneData.objects.length > 0 && (
        <>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 mb-1 px-2 tracking-wider">Scene Objects</div>
          {sceneData.objects.map((obj) => (
            <div
              key={obj.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedIds.has(obj.id) && selectedType === 'object' ? 'bg-violet-100 text-violet-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  setSelectedIds(prev => { const next = new Set(prev); if (next.has(obj.id)) next.delete(obj.id); else next.add(obj.id); return next; });
                  setSelectedType('object');
                } else { setSelectedIds(new Set([obj.id])); setSelectedType('object'); }
              }}
            >
              <span className="text-slate-400 shrink-0">{GEOMETRY_ICONS[obj.type]}</span>
              <span className="flex-1 truncate">{obj.name}</span>
              <button onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { visible: !obj.visible }); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded">
                {obj.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-300" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { locked: !obj.locked }); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded">
                {obj.locked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} />}
              </button>
              <button onClick={(e) => {
                e.stopPropagation(); pushHistory('Delete Object');
                setSceneData(prev => ({ ...prev, objects: prev.objects.filter(o => o.id !== obj.id) }));
                if (selectedIds.has(obj.id)) setSelectedIds(prev => { const next = new Set(prev); next.delete(obj.id); return next; });
              }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </>
      )}

      {cadState.objects.length > 0 && (
        <>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-3 mb-1 px-2 tracking-wider">CAD Objects</div>
          {cadState.objects.map((obj) => (
            <div
              key={obj.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedIds.has(obj.id) && selectedType === 'cad' ? 'bg-cyan-100 text-cyan-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  setSelectedIds(prev => { const next = new Set(prev); if (next.has(obj.id)) next.delete(obj.id); else next.add(obj.id); return next; });
                  setSelectedType('cad');
                } else { setSelectedIds(new Set([obj.id])); setSelectedType('cad'); setCADState(s => ({ ...s, selectedObjectIds: [obj.id] })); }
              }}
            >
              <span className="text-sm">{CAD_TYPE_ICONS[obj.type] || '◆'}</span>
              <span className="flex-1 truncate">{obj.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setCADState(s => ({ ...s, objects: s.objects.map(o => o.id === obj.id ? { ...o, visible: !o.visible } : o) })); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded">
                {obj.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-300" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCADState(s => ({ ...s, objects: s.objects.map(o => o.id === obj.id ? { ...o, locked: !o.locked } : o) })); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded">
                {obj.locked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} />}
              </button>
              <button onClick={(e) => {
                e.stopPropagation(); pushCADHistory('Delete CAD Object');
                setCADState(s => ({ ...s, objects: s.objects.filter(o => o.id !== obj.id), selectedObjectIds: s.selectedObjectIds.filter(sid => sid !== obj.id) }));
                if (selectedIds.has(obj.id)) setSelectedIds(prev => { const next = new Set(prev); next.delete(obj.id); return next; });
              }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </>
      )}

      {sceneData.lights.length > 0 && (
        <>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-3 mb-1 px-2 tracking-wider">Lights</div>
          {sceneData.lights.map((light) => (
            <div
              key={light.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedIds.has(light.id) && selectedType === 'light' ? 'bg-amber-100 text-amber-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={() => { setSelectedIds(new Set([light.id])); setSelectedType('light'); }}
            >
              <span className="text-amber-400 shrink-0">{LIGHT_ICONS[light.type]}</span>
              <span className="flex-1 truncate">{light.name}</span>
              <button onClick={(e) => { e.stopPropagation(); updateLight(light.id, { visible: !light.visible }); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded">
                {light.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-300" />}
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                setSceneData(prev => ({ ...prev, lights: prev.lights.filter(l => l.id !== light.id) }));
                if (selectedIds.has(light.id)) setSelectedIds(new Set());
              }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderTransformSection = () => {
    if (selectedObj) {
      const fields = [
        { label: 'Position', key: 'position', values: selectedObj.position, color: 'text-rose-500' },
        { label: 'Rotation', key: 'rotation', values: selectedObj.rotation, color: 'text-blue-500' },
        { label: 'Scale', key: 'scale', values: selectedObj.scale, color: 'text-emerald-500' },
      ];
      return (
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transform</div>
          {fields.map((field) => (
            <div key={field.key}>
              <div className={`text-[10px] font-bold ${field.color} mb-1`}>{field.label}</div>
              <div className="flex gap-1">
                {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                  <div key={axis} className="flex-1">
                    <div className="text-[9px] text-slate-400 font-mono">{axis}</div>
                    <input type="number" step={0.1} value={Number(field.values[i].toFixed(2))}
                      onChange={(e) => {
                        pushHistory('Transform');
                        const newValues = [...field.values] as [number, number, number];
                        newValues[i] = parseFloat(e.target.value) || 0;
                        updateObject(selectedObj.id, { [field.key]: newValues });
                      }}
                      className="w-full px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (selectedCADObj) {
      return (
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transform</div>
          {(['x', 'y', 'z'] as const).map(axis => (
            <div key={axis} className="flex items-center gap-2">
              <span className="w-4 font-bold text-slate-400 text-center text-[10px]">{axis.toUpperCase()}</span>
              <input type="number" step={0.1} value={selectedCADObj.position[axis]}
                onChange={e => {
                  pushCADHistory('CAD Transform');
                  setCADState(s => ({
                    ...s, objects: s.objects.map(o => o.id === selectedCADObj.id
                      ? { ...o, position: { ...o.position, [axis]: parseFloat(e.target.value) || 0 } } : o),
                  }));
                }}
                className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-mono outline-none focus:border-cyan-400 bg-slate-50"
              />
            </div>
          ))}
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-2">Rotation</div>
          {(['x', 'y', 'z'] as const).map(axis => (
            <div key={axis} className="flex items-center gap-2">
              <span className="w-4 font-bold text-slate-400 text-center text-[10px]">{axis.toUpperCase()}</span>
              <input type="number" step={5} value={Math.round(selectedCADObj.rotation[axis] * (180 / Math.PI))}
                onChange={e => {
                  pushCADHistory('CAD Transform');
                  setCADState(s => ({
                    ...s, objects: s.objects.map(o => o.id === selectedCADObj.id
                      ? { ...o, rotation: { ...o.rotation, [axis]: (parseFloat(e.target.value) || 0) * (Math.PI / 180) } } : o),
                  }));
                }}
                className="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-mono outline-none focus:border-cyan-400 bg-slate-50"
              />
              <span className="text-[9px] text-slate-400">deg</span>
            </div>
          ))}
          {selectedCADObj.parameters.length > 0 && (
            <>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-2">Parameters</div>
              {selectedCADObj.parameters.map(param => (
                <div key={param.name}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500">{param.label}</span>
                    <span className="font-mono text-[10px]">{param.value.toFixed(param.step < 1 ? 1 : 0)}{param.type === 'angle' ? '°' : 'mm'}</span>
                  </div>
                  <input type="range" min={param.min} max={param.max} step={param.step} value={param.value}
                    onChange={e => {
                      pushCADHistory('CAD Parameter');
                      setCADState(s => ({
                        ...s, objects: s.objects.map(o => {
                          if (o.id !== selectedCADObj.id) return o;
                          return setParameterValue(o, param.name, parseFloat(e.target.value));
                        }),
                      }));
                    }}
                    className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-cyan-500 cursor-pointer"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const renderMaterialSection = () => {
    if (selectedObj) {
      const mat = selectedObj.material;
      return (
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
            <span>Material</span>
            <button onClick={() => setShowPresets(!showPresets)}
              className="text-violet-500 normal-case tracking-normal text-[10px] font-semibold hover:text-violet-700">Presets</button>
          </div>
          {showPresets && (
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(MATERIAL_PRESETS).map(([name, preset]) => (
                <button key={name} onClick={() => updateObjectMaterial(selectedObj.id, preset)}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors">
                  <div className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: preset.color }} />
                  <span className="text-[9px] text-slate-600">{name}</span>
                </button>
              ))}
            </div>
          )}
          <div>
            <div className="text-[10px] text-slate-500 mb-1">Color</div>
            <div className="flex items-center gap-2">
              <input type="color" value={mat.color} onChange={(e) => updateObjectMaterial(selectedObj.id, { color: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
              <input type="text" value={mat.color} onChange={(e) => updateObjectMaterial(selectedObj.id, { color: e.target.value })}
                className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400" />
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
                <span className="text-[10px] text-slate-400 font-mono">{(mat[slider.key as keyof typeof mat] as number).toFixed(2)}</span>
              </div>
              <input type="range" min={slider.min} max={slider.max} step={slider.step}
                value={mat[slider.key as keyof typeof mat] as number}
                onChange={(e) => updateObjectMaterial(selectedObj.id, { [slider.key]: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500" />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
              <input type="checkbox" checked={mat.wireframe}
                onChange={(e) => updateObjectMaterial(selectedObj.id, { wireframe: e.target.checked })}
                className="rounded border-slate-300 accent-violet-500" /> Wireframe
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
              <input type="checkbox" checked={mat.doubleSided || false}
                onChange={(e) => updateObjectMaterial(selectedObj.id, { doubleSided: e.target.checked })}
                className="rounded border-slate-300 accent-violet-500" /> Double Sided
            </label>
          </div>
        </div>
      );
    }
    if (selectedCADObj) {
      return (
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Material</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(CAD_MATERIALS) as CADMaterialType[]).map(type => {
              const mat = CAD_MATERIALS[type];
              return (
                <button key={type}
                  onClick={() => {
                    setCadMaterialId(type);
                    setCADState(s => ({
                      ...s, objects: s.objects.map(o => s.selectedObjectIds.includes(o.id) ? { ...o, materialId: type } : o),
                    }));
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-left ${
                    selectedCADObj.materialId === type ? 'border-cyan-400 bg-cyan-50 ring-1 ring-cyan-300' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                  <div className="w-4 h-4 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: mat.color }} />
                  <span className="font-medium text-[11px]">{mat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLightProperties = () => {
    if (!selectedLight) return null;
    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Light Properties</div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Type</div>
          <div className="text-[11px] bg-slate-100 px-2 py-1 rounded font-semibold text-slate-700 capitalize">{selectedLight.type}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Color</div>
          <div className="flex items-center gap-2">
            <input type="color" value={selectedLight.color} onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
            <input type="text" value={selectedLight.color} onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })}
              className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400" />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500">Intensity</span>
            <span className="text-[10px] text-slate-400 font-mono">{selectedLight.intensity.toFixed(1)}</span>
          </div>
          <input type="range" min={0} max={5} step={0.1} value={selectedLight.intensity}
            onChange={(e) => updateLight(selectedLight.id, { intensity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
        </div>
        {selectedLight.type !== 'ambient' && (
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Position</div>
            <div className="flex gap-1">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <div key={axis} className="flex-1">
                  <div className="text-[9px] text-slate-400 font-mono">{axis}</div>
                  <input type="number" step={0.5} value={selectedLight.position[i]}
                    onChange={(e) => {
                      const newPos = [...selectedLight.position] as [number, number, number];
                      newPos[i] = parseFloat(e.target.value) || 0;
                      updateLight(selectedLight.id, { position: newPos });
                    }}
                    className="w-full px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400" />
                </div>
              ))}
            </div>
          </div>
        )}
        <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
          <input type="checkbox" checked={selectedLight.castShadow}
            onChange={(e) => updateLight(selectedLight.id, { castShadow: e.target.checked })}
            className="rounded border-slate-300 accent-violet-500" /> Cast Shadow
        </label>
      </div>
    );
  };

  const renderProperties = () => (
    <div className="p-3 space-y-4">
      {selectedObj && (
        <>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Name</div>
            <input type="text" value={selectedObj.name} onChange={(e) => updateObject(selectedObj.id, { name: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 font-semibold" />
          </div>
          {renderTransformSection()}
          {renderMaterialSection()}
        </>
      )}
      {selectedCADObj && (
        <>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Name</div>
            <input type="text" value={selectedCADObj.name}
              onChange={e => setCADState(s => ({
                ...s, objects: s.objects.map(o => o.id === selectedCADObj.id ? { ...o, name: e.target.value } : o),
              }))}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-400 font-semibold" />
          </div>
          {renderTransformSection()}
          {renderMaterialSection()}
        </>
      )}
      {selectedLight && (
        <>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Name</div>
            <input type="text" value={selectedLight.name} onChange={(e) => updateLight(selectedLight.id, { name: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 font-semibold" />
          </div>
          {renderLightProperties()}
        </>
      )}
      {!selectedObj && !selectedLight && !selectedCADObj && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-slate-400">
            <MousePointer2 size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">Select an object</p>
            <p className="text-[10px] mt-1 opacity-70">Click an object in the scene or tree</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderSketchOverlay = () => {
    if (mode !== 'sketch') return null;
    return (
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute top-2 left-2 z-30 pointer-events-auto">
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-0.5">
            {(['select', 'line', 'rectangle', 'circle', 'polygon'] as CADSketchTool[]).map(tool => (
              <button key={tool} onClick={() => setSketchTool(tool)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                  sketchTool === tool ? 'bg-cyan-500 text-white' : 'hover:bg-slate-100 text-slate-600'
                }`}>
                {tool === 'select' ? '↖' : tool === 'line' ? '/' : tool === 'rectangle' ? '▭' : tool === 'circle' ? '○' : '⬠'}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-2 right-2 z-30 pointer-events-auto bg-white rounded-lg shadow-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500">
          Sketch Mode — {sketchTool !== 'none' ? sketchTool : 'select'}
        </div>
      </div>
    );
  };

  const renderMeasureOverlay = () => {
    if (mode !== 'measure') return null;
    const result = computeMeasurement();
    return (
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">Measurement</h4>
          <button onClick={() => { setMeasureMode('none'); setMeasurePoints([]); }} className="text-[10px] text-slate-400 hover:text-red-500">Clear</button>
        </div>
        <div className="space-y-1 mb-2">
          {(['distance', 'angle', 'radius', 'volume'] as const).map(m => (
            <button key={m} onClick={() => { setMeasureMode(measureMode === m ? 'none' : m); setMeasurePoints([]); }}
              className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-colors ${
                measureMode === m ? 'bg-cyan-100 text-cyan-700 border border-cyan-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}>
              {m === 'distance' ? '📏' : m === 'angle' ? '📐' : m === 'radius' ? '⭕' : '🧊'} {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        {result && <div className="text-lg font-bold text-cyan-600 font-mono">{result}</div>}
      </div>
    );
  };

  const renderTimeline = () => {
    const totalDuration = getAnimationDuration(sceneData.animations) || animDuration;
    const progress = totalDuration > 0 ? (animTime / totalDuration) * 100 : 0;
    return (
      <div className="bg-white border-t border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5">
          <button onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1 rounded transition-colors ${isPlaying ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'}`}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => { setIsPlaying(false); setAnimTime(0); }}
            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <StopIcon size={14} />
          </button>
          <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
            <input type="checkbox" checked={animLoop} onChange={(e) => setAnimLoop(e.target.checked)}
              className="rounded border-slate-300 accent-violet-500" />
            <Repeat size={10} /> Loop
          </label>
          <div className="flex-1" />
          <span className="text-[10px] text-slate-400 font-mono">{animTime.toFixed(1)}s / {totalDuration.toFixed(1)}s</span>
        </div>
        <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }} />
          {sceneData.animations.map((anim, i) =>
            anim.keyframes.map((kf, j) => (
              <div key={`${i}-${j}`} className="absolute top-0 w-1.5 h-full bg-amber-400 rounded cursor-pointer"
                style={{ left: `${(kf.time / totalDuration) * 100}%` }}
                title={`${kf.time.toFixed(2)}s = ${kf.value.toFixed(2)}`} />
            ))
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <select value={selectedEasing} onChange={(e) => setSelectedEasing(e.target.value)}
            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none">
            {EASING_NAMES.map((name) => (<option key={name} value={name}>{name}</option>))}
          </select>
          <button onClick={() => setIsAddingKeyframe(true)}
            className="text-[10px] bg-violet-100 text-violet-600 hover:bg-violet-200 px-2 py-0.5 rounded font-semibold transition-colors">
            + Keyframe
          </button>
          <div className="flex-1" />
          <button onClick={() => { setAnimDuration(5); setAnimTime(0); }}
            className="text-[10px] text-slate-400 hover:text-slate-600">Duration: {animDuration}s</button>
        </div>
      </div>
    );
  };

  const renderBottomPanel = () => {
    switch (mode) {
      case 'scene': return renderTimeline();
      case 'sketch': return (
        <div className="bg-white border-t border-slate-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <PenTool size={14} className="text-cyan-500" />
            <span className="text-[11px] font-bold text-slate-600">Sketch Tools</span>
            <div className="flex-1" />
            <span className="text-[10px] text-slate-400">Draw 2D profiles on the viewport</span>
          </div>
        </div>
      );
      case 'design': return (
        <div className="bg-white border-t border-slate-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-cyan-500" />
            <span className="text-[11px] font-bold text-slate-600">Design Operations</span>
            <div className="flex-1" />
            <span className="text-[10px] text-slate-400">Use the right panel for CAD operations</span>
          </div>
        </div>
      );
      case 'measure': return (
        <div className="bg-white border-t border-slate-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <Ruler size={14} className="text-cyan-500" />
            <span className="text-[11px] font-bold text-slate-600">Measurement</span>
            <div className="flex-1" />
            {measurePoints.length > 0 && (
              <span className="text-[10px] text-slate-400">{measurePoints.length} points placed</span>
            )}
          </div>
        </div>
      );
      case 'export': return (
        <div className="bg-white border-t border-slate-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <FileDown size={14} className="text-cyan-500" />
            <span className="text-[11px] font-bold text-slate-600">Export Center</span>
            <div className="flex-1" />
            {exportProgress && <span className="text-[10px] text-cyan-500">{exportProgress}</span>}
          </div>
        </div>
      );
      default: return null;
    }
  };

  const renderExportPanel = () => {
    if (mode !== 'export') return null;
    return (
      <div className="p-3 space-y-4">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scene Export</div>
        <button onClick={handleSceneExport}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all">
          <Download size={14} /> Save Scene (JSON)
        </button>

        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">3D Model Export</div>
        <div className="space-y-1.5">
          {[
            { format: 'stl' as const, label: 'STL (ASCII)' },
            { format: 'stl_binary' as const, label: 'STL (Binary)' },
            { format: 'obj' as const, label: 'OBJ' },
            { format: 'gltf' as const, label: 'GLTF' },
            { format: 'glb' as const, label: 'GLB' },
            { format: '3mf' as const, label: '3MF' },
          ].map(opt => (
            <button key={opt.format} onClick={() => handleExport({ format: opt.format, unit: exportUnit, includeColors: false })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 text-xs font-medium transition-colors">
              <Download size={12} /> {opt.label}
            </button>
          ))}
        </div>

        <div>
          <div className="text-[10px] text-slate-500 mb-1">Unit</div>
          <div className="flex gap-1">
            {(['mm', 'cm', 'inch'] as const).map(u => (
              <button key={u} onClick={() => setExportUnit(u)}
                className={`flex-1 px-2 py-1 text-[10px] rounded font-semibold transition-colors ${
                  exportUnit === u ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>{u}</button>
            ))}
          </div>
        </div>

        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-4">Image Export</div>
        <button onClick={() => {
          if (!rendererRef.current) return;
          const url = rendererRef.current.domElement.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url; a.download = 'screenshot.png'; a.click();
        }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 text-xs font-medium transition-colors">
          📷 Screenshot (PNG)
        </button>

        {cadState.objects.length > 0 && (
          <>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-4">Print Info</div>
            <BOMPanel objects={cadState.objects} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100">
      <div className="h-11 bg-white border-b border-slate-200 flex items-center px-3 gap-1.5 shrink-0 shadow-sm">
        <button onClick={onClose}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors">
          <ArrowLeft size={14} /> Home
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <span className="text-sm font-bold text-slate-700">3D Design Studio</span>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {([
          { id: 'scene' as StudioMode, label: 'Scene', icon: <Box size={14} /> },
          { id: 'sketch' as StudioMode, label: 'Sketch', icon: <PenTool size={14} /> },
          { id: 'design' as StudioMode, label: 'Design', icon: <Wrench size={14} /> },
          { id: 'measure' as StudioMode, label: 'Measure', icon: <Ruler size={14} /> },
          { id: 'export' as StudioMode, label: 'Export', icon: <FileDown size={14} /> },
        ]).map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              mode === m.id ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'
            }`}>
            {m.icon} {m.label}
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {mode === 'scene' && (
          <>
            <div className="flex items-center gap-1 relative">
              <button onClick={() => { setShowAddMenu(!showAddMenu); setShowLightMenu(false); setShowPrefabMenu(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
                <Plus size={14} /> Add <ChevronDown size={12} />
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
                    <button key={item.type} onClick={() => addObject(item.type)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowPrefabMenu(!showPrefabMenu); setShowAddMenu(false); setShowLightMenu(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                <Sparkles size={14} /> Prefabs <ChevronDown size={12} />
              </button>
              {showPrefabMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[200px] max-h-[400px] overflow-y-auto">
                  {PREFABS.map((prefab) => (
                    <button key={prefab.name} onClick={() => addPrefab(prefab)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                      <span className="text-base">{prefab.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{prefab.name}</div>
                        <div className="text-[9px] text-slate-400">{prefab.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowLightMenu(!showLightMenu); setShowAddMenu(false); setShowPrefabMenu(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                <Lightbulb size={14} /> Light <ChevronDown size={12} />
              </button>
              {showLightMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[160px]">
                  {(['ambient', 'directional', 'point', 'spot'] as const).map((type) => (
                    <button key={type} onClick={() => addLight(type)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors capitalize">
                      {LIGHT_ICONS[type]} {type} Light
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-5 bg-slate-200" />
          </>
        )}

        {(mode === 'design' || mode === 'scene') && (
          <>
            <button onClick={() => { addCADObject('box'); }} title="Add Box"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors text-xs font-medium">
              <Box size={14} /> Box
            </button>
            <button onClick={() => { addCADObject('cylinder'); }} title="Add Cylinder"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors text-xs font-medium">
              <Cylinder size={14} /> Cylinder
            </button>
            <button onClick={() => { addCADObject('sphere'); }} title="Add Sphere"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors text-xs font-medium">
              <Circle size={14} /> Sphere
            </button>
            <div className="w-px h-5 bg-slate-200" />
          </>
        )}

        <button onClick={deleteSelected} disabled={selectedIds.size === 0}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-30 transition-colors" title="Delete (X)">
          <Trash2 size={14} />
        </button>
        <button onClick={undo} disabled={historyIndex <= 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors" title="Redo (Ctrl+Y)">
          <Redo2 size={14} />
        </button>

        <div className="flex items-center gap-0.5">
          {([
            { m: 'translate' as TransformMode, icon: <Move size={12} />, label: 'G' },
            { m: 'rotate' as TransformMode, icon: <RotateCcw size={12} />, label: 'R' },
            { m: 'scale' as TransformMode, icon: <Target size={12} />, label: 'S' },
          ]).map((item) => (
            <button key={item.m} onClick={() => { setTransformMode(item.m); if (transformRef.current) transformRef.current.setMode(item.m); }}
              className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
                transformMode === item.m ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:bg-slate-100'
              }`} title={`${item.m} (${item.label})`}>
              {item.icon}
            </button>
          ))}
        </div>

        <button onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-1.5 rounded-lg transition-colors ${snapToGrid ? 'bg-violet-100 text-violet-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Snap to Grid">
          <Grid3x3 size={14} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {Object.keys(CAMERA_PRESETS).map((preset) => (
            <button key={preset} onClick={() => setCameraPreset(preset)}
              className="px-1.5 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors" title={preset}>
              {preset.split(' ')[0]}
            </button>
          ))}
        </div>

        <button onClick={() => setShowEnvironment(!showEnvironment)}
          className={`p-1.5 rounded-lg transition-colors ${showEnvironment ? 'bg-sky-100 text-sky-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Environment">
          <Mountain size={14} />
        </button>

        <button onClick={() => setShowShortcuts(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Shortcuts (?)">
          <HelpCircle size={14} />
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="bg-white border-r border-slate-200 flex flex-col shrink-0" style={{ width: leftPanelWidth }}>
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Objects</div>
            <span className="text-[9px] text-slate-400 font-mono">
              {sceneData.objects.length + cadState.objects.length}
            </span>
          </div>
          {renderObjectTree()}
        </div>

        <div className="w-1 hover:w-1.5 bg-slate-200 hover:bg-violet-400 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleLeftResize} />

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
            {sceneData.objects.length + cadState.objects.length} objects | {sceneData.lights.length} lights
            {isMultiSelect && <span className="text-violet-500 ml-1">| {selectedIds.size} selected</span>}
          </div>

          {renderSketchOverlay()}
          {renderMeasureOverlay()}
        </div>

        <div className="w-1 hover:w-1.5 bg-slate-200 hover:bg-violet-400 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleRightResize} />

        <div className="bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden" style={{ width: rightPanelWidth }}>
          {mode === 'export' ? (
            renderExportPanel()
          ) : mode === 'design' ? (
            <>
              <div className="flex border-b border-slate-200">
                {(['properties', 'operations', 'bom', 'print'] as const).map(tab => (
                  <button key={tab} onClick={() => setRightTab(tab)}
                    className={`flex-1 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      rightTab === tab ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    {tab === 'bom' ? 'BOM' : tab === 'print' ? 'Print' : tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {rightTab === 'properties' && renderProperties()}
                {rightTab === 'operations' && (
                  <OperationsPanel state={cadState} onOperation={handleCADOperation}
                    onStateChange={(updates) => setCADState(prev => ({ ...prev, ...updates }))}
                    hasSelection={cadState.selectedObjectIds.length > 0} />
                )}
                {rightTab === 'bom' && <BOMPanel objects={cadState.objects} />}
                {rightTab === 'print' && <PrintPreview objects={cadState.objects} />}
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Properties</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {renderProperties()}
              </div>
            </>
          )}
        </div>
      </div>

      {renderBottomPanel()}

      {(showAddMenu || showLightMenu || showPrefabMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowAddMenu(false); setShowLightMenu(false); setShowPrefabMenu(false); }} />
      )}

      {showEnvironment && (
        <div className="absolute top-14 right-3 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-600">Environment</span>
            <button onClick={() => setShowEnvironment(false)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Background</div>
              <div className="flex items-center gap-2">
                <input type="color" value={sceneData.backgroundColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setSceneData(prev => ({ ...prev, backgroundColor: color }));
                    if (sceneRef.current) { sceneRef.current.background = new THREE.Color(color); }
                  }}
                  className="w-7 h-7 rounded cursor-pointer border border-slate-200" />
                <input type="text" value={sceneData.backgroundColor}
                  onChange={(e) => {
                    setSceneData(prev => ({ ...prev, backgroundColor: e.target.value }));
                    if (sceneRef.current) { sceneRef.current.background = new THREE.Color(e.target.value); }
                  }}
                  className="flex-1 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded font-mono focus:outline-none focus:border-violet-400" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Fog</div>
              <div className="flex gap-1">
                {(['none', 'linear', 'exponential'] as const).map((type) => (
                  <button key={type} onClick={() => setFogType(type)}
                    className={`px-2 py-1 text-[9px] rounded font-semibold capitalize transition-colors ${
                      fogType === type ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>{type}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">Lighting Preset</div>
              <div className="flex gap-1">
                {(['studio', 'outdoor', 'indoor', 'night'] as const).map((preset) => (
                  <button key={preset} onClick={() => {
                    const presets: Record<string, string> = {
                      studio: '#f0f0f0', outdoor: '#87ceeb', indoor: '#fff8e7', night: '#1a1a2e',
                    };
                    const bg = presets[preset];
                    setSceneData(prev => ({ ...prev, backgroundColor: bg }));
                    if (sceneRef.current) sceneRef.current.background = new THREE.Color(bg);
                  }}
                    className={`px-2 py-1 text-[9px] rounded font-semibold capitalize transition-colors bg-slate-100 text-slate-500 hover:bg-slate-200`}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {renamingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-72 space-y-4 border border-slate-200">
            <div className="text-sm font-bold text-slate-800">Rename Object</div>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') { updateObject(renamingId, { name: renameValue }); setRenamingId(null); }
                else if (e.key === 'Escape') setRenamingId(null);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRenamingId(null)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={() => { updateObject(renamingId, { name: renameValue }); setRenamingId(null); }}
                className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700">Rename</button>
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
                <select value={keyframeObjectId} onChange={(e) => setKeyframeObjectId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400">
                  <option value="">Select object...</option>
                  {sceneData.objects.map((obj) => (<option key={obj.id} value={obj.id}>{obj.name}</option>))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Property</div>
                  <select value={keyframeProperty} onChange={(e) => setKeyframeProperty(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="position">Position</option>
                    <option value="rotation">Rotation</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Axis</div>
                  <select value={keyframeChannel} onChange={(e) => setKeyframeChannel(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg">
                    <option value="x">X</option><option value="y">Y</option><option value="z">Z</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Time (s)</div>
                  <input type="number" step={0.1} min={0} value={keyframeTime}
                    onChange={(e) => setKeyframeTime(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-slate-500 mb-1">Value</div>
                  <input type="number" step={0.1} value={keyframeValue}
                    onChange={(e) => setKeyframeValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsAddingKeyframe(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={() => {
                if (!keyframeObjectId) return;
                const existing = sceneData.animations.find(
                  (a) => a.objectId === keyframeObjectId && a.property === keyframeProperty && a.channel === keyframeChannel
                );
                if (existing) {
                  const updated = addKeyframe(existing, keyframeTime, keyframeValue, selectedEasing);
                  setSceneData(prev => ({
                    ...prev,
                    animations: prev.animations.map((a) => (a.id === updated.id ? updated : a)),
                  }));
                } else {
                  const newAnim: Animation3D = {
                    id: `anim_${Date.now()}`, objectId: keyframeObjectId,
                    property: keyframeProperty, channel: keyframeChannel,
                    keyframes: [{ time: keyframeTime, value: keyframeValue, easing: selectedEasing }],
                  };
                  setSceneData(prev => ({ ...prev, animations: [...prev.animations, newAnim] }));
                }
                setIsAddingKeyframe(false);
              }} className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700">Add</button>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-slate-800">Keyboard Shortcuts</div>
              <button onClick={() => setShowShortcuts(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'G', desc: 'Move mode' }, { key: 'R', desc: 'Rotate mode' }, { key: 'S', desc: 'Scale mode' },
                { key: 'X / Delete', desc: 'Delete selected' }, { key: 'D', desc: 'Duplicate selected' },
                { key: 'Ctrl+Z', desc: 'Undo' }, { key: 'Ctrl+Y', desc: 'Redo' },
                { key: 'Ctrl+A', desc: 'Select all' }, { key: 'Tab', desc: 'Switch modes' },
                { key: '1-7', desc: 'Camera presets' }, { key: '?', desc: 'Show shortcuts' },
                { key: 'Shift+X/Y/Z', desc: 'Constrain axis' }, { key: 'Shift+W', desc: 'Toggle world/local' },
                { key: 'Escape', desc: 'Reset selection' }, { key: 'Space', desc: 'Play/pause' },
                { key: 'Ctrl+S', desc: 'Save scene' }, { key: 'Ctrl+D', desc: 'Duplicate' },
                { key: 'Ctrl+G', desc: 'Group' }, { key: 'Ctrl+Shift+G', desc: 'Ungroup' },
                { key: 'Ctrl+E', desc: 'Export mode' }, { key: 'Delete', desc: 'Delete selected' },
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

function mergeSimple(geo1: THREE.BufferGeometry, geo2: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos1 = geo1.attributes.position;
  const pos2 = geo2.attributes.position;
  const idx1 = geo1.index;
  const idx2 = geo2.index;
  const totalVerts = pos1.count + pos2.count;
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices: number[] = [];
  for (let i = 0; i < pos1.count; i++) {
    positions[i * 3] = pos1.getX(i); positions[i * 3 + 1] = pos1.getY(i); positions[i * 3 + 2] = pos1.getZ(i);
  }
  if (geo1.attributes.normal) {
    const n1 = geo1.attributes.normal;
    for (let i = 0; i < n1.count; i++) { normals[i * 3] = n1.getX(i); normals[i * 3 + 1] = n1.getY(i); normals[i * 3 + 2] = n1.getZ(i); }
  }
  const offset = pos1.count;
  for (let i = 0; i < pos2.count; i++) {
    positions[(offset + i) * 3] = pos2.getX(i); positions[(offset + i) * 3 + 1] = pos2.getY(i); positions[(offset + i) * 3 + 2] = pos2.getZ(i);
  }
  if (geo2.attributes.normal) {
    const n2 = geo2.attributes.normal;
    for (let i = 0; i < n2.count; i++) { normals[(offset + i) * 3] = n2.getX(i); normals[(offset + i) * 3 + 1] = n2.getY(i); normals[(offset + i) * 3 + 2] = n2.getZ(i); }
  }
  if (idx1) { for (let i = 0; i < idx1.count; i++) indices.push(idx1.getX(i)); }
  else { for (let i = 0; i < pos1.count; i++) indices.push(i); }
  if (idx2) { for (let i = 0; i < idx2.count; i++) indices.push(idx2.getX(i) + offset); }
  else { for (let i = 0; i < pos2.count; i++) indices.push(i + offset); }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}
