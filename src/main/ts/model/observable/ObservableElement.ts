import {Path, PathElement} from "../Path";
import {IConvergenceEvent} from "../../util/IConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableModel} from "./ObservableModel";
import {ObservableContainerElement} from "./ObservableContainerElement";

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

export interface ObservableElement<T> extends ConvergenceEventEmitter<IConvergenceEvent> {
  id(): string;

  type(): string;

  path(): Path;

  relativePath(): PathElement;

  parent(): ObservableContainerElement<any>;

  isDetached(): boolean;

  isAttached(): boolean;

  value(): T;

  model(): ObservableModel;

  toJSON(): any;
}
