/*
 * Copyright (c) 2020 - Convergence Labs, Inc.
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
import {DomainUserIdentifier} from "./DomainUserIdentifier";
import {DomainUserId} from "./DomainUserId";
import {StringMap} from "../util/StringMap";

export class DomainUserIdMap<V> {
  private readonly _map: Map<string, V>;

  constructor(map?: Map<string, V> | {[key: string]: V}) {
    this._map = StringMap.coerceToMap(map) || new Map();
  }

  public get(user: DomainUserIdentifier): V | undefined {
    return this._map.get(DomainUserId.toDomainUserId(user).toGuid());
  }

  public set(user: DomainUserIdentifier, value: V): void {
    this._map.set(DomainUserId.toDomainUserId(user).toGuid(), value);
  }

  public has(user: DomainUserIdentifier): boolean {
    return this._map.has(DomainUserId.toDomainUserId(user).toGuid());
  }

  public delete(user: DomainUserIdentifier): void {
    this._map.delete(DomainUserId.toDomainUserId(user).toGuid());
  }

  public keys(): DomainUserId[] {
    return Array.from(this._map.keys()).map(DomainUserId.toDomainUserId);
  }

  public forEach(callback: (value: V, userId: DomainUserId) => void): void {
    this._map.forEach((v: V, userId: string) => {
      callback(v, DomainUserId.toDomainUserId(userId));
    });
  }
}
