import Session from "../Session";
import DomainUser from "./DomainUser";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import {OutgoingProtocolRequestMessage} from "../connection/protocol/protocol";
import MessageType from "../connection/protocol/MessageType";

var UserSearchField: any = {
  USERID: "userid",
  USERNAME: "username",
  EMAIL: "email",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName"
};

var allFields: string[] = [
  UserSearchField.USERID,
  UserSearchField.USERNAME,
  UserSearchField.EMAIL,
  UserSearchField.FIRST_NAME,
  UserSearchField.LAST_NAME];


export default class IdentityService {

  constructor(private _connection: ConvergenceConnection) {
  }

  session(): Session {
    return this._connection.session();
  }

  getUser(userId: string): Promise<DomainUser> {
    return this.findUsers([UserSearchField.USERID], [userId]).then((users: Array<DomainUser>) => {
      if (users.length > 1) {
        return Promise.reject(new Error("User look up failed"));
      } else {
        return Promise.resolve(users[0]);
      }
    });
  }

  findUsers(fields: string[], terms: string[]): Promise<Array<DomainUser>> {
    var sanitized: string[] = this._sanitizeSearchFields(fields);
    var message: UserLookUpRequest = {
      type: MessageType.USER_SEARCH_REQUEST,
      fields: sanitized,
      terms: terms
    };
    return this._connection.request(message);
  }

  private _sanitizeSearchFields(fields: string[]): string[] {
    var result: string[] = [];
    fields.forEach((field: string) => {
      if (allFields.indexOf(field) < 0) {
        throw new Error("Invalid user search field: " + field);
      }
      if (result.indexOf(field) < 0) {
        result.push(field);
      }
    });
    return result;
  }
}

interface UserLookUpRequest extends OutgoingProtocolRequestMessage {
  fields: string[];
  terms: string[];
}
