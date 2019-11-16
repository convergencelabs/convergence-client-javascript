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
 * The events that could be emitted by a [[RealTimeNumber]] or [[HistoricalNumber]].
 *
 * @module Real Time Data
 */
export interface ObservableNumberEvents extends ObservableElementEvents {
  /**
   * Emitted when the value of this number changes
   * (but not explicitly set, listen to [[RealTimeNumberEvents.VALUE]] for that).
   * The emitted event is an [[NumberDeltaEvent]].
   *
   * @event
   */
  readonly DELTA: string;

  /**
   * Emitted when the entire [[RealTimeNumber.value|value]] of a [[RealTimeNumber]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[NumberSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module Real Time Data
 */
export const ObservableNumberEventConstants: ObservableNumberEvents = {
  DELTA: "delta",
  ...ObservableElementEventConstants
};

Object.freeze(ObservableNumberEventConstants);

/**
 * @module Real Time Data
 */
export interface ObservableNumber extends ObservableElement<number> {

}
