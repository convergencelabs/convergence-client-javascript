import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {IdType} from "../connection/protocol/permissions/IdType";
import {
  GetClientPermissionsRequest,
  GetClientPermissionsResponse
} from "../connection/protocol/permissions/getClientPermissions";
import {AddPermissionsRequest} from "../connection/protocol/permissions/addPermissions";
import {RemovePermissionsRequest} from "../connection/protocol/permissions/removePermissions";
import {SetPermissionsRequest} from "../connection/protocol/permissions/setPermissions";
import {
  GetWorldPermissionsRequest,
  GetWorldPermissionsResponse
} from "../connection/protocol/permissions/getWorldPermissions";
import {
  GetAllUserPermissionsRequest,
  GetAllUserPermissionsResponse
} from "../connection/protocol/permissions/getAllUserPermissions";
import {
  GetUserPermissionsRequest,
  GetUserPermissionsResponse
} from "../connection/protocol/permissions/getUserPermissions";
import {
  GetAllGroupPermissionsRequest,
  GetAllGroupPermissionsResponse
} from "../connection/protocol/permissions/getAllGroupPermissions";
import {
  GetGroupPermissionsRequest,
  GetGroupPermissionsResponse
} from "../connection/protocol/permissions/getGroupPermissions";

export type ChatPermission =
  "create_chat_channel"
  | "remove_chat_channel"
  | "join_chat_channel"
  | "leave_chat_channel"
  | "add_chat_user"
  | "remove_chat_user"
  | "set_chat_name"
  | "set_topic"
  | "manage_chat_permissions";

const Permissions = {
  CREATE_CHAT: "create_chat_channel",
  REMOVE_CHAT: "remove_chat_channel",
  JOIN_CHAT: "join_chat_channel",
  LEAVE_CHAT: "leave_chat_channel",
  ADD_USER: "add_chat_user",
  REMOVE_USER: "remove_chat_user",
  SET_NAME: "set_chat_name",
  SET_TOPIC: "set_topic",
  MANAGE_PERMISSIONS: "manage_chat_permissions"
};

export class ChatPermissionManager {

  /**
   * @internal
   */
  private readonly _channelId: string;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string, connection: ConvergenceConnection) {
    this._channelId = channelId;
    this._connection = connection;
  }

  get channelId() {
    return this._channelId;
  }

  public getPermissions(): Promise<ChatPermission[]> {
    const request: GetClientPermissionsRequest = {
      type: MessageType.GET_CLIENT_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId
    };

    return this._connection.request(request).then((response: GetClientPermissionsResponse) => {
      return response.permissions as ChatPermission[];
    });
  }

  public addWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    const request: AddPermissionsRequest = {
      type: MessageType.ADD_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      world: permissions
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    const request: RemovePermissionsRequest = {
      type: MessageType.REMOVE_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      world: permissions
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public setWorldPermissions(permissions: ChatPermission[]): Promise<void> {
    const request: SetPermissionsRequest = {
      type: MessageType.SET_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      world: permissions
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getWorldPermissions(): Promise<ChatPermission[]> {
    const request: GetWorldPermissionsRequest = {
      type: MessageType.GET_WORLD_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId
    };

    return this._connection.request(request).then((response: GetWorldPermissionsResponse) => {
      return response.permissions as ChatPermission[];
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

    const request: AddPermissionsRequest = {
      type: MessageType.ADD_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      users: map
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

    const request: RemovePermissionsRequest = {
      type: MessageType.REMOVE_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      users: map
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

    const request: SetPermissionsRequest = {
      type: MessageType.SET_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      users: map
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllUserPermissions(): Promise<Map<string, ChatPermission[]>> {
    const request: GetAllUserPermissionsRequest = {
      type: MessageType.GET_ALL_USER_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId
    };

    return this._connection.request(request).then((response: GetAllUserPermissionsResponse) => {
      return response.users as Map<string, ChatPermission[]>;
    });
  }

  public getUserPermissions(username: string): Promise<ChatPermission[]> {
    const request: GetUserPermissionsRequest = {
      type: MessageType.GET_USER_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      username
    };

    return this._connection.request(request).then((response: GetUserPermissionsResponse) => {
      return response.permissions as ChatPermission[];
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

    const request: AddPermissionsRequest = {
      type: MessageType.ADD_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      groups: map
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

    const request: RemovePermissionsRequest = {
      type: MessageType.REMOVE_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      groups: map
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

    const request: SetPermissionsRequest = {
      type: MessageType.SET_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      groups: map
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllGroupPermissions(): Promise<Map<string, ChatPermission[]>> {
    const request: GetAllGroupPermissionsRequest = {
      type: MessageType.GET_ALL_GROUP_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId
    };

    return this._connection.request(request).then((response: GetAllGroupPermissionsResponse) => {
      return response.groups as Map<string, ChatPermission[]>;
    });
  }

  public getGroupPermissions(groupId: string): Promise<ChatPermission[]> {
    const request: GetGroupPermissionsRequest = {
      type: MessageType.GET_GROUP_PERMISSIONS_REQUEST,
      idType: IdType.CHAT,
      id: this._channelId,
      groupId
    };

    return this._connection.request(request).then((response: GetGroupPermissionsResponse) => {
      return response.permissions as ChatPermission[];
    });
  }
}
