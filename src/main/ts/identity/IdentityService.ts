import Session from "../Session";
import DomainUser from "./DomainUser";
import ConvergenceConnection from "../connection/ConvergenceConnection";

export default class IdentityService {

  constructor(private _connection: ConvergenceConnection) {
  }

  session(): Session {
    return this._connection.session();
  }

  userByUserId(userId: string): Promise<DomainUser> {
    return Promise.reject(null);
  }

  usersByUserId(userIds: Array<string>): Promise<Array<DomainUser>> {
    return Promise.reject(null);
  }

  userByUsername(username: string): Promise<DomainUser> {
    return Promise.reject(null);
  }

  usersByUserUsername(usernames: Array<string>): Promise<Array<DomainUser>> {
    return Promise.reject(null);
  }

  userByEmail(email: string): Promise<DomainUser> {
    return Promise.reject(null);
  }

  usersByEmail(emails: Array<string>): Promise<Array<DomainUser>> {
    return Promise.reject(null);
  }
}
