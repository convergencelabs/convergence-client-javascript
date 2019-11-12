/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
