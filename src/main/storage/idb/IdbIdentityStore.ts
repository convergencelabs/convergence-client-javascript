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

import {IdbPersistenceStore} from "./IdbPersistenceStore";
import {IIdentityStore} from "../api";
import {DomainUser, DomainUserId, DomainUserType} from "../../identity";
import {IdbSchema} from "./IdbSchema";
import {toVoidPromise} from "./promise";

/**
 * @hidden
 * @internal
 */
export class IdbIdentityStore extends IdbPersistenceStore implements IIdentityStore {
  public putUser(user: DomainUser): Promise<void> {
    const store = IdbSchema.DomainUser.Store;

    return this._withWriteStore(store, async (userStore) => {
      const userData: IDomainUserData = {
        userType: user.userId.userType,
        username: user.userId.username,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };

      await toVoidPromise(userStore.put(userData));
    });
  }

  public async getUsers(): Promise<DomainUser[]> {
    const store = IdbSchema.DomainUser.Store;
    const userData = await this._getAll<IDomainUserData>(store);
    return userData.map(user => new DomainUser(
      user.userType,
      user.username,
      user.firstName,
      user.lastName,
      user.displayName,
      user.email));
  }

  public putSession(sessionId: string, userId: DomainUserId): Promise<void> {
    const store = IdbSchema.Session.Store;
    return this._withWriteStore(store, async (sessionStore) => {
      const data: ISessionEntry = {
        sessionId,
        userType: userId.userType,
        username: userId.username
      };
      await toVoidPromise(sessionStore.put(data));
    });
  }

  public async getSessions(): Promise<Map<string, DomainUserId>> {
    const store = IdbSchema.Session.Store;
    const entries = await this._getAll<ISessionEntry>(store);
    const sessions = new Map<string, DomainUserId>();
    entries.forEach(entry => {
      sessions.set(entry.sessionId, new DomainUserId(entry.userType, entry.username));
    });
    return sessions;
  }
}

interface IDomainUserData {
  userType: DomainUserType;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ISessionEntry {
  sessionId: string;
  userType: DomainUserType;
  username: string;
}
