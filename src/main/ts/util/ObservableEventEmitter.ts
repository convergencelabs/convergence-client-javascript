import {Observable, Subscription} from "rxjs/Rx";
import {ConvergenceEvent} from "./ConvergenceEvent";
export type EventKey = string | number;

export class ObservableEventEmitter<T extends ConvergenceEvent> {

  private _subscriptions: {[key: string]: Subscription[]};
  private _listeners: {[key: string]: Function[]};

  private _observable: Observable<T>;

  constructor(observable: Observable<T>) {
    this._observable = observable;
  }

  addListener(event: EventKey, listener: Function): ObservableEventEmitter<T> {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = this._resolveEventKey(event);
    var listeners: Function[] = this._listeners[event];
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
      return e.name === event;
    }).subscribe((e) => listener(e));

    listeners.push(listener);
    subscriptions.push(subscription);
    return this;
  }


  on(event: EventKey, listener: Function): ObservableEventEmitter<T> {
    return this.addListener(event, listener);
  }

  once(event: EventKey, listener: Function): ObservableEventEmitter<T> {
    var wrapper: Function = () => {
      this.removeListener(event, wrapper);
      listener();
    };
    return this.addListener(event, wrapper);
  }

  removeAllListenersForAllEvents(): ObservableEventEmitter<T> {
    Object.keys(this._listeners).forEach((event) => {
      this.removeAllListeners(event);
    });
    return this;
  }

  removeAllListeners(event: EventKey): ObservableEventEmitter<T> {
    event = this._resolveEventKey(event);
    var subscriptions: Subscription[] = this._subscriptions[event];
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    delete this._subscriptions[event];
    delete this._listeners[event];

    return this;
  }

  removeListener(event: EventKey, listener: Function): ObservableEventEmitter<T> {
    event = this._resolveEventKey(event);
    var listeners: Function[] = this._listeners[event];
    var subscriptions: Function[] = this._listeners[event];
    var index: number = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      subscriptions.splice(index, 1);
    }

    return this;
  }

  off(event: EventKey, listener: Function): ObservableEventEmitter<T> {
    return this.removeListener(event, listener);
  }

  events(): Observable<T> {
    return this._observable;
  }

  private _resolveEventKey(event: EventKey): EventKey {
    if (typeof event === "string") {
      return event.toLowerCase();
    } else if ((<number>event) >= 0) {
      return event;
    } else {
      throw new Error("Event numbers must be >= 0");
    }
  }
}
