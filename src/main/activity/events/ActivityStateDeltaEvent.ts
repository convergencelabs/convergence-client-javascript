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

import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivityStateSetEvent is fired when a remote session sets one or
 * elements from its state within the [[Activity]]. This is a batch
 * event that summarizes all the changes made to a participants
 * state in a single action.
 *
 * @module Activities
 */
export class ActivityStateDeltaEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_delta";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateDeltaEvent.EVENT_NAME;

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
     * The state that was modified.
     */
    public readonly values: Map<string, any>,
    /**
     * Indicates if the full state map was set.
     */
    public readonly complete: boolean,
    /**
     * The keys of state that was removed.
     */
    public readonly removed: string[],
    /**
     * The previous values of any state that was removed or set.
     */
    public readonly oldValues: Map<string, any>) {
    Object.freeze(this);
  }
}
