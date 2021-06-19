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

import {DomainUserId, DomainUserIdentifier, DomainUserIdMap} from "../identity";
import {ActivityUserPermissionsMap} from "./ActivityUserPermissionsMap";
import {com} from "../../../../../convergence-proto/npm-dist";
import {TypeChecker} from "../util/TypeChecker";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {objectForEach} from "../util/ObjectUtils";
import {StringMap} from "../util/StringMap";
import {ActivityPermission} from "./ActivityPermission";
import IUserPermissionsEntry = com.convergencelabs.convergence.proto.core.IUserPermissionsEntry;
import IPermissionsList = com.convergencelabs.convergence.proto.core.IPermissionsList;

/**
 * @hidden
 * @internal
 */
export class ActivityPermissionUtils {

  public static userPermissions(userPermissions?: ActivityUserPermissionsMap): IUserPermissionsEntry[] {
    const result: IUserPermissionsEntry[] = [];
    if (userPermissions instanceof DomainUserIdMap) {
      userPermissions.forEach((permissions: ActivityPermission[], userId: DomainUserId) => {
        result.push(ActivityPermissionUtils.toUserPermissionEntry(userId, permissions));
      });
    } else if (TypeChecker.isMap(userPermissions)) {
      userPermissions.forEach((permissions: ActivityPermission[], userId: DomainUserIdentifier) => {
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

  public static toGroupPermissionsProto(groupPermissions?: Map<string, ActivityPermission[]> | { [key: string]: ActivityPermission[] }): { [key: string]: IPermissionsList } {
    const results = {};

    if (TypeChecker.isMap(groupPermissions) || TypeChecker.isObject(groupPermissions)) {
      StringMap.coerceToMap(groupPermissions).forEach((permissions, groupId) => {
        results[groupId] = permissions;
      })
    }

    return results;
  }

  public static toUserPermissionEntry(userId: DomainUserId, permissions: ActivityPermission[]): IUserPermissionsEntry {
    return {
      user: domainUserIdToProto(userId),
      permissions
    } as IUserPermissionsEntry;
  }
}
