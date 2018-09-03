import {Observable, Subscription, Subject} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";

export type EventListener<T> = (e: T) => void;

interface EventRegistration<T> {
  listener: EventListener<T>;
  subscription: Subscription;
}

export class ConvergenceEventEmitter<T extends ConvergenceEvent> {

  /**
   * @internal
   */
  private static _resolveEventKey(event: string): string {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else {
      throw new Error("Event names must be strings");
    }
  }

  /**
   * @internal
   */
  private readonly _listeners: {[key: string]: Array<EventRegistration<T>>};

  /**
   * @internal
   */
  private readonly _defaultSubject: Subject<T>;

  /**
   * @internal
   */
  private readonly _observable: Observable<T>;

  /**
   * @hidden
   * @internal
   */
  constructor() {
    this._defaultSubject = new Subject<T>();
    this._observable = this._defaultSubject.asObservable().share();
    this._listeners = {};
  }

  public addListener(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = ConvergenceEventEmitter._resolveEventKey(event);
    let listeners: Array<EventRegistration<T>> = this._listeners[event];
    if (listeners === undefined) {
      listeners = [];
      this._listeners[event] = listeners;
    } else if (listeners.find(r => r.listener === listener) !== undefined) {
      // we don't add duplicates, so return early.
      return this;
    }

    const subscription: Subscription =
      this._observable.filter((e) => e.name.toLowerCase() === event).subscribe((e: T) => listener(e));

    listeners.push({listener, subscription});

    return this;
  }

  public on(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    return this.addListener(event, listener);
  }

  public once(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    const wrapper: EventListener<T> = (e: T) => {
      this.removeListener(event, wrapper);
      listener(e);
    };
    return this.addListener(event, wrapper);
  }

  public removeAllListenersForAllEvents(): ConvergenceEventEmitter<T> {
    Object.keys(this._listeners).forEach(event => this.removeAllListeners(event));
    return this;
  }

  public removeAllListeners(event: string): ConvergenceEventEmitter<T> {
    event = ConvergenceEventEmitter._resolveEventKey(event);
    const registrations: Array<EventRegistration<T>> = this._listeners[event];
    registrations.forEach(r => r.subscription.unsubscribe());
    delete this._listeners[event];
    return this;
  }

  public removeListener(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    event = ConvergenceEventEmitter._resolveEventKey(event);
    const listeners: Array<EventRegistration<T>> = this._listeners[event];

    if (listeners !== undefined) {
      const index: number = listeners.findIndex(r => r.listener === listener);
      if (index !== -1) {
        const r: EventRegistration<T> = listeners[index];
        listeners.splice(index, 1);
        r.subscription.unsubscribe();
      }
    }

    return this;
  }

  public off(event: string, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    return this.removeListener(event, listener);
  }

  public events(): Observable<T> {
    return this._observable;
  }

  /**
   * @hidden
   * @internal
   */
  protected _emitFrom(observable: Observable<T>): Subscription {
    return observable.subscribe((value: T) => {
        this._defaultSubject.next(value);
      },
      (error: Error) => {
        this._defaultSubject.error(error);
      });
  }

  /**
   * @hidden
   * @internal
   */
  protected _emitEvent(value: T): void {
    this._defaultSubject.next(value);
  }
}
