import {Path, PathElement} from "../Path";
import {IConvergenceEvent} from "../../util/IConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableModel} from "./ObservableModel";
import {ObservableContainerElement} from "./ObservableContainerElement";

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableElementEvents {

  /**
   * Emitted when the [[RealTimeElement.value|value]] of a [[RealTimeElement]] is set.
   * See the [[IValueChangedEvent]] interface.
   *
   * @event
   */
  readonly VALUE: string;

  /**
   * Emitted when this element becomes detached, which typically happens when
   * the element is removed from its parent.
   * An [[ElementDetachedEvent]] is the actual emitted event.
   *
   * @event
   */
  readonly DETACHED: string;

  /**
   * Emitted when any child element of this element has a change.
   * See [[ModelChangedEvent]] for details.
   *
   * @event
   */
  readonly MODEL_CHANGED: string;

  /**
   * Emitted when a remote [reference](https://docs.convergence.io/guide/models/references/references.html)
   * is created on this [[RealTimeElement]].  See [[RemoteReferenceCreatedEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REFERENCE: string;
}

/**
 * @category Real Time Data Subsystem
 */
export const ObservableElementEventConstants: ObservableElementEvents = {
  VALUE: "value",
  DETACHED: "detached",
  REFERENCE: "reference",
  MODEL_CHANGED: "model_changed"
};
Object.freeze(ObservableElementEventConstants);

/**
 * @category Real Time Data Subsystem
 */
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
