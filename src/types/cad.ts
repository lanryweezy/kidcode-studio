import * as THREE from 'three';

export interface CADPoint {
  x: number;
  y: number;
  id: string;
}

export interface CADLine {
  start: CADPoint;
  end: CADPoint;
  id: string;
  isConstruction: boolean;
}

export interface CADRectangle {
  corner1: CADPoint;
  corner2: CADPoint;
  id: string;
  isConstruction: boolean;
}

export interface CADCircle {
  center: CADPoint;
  radius: number;
  id: string;
  isConstruction: boolean;
}

export interface CADArc {
  center: CADPoint;
  radius: number;
  startAngle: number;
  endAngle: number;
  id: string;
  isConstruction: boolean;
}

export interface CADPolygon {
  points: CADPoint[];
  id: string;
  isConstruction: boolean;
  closed: boolean;
}

export type CADSketchShape =
  | { type: 'line'; data: CADLine }
  | { type: 'rectangle'; data: CADRectangle }
  | { type: 'circle'; data: CADCircle }
  | { type: 'arc'; data: CADArc }
  | { type: 'polygon'; data: CADPolygon };

export interface CADSketch {
  id: string;
  name: string;
  shapes: CADSketchShape[];
  plane: 'XY' | 'XZ' | 'YZ';
  locked: boolean;
  visible: boolean;
  constraints: CADConstraint[];
}

export interface CADParameter {
  name: string;
  type: 'length' | 'angle' | 'count';
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
}

export interface CADObject3D {
  id: string;
  name: string;
  type: 'box' | 'cylinder' | 'sphere' | 'extrude' | 'revolve' | 'sweep' | 'loft' | 'boolean' | 'imported' | 'fillet' | 'chamfer' | 'shell' | 'pattern';
  mesh?: THREE.Mesh;
  geometry?: THREE.BufferGeometry;
  materialId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  locked: boolean;
  children: string[];
  parentId?: string;
  groupId?: string;
  parameters: CADParameter[];
  operation?: CADOperation;
  sketchId?: string;
}

export type CADOperationType =
  | 'extrude' | 'revolve' | 'sweep' | 'loft'
  | 'union' | 'subtract' | 'intersect'
  | 'fillet' | 'chamfer' | 'shell'
  | 'linear_array' | 'circular_array' | 'mirror';

export interface CADOperation {
  type: CADOperationType;
  params: Record<string, number>;
}

export interface CADMeasureResult {
  type: 'distance' | 'angle' | 'area' | 'volume' | 'radius';
  value: number;
  unit: string;
  points: CADPoint[];
}

export type CADSketchTool = 'line' | 'rectangle' | 'circle' | 'polygon' | 'arc' | 'trim' | 'offset' | 'select' | 'none';

export type CADViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'isometric' | 'home';

export type CADMaterialType = 'PLA' | 'ABS' | 'Resin' | 'Wood' | 'Metal' | 'Rubber' | 'Glass' | 'Stone' | 'Fabric';

export interface CADMaterialConfig {
  name: string;
  type: CADMaterialType;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
}

export interface CADExportOptions {
  format: 'stl' | 'stl_binary' | 'obj' | 'gltf' | 'glb' | '3mf' | 'step';
  unit: 'mm' | 'cm' | 'inch';
  includeColors: boolean;
  onProgress?: (progress: number, message: string) => void;
  simplifyOption?: number;
  perBody?: boolean;
}

export type CADConstraintType = 'horizontal' | 'vertical' | 'equal' | 'parallel' | 'perpendicular' | 'fixed' | 'dimension';

export interface CADConstraint {
  id: string;
  type: CADConstraintType;
  shapeIds: string[];
  value?: number;
}

export type CADMirrorPlane = 'XY' | 'XZ' | 'YZ';

export interface CADAssemblyConstraint {
  id: string;
  type: 'planar' | 'axial' | 'point';
  objectIdA: string;
  objectIdB: string;
  faceIndexA?: number;
  faceIndexB?: number;
  axisA?: 'X' | 'Y' | 'Z';
  axisB?: 'X' | 'Y' | 'Z';
}

export interface CADAssemblyNode {
  id: string;
  objectId: string;
  children: string[];
  parentId?: string;
  constraints: CADAssemblyConstraint[];
}

export interface CADBOMItem {
  id: string;
  name: string;
  quantity: number;
  volume: number;
  material: CADMaterialType;
  estimatedPrintTime: number;
  width: number;
  height: number;
  depth: number;
}

export interface CADPrintBedConfig {
  width: number;
  height: number;
  depth: number;
}

export const PRINT_BED: CADPrintBedConfig = {
  width: 220,
  height: 250,
  depth: 220,
};

export interface PrinterProfile {
  id: string;
  name: string;
  bedWidth: number;
  bedDepth: number;
  bedHeight: number;
  maxSpeed: number;
  layerHeight: number;
  nozzleDiameter: number;
  filamentPricePerKg: number;
}

export const PRINTER_PROFILES: PrinterProfile[] = [
  { id: 'ender3', name: 'Ender 3', bedWidth: 220, bedDepth: 220, bedHeight: 250, maxSpeed: 150, layerHeight: 0.2, nozzleDiameter: 0.4, filamentPricePerKg: 20 },
  { id: 'prusa-mk3', name: 'Prusa MK3', bedWidth: 250, bedDepth: 210, bedHeight: 210, maxSpeed: 200, layerHeight: 0.2, nozzleDiameter: 0.4, filamentPricePerKg: 25 },
  { id: 'bambu-a1', name: 'Bambu Lab A1', bedWidth: 256, bedDepth: 256, bedHeight: 256, maxSpeed: 500, layerHeight: 0.2, nozzleDiameter: 0.4, filamentPricePerKg: 22 },
  { id: 'bambu-x1c', name: 'Bambu Lab X1C', bedWidth: 256, bedDepth: 256, bedHeight: 256, maxSpeed: 500, layerHeight: 0.2, nozzleDiameter: 0.4, filamentPricePerKg: 28 },
];

