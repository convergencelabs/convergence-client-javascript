import {Observable, ReplaySubject, Observer, Subscription, Subscriber} from "rxjs/Rx";
import {PartialObserver} from "rxjs/Observer";

export class SubjectSubscriptionManager<T> {
  private _subjectMap: Map<string, SubscriptionSubject<T>>;
  private _subscribeFunc: (id: string) => void;
  private _unsubscribeFunc: (id: string) => void;

  constructor(subscribeFunc: (id: string) => void, unsubscribeFunc: (id: string) => void) {
    this._subjectMap = new Map<string, SubscriptionSubject<T>>();
    this._subscribeFunc = subscribeFunc;
    this._unsubscribeFunc = unsubscribeFunc;
  }

  getObservable(id: string): Observable<T> {
    return new ProxyObservable<T>(this._getSubjectFunc(id));
  }

  next(id: string, value: T): void {
    if (this._subjectMap.has(id)) {
      this._subjectMap.get(id).next(value);
    }
  }

  private _getSubjectFunc(id: string): () => SubscriptionSubject<T> {
    return () => {
      var subject: SubscriptionSubject<T> = this._subjectMap.get(id);
      if (subject === undefined) {
        this._subscribeFunc(id);
        subject = new SubscriptionSubject<T>(this._unsubscribeSubjectFunc(id));
        this._subjectMap.set(id, subject);
      }
      return subject;
    };
  }

  private _unsubscribeSubjectFunc(id: string): () => void {
    return () => {
      this._subjectMap.delete(id);
      this._unsubscribeFunc(id);
    };
  }
}

class ProxyObservable<T> extends Observable<T> {
  private _observer: Observer<T>;
  private _getSubjectFunc: () => SubscriptionSubject<T>;

  constructor(getSubjectFunc: () => SubscriptionSubject<T>) {
    super((observer) => {
      this._observer = observer;
    });
    this._getSubjectFunc = getSubjectFunc;
  }

  subscribe(): Subscription;
  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(next?: any, error?: (error: any) => void, complete?: () => void): Subscription {
    var internalSubscription: Subscription = super.subscribe(next, error, complete);
    var subject: SubscriptionSubject<T> = this._getSubjectFunc();
    var externalSubscription: Subscription = subject.subscribe(this._observer);

    return new Subscription(() => {
      internalSubscription.unsubscribe();
      externalSubscription.unsubscribe();
    });
  }
}

class SubscriptionSubject<T> extends ReplaySubject<T> {
  private _subscriptionCount: number;
  private _unsubscribeSubjectFunc: () => void;

  constructor(unsubscribeSubjectFunc: () => void) {
    super(1);
    this._subscriptionCount = 0;
    this._unsubscribeSubjectFunc = unsubscribeSubjectFunc;
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._subscriptionCount++;
    return super._subscribe(subscriber)
      .add(() => this._handleUnsubscribe());
  }

  private _handleUnsubscribe(): void {
    if (--this._subscriptionCount === 0) {
      this._unsubscribeSubjectFunc();
    }
  }
}
