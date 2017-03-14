import {ModelPermissions} from "./ModelPermissions";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";

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
    return Promise.reject<ModelPermissions>(new Error("not implemented"));
  }

  public getWorldPermissions(): Promise<ModelPermissions> {
    return Promise.reject<ModelPermissions>(new Error("not implemented"));
  }

  public setWorldPermissions(permissions: ModelPermissions): Promise<void> {
    return Promise.reject<void>(new Error("not implemented"));
  }

  public getAllUserPermissions(): Promise<Map<string, ModelPermissions>> {
    return Promise.reject<Map<string, ModelPermissions>>(new Error("not implemented"));
  }

  public getUserPermissions(userId: string): Promise<ModelPermissions> {
    return Promise.reject<ModelPermissions>(new Error("not implemented"));
  }

  public setUserPermissions(userId: string, permissions: ModelPermissions): Promise<void> {
    return Promise.reject<void>(new Error("not implemented"));
  }

  public removeUserPermissions(userId: string): Promise<void> {
    return Promise.reject<void>(new Error("not implemented"));
  }
}
