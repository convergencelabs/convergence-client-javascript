import {ModelPermissions} from "./ModelPermissions";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {
  GetModelPermissionsRequest,
  GetModelPermissionsResponse
} from "../connection/protocol/model/permissions/getModelPermissions";
import {SetModelPermissionsRequest} from "../connection/protocol/model/permissions/setModelPermissions";
import {MessageType} from "../connection/protocol/MessageType";

export class ModelPermissionManager {

  private readonly _modelId: string;
  private readonly _connection: ConvergenceConnection;

  constructor(modelId: string, connection: ConvergenceConnection) {
    this._modelId = modelId;
    this._connection = connection;
  }

  get modelId() {
    return this._modelId;
  }

  public getPermissions(): Promise<ModelPermissions> {
    const request: GetModelPermissionsRequest = {
      type: MessageType.GET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.users.get(this._connection.session().username());
    });
  }

  public setOverridesCollection(overrideWorld: boolean): Promise<void> {
    const request: SetModelPermissionsRequest = {
      type: MessageType.SET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
      overridesCollection: true,
      allUsers: false,
      users: new Map<string, ModelPermissions>()
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getOverridesCollection(): Promise<boolean> {
    const request: GetModelPermissionsRequest = {
      type: MessageType.GET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.overridesCollection;
    });
  }

  public getWorldPermissions(): Promise<ModelPermissions> {
    const request: GetModelPermissionsRequest = {
      type: MessageType.GET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.world;
    });
  }

  public setWorldPermissions(permissions: ModelPermissions): Promise<void> {
    const request: SetModelPermissionsRequest = {
      type: MessageType.SET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
      world: permissions,
      allUsers: false,
      users: new Map<string, ModelPermissions>()
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllUserPermissions(): Promise<Map<string, ModelPermissions>> {
    const request: GetModelPermissionsRequest = {
      type: MessageType.GET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.users;
    });
  }

  public setAllUserPermissions(permissions: {[key: string]: ModelPermissions}): Promise<void>
  public setAllUserPermissions(permissions: Map<string, ModelPermissions>): Promise<void>
  public setAllUserPermissions(
    permissions: Map<string, ModelPermissions> | {[key: string]: ModelPermissions}): Promise<void> {
    if (!(permissions instanceof Map)) {
      const permsObject = permissions as {[key: string]: ModelPermissions};
      const map = new Map<string, ModelPermissions>();
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
      permissions = map;
    }

    const request: SetModelPermissionsRequest = {
      type: MessageType.SET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
      users: permissions,
      allUsers: true
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getUserPermissions(username: string): Promise<ModelPermissions> {
    const request: GetModelPermissionsRequest = {
      type: MessageType.GET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.users.get(username);
    });
  }

  public setUserPermissions(username: string, permissions: ModelPermissions): Promise<void> {
    const p = new Map<string, ModelPermissions>();
    p.set(username, permissions);
    const request: SetModelPermissionsRequest = {
      type: MessageType.SET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
      users: p,
      allUsers: false
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeUserPermissions(username: string): Promise<void> {
    const p = new Map<string, ModelPermissions>();
    p.set(username, null);
    const request: SetModelPermissionsRequest = {
      type: MessageType.SET_MODEL_PERMISSIONS_REQUEST,
      modelId: this._modelId,
      users: p,
      allUsers: false
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }
}
