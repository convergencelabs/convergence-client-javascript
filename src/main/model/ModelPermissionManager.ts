/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
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

import {ModelPermissions} from "./ModelPermissions";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {
  modelUserPermissionMapToProto,
  protoToModelUserPermissionMap,
  toModelPermissions
} from "./ModelMessageConverter";
import {DomainUserId, DomainUserIdentifier, DomainUserIdMap} from "../identity";
import {domainUserIdToProto} from "../connection/ProtocolUtil";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import {DomainUserMapping} from "../identity/DomainUserMapping";
import {IModelPermissions} from "./IModelPermissions";

/**
 * Use this class to manage or query the permissions of a particular
 * [[RealTimeModel]].
 *
 * @module Real Time Data
 */
export class ModelPermissionManager {

  /**
   * @internal
   */
  private readonly _modelId: string;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  constructor(modelId: string, connection: ConvergenceConnection) {
    this._modelId = modelId;
    this._connection = connection;
  }

  /**
   * The id of the model this permission manager works with.
   */
  get modelId(): string {
    return this._modelId;
  }

  /**
   * Gets the permissions of the local user for this model
   */
  public getPermissions(): Promise<ModelPermissions> {
    return this.getAllUserPermissions().then(permissionMap => {
      const mine = permissionMap.get(this._connection.session().user().userId.toGuid());
      return mine !== undefined ? mine : ModelPermissions.NONE;
    });
  }

  /**
   * Sets this model to override it's collection's world permissions or
   * not.
   *
   * @param overrideCollection True to override this model's collection
   * world permissions.
   */
  public setOverridesCollection(overrideCollection: boolean): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        overrideCollection: {value: overrideCollection},
        removeAllUserPermissionsBeforeSet: false,
        setUserPermissions: [],
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Determines if this model overrides the world permissions
   * from the model's collection.
   *
   * @returns True if the model overrides it's collection's
   * world permissions.
   */
  public getOverridesCollection(): Promise<boolean> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return getModelPermissionsResponse.overridesCollection;
    });
  }

  /**
   * Gets the model's world permissions.
   *
   * @returns The model's world permissions.
   */
  public getWorldPermissions(): Promise<ModelPermissions> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return toModelPermissions(getModelPermissionsResponse.worldPermissions);
    });
  }

  public setWorldPermissions(worldPermissions: ModelPermissions): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        worldPermissions,
        removeAllUserPermissionsBeforeSet: false,
        setUserPermissions: [],
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllUserPermissions(): Promise<DomainUserIdMap<ModelPermissions>> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return protoToModelUserPermissionMap(getModelPermissionsResponse.userPermissions);
    });
  }

  public setAllUserPermissions(permissions: DomainUserMapping<IModelPermissions>): Promise<void> {
    permissions = DomainUserIdMap.of(permissions);

    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        setUserPermissions: modelUserPermissionMapToProto(permissions),
        removeAllUserPermissionsBeforeSet: true
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getUserPermissions(userId: DomainUserIdentifier): Promise<ModelPermissions | undefined> {
    return this.getAllUserPermissions().then(perms => {
      return perms.get(userId);
    });
  }

  public setUserPermissions(user: DomainUserIdentifier, permissions: IModelPermissions): Promise<void> {
    const userId = DomainUserId.of(user);
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        worldPermissions: null,
        setUserPermissions: [{user: domainUserIdToProto(userId), permissions}],
        removeAllUserPermissionsBeforeSet: false,
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeUserPermissions(user: DomainUserIdentifier): Promise<void> {
    const userId = DomainUserId.of(user);
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        removeAllUserPermissionsBeforeSet: false,
        removedUserPermissions: [domainUserIdToProto(userId)]
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }
}
