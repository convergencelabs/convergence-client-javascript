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

import {IndexRange} from "../../../reference";
import {IndexTransformer} from "./IndexTransformer";

/**
 * @hidden
 * @internal
 */
export class RangeTransformer {
  public static handleInsert(ranges: IndexRange[], insertIndex: number, length: number): IndexRange[] {
    return ranges.map(range => {
      const indices: number[] = RangeTransformer._rangeToTuple(range);
      const xFormed: number[] = IndexTransformer.handleInsert(indices, insertIndex, length);
      return RangeTransformer._tupleToRange(xFormed);
    });
  }

  public static handleReorder(ranges: IndexRange[], fromIndex: number, toIndex: number): IndexRange[] {
    return ranges.map(range => {
      const indices: number[] = RangeTransformer._rangeToTuple(range);
      const xFormed: number[] = IndexTransformer.handleReorder(indices, fromIndex, toIndex);
      return RangeTransformer._tupleToRange(xFormed);
    });
  }

  public static handleRemove(ranges: IndexRange[], removeIndex: number, length: number): IndexRange[] {
    return ranges.map(range => {
      const indices: number[] = RangeTransformer._rangeToTuple(range);
      const xFormed: number[] = IndexTransformer.handleRemove(indices, removeIndex, length);
      return RangeTransformer._tupleToRange(xFormed);
    });
  }

  private static _rangeToTuple(range: IndexRange): number[] {
    return [range.start, range.end];
  }

  private static _tupleToRange(tuple: number[]): IndexRange {
    return {start: tuple[0], end: tuple[1]};
  }
}
