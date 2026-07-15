// ============================================================
// PCB Design Tool v1.0
// Auto-routing, Gerber generation, 2D PCB preview,
// component placement optimization, design rule checking
// ============================================================

// === INTERFACES ===

export interface PCBPoint {
  x: number;
  y: number;
}

export interface PCBTrace {
  id: string;
  start: PCBPoint;
  end: PCBPoint;
  width: number;
  layer: 'top' | 'bottom' | 'inner';
  net: string;
  segments: PCBPoint[];
}

export interface PCBVia {
  id: string;
  position: PCBPoint;
  net: string;
  diameter: number;
  hole: number;
}

export interface PCBComponent {
  id: string;
  footprint: string;
  position: PCBPoint;
  rotation: number;
  layer: 'top' | 'bottom';
  pins: { id: number; offset: PCBPoint }[];
  name: string;
  value: string;
}

export interface PCBPad {
  id: string;
  componentId: string;
  pinId: number;
  position: PCBPoint;
  size: number;
  net: string;
  type: 'smd' | 'thruhole' | 'via';
}

export interface PCBNet {
  name: string;
  pads: string[];
  traces: string[];
}

export interface DesignRules {
  minTraceWidth: number;
  minClearance: number;
  minViaDrill: number;
  minViaDiameter: number;
  minAnnularRing: number;
  maxTraceLength: number;
  minHoleSize: number;
}

export interface DRCViolation {
  id: string;
  type: 'clearance' | 'trace_width' | 'via_size' | 'unconnected' | 'short' | 'annular_ring';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location: PCBPoint;
  trace1?: string;
  trace2?: string;
}

export interface PCBBoard {
  width: number;
  height: number;
  layers: number;
  components: PCBComponent[];
  traces: PCBTrace[];
  vias: PCBVia[];
  pads: PCBPad[];
  nets: PCBNet[];
  rules: DesignRules;
}

export interface GerberLayer {
  name: string;
  code: string;
  data: string;
}

export interface GerberFile {
  layers: GerberLayer[];
  drillFile: string;
  boardOutline: string;
  fileName: string;
}

export interface PlacementResult {
  components: PCBComponent[];
  totalArea: number;
  boundingBox: { width: number; height: number };
  utilization: number;
}

export interface RoutingResult {
  traces: PCBTrace[];
  vias: PCBVia[];
  unroutedNets: string[];
  totalLength: number;
  viasUsed: number;
}

// === DEFAULT DESIGN RULES ===

export const DEFAULT_RULES: DesignRules = {
  minTraceWidth: 0.2,
  minClearance: 0.2,
  minViaDrill: 0.3,
  minViaDiameter: 0.6,
  minAnnularRing: 0.15,
  maxTraceLength: 100,
  minHoleSize: 0.3,
};

// === PCB DESIGNER ===

export class PCBDesigner {
  private board: PCBBoard;
  private drcViolations: DRCViolation[] = [];
  private idCounter = 0;

  constructor(
    width: number = 100,
    height: number = 80,
    layers: number = 2,
    rules?: Partial<DesignRules>
  ) {
    this.board = {
      width,
      height,
      layers,
      components: [],
      traces: [],
      vias: [],
      pads: [],
      nets: [],
      rules: { ...DEFAULT_RULES, ...rules },
    };
  }

  // === COMPONENT MANAGEMENT ===

  addComponent(
    footprint: string,
    position: PCBPoint,
    rotation: number,
    layer: 'top' | 'bottom',
    pins: { id: number; offset: PCBPoint }[],
    name: string,
    value: string
  ): PCBComponent {
    const component: PCBComponent = {
      id: `comp_${this.idCounter++}`,
      footprint,
      position,
      rotation,
      layer,
      pins,
      name,
      value,
    };
    this.board.components.push(component);
    this.generatePadsForComponent(component);
    return component;
  }

  removeComponent(id: string): boolean {
    const idx = this.board.components.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.board.components.splice(idx, 1);
    this.board.pads = this.board.pads.filter(p => p.componentId !== id);
    return true;
  }

