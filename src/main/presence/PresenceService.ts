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

import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util";
import {StringMap, StringMapLike} from "../util/StringMap";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/";
import {filter, share} from "rxjs/operators";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {UserPresenceManager} from "./UserPresenceManager";
import {
  IPresenceEvent,
  PresenceAvailabilityChangedEvent,
  PresenceStateClearedEvent,
  PresenceStateRemovedEvent,
  PresenceStateSetEvent
} from "./events";
import {mapObjectValues} from "../util/ObjectUtils";
import {
  domainUserIdToProto,
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultObject,
  jsonToProtoValue,
  protoToDomainUserId,
  protoValueToJson
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUser, DomainUserId, DomainUserIdentifier, DomainUserType} from "../identity";
import {Logging} from "../util/log/Logging";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IUserPresenceData = com.convergencelabs.convergence.proto.presence.IUserPresenceData;

/**
 * All the events that could be emitted from the [[PresenceService]].
 *
 * @module Presence
 */
export interface PresenceServiceEvents {
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
 * The [[PresenceService]] is the main entry point into Convergence's User
 * Presence subsystem. User Presence tracks the availability and state of
 * Domain Users within the System.  Users are generally available or not
 * if they have at least one session that is connected. Each user in the
 * system can set presence state. Presence state is global for each user
 * in that the state is shared across all sessions.
 *
 * See the [developer guide](https://docs.convergence.io/guide/presence/overview.html) for additional background.
 *
 * See [[PresenceServiceEvents]] for the events that may be emitted on this service.
 *
 * @module Presence
 */
export class PresenceService extends ConvergenceEventEmitter<IPresenceEvent> {

  /**
   * A mapping of the events this service could emit to each event's unique name.
   * Use this to refer an event name:
   *
   * ```typescript
   * presenceService.on(PresenceService.Events.STATE_SET, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: PresenceServiceEvents = {
    STATE_SET: PresenceStateSetEvent.NAME,
    STATE_REMOVED: PresenceStateRemovedEvent.NAME,
    STATE_CLEARED: PresenceStateClearedEvent.NAME,
    AVAILABILITY_CHANGED: PresenceAvailabilityChangedEvent.NAME
  };

  /**
   * @internal
   */
  private readonly _logger = Logging.logger("connection");

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _messageStream: Observable<MessageEvent>;

  /**
   * @internal
   */
  private readonly _localPresence: UserPresenceSubscription;

  /**
   * @internal
   */
  private readonly _localManager: UserPresenceManager;

  /**
   * @internal
   */
  private readonly _subscribedManagers: Map<string, UserPresenceManager>;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, identityCache: IdentityCache, localUser?: DomainUser) {
    super();

    this._connection = connection;
    this._identityCache = identityCache;

    this._subscribedManagers = new Map<string, UserPresenceManager>();

    this._messageStream = this._connection.messages().pipe(share());

    const user = localUser !== undefined ? localUser : new DomainUser(DomainUserType.ANONYMOUS, "");
    const localStream: Observable<MessageEvent> = this._streamForUsername(user.userId);
    const initialPresence = new UserPresence(user, false, new Map());
    this._localManager = new UserPresenceManager(initialPresence, localStream, () => {
      // TODO: do we need to do something on unsubscribe?
    });

    this._localPresence = this._localManager.subscribe();
    this._emitFrom(this._localPresence.events());

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATED, this._setOnline);
  }

  /**
   * @returns
   *   The session that this client is connected with.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Determines if the local user is available.
   *
   * @returns
   *   True if the local user is available, false otherwise.
   */
  public isAvailable(): boolean {
    return this._localPresence.available;
  }

  /**
   * Sets the given items on the local user's presence state.
   *
   * @param state a `Map` or object literal whose keys are `String`s.
   */
  public setState(state: StringMapLike): void;

  /**
   * Sets a single key-value pair on the local user's presence state.
   *
   * @param key the new pair's key
   * @param value the new pair's value
   */
  public setState(key: string, value: any): void;
  public setState(): void {
    let state: Map<string, any>;
    if (arguments.length === 1) {
      state = StringMap.objectToMap(arguments[0]);
    } else if (arguments.length === 2) {
      state = new Map<string, any>();
      state.set(arguments[0], arguments[1]);
    } else if (arguments.length === 0) {
      // no-op
      return;
    }

    this._localManager.set(state);

    if (this._connection.isOnline()) {
      const message: IConvergenceMessage = {
        presenceSetState: {
          state: mapObjectValues(StringMap.mapToObject(state), jsonToProtoValue)
        }
      };

      this._connection.send(message);
    }
  }

