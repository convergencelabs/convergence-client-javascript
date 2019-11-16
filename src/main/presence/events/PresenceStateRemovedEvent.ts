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

import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more key-value pairs of a particular [[DomainUser]]'s
 * presence [[UserPresence.state|state]] were [[PresenceService.removeState|removed]].
 *
 * @module Presence
 */
export class PresenceStateRemovedEvent implements IPresenceEvent {
  public static readonly NAME = "state_removed";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateRemovedEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The keys of the state items that were just removed.
     */
    public readonly keys: string[]
  ) {
    Object.freeze(this);
  }
}
