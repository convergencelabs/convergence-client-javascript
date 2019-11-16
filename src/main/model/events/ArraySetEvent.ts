/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a value is set on a [[RealTimeArray]].
 *
 * @module Real Time Data
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
