import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {io} from "@convergence-internal/convergence-proto";
import {StringMap} from "../util";
import {domainUserIdToProto, domainUserTypeToProto, getOrDefaultArray} from "../connection/ProtocolUtil";
import {DomainUserId, DomainUserType} from "../identity/";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IUserPermissionsEntry = io.convergence.proto.IUserPermissionsEntry;
import IPermissionsList = io.convergence.proto.IPermissionsList;
import { mapObjectValues } from "../util/ObjectUtils";

export type ChatPermission =
  "create_chat"
  | "remove_chat"
  | "join_chat"
  | "leave_chat"
  | "add_chat_user"
  | "remove_chat_user"
  | "set_chat_name"
  | "set_topic"
  | "manage_chat_permissions";

type MapLikeChatPermissions = Map<string, ChatPermission[]> |
                              { [key: string]: ChatPermission[] };

const CHAT = 1;

/**
 * Allows getting and setting permissions for the various capabilities of [[Chat]]s.
 * The specific permissions are defined in [[ChatPermission]].  Permissions can be
 * assigned per-[[DomainUser]], per-[[UserGroup]], or for everybody
 * ([[setWorldPermissions]]).
 *
 * Generally speaking, more specific permissions override less-specific ones.
 */
export class ChatPermissionManager {

