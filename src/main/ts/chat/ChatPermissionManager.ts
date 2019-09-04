import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {io} from "@convergence-internal/convergence-proto";
import {StringMap} from "../util";
import {domainUserIdToProto, domainUserTypeToProto} from "../connection/ProtocolUtil";
import {DomainUserId, DomainUserType} from "../identity/";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IUserPermissionsEntry = io.convergence.proto.IUserPermissionsEntry;
import IPermissionsList = io.convergence.proto.IPermissionsList;
import { mapObjectValues } from "../util/ObjectUtils";

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

type MapLikeChatPermissions = Map<string, ChatPermission[]> |
                              { [key: string]: ChatPermission[] };

const CHAT = 1;

export class ChatPermissionManager {

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
    this._connection.session().assertOnline();
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
    this._connection.session().assertOnline();
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
    this._connection.session().assertOnline();
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
    this._connection.session().assertOnline();
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
    this._connection.session().assertOnline();
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
  public addUserPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let map = StringMap.coerceToMap<ChatPermission[]>(permissions);

    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: this._permissionsMapToPermissionEntries(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public removeUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public removeUserPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<ChatPermission[]>(permissions);

    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: this._permissionsMapToPermissionEntries(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public setUserPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public setUserPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public setUserPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();
    let map = StringMap.coerceToMap<ChatPermission[]>(permissions);

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        user: this._permissionsMapToPermissionEntries(map)
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllUserPermissions(): Promise<Map<string, ChatPermission[]>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getAllUserPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllUserPermissionsResponse} = response;
      return this._permissionsEntriesToUserMap(getAllUserPermissionsResponse.users);
    });
  }

  public getUserPermissions(username: string): Promise<ChatPermission[]> {
    this._connection.session().assertOnline();
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
  public addGroupPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      addPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: permissionsByGroup
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public removeGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public removeGroupPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      removePermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: permissionsByGroup
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public setGroupPermissions(permissions: { [key: string]: ChatPermission[] }): Promise<void>;
  public setGroupPermissions(permissions: Map<string, ChatPermission[]>): Promise<void>;
  public setGroupPermissions(permissions: MapLikeChatPermissions): Promise<void> {
    this._connection.session().assertOnline();

    let permissionsByGroup = this._coercePermissionsToGroupedProtoPermissionList(permissions);

    const request: IConvergenceMessage = {
      setPermissionsRequest: {
        idType: CHAT,
        id: this._chatId,
        group: permissionsByGroup
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllGroupPermissions(): Promise<Map<string, ChatPermission[]>> {
    this._connection.session().assertOnline();
    const request: IConvergenceMessage = {
      getAllGroupPermissionsRequest: {
        idType: CHAT,
        id: this._chatId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getAllGroupPermissionsResponse} = response;

      let permissions = mapObjectValues(getAllGroupPermissionsResponse.groups, permissionsList => {
        return permissionsList.values as ChatPermission[];
      });

      return StringMap.objectToMap(permissions);
    });
  }

  public getGroupPermissions(groupId: string): Promise<ChatPermission[]> {
    this._connection.session().assertOnline();
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

  /**
   * @internal
   */
  private _permissionsMapToPermissionEntries(map: Map<string, ChatPermission[]>): IUserPermissionsEntry[] {
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
  private _permissionsEntriesToUserMap(entries: IUserPermissionsEntry[]): Map<string, ChatPermission[]> {
    const userPermissions = new Map<string, ChatPermission[]>();

    entries.forEach((entry: IUserPermissionsEntry) => {
      const username = entry.user.username;
      let permissions = entry.permissions as ChatPermission[];
      userPermissions.set(username, permissions);
    });

    return userPermissions;
  }

  /**
   * @internal
   */
  private _coercePermissionsToGroupedProtoPermissionList(
    permissions: MapLikeChatPermissions): {[group: string]: IPermissionsList} {
      let groupedPermissions = StringMap.coerceToObject<ChatPermission[]>(permissions);
      return mapObjectValues(groupedPermissions, permissionsArr => {
        return {
          values: permissionsArr
        };
      });
    }
}
