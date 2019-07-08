import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {io} from "@convergence-internal/convergence-proto";
import {StringMap} from "../util";
import {domainUserIdToProto, domainUserTypeToProto} from "../connection/ProtocolUtil";
import {DomainUserId, DomainUserType} from "../identity/";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IUserPermissionsEntry = io.convergence.proto.IUserPermissionsEntry;

export type ChatPermission =
  "create_chat"
  | "remove_chat"
  | "join_chat"
  | "leave_chat"
  | "add_chat_user"
  | "remove_chat_user"
  | "set_chat_name"
  | "set_topic"
  | "manage_chat_permissions";

const CHAT = 1;

export class ChatPermissionManager {
  /**
   * @internal
   */
  private static _permissionsMapToPermissionEntries(map: Map<string, ChatPermission[]>): IUserPermissionsEntry[] {
    const userPermissions: IUserPermissionsEntry[] = [];
    map.forEach((userPerms, username) => {
      userPermissions.push({
        user: {userType: domainUserTypeToProto(DomainUserType.NORMAL), username},
        permissions: userPerms
      });
    });
    return userPermissions;
  }

  /**
   * @internal
   */
  private readonly _chatId: string;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string, connection: ConvergenceConnection) {
    this._chatId = chatId;
    this._connection = connection;
  }

  get chatId() {
    return this._chatId;
  }

  public getPermissions(): Promise<ChatPermission[]> {
    const request: IConvergenceMessage = {
      getClientPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getClientPermissionsResponse} = response;
      return getClientPermissionsResponse.permissions as ChatPermission[];
    });
  }

  public addWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        world: permissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        world: permissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public setWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        world: permissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getWorldPermissions(): Promise<ChatPermission[]> {
    const request: IConvergenceMessage = {
      getWorldPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getWorldPermissionsResponse} = response;
      return getWorldPermissionsResponse.permissions as ChatPermission[];
    });
  }

  public addUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public addUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public addUserPermissions(permissions: Map<string, ChatPermission[]> |
    { [key: string]: ChatPermission[] }): Promise<void> {
    let map = new Map<string, ChatPermission[]>();
    if (permissions instanceof Map) {
      map = permissions;
    } else {
      const permsObject = permissions as { [key: string]: ChatPermission[] };
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
    }

    const userPermissions = ChatPermissionManager._permissionsMapToPermissionEntries(map);
    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: userPermissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public removeUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public removeUserPermissions(permissions: Map<string, ChatPermission[]> |
    { [key: string]: ChatPermission[] }): Promise<void> {
    let map = new Map<string, ChatPermission[]>();
    if (permissions instanceof Map) {
      map = permissions;
    } else {
      const permsObject = permissions as { [key: string]: ChatPermission[] };
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
    }

    const userPermissions = ChatPermissionManager._permissionsMapToPermissionEntries(map);
    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: userPermissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public setUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public setUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public setUserPermissions(permissions: Map<string, ChatPermission[]> |
    { [key: string]: ChatPermission[] }): Promise<void> {
    let map = new Map<string, ChatPermission[]>();
    if (permissions instanceof Map) {
      map = permissions;
    } else {
      const permsObject = permissions as { [key: string]: ChatPermission[] };
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
    }

    const userPermissions = ChatPermissionManager._permissionsMapToPermissionEntries(map);
    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: userPermissions
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllUserPermissions(): Promise<Map<string, ChatPermission[]>> {
    const request: IConvergenceMessage = {
      getAllUserPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllUserPermissionsResponse} = response;
      return StringMap.objectToMap(getAllUserPermissionsResponse.users);
    });
  }

  public getUserPermissions(username: string): Promise<ChatPermission[]> {
    const request: IConvergenceMessage = {
      getUserPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: domainUserIdToProto(DomainUserId.normal(username))
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getUserPermissionsResponse} = response;
      return getUserPermissionsResponse.permissions as ChatPermission[];
    });
  }

  public addGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public addGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public addGroupPermissions(permissions: Map<string, ChatPermission[]> |
    { [key: string]: ChatPermission[] }): Promise<void> {
    let map = new Map<string, ChatPermission[]>();
    if (permissions instanceof Map) {
      map = permissions;
    } else {
      const permsObject = permissions as { [key: string]: ChatPermission[] };
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
    }

    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: StringMap.mapToObject(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public removeGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public removeGroupPermissions(permissions: Map<string, ChatPermission[]> |
    { [key: string]: ChatPermission[] }): Promise<void> {
    let map = new Map<string, ChatPermission[]>();
    if (permissions instanceof Map) {
      map = permissions;
    } else {
      const permsObject = permissions as { [key: string]: ChatPermission[] };
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
    }

    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: StringMap.mapToObject(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public setGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public setGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public setGroupPermissions(permissions: Map<string, ChatPermission[]> |
    { [key: string]: ChatPermission[] }): Promise<void> {
    let map = new Map<string, ChatPermission[]>();
    if (permissions instanceof Map) {
      map = permissions;
    } else {
      const permsObject = permissions as { [key: string]: ChatPermission[] };
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
    }

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: StringMap.mapToObject(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllGroupPermissions(): Promise<Map<string, ChatPermission[]>> {
    const request: IConvergenceMessage = {
      getAllGroupPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllGroupPermissionsResponse} = response;
      return StringMap.objectToMap(getAllGroupPermissionsResponse.groups);
    });
  }

  public getGroupPermissions(groupId: string): Promise<ChatPermission[]> {
    const request: IConvergenceMessage = {
      getGroupPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        groupId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getGroupPermissionsResponse} = response;
      return getGroupPermissionsResponse.permissions as ChatPermission[];
    });
  }
}
