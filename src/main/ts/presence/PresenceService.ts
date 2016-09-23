import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {UserPresence} from "./UserPresence";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Rx";
import {MessageType} from "../connection/protocol/MessageType";
import {PresenceAvailabilityChanged} from "../connection/protocol/presence/pressenceAvailability";
import {PresenceStateSet} from "../connection/protocol/presence/presenceState";
import {PresenceStateCleared} from "../connection/protocol/presence/presenceState";
import {RequestPresence} from "../connection/protocol/presence/requestPresence";
import {RequestPresenceResponse} from "../connection/protocol/presence/requestPresence";
import {PresenceSetState} from "../connection/protocol/presence/presenceState";
import {PresenceClearState} from "../connection/protocol/presence/presenceState";
import {SubjectSubscriptionManager} from "./SubjectSubscriptionManager";
import {SubscribePresenceRequest, SubscribePresenceResponse} from "../connection/protocol/presence/subscribePresence";
import {UnsubscribePresence} from "../connection/protocol/presence/unsubscribePresence";
import {ConvergenceEvent} from "../util/ConvergenceEvent";

export class PresenceService extends ConvergenceEventEmitter<ConvergenceEvent> {

  private _connection: ConvergenceConnection;
  private _userPresences: Map<string, UserPresence>;
  private _localPresence: BehaviorSubject<UserPresence>;
  private _subManager: SubjectSubscriptionManager<UserPresence>;

  private _subscribeFunc: (username: string) => void = (username: string) => {
    this._connection.request(<SubscribePresenceRequest>{
      type: MessageType.PRESENCE_SUBSCRIBE_REQUEST,
      username: username
    }).then((response: SubscribePresenceResponse) => {
      this._userPresences.set(username, response.userPresence);
      this._subManager.next(username, response.userPresence);
    });
  };

  private _unsubscribeFunc: (username: string) => void = (username: string) => {
    this._connection.send(<UnsubscribePresence>{
      type: MessageType.PRESENCE_UNSUBSCRIBE,
      username: username
    });
    this._userPresences.delete(username);
  };

  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;
    this._userPresences = new Map<string, UserPresence>();
    this._localPresence = new BehaviorSubject<UserPresence>(
      new UserPresence(connection.session().username(), true, new Map<string, any>())
    );
    this._subManager = new SubjectSubscriptionManager<UserPresence>(this._subscribeFunc, this._unsubscribeFunc);

    this._connection.addMultipleMessageListener(
      [MessageType.PRESENCE_AVAILABILITY_CHANGED,
        MessageType.PRESENCE_STATE_SET,
        MessageType.PRESENCE_STATE_CLEARED],
      (message: MessageEvent) => this._handleMessage(message));
  }

  session(): Session {
    return this._connection.session();
  }

  isAvailable(): boolean {
    return this._localPresence.value.available();
  }

  // TODO: Use some sort of immutability or cloned object
  publish(key: string, value: any): void {
    const oldValue: UserPresence = this._localPresence.getValue();
    let newState: Map<string, any> = oldValue.state();
    newState.set(key, value);
    const newValue: UserPresence = new UserPresence(oldValue.username(), oldValue.available(), newState);
    this._localPresence.next(newValue);

    this._connection.send(<PresenceSetState>{
      type: MessageType.PRESENCE_SET_STATE,
      key: key,
      value: value
    });
  }

  clear(key: string): void {
    const oldValue: UserPresence = this._localPresence.getValue();
    let newState: Map<string, any> = oldValue.state();
    newState.delete(key);
    const newValue: UserPresence = new UserPresence(oldValue.username(), oldValue.available(), newState);
    this._localPresence.next(newValue);

    this._connection.send(<PresenceClearState>{
      type: MessageType.PRESENCE_CLEAR_STATE,
      key: key
    });
  }

  state(key: string): any
  state(): Map<string, any>
  state(key?: string): any {
    return this._localPresence.value.state(key);
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

  presenceStream(username: string): Observable<UserPresence>
  presenceStream(usernames: string[]): Observable<UserPresence>[]
  presenceStream(usernames: string | string[]): Observable<UserPresence> | Observable<UserPresence>[] {
    if (typeof usernames === "string") {
      return this._stream([<string>usernames])[0];
    } else {
      return this._stream(<string[]>usernames);
    }
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
      return response.userPresences;
    });
  }

  private _stream(usernames: string[]): Observable<UserPresence>[] {
    let userPresences: Observable<UserPresence>[] = [];
    for (var username of usernames) {
      if (this.session().username() === username) {
        userPresences.push(this._localPresence.asObservable());
      } else {
        userPresences.push(this._subManager.getObservable(username));
      }
    }
    return userPresences;
  }

  private _handleMessage(messageEvent: MessageEvent): void {
    var message: IncomingProtocolMessage = messageEvent.message;

    switch (message.type) {
      case MessageType.PRESENCE_AVAILABILITY_CHANGED:
        this._availabilityChanged(<PresenceAvailabilityChanged>message);
        break;
      case MessageType.PRESENCE_STATE_SET:
        this._stateSet(<PresenceStateSet>message);
        break;
      case MessageType.PRESENCE_STATE_CLEARED:
        this._stateCleared(<PresenceStateCleared>message);
        break;
      default:
      // fixme error
    }
  }

  private _availabilityChanged(messageEvent: PresenceAvailabilityChanged): void {
    const oldValue: UserPresence = this._userPresences.get(messageEvent.username);
    this._subManager.next(oldValue.username(), new UserPresence(oldValue.username(), messageEvent.available, oldValue.state()));
  }

  private _stateSet(messageEvent: PresenceStateSet): void {
    if (this.session().username() === messageEvent.username) {
      const oldValue: UserPresence = this._localPresence.getValue();
      let newState: Map<string, any> = oldValue.state();
      newState.set(messageEvent.key, messageEvent.value);
      this._localPresence.next(new UserPresence(oldValue.username(), true, newState));
    } else {
      const oldValue: UserPresence = this._userPresences.get(messageEvent.username);
      let newState: Map<string, any> = oldValue.state();
      newState.set(messageEvent.key, messageEvent.value);
      this._subManager.next(oldValue.username(), new UserPresence(oldValue.username(), oldValue.available(), newState));
    }
  }

  private _stateCleared(messageEvent: PresenceStateCleared): void {
    if (this.session().username() === messageEvent.username) {
      const oldValue: UserPresence = this._localPresence.getValue();
      let newState: Map<string, any> = oldValue.state();
      newState.delete(messageEvent.key);
      this._localPresence.next(new UserPresence(oldValue.username(), true, newState));
    } else {
      const oldValue: UserPresence = this._userPresences.get(messageEvent.username);
      let newState: Map<string, any> = oldValue.state();
      newState.delete(messageEvent.key);
      this._subManager.next(oldValue.username(), new UserPresence(oldValue.username(), oldValue.available(), newState));
    }
  }
}
