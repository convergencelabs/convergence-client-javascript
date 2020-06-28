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
 * Emitted when as offline synchronization progresses. It informs the
 * consumer as to how many models still need to sync to the server.
 *
 * @module Real Time Data
 *
 * @experimental
 */
export class OfflineModelsSyncProgressEvent implements IConvergenceEvent {
  public static readonly NAME = "offline_models_sync_progress";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelsSyncProgressEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The number of models that must sync up to the server.
     */
    public readonly modelsToSync: number
  ) {
    Object.freeze(this);
  }
}
