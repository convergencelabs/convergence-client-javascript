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
import {IConvergenceEvent} from "../../util";
import {DomainUser} from "../../identity";

/**
 * IActivityEvent is the base interface for all events fired by the Activity
 * subsystem. All Activity events will implement this interface.
 *
 * @module Collaboration Awareness
 */
export interface IActivityEvent extends IConvergenceEvent {
  /**
   * The Activity that this event relates to.
   */
  readonly activity: Activity;

  /**
   * The username of the user originated this event.
   */
  readonly user: DomainUser;

  /**
   * The session id of the session that originated this event.
   */
  readonly sessionId: string;

  /**
   * Will be true if this event is from the local user / session;
   * false otherwise.
   */
  readonly local: boolean;
}
