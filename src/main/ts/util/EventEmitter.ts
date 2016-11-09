export type EventKey = string | number;

export class EventEmitter {

  public static defaultMaxListeners: number = 100;

  private _events: any;
  private _maxListeners: number;

  constructor() {
    this._events = {};
    this._maxListeners = EventEmitter.defaultMaxListeners;
  }

  public addListener(event: EventKey, listener: Function): EventEmitter {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = this._resolveEventKey(event);
    let listeners: Function[] = this._events[event];
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

  public on(event: EventKey, listener: Function): EventEmitter {
    return this.addListener(event, listener);
  }

  public once(event: EventKey, listener: Function): EventEmitter {
    const self: EventEmitter = this;
    const wrapper: Function = () => {
      self.removeListener(event, wrapper);
      listener();
    };
    return this.addListener(event, wrapper);
  }

  public removeAllListenersForAllEvents(): EventEmitter {
    this._events = {};
    return this;
  }

  public removeAllListeners(event: EventKey): EventEmitter {
    event = this._resolveEventKey(event);
    delete this._events[event];
    return this;
  }

  public removeListener(event: EventKey, listener: Function): EventEmitter {
    event = this._resolveEventKey(event);
    const listeners: Function[] = this.listeners(event);
    const index: number = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    return this;
  }

  public off(event: EventKey, listener: Function): EventEmitter {
    return this.removeListener(event, listener);
  }

  public listeners(event: EventKey): Function[] {
    event = this._resolveEventKey(event);
    return this._events[event] || [];
  }

  public listenerCount(event: EventKey): number {
    event = this._resolveEventKey(event);
    return this.listeners(event).length;
  }

  public getMaxListeners(): number {
    return this._maxListeners;
  }

  public setMaxListeners(n: number): void {
    this._maxListeners = n;
  }

  public emit(event: EventKey, ...args: any[]): EventEmitter {
    event = this._resolveEventKey(event);
    const listeners: Function[] = this.listeners(event);
    listeners.slice(0).forEach((listener: Function) => {
      listener.apply(this, args || []);
    });
    return this;
  }

  private _resolveEventKey(event: EventKey): EventKey {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else if ((<number> event) >= 0) {
      return event;
    } else {
      throw new Error("Event numbers must be >= 0");
    }
  }
}
