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

import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivityStateClearedEvent is fired when a remote session clears all an
 * of its state within the [[Activity]].
 *
 * @module Collaboration Awareness
 */
export class ActivityStateClearedEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_cleared";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateClearedEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritDoc
     */
    public readonly activity: Activity,
    /**
     * @inheritDoc
     */
    public readonly user: DomainUser,
    /**
     * @inheritDoc
     */
    public readonly sessionId: string,
    /**
     * @inheritDoc
     */
    public readonly local: boolean,
    /**
     * The old state values prior to being cleared.
     */
    public readonly oldValues: Map<string, any>) {
    Object.freeze(this);
  }
}
