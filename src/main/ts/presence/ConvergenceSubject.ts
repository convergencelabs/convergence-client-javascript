import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subscriber} from "rxjs/Subscriber";
import {Subscription} from "rxjs/Subscription";

export class ConvergenceSubject<T> extends ReplaySubject<T> {

  private _subscriptionCount: number = 0;
  private _onSubscribe: () => void;
  private _onUnsubscribed: () => void;
  private _value: T;

  constructor(onSubscribe: () => void, onUnsubscribe: () => void) {
    super(1);
    this._onSubscribe = onSubscribe;
    this._onUnsubscribed = onUnsubscribe;
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    if (this._subscriptionCount === 0) {
      this._onSubscribe();
    }
    this._subscriptionCount++;
    return super._subscribe(subscriber)
      .add(() => this._handleUnsubscribe());
  }

  private _handleUnsubscribe(): void {
    if (--this._subscriptionCount === 0) {
      this._onUnsubscribed();
    }
  }

  next(value: T): void {
    super.next(value);
  }

  getValue(): T {
    return this._value;
  }
}
