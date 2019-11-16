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

import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {ObservableElement} from "../observable/ObservableElement";
import {Path} from "../Path";
import {IValueChangedEvent} from "./IValueChangedEvent";
import {DomainUser} from "../../identity";

/**
 * The [[ModelChangedEvent]] is fired by a [[ObservableElement]] when a child
 * element has a change.  This is a convenience event which you can listen to e.g.
 * within a [[RealTimeContainerElement]] when you'd like to know about *any* changes
 * to the data within.
 *
 * @module Real Time Data
 */
export class ModelChangedEvent implements IConvergenceModelValueEvent {
  public static readonly NAME = "model_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelChangedEvent.NAME;

  /**
   * @param element
   * @param relativePath
   * @param childEvent
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritdoc
     */
    public readonly element: ObservableElement<any>,

    /**
     * The user which performed the modification
     */
    public readonly user: DomainUser,

    /**
     * The sessionId corresponding to the session that performed the modification
     */
    public readonly sessionId: string,

    /**
     * @inheritdoc
     */
    public readonly local: boolean,

    /**
     * The [[Path]] of the [[RealTimeElement]] on which the specific event occurred.
     */
    public readonly relativePath: Path,

    /**
     * The actual, more granular event.
     */
    public readonly childEvent: IValueChangedEvent
  ) {
    Object.freeze(this);
  }
}
