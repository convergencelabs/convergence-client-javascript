/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
