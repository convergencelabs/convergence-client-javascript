/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

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
import {StorageEngine} from "../storage/StorageEngine";

import {com} from "@convergence/convergence-proto";
import IIdentityCacheUpdateMessage = com.convergencelabs.convergence.proto.identity.IIdentityCacheUpdateMessage;
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";

/**
 * @hidden
 * @internal
 */
export class IdentityCache {
  private readonly _users: Map<string, DomainUser>;
  private readonly _sessions: Map<string, DomainUser>;
  private readonly _storage: StorageEngine;
  private readonly _log: Logger;

  constructor(connection: ConvergenceConnection, storage: StorageEngine) {
    this._users = new Map();
    this._sessions = new Map();
    connection.messages().subscribe((event) => {
      if (event.message.identityCacheUpdate) {
        this._processIdentityUpdate(event.message.identityCacheUpdate);
      }
    });

    this._storage = storage;

    this._log = Logging.logger("identity");
  }

  public async init(): Promise<void> {
    if (this._storage.isEnabled()) {
      const users = await this._storage.identityStore().getUsers();
      users.forEach(user => {
        this._users.set(user.userId.toGuid(), user);
      });

      const sessions = await this._storage.identityStore().getSessions();
      sessions.forEach((userId, sessionId) => {
        const user = this._users.get(userId.toGuid());
        this._sessions.set(sessionId, user);
      });
    }
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
      if (this._storage.isEnabled()) {
        this._storage.identityStore().putUser(domainUser)
          .catch(e => this._log.error("Error storing user", e));
      }
    });

    objectForEach(getOrDefaultObject(message.sessions), (sessionId, user) => {
      const userType = protoToDomainUserType(user.userType);
      const username = getOrDefaultString(user.username);
      const domainUser = this._users.get(DomainUserId.guid(userType, username));
      this._sessions.set(sessionId, domainUser);
      if (this._storage.isEnabled()) {
        this._storage.identityStore().putSession(sessionId, domainUser.userId)
          .catch(e => this._log.error("Error storing session", e));
      }
    });
  }
}
