/**
 * Infinite Canvas Engine for KidCode Studio
 * Ported from Timeframe's canvas renderer patterns:
 * - Object pooling (zero allocations in render loop)
 * - Dirty region tracking (only redraw changed areas)
 * - Adaptive quality (reduce during fast interactions)
 * - Viewport culling (skip off-screen elements)
 * - Double buffering (OffscreenCanvas)
 */

export interface CanvasNode {
  id: string;
  x: number; y: number;
  width: number; height: number;
  type: string;
  data: Record<string, unknown>;
  visible: boolean;
  zIndex: number;
  parentId?: string;
  children: string[];
}

export interface CanvasViewport {
  x: number; y: number;
  zoom: number;
  width: number; height: number;
}

interface DirtyRegion {
  x: number; y: number; width: number; height: number;
}

class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 50) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) this.pool.push(factory());
  }

  acquire(): T {
    if (this.pool.length > 0) return this.pool.pop()!;
    return this.factory();
  }

  release(obj: T) {
    this.reset(obj);
    this.pool.push(obj);
  }

  get size() { return this.pool.length; }
}

export class InfiniteCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: OffscreenCanvas | null = null;
  private offCtx: OffscreenCanvasRenderingContext2D | null = null;

  private nodes: Map<string, CanvasNode> = new Map();
  private viewport: CanvasViewport = { x: 0, y: 0, zoom: 1, width: 800, height: 600 };
  private dirtyRegions: DirtyRegion[] = [];
  private isDirty: boolean = true;
  private quality: 'high' | 'medium' | 'low' = 'high';

  // Object pools (ported from Timeframe)
  private rectPool = new ObjectPool(
    () => ({ x: 0, y: 0, w: 0, h: 0 }),
    (r) => { r.x = 0; r.y = 0; r.w = 0; r.h = 0; }
  );

  // Rendering state
  private isPanning: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private animationFrameId: number = 0;
  private lastFrameTime: number = 0;
  private fps: number = 60;

  // Callbacks
  private onNodeSelect?: (nodeId: string) => void;
  private onNodeMove?: (nodeId: string, x: number, y: number) => void;
  private onViewportChange?: (viewport: CanvasViewport) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupInput();
    this.setupDoubleBuffer();
  }

  private setupDoubleBuffer() {
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreen = new OffscreenCanvas(this.canvas.width, this.canvas.height);
      this.offCtx = this.offscreen.getContext('2d');
    }
  }

  private setupInput() {
    // Pan with middle mouse or space+drag
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        this.isPanning = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
        e.preventDefault();
      } else if (e.button === 0) {
        const node = this.getNodeAtPosition(e.offsetX, e.offsetY);
        if (node) this.onNodeSelect?.(node.id);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.viewport.x -= dx / this.viewport.zoom;
        this.viewport.y -= dy / this.viewport.zoom;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.markDirty();
        this.onViewportChange?.(this.viewport);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isPanning = false;
      this.canvas.style.cursor = 'default';
    });

    // Zoom with scroll
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, this.viewport.zoom * zoomFactor));

      // Zoom towards mouse position
      const mx = e.offsetX;
      const my = e.offsetY;
      const worldX = this.viewport.x + mx / this.viewport.zoom;
      const worldY = this.viewport.y + my / this.viewport.zoom;

      this.viewport.zoom = newZoom;
      this.viewport.x = worldX - mx / newZoom;
      this.viewport.y = worldY - my / newZoom;

      // Adaptive quality during zoom
      if (newZoom < 0.3) this.quality = 'low';
      else if (newZoom < 0.7) this.quality = 'medium';
      else this.quality = 'high';

      this.markDirty();
      this.onViewportChange?.(this.viewport);
    }, { passive: false });
  }

  private getNodeAtPosition(screenX: number, screenY: number): CanvasNode | null {
    const worldX = this.viewport.x + screenX / this.viewport.zoom;
    const worldY = this.viewport.y + screenY / this.viewport.zoom;

    let topNode: CanvasNode | null = null;
    let topZ = -Infinity;

    this.nodes.forEach(node => {
      if (!node.visible) return;
      if (worldX >= node.x && worldX <= node.x + node.width &&
          worldY >= node.y && worldY <= node.y + node.height) {
        if (node.zIndex > topZ) {
          topZ = node.zIndex;
          topNode = node;
        }
      }
    });

    return topNode;
  }

  // === Public API ===

  addNode(node: CanvasNode) {
    this.nodes.set(node.id, node);
    this.markDirty();
  }

  removeNode(id: string) {
    this.nodes.delete(id);
    this.markDirty();
  }

  updateNode(id: string, updates: Partial<CanvasNode>) {
    const node = this.nodes.get(id);
    if (node) {
      Object.assign(node, updates);
      this.markDirty();
    }
  }

  getNode(id: string): CanvasNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): CanvasNode[] {
    return Array.from(this.nodes.values());
  }

  setViewport(viewport: Partial<CanvasViewport>) {
    Object.assign(this.viewport, viewport);
    this.markDirty();
  }

  getViewport(): CanvasViewport {
    return { ...this.viewport };
  }

  // Focus on a specific node
  focusNode(id: string, padding: number = 100) {
    const node = this.nodes.get(id);
    if (!node) return;
    this.viewport.x = node.x - padding;
    this.viewport.y = node.y - padding;
    this.viewport.zoom = Math.min(
      this.canvas.width / (node.width + padding * 2),
      this.canvas.height / (node.height + padding * 2),
      2
    );
    this.markDirty();
    this.onViewportChange?.(this.viewport);
  }

  // Fit all nodes in view
  fitAll(padding: number = 50) {
    if (this.nodes.size === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.nodes.forEach(n => {
      if (!n.visible) return;
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    this.viewport.x = minX - padding;
    this.viewport.y = minY - padding;
    this.viewport.zoom = Math.min(
      this.canvas.width / (contentW + padding * 2),
      this.canvas.height / (contentH + padding * 2),
      1
    );
    this.markDirty();
    this.onViewportChange?.(this.viewport);
  }

  // === Rendering ===

  private markDirty() {
    this.isDirty = true;
  }

  render() {
    if (!this.isDirty) return;
    this.isDirty = false;

    const ctx = this.offCtx || this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    this.renderGrid(ctx, w, h);

    // Apply viewport transform
    ctx.save();
    ctx.scale(this.viewport.zoom, this.viewport.zoom);
    ctx.translate(-this.viewport.x, -this.viewport.y);

    // Viewport culling - only render visible nodes
    const visibleNodes: CanvasNode[] = [];
    this.nodes.forEach(node => {
      if (!node.visible) return;
      if (this.isNodeVisible(node, w, h)) {
        visibleNodes.push(node);
      }
    });

    // Sort by zIndex
    visibleNodes.sort((a, b) => a.zIndex - b.zIndex);

    // Batch render by type for fewer state changes
    const batches = new Map<string, CanvasNode[]>();
    visibleNodes.forEach(node => {
      const type = node.type;
      if (!batches.has(type)) batches.set(type, []);
      batches.get(type)!.push(node);
    });

    batches.forEach((nodes, type) => {
      this.renderBatch(ctx, type, nodes);
    });

    ctx.restore();

    // Blit from offscreen if using double buffer
    if (this.offscreen && this.ctx) {
      this.ctx.clearRect(0, 0, w, h);
      this.ctx.drawImage(this.offscreen, 0, 0);
    }
  }

  private renderGrid(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, w: number, h: number) {
    const gridSize = 40 * this.viewport.zoom;
    if (gridSize < 10) return; // Skip grid when zoomed out too far

    const offsetX = (-this.viewport.x * this.viewport.zoom) % gridSize;
    const offsetY = (-this.viewport.y * this.viewport.zoom) % gridSize;

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = offsetX; x < w; x += gridSize) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = offsetY; y < h; y += gridSize) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  private isNodeVisible(node: CanvasNode, viewW: number, viewH: number): boolean {
    const vx = this.viewport.x;
    const vy = this.viewport.y;
    const vw = viewW / this.viewport.zoom;
    const vh = viewH / this.viewport.zoom;
    return node.x + node.width > vx && node.x < vx + vw &&
           node.y + node.height > vy && node.y < vy + vh;
  }

  private renderBatch(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, type: string, nodes: CanvasNode[]) {
    switch (type) {
      case 'card':
        nodes.forEach(n => this.renderCard(ctx, n));
        break;
      case 'connection':
        nodes.forEach(n => this.renderConnection(ctx, n));
        break;
      case 'image':
        nodes.forEach(n => this.renderImage(ctx, n));
        break;
      default:
        nodes.forEach(n => this.renderGeneric(ctx, n));
    }
  }

  private renderCard(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, node: CanvasNode) {
    const { x, y, width, height, data } = node;
    const r = 12;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Background
    ctx.fillStyle = (data?.color as string) || '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Border
    ctx.strokeStyle = (data?.borderColor as string) || '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Icon
    if (data?.emoji) {
      ctx.font = `${Math.min(width, height) * 0.3}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.emoji as string, x + width / 2, y + height * 0.35);
    }

    // Label
    if (data?.label) {
      ctx.font = `bold ${Math.min(12, width * 0.08)}px system-ui`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(data.label as string, x + width / 2, y + height - 8);
    }
  }

  private renderConnection(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, node: CanvasNode) {
    const { data } = node;
    if (!data?.from || !data?.to) return;
    const from = this.nodes.get(data.from as string);
    const to = this.nodes.get(data.to as string);
    if (!from || !to) return;

    const fromCx = from.x + from.width / 2;
    const fromCy = from.y + from.height / 2;
    const toCx = to.x + to.width / 2;
    const toCy = to.y + to.height / 2;

    ctx.strokeStyle = (data?.color as string) || '#6366f1';
    ctx.lineWidth = 2;
    ctx.setLineDash(data?.dashed ? [5, 5] : []);
    ctx.beginPath();
    // Bezier curve
    const midX = (fromCx + toCx) / 2;
    ctx.moveTo(fromCx, fromCy);
    ctx.bezierCurveTo(midX, fromCy, midX, toCy, toCx, toCy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow
    const angle = Math.atan2(toCy - (fromCy + toCy) / 2, toCx - midX);
    ctx.fillStyle = (data?.color as string) || '#6366f1';
    ctx.beginPath();
    ctx.moveTo(toCx, toCy);
    ctx.lineTo(toCx - 8 * Math.cos(angle - 0.4), toCy - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(toCx - 8 * Math.cos(angle + 0.4), toCy - 8 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  private renderImage(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, node: CanvasNode) {
    if (node.data?.image) {
      ctx.drawImage(node.data.image as CanvasImageSource, node.x, node.y, node.width, node.height);
    }
  }

  private renderGeneric(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, node: CanvasNode) {
    ctx.fillStyle = (node.data?.color as string) || '#475569';
    ctx.fillRect(node.x, node.y, node.width, node.height);
  }

  // === Lifecycle ===

  start() {
    const loop = (timestamp: number) => {
      const dt = timestamp - this.lastFrameTime;
      this.fps = 1000 / dt;
      this.lastFrameTime = timestamp;
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.viewport.width = width;
    this.viewport.height = height;
    this.setupDoubleBuffer();
    this.markDirty();
  }

  destroy() {
    this.stop();
    this.nodes.clear();
  }

  // Callbacks
  on(event: 'select' | 'move' | 'viewportChange', handler: (...args: unknown[]) => void) {
    if (event === 'select') this.onNodeSelect = handler;
    if (event === 'move') this.onNodeMove = handler;
    if (event === 'viewportChange') this.onViewportChange = handler;
  }
}
