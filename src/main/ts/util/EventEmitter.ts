module convergence.util {
  export class EventEmitter {

    static defaultMaxListeners = 10;
    
    private _events:any;
    private _maxListeners;

    constructor() {
      this._events = {};
      this._maxListeners = EventEmitter.defaultMaxListeners;
    }

    addListener(event:string, listener:Function):EventEmitter {
      var listeners:Function[] = this.listeners(event);
      if (!listeners) {
        listeners = [];
        this._events[event] = listeners;
      }

      if (listeners.length >= this._maxListeners) {
        throw new Error("Max listeners exceeded for event: " + event);
      }

      listeners.push(listener);
      return this;
    }

    on(event:string, listener:Function):EventEmitter {
      return this.addListener(event, listener);
    }

    once(event, listener):EventEmitter {
      var self = this;
      var wrapper = function () {
        self.removeListener(event, wrapper);
        listener();
      };
      return this.addListener(event, wrapper);
    }

    removeAllListeners(event:string):EventEmitter {
      delete this._events[event];
      return this;
    }

    removeListener(event:string, listener:Function):EventEmitter {
      var listeners = this.listeners(event);
      var index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      return this;
    }

    off(event:string, listener:Function):EventEmitter {
      return this.removeListener(event, listener);
    }

    listeners(event:string):Function[] {
      return this._events[event] || [];
    }

    listenerCount(event:string):number {
      return this.listeners(event).length;
    }

    getMaxListeners(): number {
      return this._maxListeners;
    }

    setMaxListeners(n: number): void {
      this._maxListeners = n;
    }

    emit(event:string, ... args: any[]):EventEmitter {
      var listeners = this.listeners(event);
      listeners.forEach(function(listener: Function) {
        listener.apply(this, args || []);
      });
      return this;
    }
  }
}
