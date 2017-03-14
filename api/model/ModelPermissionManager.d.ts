import {ModelPermissions} from "./ModelPermissions";

export declare class ModelPermissionManager {

  public readonly collectionId: string;
  public readonly modelId: string;

  public getPermissions(): Promise<ModelPermissions>;

  public getWorldPermissions(): Promise<ModelPermissions>;
  public setWorldPermissions(permissions: ModelPermissions): Promise<void>;

  public getAllUserPermissions(): Promise<Map<string, ModelPermissions>>;

  public getUserPermissions(userId: string): Promise<ModelPermissions>;
  public setUserPermissions(userId: string, permissions: ModelPermissions): Promise<void>;
  public removeUserPermissions(userId: string): Promise<void>;
}
