/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a value is inserted into a [[RealTimeArray]].  This could be from a
 * [[RealTimeArray.insert]], [[RealTimeArray.push]], [[RealTimeArray.unshift]], or some
 * other method.
 *
 * @category Real Time Data Subsystem
 */
export class ArrayInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";

  /**
   * @inheritdoc
   */
  public readonly name: string = ArrayInsertEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param sessionId
   * @param userd
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeArray]] or [[HistoricalArray]] which was modified
     */
    public readonly element: ObservableArray,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
     */
    public readonly local: boolean,

    /**
     * The index at which the new value was inserted
     */
    public readonly index: number,

    /**
     * A read-only representation of the value that was just inserted
     */
    public readonly value: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}
