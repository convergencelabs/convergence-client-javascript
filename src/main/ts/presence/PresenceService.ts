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
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {mapObjectValues} from "../util/ObjectUtils";
import {domainUserIdToProto, jsonToProtoValue, protoToDomainUserId, protoValueToJson} from "../connection/ProtocolUtil";
import {DomainUserId} from "../identity/DomainUserId";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserIdentifier} from "../identity";

export interface PresenceServiceEvents {
  STATE_SET: string;
  STATE_REMOVED: string;
  STATE_CLEARED: string;
  AVAILABILITY_CHANGED: string;
}

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
      // TODO: do we need to do something on unsubscribe
    });

    this._managers.set(localUser.userId.toGuid(), this._localManager);

    this._localPresence = this._localManager.subscribe();
  }

  public session(): ConvergenceSession {
    return this._connection.session();
  }

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

    const message: IConvergenceMessage = {
      presenceStateSet: {
        state: mapObjectValues(StringMap.mapToObject(state), jsonToProtoValue)
      }
    };

    this._connection.send(message);
  }

  public removeState(key: string): void;
  public removeState(keys: string[]): void;
  public removeState(keys: string | string[]): void {
    const stateKeys: string[] = typeof keys === "string" ? [keys] : keys;

    this._localManager.remove(stateKeys);

    const message: IConvergenceMessage = {
      presenceRemoveState: {
        keys: stateKeys
      }
    };

    this._connection.send(message);
  }

  public clearState(): void {
    this._localManager.clear();

    const message: IConvergenceMessage = {
      presenceClearState: {}
    };

    this._connection.send(message);
  }

  public state(): Map<string, any> {
    // The underlying class takes care of returning a clone
    return this._localPresence.state;
  }

  public presence(user: DomainUserIdentifier): Promise<UserPresence>;
  public presence(users: DomainUserIdentifier[]): Promise<UserPresence[]>;
  public presence(
    users: DomainUserIdentifier | DomainUserIdentifier[]): Promise<UserPresence> | Promise<UserPresence[]> {
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
      return userPresences.map(p => {
          const user = this._identityCache.getUser(protoToDomainUserId(p.user));
          return new UserPresence(
            user,
            p.available,
            StringMap.objectToMap(mapObjectValues(p.state, protoValueToJson))
          );
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
        (message.presenceAvailabilityChanged && message.presenceStateRemoved.user) ||
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
          const user = this._identityCache.getUser(protoToDomainUserId(presence.user));
          const manager: UserPresenceManager = new UserPresenceManager(
            new UserPresence(
              user,
              presence.available,
              StringMap.objectToMap(mapObjectValues(presence.state, protoValueToJson))
            ),
            this._presenceStreams.get(user.userId.toGuid()),
            (userId) => this._unsubscribe(userId)
          );
          this._managers.set(user.userId.toGuid(), manager);
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
    const message: IConvergenceMessage = {
      presenceUnsubscribe: {
        users: [domainUserIdToProto(userId)]
      }
    };

    this._connection.send(message);

    const guid = userId.toGuid();
    this._managers.delete(guid);
    this._presenceStreams.delete(guid);
  }
}
