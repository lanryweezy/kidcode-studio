import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronDown, ChevronRight,
  Plus, Grid3x3, Move, RotateCcw, Box, Circle, Cylinder, Cone,
  Triangle, Square, Sun, Lightbulb, Zap, Play, Pause, Square as StopIcon,
  Repeat, Download, Upload, Save, Globe, Target, Layers, X,
  MousePointer2, Type as TypeIcon
} from 'lucide-react';
import {
  Scene3DObject, Scene3DLight, Animation3D, Scene3DData,
  createCube, createSphere, createCylinder, createCone, createTorus, createPlane,
  createLight, createDefaultScene, MATERIAL_PRESETS
} from '../services/scene3DPrimitives';
import { createThreeLight, updateThreeLight, createLightHelper } from '../services/scene3DLighting';
import { EASING_NAMES, interpolateKeyframes, getAnimationDuration, addKeyframe } from '../services/scene3DAnimations';

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
  const transformRef = useRef<THREE.TransformControls | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [sceneData, setSceneData] = useState<Scene3DData>(initialData || createDefaultScene());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'object' | 'light' | null>(null);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showLightMenu, setShowLightMenu] = useState(false);
  const [spaceMode, setSpaceMode] = useState<'world' | 'local'>('world');
  const [snapToGrid, setSnapToGrid] = useState(false);
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

    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.name = '__axes__';
    scene.add(axesHelper);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;

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
  }, [sceneData]);

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
        setSelectedId(id);
        setSelectedType('object');

        const obj = sceneData.objects.find((o) => o.id === id);
        if (obj) {
          const target = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
          controlsRef.current?.target.copy(target);
          cameraRef.current!.position.set(
            target.x + 5,
            target.y + 3,
            target.z + 5
          );
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
        setSelectedId(id);
        setSelectedType('object');
      } else {
        setSelectedId(null);
        setSelectedType(null);
      }
    };

    canvasRef.current.addEventListener('dblclick', handleDoubleClick);
    canvasRef.current.addEventListener('click', handleClick);
    return () => {
      canvasRef.current?.removeEventListener('dblclick', handleDoubleClick);
      canvasRef.current?.removeEventListener('click', handleClick);
    };
  }, [sceneData.objects]);

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
    setSelectedId(newObj.id);
    setSelectedType('object');
    setShowAddMenu(false);
  }, []);

  const addLight = useCallback((type: Scene3DLight['type']) => {
    const newLight = createLight(type);
    setSceneData((prev) => ({ ...prev, lights: [...prev.lights, newLight] }));
    setSelectedId(newLight.id);
    setSelectedType('light');
    setShowLightMenu(false);
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId || !selectedType) return;
    if (selectedType === 'object') {
      setSceneData((prev) => ({
        ...prev,
        objects: prev.objects.filter((o) => o.id !== selectedId),
      }));
    } else {
      setSceneData((prev) => ({
        ...prev,
        lights: prev.lights.filter((l) => l.id !== selectedId),
      }));
    }
    setSelectedId(null);
    setSelectedType(null);
  }, [selectedId, selectedType]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId || selectedType !== 'object') return;
    const obj = sceneData.objects.find((o) => o.id === selectedId);
    if (!obj) return;
    const newObj: Scene3DObject = {
      ...obj,
      id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${obj.name} Copy`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2]],
    };
    setSceneData((prev) => ({ ...prev, objects: [...prev.objects, newObj] }));
    setSelectedId(newObj.id);
  }, [selectedId, selectedType, sceneData.objects]);

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

  const selectedObj = selectedType === 'object' ? sceneData.objects.find((o) => o.id === selectedId) : null;
  const selectedLight = selectedType === 'light' ? sceneData.lights.find((l) => l.id === selectedId) : null;

  const renderObjectTree = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
      {sceneData.objects.length === 0 && sceneData.lights.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Box size={32} className="mx-auto mb-2 opacity-40" />
          <p>No objects yet</p>
          <p className="mt-1">Click + to add one</p>
        </div>
      )}

      {sceneData.objects.map((obj) => (
        <div
          key={obj.id}
          className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
            selectedId === obj.id && selectedType === 'object'
              ? 'bg-violet-100 text-violet-700 font-semibold'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
          onClick={() => {
            setSelectedId(obj.id);
            setSelectedType('object');
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
              setSceneData((prev) => ({
                ...prev,
                objects: prev.objects.filter((o) => o.id !== obj.id),
              }));
              if (selectedId === obj.id) {
                setSelectedId(null);
                setSelectedType(null);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {sceneData.lights.length > 0 && (
        <>
          <div className="text-[10px] uppercase font-bold text-slate-400 mt-3 mb-1 px-2 tracking-wider">
            Lights
          </div>
          {sceneData.lights.map((light) => (
            <div
              key={light.id}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedId === light.id && selectedType === 'light'
                  ? 'bg-amber-100 text-amber-700 font-semibold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={() => {
                setSelectedId(light.id);
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
                  if (selectedId === light.id) {
                    setSelectedId(null);
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
    if (!selectedObj) return null;
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
    if (!selectedObj) return null;

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
      <div className="h-11 bg-white border-b border-slate-200 flex items-center px-3 gap-2 shrink-0 shadow-sm">
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => { setShowAddMenu(!showAddMenu); setShowLightMenu(false); }}
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
            onClick={() => { setShowLightMenu(!showLightMenu); setShowAddMenu(false); }}
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
          onClick={duplicateSelected}
          disabled={!selectedId || selectedType !== 'object'}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={deleteSelected}
          disabled={!selectedId}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-30 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
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
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Scene Objects
            </div>
          </div>
          {renderObjectTree()}
        </div>

        <div
          className="w-1 hover:w-1.5 bg-slate-200 hover:bg-violet-400 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleLeftResize}
        />

        <div ref={containerRef} className="flex-1 relative bg-slate-200 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          <div className="absolute bottom-2 left-2 flex gap-1">
            {['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'].map((view) => {
              const positions: Record<string, [number, number, number]> = {
                Front: [0, 2, 8],
                Back: [0, 2, -8],
                Left: [-8, 2, 0],
                Right: [8, 2, 0],
                Top: [0, 10, 0.01],
                Bottom: [0, -10, 0.01],
              };
              return (
                <button
                  key={view}
                  onClick={() => {
                    if (cameraRef.current && controlsRef.current) {
                      const pos = positions[view];
                      cameraRef.current.position.set(pos[0], pos[1], pos[2]);
                      controlsRef.current.target.set(0, 0, 0);
                    }
                  }}
                  className="px-2 py-1 bg-white/80 backdrop-blur text-[10px] font-bold text-slate-600 rounded-lg hover:bg-white shadow-sm border border-slate-200 transition-colors"
                >
                  {view}
                </button>
              );
            })}
          </div>

          <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-white/80 backdrop-blur px-2 py-1 rounded-lg shadow-sm border border-slate-200">
            {sceneData.objects.length} objects | {sceneData.lights.length} lights
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

          {!selectedObj && !selectedLight && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-slate-400">
                <MousePointer2 size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Select an object</p>
                <p className="text-[10px] mt-1 opacity-70">Click an object in the scene or tree</p>
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
          </div>
        </div>
      </div>

      {renderTimeline()}

      {(showAddMenu || showLightMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowAddMenu(false); setShowLightMenu(false); }}
        />
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
    </div>
  );
}
