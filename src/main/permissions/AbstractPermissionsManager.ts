/*
 * Copyright (c) 2021 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {StringMap, StringMapLike} from "../util/StringMap";
import {domainUserIdToProto, domainUserTypeToProto, getOrDefaultArray} from "../connection/ProtocolUtil";
import {DomainUserId, DomainUserType} from "../identity";
import {mapObjectValues} from "../util/ObjectUtils";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IUserPermissionsEntry = com.convergencelabs.convergence.proto.core.IUserPermissionsEntry;
import IPermissionsList = com.convergencelabs.convergence.proto.core.IPermissionsList;
import IPermissionTarget = com.convergencelabs.convergence.proto.core.IPermissionTarget;


export abstract class AbstractPermissionManager<T extends string> {

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  protected constructor(connection: ConvergenceConnection) {
    this._connection = connection;
  }

  /**
   * Returns the *resolved* permissions for the current user for this [[chatId]].
   * Resolved means computed from the set of any relevant `world`, `group` or `user`
   * permissions.
   */
  public getPermissions(): Promise<T[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      resolvePermissionsForConnectedSessionRequest: {
        target: this._getTarget()
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {resolvePermissionsForConnectedSessionResponse} = response;
      return getOrDefaultArray(resolvePermissionsForConnectedSessionResponse.permissions as T[]);
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
  public addWorldPermissions(permissions: T[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        target: this._getTarget(),
        world: permissions as string[]
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
  public removeWorldPermissions(permissions: T[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        target: this._getTarget(),
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
  public setWorldPermissions(permissions: T[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        target: this._getTarget(),
        world: {
          permissions
        }
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
  public getWorldPermissions(): Promise<T[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getWorldPermissionsRequest: {
        target: this._getTarget(),
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getWorldPermissionsResponse} = response;
      return getOrDefaultArray(getWorldPermissionsResponse.permissions as T[]);
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
  public addUserPermissions(permissions: StringMapLike<T>): Promise<void> {
    this._connection.session().assertOnline();

    let map = StringMap.coerceToMap<T[]>(permissions);

    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        target: this._getTarget(),
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
  public removeUserPermissions(permissions: StringMapLike<T>): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<T[]>(permissions);

    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        target: this._getTarget(),
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
  public setUserPermissions(permissions: StringMapLike<T>): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<T[]>(permissions);

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        target: this._getTarget(),
        user: {
          permissions: this._permissionsMapToPermissionEntries(map)
        }
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
  public getAllUserPermissions(): Promise<Map<string, T[]>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getAllUserPermissionsRequest: {
        target: this._getTarget()
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
  public getUserPermissions(username: string): Promise<T[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getUserPermissionsRequest: {
        target: this._getTarget(),
        user: domainUserIdToProto(DomainUserId.normal(username))
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getUserPermissionsResponse} = response;
      return getOrDefaultArray(getUserPermissionsResponse.permissions as T[]);
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
  public addGroupPermissions(permissions: StringMapLike<T>): Promise<void> {
    this._connection.session().assertOnline();
    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);
    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        target: this._getTarget(),
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
  public removeGroupPermissions(permissions: StringMapLike<T>): Promise<void> {
    this._connection.session().assertOnline();
    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);
    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        target: this._getTarget(),
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
  public setGroupPermissions(permissions: StringMapLike<T>): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        target: this._getTarget(),
        group: {
          permissions: permissionsByGroup
        }
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
  public getAllGroupPermissions(): Promise<Map<string, T[]>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getAllGroupPermissionsRequest: {
        target: this._getTarget()
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllGroupPermissionsResponse} = response;

      let permissions = mapObjectValues(getAllGroupPermissionsResponse.groups, permissionsList => {
        return getOrDefaultArray(permissionsList.values as T[]);
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
  public getGroupPermissions(groupId: string): Promise<T[]> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getGroupPermissionsRequest: {
        target: this._getTarget(),
        groupId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getGroupPermissionsResponse} = response;
      return getOrDefaultArray(getGroupPermissionsResponse.permissions as T[]);
    });
  }

  protected abstract _getTarget(): IPermissionTarget;

  /**
   * @internal
   */
  private _permissionsMapToPermissionEntries(map: Map<string, T[]>): IUserPermissionsEntry[] {
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
  private _permissionsEntriesToUserMap(entries: IUserPermissionsEntry[]): Map<string, T[]> {
    const userPermissions = new Map<string, T[]>();

    entries.forEach((entry: IUserPermissionsEntry) => {
      const username = entry.user.username;
      let permissions = getOrDefaultArray(entry.permissions as T[]);
      userPermissions.set(username, permissions);
    });

    return userPermissions;
  }

  /**
   * @internal
   */
  private _coercePermissionsToGroupedProtoPermissionList(
    permissions: StringMapLike<T>): {[key: string]: IPermissionsList} {
      let groupedPermissions = StringMap.coerceToObject<T[]>(permissions);
      return mapObjectValues(groupedPermissions, permissionsArr => {
        return {
          values: permissionsArr
        };
      });
    }
}