  /**
   * @internal
   */
  private readonly _chatId: string;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string, connection: ConvergenceConnection) {
    this._chatId = chatId;
    this._connection = connection;
  }

  /**
   * The [[Chat]] ID to which these permissions apply.
   */
  get chatId() {
    return this._chatId;
  }

  /**
   * Returns the *resolved* permissions for the current user for this [[chatId]].
   * Resolved means computed from the set of any relevant `world`, `group` or `user`
   * permissions.
   */
  public getPermissions(): Promise<ChatPermission[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getClientPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getClientPermissionsResponse} = response;
      return getOrDefaultArray(getClientPermissionsResponse.permissions as ChatPermission[]);
    });
  }

  /**
   * WORLD permissions
   */

  /**
   * Adds the given permissions to any existing WORLD permissions for this [[chatId]].
   *
   * @param permissions an array of permission strings
   *
   * @returns
   *   A promise if successful
   */
  public addWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        world: permissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Removes the given permissions from any existing WORLD permissions for this [[chatId]].
   *
   * @param permissions an array of permission strings
   *
   * @returns
   *   A promise if successful
   */
  public removeWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        world: permissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Sets the given permissions for WORLD for this [[chatId]].
   *
   * @param permissions an array of permission strings
   *
   * @returns
   *   A promise if successful
   */
  public setWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        world: permissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Returns the permissions for WORLD for this [[chatId]].
   *
   * @returns
   *   A promise, which resolves with an array of permission strings
   */
  public getWorldPermissions(): Promise<ChatPermission[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getWorldPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getWorldPermissionsResponse} = response;
      return getOrDefaultArray(getWorldPermissionsResponse.permissions as ChatPermission[]);
    });
  }

  /**
   * USER permissions
   */

  /**
   * Adds the given permissions to any existing permissions for this [[chatId]] for all
   * given users.
   *
   * @param permissions
   *   an object, mapping usernames to an array of desired permission strings to be added
   *
   * @returns
   *   A promise if successful
   */
  public addUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public addUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public addUserPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let map = StringMap.coerceToMap<ChatPermission[]>(permissions);

    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: this._permissionsMapToPermissionEntries(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Removes the given permissions from any of the provided users' permissions for this
   * [[chatId]].
   *
   * @param permissions
   *   An object, mapping usernames to an array of desired permission strings to be removed
   *
   * @returns
   *   A promise if successful
   */
  public removeUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public removeUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public removeUserPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<ChatPermission[]>(permissions);

    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: this._permissionsMapToPermissionEntries(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Sets the given permissions for the given users for this [[chatId]].
   *
   * @param permissions
   *   an object which maps one or more usernames to their new set of permissions
   *
   * @returns
   *   A promise if successful
   */
  public setUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public setUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public setUserPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<ChatPermission[]>(permissions);

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: this._permissionsMapToPermissionEntries(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Returns the permissions for all users for this [[chatId]].
   *
   * @returns
   *   A promise, which resolves with a map of permission strings per username.
   */
  public getAllUserPermissions(): Promise<Map<string, ChatPermission[]>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getAllUserPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllUserPermissionsResponse} = response;
      return this._permissionsEntriesToUserMap(getAllUserPermissionsResponse.users);
    });
  }

  /**
   * Returns the permissions for the given user for this [[chatId]].
   *
   * @param username an existing user's username
   *
   * @returns
   *   A promise, which resolves with an array of permission strings
   */
  public getUserPermissions(username: string): Promise<ChatPermission[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getUserPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: domainUserIdToProto(DomainUserId.normal(username))
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getUserPermissionsResponse} = response;
      return getOrDefaultArray(getUserPermissionsResponse.permissions as ChatPermission[]);
    });
  }

  /**
   * GROUP permissions
   */

  /**
   * Adds the given permissions to any existing permissions for this [[chatId]] for all
   * given groups.
   *
   * @param permissions
   *   an object, mapping group IDs to an array of desired permission strings to be added
   *
   * @returns
   *   A promise if successful
   */
  public addGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public addGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public addGroupPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: permissionsByGroup
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Removes the given permissions from any of the provided groups' permissions for this
   * [[chatId]].
   *
   * @param permissions
   *   An object, mapping group IDs to an array of desired permission strings to be removed
   *
   * @returns
   *   A promise if successful
   */
  public removeGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public removeGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public removeGroupPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: permissionsByGroup
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Sets the given permissions for the given groups for this [[chatId]].
   *
   * @param permissions
   *   an object which maps one or more group IDs to their new set of permissions
   *
   * @returns
   *   A promise if successful
   */
  public setGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public setGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public setGroupPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: permissionsByGroup
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Returns the permissions for all groups for this [[chatId]].
   *
   * @returns
   *   A promise, which resolves with a map of permission strings per group ID.
   */
  public getAllGroupPermissions(): Promise<Map<string, ChatPermission[]>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getAllGroupPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllGroupPermissionsResponse} = response;

      let permissions = mapObjectValues(getAllGroupPermissionsResponse.groups, permissionsList => {
        return getOrDefaultArray(permissionsList.values as ChatPermission[]);
      });

      return StringMap.objectToMap(permissions);
    });
  }

  /**
   * Returns the permissions for the given group for this [[chatId]].
   *
   * @param groupId an existing group ID
   *
   * @returns
   *   A promise, which resolves with an array of permission strings
   */
  public getGroupPermissions(groupId: string): Promise<ChatPermission[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getGroupPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        groupId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getGroupPermissionsResponse} = response;
      return getOrDefaultArray(getGroupPermissionsResponse.permissions as ChatPermission[]);
    });
  }

  /**
   * @internal
   */
  private _permissionsMapToPermissionEntries(map: Map<string, ChatPermission[]>): IUserPermissionsEntry[] {
    const userPermissions: IUserPermissionsEntry[] = [];
    map.forEach((userPerms, username) => {
      userPermissions.push({
        user: {userType: domainUserTypeToProto(DomainUserType.NORMAL), username},
        permissions: userPerms
      });
    });
    return userPermissions;
  }

  /**
   * @internal
   */
  private _permissionsEntriesToUserMap(entries: IUserPermissionsEntry[]): Map<string, ChatPermission[]> {
    const userPermissions = new Map<string, ChatPermission[]>();

    entries.forEach((entry: IUserPermissionsEntry) => {
      const username = entry.user.username;
      let permissions = getOrDefaultArray(entry.permissions as ChatPermission[]);
      userPermissions.set(username, permissions);
    });

    return userPermissions;
  }

  /**
   * @internal
   */
  private _coercePermissionsToGroupedProtoPermissionList(
    permissions: MapLikeChatPermissions): {[group: string]: IPermissionsList} {
      let groupedPermissions = StringMap.coerceToObject<ChatPermission[]>(permissions);
      return mapObjectValues(groupedPermissions, permissionsArr => {
        return {
          values: permissionsArr
        };
      });
    }
}
