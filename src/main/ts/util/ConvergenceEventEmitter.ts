import {Observable, Subscription, Subject} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";
export type EventKey = string | number;

export type EventListener<T> = (e: T) => void;

export class ConvergenceEventEmitter<T extends ConvergenceEvent> {

  private _subscriptions: {[key: string]: Subscription[]};
  private _listeners: {[key: string]: EventListener<T>[]};

  private _subject: Subject<T>;
  private _observable: Observable<T>;

  constructor() {
    this._subject = new Subject<T>();
    this._observable = this._subject.asObservable();
    this._subscriptions = {};
    this._listeners = {};
  }

  protected _emitFrom(observable: Observable<T>): Subscription {
    return observable.subscribe((value: T) => {
        this._subject.next(value);
      },
      (error: Error) => {
        this._subject.error(error);
      });
  }

  addListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = this._resolveEventKey(event);
    var listeners: EventListener<T>[] = this._listeners[event];
    var subscriptions: Subscription[] = this._subscriptions[event];
    if (listeners === undefined) {
      listeners = [];
      this._listeners[event] = listeners;
      subscriptions = [];
      this._subscriptions[event] = subscriptions;
    }

    if (listeners.indexOf(listener) >= 0) {
      // we don't add duplicates.
      return;
    }

    var subscription: Subscription = this._observable.filter((e) => {
      return e.name.toLowerCase() === (<string>event);
    }).subscribe((e) => listener(e));

    listeners.push(listener);
    subscriptions.push(subscription);
    return this;
  }


  on(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    return this.addListener(event, listener);
  }

  once(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    var wrapper: EventListener<T> = (e: T) => {
      this.removeListener(event, wrapper);
      listener(e);
    };
    return this.addListener(event, wrapper);
  }

  removeAllListenersForAllEvents(): ConvergenceEventEmitter<T> {
    Object.keys(this._listeners).forEach((event) => {
      this.removeAllListeners(event);
    });
    return this;
  }

  removeAllListeners(event: EventKey): ConvergenceEventEmitter<T> {
    event = this._resolveEventKey(event);
    var subscriptions: Subscription[] = this._subscriptions[event];
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    delete this._subscriptions[event];
    delete this._listeners[event];

    return this;
  }

  removeListener(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    event = this._resolveEventKey(event);
    var listeners: EventListener<T>[] = this._listeners[event];
    var subscriptions: Subscription[] = this._subscriptions[event];
    var index: number = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      subscriptions[index].unsubscribe();
      subscriptions.splice(index, 1);
    }

    return this;
  }

  off(event: EventKey, listener: EventListener<T>): ConvergenceEventEmitter<T> {
    return this.removeListener(event, listener);
  }

  protected _emitEvent(value: T): void {
    this._subject.next(value);
  }

  events(): Observable<T> {
    return this._observable;
  }

  private _resolveEventKey(event: EventKey): EventKey {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else if (typeof event === 'number' && (<number>event) >= 0) {
      return event.toString().toLowerCase();
    } else {
      throw new Error("Event names must be strings or numbers >= 0");
    }
  }
}
