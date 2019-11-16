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

import {DomainUserId, DomainUserType} from "./DomainUserId";

/**
 * A username or [[DomainUserId]].
 *
 * @module Users and Identity
 */
export type DomainUserIdentifier = string | DomainUserId;

/**
 * A read-only representation of a particular user in Convergence. Any identification information
 * available in Convergence for this user can be accessed here.
 *
 * @module Users and Identity
 */
export class DomainUser {

  /**
   * True if this user connected anonymously.
   */
  public readonly anonymous: boolean;

  /**
   * True if this user is an authenticated Convergence user as opposed to a domain user.
   * Most consuming applications shouldn't need to deal with Convergence users; currently
   * they're only used in the real-time model browser of the Convergence Administration Console.
   */
  public readonly convergence: boolean;

  /**
   * True if this user is an authenticated domain user.
   */
  public readonly normal: boolean;

  /**
   * The unique ID for this user, regardless of user type.
   */
  public readonly userId: DomainUserId;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * This user's type.
     */
    public readonly userType: DomainUserType,

    /**
     * This user's username, unique for this domain.
     */
    public readonly username: string,

    /**
     * This user's first name
     */
    public readonly firstName?: string,

    /**
     * This user's last name
     */
    public readonly lastName?: string,

    /**
     * This user's display name
     */
    public readonly displayName?: string,

    /**
     * This user's email
     */
    public readonly email?: string) {

    this.anonymous = userType === DomainUserType.ANONYMOUS;
    this.convergence = userType === DomainUserType.CONVERGENCE;
    this.normal = userType === DomainUserType.NORMAL;

    this.userId = new DomainUserId(this.userType, this.username);

    Object.freeze(this);
  }
}
