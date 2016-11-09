import {Session} from "../Session";
import {DomainUser} from "./DomainUser";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {UserLookUpRequest} from "../connection/protocol/user/userLookUps";
import {UserSearchRequest} from "../connection/protocol/user/userLookUps";
import {UserListResponse} from "../connection/protocol/user/userLookUps";
import {UserQuery} from "./UserQuery";

// fixme should the props be camelcase
export var UserField: any = {
  USERNAME: "username",
  EMAIL: "email",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  DISPLAY_NAME: "displayName"
};

var validLookUpFields: string[] = [
  UserField.USERNAME, UserField.EMAIL
];

var validSearchFields: string[] = [
  UserField.USERNAME,
  UserField.EMAIL,
  UserField.FIRST_NAME,
  UserField.LAST_NAME,
  UserField.DISPLAY_NAME];


export class IdentityService {

  constructor(private _connection: ConvergenceConnection) {
  }

  session(): Session {
    return this._connection.session();
  }

  user(username: string): Promise<DomainUser> {
    if (typeof username !== 'string') {
      return Promise.reject<DomainUser>('Must specify a username.');
    }

    return this.users([username]).then((users: DomainUser[]) => {
      if (users.length === 0) {
        return Promise.resolve(<DomainUser>undefined);
      } else if (users.length === 1) {
        return Promise.resolve(users[0]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  userByEmail(email: string): Promise<DomainUser> {
    return this.usersByEmail([email]).then((users: DomainUser[]) => {
      if (users.length === 0) {
        return Promise.resolve(<DomainUser>undefined);
      } else if (users.length === 1) {
        return Promise.resolve(users[0]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  users(usernames: string[]): Promise<{[key: string]: DomainUser}> {
    const unique = [...new Set(usernames)];
    return this._users(unique, UserField.USERNAME).then(users => {
      const mapped: {[key: string]: DomainUser} = {};
      users.forEach(user => {
        mapped[user.username()] = user;
      });
      return mapped;
    });
  }

  usersByEmail(emails: string[]): Promise<{[key: string]: DomainUser}> {
    const unique = [...new Set(emails)];
    return this._users(unique, UserField.EMAIL).then(users => {
      const mapped: {[key: string]: DomainUser} = {};
      users.forEach(user => {
        mapped[user.email()] = user;
      });
      return mapped;
    });
  }

  search(query: UserQuery): Promise<DomainUser[]> {
    if (query.fields === undefined || query.fields === null ||
      (Array.isArray(query.fields) && (<string[]>query.fields).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one field to search"));
    } else if (query.term === undefined || query.term === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a search value"));
    } else {
      let fields: string[] | string = query.fields;
      if (!Array.isArray(query.fields)) {
        fields = [<string>query.fields];
      }

      const orderBy: any = query.orderBy || {};

      const sanitized: string[] = this._sanitizeSearchFields(<string[]>fields);
      const message: UserSearchRequest = {
        type: MessageType.USER_SEARCH_REQUEST,
        fields: sanitized,
        value: query.term,
        offset: query.offset,
        limit: query.limit,
        orderBy: orderBy.field,
        ascending: orderBy.ascending
      };

      return this._connection.request(message).then((response: UserListResponse) => {
        return response.users;
      });
    }
  }

  private _users(values: string | string[], field: string = UserField.USERNAME): Promise<DomainUser[]> {
    // TODO It is only valid to look up by email / username.
    if (field === undefined || field === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a lookup field"));
    } else if (validLookUpFields.indexOf(field) < 0) {
      return Promise.reject<DomainUser[]>(new Error("invalid lookup field"));
    } else if (values === undefined || values === null || (Array.isArray(values) && (<string[]>values).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one value"));
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

  private _sanitizeSearchFields(fields: string[]): string[] {
    var result: string[] = [];
    fields.forEach((field: string) => {
      if (validSearchFields.indexOf(field) < 0) {
        throw new Error("Invalid user search field: " + field);
      }
      if (result.indexOf(field) < 0) {
        result.push(field);
      }
    });
    return result;
  }
}
