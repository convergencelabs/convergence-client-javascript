export class DomainUser {
  constructor(public username: string,
              public firstName: string,
              public lastName: string,
              public displayName: string,
              public email: string) {
    Object.freeze(this);
  }
}
