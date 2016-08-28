import {ConvergenceEvent} from "./ConvergenceEvent";
import {ObservableEventEmitter} from "./ObservableEventEmitter";
import {Subject} from "rxjs/Rx";

export class SubjectEventEmitter<T extends ConvergenceEvent> extends ObservableEventEmitter<T> {
  private _subject: Subject<T>;

  constructor() {
    super();
    this._subject = new Subject<T>();
    this._setObservable(this._subject.asObservable());
  }

  protected _emitEvent(event: T): void {
    this._subject.next(event);
  }
}
