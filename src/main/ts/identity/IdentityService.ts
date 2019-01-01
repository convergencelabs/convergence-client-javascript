import {ConvergenceSession} from "../ConvergenceSession";
import {DomainUser} from "./DomainUser";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {UserQuery} from "./UserQuery";
import {UserGroup} from "./UserGroup";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {ProtocolUtil} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";
import IDomainUserData = io.convergence.proto.IDomainUserData;

export type UserField = "username" | "email" | "firstName" | "lastName" | "displayName";

const validLookUpFields: UserField[] = ["username", "email"];
const validSearchFields: UserField[] = ["username", "email", "firstName", "lastName", "displayName"];

function toUserFieldCode(field: UserField): number {
  switch (field) {
    case "username":
      return 1;
    case "email":
      return 2;
    case "firstName":
      return 3;
    case "lastName":
      return 4;
    case "displayName":
      return 5;
    default:
      throw new ConvergenceError("Invalid user field: " + field);
  }
}

function toDomainUser(userData: IDomainUserData): DomainUser {
  return new DomainUser(
    userData.userType,
    userData.username,
    ProtocolUtil.fromOptional(userData.firstName),
    ProtocolUtil.fromOptional(userData.lastName),
    ProtocolUtil.fromOptional(userData.displayName),
    ProtocolUtil.fromOptional(userData.email));
}

export class IdentityService {

  /**
   * @internal
   */
  private _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection) {
    this._connection = connection;
  }

  public session(): ConvergenceSession {
    return this._connection.session();
  }

  public profile(): Promise<DomainUser> {
    return this.user(this._connection.session().username());
  }

  public user(username: string): Promise<DomainUser> {
    if (typeof username !== "string") {
      return Promise.reject<DomainUser>("Must specify a username.");
    }

    return this.users([username]).then((users: { [key: string]: DomainUser }) => {
      const keys: string[] = Object.keys(users);
      if (keys.length === 0 || keys.length === 1) {
        return Promise.resolve(users[username]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  public userByEmail(email: string): Promise<DomainUser> {
    return this.usersByEmail([email]).then((users: { [hey: string]: DomainUser }) => {
      const keys: string[] = Object.keys(users);
      if (keys.length === 0 || keys.length === 1) {
        return Promise.resolve(users[email]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  public users(usernames: string[]): Promise<{ [key: string]: DomainUser }> {
    const unique: string[] = Array.from(new Set(usernames));
    return this._users(unique, "username").then(users => {
      const mapped: { [key: string]: DomainUser } = {};
      users.forEach(user => {
        mapped[user.username] = user;
      });
      return mapped;
    });
  }

  public usersByEmail(emails: string[]): Promise<{ [key: string]: DomainUser }> {
    const unique: string[] = Array.from(new Set(emails));
    return this._users(unique, "email").then(users => {
      const mapped: { [key: string]: DomainUser } = {};
      users.forEach(user => {
        mapped[user.email] = user;
      });
      return mapped;
    });
  }

  public search(query: UserQuery): Promise<DomainUser[]> {
    if (query.fields === undefined || query.fields === null ||
      (Array.isArray(query.fields) && (query.fields as string[]).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one field to search"));
    } else if (query.term === undefined || query.term === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a search value"));
    } else {
      const fields: UserField[] = Array.isArray(query.fields) ? query.fields : [query.fields];
      const orderBy: any = query.orderBy || {
        field: "username",
        ascending: true
      };
      const fieldCodes: number[] = this._processSearchFields(fields);
      const message: IConvergenceMessage = {
        userSearchRequest: {
          fields: fieldCodes,
          value: query.term,
          offset: ProtocolUtil.toOptional(query.offset),
          limit: ProtocolUtil.toOptional(query.limit),
          orderField: toUserFieldCode(orderBy.field || "username"),
          ascending: orderBy.ascending
        }
      };

      return this._connection.request(message).then((response: IConvergenceMessage) => {
        const {userListResponse} = response;
        return userListResponse.userData.map(d => toDomainUser(d));
      });
    }
  }

  public groups(): Promise<UserGroup[]>;
  public groups(ids: string[]): Promise<UserGroup[]>;
  public groups(ids?: string[]): Promise<UserGroup[]> {
    const message: IConvergenceMessage = {
      userGroupsRequest: {
        ids
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userGroupsResponse} = response;
      return userGroupsResponse.groupData as UserGroup[];
    });
  }

  public group(id: string): Promise<UserGroup> {
    return this.groups([id]).then(groups => groups[0]);
  }

  public groupsForUser(username: string): Promise<string[]> {
    return this.groupsForUsers([username])
      .then(users => users[username]);
  }

  public groupsForUsers(usernames: string[]): Promise<{ [key: string]: string[] }> {
    const message: IConvergenceMessage = {
      userGroupsForUsersRequest: {
        usernames
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userGroupsForUsersResponse} = response;
      const groupData = userGroupsForUsersResponse.groups;
      const groupsForUsers = {};
      Object.keys(groupData).forEach(username => {
        groupsForUsers[username] = groupData[username].values;
      });
      return groupsForUsers;
    });
  }

  /**
   * @internal
   * @hidden
   */
  private _users(values: string | string[], field: UserField = "username"): Promise<DomainUser[]> {
    // TODO It is only valid to look up by email / username.
    if (field === undefined || field === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a lookup field"));
    } else if (validLookUpFields.indexOf(field) < 0) {
      return Promise.reject<DomainUser[]>(new Error("invalid lookup field"));
    } else if (values === undefined || values === null ||
      (Array.isArray(values) && (values as string[]).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one value"));
    } else {
      if (!Array.isArray(values)) {
        values = [values as string];
      }

      const message: IConvergenceMessage = {
        userLookUpRequest: {
          field: toUserFieldCode(field),
          values: values as string[]
        }
      };

      return this._connection.request(message).then((response: IConvergenceMessage) => {
        const {userListResponse} = response;
        return userListResponse.userData.map(d => toDomainUser(d));
      });
    }
  }

  /**
   * @internal
   * @hidden
   */
  private _processSearchFields(fields: UserField[]): number[] {
    const result: number[] = [];
    fields.forEach((field: UserField) => {
      if (validSearchFields.indexOf(field) < 0) {
        throw new Error("Invalid user search field: " + field);
      }
      const fieldCode = toUserFieldCode(field);
      if (result.indexOf(fieldCode) < 0) {
        result.push(fieldCode);
      }
    });
    return result;
  }
}
