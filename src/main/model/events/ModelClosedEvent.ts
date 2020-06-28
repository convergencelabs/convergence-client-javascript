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
 * The [[ModelClosedEvent]] is fired when a Model is closed either by the
 * client or the server.
 *
 * @module Real Time Data
 */
export class ModelClosedEvent implements IModelEvent {
  public static readonly NAME = "closed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelClosedEvent.NAME;

  /**
   * @param src
   * @param local
   * @param reason
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] or [[HistoricalModel]] that was closed.
     */
    public readonly src: ObservableModel,

    /**
     * True if this event was triggered locally.
     */
    public readonly local: boolean,

    /**
     * In the event that the model was closed unexpectedly, a reason may be provided.
     */
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }
}
