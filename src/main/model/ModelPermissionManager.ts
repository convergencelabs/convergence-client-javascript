/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ModelPermissions} from "./ModelPermissions";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {StringMap} from "../util";
import {
  modelUserPermissionMapToProto,
  protoToModelUserPermissionMap,
  toModelPermissions
} from "./ModelMessageConverter";
import {DomainUserId, DomainUserIdentifier} from "../identity";
import {domainUserIdToProto} from "../connection/ProtocolUtil";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;

/**
 * Use this class to manage or query the permissions of a particular
 * [[RealTimeModel]].
 *
 * @category Real Time Data Subsystem
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

  get modelId() {
    return this._modelId;
  }

  public getPermissions(): Promise<ModelPermissions> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      const permissionsData = getModelPermissionsResponse.userPermissions[this._connection.session().user().username];
      return toModelPermissions(permissionsData);
    });
  }

  public setOverridesCollection(overrideCollection: boolean): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        overrideCollection: { value: overrideCollection },
        removeAllUserPermissionsBeforeSet: false,
        setUserPermissions: [],
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

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

  public getAllUserPermissions(): Promise<Map<string, ModelPermissions>> {
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

  public setAllUserPermissions(permissions: { [key: string]: ModelPermissions }): Promise<void>;
  public setAllUserPermissions(permissions: Map<string, ModelPermissions>): Promise<void>;
  public setAllUserPermissions(
    permissions: Map<string, ModelPermissions> | { [key: string]: ModelPermissions }): Promise<void> {
    if (!(permissions instanceof Map)) {
      const permsObject = permissions as { [key: string]: ModelPermissions };
      const map = new Map<string, ModelPermissions>();
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
      permissions = map;
    }

    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        setUserPermissions: modelUserPermissionMapToProto(StringMap.mapToObject(permissions)),
        removeAllUserPermissionsBeforeSet: true
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getUserPermissions(username: string): Promise<ModelPermissions | undefined> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return toModelPermissions(getModelPermissionsResponse.userPermissions[username]);
    });
  }

  public setUserPermissions(user: DomainUserIdentifier, permissions: ModelPermissions): Promise<void> {
    const userId = DomainUserId.toDomainUserId(user);
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
    const userId = DomainUserId.toDomainUserId(user);
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
