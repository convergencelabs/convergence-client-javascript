import {ConvergenceSession} from "../ConvergenceSession";
import {DomainUser, DomainUserIdentifier} from "./DomainUser";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {UserQuery} from "./UserQuery";
import {UserGroup} from "./UserGroup";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {domainUserIdToProto, toOptional} from "../connection/ProtocolUtil";
import {toDomainUser, toUserFieldCode} from "./IdentityMessageUtils";
import {DomainUserId} from "./DomainUserId";
import {Validation} from "../util";

export type UserField = "username" | "email" | "firstName" | "lastName" | "displayName";
const validSearchFields: UserField[] = ["username", "email", "firstName", "lastName", "displayName"];

/**
 * Provides a suite of utilities for looking up users and groups in the current domain.
 *
 * See some common use cases in the [developer guide](https://docs.convergence.io/guide/identity/overview.html).
 *
 * This service can be accessed using [[ConvergenceDomain.identity]].
 */
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

  /**
   * The current session.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Returns a promise that resolves with some information about the current user.
   *
   * @returns a promise to be resolved with the current user's information
   */
  public profile(): Promise<DomainUser> {
    return this.user(this._connection.session().user().userId);
  }

  /**
   * Looks up a user by either a username or [[DomainUserId]].
   *
   * @param userId either a username string or [[DomainUserId]]
   *
   * @returns a promise which will be resolved with a [[DomainUser]] if one is found,
   * otherwise `undefined`
   */
  public user(userId: DomainUserIdentifier): Promise<DomainUser> {
    if (Validation.isNotSet(userId)) {
      return Promise.reject<DomainUser>("Must specify a user id.");
    }

    return this.users([userId]).then((users: DomainUser[]) => {
      if (users.length === 0) {
        return Promise.resolve(undefined);
      } else if (users.length === 1) {
        return Promise.resolve(users[0]);
      } else {
        return Promise.reject<DomainUser>(new Error("Error getting user."));
      }
    });
  }

  /**
   * Looks up multiple users at once by username or [[DomainUserId]].
   *
   * @param users an array of username strings, [[DomainUserId]]s, or any combination therein
   *
   * @returns a promise which will be resolved with an array of length equal to `users`,
   * with a [[DomainUser]] or `undefined` for each user query
   */
  public users(users: DomainUserIdentifier[]): Promise<DomainUser[]> {
    Validation.assertArray(users, "users");
    if (users.length === 0) {
      return Promise.resolve([]);
    }

    const guids: DomainUserId[] = users.map((id: DomainUserIdentifier) => {
      if (!(id instanceof DomainUserId)) {
        return DomainUserId.normal(id);
      }
      return id;
    });

    const unique: DomainUserId[] = Array.from(new Set(guids));
    const message: IConvergenceMessage = {
      usersGetRequest: {
        userIds: unique.map(domainUserIdToProto)
      }
    };

    return this._connection
      .request(message)
      .then((response: IConvergenceMessage) => {
        const {userListResponse} = response;
        return userListResponse.userData.map(d => toDomainUser(d));
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
