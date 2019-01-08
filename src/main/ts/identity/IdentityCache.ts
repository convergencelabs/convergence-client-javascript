import {DomainUser} from "./DomainUser";
import {io} from "@convergence/convergence-proto";
import IIdentityCacheUpdateMessage = io.convergence.proto.IIdentityCacheUpdateMessage;
import {objectForEach} from "../util/ObjectUtils";
import {getOrDefaultArray, getOrDefaultObject} from "../connection/ProtocolUtil";
import {toDomainUser} from "./IdentityMessageUtils";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";

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

  public getUser(username: string): DomainUser | undefined {
    return this._users.get(username);
  }

  public _processIdentityUpdate(message: IIdentityCacheUpdateMessage): void {
    getOrDefaultArray(message.users).forEach(userData => {
      const domainUser = toDomainUser(userData);
      this._users.set(domainUser.username, domainUser);
    });

    objectForEach(getOrDefaultObject(message.sessions), (sessionId, username) => {
      const domainUser = this._users.get(username);
      this._sessions.set(sessionId, domainUser);
    });
  }
}
