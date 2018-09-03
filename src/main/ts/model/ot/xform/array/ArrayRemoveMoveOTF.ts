import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {ArrayMoveHelper} from "./ArrayMoveHelper";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {MoveDirection} from "./ArrayMoveHelper";

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
