export type EventKey = string | number;

export default class EventEmitter {

  static defaultMaxListeners: number = 10;

  private _events: any;
  private _maxListeners: number;

  constructor() {
    this._events = {};
    this._maxListeners = EventEmitter.defaultMaxListeners;
  }

  addListener(event: EventKey, listener: Function): EventEmitter {

    event = this._resolveEventKey(event);
    var listeners: Function[] = this._events[event];
    if (listeners === undefined) {
      listeners = [];
      this._events[event] = listeners;
    }

    if (listeners.indexOf(listener) >= 0) {
      // we don't add duplicates.
      return;
    }

    if (listeners.length >= this._maxListeners) {
      throw new Error("Max listeners exceeded for event: " + event);
    }

    listeners.push(listener);
    return this;
  }


  on(event: EventKey, listener: Function): EventEmitter {
    return this.addListener(event, listener);
  }

  once(event: EventKey, listener: Function): EventEmitter {
    var self: EventEmitter = this;
    var wrapper: Function = function (): void {
      self.removeListener(event, wrapper);
      listener();
    };
    return this.addListener(event, wrapper);
  }

  removeAllListenersForAllEvents(): EventEmitter {
    this._events = {};
    return this;
  }

  removeAllListeners(event: EventKey): EventEmitter {
    event = this._resolveEventKey(event);
    delete this._events[event];
    return this;
  }

  removeListener(event: EventKey, listener: Function): EventEmitter {
    event = this._resolveEventKey(event);
    var listeners: Function[] = this.listeners(event);
    var index: number = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    return this;
  }

  off(event: EventKey, listener: Function): EventEmitter {
    return this.removeListener(event, listener);
  }

  listeners(event: EventKey): Function[] {
    event = this._resolveEventKey(event);
    return this._events[event] || [];
  }

  listenerCount(event: EventKey): number {
    event = this._resolveEventKey(event);
    return this.listeners(event).length;
  }

  getMaxListeners(): number {
    return this._maxListeners;
  }

  setMaxListeners(n: number): void {
    this._maxListeners = n;
  }

  emit(event: EventKey, ...args: any[]): EventEmitter {
    event = this._resolveEventKey(event);
    var listeners: Function[] = this.listeners(event);
    listeners.forEach(function (listener: Function): void {
      listener.apply(this, args || []);
    });
    return this;
  }

  private _resolveEventKey(event: EventKey): EventKey {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else if ((<number>event) >= 0) {
      return event;
    } else {
      throw new Error("Event numbers must be >= 0");
    }
  }
}
