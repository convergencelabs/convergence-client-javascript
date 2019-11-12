/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {ArrayMoveHelper, MoveDirection} from "./ArrayMoveHelper";

/**
 * @hidden
 * @internal
 */
export const ArrayInsertMoveOTF: OperationTransformationFunction<ArrayInsertOperation, ArrayMoveOperation> =
  (s: ArrayInsertOperation, c: ArrayMoveOperation) => {
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

function transformAgainstForwardMove(s: ArrayInsertOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.Start:
      // A-IM-1 and A-IM-2
      return new OperationPair(s, c.copy({fromIndex: c.fromIndex + 1, toIndex: c.toIndex + 1}));
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-IM-3 and A-IM-4
      return new OperationPair(s.copy({index: s.index - 1}), c.copy({toIndex: c.toIndex + 1}));
    case RangeIndexRelationship.After:
      // A-IM-5
      return new OperationPair(s, c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstBackwardMove(s: ArrayInsertOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.Start:
      // A-IM-6 and A-IM-7
      return new OperationPair(s, c.copy({fromIndex: c.fromIndex + 1, toIndex: c.toIndex + 1}));
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-IM-8 and A-IM-9
      return new OperationPair(s.copy({index: s.index + 1}), c.copy({fromIndex: c.fromIndex + 1}));
    case RangeIndexRelationship.After:
      // A-IM-10
      return new OperationPair(s, c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstIdentityMove(s: ArrayInsertOperation, c: ArrayMoveOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(c, s.index)) {
    case RangeIndexRelationship.After:
      // A-IM-13
      return new OperationPair(s, c);
    default:
      // A-IM-11 and A-IM-12
      return new OperationPair(s, c.copy({fromIndex: c.fromIndex + 1, toIndex: c.toIndex + 1}));
  }
}
