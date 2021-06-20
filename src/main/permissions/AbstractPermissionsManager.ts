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
import {
  domainUserTypeToProto,
  getOrDefaultArray,
  getOrDefaultObject,
  protoToDomainUserId
} from "../connection/ProtocolUtil";
import {DomainUserId, DomainUserIdMap, DomainUserType} from "../identity";
import {mapObjectValues} from "../util/ObjectUtils";

import {com} from "@convergence/convergence-proto";
import {IAllPermissions} from "./IAllPermissions";
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
   * Returns the *resolved* permissions for the current user for this target.
   * Resolved means computed from the set of any relevant `world`, `group` or `user`
   * permissions.
   */
  public resolveSessionPermissions(): Promise<Set<T>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      resolvePermissionsForConnectedSessionRequest: {
        target: this._getTarget()
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {resolvePermissionsForConnectedSessionResponse} = response;
      return new Set(getOrDefaultArray(resolvePermissionsForConnectedSessionResponse.permissions as T[]));
    });
  }

  public getPermissions(): Promise<IAllPermissions<T>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getPermissionsRequest: {
        target: this._getTarget()
      }
    };

    return this._connection
      .request(request)
      .then((response: IConvergenceMessage) => {
        const {getPermissionsResponse} = response;

        const worldPermissions = new Set(getOrDefaultArray(getPermissionsResponse.world as T[]));
        const userPermissions = this._permissionsEntriesToUserMap(getOrDefaultArray(getPermissionsResponse.user));
        const groupPermissions = StringMap.coerceToMap<Set<T>>(mapObjectValues(getOrDefaultObject(getPermissionsResponse.group), permissionsList => {
          return new Set(getOrDefaultArray(permissionsList.values as T[]));
        }));

        return {
          worldPermissions,
          groupPermissions,
          userPermissions
        };
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
  public addWorldPermissions(permissions: Set<T> | T[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        target: this._getTarget(),
        world: Array.from(permissions)
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
  public removeWorldPermissions(permissions: Set<T> | T[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        target: this._getTarget(),
        world: Array.from(permissions)
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
  public setWorldPermissions(permissions: Set<T> | T[]): Promise<void> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        target: this._getTarget(),
        world: {permissions: Array.from(permissions)}
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
  public getWorldPermissions(): Promise<Set<T>> {
    this._connection.session().assertOnline();
    return this.getPermissions().then(permissions => permissions.worldPermissions);
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
  public addUserPermissions(permissions: StringMapLike<Set<T> | T[]>): Promise<void> {
    this._connection.session().assertOnline();

    let map = StringMap.coerceToMap<Set<T> | T[]>(permissions);

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
  public removeUserPermissions(permissions: StringMapLike<Set<T> | T[]>): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<Set<T> | T[]>(permissions);

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
  public setUserPermissions(permissions: StringMapLike<Set<T> | T[]>): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<Set<T> | T[]>(permissions);

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
  public getAllUserPermissions(): Promise<DomainUserIdMap<Set<T>>> {
    this._connection.session().assertOnline();
    return this.getPermissions().then(p => p.userPermissions);
  }

  /**
   * Returns the permissions for the given user for this [[chatId]].
   *
   * @param username an existing user's username
   *
   * @returns
   *   A promise, which resolves with an array of permission strings
   */
  public getUserPermissions(username: string): Promise<Set<T>> {
    this._connection.session().assertOnline();
    return this.getPermissions()
      .then(p => p.userPermissions.get(DomainUserId.normal(username)) || new Set());
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
  public addGroupPermissions(permissions: StringMapLike<Set<T> | T[]>): Promise<void> {
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
  public removeGroupPermissions(permissions: StringMapLike<Set<T> | T[]>): Promise<void> {
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
  public setGroupPermissions(permissions: StringMapLike<Set<T> | T[]>): Promise<void> {
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
  public getAllGroupPermissions(): Promise<Map<string, Set<T>>> {
    this._connection.session().assertOnline();
    return this.getPermissions().then(p => p.groupPermissions);
  }

  /**
   * Returns the permissions for the given group for this [[chatId]].
   *
   * @param groupId an existing group ID
   *
   * @returns
   *   A promise, which resolves with an array of permission strings
   */
  public getGroupPermissions(groupId: string): Promise<Set<T>> {
    this._connection.session().assertOnline();
    return this.getPermissions().then(p => p.groupPermissions.get(groupId) || new Set());
  }

  protected abstract _getTarget(): IPermissionTarget;

  /**
   * @internal
   */
  private _permissionsMapToPermissionEntries(map: Map<string, Set<T> | T[]>): IUserPermissionsEntry[] {
    const userPermissions: IUserPermissionsEntry[] = [];
    map.forEach((userPerms, username) => {
      userPermissions.push({
        user: {userType: domainUserTypeToProto(DomainUserType.NORMAL), username},
        permissions: Array.from(userPerms)
      });
    });
    return userPermissions;
  }

  /**
   * @internal
   */
  private _permissionsEntriesToUserMap(entries: IUserPermissionsEntry[]): DomainUserIdMap<Set<T>> {
    const userPermissions = new DomainUserIdMap<Set<T>>();

    entries.forEach((entry: IUserPermissionsEntry) => {
      const userId = protoToDomainUserId(entry.user);
      let permissions = new Set(getOrDefaultArray(entry.permissions as T[]));
      userPermissions.set(userId, permissions);
    });

    return userPermissions;
  }

  /**
   * @internal
   */
  private _coercePermissionsToGroupedProtoPermissionList(
    permissions: StringMapLike<Set<T> | T[]>): { [key: string]: IPermissionsList } {
    let groupedPermissions = StringMap.coerceToObject<Set<T> | T[]>(permissions);
    return mapObjectValues(groupedPermissions, permissionsArr => {
      return {
        values: Array.from(permissionsArr)
      };
    });
  }
}
