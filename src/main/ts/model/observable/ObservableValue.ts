import {Path} from "../ot/Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ObservableModel} from "./ObservableModel";
import {ModelValueType} from "../ModelValueType";
import {RealTimeValue} from "../rt/RealTimeValue";

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
  src: RealTimeValue<any>;
}

export interface ValueDetachedEvent extends ConvergenceModelValueEvent {
  src: RealTimeValue<any>;
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
}

export interface ModelChangedEvent extends ConvergenceEvent {
  relativePath: Path;
  childEvent: ValueChangedEvent;
}
