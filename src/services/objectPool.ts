export class ObjectPool<T> {
  private factory: () => T;
  private reset: (obj: T) => void;
  private pool: T[] = [];
  private activeCount = 0;
  private peakCount = 0;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 0, maxSize: number = 1000) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire(): T {
    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
    }
    this.activeCount++;
    if (this.activeCount > this.peakCount) {
      this.peakCount = this.activeCount;
    }
    return obj;
  }

  acquireBatch(count: number): T[] {
    const batch: T[] = [];
    for (let i = 0; i < count; i++) {
      batch.push(this.acquire());
    }
    return batch;
  }

  release(obj: T): void {
    this.reset(obj);
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
    this.activeCount--;
  }

  releaseBatch(objs: T[]): void {
    for (const obj of objs) {
      this.release(obj);
    }
  }

  prewarm(count: number): void {
    const toAdd = Math.min(count, this.maxSize - this.pool.length);
    for (let i = 0; i < toAdd; i++) {
      this.pool.push(this.factory());
    }
  }

  clear(): void {
    this.pool = [];
    this.activeCount = 0;
  }

  getStats(): { active: number; free: number; peak: number; maxSize: number } {
    return {
      active: this.activeCount,
      free: this.pool.length,
      peak: this.peakCount,
      maxSize: this.maxSize,
    };
  }
}
