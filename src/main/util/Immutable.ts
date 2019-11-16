/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
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
