/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
