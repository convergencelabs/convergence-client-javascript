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
import {NullNode} from "../internal/NullNode";
import {RealTimeModel} from "./RealTimeModel";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ObservableNull, ObservableNullEvents, ObservableNullEventConstants} from "../observable/ObservableNull";
import {ModelEventCallbacks} from "../internal/ModelEventCallbacks";
import {RemoteReferenceEvent} from "../reference/RemoteReferenceEvent";
import {IdentityCache} from "../../identity/IdentityCache";

/**
 * @module Real Time Data
 */
export interface RealTimeNullEvents extends ObservableNullEvents {
}

/**
 * This is a convenience object that wraps a javascript `null`. These are returned
 * when a [[RealTimeObject]] or [[RealTimeArray]] contains a null value. The `value()`
 * of this is always `null` and cannot be changed.
 *
 * See [[RealTimeNullEvents]] for the events that can be emitted on remote
 * changes to this object.
 *
 * More information is in the
 * [developer guide](https://docs.convergence.io/guide/models/data/real-time-null.html).
 *
 * @module Real Time Data
 */
export class RealTimeNull extends RealTimeElement<void> implements ObservableNull {

  public static readonly Events: RealTimeNullEvents = ObservableNullEventConstants;

  /**
   * Constructs a new RealTimeNull.
   *
   * @hidden
   * @internal
   */
  constructor(delegate: NullNode,
              callbacks: ModelEventCallbacks,
              wrapperFactory: RealTimeWrapperFactory,
              model: RealTimeModel,
              identityCache: IdentityCache) {
    super(delegate, callbacks, wrapperFactory, model, [], identityCache);
  }

  /**
   * @param event
   *
   * @private
   * @hidden
   * @internal
   */
  public handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Null values do not process references");
  }
}
