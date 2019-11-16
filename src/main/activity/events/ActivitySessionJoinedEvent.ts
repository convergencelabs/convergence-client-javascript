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

import {ActivityParticipant} from "../ActivityParticipant";
import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivitySessionJoinedEvent is fired when a remote session joins an
 * [[Activity]].
 *
 * @module Collaboration Awareness
 */
export class ActivitySessionJoinedEvent implements IActivityEvent {
  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "session_joined";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivitySessionJoinedEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   * @inheritDoc
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
     * The participant that this event relates to.
     */
    public readonly participant: ActivityParticipant) {
    Object.freeze(this);
  }
}
