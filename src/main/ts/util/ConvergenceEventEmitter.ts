import {EventEmitter} from "./EventEmitter";
import {ConvergenceEvent} from "./ConvergenceEvent";
import {Observable, Subject} from "rxjs/Rx";

export class ConvergenceEventEmitter extends EventEmitter {

  private _subject: Subject<any>;

  constructor() {
    super();
    this._subject = new Subject();
  }

  emitEvent(event: ConvergenceEvent): ConvergenceEventEmitter {
    Object.freeze(event);
    this.emit(event.name, event);
    this._subject.next(event);
    return <ConvergenceEventEmitter>this;
  }

  eventStream(): Observable<any> {
    return this._subject.asObservable();
  }
}
