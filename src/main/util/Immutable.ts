/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * @hidden
 * @internal
 */
export class Immutable {

  public static make(source: any): void {
    if (typeof source === "object") {
      Object.freeze(source);
      Object.keys(source).forEach((val: any, idx: number, array: any[]) => {
        Immutable.make(val);
      });
    }
  }

  public static copy(source: any, updates?: any): any {
    const result: any = {};
    Object.keys(source).forEach((prop: any, idx: number, array: any[]) => {
      result[prop] = updates[prop] !== undefined ? updates[prop] : source[prop];
    });

    // we do a shallow freeze here since we assume that the whole thing was
    // already immutable.
    Object.freeze(result);
    return result;
  }

  public static getOrDefault<T>(value: T, defaultValue: T): T {
    return value === undefined ? defaultValue : value;
  }

  public static update(current: any, update: any): any {
    return update !== undefined ? update : current;
  }
}
