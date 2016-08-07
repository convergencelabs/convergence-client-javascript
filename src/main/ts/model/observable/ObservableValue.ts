import {Path} from "../ot/Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {Observable} from "rxjs/Rx";
import {ObservalbeModel} from "./ObservableModel";
import {ConvergenceValueType} from "../ConvergenceValueType";

export interface ObservableValue<T>  {

  id(): string;

  type(): ConvergenceValueType;

  path(): Path;

  model(): ObservalbeModel;

  isDetached(): boolean;

  value(): T;

  events(): Observable<ConvergenceModelValueEvent>
}

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: ObservableValue<any>;
}

export interface ValueDetachedEvent extends ConvergenceModelValueEvent {
  src: ObservableValue<any>;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
  version: number;
  timestamp: number;
}

export interface ModelChangeEvent extends ConvergenceEvent {
  relativePath: Path;
  childEvent: ValueChangedEvent;
}
