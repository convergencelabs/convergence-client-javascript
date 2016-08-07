import {Path} from "../ot/Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ObservableModel} from "./ObservableModel";
import {ModelValueType} from "../ModelValueType";

export interface ObservableValue<T>  {

  id(): string;

  type(): ModelValueType;

  path(): Path;

  model(): ObservableModel;

  isDetached(): boolean;

  data(): T;

  // events(): Observable<ConvergenceModelValueEvent>;
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

export interface ModelChangedEvent extends ConvergenceEvent {
  relativePath: Path;
  childEvent: ValueChangedEvent;
}
