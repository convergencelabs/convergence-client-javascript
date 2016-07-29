import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {UserPresence} from "./UserPresence";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/last";
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
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

export class PresenceService extends ConvergenceEventEmitter {

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

  presence(usernames: string[]): Observable<UserPresence[]> {
    const message: RequestPresence = {
      type: MessageType.PRESENCE_REQUEST,
      usernames: usernames
    };
    return Observable.fromPromise(this._connection.request(message)).map((response: RequestPresenceResponse) => {
      return response.userPresences;
    });
  }

  presenceStream(usernames: string[]): Observable<UserPresence>[] {
    let userPresences: Observable<UserPresence>[] = [];
    for (var username of usernames) {
      userPresences.push(this._subManager.getObservable(username));
    }
    return userPresences;
  }

  _handleMessage(messageEvent: MessageEvent): void {
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

  _availabilityChanged(messageEvent: PresenceAvailabilityChanged): void {
    const oldValue: UserPresence = this._userPresences.get(messageEvent.username);
    this._subManager.next(oldValue.username(), new UserPresence(oldValue.username(), messageEvent.available, oldValue.state()));
  }

  _stateSet(messageEvent: PresenceStateSet): void {
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

  _stateCleared(messageEvent: PresenceStateCleared): void {
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
