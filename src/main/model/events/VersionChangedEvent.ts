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

import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * Emitted when a [[RealTimeModel]]'s version changes.  Subscribe to this directly
 * on a [[RealTimeModel]] rather than a [[RealTimeElement]] within.
 *
 * Note that on a local change, this won't be fired until the version is updated on the
 * server and a response message sent back to the client.
 *
 * @module Real Time Data
 */
export class VersionChangedEvent implements IModelEvent {
  public static readonly NAME = "version_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = VersionChangedEvent.NAME;

  /**
   * @param src
   * @param version
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] or [[HistoricalModel]] whose version just changed
     */
    public readonly src: ObservableModel,

    /**
     * The new version of the model
     */
    public readonly version: number
  ) {
    Object.freeze(this);
  }
}
