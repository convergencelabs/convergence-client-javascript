export declare type EventKey = string | number;
export declare class EventEmitter {
  static defaultMaxListeners: number;
  private _events;
  private _maxListeners;

  constructor();

  addListener(event: EventKey, listener: Function): EventEmitter;

  on(event: EventKey, listener: Function): EventEmitter;

  once(event: EventKey, listener: Function): EventEmitter;

  removeAllListenersForAllEvents(): EventEmitter;

  removeAllListeners(event: EventKey): EventEmitter;

  removeListener(event: EventKey, listener: Function): EventEmitter;

  off(event: EventKey, listener: Function): EventEmitter;

  listeners(event: EventKey): Function[];

  listenerCount(event: EventKey): number;

  getMaxListeners(): number;

  setMaxListeners(n: number): void;

  emit(event: EventKey, ...args: any[]): EventEmitter;

  private _resolveEventKey(event);
}
