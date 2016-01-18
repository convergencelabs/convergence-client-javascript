/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayRemoveMoveOTF implements OperationTransformationFunction<ArrayRemoveOperation, ArrayMoveOperation> {
    transform(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
      switch (ArrayMoveHelper.getMoveDirection(c)) {
        case MoveDirection.Forward:
          return this.transformAgainstForwardMove(s, c);
        case MoveDirection.Backward:
          return this.transformAgainstBackwardMove(s, c);
        case MoveDirection.Identity:
          return this.transformAgainstIdentityMove(s, c);
      }
    }

    private transformAgainstForwardMove(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
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
      }
    }

    private transformAgainstBackwardMove(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
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
      }
    }

    private transformAgainstIdentityMove(s: ArrayRemoveOperation, c: ArrayMoveOperation): OperationPair {
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
  }
}
