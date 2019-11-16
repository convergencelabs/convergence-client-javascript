/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ConvergenceEventEmitter} from "../util";
import {StringMap} from "../util/StringMap";
import {UserPresence} from "./UserPresence";
import {Observable, Subscription, BehaviorSubject} from "rxjs";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {
  PresenceAvailabilityChangedEvent,
  PresenceStateSetEvent,
  PresenceStateRemovedEvent,
  PresenceStateClearedEvent
} from "./events";
import {DomainUser, DomainUserId} from "../identity";
import {deepClone, mapObjectValues} from "../util/ObjectUtils";
import {getOrDefaultArray, getOrDefaultBoolean, getOrDefaultObject, protoValueToJson} from "../connection/ProtocolUtil";

/**
 * @hidden
 * @internal
 */
export class UserPresenceManager extends ConvergenceEventEmitter<any> {

  /**
   * @internal
   */
  private _presence: UserPresence;

  /**
   * @internal
   */
  private _subscriptions: UserPresenceSubscription[];

  /**
   * @internal
   */
  private _messageSubscription: Subscription;

  /**
   * @internal
   */
  private readonly _subject: BehaviorSubject<UserPresence>;

  /**
   * @internal
   */
  private readonly _onUnsubscribe: (user: DomainUserId) => void;

  /**
   * @hidden
   * @internal
   */
  constructor(initialPresence: UserPresence,
              eventStream: Observable<MessageEvent>,
              onUnsubscribe: (userId: DomainUserId) => void) {
    super();

    this._presence = new UserPresence(
      initialPresence.user,
      initialPresence.available,
      initialPresence.state
    );

    this._subscriptions = [];
    this._onUnsubscribe = onUnsubscribe;
    this._setStream(eventStream);
    this._subject = new BehaviorSubject(this._presence);
  }

  public user(): DomainUser {
    return this._presence.user;
  }

  public isAvailable(): boolean {
    return this._presence.available;
  }

  public state(): Map<string, any> {
    return this._presence.state;
  }

  public asObservable(): Observable<UserPresence> {
    return this._subject.asObservable();
  }

  public subscribe(): UserPresenceSubscription {
    const subscription: UserPresenceSubscription = new UserPresenceSubscription(this);
    this._subscriptions.push(subscription);
    return subscription;
  }

  public unsubscribe(subscription: UserPresenceSubscription): void {
    this._subscriptions = this._subscriptions.filter(s => s !== subscription);
    if (this._subscriptions.length === 0) {
      this._messageSubscription.unsubscribe();
      this._subject.complete();
      this._onUnsubscribe(this.user().userId);
    }
  }

  public availability(availability: boolean, emitSubject = true): void {
    this._presence =
      new UserPresence(this._presence.user, availability, this._presence.state);

    const event: PresenceAvailabilityChangedEvent =
      new PresenceAvailabilityChangedEvent(this._presence.user, availability);
    this._emitEvent(event);
    if (emitSubject) {
      this._subject.next(this._presence);
    }
  }

  public set(state: Map<string, any>, emitSubject = true): void {
    const newState: Map<string, any> = this._presence.state;
    state.forEach((v, k) => newState.set(k, deepClone(v)));

    this._presence = new UserPresence(
      this._presence.user,
      this._presence.available,
      newState
    );

    const event: PresenceStateSetEvent = new PresenceStateSetEvent(this._presence.user, newState);
    this._emitEvent(event);
    if (emitSubject) {
      this._subject.next(this._presence);
    }
  }

  public remove(keys: string[], emitSubject = true): void {
    const newState: Map<string, any> = this._presence.state;
    keys.forEach(k => newState.delete(k));

    this._presence = new UserPresence(
      this._presence.user,
      this._presence.available,
      newState
    );

    const event: PresenceStateRemovedEvent = new PresenceStateRemovedEvent(this._presence.user, keys);
    this._emitEvent(event);
    if (emitSubject) {
      this._subject.next(this._presence);
    }
  }

  public clear(emitSubject = true): void {
    this._presence = new UserPresence(
      this._presence.user,
      this._presence.available,
      new Map<string, any>());

    const event: PresenceStateClearedEvent = new PresenceStateClearedEvent(this._presence.user);
    this._emitEvent(event);
    if (emitSubject) {
      this._subject.next(this._presence);
    }
  }

  public hasKey(key: string): boolean {
    return this._presence.state.has(key);
  }

  /**
   * @hidden
   * @internal
   */
  public _setOnline(newPresence: UserPresence): void {
    this.availability(newPresence.available, false);
    this.clear(false);
    this.set(newPresence.state);

    this._subject.next(newPresence);
  }

  /**
   * @hidden
   * @internal
   */
  public _setStream(stream: Observable<MessageEvent>): void {
    if (this._messageSubscription) {
      this._messageSubscription.unsubscribe();
    }
    this._messageSubscription = stream.subscribe(message => this._handleMessage(message));
  }

  /**
   * @hidden
   * @internal
   */
  public _setOffline(): void {
    this.availability(false, false);
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message = messageEvent.message;
    if (message.presenceAvailabilityChanged) {
      const {available} = message.presenceAvailabilityChanged;
      this.availability(getOrDefaultBoolean(available));
    } else if (message.presenceStateSet) {
      const {state} = message.presenceStateSet;
      const jsonState = StringMap.objectToMap(mapObjectValues(getOrDefaultObject(state), protoValueToJson));
      // todo the set method does a deep clone which is not really needed. We should optimize this
      // path so internally the clone is not needed.
      this.set(jsonState);
    } else if (message.presenceStateCleared) {
      this.clear();
    } else if (message.presenceStateRemoved) {
      const {keys} = message.presenceStateRemoved;
      this.remove(getOrDefaultArray(keys));
    }
  }
}
