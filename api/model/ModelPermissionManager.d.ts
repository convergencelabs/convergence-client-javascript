import {ModelPermissions} from "./ModelPermissions";

export declare class ModelPermissionManager {

  public readonly collectionId: string;
  public readonly modelId: string;

  public getPermissions(): Promise<ModelPermissions>;

  public getWorldPermissions(): Promise<ModelPermissions>;
  public setWorldPermissions(permissions: ModelPermissions): Promise<void>;

  public getAllUserPermissions(): Promise<Map<string, ModelPermissions>>;
  public setAllUserPermissions(permissions: Map<string, ModelPermissions>): Promise<void>;

  public getUserPermissions(username: string): Promise<ModelPermissions>;
  public setUserPermissions(username: string, permissions: ModelPermissions): Promise<void>;
  public removeUserPermissions(username: string): Promise<void>;
}
