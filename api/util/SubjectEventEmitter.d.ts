import {ConvergenceEvent} from "./ConvergenceEvent";
import {ObservableEventEmitter} from "./ObservableEventEmitter";
export declare class SubjectEventEmitter<T extends ConvergenceEvent> extends ObservableEventEmitter<T> {
  private _subject;

  constructor();

  protected _emitEvent(event: T): void;
}
