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

/**
 * The events that could be emitted by a [[RealTimeString]] or [[HistoricalString]].
 *
 * @module Real Time Data
 */
export interface ObservableStringEvents extends ObservableElementEvents {
  /**
   * Emitted when zero or more characters are [[RealTimeString.insert|inserted]] into a [[RealTimeString]].
   * See [[StringInsertEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly INSERT: string;

  /**
   * Emitted when characters are [[RealTimeString.remove|removed]] on a [[RealTimeString]].
   * See [[StringRemoveEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REMOVE: string;

  /**
   * Emitted when characters are [[RealTimeString.splice|spliced]] on a [[RealTimeString]].
   * See [[StringSpliceEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly SPLICE: string;

  /**
   * Emitted when the entire [[RealTimeString.value|value]] of a [[RealTimeString]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[StringSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module Real Time Data
 */
export const ObservableStringEventConstants: ObservableStringEvents = {
  INSERT: "insert",
  REMOVE: "remove",
  SPLICE: "splice",
  ...ObservableElementEventConstants
};
Object.freeze(ObservableStringEventConstants);

/**
 * @module Real Time Data
 */
export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
