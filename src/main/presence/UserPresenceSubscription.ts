/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ConvergenceEventEmitter} from "../util";
import {UserPresence} from "./UserPresence";
import {UserPresenceManager} from "./UserPresenceManager";
import {Observable} from "rxjs";
import {
  PresenceAvailabilityChangedEvent,
  PresenceStateSetEvent,
  PresenceStateRemovedEvent,
  PresenceStateClearedEvent, IPresenceEvent
} from "./events";
import {DomainUser} from "../identity";

/**
 * All the events that could be emitted from a [[UserPresenceSubscription]].
 *
 * @module Presence
 */
export interface UserPresenceSubscriptionEvents {
  /**
   * Emitted when one or more items of a particular [[DomainUser]]'s presence
   * [[UserPresence.state|state]] are [[PresenceService.setState|set]].
   *
   * The actual event emitted is a [[PresenceStateSetEvent]].
   *
   * @event
   */
  STATE_SET: string;

  /**
   * Emitted when one or more key-value pairs of a particular [[DomainUser]]'s
   * presence [[UserPresence.state|state]] were [[PresenceService.removeState|removed]].
   *
   * The actual event emitted is a [[PresenceStateRemovedEvent]].
   *
   * @event
   */
  STATE_REMOVED: string;

  /**
   * Emitted when a particular [[DomainUser]]'s [[UserPresence.state|state]] was cleared.
   * The actual event emitted is a [[PresenceStateClearedEvent]].
   *
   * @event
   */
  STATE_CLEARED: string;

  /**
   * Emitted when the availability of a particular [[DomainUser]] changes.
   * The actual event emitted is a [[PresenceAvailabilityChangedEvent]].
   *
   * @event
   */
  AVAILABILITY_CHANGED: string;
}

/**
 * The [[UserPresenceSubscription]] is a subscription to presence state
 * and availability changes of a specific Domain User.  The current state
 * and availability can be queried from this object, OR you can use
 * [[asObservable]] to subscribe to changes.
 *
 * Instances of this can be obtained from [[PresenceService.subscribe]].
 *
 * Make sure to [[unsubscribe]] when you're done using this.
 *
 * @module Presence
 */
export class UserPresenceSubscription extends ConvergenceEventEmitter<IPresenceEvent> {

  /**
   * A mapping of the events a subscription could emit to each event's unique name.
   */
  public static readonly Events: UserPresenceSubscriptionEvents = {
    STATE_SET: PresenceStateSetEvent.NAME,
    STATE_REMOVED: PresenceStateRemovedEvent.NAME,
    STATE_CLEARED: PresenceStateClearedEvent.NAME,
    AVAILABILITY_CHANGED: PresenceAvailabilityChangedEvent.NAME,
  };

  /**
   * @internal
   */
  private _manager: UserPresenceManager;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: UserPresenceManager) {
    super();
    this._manager = delegate;
    this._emitFrom(delegate.events());
  }

  /**
   * The user associated to this presence subscription.
   */
  public get user(): DomainUser {
    return this._manager.user();
  }

  /**
   * Returns a boolean representing the associated user's current availabilty.
   */
  public get available(): boolean {
    return this._manager.isAvailable();
  }

  /**
   * Returns the associated user's current presence state.
   */
  public get state(): Map<string, any> {
    return this._manager.state();
  }

  /**
   * Returns this presence subscription as an
   * [RxJS Observable](https://rxjs-dev.firebaseapp.com/guide/observable).
   */
  public asObservable(): Observable<UserPresence> {
    return this._manager.asObservable();
  }

  /**
   * Unsubscribes from future presence changes for the associated user,
   * cleaning up any needed resources.
   */
  public unsubscribe(): void {
    if (this._manager !== null) {
      this._manager.unsubscribe(this);
    }
    this._manager = null;
  }
}
