export class DomainUser {

  public readonly anonymous: boolean;
  public readonly admin: boolean;

  constructor(public readonly userType: string,
              public readonly username: string,
              public readonly firstName: string,
              public readonly lastName: string,
              public readonly displayName: string,
              public readonly email: string) {

    this.anonymous = userType === "anonymous";
    this.admin = userType === "admin";

    Object.freeze(this);
  }
}
