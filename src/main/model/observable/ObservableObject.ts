/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";

/**
 * The events that could be emitted by a [[RealTimeObject]] or [[HistoricalObject]].
 *
 * @module Real Time Data
 */
export interface ObservableObjectEvents extends ObservableElementEvents {
  /**
   * Emitted when a value is [[RealTimeObject.set|initially set or replaced]] on a [[RealTimeObject]].
   * See [[ObjectSetEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly SET: string;

  /**
   * Emitted when a key-value pair is [[RealTimeObject.remove|removed]] from a [[RealTimeObject]].
   * See [[ObjectRemoveEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REMOVE: string;

  /**
   * Emitted when the entire [[RealTimeObject.value|value]] of a [[RealTimeObject]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[ObjectSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module Real Time Data
 */
export const ObservableObjectEventConstants: ObservableObjectEvents = {
  SET: "set",
  REMOVE: "remove",
  ...ObservableElementEventConstants
};
Object.freeze(ObservableObjectEventConstants);

/**
 * @module Real Time Data
 */
export interface ObservableObject extends ObservableContainerElement<{ [key: string]: any }> {

  get(key: string): ObservableElement<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: ObservableElement<any>, key?: string) => void): void;
}
