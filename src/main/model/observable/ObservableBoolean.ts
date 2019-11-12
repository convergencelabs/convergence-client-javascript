/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableBooleanEventConstants} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeBoolean]] or [[HistoricalBoolean]].
 *
 * @category Real Time Data Subsystem
 */
export interface ObservableBooleanEvents extends ObservableElementEvents {
  /**
   * Emitted when the entire [[RealTimeBoolean.value|value]] of a [[RealTimeBoolean]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[BooleanSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableBoolean extends ObservableElement<boolean> {

}
