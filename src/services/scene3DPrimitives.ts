export interface Scene3DMaterial {
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  emissive?: string;
  emissiveIntensity?: number;
  doubleSided?: boolean;
}

export interface Scene3DObject {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'model';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  material: Scene3DMaterial;
  visible: boolean;
  locked: boolean;
  children?: Scene3DObject[];
  modelUrl?: string;
  geometryParams?: Record<string, number>;
}

export interface Scene3DLight {
  id: string;
  name: string;
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color: string;
  intensity: number;
  position: [number, number, number];
  castShadow: boolean;
  visible: boolean;
  distance?: number;
  angle?: number;
  penumbra?: number;
}

export interface Animation3D {
  id: string;
  objectId: string;
  property: 'position' | 'rotation' | 'scale';
  channel: 'x' | 'y' | 'z';
  keyframes: { time: number; value: number; easing: string }[];
}

export interface Scene3DData {
  objects: Scene3DObject[];
  lights: Scene3DLight[];
  animations: Animation3D[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  backgroundColor: string;
}

const DEFAULT_MATERIAL: Scene3DMaterial = {
  color: '#8b5cf6',
  opacity: 1,
  metalness: 0,
  roughness: 0.7,
  wireframe: false,
  doubleSided: false,
};

let idCounter = 0;

function generateId(): string {
  return `obj_${Date.now()}_${idCounter++}`;
}

const PRIMITIVE_DEFAULTS: Record<string, Record<string, number>> = {
  cube: { width: 1, height: 1, depth: 1 },
  sphere: { radius: 0.5, widthSegments: 32, heightSegments: 32 },
  cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 },
  cone: { radius: 0.5, height: 1, radialSegments: 32 },
  torus: { radius: 0.5, tube: 0.2, radialSegments: 16, tubularSegments: 32 },
  plane: { width: 2, height: 2 },
};

const PRIMITIVE_NAMES: Record<string, string> = {
  cube: 'Cube',
  sphere: 'Sphere',
  cylinder: 'Cylinder',
  cone: 'Cone',
  torus: 'Torus',
  plane: 'Plane',
};

export function createPrimitive(
  type: Scene3DObject['type'],
  overrides?: Partial<Scene3DObject>
): Scene3DObject {
  const id = generateId();
  const name = overrides?.name || PRIMITIVE_NAMES[type] || 'Object';
  const geometryParams = overrides?.geometryParams || { ...PRIMITIVE_DEFAULTS[type] };

  return {
    id,
    name,
    type,
    position: overrides?.position || [0, 0.5, 0],
    rotation: overrides?.rotation || [0, 0, 0],
    scale: overrides?.scale || [1, 1, 1],
    material: overrides?.material || { ...DEFAULT_MATERIAL },
    visible: true,
    locked: false,
    geometryParams,
  };
}

export function createCube(size?: number): Scene3DObject {
  const s = size || 1;
  return createPrimitive('cube', {
    name: 'Cube',
    geometryParams: { width: s, height: s, depth: s },
  });
}

export function createSphere(radius?: number): Scene3DObject {
  return createPrimitive('sphere', {
    name: 'Sphere',
    geometryParams: { radius: radius || 0.5, widthSegments: 32, heightSegments: 32 },
  });
}

export function createCylinder(radius?: number, height?: number): Scene3DObject {
  const r = radius || 0.5;
  const h = height || 1;
  return createPrimitive('cylinder', {
    name: 'Cylinder',
    geometryParams: { radiusTop: r, radiusBottom: r, height: h, radialSegments: 32 },
  });
}

export function createCone(radius?: number, height?: number): Scene3DObject {
  return createPrimitive('cone', {
    name: 'Cone',
    geometryParams: { radius: radius || 0.5, height: height || 1, radialSegments: 32 },
  });
}

export function createTorus(radius?: number, tube?: number): Scene3DObject {
  return createPrimitive('torus', {
    name: 'Torus',
    geometryParams: { radius: radius || 0.5, tube: tube || 0.2, radialSegments: 16, tubularSegments: 32 },
  });
}

export function createPlane(width?: number, height?: number): Scene3DObject {
  return createPrimitive('plane', {
    name: 'Plane',
    position: [0, 0, 0],
    geometryParams: { width: width || 2, height: height || 2 },
  });
}

export function createLight(
  type: Scene3DLight['type'],
  overrides?: Partial<Scene3DLight>
): Scene3DLight {
  const id = generateId();
  const names: Record<string, string> = {
    ambient: 'Ambient Light',
    directional: 'Directional Light',
    point: 'Point Light',
    spot: 'Spot Light',
  };

  const defaults: Record<string, Partial<Scene3DLight>> = {
    ambient: { intensity: 0.5, color: '#ffffff' },
    directional: { intensity: 1, color: '#ffffff', position: [5, 10, 5], castShadow: true },
    point: { intensity: 1, color: '#ffffff', position: [0, 5, 0], distance: 50 },
    spot: { intensity: 1, color: '#ffffff', position: [0, 10, 0], castShadow: true, angle: Math.PI / 6, penumbra: 0.3 },
  };

  return {
    id,
    name: overrides?.name || names[type] || 'Light',
    type,
    color: overrides?.color || defaults[type]?.color || '#ffffff',
    intensity: overrides?.intensity ?? defaults[type]?.intensity ?? 1,
    position: overrides?.position || (defaults[type]?.position as [number, number, number]) || [0, 5, 0],
    castShadow: overrides?.castShadow ?? defaults[type]?.castShadow ?? false,
    visible: true,
    distance: overrides?.distance ?? defaults[type]?.distance,
    angle: overrides?.angle ?? defaults[type]?.angle,
    penumbra: overrides?.penumbra ?? defaults[type]?.penumbra,
  };
}

export function createDefaultScene(): Scene3DData {
  return {
    objects: [],
    lights: [
      createLight('ambient', { intensity: 0.5 }),
      createLight('directional', { position: [5, 10, 5], castShadow: true }),
    ],
    animations: [],
    camera: {
      position: [5, 5, 10],
      target: [0, 0, 0],
    },
    backgroundColor: '#87ceeb',
  };
}

export const MATERIAL_PRESETS: Record<string, Scene3DMaterial> = {
  Metal: {
    color: '#c0c0c0',
    opacity: 1,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: false,
  },
  Plastic: {
    color: '#3b82f6',
    opacity: 1,
    metalness: 0,
    roughness: 0.5,
    wireframe: false,
  },
  Wood: {
    color: '#8B4513',
    opacity: 1,
    metalness: 0,
    roughness: 0.9,
    wireframe: false,
  },
  Glass: {
    color: '#ffffff',
    opacity: 0.3,
    metalness: 0.1,
    roughness: 0.1,
    wireframe: false,
  },
  Rubber: {
    color: '#1a1a1a',
    opacity: 1,
    metalness: 0,
    roughness: 1,
    wireframe: false,
  },
  Stone: {
    color: '#808080',
    opacity: 1,
    metalness: 0,
    roughness: 0.95,
    wireframe: false,
  },
};
