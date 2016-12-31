import {Path} from "../Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export interface ObservableElement<T> extends ConvergenceEventEmitter<ConvergenceEvent> {
  id(): string;

  type(): string;

  path(): Path;

  isDetached(): boolean;

  value(): T;
}
