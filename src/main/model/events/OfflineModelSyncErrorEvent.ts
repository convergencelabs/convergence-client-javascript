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
import {RealTimeModel} from "../rt";

/**
 * Emitted when there is an error synchronizing offline changes for
 * a particular model up to th Convergence Server.
 *
 * @module Real Time Data
 *
 * @experimental
 */
export class OfflineModelSyncErrorEvent implements IConvergenceEvent {
  public static readonly NAME = "offline_model_sync_error";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelSyncErrorEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The id of the model that caused the error.
     */
    public readonly modelId: string,
    /**
     * A message describing the error.
     */
    public readonly message: string,

    /**
     * The model the error originated form, if it was resyncing.  This will be
     * undefined, if the model was only being deleted. If present it can be
     * used to capture the data from the model.
     */
    public readonly model?: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
