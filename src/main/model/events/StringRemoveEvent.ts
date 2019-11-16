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
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more characters were removed from a [[RealTimeString]].
 * See [[RealTimeString.remove]]
 *
 * In this example, note the properties that get printed out in the event subscription:
 *
 * ```typescript
 * model.emitLocalEvents(true);
 *
 * let rtStr = model.elementAt('foo');
 * rtStr.value() // "bar"
 *
 * rtStr.events().subscribe(function(e) {
 *   console.log('event name:', e.name);
 *   console.log('event local?', e.local);
 *   console.log('removed at index', e.index);
 *   console.log('removed value:', e.value);
 * });
 *
 * rtStr.remove(1, 2);
 * // event name: "remove"
 * // event local? true
 * // removed at index 1
 * // removed value: "ar"
 * ```
 *
 * @module Real Time Data
 */
export class StringRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";

  /**
   * @inheritdoc
   */
  public readonly name: string = StringRemoveEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
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
     * The actual substring that was removed
     */
    public readonly value: string
  ) {
    Object.freeze(this);
  }
}
