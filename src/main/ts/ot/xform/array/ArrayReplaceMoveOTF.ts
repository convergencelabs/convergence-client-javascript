/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayReplaceMoveOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArrayMoveOperation> {
    transform(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
      switch (ArrayMoveHelper.getMoveDirection(c)) {
        case MoveDirection.Forward:
          return this.transformAgainstForwardMove(s, c);
        case MoveDirection.Backward:
          return this.transformAgainstBackwardMove(s, c);
        case MoveDirection.Identity:
          return this.transformAgainstIdentityMove(s, c);
      }
    }

    private transformAgainstForwardMove(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
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
      }
    }

    private transformAgainstBackwardMove(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
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
          return new OperationPair(s.copy({index: s.index + 1}), c)
      }
    }

    private transformAgainstIdentityMove(s: ArrayReplaceOperation, c: ArrayMoveOperation): OperationPair {
      // A-PM-11, A-PM-12, A-PM-13
      return new OperationPair(s, c);
    }
  }
}
