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
 * Emitted when a value is removed from a [[RealTimeArray]].
 *
 * @category Real Time Data Subsystem
 */
export class ArrayRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";

  /**
   * @inheritdoc
   */
  public readonly name: string = ArrayRemoveEvent.NAME;

  /**
   * @param element
   * @param index
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
     * The index whose value was removed (and possibly replaced by another left-shifted value)
     */
    public readonly index: number,

    /**
     * A read-only representation of the [[RealTimeElement]] that was removed
     */
    public readonly oldValue: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}
