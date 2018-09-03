export type EventKey = string | number;

export type SimpleEventListener = (...args: any[]) => void;

export class EventEmitter {

  public static defaultMaxListeners: number = 100;

  /**
   * @internal
   */
  private _events: any;

  /**
   * @internal
   */
  private _maxListeners: number;

  /**
   * @hidden
   * @internal
   */
  constructor() {
    this._events = {};
    this._maxListeners = EventEmitter.defaultMaxListeners;
  }

  public addListener(event: EventKey, listener: SimpleEventListener): EventEmitter {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = this._resolveEventKey(event);
    let listeners: SimpleEventListener[] = this._events[event];
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

  public on(event: EventKey, listener: SimpleEventListener): EventEmitter {
    return this.addListener(event, listener);
  }

  public once(event: EventKey, listener: SimpleEventListener): EventEmitter {
    const wrapper: SimpleEventListener = (e: any) => {
      this.removeListener(event, wrapper);
      listener(e);
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

  public removeListener(event: EventKey, listener: SimpleEventListener): EventEmitter {
    event = this._resolveEventKey(event);
    const listeners: SimpleEventListener[] = this.listeners(event);
    const index: number = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    return this;
  }

  public off(event: EventKey, listener: SimpleEventListener): EventEmitter {
    return this.removeListener(event, listener);
  }

  public listeners(event: EventKey): SimpleEventListener[] {
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
    const listeners: SimpleEventListener[] = this.listeners(event);
    listeners.slice(0).forEach((listener: SimpleEventListener) => {
      listener.apply(this, args || []);
    });
    return this;
  }

  /**
   * @internal
   * @hidden
   */
  private _resolveEventKey(event: EventKey): EventKey {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else if ((event as number) >= 0) {
      return event;
    } else {
      throw new Error("Event numbers must be >= 0");
    }
  }
}
