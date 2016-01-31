module convergence.util {
  export class EventEmitter {

    static defaultMaxListeners: number = 10;

    private _events: any;
    private _maxListeners: number;

    constructor() {
      this._events = {};
      this._maxListeners = EventEmitter.defaultMaxListeners;
    }

    addListener(event: string, listener: Function): EventEmitter {
      var listeners: Function[] = this._events[event];
      if (listeners === undefined) {
        listeners = [];
        this._events[event] = listeners;
      }

      if (listeners.length >= this._maxListeners) {
        throw new Error("Max listeners exceeded for event: " + event);
      }

      listeners.push(listener);
      return this;
    }


    on(event: string, listener: Function): EventEmitter {
      return this.addListener(event, listener);
    }

    once(event: string, listener: Function): EventEmitter {
      var self: EventEmitter = this;
      var wrapper: Function = function (): void {
        self.removeListener(event, wrapper);
        listener();
      };
      return this.addListener(event, wrapper);
    }

    removeAllListeners(event: string): EventEmitter {
      delete this._events[event];
      return this;
    }

    removeListener(event: string, listener: Function): EventEmitter {
      var listeners: Function[] = this.listeners(event);
      var index: number = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      return this;
    }

    off(event: string, listener: Function): EventEmitter {
      return this.removeListener(event, listener);
    }

    listeners(event: string): Function[] {
      return this._events[event] || [];
    }

    listenerCount(event: string): number {
      return this.listeners(event).length;
    }

    getMaxListeners(): number {
      return this._maxListeners;
    }

    setMaxListeners(n: number): void {
      this._maxListeners = n;
    }

    protected emit(event: string, ...args: any[]): EventEmitter {
      var listeners: Function[] = this.listeners(event);
      listeners.forEach(function (listener: Function): void {
        listener.apply(this, args || []);
      });
      return this;
    }
  }
}
