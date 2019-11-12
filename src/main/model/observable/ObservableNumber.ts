/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeNumber]] or [[HistoricalNumber]].
 *
 * @category Real Time Data Subsystem
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
 * @category Real Time Data Subsystem
 */
export const ObservableNumberEventConstants: ObservableNumberEvents = {
  DELTA: "delta",
  ...ObservableElementEventConstants
};

Object.freeze(ObservableNumberEventConstants);

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableNumber extends ObservableElement<number> {

}
