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

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {ArrayMoveHelper, MoveDirection} from "./ArrayMoveHelper";

/**
 * @hidden
 * @internal
 */
export const ArrayReplaceMoveOTF: OperationTransformationFunction<ArrayReplaceOperation, ArrayMoveOperation> =
  (s: ArrayReplaceOperation, c: ArrayMoveOperation) => {
    switch (ArrayMoveHelper.getMoveDirection(c)) {
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

function transformAgainstForwardMove(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.After:
      // A-PM-1 and A-PM-5
      return new OperationPair(s, c);
    case RangeIndexRelationship.Start:
      // A-PM-2
      return new OperationPair(s.copy({index: c.toIndex}), c);
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-PM-3 and A-PM-4
      return new OperationPair(s.copy({index: s.index - 1}), c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstBackwardMove(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.After:
      // A-PM-6 and A-PM-10
      return new OperationPair(s, c);
    case RangeIndexRelationship.End:
      // A-PM-7
      return new OperationPair(s.copy({index: c.toIndex}), c);
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.Start:
      // A-PM-8 and A-PM-9
      return new OperationPair(s.copy({index: s.index + 1}), c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstIdentityMove(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  // A-PM-11, A-PM-12, A-PM-13
  return new OperationPair(s, c);
}
