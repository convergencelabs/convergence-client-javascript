/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
