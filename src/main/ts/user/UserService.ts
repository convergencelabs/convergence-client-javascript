import Session from "../Session";
import DomainUser from "./DomainUser";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import MessageType from "../connection/protocol/MessageType";
import {UserLookUpRequest} from "../connection/protocol/user/UserLookUpRequest";
import {UserLookUpResponse} from "../connection/protocol/user/UserLookUpRequest";

var UserSearchField: any = {
  USERID: "userid",
  USERNAME: "username",
  EMAIL: "email",
  FIRST_NAME: "firstname",
  LAST_NAME: "lastname"
};

var allFields: string[] = [
  UserSearchField.USERID,
  UserSearchField.USERNAME,
  UserSearchField.EMAIL,
  UserSearchField.FIRST_NAME,
  UserSearchField.LAST_NAME];


export default class UserService {

  constructor(private _connection: ConvergenceConnection) {
  }

  session(): Session {
    return this._connection.session();
  }

  getUser(userId: string): Promise<DomainUser> {
    if (userId === undefined || userId === null) {
      return Promise.reject(new Error("Must specify a userId"));
    } else {
      return this.findUsers([UserSearchField.USERID], [userId]).then((users: DomainUser[]) => {
        if (users.length === 0) {
          return Promise.resolve(<DomainUser>undefined);
        } else if (users.length === 1 && users[0].uid === userId) {
          return Promise.resolve(users[0]);
        } else {
          return Promise.reject(new Error("User look up failed"));
        }
      });
    }
  }

  findUsers(fields: string | string[], terms: string | string[]): Promise<DomainUser[]> {
    if (fields === undefined || fields === null || (Array.isArray(fields) && (<string[]>fields).length === 0)) {
      return Promise.reject(new Error("Must specify at least one field"));
    } else if (terms === undefined || terms === null || (Array.isArray(terms) && (<string[]>terms).length === 0)) {
      return Promise.reject(new Error("Must specify at least one keyword"));
    } else {
      if (!Array.isArray(fields)) {
        fields = [<string>fields];
      }

      if (!Array.isArray(terms)) {
        terms = [<string>terms];
      }

      var sanitized: string[] = this._sanitizeSearchFields(<string[]>fields);
      var message: UserLookUpRequest = {
        type: MessageType.USER_LOOKUP_REQUEST,
        fields: <string[]>sanitized,
        terms: <string[]>terms
      };

      return this._connection.request(message).then((response: UserLookUpResponse) => {
        return response.users;
      });
    }
  }

  private _sanitizeSearchFields(fields: string[]): string[] {
    var result: string[] = [];
    fields.forEach((field: string) => {
      var lower: string = field.toLowerCase();
      if (allFields.indexOf(lower) < 0) {
        throw new Error("Invalid user search field: " + lower);
      }
      if (result.indexOf(lower) < 0) {
        result.push(lower);
      }
    });
    return result;
  }
}
