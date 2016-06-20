import {RangeRelationshipUtil} from "../../util/RangeRelationshipUtil";
import {RangeRangeRelationship} from "../../util/RangeRelationshipUtil";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import {IndexRange} from "./IndexRange";

export class PositionalMoveHelper {

  /**
   * Determines if a move op is in the forward direction. For this to be true the from
   * index must be strictly less than the to index.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex < toIndex, false otherwise.
   */
  static isForwardMove(range: IndexRange): boolean {
    return range.fromIndex < range.toIndex;
  }

  /**
   * Determines if a move op is in the backward direction. For this to be true the from
   * index must be strictly greater than the to index.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex > toIndex, false otherwise.
   */
  static isBackwardMoveMove(range: IndexRange): boolean {
    return range.fromIndex > range.toIndex;
  }

  /**
   * Determines if a move op is an empty range. This means that the from and to indices are
   * equal.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex == toIndex, false otherwise.
   */
  static isIdentityMove(range: IndexRange): boolean {
    return range.fromIndex === range.toIndex;
  }

  /**
   * Determines the direction of the move.
   *
   * @param op The operation to evaluate.
   *
   * @return The direction of the move.
   */
  static getMoveDirection(range: IndexRange): MoveDirection {
    if (this.isForwardMove(range)) {
      return MoveDirection.Forward;
    } else if (this.isBackwardMoveMove(range)) {
      return MoveDirection.Backward;
    } else {
      return MoveDirection.Identity;
    }
  }

  /**
   * Determines if an index is entirely before a range.
   *
   * @param op
   *            The op that represents the range.
   * @param index
   *            The index to evaluate
   * @return True if index < min(fromIndex, toIndex), false otherwise.
   */
  static indexBeforeRange(range: IndexRange, index: number): boolean {
    return index < this.getRangeMin(range);
  }

  /**
   * Determines if an index is entirely after a range.
   *
   * @param op
   *            The op that represents the range.
   * @param index
   *            The index to evaluate
   * @return True if index > max(fromIndex, toIndex), false otherwise.
   */
  static indexAfterRange(range: IndexRange, index: number): boolean {
    return index > this.getRangeMax(range);
  }

  /**
   *
   * Determines if an index is within a range.
   *
   * @param op
   *            The op that represents the range.
   * @param index
   *            The index to evaluate
   * @return True if index < max(fromIndex, toIndex) && index > min(fromIndex, toIndex), false
   *         otherwise.
   */
  static indexWithinRange(range: IndexRange, index: number): boolean {
    return index > this.getRangeMin(range) && index < this.getRangeMax(range);
  }

  static getRangeIndexRelationship(range: IndexRange, index: number): RangeIndexRelationship {
    return RangeRelationshipUtil.getRangeIndexRelationship(this.getRangeMin(range), this.getRangeMax(range), index);
  }

  /**
   * Gets the range relationship of two array move operations.  The evaluation
   * will be in the form of op1 <verb> op2. For example if op1 <precedes> op2
   * the Precedes will be returned.
   *
   * @param op1 The first array move operation
   * @param op2 The second array move operation
   *
   * @return The interval that matched op1 <verb> op2
   */
  static getRangeRelationship(r1: IndexRange, r2: IndexRange): RangeRangeRelationship {
    return RangeRelationshipUtil.getRangeRangeRelationship(
      this.getRangeMin(r1), this.getRangeMax(r1), this.getRangeMin(r2), this.getRangeMax(r2));
  }

  /**
   * Returns the lesser of the fromIndex and the toIndex of the ArrayMoveOperation
   *
   * @param op
   *            The op to get the minimum index for
   * @return min(fromIndex, toIndex)
   */
  static getRangeMin(range: IndexRange): number {
    return Math.min(range.fromIndex, range.toIndex);
  }

  /**
   * Returns the greater of the fromIndex and the toIndex of the ArrayMoveOperation
   *
   * @param op
   *            The op to get the minimum index for
   * @return max(fromIndex, toIndex)
   */
  static getRangeMax(range: IndexRange): number {
    return Math.max(range.fromIndex, range.toIndex);
  }
}

export enum MoveDirection {
  Forward, Backward, Identity
}
