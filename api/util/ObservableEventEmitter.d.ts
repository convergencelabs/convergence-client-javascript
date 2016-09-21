import {Observable} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";
export declare type EventKey = string | number;
export declare type EventListener<T> = (e: T) => void;
export declare class ObservableEventEmitter<T extends ConvergenceEvent> {
  private _subscriptions;
  private _listeners;
  private _observable;

  constructor(observable?: Observable<T>);

  protected _setObservable(observable: Observable<T>): void;

  addListener(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  on(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  once(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  removeAllListenersForAllEvents(): ObservableEventEmitter<T>;

  removeAllListeners(event: EventKey): ObservableEventEmitter<T>;

  removeListener(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  off(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  events(): Observable<T>;

  private _resolveEventKey(event);
}
