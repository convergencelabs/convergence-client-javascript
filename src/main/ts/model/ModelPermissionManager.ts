import {ModelPermissions} from "./ModelPermissions";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {
  GetModelPermissionsRequest,
  GetModelPermissionsResponse
} from "../connection/protocol/model/permissions/getModelPermissions";
import {ModelFqn} from "./ModelFqn";
import {SetModelPermissionsRequest} from "../connection/protocol/model/permissions/setModelPermissions";

export class ModelPermissionManager {

  private readonly _collectionId: string;
  private readonly _modelId: string;
  private readonly _connection: ConvergenceConnection;

  constructor(collectionId: string, modelId: string, connection: ConvergenceConnection) {
    this._collectionId = collectionId;
    this._modelId = modelId;
    this._connection = connection;
  }

  get collectionId() {
    return this._collectionId;
  }

  get modelId() {
    return this._modelId;
  }

  public getPermissions(): Promise<ModelPermissions> {
    const request: GetModelPermissionsRequest = {
      modelFqn: new ModelFqn(this._collectionId, this._modelId)
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.users.get(this._connection.session().username());
    });
  }

  public getWorldPermissions(): Promise<ModelPermissions> {
    const request: GetModelPermissionsRequest = {
      modelFqn: new ModelFqn(this._collectionId, this._modelId)
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.world;
    });
  }

  public setWorldPermissions(permissions: ModelPermissions): Promise<void> {
    const request: SetModelPermissionsRequest = {
      modelFqn: new ModelFqn(this._collectionId, this._modelId),
      setWorld: true,
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
      modelFqn: new ModelFqn(this._collectionId, this._modelId)
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.users;
    });
  }

  public setAllUserPermissions(permissions: Map<string, ModelPermissions>): Promise<void> {
    const request: SetModelPermissionsRequest = {
      modelFqn: new ModelFqn(this._collectionId, this._modelId),
      setWorld: false,
      users: permissions,
      allUsers: true
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getUserPermissions(username: string): Promise<ModelPermissions> {
    const request: GetModelPermissionsRequest = {
      modelFqn: new ModelFqn(this._collectionId, this._modelId)
    };

    return this._connection.request(request).then((response: GetModelPermissionsResponse) => {
      return response.users.get(username);
    });
  }

  public setUserPermissions(username: string, permissions: ModelPermissions): Promise<void> {
    const p = new Map<string, ModelPermissions>();
    p.set(username, permissions);
    const request: SetModelPermissionsRequest = {
      modelFqn: new ModelFqn(this._collectionId, this._modelId),
      setWorld: false,
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
      modelFqn: new ModelFqn(this._collectionId, this._modelId),
      setWorld: false,
      users: p,
      allUsers: false
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }
}
