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
export class IndexTransformer {
  public static handleInsert(indices: number[], insertIndex: number, length: number): number[] {
    return indices.map((index: number) => {
      if (index >= insertIndex) {
        return index + length;
      } else {
        return index;
      }
    });
  }

  public static handleReorder(indices: number[], fromIndex: number, toIndex: number): number[] {
    return indices.map((index: number) => {
      if (index >= toIndex && index < fromIndex) {
        return index + 1;
      } else if (index >= fromIndex && index < toIndex) {
        return index - 1;
      } else {
        return index;
      }
    });
  }

  public static handleRemove(indices: number[], removeIndex: number, length: number): number[] {
    return indices.map((index: number) => {
      if (index > removeIndex) {
        return index - Math.min(index - removeIndex, length);
      } else {
        return index;
      }
    });
  }
}
