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

import {IConvergenceEvent} from "../../util";
import {RealTimeModel} from "../rt";
import {ModelPermissions} from "../ModelPermissions";

/**
 * Emitted when the permissions on a model are modified. See [[ModelPermissionManager]]
 * to manage permissions programmatically.
 *
 * @module Real Time Data
 */
export class ModelPermissionsChangedEvent implements IConvergenceEvent {
  public static readonly NAME = "permissions_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelPermissionsChangedEvent.NAME;

  /**
   * @param model
   * @param permissions
   * @param changes
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model whose permissions changed
     */
    public readonly model: RealTimeModel,

    /**
     * The permissions that changed
     */
    public readonly permissions: ModelPermissions,

    /**
     * A list of the specific permissions that were changed: One or more of
     * `read`, `write`, `remove` or `manage`
     */
    public readonly changes: string[]
  ) {
    Object.freeze(this);
  }
}
