/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {ArrayMoveHelper, MoveDirection} from "./ArrayMoveHelper";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayRemoveMoveOTF: OperationTransformationFunction<ArrayRemoveOperation, ArrayMoveOperation> =
  (s: ArrayRemoveOperation, c: ArrayMoveOperation) => {
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

function transformAgainstForwardMove(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
      // A-RM-1
      return new OperationPair(s, c.copy({fromIndex: c.fromIndex - 1, toIndex: c.toIndex - 1}));
    case RangeIndexRelationship.Start:
      // A-RM-2
      return new OperationPair(s.copy({index: c.toIndex}), c.copy({noOp: true}));
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-RM-3 and A-RM-4
      return new OperationPair(s.copy({index: s.index - 1}), c.copy({toIndex: c.toIndex - 1}));
    case RangeIndexRelationship.After:
      // A-RM-5
      return new OperationPair(s, c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstBackwardMove(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
      // A-RM-6
      return new OperationPair(s, c.copy({fromIndex: c.fromIndex - 1, toIndex: c.toIndex - 1}));
    case RangeIndexRelationship.Start:
    case RangeIndexRelationship.Within:
      // A-RM-7 and A-RM-8
      return new OperationPair(s.copy({index: s.index + 1}), c.copy({fromIndex: c.fromIndex - 1}));
    case RangeIndexRelationship.End:
      // A-RM-9
      return new OperationPair(s.copy({index: c.toIndex}), c.copy({noOp: true}));
    case RangeIndexRelationship.After:
      // A-RM-10
      return new OperationPair(s, c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstIdentityMove(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
      // A-RM-11
      return new OperationPair(s, c.copy({fromIndex: c.fromIndex - 1, toIndex: c.toIndex - 1}));
    case RangeIndexRelationship.Start:
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-RM-12
      return new OperationPair(s, c.copy({noOp: true}));
    default:
      // A-RM-13
      return new OperationPair(s, c);
  }
}
