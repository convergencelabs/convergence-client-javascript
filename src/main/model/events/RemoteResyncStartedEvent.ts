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
import {DomainUser} from "../../identity";

/**
 * The [[RemoteResyncStartedEvent]] is fired when a remote client has
 * started a resynchronization process after being offline.
 *
 * @module Real Time Data
 */
export class RemoteResyncStartedEvent implements IConvergenceEvent {
  public static readonly NAME = "remote_resync_started";

  /**
   * @inheritdoc
   */
  public readonly name: string = RemoteResyncStartedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model for which the remote client has started a resync.
     */
    public readonly model: RealTimeModel,

    /**
     * The session id of the remote client.
     */
    public readonly sessionId?: string,

    /**
     * The user of the remote client.
     */
    public readonly user?: DomainUser
  ) {
    Object.freeze(this);
  }
}
