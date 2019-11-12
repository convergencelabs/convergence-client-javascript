/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {ArrayMoveHelper, MoveDirection} from "./ArrayMoveHelper";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayMoveReplaceOTF: OperationTransformationFunction<ArrayMoveOperation, ArrayReplaceOperation> =
  (s: ArrayMoveOperation, c: ArrayReplaceOperation) => {
    switch (ArrayMoveHelper.getMoveDirection(s)) {
      case MoveDirection.Forward:
        return transformAgainstForwardMove(s, c);
      case MoveDirection.Backward:
        return transformAgainstBackwardMove(s, c);
      case MoveDirection.Identity:
        return transformAgainstIdentityMove(s, c);
      default:
        throw new Error("Invalid move direction");
    }
  };

function transformAgainstForwardMove(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.After:
      // A-MP-1 and A-MP-5
      return new OperationPair(s, c);
    case RangeIndexRelationship.Start:
      // A-MP-2
      return new OperationPair(s, c.copy({index: s.toIndex}));
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-MP-3 and A-MP-4
      return new OperationPair(s, c.copy({index: c.index - 1}));
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstBackwardMove(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.After:
      // A-MP-6 and A-MP-10
      return new OperationPair(s, c);
    case RangeIndexRelationship.End:
      // A-MP-7
      return new OperationPair(s, c.copy({index: s.toIndex}));
    case RangeIndexRelationship.Start:
    case RangeIndexRelationship.Within:
      // A-MP-8 and A-MP-9
      return new OperationPair(s, c.copy({index: c.index + 1}));
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstIdentityMove(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
  "use strict";

  // A-MP-11, A-MP-12, A-MP-13
  return new OperationPair(s, c);
}
