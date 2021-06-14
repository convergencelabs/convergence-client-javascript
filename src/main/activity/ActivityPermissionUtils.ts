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

import {IActivityPermissions} from "./IActivityPermissions";
import {DomainUserId, DomainUserIdentifier, DomainUserIdMap} from "../identity";
import {ActivityUserPermissionsMap} from "./ActivityUserPermissionsMap";
import {com} from "../../../../../convergence-proto/npm-dist";
import {TypeChecker} from "../util/TypeChecker";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {objectForEach} from "../util/ObjectUtils";
import {StringMap} from "../util/StringMap";
import IUserPermissionsEntry = com.convergencelabs.convergence.proto.core.IUserPermissionsEntry;
import IPermissionsList = com.convergencelabs.convergence.proto.core.IPermissionsList;

/**
 * @hidden
 * @internal
 */
export class ActivityPermissionUtils {

  public static permissionToStrings(permissions?: IActivityPermissions): string[] {
    const result = [];

    if (!permissions) return result;

    if (permissions.join) result.push(JOIN);
    if (permissions.manage) result.push(MANAGE);
    if (permissions.viewState) result.push(VIEW_STATE);
    if (permissions.setState) result.push(SET_STATE);

    return result;
  }

  public static stringsToPermissions(permissions: string[]): IActivityPermissions {
    const result: IActivityPermissions = {join: false, manage: false, setState: false, viewState: false};
    permissions.forEach(permission => {
      switch (permission) {
        case JOIN:
          result.join = true;
          break;
        case MANAGE:
          result.manage = true;
          break;
        case SET_STATE:
          result.setState = true;
          break;
        case VIEW_STATE:
          result.viewState = true;
          break;
        default:
      }
    });

    return result;
  }

  public static userPermissions(userPermissions?: ActivityUserPermissionsMap): IUserPermissionsEntry[] {
    const result: IUserPermissionsEntry[] = [];
    if (userPermissions instanceof DomainUserIdMap) {
      userPermissions.forEach((permissions: IActivityPermissions, userId: DomainUserId) => {
        result.push(ActivityPermissionUtils.toUserPermissionEntry(userId, permissions));
      });
    } else if (TypeChecker.isMap(userPermissions)) {
      userPermissions.forEach((permissions: IActivityPermissions, userId: DomainUserIdentifier) => {
        userId = DomainUserId.toDomainUserId(userId);
        result.push(ActivityPermissionUtils.toUserPermissionEntry(userId, permissions));
      });
    } else if (TypeChecker.isObject(userPermissions)) {
      objectForEach(userPermissions, (username, permissions) => {
        const userId = DomainUserId.toDomainUserId(username);
        result.push(ActivityPermissionUtils.toUserPermissionEntry(userId, permissions));
      });
    }

    return result;
  }

  public static toGroupPermissionsProto(groupPermissions?: Map<string, IActivityPermissions> | { [key: string]: IActivityPermissions }): { [key: string]: IPermissionsList } {
    const results = {};

    if (TypeChecker.isMap(groupPermissions) || TypeChecker.isObject(groupPermissions)) {
      StringMap.coerceToMap(groupPermissions).forEach((permissions, groupId) => {
        results[groupId] = permissions;
      })
    }

    return results;
  }

  public static toUserPermissionEntry(userId: DomainUserId, permissions: IActivityPermissions): IUserPermissionsEntry {
    return {
      user: domainUserIdToProto(userId),
      permissions: ActivityPermissionUtils.permissionToStrings(permissions)
    } as IUserPermissionsEntry;
  }
}

const JOIN = "join";
const MANAGE = "manage";
const VIEW_STATE = "view_state";
const SET_STATE = "set_state";