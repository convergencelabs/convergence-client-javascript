import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {ArrayMoveHelper} from "./ArrayMoveHelper";
import {MoveDirection} from "./ArrayMoveHelper";

export var ArrayReplaceMoveOTF: OperationTransformationFunction<ArrayReplaceOperation, ArrayMoveOperation> =
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
