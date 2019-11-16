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

import { DomainUserId } from "./DomainUserId";

/**
 * A group of [[DomainUser]]s.  Contains meta information about the group plus
 * usernames of all the member users.
 *
 * @module Users and Identity
 */
export class UserGroup {

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The ID of the group
     */
    public readonly id: string,

    /**
     * The description of the group, if set
     */
    public readonly description: string,

    /**
     * The usernames of all the users contained in this group.
     */
    public readonly members: string[]
  ) {
    Object.freeze(this);
  }
}
