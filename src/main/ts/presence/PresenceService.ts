import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {
  ConvergenceEventEmitter,
  StringMap,
  StringMapLike
} from "../util/";
import {UserPresence} from "./UserPresence";
import {Observable} from "rxjs/";
import {filter, share} from "rxjs/operators";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {UserPresenceManager} from "./UserPresenceManager";
import {
  PresenceAvailabilityChangedEvent,
  PresenceStateSetEvent,
  PresenceStateRemovedEvent,
  PresenceStateClearedEvent, IPresenceEvent
} from "./events/";
import {mapObjectValues} from "../util/ObjectUtils";
import {
  domainUserIdToProto, getOrDefaultArray,
  getOrDefaultBoolean, getOrDefaultObject,
  jsonToProtoValue,
  protoToDomainUserId,
  protoValueToJson
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserIdentifier, DomainUserId} from "../identity";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IUserPresence = io.convergence.proto.IUserPresence;
import {Logging} from "../util/log/Logging";

/**
 * All the events that could be emitted from the [[PresenceService]].
 *
 * @category Presence Subsystem
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
 * @category Presence Subsystem
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
  private readonly _managers: Map<string, UserPresenceManager>;

  /**
   * @internal
   */
  private readonly _presenceStreams: Map<string, Observable<MessageEvent>>;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, presence: UserPresence, identityCache: IdentityCache) {
    super();

    this._connection = connection;
    this._identityCache = identityCache;

    this._managers = new Map<string, UserPresenceManager>();
    this._presenceStreams = new Map<string, Observable<MessageEvent>>();

    this._messageStream = this._connection
      .messages()
      .pipe(share());

    const localUser = this.session().user();

    const localStream: Observable<MessageEvent> = this._streamForUsername(localUser.userId);
    this._presenceStreams.set(localUser.userId.toGuid(), localStream);

    this._localManager = new UserPresenceManager(presence, localStream, () => {
      // TODO: do we need to do something on unsubscribe?
    });

    this._managers.set(localUser.userId.toGuid(), this._localManager);

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
        requested.map(userId => this._managers.get(userId.toGuid()).subscribe());

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
      return this._presenceStreams.get(userId.toGuid()) === undefined;
    });

    if (notSubscribed.length > 0) {
      notSubscribed.forEach(userId => {
        const stream: Observable<MessageEvent> = this._streamForUsername(userId);
        this._presenceStreams.set(userId.toGuid(), stream);
      });

      return this._subscribeToServer(notSubscribed).then(userPresences => {
        userPresences.forEach(userPresence => {
          const guid = userPresence.user.userId.toGuid();
          const manager: UserPresenceManager = new UserPresenceManager(
            userPresence,
            this._presenceStreams.get(guid),
            (userId) => this._unsubscribe(userId)
          );
          this._managers.set(guid, manager);
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
    this._managers.delete(guid);
    this._presenceStreams.delete(guid);
  }

  /**
   * @internal
   * @hidden
   */
  private _mapUserPresence(p: IUserPresence): UserPresence {
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
    const resubscribe: DomainUserId[] = [];
    this._managers.forEach(manager => {
      resubscribe.push(manager.user().userId);
    });

    this._subscribeToServer(resubscribe)
      .then((userPresences: UserPresence[]) => {
        userPresences.forEach(userPresence => {
          const guid = userPresence.user.userId.toGuid();
          const manager = this._managers.get(guid);
          if (manager) {
            manager._setOnline(userPresence);
          }
        });
      })
      .catch((error) => {
        this._logger.error("Error resubscribing to presence", error);
      });
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._managers.forEach((manager) => {
      manager._setOffline();
    });
  }
}

Object.freeze(PresenceService.Events);
