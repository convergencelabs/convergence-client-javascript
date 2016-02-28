import {Promise} from 'es6-promise';

import Session from "../Session";
import DomainUser from "./DomainUser";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import MessageType from "../connection/protocol/MessageType";
import {UserLookUpRequest} from "../connection/protocol/user/userLookUps";
import {UserSearchRequest} from "../connection/protocol/user/userLookUps";
import {UserListResponse} from "../connection/protocol/user/userLookUps";

export var UserField: any = {
  USERID: "userid",
  USERNAME: "username",
  EMAIL: "email",
  FIRST_NAME: "firstname",
  LAST_NAME: "lastname"
};

var validLookUpFields: string[] = [
  UserField.USERID, UserField.USERNAME, UserField.EMAIL
];

var validSearchFields: string[] = [
  UserField.USERID,
  UserField.USERNAME,
  UserField.EMAIL,
  UserField.FIRST_NAME,
  UserField.LAST_NAME];


export default class UserService {

  constructor(private _connection: ConvergenceConnection) {
  }

  session(): Session {
    return this._connection.session();
  }

  getUser(value: string, field?: string): Promise<DomainUser> {
    return this.getUsers(value, field).then((users: DomainUser[]) => {
      if (users.length === 0) {
        return Promise.resolve(<DomainUser>undefined);
      } else if (users.length === 1) {
        return Promise.resolve(users[0]);
      } else {
        return Promise.reject(new Error("Error getting user."));
      }
    });
  }

  getUsers(values: string | string[], field: string = UserField.USERID): Promise<DomainUser[]> {
    if (field === undefined || field === null) {
      return Promise.reject(new Error("Must specify a lookup field"));
    } else if (validLookUpFields.indexOf(field) < 0) {
      return Promise.reject(new Error("invalid lookup field"));
    } else if (values === undefined || values === null || (Array.isArray(values) && (<string[]>values).length === 0)) {
      return Promise.reject(new Error("Must specify at least one value"));
    } else {
      if (!Array.isArray(values)) {
        values = [<string>values];
      }

      var message: UserLookUpRequest = {
        type: MessageType.USER_LOOKUP_REQUEST,
        field: field,
        values: <string[]>values
      };

      return this._connection.request(message).then((response: UserListResponse) => {
        return response.users;
      });
    }
  }

  searchUsers(fields: string | string[],
              value: string,
              offset?: number,
              limit?: number,
              orderBy?: string,
              ascending?: boolean): Promise<DomainUser[]> {
    if (fields === undefined || fields === null || (Array.isArray(fields) && (<string[]>fields).length === 0)) {
      return Promise.reject(new Error("Must specify at least one field to search"));
    } else if (value === undefined || value === null) {
      return Promise.reject(new Error("Must specify a search value"));
    } else {
      if (!Array.isArray(fields)) {
        fields = [<string>fields];
      }

      var sanitized: string[] = this._sanitizeSearchFields(<string[]>fields);
      var message: UserSearchRequest = {
        type: MessageType.USER_SEARCH_REQUEST,
        fields: sanitized,
        value: value,
        offset: offset,
        limit: limit,
        orderBy: orderBy,
        ascending: ascending
      };

      return this._connection.request(message).then((response: UserListResponse) => {
        return response.users;
      });
    }
  }

  private _sanitizeSearchFields(fields: string[]): string[] {
    var result: string[] = [];
    fields.forEach((field: string) => {
      var lower: string = field.toLowerCase();
      if (validSearchFields.indexOf(lower) < 0) {
        throw new Error("Invalid user search field: " + lower);
      }
      if (result.indexOf(lower) < 0) {
        result.push(lower);
      }
    });
    return result;
  }
}
