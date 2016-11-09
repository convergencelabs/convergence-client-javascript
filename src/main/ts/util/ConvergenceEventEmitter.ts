import {Observable, Subscription, Subject} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";
export type EventKey = string | number;

export type EventListener<T> = (e: T) => void;

export class ConvergenceEventEmitter<T extends ConvergenceEvent> {

  private _eventSubscriptions: {[key: string]: Subscription[]};
  private _listeners: {[key: string]: EventListener<T>[]};

  private _defaultSubject: Subject<T>;
  private _observable: Observable<T>;

  constructor() {
    this._defaultSubject = new Subject<T>();
    this._observable = this._defaultSubject.asObservable();
    this._eventSubscriptions = {};
    this._listeners = {};
  }

  public addListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = this._resolveEventKey(event);
    let listeners: EventListener<T>[] = this._listeners[event];
    let subscriptions: Subscription[] = this._eventSubscriptions[event];
    if (listeners === undefined) {
      listeners = [];
      this._listeners[event] = listeners;
      subscriptions = [];
      this._eventSubscriptions[event] = subscriptions;
    }

    if (listeners.indexOf(listener) >= 0) {
      // we don't add duplicates.
      return;
    }

    const subscription: Subscription = this._observable.filter((e) => {
      return e.name.toLowerCase() === (<string> event);
    }).subscribe((e) => listener(<T> e));

    listeners.push(listener);
    subscriptions.push(subscription);
    return this;
  }

  public on(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    return this.addListener(event, listener);
  }

  public once(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    const wrapper: EventListener<T> = (e: T) => {
      this.removeListener(event, wrapper);
      listener(e);
    };
    return this.addListener(event, wrapper);
  }

  public removeAllListenersForAllEvents(): ConvergenceEventEmitter<T> {
    Object.keys(this._listeners).forEach((event) => {
      this.removeAllListeners(event);
    });
    return this;
  }

  public removeAllListeners(event: EventKey): ConvergenceEventEmitter<T> {
    event = this._resolveEventKey(event);
    const subscriptions: Subscription[] = this._eventSubscriptions[event];
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    delete this._eventSubscriptions[event];
    delete this._listeners[event];

    return this;
  }

  public removeListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    event = this._resolveEventKey(event);
    const listeners: EventListener<T>[] = this._listeners[event];
    const subscriptions: Subscription[] = this._eventSubscriptions[event];
    const index: number = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      subscriptions[index].unsubscribe();
      subscriptions.splice(index, 1);
    }

    return this;
  }

  public  off(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    return this.removeListener(event, listener);
  }

  public events(): Observable<T> {
    return this._observable;
  }

  protected _emitFrom(observable: Observable<T>): Subscription {
    return observable.subscribe((value: T) => {
        this._defaultSubject.next(value);
      },
      (error: Error) => {
        this._defaultSubject.error(error);
      });
  }

  protected _emitEvent(value: T): void {
    this._defaultSubject.next(value);
  }

  private _resolveEventKey(event: EventKey): EventKey {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else if (typeof event === "number" && (<number> event) >= 0) {
      return event.toString().toLowerCase();
    } else {
      throw new Error("Event names must be strings or numbers >= 0");
    }
  }
}
