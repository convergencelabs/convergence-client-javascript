/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
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
