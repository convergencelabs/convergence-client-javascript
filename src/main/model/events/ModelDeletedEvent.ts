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

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] has been deleted.
 *
 * @module Real Time Data
 */
export class ModelDeletedEvent implements IModelEvent {
  public static readonly NAME = "deleted";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelDeletedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that was deleted.
     */
    public readonly src: RealTimeModel,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,

    /**
     * In the event that the model was deleted remotely, a reason may be provided.
     */
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }
}