  moveComponent(id: string, position: PCBPoint): boolean {
    const comp = this.board.components.find(c => c.id === id);
    if (!comp) return false;
    comp.position = position;
    this.updatePadsForComponent(comp);
    return true;
  }

  rotateComponent(id: string, rotation: number): boolean {
    const comp = this.board.components.find(c => c.id === id);
    if (!comp) return false;
    comp.rotation = rotation;
    this.updatePadsForComponent(comp);
    return true;
  }

  private generatePadsForComponent(comp: PCBComponent): void {
    comp.pins.forEach(pin => {
      const rad = (comp.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = comp.position.x + pin.offset.x * cos - pin.offset.y * sin;
      const y = comp.position.y + pin.offset.x * sin + pin.offset.y * cos;

      this.board.pads.push({
        id: `pad_${comp.id}_${pin.id}`,
        componentId: comp.id,
        pinId: pin.id,
        position: { x, y },
        size: 1.0,
        net: '',
        type: comp.footprint.includes('SMD') ? 'smd' : 'thruhole',
      });
    });
  }

  private updatePadsForComponent(comp: PCBComponent): void {
    this.board.pads = this.board.pads.filter(p => p.componentId !== comp.id);
    this.generatePadsForComponent(comp);
  }

  // === NET MANAGEMENT ===

  createNet(name: string): PCBNet {
    const net: PCBNet = { name, pads: [], traces: [] };
    this.board.nets.push(net);
    return net;
  }

  connectPads(padId1: string, padId2: string, netName: string): void {
    let net = this.board.nets.find(n => n.name === netName);
    if (!net) net = this.createNet(netName);

    const pad1 = this.board.pads.find(p => p.id === padId1);
    const pad2 = this.board.pads.find(p => p.id === padId2);
    if (pad1) { pad1.net = netName; net.pads.push(padId1); }
    if (pad2) { pad2.net = netName; net.pads.push(padId2); }
  }

  // === AUTO-ROUTING ===

  autoRoute(): RoutingResult {
    const unroutedNets: string[] = [];
    const allTraces: PCBTrace[] = [];
    const allVias: PCBVia[] = [];
    let totalLength = 0;

    for (const net of this.board.nets) {
      if (net.pads.length < 2) continue;

      const pads = net.pads
        .map(id => this.board.pads.find(p => p.id === id))
        .filter(Boolean) as PCBPad[];

      if (pads.length < 2) {
        unroutedNets.push(net.name);
        continue;
      }

      // MST-based routing: connect all pads in the net
      const routed = this.routeNet(net.name, pads);
      allTraces.push(...routed.traces);
      allVias.push(...routed.vias);
      totalLength += routed.length;

      if (routed.unrouted) {
        unroutedNets.push(net.name);
      }
    }

    this.board.traces.push(...allTraces);
    this.board.vias.push(...allVias);

    return {
      traces: allTraces,
      vias: allVias,
      unroutedNets,
      totalLength,
      viasUsed: allVias.length,
    };
  }

  private routeNet(
    netName: string,
    pads: PCBPad[]
  ): { traces: PCBTrace[]; vias: PCBVia[]; length: number; unrouted: boolean } {
    const traces: PCBTrace[] = [];
    const vias: PCBVia[] = [];
    let totalLength = 0;
    let needsVia = false;

    // Check if we need to switch layers
    const layers = new Set(pads.map(p => {
      const comp = this.board.components.find(c => c.id === p.componentId);
      return comp?.layer || 'top';
    }));

    if (layers.size > 1 && this.board.layers > 1) {
      needsVia = true;
    }

    // Route using simple nearest-neighbor MST
    const remaining = [...pads];
    const connected: PCBPad[] = [remaining.shift()!];

    while (remaining.length > 0) {
      let bestDist = Infinity;
      let bestRemaining = 0;
      let bestConnected = 0;

      for (let r = 0; r < remaining.length; r++) {
        for (let c = 0; c < connected.length; c++) {
          const dist = this.distance(remaining[r].position, connected[c].position);
          if (dist < bestDist) {
            bestDist = dist;
            bestRemaining = r;
            bestConnected = c;
          }
        }
      }

      const from = connected[bestConnected];
      const to = remaining[bestRemaining];

      const segments = this.calculateRoutePath(from.position, to.position);
      const trace: PCBTrace = {
        id: `trace_${this.idCounter++}`,
        start: from.position,
        end: to.position,
        width: this.board.rules.minTraceWidth,
        layer: 'top',
        net: netName,
        segments,
      };

      traces.push(trace);
      totalLength += this.calculateTraceLength(segments);

      // Add via if layer switching needed
      if (needsVia && from.net !== to.net) {
        const via: PCBVia = {
          id: `via_${this.idCounter++}`,
          position: {
            x: (from.position.x + to.position.x) / 2,
            y: (from.position.y + to.position.y) / 2,
          },
          net: netName,
          diameter: this.board.rules.minViaDiameter,
          hole: this.board.rules.minViaDrill,
        };
        vias.push(via);
      }

      connected.push(to);
      remaining.splice(bestRemaining, 1);
    }

    return { traces, vias, length: totalLength, unrouted: false };
  }

  private calculateRoutePath(from: PCBPoint, to: PCBPoint): PCBPoint[] {
    // Manhattan routing with L-shaped paths
    const midX = from.x;
    const midY = to.y;

    if (Math.abs(from.x - to.x) < 0.01 || Math.abs(from.y - to.y) < 0.01) {
      return [from, to]; // Straight line
    }

    return [from, { x: midX, y: midY }, to];
  }

  // === COMPONENT PLACEMENT OPTIMIZATION ===

  optimizePlacement(): PlacementResult {
    const components = [...this.board.components];
    if (components.length === 0) {
      return { components: [], totalArea: 0, boundingBox: { width: 0, height: 0 }, utilization: 0 };
    }

    // Simulated annealing placement optimization
    let bestArrangement = [...components];
    let bestCost = this.calculatePlacementCost(bestArrangement);

    let temperature = 100;
    const coolingRate = 0.95;
    const minTemp = 0.1;

    while (temperature > minTemp) {
      // Try random swap
      const i = Math.floor(Math.random() * components.length);
      const j = Math.floor(Math.random() * components.length);

      if (i === j) continue;

      // Swap positions
      const tempPos = bestArrangement[i].position;
      bestArrangement[i] = { ...bestArrangement[i], position: bestArrangement[j].position };
      bestArrangement[j] = { ...bestArrangement[j], position: tempPos };

      const newCost = this.calculatePlacementCost(bestArrangement);

      if (newCost < bestCost || Math.random() < Math.exp((bestCost - newCost) / temperature)) {
        bestCost = newCost;
      } else {
        // Revert swap
        bestArrangement[j] = { ...bestArrangement[j], position: bestArrangement[i].position };
        bestArrangement[i] = { ...bestArrangement[i], position: tempPos };
      }

      temperature *= coolingRate;
    }

    // Apply best arrangement
    bestArrangement.forEach((comp, idx) => {
      this.board.components[idx].position = comp.position;
    });

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.board.components.forEach(c => {
      minX = Math.min(minX, c.position.x);
      minY = Math.min(minY, c.position.y);
      maxX = Math.max(maxX, c.position.x);
      maxY = Math.max(maxY, c.position.y);
    });

    const bboxWidth = maxX - minX + 10;
    const bboxHeight = maxY - minY + 10;
    const boardArea = this.board.width * this.board.height;
    const compArea = this.board.components.length * 4; // Approximate component area

    return {
      components: [...this.board.components],
      totalArea: compArea,
      boundingBox: { width: bboxWidth, height: bboxHeight },
      utilization: (compArea / boardArea) * 100,
    };
  }

  private calculatePlacementCost(components: PCBComponent[]): number {
    let cost = 0;

    // Penalize components outside board bounds
    components.forEach(c => {
      if (c.position.x < 0 || c.position.x > this.board.width) cost += 100;
      if (c.position.y < 0 || c.position.y > this.board.height) cost += 100;
    });

    // Penalize overlapping components
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const dist = this.distance(components[i].position, components[j].position);
        if (dist < 3) cost += (3 - dist) * 50;
      }
    }

