import * as THREE from 'three';
import { CADObject3D } from '../../types/cad';
import { createBoxParameters, createCylinderParameters } from '../../services/cadParametrics';

export interface CADTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  create: () => CADObject3D[];
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
    create: () => [
      {
        id: genId(), name: 'Horizontal', type: 'box',
        materialId: 'Metal',
        position: { x: 0, y: 0.25, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(60, 5, 30),
        geometry: new THREE.BoxGeometry(6, 0.5, 3),
      },
      {
        id: genId(), name: 'Vertical', type: 'box',
        materialId: 'Metal',
        position: { x: -2.5, y: 3.25, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true, locked: false, children: [],
        parameters: createBoxParameters(5, 60, 30),
        geometry: new THREE.BoxGeometry(0.5, 6, 3),
      },
    ],
  },
];
