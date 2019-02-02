import {DomainUserId, DomainUserType} from "./DomainUserId";

export type DomainUserIdentifier = string | DomainUserId;

export class DomainUser {

  public readonly anonymous: boolean;
  public readonly convergence: boolean;
  public readonly normal: boolean;

  public readonly userId: DomainUserId;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly userType: DomainUserType,
              public readonly username: string,
              public readonly firstName: string,
              public readonly lastName: string,
              public readonly displayName: string,
              public readonly email: string) {

    this.anonymous = userType === DomainUserType.ANONYMOUS;
    this.convergence = userType === DomainUserType.CONVERGENCE;
    this.normal = userType === DomainUserType.NORMAL;

    this.userId = new DomainUserId(this.userType, this.username);

    Object.freeze(this);
  }
}
