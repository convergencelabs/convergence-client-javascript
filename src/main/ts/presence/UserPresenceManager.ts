import {ConvergenceEventEmitter, StringMap} from "../util/";
import {UserPresence} from "./UserPresence";
import {Observable, Subscription, BehaviorSubject} from "rxjs";
import {UserPresenceSubscription} from "./UserPresenceSubscription";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {
  PresenceAvailabilityChangedEvent,
  PresenceStateSetEvent,
  PresenceStateRemovedEvent,
  PresenceStateClearedEvent
} from "./events/";
import {deepClone} from "../util/ObjectUtils";
import {DomainUserId} from "../identity/DomainUserId";
import {DomainUser} from "../identity";

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
  private readonly _onUnsubscribe: (user: DomainUserId) => void;

  /**
   * @hidden
   * @internal
   */
  constructor(initialPresence: UserPresence,
              eventStream: Observable<MessageEvent>,
              onUnsubscribe: (userId: DomainUserId) => void) {
    super();

    this._presence = new UserPresence(
      initialPresence.user,
      initialPresence.available,
      initialPresence.state
    );

    this._subscriptions = [];
    this._onUnsubscribe = onUnsubscribe;
    this._messageSubscription = eventStream.subscribe(message => this._handleMessage(message));
    this._subject = new BehaviorSubject(this._presence);
  }

  public user(): DomainUser {
    return this._presence.user;
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
      this._onUnsubscribe(this.user().userId);
    }
  }

  public availability(availability: boolean): void {
    this._presence =
      new UserPresence(this._presence.user, availability, this._presence.state);

    const event: PresenceAvailabilityChangedEvent =
      new PresenceAvailabilityChangedEvent(this._presence.user, availability);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public set(state: Map<string, any>): void {
    const newState: Map<string, any> = this._presence.state;
    state.forEach((v, k) => newState.set(k, deepClone(v)));

    this._presence = new UserPresence(
      this._presence.user,
      this._presence.available,
      newState);

    const event: PresenceStateSetEvent = new PresenceStateSetEvent(this._presence.user, newState);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public remove(keys: string[]): void {
    const newState: Map<string, any> = this._presence.state;
    keys.forEach(k => newState.delete(k));

    this._presence = new UserPresence(
      this._presence.user,
      this._presence.available,
      newState);

    const event: PresenceStateRemovedEvent = new PresenceStateRemovedEvent(this._presence.user, keys);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  public clear(): void {
    this._presence = new UserPresence(
      this._presence.user,
      this._presence.available,
      new Map<string, any>());

    const event: PresenceStateClearedEvent = new PresenceStateClearedEvent(this._presence.user);
    this._emitEvent(event);
    this._subject.next(this._presence);
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message = messageEvent.message;
    if (message.presenceAvailabilityChanged) {
      const {available} = message.presenceAvailabilityChanged;
      this.availability(available);
    } else if (message.presenceStateSet) {
      const {state} = message.presenceStateSet;
      this.set(StringMap.objectToMap(state));
    } else if (message.presenceStateCleared) {
      this.clear();
    } else if (message.presenceStateRemoved) {
      const {keys} = message.presenceStateRemoved;
      this.remove(keys);
    }
  }
}
