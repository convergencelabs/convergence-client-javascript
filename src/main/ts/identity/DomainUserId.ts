import {DomainUserIdentifier} from "./DomainUser";

export enum DomainUserType {
  NORMAL = "normal",
  CONVERGENCE = "convergence",
  ANONYMOUS = "anonymous"
}

export class DomainUserId {
  public static normal(username: string): DomainUserId {
    return new DomainUserId(DomainUserType.NORMAL, username);
  }

  public static guid(userType: DomainUserType, username: string) {
    return `${userType}:${username}`;
  }

  public static toDomainUserId(userId: DomainUserIdentifier): DomainUserId {
    return (userId instanceof DomainUserId) ? userId : DomainUserId.normal(userId);
  }

  /**
   * @hidden
   * @internal
   */
  private readonly _guid: string;

  constructor(
    public readonly userType: DomainUserType,
    public readonly username: string
  ) {
    this._guid = DomainUserId.guid(this.userType, this.username);
    Object.freeze(this);
  }

  public toGuid(): string {
    return this._guid;
  }

  public equals(other: DomainUserId): boolean {
    return this.username === other.username && this.userType === other.userType;
  }
}
