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

import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableDateEventConstants} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeDate]] or [[HistoricalDate]].
 *
 * @module Real Time Data
 */
export interface ObservableDateEvents extends ObservableElementEvents {
  /**
   * Emitted when the entire [[RealTimeDate.value|value]] of a [[RealTimeDate]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[DateSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module Real Time Data
 */
export interface ObservableDate extends ObservableElement<Date> {

}
