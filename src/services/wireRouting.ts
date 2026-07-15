// ============================================================
// Wire Routing Engine - Interactive PCB Trace Routing
// Manhattan routing, auto-route, color coding, junction dots
// ============================================================

import { CircuitComponent, Wire } from '../types';

// === WIRE ROUTING TYPES ===

export interface WireRoute {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  fromComponentId: string;
  fromPin: number;
  toComponentId: string;
  toPin: number;
}

export interface WireColorScheme {
  power: string;    // Red for VCC
  ground: string;   // Black for GND
  signal: string;   // Blue for data
  pwm: string;      // Purple for PWM
  analog: string;   // Green for analog
  default: string;  // Yellow for general
}

export const WIRE_COLORS: WireColorScheme = {
  power: '#ef4444',
  ground: '#1e293b',
  signal: '#3b82f6',
  pwm: '#a855f7',
  analog: '#22c55e',
  default: '#fbbf24',
};

// === VOLTAGE-BASED WIRE COLORS ===

export function getWireColorForVoltage(voltage: number): string {
  if (voltage >= 4.5) return '#ef4444';       // Red for 5V
  if (voltage >= 3.0) return '#f97316';       // Orange for 3.3V
  if (voltage >= 1.8) return '#eab308';       // Yellow for 1.8V
  if (voltage >= 0.5) return '#22c55e';       // Green for logic low
  return '#1e293b';                            // Black for GND
}

// === CURRENT-BASED WIRE THICKNESS ===

export function getWireThickness(currentMa: number): number {
  if (currentMa >= 1000) return 4;
  if (currentMa >= 500) return 3;
  if (currentMa >= 100) return 2;
  if (currentMa >= 20) return 1.5;
  return 1;
}

export function getWireWidthLabel(width: number): string {
  if (width >= 4) return 'Heavy (1A+)';
  if (width >= 3) return 'Medium (500mA)';
  if (width >= 2) return 'Standard (100mA)';
  if (width >= 1.5) return 'Thin (20mA)';
  return 'Signal';
}

// === WIRE COLOR DETECTION ===

export function getWireColorForPin(pin: number, compType: string): string {
  // Power pins
  if (pin === 22 || pin === 24 || pin === 25 || pin === 90) return WIRE_COLORS.power;
  // Ground pins
  if (pin === 23 || pin === 91) return WIRE_COLORS.ground;
  // PWM pins
  if ([3, 5, 6, 9, 10, 11].includes(pin)) return WIRE_COLORS.pwm;
  // Analog pins
  if (pin >= 14 && pin <= 21) return WIRE_COLORS.analog;
  // Sensor pins
  if (compType.includes('SENSOR') || compType === 'DHT11' || compType === 'DHT22' ||
      compType === 'ULTRASONIC' || compType === 'MOTION') return WIRE_COLORS.signal;
  // Output pins
  if (compType.startsWith('LED') || compType === 'BUZZER' || compType === 'MOTOR_DC' ||
      compType === 'SERVO' || compType === 'FAN') return WIRE_COLORS.signal;
  return WIRE_COLORS.default;
}

export function getWireColorForComponent(comp: CircuitComponent): string {
  return getWireColorForPin(comp.pin, comp.type);
}

// === MANHATTAN ROUTING ===

export function manhattanRoute(
  from: { x: number; y: number },
  to: { x: number; y: number },
  existingWires: { x: number; y: number }[][] = []
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  // Start with direct horizontal then vertical (or vice versa)
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Prefer horizontal first if going mostly horizontal
  if (Math.abs(dx) > Math.abs(dy)) {
    points.push(from);
    points.push({ x: to.x, y: from.y });
    points.push(to);
  } else {
    points.push(from);
    points.push({ x: from.x, y: to.y });
    points.push(to);
  }

  // Simplify: remove collinear points
  return simplifyRoute(points);
}

export function bezierRoute(
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const steps = 20;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const controlOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * (from.x + controlOffset) + t * t * to.x;
    const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * from.y + t * t * to.y;
    points.push({ x, y });
  }

  return points;
}