  /**
   * Removes the key-value pair of the provided key on the local user's presence state.
   *
   * @param key an existing key in the local user's presence state
   */
  public removeState(key: string): void;

  /**
   * Removes all the entries in the local user's presence state matching the provided array of keys.
   *
   * @param keys an array of keys
   */
  public removeState(keys: string[]): void;

  public removeState(keys: string | string[]): void {
    const stateKeys: string[] = typeof keys === "string" ? [keys] : keys;

    // Filter out any keys that don't exist.
    const existingKeys = stateKeys.filter(k => this._localManager.hasKey(k));

    // If none of the provided keys actually exist in the state, this is a no-op.
    if (existingKeys.length > 0) {
      this._localManager.remove(existingKeys);

      if (this._connection.isOnline()) {
        const message: IConvergenceMessage = {
          presenceRemoveState: {
            keys: existingKeys
          }
        };

        this._connection.send(message);
      }

    }
  }

  /**
   * Deletes all items in the local user's presence state.
   */
  public clearState(): void {
    this._localManager.clear();

    if (this._connection.isOnline()) {
      const message: IConvergenceMessage = {
        presenceClearState: {}
      };

      this._connection.send(message);
    }
  }

  /**
   * Returns a `Map` representing the local user's presence state.
   *
   * @returns a `Map` of the local user's presence state
   */
  public state(): Map<string, any> {
    // The underlying class takes care of returning a clone
    return this._localPresence.state;
  }

  /**
   * Returns the given user's current presence.
   *
   * @param user a username or [[DomainUserId]]
   *
   * @returns a promise that resolves with the give user's presence
   */
  public presence(user: DomainUserIdentifier): Promise<UserPresence>;

  /**
   * Returns the current presence of all the provided users.
   *
   * @param user an array of usernames or [[DomainUserId]]s
   *
   * @returns a promise that resolves with the give users' presences
   */
  public presence(users: DomainUserIdentifier[]): Promise<UserPresence[]>;
  public presence(users: DomainUserIdentifier | DomainUserIdentifier[]): Promise<UserPresence | UserPresence[]> {
    this._connection.session().assertOnline();

    if (!Array.isArray(users)) {
      return this._get([DomainUserId.toDomainUserId(users)]).then(result => {
        return result[0] as UserPresence;
      });
    } else {
      return this._get(users.map(DomainUserId.toDomainUserId));
    }
  }

  /**
   * Returns a [[UserPresenceSubscription]] linked to the provided user.  From
   * this object, consumers can get the current presence and listen to changes
   * on the user's presence state or availability.
   *
   * Make sure to [[UserPresenceSubscription.unsubscribe]] when you're done with
   * the returned subscription.
   *
   * @param user a username or [[DomainUserId]]
   *
   * @returns a promise that resolves with a subscription to the given user's presence changes
   */
  public subscribe(user: DomainUserIdentifier): Promise<UserPresenceSubscription>;

