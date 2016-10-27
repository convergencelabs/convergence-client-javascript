import {Observable} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";
export declare type EventKey = string | number;
export declare type EventListener<T> = (e: T) => void;
export declare class ConvergenceEventEmitter<T extends ConvergenceEvent> {

  addListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  on(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  once(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  removeAllListenersForAllEvents(): ConvergenceEventEmitter<T>;

  removeAllListeners(event: EventKey): ConvergenceEventEmitter<T>;

  removeListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  off(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  events(): Observable<T>;
}