function simplifyRoute(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  const simplified: { x: number; y: number }[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const next = points[i + 1];
    const curr = points[i];

    // Check if points are collinear
    const isCollinear =
      Math.abs((curr.y - prev.y) * (next.x - curr.x) - (curr.x - prev.x) * (next.y - curr.y)) < 1;

    if (!isCollinear) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

// === WIRE COLLISION DETECTION ===

export function checkWireCollision(
  wire1: { x: number; y: number }[],
  wire2: { x: number; y: number }[],
  threshold: number = 5
): boolean {
  for (let i = 0; i < wire1.length - 1; i++) {
    for (let j = 0; j < wire2.length - 1; j++) {
      if (segmentDistance(wire1[i], wire1[i + 1], wire2[j], wire2[j + 1]) < threshold) {
        return true;
      }
    }
  }
  return false;
}

function segmentDistance(
  a1: { x: number; y: number },
  a2: { x: number; y: number },
  b1: { x: number; y: number },
  b2: { x: number; y: number }
): number {
  // Simplified distance check
  const d1 = pointToSegmentDistance(a1, b1, b2);
  const d2 = pointToSegmentDistance(a2, b1, b2);
  const d3 = pointToSegmentDistance(b1, a1, a2);
  const d4 = pointToSegmentDistance(b2, a1, a2);
  return Math.min(d1, d2, d3, d4);
}

function pointToSegmentDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * dx;
  const projY = a.y + t * dy;

  return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
}

// === JUNCTION DETECTION ===

export function findJunctions(
  wires: Wire[],
  components: CircuitComponent[]
): { x: number; y: number; wireIds: string[] }[] {
  const junctions: { x: number; y: number; wireIds: string[] }[] = [];

  // Find wires that share a component
  const wireGroups = new Map<string, string[]>();
  wires.forEach(wire => {
    const key1 = wire.fromComponentId;
    const key2 = wire.toComponentId;
    if (!wireGroups.has(key1)) wireGroups.set(key1, []);
    if (!wireGroups.has(key2)) wireGroups.set(key2, []);
    wireGroups.get(key1)!.push(wire.id);
    wireGroups.get(key2)!.push(wire.id);
  });

  // Find components with 3+ wires (junctions)
  wireGroups.forEach((wireIds, compId) => {
    if (wireIds.length >= 3) {
      const comp = components.find(c => c.id === compId);
      if (comp) {
        junctions.push({
          x: comp.x + 10,
          y: comp.y + 10,
          wireIds,
        });
      }
    }
  });

  return junctions;
}

// === WIRE DELETION ===

export function findWireAtPoint(
  x: number,
  y: number,
  wires: Wire[],
  components: CircuitComponent[],
  threshold: number = 8
): Wire | null {
  for (const wire of wires) {
    const fromComp = components.find(c => c.id === wire.fromComponentId);
    const toComp = components.find(c => c.id === wire.toComponentId);
    if (!fromComp || !toComp) continue;

    const route = manhattanRoute(
      { x: fromComp.x + 10, y: fromComp.y + 10 },
      { x: toComp.x + 10, y: toComp.y + 10 }
    );

    for (let i = 0; i < route.length - 1; i++) {
      const dist = pointToSegmentDistance(
        { x, y },
        route[i],
        route[i + 1]
      );
      if (dist < threshold) return wire;
    }
  }
  return null;
}

// === WIRE PROPERTIES ===

export function getWireLength(
  wire: Wire,
  components: CircuitComponent[]
): number {
  const fromComp = components.find(c => c.id === wire.fromComponentId);
  const toComp = components.find(c => c.id === wire.toComponentId);
  if (!fromComp || !toComp) return 0;

  const route = manhattanRoute(
    { x: fromComp.x + 10, y: fromComp.y + 10 },
    { x: toComp.x + 10, y: toComp.y + 10 }
  );

  let length = 0;
  for (let i = 1; i < route.length; i++) {
    const dx = route[i].x - route[i - 1].x;
    const dy = route[i].y - route[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

export function getWireResistance(
  wire: Wire,
  components: CircuitComponent[],
  gauge: number = 22
): number {
  const length = getWireLength(wire, components);
  const resistancePerMeter = gaugeToResistance(gauge);
  return (length / 100) * resistancePerMeter; // Convert px to meters (approx)
}

function gaugeToResistance(gauge: number): number {
  // Resistance per meter for copper wire (approximate)
  const resistances: Record<number, number> = {
    20: 0.033, 22: 0.053, 24: 0.084, 26: 0.133, 28: 0.21,
  };
  return resistances[gauge] || 0.053;
}

// === AUTO-ROUTING (A* SHORTEST PATH) ===

interface AStarNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

function heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function autoRoute(
  from: { x: number; y: number },
  to: { x: number; y: number },
  existingWires: { x: number; y: number }[][] = [],
  gridSize: number = 10,
  obstacleRadius: number = 5
): { x: number; y: number }[] {
  const openSet: AStarNode[] = [];
  const closedSet = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;

  const startNode: AStarNode = {
    x: from.x, y: from.y,
    g: 0, h: heuristic(from, to),
    f: heuristic(from, to), parent: null,
  };
  openSet.push(startNode);

  const dirs = [
    { dx: gridSize, dy: 0 },
    { dx: -gridSize, dy: 0 },
    { dx: 0, dy: gridSize },
    { dx: 0, dy: -gridSize },
  ];

  const isObstacle = (x: number, y: number): boolean => {
    for (const wire of existingWires) {
      for (const pt of wire) {
        if (Math.abs(pt.x - x) < obstacleRadius && Math.abs(pt.y - y) < obstacleRadius) {
          return true;
        }
      }
    }
    return false;
  };

  let iterations = 0;
  const maxIterations = 5000;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const currentKey = key(current.x, current.y);

    if (Math.abs(current.x - to.x) < gridSize && Math.abs(current.y - to.y) < gridSize) {
      const path: { x: number; y: number }[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return simplifyRoute(path);
    }

    closedSet.add(currentKey);

    for (const dir of dirs) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const nKey = key(nx, ny);

      if (closedSet.has(nKey)) continue;
      if (isObstacle(nx, ny)) continue;

      const g = current.g + gridSize;
      const h = heuristic({ x: nx, y: ny }, to);
      const f = g + h;

      const existing = openSet.find(n => n.x === nx && n.y === ny);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
      } else {
        openSet.push({ x: nx, y: ny, g, h, f, parent: current });
      }
    }
  }

  return manhattanRoute(from, to, existingWires);
}

// === JUNCTION RENDERING ===

export interface JunctionRenderData {
  x: number;
  y: number;
  radius: number;
  wireCount: number;
}

export function getJunctionRenderData(
  junctions: { x: number; y: number; wireIds: string[] }[]
): JunctionRenderData[] {
  return junctions.map(j => ({
    x: j.x,
    y: j.y,
    radius: 3 + Math.min(j.wireIds.length, 5),
    wireCount: j.wireIds.length,
  }));
}
