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
 * Emitted when when local offline changes have successfully synchronized
 * with the Convergence Server.
 *
 * @module Real Time Data
 *
 * @experimental
 */
export class OfflineModelSyncCompletedEvent implements IConvergenceEvent {
  public static readonly NAME = "offline_model_sync_completed";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelSyncCompletedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor() {
    Object.freeze(this);
  }
}
