import {ConvergenceSession} from "../ConvergenceSession";
import {DomainUser, DomainUserIdentifier} from "./DomainUser";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {UserQuery} from "./UserQuery";
import {UserGroup} from "./UserGroup";
import {DomainUserId} from "./DomainUserId";
import {Validation} from "../util/Validation";
import {domainUserIdToProto, getOrDefaultArray, toOptional, protoToDomainUserId} from "../connection/ProtocolUtil";
import {toDomainUser, toUserFieldCode, toUserGroup} from "./IdentityMessageUtils";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;

/**
 * The fields of a user that are available to be queried on. See [[search]]
 *
 * @module Users and Identity
 */
export type UserField = "username" | "email" | "firstName" | "lastName" | "displayName";

const validSearchFields: UserField[] = ["username", "email", "firstName", "lastName", "displayName"];

/**
 * Provides a suite of utilities for looking up users and groups in the current domain.
 *
 * See some common use cases in the [developer guide](https://docs.convergence.io/guide/identity/overview.html).
 *
 * Note that users and groups cannot (yet) be managed through this service.  See the
 * REST API for domain user and group management.
 *
 * This service can be accessed using [[ConvergenceDomain.identity]].
 *
 * @module Users and Identity
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

  public userExists(userId: DomainUserId): Promise<boolean> {
    // todo add a specific message for this, to avoid sending unnessesary data.
    // also we could use our identity cache to answer this.
    return this.user(userId).then((user) => user !== undefined);
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
      .then(mapUserResultList);
  }

  /**
   * Searches for [[DomainUser]]s based on the provided query configuration.
   *
   * @param query a query configuration including the actual query and fields to search on
   *
   * @returns A promise to be resolved with an array of users, or an empty array
   * if there are no matches
   */
  public search(query: UserQuery): Promise<DomainUser[]> {
    if (query.fields === undefined || query.fields === null ||
      (Array.isArray(query.fields) && (query.fields as string[]).length === 0)) {
      return Promise.reject<DomainUser[]>(
        new Error("Must specify at least one field to search")
      );
    } else if (query.term === undefined || query.term === null) {
      return Promise.reject<DomainUser[]>(
        new Error("Must specify a search term")
      );
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

      return this._connection.request(message).then(mapUserResultList);
    }
  }

  /**
   * Looks up one or more User Groups by their User Group Ids. Each returned
   * User Group will contain the details of the User Group, including an array
   * of users ids for those users that are members of the group.
   *
   * Note: that if any of the provided User Group Ids does not exist, the
   * promise will be rejected.
   *
   * @param ids
   *   An array of UserGroup Id's for the groups to get.
   *
   * @returns
   *   A promise resolved with an array of [[UserGroup]]s that positionally
   *   correspond to the supplied User Group Id's.
   */
  public groups(ids: string[]): Promise<UserGroup[]> {
    Validation.assertNonEmptyArray(ids, "ids");

    const message: IConvergenceMessage = {
      userGroupsRequest: {
        ids
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userGroupsResponse} = response;
      return userGroupsResponse.groupData.map(d => toUserGroup(d));
    });
  }

  /**
   * Looks up a single user group by ID.  Rejects the promise if no group by the
   * provided ID exists.
   *
   * @param id the user group's ID
   *
   * @returns a promise to be resolved if the group exists, otherwise a rejection
   */
  public group(id: string): Promise<UserGroup> {
    return this.groups([id]).then(groups => groups[0]);
  }

  /**
   * Looks up the groups to which the provided user belongs.
   *
   * @param username an existing user's username
   *
   * @returns a promise to be resolved with an array of group IDs to which the given user belongs
   */
  public groupsForUser(username: string): Promise<string[]> {
    return this.groupsForUsers([username])
      .then(users => users[username]);
  }

  /**
   * Looks up the groups to which the provided users belong.
   *
   * @param usernames an array of usernames
   *
   * @returns a promise to be resolved with an array of group IDs to which the given user belongs
   */
  public groupsForUsers(usernames: string[]): Promise<{ [key: string]: string[] }> {
    const userIds = usernames.map(u => domainUserIdToProto(DomainUserId.normal(u)));
    const message: IConvergenceMessage = {
      userGroupsForUsersRequest: {
        users: userIds
      }
    };

    return this._connection.request(message).then((response: IConvergenceMessage) => {
      const {userGroupsForUsersResponse} = response;

      const groupsForUsers = {};
      userGroupsForUsersResponse.userGroups.forEach(userGroupsEntry => {
        if (userGroupsEntry.hasOwnProperty("user")) {
          let domainUserId = protoToDomainUserId(userGroupsEntry.user);
          groupsForUsers[domainUserId.username] = userGroupsEntry.groups;
        }
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

function mapUserResultList(response: IConvergenceMessage): DomainUser[] {
  const {userListResponse} = response;
  const userData = getOrDefaultArray(userListResponse.userData);
  return userData.map(toDomainUser);
}
