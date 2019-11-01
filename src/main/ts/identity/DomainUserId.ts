import {DomainUserIdentifier} from "./DomainUser";

/**
 * The different "types" of [[DomainUser]]s in Convergence.
 *
 * @module UsersAndIdentity
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
 * @module UsersAndIdentity
 */
export class DomainUserId {

  /**
   * Constructs a "normal" `DomainUserId` by username.
   *
   * @param username an existing DomainUser's username
   */
  public static normal(username: string): DomainUserId {
    return new DomainUserId(DomainUserType.NORMAL, username);
  }

  /**
   * Constructs a "anonymous" `DomainUserId` by username.
   *
   * @param username the anonymous unique users username.
   */
  public static anonymous(username: string): DomainUserId {
    return new DomainUserId(DomainUserType.ANONYMOUS, username);
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
   * This is a convenience function to construct a `DomainUserId` from a bare username.
   *
   * @param userId a "normal" user's username or DomainUserId
   */
  public static toDomainUserId(userId: DomainUserIdentifier): DomainUserId {
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
