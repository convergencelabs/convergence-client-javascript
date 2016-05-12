export default class DomainUser {
  constructor(public uid: string,
              public username: string,
              public firstName: string,
              public lastName: string,
              public email: string) {
    Object.freeze(this);
  }
}
