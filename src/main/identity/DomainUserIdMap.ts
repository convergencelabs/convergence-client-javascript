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
import {TypeChecker} from "../util/TypeChecker";
import {ConvergenceError} from "../util";
import {DomainUserMapping} from "./DomainUserMapping";
import {objectForEach} from "../util/ObjectUtils";

/**
 * The DomainUserIdMap is a utility class that will uniquely map a set
 * of Convergence Domain User Ids to values.
 *
 * @module Users and Identity
 */
export class DomainUserIdMap<V> {

  /**
   * Creates a new DomainUserIdMap from a source. If the soruce is a Map
   * whose keys are strings, the strings will be assumed to be normal
   * usernames and will be converted into DomainUserIds using the
   * DomainUserIds.normal() method.
   *
   * @param source The source of user mapping data.
   *
   * @returns A new DomainUserIdMap object.
   */
  public static of<V>(source: DomainUserMapping<V>): DomainUserIdMap<V> {
    if (TypeChecker.isObject(source)) {
      source = StringMap.coerceToMap(source)
    }

    if (source instanceof DomainUserIdMap || TypeChecker.isMap(source)) {
      const result = new DomainUserIdMap<V>();
      source.forEach((val: V, user: DomainUserIdentifier) => {
        result.set(user, val);
      });
      return result;
    } else {
      throw new ConvergenceError("Can not convert the supplied value to a DomainUserIdMap");
    }
  }

  /**
   * Creates a new DomainUserIdMap from a plan JavaScript object
   * whose keys are DomainUserId guid's.
   *
   * @param map The guid mapping.
   *
   * @returns The JavaScript object map converted to a DomainUserIdMap.
   */
  public static fromGuidObjectMap<V>(map: { [key: string]: V }): DomainUserIdMap<V> {
    const result = new DomainUserIdMap<V>();
    objectForEach(map, (key, val) => {
      result.set(DomainUserId.fromGuid(key), val)
    });

    return result;
  }

  /**
   * @internal
   * @hidden
   */
  private readonly _map: Map<string, V>;

  constructor() {
    this._map = new Map<string, V>();
  }

  /**
   * Gets the current value for the given user.
   * @param user The user to get the value for.
   * @returns The value mapped to for the supplied user, or undefined
   *   if the user does not exist in the map.
   */
  public get(user: DomainUserIdentifier): V | undefined {
    return this._map.get(DomainUserId.of(user).toGuid());
  }

  /**
   * Sets a mapping between a user and a value in the map.
   *
   * @param user The user to set the value for.
   * @param value The value to set.
   */
  public set(user: DomainUserIdentifier, value: V): void {
    this._map.set(DomainUserId.of(user).toGuid(), value);
  }

  /**
   * Determines if the map contains a particular domain user.
   *
   * @param user The user to check.
   * @returns True if the user is in the map, false otherwise.
   */
  public has(user: DomainUserIdentifier): boolean {
    return this._map.has(DomainUserId.of(user).toGuid());
  }

  /**
   * Removes a user from the map.
   *
   * @param user The user to remove.
   */
  public delete(user: DomainUserIdentifier): void {
    this._map.delete(DomainUserId.of(user).toGuid());
  }

  /**
   * @returns the [[DomainUserId]]s of all of the users in the map.
   */
  public keys(): DomainUserId[] {
    return Array.from(this._map.keys()).map(DomainUserId.fromGuid);
  }

  /**
   * @returns All mappings in the map as tuples. Each tuple is represented by
   * and array in the format of [key, value].
   */
  public entries(): [DomainUserId, V][] {
    return Array.from(this._map.entries()).map(v => [DomainUserId.fromGuid(v[0]), v[1]]);
  }

  /**
   * @return The number of users contained in the map.
   */
  public size(): number {
    return this._map.size;
  }

  /**
   * Allows consumers to iterate of the maps (key, value) pairs.
   *
   * @param callback The iteration callback.
   */
  public forEach(callback: (value: V, userId: DomainUserId) => void): void {
    this._map.forEach((v: V, guid: string) => {
      callback(v, DomainUserId.fromGuid(guid));
    });
  }

  /**
   * Returns this user id mapping as a plain JavaScript Object
   * using the DomainUserId's guidas the map key.
   */
  public toGuidObjectMap(): { [key: string]: V } {
    const result: { [key: string]: V } = {};
    this._map.forEach((v: V, guid: string) => {
      result[guid] = v;
    });

    return result;
  }
}
