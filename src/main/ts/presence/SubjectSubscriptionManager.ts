import {Observable} from "rxjs/Observable";
import {Observer, PartialObserver} from "rxjs/Observer";
import {Subject, Subscription, Subscriber} from "rxjs/Rx";

export class SubjectSubscriptionManager<T> {
  private _subjectMap: Map<string, SubscriptionSubject<T>>;

  constructor(private subscribeFunc: (id: string) => void, private unsubscribeFunc: (id: string) => void) {
    this._subjectMap = new Map<string, SubscriptionSubject<T>>();
  }

  getObservable(id: string): Observable<T> {
    return new ProxyObservable<T>(id, this.subscribeFunc, this.unsubscribeFunc, this._subjectMap);
  }

  next(id: string, value: T): void {
    this._subjectMap.get(id).next(value);
  }
}

class ProxyObservable<T> extends Observable<T> {
  private _observer: Observer<T>;
  private _id: string;
  private _subscribeFunc: (id: string) => void;
  private _unsubscribeFunc: (id: string) => void;
  private _subjectMap: Map<string, SubscriptionSubject<T>>;

  constructor(id: string, subscribeFunc: (id: string) => void, unsubscribeFunc: (id: string) => void, subjectMap: Map<string, SubscriptionSubject<T>>) {
    super((observer) => {
      this._observer = observer;
    });
    this._id = id;
    this._subscribeFunc = subscribeFunc;
    this._unsubscribeFunc = unsubscribeFunc;
    this._subjectMap = subjectMap;
  }

  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription {
    var internalSubscription = super.subscribe(observerOrNext, error, complete);
    var subject: SubscriptionSubject<T> = this._subjectMap.get(this._id);
    if (subject === undefined) {
      this._subscribeFunc(this._id);
      var subject = new SubscriptionSubject<T>(this._id, this._unsubscribeFunc, this._subjectMap);
      this._subjectMap.set(this._id, subject);
    }
    var externalSubscription = subject.subscribe(this._observer);

    return new Subscription(() => {
      internalSubscription.unsubscribe();
      externalSubscription.unsubscribe();
    });
  }
}

class SubscriptionSubject<T> extends Subject<T> {
  private _subscriptionCount: number = 0;
  private _unsubscribedCallback: (id: string) => void;
  private _id: string;
  private _subjectMap: Map<string, SubscriptionSubject<T>>;

  constructor(id: string, unsubscribedCallback: (id: string) => void, subjectMap: Map<string, SubscriptionSubject<T>>) {
    super();
    this._id = id;
    this._unsubscribedCallback = unsubscribedCallback;
    this._subjectMap = subjectMap;
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._subscriptionCount++;
    return super._subscribe(subscriber)
      .add(() => this._handleUnsubscribe());
  }

  private _handleUnsubscribe(): void {
    if (--this._subscriptionCount === 0) {
      this._subjectMap.delete(this._id);
      this._unsubscribedCallback(this._id);
    }
  }
}