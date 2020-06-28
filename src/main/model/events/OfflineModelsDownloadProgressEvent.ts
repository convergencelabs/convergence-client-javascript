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
 * Emitted when the number of models needing to be downloaded changes either
 * because the subscriptions changed or because a model downloaded.
 *
 * @module Real Time Data
 *
 * @experimental
 */
export class OfflineModelsDownloadProgressEvent implements IConvergenceEvent {
  public static readonly NAME = "offline_models_download_progress";

  /**
   * @inheritdoc
   */
  public readonly name: string = OfflineModelsDownloadProgressEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The number of models left to download.
     */
    public readonly modelsToDownload: number
  ) {
    Object.freeze(this);
  }
}
