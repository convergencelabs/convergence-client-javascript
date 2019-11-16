/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more items of a particular [[DomainUser]]'s presence
 * [[UserPresence.state|state]] were [[PresenceService.setState|set]].
 *
 * @module Presence
 */
export class PresenceStateSetEvent implements IPresenceEvent {
  public static readonly NAME = "state_set";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The entire new state (as opposed to only the items that changed) for the
     * [[user]].
     */
    public readonly state: Map<string, any>
  ) {
    Object.freeze(this);
  }
}
