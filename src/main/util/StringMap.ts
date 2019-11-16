/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * Represents a Javascript Map or Object literal.
 */
export type StringMapLike = Map<string, any> | {[key: string]: any};

/**
 * @hidden
 * @internal
 */
export class StringMap {
  public static objectToMap<T>(obj: {[key: string]: T}): Map<string, T> {
    const map: Map<string, T> = new Map<string, T>();
    Object.keys(obj).forEach(k => map.set(k, obj[k]));
    return map;
  }

  public static mapToObject<T>(map: Map<string, T>): {[key: string]: T} {
    const obj: {[key: string]: T} = {};
    map.forEach((v, k) => obj[k] = v);
    return obj;
  }

  public static coerceToObject<T>(map: StringMapLike): {[key: string]: T} {
    if (map instanceof Map) {
      return StringMap.mapToObject(map);
    } else {
      return map;
    }
  }

  public static coerceToMap<T>(map: StringMapLike): Map<string, T> {
    if (map instanceof Map) {
      return map;
    } else {
      return StringMap.objectToMap(map);
    }
  }

  public static toStringMap<T>(map: StringMapLike): Map<string, T> {
    if (!map) {
      return map as Map<string, T>;
    }

    if (map instanceof Map) {
      return map;
    }

    return StringMap.objectToMap(map);
  }
}
