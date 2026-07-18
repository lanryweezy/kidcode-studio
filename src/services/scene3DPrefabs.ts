import { Scene3DObject, createPrimitive } from './scene3DPrimitives';

export interface PrefabDefinition {
  name: string;
  icon: string;
  description: string;
  create: (position?: [number, number, number]) => Scene3DObject[];
}

function makeId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const WOOD: Scene3DObject['material'] = {
  color: '#8B4513',
  opacity: 1,
  metalness: 0,
  roughness: 0.9,
  wireframe: false,
  doubleSided: false,
};

const RED: Scene3DObject['material'] = {
  color: '#dc2626',
  opacity: 1,
  metalness: 0,
  roughness: 0.5,
  wireframe: false,
  doubleSided: false,
};

const GREEN: Scene3DObject['material'] = {
  color: '#16a34a',
  opacity: 1,
  metalness: 0,
  roughness: 0.7,
  wireframe: false,
  doubleSided: false,
};

const DARK_GREEN: Scene3DObject['material'] = {
  color: '#15803d',
  opacity: 1,
  metalness: 0,
  roughness: 0.8,
  wireframe: false,
  doubleSided: false,
};

const BROWN: Scene3DObject['material'] = {
  color: '#6b4423',
  opacity: 1,
  metalness: 0,
  roughness: 0.95,
  wireframe: false,
  doubleSided: false,
};

const BLUE: Scene3DObject['material'] = {
  color: '#2563eb',
  opacity: 1,
  metalness: 0.1,
  roughness: 0.4,
  wireframe: false,
  doubleSided: false,
};

const WHITE: Scene3DObject['material'] = {
  color: '#ffffff',
  opacity: 1,
  metalness: 0,
  roughness: 0.3,
  wireframe: false,
  doubleSided: false,
};

const GRAY: Scene3DObject['material'] = {
  color: '#6b7280',
  opacity: 1,
  metalness: 0.5,
  roughness: 0.3,
  wireframe: false,
  doubleSided: false,
};

const DARK_GRAY: Scene3DObject['material'] = {
  color: '#374151',
  opacity: 1,
  metalness: 0.6,
  roughness: 0.2,
  wireframe: false,
  doubleSided: false,
};

const SILVER: Scene3DObject['material'] = {
  color: '#d1d5db',
  opacity: 1,
  metalness: 0.8,
  roughness: 0.2,
  wireframe: false,
  doubleSided: false,
};

const ORANGE: Scene3DObject['material'] = {
  color: '#ea580c',
  opacity: 1,
  metalness: 0,
  roughness: 0.5,
  wireframe: false,
  doubleSided: false,
};

const YELLOW: Scene3DObject['material'] = {
  color: '#eab308',
  opacity: 1,
  metalness: 0,
  roughness: 0.4,
  wireframe: false,
  doubleSided: false,
};

const PINK: Scene3DObject['material'] = {
  color: '#ec4899',
  opacity: 1,
  metalness: 0,
  roughness: 0.5,
  wireframe: false,
  doubleSided: false,
};

const SKIN: Scene3DObject['material'] = {
  color: '#fbbf24',
  opacity: 1,
  metalness: 0,
  roughness: 0.6,
  wireframe: false,
  doubleSided: false,
};

const STONE: Scene3DObject['material'] = {
  color: '#9ca3af',
  opacity: 1,
  metalness: 0.1,
  roughness: 0.9,
  wireframe: false,
  doubleSided: false,
};

function createPart(
  type: Scene3DObject['type'],
  name: string,
  position: [number, number, number],
  material: Scene3DObject['material'],
  geometryParams?: Record<string, number>,
  rotation?: [number, number, number],
  scale?: [number, number, number]
): Scene3DObject {
  return createPrimitive(type, {
    name,
    position,
    material,
    geometryParams,
    rotation: rotation || [0, 0, 0],
    scale: scale || [1, 1, 1],
  });
}

