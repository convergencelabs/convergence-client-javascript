import {Session} from "../Session";
import {DomainUser} from "./DomainUser";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {UserLookUpRequest} from "../connection/protocol/identity/userLookUps";
import {UserSearchRequest} from "../connection/protocol/identity/userLookUps";
import {UserListResponse} from "../connection/protocol/identity/userLookUps";
import {UserQuery} from "./UserQuery";
import {UserGroup} from "./UserGroup";
import {
  UserGroupsResponse,
  UserGroupsForUsersRequest, UserGroupsRequest, UserGroupsForUsersResponse
} from "../connection/protocol/identity/userGroups";

export interface UserField {
  USERNAME: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  DISPLAY_NAME: string;
}

export const UserFields: UserField = {
  USERNAME: "username",
  EMAIL: "email",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  DISPLAY_NAME: "displayName"
};
Object.freeze(UserFields);

const validLookUpFields: string[] = [
  UserFields.USERNAME, UserFields.EMAIL
];

const validSearchFields: string[] = [
  UserFields.USERNAME,
  UserFields.EMAIL,
  UserFields.FIRST_NAME,
  UserFields.LAST_NAME,
  UserFields.DISPLAY_NAME];

export class IdentityService {

  constructor(private _connection: ConvergenceConnection) {
  }

  public session(): Session {
    return this._connection.session();
  }

  public profile(): Promise<DomainUser> {
    return this.user(this._connection.session().username());
  }

  public user(username: string): Promise<DomainUser> {
    if (typeof username !== "string") {
      return Promise.reject<DomainUser>("Must specify a username.");
    }

    return this.users([username]).then((users: {[key: string]: DomainUser}) => {
      const keys: string[] = Object.keys(users);
      if (keys.length === 0 || keys.length === 1) {
        return Promise.resolve(users[username]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  public userByEmail(email: string): Promise<DomainUser> {
    return this.usersByEmail([email]).then((users: {[hey: string]: DomainUser}) => {
      const keys: string[] = Object.keys(users);
      if (keys.length === 0 || keys.length === 1) {
        return Promise.resolve(users[email]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  public users(usernames: string[]): Promise<{[key: string]: DomainUser}> {
    const unique: string[] = Array.from(new Set(usernames));
    return this._users(unique, UserFields.USERNAME).then(users => {
      const mapped: {[key: string]: DomainUser} = {};
      users.forEach(user => {
        mapped[user.username] = user;
      });
      return mapped;
    });
  }

  public usersByEmail(emails: string[]): Promise<{[key: string]: DomainUser}> {
    const unique: string[] = Array.from(new Set(emails));
    return this._users(unique, UserFields.EMAIL).then(users => {
      const mapped: {[key: string]: DomainUser} = {};
      users.forEach(user => {
        mapped[user.email] = user;
      });
      return mapped;
    });
  }

  public search(query: UserQuery): Promise<DomainUser[]> {
    if (query.fields === undefined || query.fields === null ||
      (Array.isArray(query.fields) && (<string[]> query.fields).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one field to search"));
    } else if (query.term === undefined || query.term === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a search value"));
    } else {
      let fields: string[] | string = query.fields;
      if (!Array.isArray(query.fields)) {
        fields = [<string> query.fields];
      }

      const orderBy: any = query.orderBy || {};

      const sanitized: string[] = this._sanitizeSearchFields(<string[]> fields);
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

  public groups(): Promise<UserGroup[]>
  public groups(ids: string[]): Promise<UserGroup[]>
  public groups(ids?: string[]): Promise<UserGroup[]> {
    const message: UserGroupsRequest = {
      type: MessageType.USER_GROUPS_REQUEST,
      ids
    };

    return this._connection.request(message).then((response: UserGroupsResponse) => {
      return response.groups;
    });
  }

  public group(id: string): Promise<UserGroup> {
    return this.groups([id]).then(groups => groups[0]);
  }

  public groupsForUser(username: string): Promise<string[]> {
    return this.groupsForUsers([username])
      .then(users => users[username]);
  }

  public groupsForUsers(usernames: string[]): Promise<{[key: string]: string[]}> {
    const message: UserGroupsForUsersRequest = {
      type: MessageType.USER_GROUPS_FOR_USER_REQUEST,
      usernames
    };

    return this._connection.request(message).then((response: UserGroupsForUsersResponse) => {
      return response.groupsByUser;
    });
  }

  private _users(values: string | string[], field: string = UserFields.USERNAME): Promise<DomainUser[]> {
    // TODO It is only valid to look up by email / username.
    if (field === undefined || field === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a lookup field"));
    } else if (validLookUpFields.indexOf(field) < 0) {
      return Promise.reject<DomainUser[]>(new Error("invalid lookup field"));
    } else if (values === undefined || values === null || (Array.isArray(values) && (<string[]> values).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one value"));
    } else {
      if (!Array.isArray(values)) {
        values = [<string> values];
      }

      const message: UserLookUpRequest = {
        type: MessageType.USER_LOOKUP_REQUEST,
        field,
        values: <string[]> values
      };

      return this._connection.request(message).then((response: UserListResponse) => {
        return response.users;
      });
    }
  }

  private _sanitizeSearchFields(fields: string[]): string[] {
    const result: string[] = [];
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
