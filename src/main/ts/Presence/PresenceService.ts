import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {ConvergenceSubject} from "./ConvergenceSubject";
import {UserPresence} from "./UserPresence";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import "rxjs/Operator/last";
import "rxjs/Observable/fromPromise";
import {OutgoingProtocolRequestMessage} from "../connection/protocol/protocol";
import {MessageType} from "../connection/protocol/MessageType";
import {PresenceAvailabilityChanged} from "../connection/protocol/presence/pressenceAvailability";
import {PresenceStateSet} from "../connection/protocol/presence/presenceState";
import {PresenceStateCleared} from "../connection/protocol/presence/presenceState";
import {RequestPresence} from "../connection/protocol/presence/requestPresence";
import {RequestPresenceResponse} from "../connection/protocol/presence/requestPresence";
import {PresenceSetState} from "../../../../build/main/ts/connection/protocol/presence/presenceState";
import {PresenceClearState} from "../../../../build/main/ts/connection/protocol/presence/presenceState";

export class PresenceService extends ConvergenceEventEmitter {

  private _connection: ConvergenceConnection;
  private _userPresences: Map<string, ConvergenceSubject<UserPresence>>;
  private _localPresence: BehaviorSubject<UserPresence>;

  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;
    this._userPresences = new Map<string, ConvergenceSubject<UserPresence>>();
    this._localPresence = new BehaviorSubject<UserPresence>(
      new UserPresence(connection.session().userId(), true, new Map<string, any>())
    );

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
    const newValue: UserPresence = new UserPresence(oldValue.userId(), oldValue.available(), newState);
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
    const newValue: UserPresence = new UserPresence(oldValue.userId(), oldValue.available(), newState);
    this._localPresence.next(newValue);

    this._connection.send(<PresenceClearState>{
      type: MessageType.PRESENCE_CLEAR_STATE,
      key: key
    });
  }

  presence(userIds: string[]): Observable<UserPresence[]> {
    const message: RequestPresence = {
      type: MessageType.PRESENCE_REQUEST,
      userIds: userIds
    };
    return Observable.fromPromise(this._connection.request(message)).map((response: RequestPresenceResponse) => {
      // TODO: Finish this
      return [];
    });
  }

  _subscribeFunction(userId: string): () => void {
    return () => {
      // TODO: Send subscribe???
    };
  }

  _unsubscribeFunction(userId: string): () => void {
    return () => {
      // TODO: Send unsubscribe
      this._userPresences.delete(userId);
    };
  }

  // presenceStream(userId: string): Observable<UserPresence> {
  //  if (!this._userPresences.has(userId)) {
  //    this._userPresences.set(userId, new ConvergenceSubject(this._subscribeFunction(userId), this._unsubscribeFunction(userId)));
  //    const presenceSubRequest: OutgoingProtocolRequestMessage = null;
  //    this._connection.request(presenceSubRequest).then(response => {
  //      // TODO: Handle Response
  //    });
  //  }
  //  return this._userPresences.get(userId).asObservable();
  // }

  presenceStream(userIds: string[]): Observable<UserPresence>[] {
    let userPresences: Observable<UserPresence>[] = [];
    for (var userId of userIds) {
      if (!this._userPresences.has(userId)) {
        this._userPresences.set(userId, new ConvergenceSubject<UserPresence>(
          this._subscribeFunction(userId), this._unsubscribeFunction(userId)));
        const presenceSubRequest: OutgoingProtocolRequestMessage = null;
        this._connection.request(presenceSubRequest).then(response => {
          // TODO: Handle Response
        });
      }
      userPresences.push(this._userPresences.get(userId).asObservable());
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
    const subject: ConvergenceSubject<UserPresence> = this._userPresences.get(messageEvent.userId);
    const oldValue: UserPresence = subject.getValue();
    subject.next(new UserPresence(oldValue.userId(), messageEvent.available, oldValue.state()));
  }

  _stateSet(messageEvent: PresenceStateSet): void {
    if (this.session().userId() === messageEvent.userId) {
      const oldValue: UserPresence = this._localPresence.getValue();
      let newState: Map<string, any> = oldValue.state();
      newState.set(messageEvent.key, messageEvent.value);
      this._localPresence.next(new UserPresence(oldValue.userId(), true, newState));
    } else {
      const subject: ConvergenceSubject<UserPresence> = this._userPresences.get(messageEvent.userId);
      const oldValue: UserPresence = subject.getValue();
      let newState: Map<string, any> = oldValue.state();
      newState.set(messageEvent.key, messageEvent.value);
      subject.next(new UserPresence(oldValue.userId(), oldValue.available(), newState));
    }
  }

  _stateCleared(messageEvent: PresenceStateCleared): void {
    if (this.session().userId() === messageEvent.userId) {
      const oldValue: UserPresence = this._localPresence.getValue();
      let newState: Map<string, any> = oldValue.state();
      newState.delete(messageEvent.key);
      this._localPresence.next(new UserPresence(oldValue.userId(), true, newState));
    } else {
      const subject: ConvergenceSubject<UserPresence> = this._userPresences.get(messageEvent.userId);
      const oldValue: UserPresence = subject.getValue();
      let newState: Map<string, any> = oldValue.state();
      newState.delete(messageEvent.key);
      subject.next(new UserPresence(oldValue.userId(), oldValue.available(), newState));
    }
  }
}
