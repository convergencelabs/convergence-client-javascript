import {EventEmitter} from "./EventEmitter";
import {EventKey} from "./EventEmitter";

export class DelegatingEventEmitter {

  private _emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this._emitter = emitter;
  }

  addListener(event: EventKey, listener: Function): DelegatingEventEmitter {
    this._emitter.addListener(event, listener);
    return this;
  }


  on(event: EventKey, listener: Function): DelegatingEventEmitter {
    return this.addListener(event, listener);
  }

  once(event: EventKey, listener: Function): DelegatingEventEmitter {
    this._emitter.once(event, listener);
    return this;
  }

  removeAllListenersForAllEvents(): DelegatingEventEmitter {
    this._emitter.removeAllListenersForAllEvents();
    return this;
  }

  removeAllListeners(event: EventKey): DelegatingEventEmitter {
    this._emitter.removeAllListeners(event);
    return this;
  }

  removeListener(event: EventKey, listener: Function): DelegatingEventEmitter {
    this._emitter.removeListener(event, listener);
    return this;
  }

  off(event: EventKey, listener: Function): DelegatingEventEmitter {
    return this.removeListener(event, listener);
  }

  listeners(event: EventKey): Function[] {
    return this._emitter.listeners(event);
  }

  listenerCount(event: EventKey): number {
    return this._emitter.listenerCount(event);
  }

  getMaxListeners(): number {
    return this._emitter.getMaxListeners();
  }

  setMaxListeners(n: number): void {
    this._emitter.setMaxListeners(n);
  }

  emit(event: EventKey, ...args: any[]): DelegatingEventEmitter {
    this._emitter.emit.apply(this, [event].concat(args || []));
    return this;
  }
}
