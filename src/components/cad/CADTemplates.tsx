import * as THREE from 'three';
import { CADObject3D } from '../../types/cad';
import { createBoxParameters, createCylinderParameters } from '../../services/cadParametrics';

export interface CADTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  create: (params?: Record<string, number>) => CADObject3D[];
  defaultParams?: Record<string, { min: number; max: number; value: number; step: number; label: string }>;
}

const genId = () => Math.random().toString(36).substring(2, 10);

export const CAD_TEMPLATES: CADTemplate[] = [
  {
    id: 'phone_stand',
    name: 'Phone Stand',
    description: 'Simple L-shaped phone stand',
    icon: '📱',
    create: () => [
      {
        id: genId(), name: 'Base', type: 'box',
        materialId: 'PLA',
        position: { x: 0, y: 0.25, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(80, 5, 50),
        geometry: new THREE.BoxGeometry(8, 0.5, 5),
      },
      {
        id: genId(), name: 'Back', type: 'box',
        materialId: 'PLA',
        position: { x: 0, y: 3.5, z: -2 },
        rotation: { x: -0.15, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(80, 60, 5),
        geometry: new THREE.BoxGeometry(8, 6, 0.5),
      },
    ],
  },
  {
    id: 'gear',
    name: 'Gear',
    description: 'Parametric gear with teeth',
    icon: '⚙️',
    create: () => [
      {
        id: genId(), name: 'Gear Body', type: 'cylinder',
        materialId: 'Metal',
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createCylinderParameters(30, 10, 24),
        geometry: new THREE.CylinderGeometry(3, 3, 1, 24),
      },
    ],
  },
  {
    id: 'vase',
    name: 'Vase',
    description: 'Revolved profile vase',
    icon: '🏺',
    create: () => [
      {
        id: genId(), name: 'Vase Body', type: 'cylinder',
        materialId: 'Resin',
        position: { x: 0, y: 4, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createCylinderParameters(25, 80, 32),
        geometry: new THREE.CylinderGeometry(2.5, 2, 8, 32),
      },
    ],
  },
  {
    id: 'box_with_lid',
    name: 'Box with Lid',
    description: 'Two-part box',
    icon: '📦',
    create: () => [
      {
        id: genId(), name: 'Box Body', type: 'box',
        materialId: 'PLA',
        position: { x: 0, y: 1.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(60, 30, 40),
        geometry: new THREE.BoxGeometry(6, 3, 4),
      },
      {
        id: genId(), name: 'Lid', type: 'box',
        materialId: 'PLA',
        position: { x: 0, y: 3.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(62, 5, 42),
        geometry: new THREE.BoxGeometry(6.2, 0.5, 4.2),
      },
    ],
  },
  {
    id: 'keychain',
    name: 'Keychain',
    description: 'Simple keychain with hole',
    icon: '🔑',
    create: () => [
      {
        id: genId(), name: 'Keychain Body', type: 'box',
        materialId: 'PLA',
        position: { x: 0, y: 0.15, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(50, 3, 25),
        geometry: new THREE.BoxGeometry(5, 0.3, 2.5),
      },
    ],
  },
  {
    id: 'bracket',
    name: 'Bracket',
    description: 'L-bracket with holes',
    icon: '🔧',
    create: (params) => {
      const arm1 = params?.arm1 || 60;
      const arm2 = params?.arm2 || 60;
      const thickness = params?.thickness || 5;
      const width = params?.width || 30;
      const t = thickness / 10;
      const w = width / 10;
      return [
        {
          id: genId(), name: 'Horizontal Arm', type: 'box',
          materialId: 'Metal',
          position: { x: 0, y: t / 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(arm1, thickness, width),
          geometry: new THREE.BoxGeometry(arm1 / 10, t, w),
        },
        {
          id: genId(), name: 'Vertical Arm', type: 'box',
          materialId: 'Metal',
          position: { x: -(arm1 / 20) + t / 2, y: arm2 / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(thickness, arm2, width),
          geometry: new THREE.BoxGeometry(t, arm2 / 10, w),
        },
      ];
    },
    defaultParams: {
      arm1: { min: 20, max: 150, value: 60, step: 5, label: 'Arm 1 Length' },
      arm2: { min: 20, max: 150, value: 60, step: 5, label: 'Arm 2 Length' },
      thickness: { min: 2, max: 20, value: 5, step: 1, label: 'Thickness' },
      width: { min: 10, max: 80, value: 30, step: 5, label: 'Width' },
    },
  },
  {
    id: 'screw',
    name: 'Screw',
    description: 'Parametric screw with thread',
    icon: '🔩',
    create: (params) => {
      const diameter = params?.diameter || 20;
      const length = params?.length || 40;
      const headSize = params?.headSize || 30;
      const headHeight = params?.headHeight || 10;
      const r = diameter / 10 / 2;
      const hr = headSize / 10 / 2;
      return [
        {
          id: genId(), name: 'Shaft', type: 'cylinder',
          materialId: 'Metal',
          position: { x: 0, y: length / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(diameter, length, 24),
          geometry: new THREE.CylinderGeometry(r, r, length / 10, 24),
        },
        {
          id: genId(), name: 'Head', type: 'cylinder',
          materialId: 'Metal',
          position: { x: 0, y: length / 10 + headHeight / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(headSize, headHeight, 6),
          geometry: new THREE.CylinderGeometry(hr, hr, headHeight / 10, 6),
        },
      ];
    },
    defaultParams: {
      diameter: { min: 4, max: 50, value: 20, step: 1, label: 'Shaft Diameter' },
      length: { min: 10, max: 200, value: 40, step: 5, label: 'Shaft Length' },
      headSize: { min: 10, max: 80, value: 30, step: 1, label: 'Head Size' },
      headHeight: { min: 3, max: 30, value: 10, step: 1, label: 'Head Height' },
    },
  },
  {
    id: 'bolt',
    name: 'Bolt',
    description: 'Hex bolt with head and shaft',
    icon: '⚙️',
    create: (params) => {
      const shaftDia = params?.shaftDia || 16;
      const length = params?.length || 50;
      const headSize = params?.headSize || 28;
      const headHeight = params?.headHeight || 10;
      const r = shaftDia / 10 / 2;
      const hr = headSize / 10 / 2;
      return [
        {
          id: genId(), name: 'Shaft', type: 'cylinder',
          materialId: 'Metal',
          position: { x: 0, y: length / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(shaftDia, length, 24),
          geometry: new THREE.CylinderGeometry(r, r, length / 10, 24),
        },
        {
          id: genId(), name: 'Hex Head', type: 'cylinder',
          materialId: 'Metal',
          position: { x: 0, y: length / 10 + headHeight / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(headSize, headHeight, 6),
          geometry: new THREE.CylinderGeometry(hr, hr, headHeight / 10, 6),
        },
      ];
    },
    defaultParams: {
      shaftDia: { min: 4, max: 50, value: 16, step: 1, label: 'Shaft Diameter' },
      length: { min: 10, max: 200, value: 50, step: 5, label: 'Length' },
      headSize: { min: 10, max: 80, value: 28, step: 1, label: 'Head Size' },
      headHeight: { min: 3, max: 30, value: 10, step: 1, label: 'Head Height' },
    },
  },
  {
    id: 'nut',
    name: 'Nut',
    description: 'Hex nut for bolts',
    icon: '🔩',
    create: (params) => {
      const threadSize = params?.threadSize || 20;
      const nutHeight = params?.nutHeight || 8;
      const r = threadSize / 10 / 2;
      return [
        {
          id: genId(), name: 'Nut Body', type: 'cylinder',
          materialId: 'Metal',
          position: { x: 0, y: nutHeight / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(threadSize * 1.5, nutHeight, 6),
          geometry: new THREE.CylinderGeometry(r * 1.5, r * 1.5, nutHeight / 10, 6),
        },
      ];
    },
    defaultParams: {
      threadSize: { min: 4, max: 50, value: 20, step: 1, label: 'Thread Size' },
      nutHeight: { min: 3, max: 30, value: 8, step: 1, label: 'Height' },
    },
  },
  {
    id: 'enclosure',
    name: 'Enclosure',
    description: 'Box with lid, ventilation slots',
    icon: '🏠',
    create: (params) => {
      const w = params?.width || 80;
      const h = params?.height || 60;
      const d = params?.depth || 80;
      const wall = params?.wall || 3;
      const lidGap = 2;
      return [
        {
          id: genId(), name: 'Body', type: 'box',
          materialId: 'PLA',
          position: { x: 0, y: h / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(w, h, d),
          geometry: new THREE.BoxGeometry(w / 10, h / 10, d / 10),
        },
        {
          id: genId(), name: 'Lid', type: 'box',
          materialId: 'PLA',
          position: { x: 0, y: h / 10 + lidGap / 10 + 1, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(w + 4, 4, d + 4),
          geometry: new THREE.BoxGeometry((w + 4) / 10, 0.4, (d + 4) / 10),
        },
      ];
    },
    defaultParams: {
      width: { min: 30, max: 300, value: 80, step: 5, label: 'Width' },
      height: { min: 20, max: 200, value: 60, step: 5, label: 'Height' },
      depth: { min: 30, max: 300, value: 80, step: 5, label: 'Depth' },
      wall: { min: 1, max: 10, value: 3, step: 0.5, label: 'Wall Thickness' },
    },
  },
  {
    id: 'phone_case',
    name: 'Phone Case',
    description: 'Parametric phone case with cutouts',
    icon: '📱',
    create: (params) => {
      const pw = params?.phoneWidth || 75;
      const ph = params?.phoneHeight || 155;
      const pd = params?.phoneDepth || 8;
      const wallT = params?.wallThickness || 2;
      const caseW = pw + wallT * 2;
      const caseH = ph + wallT * 2;
      const caseD = pd + wallT * 2;
      return [
        {
          id: genId(), name: 'Case Body', type: 'box',
          materialId: 'Rubber',
          position: { x: 0, y: caseH / 20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(caseW, caseH, caseD),
          geometry: new THREE.BoxGeometry(caseW / 10, caseH / 10, caseD / 10),
        },
        {
          id: genId(), name: 'Screen Cutout', type: 'box',
          materialId: 'PLA',
          position: { x: 0, y: caseH / 20 + wallT / 20, z: caseD / 20 - wallT / 20 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(pw - 4, ph - 8, wallT),
          geometry: new THREE.BoxGeometry((pw - 4) / 10, (ph - 8) / 10, wallT / 10),
        },
      ];
    },
    defaultParams: {
      phoneWidth: { min: 50, max: 120, value: 75, step: 1, label: 'Phone Width' },
      phoneHeight: { min: 100, max: 200, value: 155, step: 1, label: 'Phone Height' },
      phoneDepth: { min: 5, max: 20, value: 8, step: 0.5, label: 'Phone Depth' },
      wallThickness: { min: 1, max: 5, value: 2, step: 0.5, label: 'Wall Thickness' },
    },
  },
];
