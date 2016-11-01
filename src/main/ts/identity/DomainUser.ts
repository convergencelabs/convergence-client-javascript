export class DomainUser {

  private _userType: string;
  private _username: string;
  private _firstName: string;
  private _lastName: string;
  private _displayName: string;
  private _email: string;
  private _anonymous: boolean;
  private _admin: boolean;

  constructor(userType: string,
              username: string,
              firstName: string,
              lastName: string,
              displayName: string,
              email: string) {

    this._userType = userType;
    this._username = username;
    this._firstName = firstName;
    this._lastName = lastName;
    this._displayName = displayName;
    this._email = email;
    this._anonymous = userType === 'anonymous';
    this._admin = userType === 'anonymous';

    Object.freeze(this);
  }

  userType(): string {
    return this._userType;
  }

  username(): string {
    return this._username;
  }

  firstName(): string {
    return this._firstName;
  }

  lastName(): string {
    return this._lastName;
  }

  displayName(): string {
    return this._displayName;
  }

  email(): string {
    return this._email;
  }

  isAdmin(): boolean {
    return this._admin;
  }

  isAnonymous(): boolean {
    return this._anonymous;
  }
}
