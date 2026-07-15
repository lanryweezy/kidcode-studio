export class CanvasOptimizer {
  private canvas: HTMLCanvasElement;
  private dirtyRegions: { x: number; y: number; w: number; h: number }[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 60;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  markDirty(x: number, y: number, w: number, h: number): void {
    this.dirtyRegions.push({ x, y, w, h });
  }

  isDirty(): boolean {
    return this.dirtyRegions.length > 0;
  }

  clearDirty(): void {
    this.dirtyRegions = [];
  }

  cullingCheck(
    x: number,
    y: number,
    w: number,
    h: number,
    camera: { x: number; y: number; zoom: number }
  ): boolean {
    const viewLeft = camera.x / camera.zoom;
    const viewTop = camera.y / camera.zoom;
    const viewRight = viewLeft + this.canvas.width / camera.zoom;
    const viewBottom = viewTop + this.canvas.height / camera.zoom;

    return (
      x + w > viewLeft &&
      x < viewRight &&
      y + h > viewTop &&
      y < viewBottom
    );
  }

  filterVisible<T extends { x: number; y: number; width?: number; height?: number }>(
    items: T[],
    camera: { x: number; y: number; zoom: number },
    defaultSize: number = 40
  ): T[] {
    return items.filter(item => {
      const w = item.width ?? defaultSize;
      const h = item.height ?? defaultSize;
      return this.cullingCheck(item.x, item.y, w, h, camera);
    });
  }

  updateFPS(): number {
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }

  mergeDirtyRegions(): { x: number; y: number; w: number; h: number } | null {
    if (this.dirtyRegions.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of this.dirtyRegions) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.w);
      maxY = Math.max(maxY, r.y + r.h);
    }

    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  shouldRender(skipProbability: number = 0): boolean {
    return Math.random() > skipProbability;
  }
}
