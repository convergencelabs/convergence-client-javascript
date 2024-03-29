/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
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

import {RealTimeElement} from "./RealTimeElement";
import {DateNode} from "../internal/DateNode";
import {DateSetOperation} from "../ot/ops/DateSetOperation";
import {RealTimeModel} from "./RealTimeModel";
import {ModelNodeEvent, DateNodeSetValueEvent} from "../internal/events";
import {ModelEventCallbacks} from "../internal/ModelEventCallbacks";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {
  ObservableDate,
  ObservableDateEvents,
  ObservableDateEventConstants
} from "../observable/ObservableDate";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * An enumeration of the events that could be emitted by a [[RealTimeDate]].
 *
 * @module Real Time Data
 */
export interface RealTimeDateEvents extends ObservableDateEvents {
}

/**
 * A distributed date.  This is provided to give dates and timestamps first-class
 * support, as opposed to just using an epoch number or standard ISO string.
 *
 * The underlying value is a native Javascript
 * [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).
 *
 * See [[RealTimeDateEvents]] for the events that can be emitted on remote
 * changes to this object.
 *
 * See the
 * [developer guide](https://guide.convergence.io/models/data/real-time-date.html)
 * for the most common use cases.
 *
 * @module Real Time Data
 */
export class RealTimeDate extends RealTimeElement<Date> implements ObservableDate {

  public static readonly Events: RealTimeDateEvents = ObservableDateEventConstants;

  /**
   * Constructs a new RealTimeDate.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: DateNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof DateNodeSetValueEvent) {
          this._sendOperation(new DateSetOperation(this.id(), false, event.value));
        }
      }
    });
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Date values do not process references");
  }
}
