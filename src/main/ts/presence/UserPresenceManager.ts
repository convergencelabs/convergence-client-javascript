import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence, UserPresence} from "./UserPresence";
import {Observable, Subscription, BehaviorSubject} from "rxjs/Rx";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {UserPresenceImpl} from "./UserPresenceImpl";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {PresenceAvailabilityChanged} from "../connection/protocol/presence/pressenceAvailability";
import {PresenceStateSet, PresenceStateCleared, PresenceStateRemoved} from "../connection/protocol/presence/presenceState";
import {
  PresenceStateSetEvent, PresenceStateRemovedEvent, PresenceStateClearedEvent,
  PresenceAvailabilityChangedEvent
} from "./events";


export class UserPresenceManager extends ConvergenceEventEmitter<any> implements UserPresence {

  private _presence: UserPresence;
  private _subscriptions: UserPresenceSubscription[];
  private _subscription: Subscription;
  private _subject: BehaviorSubject<UserPresence>;
  private _onUnsubscribe: (string) => void;

  constructor(initialPresence: UserPresence,
              eventStream: Observable<MessageEvent>,
              onUnsubscribe: (string) => void) {
    this._presence = new UserPresenceImpl(
      initialPresence.username(),
      initialPresence.isAvailable(),
      initialPresence.state()
    );

    this._subscriptions = [];

    this._onUnsubscribe = onUnsubscribe;

    this._subscription = eventStream.subscribe(message => {
      this._handleMessage(message);
      this._subject.next(this._presence);
    });

    this._subject = new BehaviorSubject(this._presence);
  }

  username(): string {
    return this._presence.username();
  }

  isAvailable(): boolean {
    return this._presence.isAvailable();
  }

  state(key: string): any
  state(): Map<string, any>
  state(key?: string): any {
    return this._presence.state(key);
  }

  asObservable(): Observable<UserPresence> {
    return this._subject.asObservable();
  }

  subscribe(): UserPresenceSubscription {
    const subscription: UserPresenceSubscription = new UserPresenceSubscription(this);
    this._subscriptions.push(subscription);
    return subscription;
  }

  unsubscribe(subscription: UserPresenceSubscription) {
    this._subscriptions = this._subscriptions.filter(s => s !== subscription);
    if (this._subscriptions.length === 0) {
      this._subscription.unsubscribe();
      this._subject.complete();
    }
  }

  private _handleMessage(messageEvent: MessageEvent): void {
    var message: IncomingProtocolMessage = messageEvent.message;

    switch (message.type) {
      case MessageType.PRESENCE_AVAILABILITY_CHANGED:
        this.setAvailability((<PresenceAvailabilityChanged>message).available);
        break;
      case MessageType.PRESENCE_STATE_SET:
        this.setState((<PresenceStateSet>message).state);
        break;
      case MessageType.PRESENCE_STATE_CLEARED:
        this.clearState();
        break;
      case MessageType.PRESENCE_STATE_REMOVED:
        this.removeState((<PresenceStateRemoved>message).keys);
        break;
      default:
      // fixme error
    }
  }

  setAvailability(availability: boolean): void {
    this._presence =
      new UserPresenceImpl(this._presence.username(), availability, this._presence.state());

    const event = new PresenceAvailabilityChangedEvent(this._presence.username(), availability);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  setState(state: Map<string, any>) {
    // fixme clone
    let newState: Map<string, any> = this._presence.state();
    state.forEach((v, k) => newState.set(k, v));

    this._presence = new UserPresenceImpl(
      this._presence.username(),
      this._presence.isAvailable(),
      newState);

    const event = new PresenceStateSetEvent(this._presence.username(), newState);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  removeState(keys: string[]): void {
    // fixme clone
    let newState: Map<string, any> = this._presence.state();
    keys.forEach(k => newState.delete(k));

    this._presence = new UserPresenceImpl(
      this._presence.username(),
      this._presence.isAvailable(),
      newState);

    const event = new PresenceStateRemovedEvent(this._presence.username(), keys);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  clearState(): void {
    this._presence = new UserPresenceImpl(
      this._presence.username(),
      this._presence.isAvailable(),
      new Map());

    const event = new PresenceStateClearedEvent(this._presence.username());
    this._emitEvent(event);
    this._subject.next(this._presence);
  }
}
