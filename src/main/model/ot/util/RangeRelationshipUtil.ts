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

/**
 * @hidden
 * @internal
 */
export class RangeRelationshipUtil {
  public static getRangeIndexRelationship(rStart: number, rEnd: number, index: number): RangeIndexRelationship {
    if (index < rStart) {
      return RangeIndexRelationship.Before;
    } else if (index > rEnd) {
      return RangeIndexRelationship.After;
    } else if (index === rStart) {
      return RangeIndexRelationship.Start;
    } else if (index === rEnd) {
      return RangeIndexRelationship.End;
    } else {
      return RangeIndexRelationship.Within;
    }
  }

  public static getRangeRangeRelationship(sStart: number, sEnd: number,
                                          cStart: number, cEnd: number): RangeRangeRelationship {
    if (sStart === cStart) {
      if (sEnd === cEnd) {
        return RangeRangeRelationship.EqualTo;
      } else if (cEnd > sEnd) {
        return RangeRangeRelationship.Starts;
      } else {
        return RangeRangeRelationship.StartedBy;
      }
    } else if (sStart > cStart) {
      if (sStart > cEnd) {
        return RangeRangeRelationship.PrecededBy;
      } else if (cEnd === sEnd) {
        return RangeRangeRelationship.Finishes;
      } else if (sEnd < cEnd) {
        return RangeRangeRelationship.ContainedBy;
      } else if (sStart === cEnd) {
        return RangeRangeRelationship.MetBy;
      } else {
        return RangeRangeRelationship.OverlappedBy;
      }
    } else { // sStart < cStart
      if (sEnd < cStart) {
        return RangeRangeRelationship.Precedes;
      } else if (cEnd === sEnd) {
        return RangeRangeRelationship.FinishedBy;
      } else if (sEnd > cEnd) {
        return RangeRangeRelationship.Contains;
      } else if (sEnd === cStart) {
        return RangeRangeRelationship.Meets;
      } else {
        return RangeRangeRelationship.Overlaps;
      }
    }
  }
}

/**
 * @hidden
 * @internal
 */
export enum RangeIndexRelationship {
  Before,
  Start,
  Within,
  End,
  After
}

/**
 * @hidden
 * @internal
 */
export enum RangeRangeRelationship {
  Precedes,
  PrecededBy,
  Meets,
  MetBy,
  Overlaps,
  OverlappedBy,
  Starts,
  StartedBy,
  Contains,
  ContainedBy,
  Finishes,
  FinishedBy,
  EqualTo
}
