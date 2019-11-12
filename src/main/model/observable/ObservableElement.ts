/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Path, PathElement} from "../Path";
import {IConvergenceEvent} from "../../util/IConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableModel} from "./ObservableModel";
import {ObservableContainerElement} from "./ObservableContainerElement";

/**
 * @module Real Time Data
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
 * @module Real Time Data
 */
export const ObservableElementEventConstants: ObservableElementEvents = {
  VALUE: "value",
  DETACHED: "detached",
  REFERENCE: "reference",
  MODEL_CHANGED: "model_changed"
};
Object.freeze(ObservableElementEventConstants);

/**
 * @module Real Time Data
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
