import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {ArrayMoveHelper} from "./ArrayMoveHelper";
import {MoveDirection} from "./ArrayMoveHelper";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";

export const ArrayMoveInsertOTF: OperationTransformationFunction<ArrayMoveOperation, ArrayInsertOperation> =
  (s: ArrayMoveOperation, c: ArrayInsertOperation) => {
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

function transformAgainstForwardMove(s: ArrayMoveOperation, c: ArrayInsertOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.Start:
      // A-MI-1 and A-MI-2
      return new OperationPair(s.copy({fromIndex: s.fromIndex + 1, toIndex: s.toIndex + 1}), c);
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-MI-3 and A-MI-4
      return new OperationPair(s.copy({toIndex: s.toIndex + 1}), c.copy({index: c.index - 1}));
    case RangeIndexRelationship.After:
      // A-MI-5
      return new OperationPair(s, c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstBackwardMove(s: ArrayMoveOperation, c: ArrayInsertOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
    case RangeIndexRelationship.Before:
    case RangeIndexRelationship.Start:
      // A-MI-6 and A-MI-7
      return new OperationPair(s.copy({fromIndex: s.fromIndex + 1, toIndex: s.toIndex + 1}), c);
    case RangeIndexRelationship.Within:
    case RangeIndexRelationship.End:
      // A-MI-8 and A-MI-9
      return new OperationPair(s.copy({fromIndex: s.fromIndex + 1}), c.copy({index: c.index + 1}));
    case RangeIndexRelationship.After:
      // A-MI-10
      return new OperationPair(s, c);
    default:
      throw new Error("Invalid range-index relationship");
  }
}

function transformAgainstIdentityMove(s: ArrayMoveOperation, c: ArrayInsertOperation): OperationPair {
  "use strict";

  switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
    case RangeIndexRelationship.After:
      // A-MI-13
      return new OperationPair(s, c);
    default:
      // A-MI-11 and A-MI-12
      return new OperationPair(s.copy({fromIndex: s.fromIndex + 1, toIndex: s.toIndex + 1}), c);
  }
}
