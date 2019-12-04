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

import {ModelPermissions} from "../../model";

/**
 * @module Offline
 */
export interface IModelMetaData {
  /**
   * The unique id of the model.
   */
  modelId: string;

  /**
   * Whether the model has been marked for offline availability.
   */
  subscribed: boolean;

  /**
   * Whether the model has been downloaded and is available locally.
   */
  available: boolean;

  /**
   * If the offline model was deleted, and should be deleted on the sever
   * once the client connects.
   */
  deleted: boolean;

  /**
   * If the model was created offline and needs to be created at the server
   * when the client connects.
   */
  created: boolean;

  /**
   * If the model has uncommitted local operations that need to be sent to the
   * server when the client connects.
   */
  dirty: boolean;

  details?: {
    collection: string;
    version: number;
    seqNo: number;
    createdTime: Date;
    modifiedTime: Date;
    permissions: ModelPermissions;
  };
}
