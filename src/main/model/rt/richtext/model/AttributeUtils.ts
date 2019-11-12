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
export class AttributeUtils {
  public static areAttributesEqual(a: Map<string, any>, b: Map<string, any>): boolean {
    if (a.size !== b.size) {
      return false;
    } else {
      let equal = true;
      for (const v of a) {
        if (b.get(v[0]) !== v[1]) {
          equal = false;
          break;
        }
      }
      return equal;
    }
  }
}
