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
export class IndexTransformer {
  public static handleSplice(indices: number[], spliceIndex: number, deleteCount: number, insertCount: number): number[] {
    return indices.map(index => {
      if (index >= index) {
        return (index - Math.min(index - spliceIndex, deleteCount)) + insertCount
      } else {
        return index
      }
    });
  }

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
