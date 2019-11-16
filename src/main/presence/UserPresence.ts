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

import {deepClone} from "../util/ObjectUtils";
import {DomainUser} from "../identity";

/**
 * The [[UserPresence]] class represents the Presence state of a single domain
 * user within Convergence. An instance of [[UserPresence]] can be obtained
 * from the [[PresenceService]].
 *
 * @module Presence
 */
export class UserPresence {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @param user
   * @param available
   * @param state
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The domain user that this instance represents the presence of.
     */
    public readonly user: DomainUser,

    /**
     * True if the user is online in at least one session, false otherwise.
     */
    public readonly available: boolean, state: Map<string, any>
  ) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  /**
   * Returns the current state associated with this user's online presence.
   */
  public get state(): Map<string, any> {
    return deepClone(this._state);
  }
}
