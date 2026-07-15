export class LazyLoader<T> {
  private factory: () => Promise<T>;
  private instance: T | null = null;
  private loading: Promise<T> | null = null;

  constructor(factory: () => Promise<T>) {
    this.factory = factory;
  }

  async load(): Promise<T> {
    if (this.instance !== null) return this.instance;
    if (this.loading !== null) return this.loading;

    this.loading = this.factory();
    try {
      this.instance = await this.loading;
      return this.instance;
    } finally {
      this.loading = null;
    }
  }

  isLoaded(): boolean {
    return this.instance !== null;
  }

  get(): T | null {
    return this.instance;
  }
}

export function lazyLoad<T>(factory: () => Promise<T>): LazyLoader<T> {
  return new LazyLoader(factory);
}
