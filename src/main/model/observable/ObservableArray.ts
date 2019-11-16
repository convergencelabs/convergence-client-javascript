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
 * The events that could be emitted by a [[RealTimeArray]] or [[HistoricalArray]].
 *
 * @module Real Time Data
 */
export interface ObservableArrayEvents extends ObservableElementEvents {
  /**
   * Emitted when a new value is [[RealTimeArray.insert|insert]]ed into a [[RealTimeArray]].
   * The emitted event is an [[ArrayInsertEvent]].
   *
   * @event
   */
  readonly INSERT: string;

  /**
   * Emitted when an existing value is [[RealTimeArray.remove|removed]] from a [[RealTimeArray]].
   * See [[ArrayRemoveEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REMOVE: string;

  /**
   * Emitted when a value is [[RealTimeArray.set|set]] on an [[RealTimeArray]].
   * See [[ArraySetEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly SET: string;

  /**
   * Emitted when the [[RealTimeArray.reorder|ordering]] of a [[RealTimeArray]] changes.
   * See [[ArrayReorderEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REORDER: string;

  /**
   * Emitted when the entire [[RealTimeArray.value|value]] of a [[RealTimeArray]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[ArraySetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module Real Time Data
 */
export const ObservableArrayEventConstants: ObservableArrayEvents = {
  ...ObservableElementEventConstants,
  INSERT: "insert",
  REMOVE: "remove",
  SET: "set",
  REORDER: "reorder"};
Object.freeze(ObservableArrayEventConstants);

/**
 * @module Real Time Data
 */
export interface ObservableArray extends ObservableContainerElement<any[]> {
  get(index: number): ObservableElement<any>;

  length(): number;

  forEach(callback: (value: ObservableElement<any>, index?: number) => void): void;
}
