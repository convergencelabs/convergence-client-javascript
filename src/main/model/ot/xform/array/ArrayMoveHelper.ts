/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {
  RangeRelationshipUtil,
  RangeIndexRelationship,
  RangeRangeRelationship
} from "../../util/RangeRelationshipUtil";

/**
 * @hidden
 * @internal
 */
export class ArrayMoveHelper {

  /**
   * Determines if a move op is in the forward direction. For this to be true the from
   * index must be strictly less than the to index.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex < toIndex, false otherwise.
   */
  public static isForwardMove(op: ArrayMoveOperation): boolean {
    return op.fromIndex < op.toIndex;
  }

  /**
   * Determines if a move op is in the backward direction. For this to be true the from
   * index must be strictly greater than the to index.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex > toIndex, false otherwise.
   */
  public static isBackwardMoveMove(op: ArrayMoveOperation): boolean {
    return op.fromIndex > op.toIndex;
  }

  /**
   * Determines if a move op is an empty range. This means that the from and to indices are
   * equal.
   *
   * @param op
   *            The op to evaluate
   * @return true if fromIndex == toIndex, false otherwise.
   */
  public static isIdentityMove(op: ArrayMoveOperation): boolean {
    return op.fromIndex === op.toIndex;
  }

  /**
   * Determines the direction of the move.
   *
   * @param op The operation to evaluate.
   *
   * @return The direction of the move.
   */
  public static getMoveDirection(op: ArrayMoveOperation): MoveDirection {
    if (this.isForwardMove(op)) {
      return MoveDirection.Forward;
    } else if (this.isBackwardMoveMove(op)) {
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
  public static indexBeforeRange(op: ArrayMoveOperation, index: number): boolean {
    return index < this.getRangeMin(op);
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
  public static indexAfterRange(op: ArrayMoveOperation, index: number): boolean {
    return index > this.getRangeMax(op);
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
  public static indexWithinRange(op: ArrayMoveOperation, index: number): boolean {
    return index > this.getRangeMin(op) && index < this.getRangeMax(op);
  }

  public static getRangeIndexRelationship(op: ArrayMoveOperation, index: number): RangeIndexRelationship {
    return RangeRelationshipUtil.getRangeIndexRelationship(this.getRangeMin(op), this.getRangeMax(op), index);
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
  public static getRangeRelationship(op1: ArrayMoveOperation, op2: ArrayMoveOperation): RangeRangeRelationship {
    return RangeRelationshipUtil.getRangeRangeRelationship(
      this.getRangeMin(op1), this.getRangeMax(op1), this.getRangeMin(op2), this.getRangeMax(op2));
  }

  /**
   * Returns the lesser of the fromIndex and the toIndex of the ArrayMoveOperation
   *
   * @param op
   *            The op to get the minimum index for
   * @return min(fromIndex, toIndex)
   */
  public static getRangeMin(op: ArrayMoveOperation): number {
    return Math.min(op.fromIndex, op.toIndex);
  }

  /**
   * Returns the greater of the fromIndex and the toIndex of the ArrayMoveOperation
   *
   * @param op
   *            The op to get the minimum index for
   * @return max(fromIndex, toIndex)
   */
  public static getRangeMax(op: ArrayMoveOperation): number {
    return Math.max(op.fromIndex, op.toIndex);
  }
}

/**
 * @hidden
 * @internal
 */
export enum MoveDirection {
  Forward, Backward, Identity
}
