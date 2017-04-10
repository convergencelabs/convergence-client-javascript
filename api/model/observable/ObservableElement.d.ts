import {Path, PathElement} from "../Path";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableModel} from "./ObservableModel";
import {ObservableContainerElement} from "./ObservableContainerElement";

export interface ObservableElementEvents {
  readonly VALUE: string;
  readonly DETACHED: string;
  readonly MODEL_CHANGED: string;
  readonly REFERENCE: string;
}

export const ObservableElementEventConstants: ObservableElementEvents;

export interface ObservableElement<T> extends ConvergenceEventEmitter<ConvergenceEvent> {
  id(): string;

  type(): string;

  path(): Path;

  relativePath(): PathElement;

  parent(): ObservableContainerElement<any>;

  isAttached(): boolean;

  isDetached(): boolean;

  value(): T;

  model(): ObservableModel;

  toJSON(): any;
}
