import {Observable} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";
export declare type EventKey = string | number;
export declare type EventListener<T> = (e: T) => void;
export declare class ObservableEventEmitter<T extends ConvergenceEvent> {
  
  addListener(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  on(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  once(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  removeAllListenersForAllEvents(): ObservableEventEmitter<T>;

  removeAllListeners(event: EventKey): ObservableEventEmitter<T>;

  removeListener(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  off(event: EventKey, listener: EventListener<T>): ObservableEventEmitter<T>;

  events(): Observable<T>;
}
