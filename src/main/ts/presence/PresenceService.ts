import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {
  ConvergenceEventEmitter,
  IConvergenceEvent,
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
  PresenceStateClearedEvent
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

export interface PresenceServiceEvents {
  STATE_SET: string;
  STATE_REMOVED: string;
  STATE_CLEARED: string;
  AVAILABILITY_CHANGED: string;
}

/**
 * The [[PresenceService]] is the main entry point into Convergence's User
 * Presence subsystem. User Presence tracks the availability and state of
 * Domain Users within the System.  Users are generally available or not
 * if they have at least one session that is connected. Each user in the
 * system can set presence state. Presence state is global for each user
 * in that the state is shared across all sessions.
 */
export class PresenceService extends ConvergenceEventEmitter<IConvergenceEvent> {

  public static readonly Events: PresenceServiceEvents = {
    STATE_SET: PresenceStateSetEvent.NAME,
    STATE_REMOVED: PresenceStateRemovedEvent.NAME,
    STATE_CLEARED: PresenceStateClearedEvent.NAME,
    AVAILABILITY_CHANGED: PresenceAvailabilityChangedEvent.NAME
  };

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
   * @internal
   */
  private _lastOnlineState: Map<string, any> | null;

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

    this._lastOnlineState = this._connection.isOnline() ? null : new Map();

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

  public setState(state: StringMapLike): void;
  public setState(key: string, value: any): void;
  public setState(): void {
    let state: Map<string, any>;
    if (arguments.length === 1) {
      state = StringMap.objectToMap(arguments[0]);
    } else if (arguments.length === 2) {
      state = new Map<string, any>();
      state.set(arguments[0], arguments[1]);
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

  public removeState(key: string): void;
  public removeState(keys: string[]): void;
  public removeState(keys: string | string[]): void {
    const stateKeys: string[] = typeof keys === "string" ? [keys] : keys;

    this._localManager.remove(stateKeys);

    if (this._connection.isOnline()) {
      const message: IConvergenceMessage = {
        presenceRemoveState: {
          keys: stateKeys
        }
      };

      this._connection.send(message);
    }
  }

  public clearState(): void {
    this._localManager.clear();

    if (this._connection.isOnline()) {
      const message: IConvergenceMessage = {
        presenceClearState: {}
      };

      this._connection.send(message);
    }
  }

  public state(): Map<string, any> {
    // The underlying class takes care of returning a clone
    return this._localPresence.state;
  }

  public presence(user: DomainUserIdentifier): Promise<UserPresence>;
  public presence(users: DomainUserIdentifier[]): Promise<UserPresence[]>;
  public presence(
    users: DomainUserIdentifier | DomainUserIdentifier[]): Promise<UserPresence | UserPresence[]> {
    if (!Array.isArray(users)) {
      return this._get([DomainUserId.toDomainUserId(users)]).then(result => {
        return result[0] as UserPresence;
      });
    } else {
      return this._get(users.map(DomainUserId.toDomainUserId));
    }
  }

  public subscribe(user: DomainUserIdentifier): Promise<UserPresenceSubscription>;
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

      const message: IConvergenceMessage = {
        presenceSubscribeRequest: {
          users: notSubscribed.map(domainUserIdToProto)
        }
      };

      return this._connection.request(message).then((response: IConvergenceMessage) => {
        const {userPresences} = response.presenceSubscribeResponse;
        userPresences.forEach(presence => {
          const userPresence = this._mapUserPresence(presence);
          const guid = userPresence.user.userId.toGuid();
          const manager: UserPresenceManager = new UserPresenceManager(
            userPresence,
            this._presenceStreams.get(guid),
            (userId) => this._unsubscribe(userId)
          );
          this._managers.set(guid, manager);
        });
      });
    } else {
      return Promise.resolve();
    }
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
    //
    this._lastOnlineState = null;
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._lastOnlineState = this.state();
  }
}
