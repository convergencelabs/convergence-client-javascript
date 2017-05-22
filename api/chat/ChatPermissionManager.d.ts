
export declare class ChatPermissionManager {

  public readonly channelId: string;

  public getPermissions(): Promise<string[]>;

  public addWorldPermissions(permissions: string[]): Promise<void>;

  public removeWorldPermissions(permissions: string[]): Promise<void>;

  public setWorldPermissions(permissions: string[]): Promise<void>;

  public getWorldPermissions(): Promise<string[]>;

  public addUserPermissions(permissions: { [key: string]: string[] }): Promise<void>
  public addUserPermissions(permissions: Map<string, string[]>): Promise<void>
  public addUserPermissions(permissions: Map<string, string[]> |
    { [key: string]: string[] }): Promise<void>;

  public removeUserPermissions(permissions: { [key: string]: string[] }): Promise<void>
  public removeUserPermissions(permissions: Map<string, string[]>): Promise<void>
  public removeUserPermissions(permissions: Map<string, string[]> |
    { [key: string]: string[] }): Promise<void>;

  public setUserPermissions(permissions: { [key: string]: string[] }): Promise<void>
  public setUserPermissions(permissions: Map<string, string[]>): Promise<void>
  public setUserPermissions(permissions: Map<string, string[]> |
    { [key: string]: string[] }): Promise<void>;

  public getAllUserPermissions(): Promise<Map<string, string[]>>;

  public getUserPermissions(username: string): Promise<string[]>;

  public addGroupPermissions(permissions: { [key: string]: string[] }): Promise<void>
  public addGroupPermissions(permissions: Map<string, string[]>): Promise<void>
  public addGroupPermissions(permissions: Map<string, string[]> |
    { [key: string]: string[] }): Promise<void>;

  public removeGroupPermissions(permissions: { [key: string]: string[] }): Promise<void>
  public removeGroupPermissions(permissions: Map<string, string[]>): Promise<void>
  public removeGroupPermissions(permissions: Map<string, string[]> |
    { [key: string]: string[] }): Promise<void>;

  public setGroupPermissions(permissions: { [key: string]: string[] }): Promise<void>
  public setGroupPermissions(permissions: Map<string, string[]>): Promise<void>
  public setGroupPermissions(permissions: Map<string, string[]> |
    { [key: string]: string[] }): Promise<void>;

  public getAllGroupPermissions(): Promise<Map<string, string[]>>;

  public getGroupPermissions(groupId: string): Promise<string[]>;

}
