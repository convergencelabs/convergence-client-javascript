import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {UserPresenceImpl} from "./UserPresenceImpl";
import {Observable} from "rxjs/Rx";
import {MessageType} from "../connection/protocol/MessageType";
import {RequestPresence} from "../connection/protocol/presence/requestPresence";
import {RequestPresenceResponse} from "../connection/protocol/presence/requestPresence";
import {PresenceSetState, PresenceRemoveState} from "../connection/protocol/presence/presenceState";
import {PresenceClearState} from "../connection/protocol/presence/presenceState";
import {SubscribePresenceRequest, SubscribePresenceResponse} from "../connection/protocol/presence/subscribePresence";
import {UnsubscribePresence} from "../connection/protocol/presence/unsubscribePresence";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {UserPresenceManager} from "./UserPresenceManager";
import {objectToMap, mapToObject} from "../util/ObjectUtils";

export class PresenceService extends ConvergenceEventEmitter<ConvergenceEvent> {

  private _connection: ConvergenceConnection;

  private _messageStream: Observable<MessageEvent>;

  private _localPresence: UserPresenceSubscription;
  private _localManager: UserPresenceManager;
  private _managers: Map<string, UserPresenceManager>;
  private _presenceStreams: Map<string, Observable<MessageEvent>>;

  constructor(connection: ConvergenceConnection, presence: UserPresence) {
    super();

    this._connection = connection;

    this._managers = new Map<string, UserPresenceManager>();
    this._presenceStreams = new Map<string, Observable<MessageEvent>>();

    this._messageStream = this._connection.messages([
      MessageType.PRESENCE_AVAILABILITY_CHANGED,
      MessageType.PRESENCE_STATE_SET,
      MessageType.PRESENCE_STATE_CLEARED]);

    const username: string = this.session().username();

    const localStream: Observable<MessageEvent> = this._streamForUsername(username);
    this._presenceStreams.set(username, localStream);

    this._localManager = new UserPresenceManager(presence, localStream, () => {
    });

    this._managers.set(username, this._localManager);

    this._localPresence = this._localManager.subscribe();
  }

  session(): Session {
    return this._connection.session();
  }

  isAvailable(): boolean {
    return this._localPresence.isAvailable();
  }

  setState(state: {[key: string]: any}): void
  setState(key: string, value: any): void
  setState(): void {
    let state: Map<string, any>;
    if (arguments.length === 1) {
      state = objectToMap(arguments[0]);
    } else if (arguments.length === 2) {
      state = new Map<string, any>();
      state.set(arguments[0], arguments[1]);
    }

    this._localManager.set(state);

    const message: PresenceSetState = {
      type: MessageType.PRESENCE_SET_STATE,
      state: mapToObject(state),
      all: false
    };

    this._connection.send(message);
  }

  removeState(key: string): void
  removeState(keys: string[]): void
  removeState(keys: string | string[]): void {
    let stateKeys: string[] = null;

    if (typeof keys === "string") {
      stateKeys = [<string>keys];
    } else {
      stateKeys = <string[]>keys;
    }

    this._localManager.remove(stateKeys);

    const message: PresenceRemoveState = {
      type: MessageType.PRESENCE_REMOVE_STATE,
      keys: stateKeys
    };

    this._connection.send(message);
  }

  clearState(): void {
    this._localManager.clear();

    const message: PresenceClearState = {
      type: MessageType.PRESENCE_CLEAR_STATE
    };

    this._connection.send(message);
  }

  state(): {[key: string]: any}
  state(key: string): any
  state(key?: string): any {
    return mapToObject(this._localPresence.state(key));
  }

  presence(username: string): Promise<UserPresence>
  presence(usernames: string[]): Promise<UserPresence[]>
  presence(usernames: string | string[]): Promise<UserPresence> | Promise<UserPresence[]> {
    if (typeof usernames === "string") {
      return this._get([usernames]).then(result => {
        return <UserPresence>result[0];
      });
    } else {
      return this._get(<string[]>usernames);
    }
  }

  subscribe(username: string): Promise<UserPresenceSubscription>
  subscribe(usernames: string[]): Promise<UserPresenceSubscription[]>
  subscribe(usernames: string | string[]): Promise<UserPresenceSubscription> | Promise<UserPresenceSubscription[]> {
    let requested: string[];
    if (typeof usernames === "string") {
      requested = [<string>usernames];
    } else {
      requested = usernames;
    }

    return this._subscribe(requested).then(() => {
      const subscriptions: UserPresenceSubscription[] = requested.map(username => this._managers.get(username).subscribe());

      if (typeof usernames === "string") {
        return subscriptions[0];
      } else {
        return subscriptions;
      }
    });
  }


  /////////////////////////////////////////////////////////////////////////////
  // Private Methods
  /////////////////////////////////////////////////////////////////////////////

  private _get(usernames: string[]): Promise<UserPresence[]> {
    const message: RequestPresence = {
      type: MessageType.PRESENCE_REQUEST,
      usernames: usernames
    };

    return this._connection.request(message).then((response: RequestPresenceResponse) => {
      return response.userPresences.map(p =>
        new UserPresenceImpl(p.username, p.available, objectToMap(p.state))
      );
    });
  }


  private _streamForUsername(username: string): Observable<MessageEvent> {
    return this._messageStream.filter(m => m.message.username === username);
  }

  private _subscribe(usernames: string[]): Promise<void> {
    let notSubscribed: string[] = usernames.filter(username => {
      return this._presenceStreams.get(username) === undefined;
    });

    if (notSubscribed.length > 0) {
      notSubscribed.forEach(username => {
        const stream: Observable<MessageEvent> = this._streamForUsername(username);
        this._presenceStreams.set(username, stream);
      });

      const message: SubscribePresenceRequest = {
        type: MessageType.PRESENCE_SUBSCRIBE_REQUEST,
        usernames: notSubscribed
      };

      return this._connection.request(message).then((response: SubscribePresenceResponse) => {
        response.userPresences.forEach(presence => {
          const manager: UserPresenceManager = new UserPresenceManager(
            new UserPresenceImpl(presence.username, presence.available, objectToMap(presence.state)),
            this._presenceStreams.get(presence.username),
            (username) => this._unsubscribe(username)
          );
          this._managers.set(presence.username, manager);
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  private _unsubscribe(username: string): void {
    const message: UnsubscribePresence = {
      type: MessageType.PRESENCE_UNSUBSCRIBE,
      username: username
    };

    this._connection.send(message);

    this._managers.delete(username);
    this._presenceStreams.delete(username);
  };
}
