export class InputEngine {
  keys: Set<string> = new Set();
  justPressed: Set<string> = new Set();
  justReleased: Set<string> = new Set();
  buffered: Map<string, number> = new Map();
  bufferWindow: number = 100;
  private prevKeys: Set<string> = new Set();
  private touchState: Map<string, boolean> = new Map();

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.keys.has(e.code)) {
      this.justPressed.add(e.code);
      this.buffered.set(e.code, Date.now());
    }
    this.keys.add(e.code);
    if (e.code === 'Space') e.preventDefault();
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.keys.has(e.code)) {
      this.justReleased.add(e.code);
    }
    this.keys.delete(e.code);
  };

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      
      if (x < w * 0.4) {
        if (y < h * 0.4) { this.setTouchKey('ArrowUp', true); }
        else if (y > h * 0.6) { this.setTouchKey('ArrowDown', true); }
        else { this.setTouchKey('ArrowLeft', true); }
      } else if (x > w * 0.6) {
        this.setTouchKey('KeyX', true);
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.touchState.forEach((v, k) => {
      if (v) this.setTouchKey(k, false);
    });
  };

  private setTouchKey(code: string, pressed: boolean) {
    if (pressed) {
      if (!this.keys.has(code)) {
        this.justPressed.add(code);
        this.buffered.set(code, Date.now());
      }
      this.keys.add(code);
      this.touchState.set(code, true);
    } else {
      if (this.keys.has(code)) {
        this.justReleased.add(code);
      }
      this.keys.delete(code);
      this.touchState.delete(code);
    }
  }

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  update() {
    this.justPressed.clear();
    this.justReleased.clear();
    const now = Date.now();
    this.buffered.forEach((time, key) => {
      if (now - time > this.bufferWindow) {
        this.buffered.delete(key);
      }
    });
  }

  isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  isJustPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  wasJustPressed(code: string): boolean {
    const time = this.buffered.get(code);
    if (time && Date.now() - time <= this.bufferWindow) {
      this.buffered.delete(code);
      return true;
    }
    return false;
  }

  addTouchListeners(element: HTMLElement) {
    element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }

  removeTouchListeners(element: HTMLElement) {
    element.removeEventListener('touchstart', this.handleTouchStart);
    element.removeEventListener('touchend', this.handleTouchEnd);
    element.removeEventListener('touchcancel', this.handleTouchEnd);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
