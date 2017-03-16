import {Path} from "../Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableModel} from "./ObservableModel";

export interface ObservableElementEvents {
  readonly VALUE: string;
  readonly DETACHED: string;
  readonly MODEL_CHANGED: string;
  readonly REFERENCE: string;
}

export const ObservableElementEventConstants: ObservableElementEvents = {
  VALUE: "value",
  DETACHED: "detached",
  REFERENCE: "reference",
  MODEL_CHANGED: "model_changed"
};
Object.freeze(ObservableElementEventConstants);

export interface ObservableElement<T> extends ConvergenceEventEmitter<ConvergenceEvent> {
  id(): string;

  type(): string;

  path(): Path;

  isDetached(): boolean;

  isAttached(): boolean;

  value(): T;

  model(): ObservableModel;

  toJSON(): any;
}
