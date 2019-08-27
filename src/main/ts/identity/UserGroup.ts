import { DomainUserId } from "./DomainUserId";

/**
 * A group of [[DomainUser]]s.  Contains meta information about the group plus
 * usernames of all the member users.
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
