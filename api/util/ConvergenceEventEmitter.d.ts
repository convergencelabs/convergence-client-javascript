import {Observable} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";

export declare type EventListener<T> = (e: T) => void;

export declare class ConvergenceEventEmitter<T extends ConvergenceEvent> {

  public addListener(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public on(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public once(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public removeAllListenersForAllEvents(): ConvergenceEventEmitter<T>;

  public removeAllListeners(event: string): ConvergenceEventEmitter<T>;

  public removeListener(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public off(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T>;

  public events(): Observable<T>;
}
