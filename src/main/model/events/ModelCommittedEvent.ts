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

import {RealTimeModel} from "../rt";
import {IModelEvent} from "./IModelEvent";

/**
 * The [[ModelCommittedEvent]] is fired when a model has unacknowledged local
 * modifications to the model, and then all modifications are acknowledged by
 * the server.
 *
 * @module Real Time Data
 */
export class ModelCommittedEvent implements IModelEvent {
  public static readonly NAME = "committed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelCommittedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model model that emitted the event.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}
