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

import {IConvergenceEvent} from "../../util";

/**
 * Emitted when a [[RealTimeModel]] is subscribed to for offline availability
 * and a new version has been downloaded.
 *
 * @module Real Time Data
 *
 * @experimental
 */
export class OfflineModelStatusChangedEvent implements IConvergenceEvent {
  public static readonly NAME = "offline_model_status_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelStatusChangedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The id of the model that was updated.
     */
    public readonly id: string,
    /**
     * If the model is currently subscribed to for proactive downloading.
     */
    public readonly subscribed: boolean,
    /**
     * If he model is available locally.
     */
    public readonly available: boolean,
    /**
     * If is fully stored on the server.
     */
    public readonly synchronized: boolean,
    /**
     * If this model was created locally, and has not yet been pushed to
     * the server.
     */
    public readonly local: boolean
  ) {
    Object.freeze(this);
  }
}
