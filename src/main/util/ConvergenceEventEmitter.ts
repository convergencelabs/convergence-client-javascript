/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Observable, Subscription, Subject} from "rxjs";
import {share, filter} from "rxjs/operators";
import {IConvergenceEvent} from "./IConvergenceEvent";
import {Validation} from "./Validation";
import {ConvergenceError} from "./ConvergenceError";

/**
 * The ConvergenceEventListener type defines a function which takes a specific
 * subclass of IConvergenceEvent as a single argument in order to receive fired
 * events. Consumers can use the familiar Node style event registration methods
 * (e.g. addListener, removeListener, on, off, once, etc.) or they can consume
 * events as an observable stream using the `events` method.
 *
 * @param event
 *   The subclass of IConvergenceEvent that represents the fired event.
 */
export type ConvergenceEventListener<T extends IConvergenceEvent> = (event: T) => void;

/**
 * The ConvergenceEventEmitter is an abstract base class for all classes that
 * fire events and provide an event registration mechanism to consumers.
 *
 * @param T
 *   The subclass of IConvergenceEvent that will be fired.
 */
export abstract class ConvergenceEventEmitter<T extends IConvergenceEvent> {

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
  private readonly _listeners: Map<string, Array<EventRegistration<T>>>;

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
  protected constructor() {
    this._defaultSubject = new Subject<T>();
    this._observable = this._defaultSubject.asObservable().pipe(share());
    this._listeners = new Map();
  }

  /**
   * Adds a new event listener for the specified event. The class will ignore
   * duplicate registrations of the same listener to the same event.
   *
   * @param event
   *   The name of the event to add the listener for.
   * @param listener
   *   The listener callback to register.
   * @return
   *   This object, in support of a fluent API.
   */
  public addListener(event: string, listener: ConvergenceEventListener<T>): ConvergenceEventEmitter<T> {
    if (typeof listener !== "function") {
      throw new TypeError("Listeners must be functions");
    }

    event = ConvergenceEventEmitter._resolveEventKey(event);
    let listeners: Array<EventRegistration<T>> = this._listeners.get(event);
    if (listeners === undefined) {
      listeners = [];
      this._listeners.set(event, listeners);
    } else if (listeners.find(r => r.listener === listener) !== undefined) {
      // we don't add duplicates, so return early.
      return this;
    }

    const subscription: Subscription =
      this._observable
        .pipe(filter((e) => e.name.toLowerCase() === event))
        .subscribe((e: T) => {
          listener(e);
        });

    listeners.push({listener, subscription});

    return this;
  }

  /**
   * Adds a new event listener for the specified event. The class will ignore
   * duplicate registrations of the same listener to the same event.
   *
   * @param event
   *   The name of the event to add the listener for.
   * @param listener
   *   The listener callback to register.
   * @return
   *   This object, in support of a fluent API.
   */
  public on(event: string, listener: ConvergenceEventListener<T>): ConvergenceEventEmitter<T> {
    return this.addListener(event, listener);
  }

  /**
   * Adds a single shot event listener for the specified event. The listener
   * will be called the first time the specified event is fired after the
   * event registration occurs, after which the registration will be removed
   * and no further events will be passed to the listener.
   *
   * @param event
   *   The name of the event to add the listener for.
   * @param listener
   *   The listener callback to register.
   * @return
   *   This object, in support of a fluent API.
   */
  public once(event: string, listener: ConvergenceEventListener<T>): ConvergenceEventEmitter<T> {
    const wrapper: ConvergenceEventListener<T> = (e: T) => {
      this.removeListener(event, wrapper);
      listener(e);
    };
    return this.addListener(event, wrapper);
  }

  /**
   * Removes all listeners for all events. This is useful for cleanup before
   * disposing of this particular event emitter.
   *
   * @return
   *   This object, in support of a fluent API.
   */
  public removeAllListeners(): ConvergenceEventEmitter<T> {
    Array
      .from(this._listeners.keys())
      .forEach(event => this.removeListeners(event));
    return this;
  }

  /**
   * Removes all listeners bound on the given event.
   *
   * @param event the name of the event to remove listeners for
   *
   * @return
   *   This object, in support of a fluent API.
   */
  public removeListeners(event: string): ConvergenceEventEmitter<T> {
    event = ConvergenceEventEmitter._resolveEventKey(event);
    if (this._listeners.has(event)) {
      const registrations: Array<EventRegistration<T>> = this._listeners.get(event);
      registrations.forEach(r => r.subscription.unsubscribe());
      this._listeners.delete(event);
    }
    return this;
  }

  /**
   * Removes a single event listener for a specific event.
   *
   * @param event
   *   The name of the event to remove the listener for.
   * @param listener
   *   The listener callback to unregister.
   * @return
   *   This object, in support of a fluent API.
   */
  public removeListener(event: string, listener: ConvergenceEventListener<T>): ConvergenceEventEmitter<T> {
    event = ConvergenceEventEmitter._resolveEventKey(event);
    if (this._listeners.has(event)) {
      const listeners: Array<EventRegistration<T>> = this._listeners.get(event);
      const index: number = listeners.findIndex(r => r.listener === listener);
      if (index !== -1) {
        const r: EventRegistration<T> = listeners[index];
        listeners.splice(index, 1);
        r.subscription.unsubscribe();
      }

      if (listeners.length === 0) {
        this._listeners.delete(event);
      }
    }

    return this;
  }

  /**
   * Removes a single event listener for a specific event.
   *
   * @param event
   *   The name of the event to remove the listener for.
   * @param listener
   *   The listener callback to unregister.
   * @return
   *   This object, in support of a fluent API.
   */
  public off(event: string, listener: ConvergenceEventListener<T>): ConvergenceEventEmitter<T> {
    return this.removeListener(event, listener);
  }

  /**
   * Provides the events emitted by this object as an Observable stream.
   *
   * @example
   * ```typescript
   *
   * eventEmitter.events()
   *   .filter(e => e.name === "myevent")
   *   .subscribe(e => console.log(e));
   * ```
   *
   * @return
   *   An Observable stream of all events emitted by this object.
   */
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
    if (Validation.isNotSet(value.name)) {
      throw new ConvergenceError("An event must have a name.");
    }
    this._defaultSubject.next(value);
  }

  /**
   * @hidden
   * @internal
   */
  protected _completeEventStream(): void {
    this._defaultSubject.complete();
  }
}

interface EventRegistration<T extends IConvergenceEvent> {
  listener: ConvergenceEventListener<T>;
  subscription: Subscription;
}