    // Reward compact placement
    let cx = 0, cy = 0;
    components.forEach(c => { cx += c.position.x; cy += c.position.y; });
    cx /= components.length;
    cy /= components.length;
    components.forEach(c => {
      cost += this.distance(c.position, { x: cx, y: cy }) * 0.5;
    });

    return cost;
  }

  // === DESIGN RULE CHECKING ===

  runDRC(): DRCViolation[] {
    this.drcViolations = [];

    this.checkTraceWidths();
    this.checkClearances();
    this.checkViaSizes();
    this.checkUnconnectedNets();
    this.checkAnnularRings();

    return [...this.drcViolations];
  }

  private checkTraceWidths(): void {
    this.board.traces.forEach(trace => {
      if (trace.width < this.board.rules.minTraceWidth) {
        this.drcViolations.push({
          id: `drc_${this.idCounter++}`,
          type: 'trace_width',
          severity: 'error',
          message: `Trace ${trace.id} width ${trace.width}mm < min ${this.board.rules.minTraceWidth}mm`,
          location: trace.start,
          trace1: trace.id,
        });
      }
    });
  }

  private checkClearances(): void {
    for (let i = 0; i < this.board.traces.length; i++) {
      for (let j = i + 1; j < this.board.traces.length; j++) {
        const t1 = this.board.traces[i];
        const t2 = this.board.traces[j];

        if (t1.net === t2.net) continue;

        const dist = this.segmentDistance(t1.segments, t2.segments);
        if (dist < this.board.rules.minClearance) {
          this.drcViolations.push({
            id: `drc_${this.idCounter++}`,
            type: 'clearance',
            severity: 'error',
            message: `Clearance violation: ${dist.toFixed(3)}mm < min ${this.board.rules.minClearance}mm`,
            location: t1.start,
            trace1: t1.id,
            trace2: t2.id,
          });
        }
      }
    }
  }

  private checkViaSizes(): void {
    this.board.vias.forEach(via => {
      if (via.diameter < this.board.rules.minViaDiameter) {
        this.drcViolations.push({
          id: `drc_${this.idCounter++}`,
          type: 'via_size',
          severity: 'error',
          message: `Via ${via.id} diameter ${via.diameter}mm < min ${this.board.rules.minViaDiameter}mm`,
          location: via.position,
        });
      }
      if (via.hole < this.board.rules.minViaDrill) {
        this.drcViolations.push({
          id: `drc_${this.idCounter++}`,
          type: 'via_size',
          severity: 'error',
          message: `Via ${via.id} drill ${via.hole}mm < min ${this.board.rules.minViaDrill}mm`,
          location: via.position,
        });
      }
    });
  }

  private checkUnconnectedNets(): void {
    this.board.nets.forEach(net => {
      const connectedPads = net.pads.filter(padId => {
        return this.board.traces.some(t => t.net === net.name);
      });

      if (connectedPads.length < net.pads.length) {
        const pad = this.board.pads.find(p => p.id === net.pads[0]);
        if (pad) {
          this.drcViolations.push({
            id: `drc_${this.idCounter++}`,
            type: 'unconnected',
            severity: 'warning',
            message: `Net "${net.name}" has ${net.pads.length - connectedPads.length} unconnected pad(s)`,
            location: pad.position,
          });
        }
      }
    });
  }

  private checkAnnularRings(): void {
    this.board.vias.forEach(via => {
      const annularRing = (via.diameter - via.hole) / 2;
      if (annularRing < this.board.rules.minAnnularRing) {
        this.drcViolations.push({
          id: `drc_${this.idCounter++}`,
          type: 'annular_ring',
          severity: 'warning',
          message: `Via ${via.id} annular ring ${annularRing.toFixed(3)}mm < min ${this.board.rules.minAnnularRing}mm`,
          location: via.position,
        });
      }
    });
  }

  // === GERBER FILE GENERATION ===

  generateGerber(): GerberFile {
    const layers: GerberLayer[] = [];

    // Front copper layer (F.Cu)
    layers.push(this.generateCopperLayer('F.Cu', 'top'));

    // Back copper layer (B.Cu)
    if (this.board.layers > 1) {
      layers.push(this.generateCopperLayer('B.Cu', 'bottom'));
    }

    // Front silkscreen (F.SilkS)
    layers.push(this.generateSilkscreenLayer('F.SilkS', 'top'));

    // Front solder mask (F.Mask)
    layers.push(this.generateMaskLayer('F.Mask'));

    // Back solder mask (B.Mask)
    if (this.board.layers > 1) {
      layers.push(this.generateMaskLayer('B.Mask'));
    }

    // Drill file
    const drillFile = this.generateDrillFile();

    // Board outline
    const boardOutline = this.generateBoardOutline();

    return {
      layers,
      drillFile,
      boardOutline,
      fileName: 'kidcode_pcb',
    };
  }

  private generateCopperLayer(name: string, layer: 'top' | 'bottom'): GerberLayer {
    const lines: string[] = [];
    lines.push(`G04 ${name} - Generated by KidCode PCB Designer`);
    lines.push('%FSLAX46Y46*%');
    lines.push('%MOIN*%');
    lines.push('M02*');

    const traces = this.board.traces.filter(t => t.layer === layer);
    traces.forEach(trace => {
      trace.segments.forEach((seg, idx) => {
        if (idx === 0) {
          lines.push(`D10*`);
          lines.push(`X${this.formatCoord(seg.x)}Y${this.formatCoord(seg.y)}D02*`);
        } else {
          lines.push(`X${this.formatCoord(seg.x)}Y${this.formatCoord(seg.y)}D01*`);
        }
      });
    });

    return { name, code: 'Copper', data: lines.join('\n') };
  }

  private generateSilkscreenLayer(name: string, layer: 'top' | 'bottom'): GerberLayer {
    const lines: string[] = [];
    lines.push(`G04 ${name} - Generated by KidCode PCB Designer`);
    lines.push('%FSLAX46Y46*%');

    const components = this.board.components.filter(c => c.layer === layer);
    components.forEach(comp => {
      lines.push(`G04 Component: ${comp.name}`);
      lines.push(`X${this.formatCoord(comp.position.x)}Y${this.formatCoord(comp.position.y)}D02*`);
    });

    lines.push('M02*');
    return { name, code: 'Silkscreen', data: lines.join('\n') };
  }

  private generateMaskLayer(name: string): GerberLayer {
    const lines: string[] = [];
    lines.push(`G04 ${name} - Generated by KidCode PCB Designer`);
    lines.push('%FSLAX46Y46*%');

    this.board.pads.forEach(pad => {
      const expansion = 0.1;
      const size = pad.size + expansion * 2;
      lines.push(`X${this.formatCoord(pad.position.x - size / 2)}Y${this.formatCoord(pad.position.y - size / 2)}D02*`);
      lines.push(`X${this.formatCoord(pad.position.x + size / 2)}Y${this.formatCoord(pad.position.y + size / 2)}D01*`);
    });

    lines.push('M02*');
    return { name, code: 'Mask', data: lines.join('\n') };
  }

  private generateDrillFile(): string {
    const lines: string[] = [];
    lines.push('M48');
    lines.push('; Drill file generated by KidCode PCB Designer');
    lines.push('FMAT,2');
    lines.push('METRIC,TZ');

    this.board.vias.forEach(via => {
      lines.push(`T${this.board.vias.indexOf(via) + 1}C${via.hole}`);
    });

    lines.push('%');
    this.board.vias.forEach((via, idx) => {
      lines.push(`T${idx + 1}`);
      lines.push(`X${this.formatCoord(via.position.x)}Y${this.formatCoord(via.position.y)}`);
    });

    lines.push('T0');
    lines.push('M30');
    return lines.join('\n');
  }

  private generateBoardOutline(): string {
    const lines: string[] = [];
    lines.push('G04 Board Outline');
    lines.push('%FSLAX46Y46*%');
    lines.push('D11*');

    // Rectangle outline
    const margin = 2;
    lines.push(`X${this.formatCoord(margin)}Y${this.formatCoord(margin)}D02*`);
    lines.push(`X${this.formatCoord(this.board.width - margin)}Y${this.formatCoord(margin)}D01*`);
    lines.push(`X${this.formatCoord(this.board.width - margin)}Y${this.formatCoord(this.board.height - margin)}D01*`);
    lines.push(`X${this.formatCoord(margin)}Y${this.formatCoord(this.board.height - margin)}D01*`);
    lines.push(`X${this.formatCoord(margin)}Y${this.formatCoord(margin)}D01*`);

    lines.push('M02*');
    return lines.join('\n');
  }

  private formatCoord(value: number): string {
    return Math.round(value * 1000).toString().padStart(6, '0');
  }

  // === 2D PCB PREVIEW ===

  generatePreview(): {
    boardOutline: PCBPoint[];
    components: { id: string; position: PCBPoint; size: number; label: string; layer: string }[];
    traces: { start: PCBPoint; end: PCBPoint; color: string; width: number }[];
    vias: { position: PCBPoint; radius: number }[];
    dimensions: { width: number; height: number };
  } {
    const margin = 2;
    const boardOutline: PCBPoint[] = [
      { x: margin, y: margin },
      { x: this.board.width - margin, y: margin },
      { x: this.board.width - margin, y: this.board.height - margin },
      { x: margin, y: this.board.height - margin },
      { x: margin, y: margin },
    ];

    const components = this.board.components.map(c => ({
      id: c.id,
      position: c.position,
      size: 3,
      label: c.name,
      layer: c.layer,
    }));

    const traces = this.board.traces.map(t => ({
      start: t.start,
      end: t.end,
      color: t.layer === 'top' ? '#cc0000' : '#0000cc',
      width: t.width,
    }));

    const vias = this.board.vias.map(v => ({
      position: v.position,
      radius: v.diameter / 2,
    }));

    return {
      boardOutline,
      components,
      traces,
      vias,
      dimensions: { width: this.board.width, height: this.board.height },
    };
  }

  // === UTILITY ===

  private distance(a: PCBPoint, b: PCBPoint): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private segmentDistance(seg1: PCBPoint[], seg2: PCBPoint[]): number {
    let minDist = Infinity;
    for (let i = 0; i < seg1.length - 1; i++) {
      for (let j = 0; j < seg2.length - 1; j++) {
        const d = this.pointToSegmentDistance(seg1[i], seg1[i + 1], seg2[j], seg2[j + 1]);
        minDist = Math.min(minDist, d);
      }
    }
    return minDist;
  }

  private pointToSegmentDistance(
    a: PCBPoint, b: PCBPoint,
    c: PCBPoint, d: PCBPoint
  ): number {
    const dx1 = b.x - a.x;
    const dy1 = b.y - a.y;
    const dx2 = d.x - c.x;
    const dy2 = d.y - c.y;

    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < 0.0001) {
      return this.distance(a, c);
    }

    const t = ((c.x - a.x) * dy2 - (c.y - a.y) * dx2) / denom;
    const u = ((c.x - a.x) * dy1 - (c.y - a.y) * dx1) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const px = a.x + t * dx1;
      const py = a.y + t * dy1;
      return this.distance({ x: px, y: py }, c);
    }

    return Math.min(
      this.distance(a, c),
      this.distance(a, d),
      this.distance(b, c),
      this.distance(b, d)
    );
  }

  private calculateTraceLength(segments: PCBPoint[]): number {
    let length = 0;
    for (let i = 0; i < segments.length - 1; i++) {
      length += this.distance(segments[i], segments[i + 1]);
    }
    return length;
  }

  getBoard(): PCBBoard {
    return { ...this.board };
  }

  getDRCViolations(): DRCViolation[] {
    return [...this.drcViolations];
  }
}