export const PREFABS: PrefabDefinition[] = [
  {
    name: 'Chair',
    icon: '🪑',
    description: 'A simple chair with seat, backrest and 4 legs',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Seat', [px, py + 0.5, pz], WOOD, { width: 0.8, height: 0.1, depth: 0.8 }),
        createPart('cube', 'Backrest', [px, py + 1.0, pz - 0.35], WOOD, { width: 0.8, height: 0.7, depth: 0.1 }),
        createPart('cylinder', 'Front Left Leg', [px - 0.3, py + 0.25, pz + 0.3], WOOD, { radiusTop: 0.04, radiusBottom: 0.04, height: 0.5, radialSegments: 8 }),
        createPart('cylinder', 'Front Right Leg', [px + 0.3, py + 0.25, pz + 0.3], WOOD, { radiusTop: 0.04, radiusBottom: 0.04, height: 0.5, radialSegments: 8 }),
        createPart('cylinder', 'Back Left Leg', [px - 0.3, py + 0.25, pz - 0.3], WOOD, { radiusTop: 0.04, radiusBottom: 0.04, height: 0.5, radialSegments: 8 }),
        createPart('cylinder', 'Back Right Leg', [px + 0.3, py + 0.25, pz - 0.3], WOOD, { radiusTop: 0.04, radiusBottom: 0.04, height: 0.5, radialSegments: 8 }),
      ];
    },
  },
  {
    name: 'Table',
    icon: '🪵',
    description: 'A table with 4 legs and a flat top',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Table Top', [px, py + 0.8, pz], WOOD, { width: 1.6, height: 0.1, depth: 0.9 }),
        createPart('cylinder', 'Front Left Leg', [px - 0.65, py + 0.4, pz + 0.3], WOOD, { radiusTop: 0.05, radiusBottom: 0.05, height: 0.8, radialSegments: 8 }),
        createPart('cylinder', 'Front Right Leg', [px + 0.65, py + 0.4, pz + 0.3], WOOD, { radiusTop: 0.05, radiusBottom: 0.05, height: 0.8, radialSegments: 8 }),
        createPart('cylinder', 'Back Left Leg', [px - 0.65, py + 0.4, pz - 0.3], WOOD, { radiusTop: 0.05, radiusBottom: 0.05, height: 0.8, radialSegments: 8 }),
        createPart('cylinder', 'Back Right Leg', [px + 0.65, py + 0.4, pz - 0.3], WOOD, { radiusTop: 0.05, radiusBottom: 0.05, height: 0.8, radialSegments: 8 }),
      ];
    },
  },
  {
    name: 'House',
    icon: '🏠',
    description: 'A house with walls, roof, door and window',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Walls', [px, py + 1, pz], WHITE, { width: 2.4, height: 2, depth: 2.4 }),
        createPart('cone', 'Roof', [px, py + 2.7, pz], RED, { radius: 1.8, height: 1.4, radialSegments: 4 }),
        createPart('cube', 'Door', [px, py + 0.6, pz + 1.21], BROWN, { width: 0.5, height: 1.2, depth: 0.05 }),
        createPart('cube', 'Window Left', [px - 0.6, py + 1.3, pz + 1.21], BLUE, { width: 0.45, height: 0.45, depth: 0.05 }),
        createPart('cube', 'Window Right', [px + 0.6, py + 1.3, pz + 1.21], BLUE, { width: 0.45, height: 0.45, depth: 0.05 }),
      ];
    },
  },
  {
    name: 'Tree',
    icon: '🌳',
    description: 'A tree with trunk and leaf canopy',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cylinder', 'Trunk', [px, py + 0.75, pz], BROWN, { radiusTop: 0.12, radiusBottom: 0.15, height: 1.5, radialSegments: 8 }),
        createPart('sphere', 'Leaves Top', [px, py + 2.0, pz], GREEN, { radius: 0.7, widthSegments: 16, heightSegments: 16 }),
        createPart('sphere', 'Leaves Left', [px - 0.4, py + 1.7, pz], DARK_GREEN, { radius: 0.5, widthSegments: 16, heightSegments: 16 }),
        createPart('sphere', 'Leaves Right', [px + 0.4, py + 1.7, pz], DARK_GREEN, { radius: 0.5, widthSegments: 16, heightSegments: 16 }),
        createPart('sphere', 'Leaves Front', [px, py + 1.7, pz + 0.4], GREEN, { radius: 0.45, widthSegments: 16, heightSegments: 16 }),
      ];
    },
  },
  {
    name: 'Car',
    icon: '🚗',
    description: 'A car with body, wheels and windshield',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Body', [px, py + 0.55, pz], RED, { width: 1.8, height: 0.6, depth: 1.0 }),
        createPart('cube', 'Cabin', [px - 0.15, py + 1.0, pz], WHITE, { width: 1.0, height: 0.5, depth: 0.9 }),
        createPart('cylinder', 'Front Left Wheel', [px - 0.55, py + 0.2, pz + 0.55], DARK_GRAY, { radiusTop: 0.2, radiusBottom: 0.2, height: 0.15, radialSegments: 16 }, [0, 0, Math.PI / 2]),
        createPart('cylinder', 'Front Right Wheel', [px - 0.55, py + 0.2, pz - 0.55], DARK_GRAY, { radiusTop: 0.2, radiusBottom: 0.2, height: 0.15, radialSegments: 16 }, [0, 0, Math.PI / 2]),
        createPart('cylinder', 'Rear Left Wheel', [px + 0.55, py + 0.2, pz + 0.55], DARK_GRAY, { radiusTop: 0.2, radiusBottom: 0.2, height: 0.15, radialSegments: 16 }, [0, 0, Math.PI / 2]),
        createPart('cylinder', 'Rear Right Wheel', [px + 0.55, py + 0.2, pz - 0.55], DARK_GRAY, { radiusTop: 0.2, radiusBottom: 0.2, height: 0.15, radialSegments: 16 }, [0, 0, Math.PI / 2]),
      ];
    },
  },
  {
    name: 'Character',
    icon: '🧑',
    description: 'A simple character with head, body and limbs',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('sphere', 'Head', [px, py + 1.75, pz], SKIN, { radius: 0.25, widthSegments: 16, heightSegments: 16 }),
        createPart('cylinder', 'Body', [px, py + 1.15, pz], BLUE, { radiusTop: 0.2, radiusBottom: 0.15, height: 0.7, radialSegments: 12 }),
        createPart('cylinder', 'Left Arm', [px - 0.3, py + 1.25, pz], BLUE, { radiusTop: 0.06, radiusBottom: 0.06, height: 0.5, radialSegments: 8 }),
        createPart('cylinder', 'Right Arm', [px + 0.3, py + 1.25, pz], BLUE, { radiusTop: 0.06, radiusBottom: 0.06, height: 0.5, radialSegments: 8 }),
        createPart('cylinder', 'Left Leg', [px - 0.1, py + 0.4, pz], DARK_GRAY, { radiusTop: 0.07, radiusBottom: 0.07, height: 0.6, radialSegments: 8 }),
        createPart('cylinder', 'Right Leg', [px + 0.1, py + 0.4, pz], DARK_GRAY, { radiusTop: 0.07, radiusBottom: 0.07, height: 0.6, radialSegments: 8 }),
      ];
    },
  },
  {
    name: 'Sword',
    icon: '⚔️',
    description: 'A sword with blade and handle',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Blade', [px, py + 1.0, pz], SILVER, { width: 0.08, height: 1.2, depth: 0.02 }),
        createPart('cube', 'Crossguard', [px, py + 0.35, pz], GRAY, { width: 0.3, height: 0.08, depth: 0.08 }),
        createPart('cylinder', 'Handle', [px, py + 0.15, pz], BROWN, { radiusTop: 0.04, radiusBottom: 0.04, height: 0.35, radialSegments: 8 }),
        createPart('sphere', 'Pommel', [px, py - 0.05, pz], GRAY, { radius: 0.06, widthSegments: 8, heightSegments: 8 }),
      ];
    },
  },
  {
    name: 'Castle',
    icon: '🏰',
    description: 'A castle with towers, walls and gate',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Main Wall', [px, py + 1.2, pz], STONE, { width: 3, height: 2.4, depth: 3 }),
        createPart('cylinder', 'Front Left Tower', [px - 1.5, py + 1.5, pz + 1.5], STONE, { radiusTop: 0.4, radiusBottom: 0.45, height: 3, radialSegments: 12 }),
        createPart('cylinder', 'Front Right Tower', [px + 1.5, py + 1.5, pz + 1.5], STONE, { radiusTop: 0.4, radiusBottom: 0.45, height: 3, radialSegments: 12 }),
        createPart('cylinder', 'Back Left Tower', [px - 1.5, py + 1.5, pz - 1.5], STONE, { radiusTop: 0.4, radiusBottom: 0.45, height: 3, radialSegments: 12 }),
        createPart('cylinder', 'Back Right Tower', [px + 1.5, py + 1.5, pz - 1.5], STONE, { radiusTop: 0.4, radiusBottom: 0.45, height: 3, radialSegments: 12 }),
        createPart('cube', 'Gate', [px, py + 0.6, pz + 1.51], BROWN, { width: 0.8, height: 1.2, depth: 0.1 }),
        createPart('cone', 'Tower Cap FL', [px - 1.5, py + 3.4, pz + 1.5], RED, { radius: 0.5, height: 0.6, radialSegments: 12 }),
        createPart('cone', 'Tower Cap FR', [px + 1.5, py + 3.4, pz + 1.5], RED, { radius: 0.5, height: 0.6, radialSegments: 12 }),
        createPart('cone', 'Tower Cap BL', [px - 1.5, py + 3.4, pz - 1.5], RED, { radius: 0.5, height: 0.6, radialSegments: 12 }),
        createPart('cone', 'Tower Cap BR', [px + 1.5, py + 3.4, pz - 1.5], RED, { radius: 0.5, height: 0.6, radialSegments: 12 }),
      ];
    },
  },
  {
    name: 'Bridge',
    icon: '🌉',
    description: 'A bridge with pillars and deck',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cube', 'Deck', [px, py + 1.2, pz], WOOD, { width: 4, height: 0.15, depth: 1.0 }),
        createPart('cylinder', 'Left Pillar', [px - 1.5, py + 0.5, pz], STONE, { radiusTop: 0.2, radiusBottom: 0.25, height: 1, radialSegments: 12 }),
        createPart('cylinder', 'Right Pillar', [px + 1.5, py + 0.5, pz], STONE, { radiusTop: 0.2, radiusBottom: 0.25, height: 1, radialSegments: 12 }),
        createPart('cube', 'Rail Left', [px, py + 1.55, pz + 0.45], WOOD, { width: 4, height: 0.3, depth: 0.05 }),
        createPart('cube', 'Rail Right', [px, py + 1.55, pz - 0.45], WOOD, { width: 4, height: 0.3, depth: 0.05 }),
      ];
    },
  },
  {
    name: 'Spaceship',
    icon: '🚀',
    description: 'A spaceship with nose, body and engines',
    create: (pos = [0, 0, 0]) => {
      const [px, py, pz] = pos;
      return [
        createPart('cone', 'Nose', [px, py + 1.0, pz], SILVER, { radius: 0.4, height: 0.8, radialSegments: 16 }),
        createPart('cylinder', 'Body', [px, py + 0.4, pz], WHITE, { radiusTop: 0.4, radiusBottom: 0.35, height: 1.0, radialSegments: 16 }),
        createPart('cone', 'Engine Left', [px - 0.3, py + 0.0, pz], ORANGE, { radius: 0.12, height: 0.4, radialSegments: 8 }),
        createPart('cone', 'Engine Right', [px + 0.3, py + 0.0, pz], ORANGE, { radius: 0.12, height: 0.4, radialSegments: 8 }),
        createPart('cube', 'Wing Left', [px - 0.5, py + 0.3, pz], SILVER, { width: 0.5, height: 0.05, depth: 0.6 }),
        createPart('cube', 'Wing Right', [px + 0.5, py + 0.3, pz], SILVER, { width: 0.5, height: 0.05, depth: 0.6 }),
        createPart('sphere', 'Cockpit', [px, py + 0.75, pz + 0.25], BLUE, { radius: 0.15, widthSegments: 12, heightSegments: 12 }),
      ];
    },
  },
];

export function getPrefabByName(name: string): PrefabDefinition | undefined {
  return PREFABS.find((p) => p.name === name);
}
