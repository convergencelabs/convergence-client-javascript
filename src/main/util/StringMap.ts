/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * @hidden
 * @internal
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
