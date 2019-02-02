import {ConvergenceSession} from "../ConvergenceSession";
import {DomainUser} from "./DomainUser";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {UserQuery} from "./UserQuery";
import {UserGroup} from "./UserGroup";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {domainUserIdToProto, toOptional} from "../connection/ProtocolUtil";
import {toDomainUser, toUserFieldCode} from "./IdentityMessageUtils";
import {DomainUserId} from "./DomainUserId";
import {Validation} from "../util";

export type UserField = "username" | "email" | "firstName" | "lastName" | "displayName";
const validSearchFields: UserField[] = ["username", "email", "firstName", "lastName", "displayName"];

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
    return this.user(this._connection.session().user().username);
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

  public users(usernames: string[]): Promise<{ [key: string]: DomainUser }> {
    Validation.assertArray(usernames, "usernames");
    if (usernames.length === 0) {
      return Promise.resolve({});
    }

    const unique: string[] = Array.from(new Set(usernames));
    const message: IConvergenceMessage = {
      usersGetRequest: {
        userIds: unique.map(username => {
          return {username};
        })
      }
    };

    return this._connection
      .request(message)
      .then((response: IConvergenceMessage) => {
        const {userListResponse} = response;
        return userListResponse.userData.map(d => toDomainUser(d));
      }).then(users => {
        const mapped: { [key: string]: DomainUser } = {};
        users.forEach(user => {
          mapped[user.username] = user;
        });
        return mapped;
      });
  }

  public search(query: UserQuery): Promise<DomainUser[]> {
    if (query.fields === undefined || query.fields === null ||
      (Array.isArray(query.fields) && (query.fields as string[]).length === 0)) {
      return Promise.reject<DomainUser[]>(new Error("Must specify at least one field to search"));
    } else if (query.term === undefined || query.term === null) {
      return Promise.reject<DomainUser[]>(new Error("Must specify a search delta"));
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
          offset: toOptional(query.offset),
          limit: toOptional(query.limit),
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
    const userIds = usernames.map(u => domainUserIdToProto(DomainUserId.normal(u)));
    const message: IConvergenceMessage = {
      userGroupsForUsersRequest: {
        users: userIds
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userGroupsForUsersResponse} = response;
      const groupData = userGroupsForUsersResponse.userGroups;
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
