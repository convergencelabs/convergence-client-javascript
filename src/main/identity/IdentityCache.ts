import {DomainUser} from "./DomainUser";
import {objectForEach} from "../util/ObjectUtils";
import {
  getOrDefaultArray,
  getOrDefaultObject,
  getOrDefaultString,
  protoToDomainUserType
} from "../connection/ProtocolUtil";
import {toDomainUser} from "./IdentityMessageUtils";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {DomainUserId} from "./DomainUserId";

import {com} from "@convergence/convergence-proto";
import IIdentityCacheUpdateMessage = com.convergencelabs.convergence.proto.identity.IIdentityCacheUpdateMessage;

/**
 * @hidden
 * @internal
 */
export class IdentityCache {
  private readonly _users: Map<string, DomainUser>;
  private readonly _sessions: Map<string, DomainUser>;

  constructor(connection: ConvergenceConnection) {
    this._users = new Map();
    this._sessions = new Map();
    connection.messages().subscribe((event) => {
      if (event.message.identityCacheUpdate) {
        this._processIdentityUpdate(event.message.identityCacheUpdate);
      }
    });
  }

  public getUserForSession(sessionId: string): DomainUser | undefined {
    return this._sessions.get(sessionId);
  }

  public getUser(userId: DomainUserId): DomainUser | undefined {
    return this._users.get(userId.toGuid());
  }

  public _processIdentityUpdate(message: IIdentityCacheUpdateMessage): void {
    getOrDefaultArray(message.users).forEach(userData => {
      const domainUser = toDomainUser(userData);
      this._users.set(domainUser.userId.toGuid(), domainUser);
    });

    objectForEach(getOrDefaultObject(message.sessions), (sessionId, user) => {
      const userType = protoToDomainUserType(user.userType);
      const username = getOrDefaultString(user.username);
      const domainUser = this._users.get(DomainUserId.guid(userType, username));
      this._sessions.set(sessionId, domainUser);
    });
  }
}
