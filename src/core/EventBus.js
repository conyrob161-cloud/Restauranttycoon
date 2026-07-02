export default class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const bucket = this.listeners.get(event);
    if (bucket) {
      bucket.delete(handler);
    }
  }

  emit(event, payload = {}) {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    for (const handler of bucket) {
      handler(payload);
    }
  }
}