  /**
   * Returns an array of [[UserPresenceSubscription]]s corresponding to the
   * provided users.  From these objects, consumers can get the current presence
   * and listen to changes on the user's presence state or availability.
   *
   * Make sure to [[UserPresenceSubscription.unsubscribe]] when you're done with
   * the returned subscriptions.
   *
   * @param user an array of usernames or [[DomainUserId]]s
   *
   * @returns a promise that resolves with an array of subscriptions to the
   * given users' presence changes
   */
  public subscribe(users: DomainUserIdentifier[]): Promise<UserPresenceSubscription[]>;
  public subscribe(users: DomainUserIdentifier | DomainUserIdentifier[]):
    Promise<UserPresenceSubscription | UserPresenceSubscription[]> {
    const requested: DomainUserId[] = Array.isArray(users) ?
      users.map(DomainUserId.toDomainUserId) :
      [DomainUserId.toDomainUserId(users)];

    return this._subscribe(requested).then(() => {
      const subscriptions: UserPresenceSubscription[] =
        requested.map(userId => this._subscribedManagers.get(userId.toGuid()).subscribe());

      if (!Array.isArray(users)) {
        return subscriptions[0];
      } else {
        return subscriptions;
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // Private Methods
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @private
   * @internal
   * @hidden
   */
  public _setInternalState(state: Map<string, any>): void {
    this._localManager.clear(false);
    this._localManager.set(state);
  }

  /**
   * @internal
   * @hidden
   */
  private _get(userIds: DomainUserId[]): Promise<UserPresence[]> {
    const users = userIds.map(domainUserIdToProto);
    const message: IConvergenceMessage = {
      presenceRequest: {
        users
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userPresences} = response.presenceResponse;
      return getOrDefaultArray(userPresences).map(p => {
          return this._mapUserPresence(p);
        }
      );
    });
  }

  /**
   * @internal
   * @hidden
   */
  private _streamForUsername(user: DomainUserId): Observable<MessageEvent> {
    return this._messageStream.pipe(filter(e => {
      const message = e.message;
      const incomingUserIdData =
        (message.presenceAvailabilityChanged && message.presenceAvailabilityChanged.user) ||
        (message.presenceStateSet && message.presenceStateSet.user) ||
        (message.presenceStateRemoved && message.presenceStateRemoved.user) ||
        (message.presenceStateCleared && message.presenceStateCleared.user);
      return incomingUserIdData && protoToDomainUserId(incomingUserIdData).equals(user);
    }));
  }

  /**
   * @internal
   * @hidden
   */
  private _subscribe(users: DomainUserId[]): Promise<void> {
    const notSubscribed: DomainUserId[] = users.filter(userId => {
      return this._subscribedManagers.get(userId.toGuid()) === undefined;
    });

    if (notSubscribed.length > 0) {
      return this._subscribeToServer(notSubscribed).then(userPresences => {
        userPresences.forEach(userPresence => {
          const guid = userPresence.user.userId.toGuid();
          const stream: Observable<MessageEvent> = this._streamForUsername(userPresence.user.userId);
          const unsubscribe = (userId) => this._unsubscribe(userId);
          const manager: UserPresenceManager = new UserPresenceManager(userPresence, stream, unsubscribe);
          this._subscribedManagers.set(guid, manager);
        });

        return;
      });
    } else {
      return Promise.resolve();
    }
  }

  private _subscribeToServer(users: DomainUserId[]): Promise<UserPresence[]> {
    const message: IConvergenceMessage = {
      presenceSubscribeRequest: {
        users: users.map(domainUserIdToProto)
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userPresences} = response.presenceSubscribeResponse;
      return getOrDefaultArray(userPresences).map(presence => this._mapUserPresence(presence));
    });
  }

  /**
   * @internal
   * @hidden
   */
  private _unsubscribe(userId: DomainUserId): void {
    if (this._connection.isOnline()) {
      const message: IConvergenceMessage = {
        presenceUnsubscribe: {
          users: [domainUserIdToProto(userId)]
        }
      };
      this._connection.send(message);
    }

    const guid = userId.toGuid();
    this._subscribedManagers.delete(guid);
  }

  /**
   * @internal
   * @hidden
   */
  private _mapUserPresence(p: IUserPresenceData): UserPresence {
    const user = this._identityCache.getUser(protoToDomainUserId(p.user));
    const available = getOrDefaultBoolean(p.available);
    const state = StringMap.objectToMap(mapObjectValues(getOrDefaultObject(p.state), protoValueToJson));
    return new UserPresence(user, available, state);
  }

  /**
   * @internal
   * @hidden
   */
  private _setOnline = () => {
    const localUser = this.session().user();
    const localStream: Observable<MessageEvent> = this._streamForUsername(localUser.userId);
    this._localManager._setStream(localStream);

    const resubscribe: DomainUserId[] = [];
    this._subscribedManagers.forEach(manager => {
      resubscribe.push(manager.user().userId);
    });

    this._subscribeToServer(resubscribe)
      .then((userPresences: UserPresence[]) => {
        userPresences.forEach(userPresence => {
          const manager = this._getManager(userPresence.user.userId);
          if (manager) {
            manager._setOnline(userPresence);
          }
        });
      })
      .catch((error) => {
        this._logger.error("Error resubscribing to presence", error);
      });
  }

  private _getManager(userId: DomainUserId): UserPresenceManager {
    return userId.equals(this._localManager.user().userId) ?
      this._localManager :
      this._subscribedManagers.get(userId.toGuid());
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._localManager._setOffline();

    this._subscribedManagers.forEach((manager) => {
      manager._setOffline();
    });
  }
}

Object.freeze(PresenceService.Events);
