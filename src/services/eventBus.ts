
type EventCallback = (data?: any) => void;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter(cb => cb !== callback));
    }
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
