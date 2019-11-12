/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a value is set on a [[RealTimeArray]].
 *
 * @category Real Time Data Subsystem
 */
export class ArraySetEvent implements IValueChangedEvent {
  public static readonly NAME = "set";

  /**
   * @inheritdoc
   */
  public readonly name: string = ArraySetEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param oldValue
   * @param sessionId
   * @param user
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
     * The index at whose value was set (replaced)
     */
    public readonly index: number,

    /**
     * A read-only representation of the new value
     */
    public readonly value: ObservableElement<any>,

    /**
     * A read-only representation of the previous value at this index, which has been
     * replaced by `value`
     */
    public readonly oldValue: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}
