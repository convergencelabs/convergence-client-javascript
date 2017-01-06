import {Path} from "../Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export interface ObservableElementEvents {
  readonly VALUE: string;
  readonly DETACHED: string;
  readonly MODEL_CHANGED: string;
  readonly REFERENCE: string;
}

export interface ObservableElement<T> extends ConvergenceEventEmitter<ConvergenceEvent> {
  id(): string;

  type(): string;

  path(): Path;

  isDetached(): boolean;

  value(): T;
}
