import {EventEmitter} from "./EventEmitter";
import {EventKey} from "./EventEmitter";
export declare class DelegatingEventEmitter {
  private _emitter;

  constructor(emitter: EventEmitter);

  addListener(event: EventKey, listener: Function): DelegatingEventEmitter;

  on(event: EventKey, listener: Function): DelegatingEventEmitter;

  once(event: EventKey, listener: Function): DelegatingEventEmitter;

  removeAllListenersForAllEvents(): DelegatingEventEmitter;

  removeAllListeners(event: EventKey): DelegatingEventEmitter;

  removeListener(event: EventKey, listener: Function): DelegatingEventEmitter;

  off(event: EventKey, listener: Function): DelegatingEventEmitter;

  listeners(event: EventKey): Function[];

  listenerCount(event: EventKey): number;

  getMaxListeners(): number;

  setMaxListeners(n: number): void;

  emit(event: EventKey, ...args: any[]): DelegatingEventEmitter;
}
