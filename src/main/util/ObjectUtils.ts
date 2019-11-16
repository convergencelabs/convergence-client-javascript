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

/**
 * @hidden
 * @internal
 */
export type MapFunction<F, T> = (val: F) => T;

/**
 * @hidden
 * @internal
 */
export function mapObjectValues<F, T>(obj: {[key: string]: F}, mapFunc: MapFunction<F, T>): {[key: string]: T} {
  "use strict";
  return Object.keys(obj).reduce((newObj: any, value: any) => {
    newObj[value] = mapFunc(obj[value]);
    return newObj;
  }, {});
}

/**
 * @hidden
 * @internal
 */
export function objectForEach<T>(obj: {[key: string]: T}, callback: (key: string, val: T) => void): void {
  "use strict";
  return Object.keys(obj).forEach(key => {
    callback(key, obj[key]);
  });
}

/**
 * @hidden
 * @internal
 */
export function deepClone(from: any): any {
  const type: string = typeof from;

  // Primitive types
  if (from === null || from === undefined || type === "string" || type === "number" || type === "boolean") {
    return from;
  }

  // Handle Date
  if (from instanceof Date) {
    return new Date(from.getTime());
  }

  // Handle Array
  if (Array.isArray(from)) {
    return from.map(e => deepClone(e));
  }

  if (from instanceof Map) {
    const result = new Map();
    from.forEach((v, k) => {
      result.set(k, deepClone(v));
    });
    return result;
  }

  if (from instanceof Set) {
    const result = new Set();
    from.forEach(v => result.add(deepClone(v)));
    return result;
  }

  // Handle Object
  if (from.constructor === Object) {
    const result: {[key: string]: any} = {};
    Object.keys(from).forEach(key => {
      result[key] = deepClone(from[key]);
    });
    return result;
  }

  const name: string = from.constructor.name || from.constructor.toString();
  throw new Error("Can not clone unknown type: " + name);
}
