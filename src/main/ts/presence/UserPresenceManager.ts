import {ConvergenceEventEmitter} from "../util/";
import {UserPresence} from "./UserPresence";
import {Observable, Subscription, BehaviorSubject} from "rxjs/Rx";
import {IncomingProtocolMessage} from "../connection/protocol/protocol";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {PresenceAvailabilityChanged} from "../connection/protocol/presence/pressenceAvailability";
import {
  PresenceStateSet,
  PresenceStateRemoved
} from "../connection/protocol/presence/presenceState";
import {
  PresenceAvailabilityChangedEvent,
  PresenceStateSetEvent,
  PresenceStateRemovedEvent,
  PresenceStateClearedEvent
} from "./events/";
import {deepClone} from "../util/ObjectUtils";

export class UserPresenceManager extends ConvergenceEventEmitter<any> {

  /**
   * @internal
   */
  private _presence: UserPresence;

  /**
   * @internal
   */
  private _subscriptions: UserPresenceSubscription[];

  /**
   * @internal
   */
  private readonly _messageSubscription: Subscription;

  /**
   * @internal
   */
  private readonly _subject: BehaviorSubject<UserPresence>;

  /**
   * @internal
   */
  private readonly _onUnsubscribe: (username: string) => void;

  /**
   * @hidden
   * @internal
   */
  constructor(initialPresence: UserPresence,
              eventStream: Observable<MessageEvent>,
              onUnsubscribe: (username: string) => void) {
    super();

    this._presence = new UserPresence(
      initialPresence.username,
      initialPresence.available,
      initialPresence.state
    );

    this._subscriptions = [];
    this._onUnsubscribe = onUnsubscribe;
    this._messageSubscription = eventStream.subscribe(message => this._handleMessage(message));
    this._subject = new BehaviorSubject(this._presence);
  }

  public username(): string {
    return this._presence.username;
  }

  public isAvailable(): boolean {
    return this._presence.available;
  }

  public state(): Map<string, any> {
    return this._presence.state;
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
      new UserPresence(this._presence.username, availability, this._presence.state);

    const event: PresenceAvailabilityChangedEvent =
      new PresenceAvailabilityChangedEvent(this._presence.username, availability);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public set(state: Map<string, any>): void {
    const newState: Map<string, any> = this._presence.state;
    state.forEach((v, k) => newState.set(k, deepClone(v)));

    this._presence = new UserPresence(
      this._presence.username,
      this._presence.available,
      newState);

    const event: PresenceStateSetEvent = new PresenceStateSetEvent(this._presence.username, newState);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public remove(keys: string[]): void {
    const newState: Map<string, any> = this._presence.state;
    keys.forEach(k => newState.delete(k));

    this._presence = new UserPresence(
      this._presence.username,
      this._presence.available,
      newState);

    const event: PresenceStateRemovedEvent = new PresenceStateRemovedEvent(this._presence.username, keys);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public clear(): void {
    this._presence = new UserPresence(
      this._presence.username,
      this._presence.available,
      new Map<string, any>());

    const event: PresenceStateClearedEvent = new PresenceStateClearedEvent(this._presence.username);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message: IncomingProtocolMessage = messageEvent.message;
    switch (message.type) {
      case MessageType.PRESENCE_AVAILABILITY_CHANGED:
        this.availability((message as PresenceAvailabilityChanged).available);
        break;
      case MessageType.PRESENCE_STATE_SET:
        this.set((message as PresenceStateSet).state);
        break;
      case MessageType.PRESENCE_STATE_CLEARED:
        this.clear();
        break;
      case MessageType.PRESENCE_STATE_REMOVED:
        this.remove((message as PresenceStateRemoved).keys);
        break;
      default:
      // fixme error
    }
  }
}