export interface UndoEntry {
  objects: CADObject3D[];
  label: string;
}

export interface CADState {
  objects: CADObject3D[];
  sketches: CADSketch[];
  activeSketchId: string | null;
  selectedObjectIds: string[];
  selectedShapeId: string | null;
  activeTool: CADSketchTool;
  activeOperation: CADOperationType | null;
  showGrid: boolean;
  gridSize: number;
  showDimensions: boolean;
  showConstructionLines: boolean;
  wireframeMode: boolean;
  crossSectionEnabled: boolean;
  crossSectionY: number;
  crossSectionNormal: { x: number; y: number; z: number };
  crossSectionFlipped: boolean;
  explodedView: boolean;
  explodeAmount: number;
  viewPreset: CADViewPreset;
  materialId: string;
  measureMode: 'none' | 'distance' | 'angle' | 'area' | 'volume' | 'radius';
  measurePoints: CADPoint[];
  assemblyConstraints: CADAssemblyConstraint[];
  activePanel: 'properties' | 'operations' | 'bom' | 'print' | 'assembly';
  showPrintPreview: boolean;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
}

export const INITIAL_CAD_STATE: CADState = {
  objects: [],
  sketches: [],
  activeSketchId: null,
  selectedObjectIds: [],
  selectedShapeId: null,
  activeTool: 'none',
  activeOperation: null,
  showGrid: true,
  gridSize: 10,
  showDimensions: true,
  showConstructionLines: false,
  wireframeMode: false,
  crossSectionEnabled: false,
  crossSectionY: 0,
  crossSectionNormal: { x: 0, y: 1, z: 0 },
  crossSectionFlipped: false,
  explodedView: false,
  explodeAmount: 0,
  viewPreset: 'home',
  materialId: 'PLA',
  measureMode: 'none',
  measurePoints: [],
  assemblyConstraints: [],
  activePanel: 'properties',
  showPrintPreview: false,
  undoStack: [],
  redoStack: [],
};

export const CAD_MATERIALS: Record<CADMaterialType, CADMaterialConfig> = {
  PLA: { name: 'PLA', type: 'PLA', color: '#e8e8e8', roughness: 0.85, metalness: 0, opacity: 1, transparent: false },
  ABS: { name: 'ABS', type: 'ABS', color: '#d0d0d0', roughness: 0.7, metalness: 0.02, opacity: 1, transparent: false },
  Resin: { name: 'Resin', type: 'Resin', color: '#c8c8ff', roughness: 0.3, metalness: 0, opacity: 0.92, transparent: true },
  Wood: { name: 'Wood-fill', type: 'Wood', color: '#b5894e', roughness: 0.95, metalness: 0, opacity: 1, transparent: false },
  Metal: { name: 'Metal', type: 'Metal', color: '#c0c0c0', roughness: 0.15, metalness: 0.9, opacity: 1, transparent: false },
  Rubber: { name: 'Rubber', type: 'Rubber', color: '#333333', roughness: 0.98, metalness: 0, opacity: 1, transparent: false },
  Glass: { name: 'Glass', type: 'Glass', color: '#e8f4f8', roughness: 0.05, metalness: 0.1, opacity: 0.3, transparent: true },
  Stone: { name: 'Stone', type: 'Stone', color: '#8B8682', roughness: 0.95, metalness: 0, opacity: 1, transparent: false },
  Fabric: { name: 'Fabric', type: 'Fabric', color: '#D2691E', roughness: 1.0, metalness: 0, opacity: 1, transparent: false },
};

export type CADLightPreset = 'studio' | 'outdoor' | 'night' | 'dramatic' | 'colorful';

export interface CADLightPresetConfig {
  name: string;
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  directionalPosition: [number, number, number];
  background: string;
}

export const CAD_LIGHT_PRESETS: Record<CADLightPreset, CADLightPresetConfig> = {
  studio: { name: 'Studio', ambientIntensity: 0.6, ambientColor: '#ffffff', directionalIntensity: 1.2, directionalColor: '#ffffff', directionalPosition: [10, 20, 10], background: '#f0f4f8' },
  outdoor: { name: 'Outdoor', ambientIntensity: 0.5, ambientColor: '#87ceeb', directionalIntensity: 1.5, directionalColor: '#fff8dc', directionalPosition: [5, 30, 5], background: '#87ceeb' },
  night: { name: 'Night', ambientIntensity: 0.15, ambientColor: '#1a1a3e', directionalIntensity: 0.3, directionalColor: '#6666ff', directionalPosition: [-5, 10, -5], background: '#0a0a1e' },
  dramatic: { name: 'Dramatic', ambientIntensity: 0.2, ambientColor: '#330000', directionalIntensity: 2.0, directionalColor: '#ff6644', directionalPosition: [10, 5, 0], background: '#1a0a0a' },
  colorful: { name: 'Colorful', ambientIntensity: 0.4, ambientColor: '#ff88ff', directionalIntensity: 1.0, directionalColor: '#88ffaa', directionalPosition: [8, 12, 8], background: '#f8e8ff' },
};
