import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {UserPresence} from "./UserPresence";
import {Observable, Subscription, BehaviorSubject} from "rxjs/Rx";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {UserPresenceImpl} from "./UserPresenceImpl";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {PresenceAvailabilityChanged} from "../connection/protocol/presence/pressenceAvailability";
import {
  PresenceStateSet,
  PresenceStateRemoved
} from "../connection/protocol/presence/presenceState";
import {
  PresenceStateSetEvent, PresenceStateRemovedEvent, PresenceStateClearedEvent,
  PresenceAvailabilityChangedEvent
} from "./events";

export class UserPresenceManager extends ConvergenceEventEmitter<any> implements UserPresence {

  private _presence: UserPresence;
  private _subscriptions: UserPresenceSubscription[];
  private _messageSubscription: Subscription;
  private _subject: BehaviorSubject<UserPresence>;
  private _onUnsubscribe: (username: string) => void;

  constructor(initialPresence: UserPresence,
              eventStream: Observable<MessageEvent>,
              onUnsubscribe: (username: string) => void) {
    super();

    this._presence = new UserPresenceImpl(
      initialPresence.username(),
      initialPresence.isAvailable(),
      initialPresence.state()
    );

    this._subscriptions = [];
    this._onUnsubscribe = onUnsubscribe;
    this._messageSubscription = eventStream.subscribe(message => this._handleMessage(message));
    this._subject = new BehaviorSubject(this._presence);
  }

  public username(): string {
    return this._presence.username();
  }

  public isAvailable(): boolean {
    return this._presence.isAvailable();
  }

  public state(key: string): any
  public state(): Map<string, any>
  public state(key?: string): any {
    return this._presence.state(key);
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
      this._onUnsubscribe(this.username());
    }
  }

  public availability(availability: boolean): void {
    this._presence =
      new UserPresenceImpl(this._presence.username(), availability, this._presence.state());

    const event: PresenceAvailabilityChangedEvent =
      new PresenceAvailabilityChangedEvent(this._presence.username(), availability);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public set(state: Map<string, any>): void {
    // fixme clone
    let newState: Map<string, any> = this._presence.state();
    state.forEach((v, k) => newState.set(k, v));

    this._presence = new UserPresenceImpl(
      this._presence.username(),
      this._presence.isAvailable(),
      newState);

    const event: PresenceStateSetEvent = new PresenceStateSetEvent(this._presence.username(), newState);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public remove(keys: string[]): void {
    // fixme clone
    let newState: Map<string, any> = this._presence.state();
    keys.forEach(k => newState.delete(k));

    this._presence = new UserPresenceImpl(
      this._presence.username(),
      this._presence.isAvailable(),
      newState);

    const event: PresenceStateRemovedEvent = new PresenceStateRemovedEvent(this._presence.username(), keys);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public clear(): void {
    this._presence = new UserPresenceImpl(
      this._presence.username(),
      this._presence.isAvailable(),
      new Map<string, any>());

    const event: PresenceStateClearedEvent = new PresenceStateClearedEvent(this._presence.username());
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  private _handleMessage(messageEvent: MessageEvent): void {
    const message: IncomingProtocolMessage = messageEvent.message;
    switch (message.type) {
      case MessageType.PRESENCE_AVAILABILITY_CHANGED:
        this.availability((<PresenceAvailabilityChanged> message).available);
        break;
      case MessageType.PRESENCE_STATE_SET:
        this.set((<PresenceStateSet> message).state);
        break;
      case MessageType.PRESENCE_STATE_CLEARED:
        this.clear();
        break;
      case MessageType.PRESENCE_STATE_REMOVED:
        this.remove((<PresenceStateRemoved> message).keys);
        break;
      default:
      // fixme error
    }
  }
}
