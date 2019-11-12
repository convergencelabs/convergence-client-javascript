/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";

/**
 * The events that could be emitted by a [[RealTimeArray]] or [[HistoricalArray]].
 *
 * @category Real Time Data Subsystem
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
 * @category Real Time Data Subsystem
 */
export const ObservableArrayEventConstants: ObservableArrayEvents = {
  ...ObservableElementEventConstants,
  INSERT: "insert",
  REMOVE: "remove",
  SET: "set",
  REORDER: "reorder"};
Object.freeze(ObservableArrayEventConstants);

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableArray extends ObservableContainerElement<any[]> {
  get(index: number): ObservableElement<any>;

  length(): number;

  forEach(callback: (value: ObservableElement<any>, index?: number) => void): void;
}
