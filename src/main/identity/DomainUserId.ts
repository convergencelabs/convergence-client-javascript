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

import {DomainUserIdentifier} from "./DomainUserIdentifier";
import {Validation} from "../util/Validation";
import {ConvergenceError} from "../util";

/**
 * The different "types" of [[DomainUser]]s in Convergence.
 *
 * @module Users and Identity
 */
export enum DomainUserType {
  /**
   * "normal" domain users are the typical users of your application.
   */
  NORMAL = "normal",

  /**
   * "convergence" users can be thought of as "meta" or admin-level users.
   * Most consuming applications shouldn't need to deal with Convergence users;
   * currently they're only used in the real-time model browser of the Convergence
   * Administration Console.
   */
  CONVERGENCE = "convergence",

  /**
   * Indicates that this user authenticated anonymously and is therefore transient.
   */
  ANONYMOUS = "anonymous"
}

/**
 * This is a convenience class providing utilities to help identity a particular
 * Domain User. A guid is the best means of uniquely identifing a user within a domain,
 * which combines their [[userType]] with [[username]].
 *
 * [[DomainUserId]]s are read-only.
 *
 * @module Users and Identity
 */
export class DomainUserId {

  /**
   * Constructs a "normal" `DomainUserId` by username.
   *
   * @param username the normal user's unique username
   */
  public static normal(username: string): DomainUserId {
    return new DomainUserId(DomainUserType.NORMAL, username);
  }

  /**
   * Constructs a "anonymous" `DomainUserId` by username.
   *
   * @param username the anonymous user's unique username.
   */
  public static anonymous(username: string): DomainUserId {
    return new DomainUserId(DomainUserType.ANONYMOUS, username);
  }

  /**
   * Constructs a "convergence" `DomainUserId` by username.
   *
   * @param username the convergence user's unique username.
   */
  public static convergence(username: string): DomainUserId {
    return new DomainUserId(DomainUserType.CONVERGENCE, username);
  }

  /**
   * Constructs a GUID from the given user type and username.
   *
   * Equivalent to `new DomainUserId(userType, username).toGuid()`
   *
   * @param userType the type of user
   * @param username the user's username
   */
  public static guid(userType: DomainUserType, username: string) {
    return `${userType}:${username}`;
  }

  /**
   * Constructs a DomainUserId from a guid.
   *
   * @param guid the type of user
   *
   * @returns A new DomainUserId, deserialized from the guid.
   * @see guid
   */
  public static fromGuid(guid: string): DomainUserId {
    Validation.assertNonEmptyString(guid, "guid");

    const index = guid.indexOf(":");
    if (index < 0) {
      throw new Error("Invalid guid value. Not separator found: " + guid);
    }

    const userType = DomainUserId.toDomainUserType(guid.substring(0, index));
    const username = guid.substring(index + 1, guid.length)

    return new DomainUserId(userType, username)
  }

  /**
   * Validates a string value is a proper DomainUserType string
   * and returns it. Otherwise will throw and error.
   *
   * @param typeStr The type string to validate.
   * @returns A valid DomainUserType string.
   */
  public static toDomainUserType(typeStr: string): DomainUserType {
    switch (typeStr) {
      case DomainUserType.NORMAL:
        return DomainUserType.NORMAL;
      case DomainUserType.CONVERGENCE:
        return DomainUserType.CONVERGENCE;
      case DomainUserType.ANONYMOUS:
        return DomainUserType.ANONYMOUS;
      default:
        throw new ConvergenceError("Invalid guid value. Unrecognized user type: " + typeStr);
    }
  }

  /**
   * This is a convenience function to construct a `DomainUserId` from a bare username.
   *
   * @param userId a "normal" user's username or DomainUserId
   * @deprecated use of().
   */
  public static toDomainUserId(userId: DomainUserIdentifier): DomainUserId {
    return DomainUserId.of(userId);
  }

  /**
   * This is a convenience function to construct a `DomainUserId` from a bare username.
   *
   * @param userId a "normal" user's username or DomainUserId
   */
  public static of(userId: DomainUserIdentifier): DomainUserId {
    return (userId instanceof DomainUserId) ? userId : DomainUserId.normal(userId);
  }

  /**
   * @hidden
   * @internal
   */
  private readonly _guid: string;

  /**
   * Constructs a `DomainUserId` from the given user type and username.
   *
   * @param userType the type of user
   * @param username the user's username
   */
  constructor(
    public readonly userType: DomainUserType,
    public readonly username: string
  ) {
    Validation.assertString(username, "username");
    this._guid = DomainUserId.guid(this.userType, this.username);
    Object.freeze(this);
  }

  /**
   * Returns a string GUID for this user guaranteed to be unique within this domain.
   */
  public toGuid(): string {
    return this._guid;
  }

  /**
   * Returns true if this user is the same as the given user.
   *
   * @param other another domain user
   */
  public equals(other: DomainUserId): boolean {
    return this.username === other.username && this.userType === other.userType;
  }
}