// === HELPER FUNCTIONS ===

export function createDefaultFootprint(
  type: 'resistor' | 'capacitor' | 'ic' | 'led' | 'connector',
  pins: number
): { id: number; offset: PCBPoint }[] {
  const footprints: Record<string, { id: number; offset: PCBPoint }[]> = {
    resistor: [
      { id: 1, offset: { x: -2, y: 0 } },
      { id: 2, offset: { x: 2, y: 0 } },
    ],
    capacitor: [
      { id: 1, offset: { x: -1.5, y: 0 } },
      { id: 2, offset: { x: 1.5, y: 0 } },
    ],
    led: [
      { id: 1, offset: { x: -1, y: 0 } },
      { id: 2, offset: { x: 1, y: 0 } },
    ],
    ic: Array.from({ length: pins }, (_, i) => ({
      id: i + 1,
      offset: {
        x: i < pins / 2 ? -4 : 4,
        y: (i % (pins / 2)) * 2.54 - (pins / 4) * 2.54,
      },
    })),
    connector: Array.from({ length: pins }, (_, i) => ({
      id: i + 1,
      offset: { x: 0, y: i * 2.54 },
    })),
  };

  return footprints[type] || footprints.resistor;
}

export function exportToSVG(preview: ReturnType<PCBDesigner['generatePreview']>): string {
  const scale = 3;
  const width = preview.dimensions.width * scale + 40;
  const height = preview.dimensions.height * scale + 40;
  const offsetX = 20;
  const offsetY = 20;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  svg += `<rect width="${width}" height="${height}" fill="#1a1a2e" />`;

  // Board outline
  svg += '<path d="';
  preview.boardOutline.forEach((p, i) => {
    const cmd = i === 0 ? 'M' : 'L';
    svg += `${cmd}${p.x * scale + offsetX},${p.y * scale + offsetY} `;
  });
  svg += '" stroke="#4CAF50" stroke-width="2" fill="none" />';

  // Traces
  preview.traces.forEach(trace => {
    svg += `<line x1="${trace.start.x * scale + offsetX}" y1="${trace.start.y * scale + offsetY}" `;
    svg += `x2="${trace.end.x * scale + offsetX}" y2="${trace.end.y * scale + offsetY}" `;
    svg += `stroke="${trace.color}" stroke-width="${trace.width * scale}" />`;
  });

  // Vias
  preview.vias.forEach(via => {
    svg += `<circle cx="${via.position.x * scale + offsetX}" cy="${via.position.y * scale + offsetY}" `;
    svg += `r="${via.radius * scale}" fill="#FFD700" stroke="#000" stroke-width="0.5" />`;
  });

  // Components
  preview.components.forEach(comp => {
    const color = comp.layer === 'top' ? '#2196F3' : '#9C27B0';
    svg += `<rect x="${(comp.position.x - comp.size / 2) * scale + offsetX}" `;
    svg += `y="${(comp.position.y - comp.size / 2) * scale + offsetY}" `;
    svg += `width="${comp.size * scale}" height="${comp.size * scale}" `;
    svg += `fill="${color}" stroke="#fff" stroke-width="0.5" rx="2" />`;
    svg += `<text x="${comp.position.x * scale + offsetX}" y="${comp.position.y * scale + offsetY + 3}" `;
    svg += `fill="#fff" font-size="6" text-anchor="middle">${comp.label}</text>`;
  });

  svg += '</svg>';
  return svg;
}
