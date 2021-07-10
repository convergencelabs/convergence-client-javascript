/*
 * Copyright (c) 2021 - Convergence Labs, Inc.
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

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

/**
 * Emitted when a portion a [[RealTimeString]] we replaced.
 *
 * See [[RealTimeString.splice]]
 *
 * In this example, note the properties that get printed out in the event subscription:
 *
 * ```typescript
 * model.emitLocalEvents(true);
 *
 * let rtStr = model.elementAt('hello world');
 * console.log(rtStr.value()); // "hello world"
 *
 * rtStr.events().subscribe(function(e) {
 *   console.log('event name:', e.name);
 *   console.log('event local:', e.local);
 *   console.log('splice index:', e.index);
 *   console.log('delete count:', e.deleteCount);
 *   console.log('inserted value:', e.insertValue);
 * });
 *
 * rtStr.splice(6, 5, "everyone");
 * // event name: "splice"
 * // event local: true
 * // splice at index: 1
 * // delete count: 5
 * // inserted value: "everyone"
 * ```
 *
 * @module Real Time Data
 */
export class StringSpliceEvent implements IValueChangedEvent {
  public static readonly NAME = "splice";

  /**
   * @inheritdoc
   */
  public readonly name: string = StringSpliceEvent.NAME;

  /**
   * @param element
   * @param index
   * @param deleteCount
   * @param insertValue
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeString]] or [[HistoricalString]] which was modified
     */
    public readonly element: ObservableString,
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,
    /**
     * @inheritdoc
     */
    public readonly sessionId: string,
    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,
    /**
     * The index at which the character(s) were removed
     */
    public readonly index: number,
    /**
     * The the number of characters from the string that
     * were removed, if any.
     */
    public readonly deleteCount: number,
    /**
     * The value that was inserted into the string at
     * the index, if any.
     */
    public readonly insertValue: string
  ) {
    Object.freeze(this);
  }
}
