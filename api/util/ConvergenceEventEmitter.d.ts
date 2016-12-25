import {Observable} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";

export declare type EventKey = string | number;
export declare type EventListener<T> = (e: T) => void;

export declare class ConvergenceEventEmitter<T extends ConvergenceEvent> {

  public addListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public on(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public once(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public removeAllListenersForAllEvents(): ConvergenceEventEmitter<T>;

  public removeAllListeners(event: EventKey): ConvergenceEventEmitter<T>;

  public removeListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public off(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public events(): Observable<T>;
}
