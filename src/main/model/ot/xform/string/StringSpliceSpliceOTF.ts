/*
 * Copyright (c) 2021 - Convergence Labs, Inc.
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

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringSpliceOperation} from "../../ops/StringSpliceOperation";
import {RangeRangeRelationship, RangeRelationshipUtil} from "../../util/RangeRelationshipUtil";

enum SpliceType {
  Insert,
  Remove,
  Splice,
  NoOp
}

function getSpliceType(op: StringSpliceOperation): SpliceType {
  if (op.deleteCount === 0 && op.insertValue.length > 0) {
    return SpliceType.Insert;
  } else if (op.deleteCount > 0 && op.insertValue.length === 0) {
    return SpliceType.Remove;
  } else if (op.deleteCount > 0 && op.insertValue.length > 0) {
    return SpliceType.Splice;
  } else {
    return SpliceType.NoOp;
  }
}

/**
 * @hidden
 * @internal
 */
export const StringSpliceSpliceOTF: OperationTransformationFunction<StringSpliceOperation, StringSpliceOperation> =
  (s: StringSpliceOperation, c: StringSpliceOperation) => {

    const sType = getSpliceType(s);
    const cType = getSpliceType(c);

    if (sType === SpliceType.NoOp || cType === SpliceType.NoOp) {
      return new OperationPair(s, c);
    } else if (sType === SpliceType.Insert && cType === SpliceType.Insert) {
      return transformInsertInsert(s, c);
    } else if (sType === SpliceType.Insert && cType === SpliceType.Remove) {
      return transformInsertRemove(s, c);
    } else if (sType === SpliceType.Insert && cType === SpliceType.Splice) {
      return transformInsertSplice(s, c);
    } else if (sType === SpliceType.Remove && cType === SpliceType.Insert) {
      return transformRemoveInsert(s, c);
    } else if (sType === SpliceType.Remove && cType === SpliceType.Remove) {
      return transformRemoveRemove(s, c);
    } else if (sType === SpliceType.Remove && cType === SpliceType.Splice) {
      return transformRemoveSplice(s, c);
    } else if (sType === SpliceType.Splice && cType === SpliceType.Insert) {
      return transformSpliceInsert(s, c);
    } else if (sType === SpliceType.Splice && cType === SpliceType.Remove) {
      return transformSpliceRemove(s, c);
    } else if (sType === SpliceType.Splice && cType === SpliceType.Splice) {
      return transformSpliceSplice(s, c);
    }
  };

function transformInsertInsert(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  if (s.index <= c.index) {
    // S-II-1 and S-II-2
    return new OperationPair(s, c.copy({index: c.index + s.insertValue.length}));
  } else {
    // S-II-3
    return new OperationPair(s.copy({index: s.index + c.insertValue.length}), c);
  }
}

function transformInsertRemove(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  if (s.index <= c.index) {
    // S-IR-1 and S-IR-2
    return new OperationPair(s, c.copy({index: c.index + s.insertValue.length}))
  } else if (s.index >= c.index + c.deleteCount) {
    // S-IR-5
    return new OperationPair(s.copy({index: s.index - c.deleteCount}), c);
  } else {
    // S-IR-3 and S-IR-4
    return new OperationPair(s.copy({noOp: true}), c.copy({deleteCount: c.deleteCount + s.insertValue.length}))
  }
}

function transformInsertSplice(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  if (s.index <= c.index) {
    return new OperationPair(s, c.copy({index: c.index + s.insertValue.length}));
  } else if (c.index + c.deleteCount > s.index) {
    return new OperationPair(s.copy({noOp: true}), c.copy({deleteCount: c.deleteCount + s.insertValue.length}));
  } else {
    return new OperationPair(s.copy({index: s.index - c.deleteCount + c.insertValue.length}), c);
  }
}

function transformRemoveInsert(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  if (c.index <= s.index) {
    // S-RI-1 and S-RI-2
    return new OperationPair(s.copy({index: s.index + c.insertValue.length}), c);
  } else if (c.index >= s.index + s.deleteCount) {
    // S-RI-5
    return new OperationPair(s, c.copy({index: c.index - s.deleteCount}));
  } else {
    // S-RI-3 and S-RI-4
    return new OperationPair(s.copy({deleteCount: s.deleteCount + c.insertValue.length}), c.copy({noOp: true}));
  }
}

function transformRemoveRemove(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  const cStart = c.index
  const cEnd = c.index + c.deleteCount

  const sStart = s.index
  const sEnd = s.index + s.deleteCount

  const relationship = RangeRelationshipUtil.getRangeRangeRelationship(sStart, sEnd, cStart, cEnd)
  switch (relationship) {
    case RangeRangeRelationship.Precedes:
      // S-RR-1
      return new OperationPair(s, c.copy({index: c.index - s.deleteCount}));

    case RangeRangeRelationship.PrecededBy:
      // S-RR-2
      return new OperationPair(s.copy({index: s.index - c.deleteCount}), c);

    case RangeRangeRelationship.Meets:
    case RangeRangeRelationship.Overlaps: {
      // S-RR-3
      // S-RR-5
      const overlapLength = s.index + s.deleteCount - c.index;
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - overlapLength}),
        c.copy({index: s.index, deleteCount: c.deleteCount - overlapLength})
      );
    }
    case RangeRangeRelationship.MetBy:
    case RangeRangeRelationship.OverlappedBy: {
      // S-RR-4
      // S-RR-6
      const overlapLength = c.index + c.deleteCount - s.index
      return new OperationPair(
        s.copy({index: c.index, deleteCount: s.deleteCount - overlapLength}),
        c.copy({deleteCount: c.deleteCount - overlapLength})
      );
    }

    case RangeRangeRelationship.Starts:
    case RangeRangeRelationship.ContainedBy:
    case RangeRangeRelationship.Finishes:
      // S-RR-7
      // S-RR-10
      // S-RR-11
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({deleteCount: c.deleteCount - s.deleteCount})
      );

    case RangeRangeRelationship.StartedBy:
    case RangeRangeRelationship.Contains:
    case RangeRangeRelationship.FinishedBy:
      // S-RR-8
      // S-RR-9
      // S-RR-12
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - c.deleteCount}),
        c.copy({noOp: true})
      );

    case RangeRangeRelationship.EqualTo:
      // S-RR-13
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({noOp: true})
      );
  }
}

function transformRemoveSplice(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  const cStart = c.index
  const cEnd = c.index + c.deleteCount

  const sStart = s.index
  const sEnd = s.index + s.deleteCount

  const relationship = RangeRelationshipUtil.getRangeRangeRelationship(sStart, sEnd, cStart, cEnd)
  switch (relationship) {
    case RangeRangeRelationship.Precedes:
      return new OperationPair(
        s,
        c.copy({index: c.index - s.deleteCount})
      );

    case RangeRangeRelationship.PrecededBy:
      return new OperationPair(
        s.copy({index: s.index - c.deleteCount + c.insertValue.length}),
        c
      );

    case RangeRangeRelationship.Meets:
    case RangeRangeRelationship.Overlaps: {
      const overlapLength = s.index + s.deleteCount - c.index
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - overlapLength}),
        c.copy({index: s.index, deleteCount: c.deleteCount - overlapLength})
      );
    }

    case RangeRangeRelationship.MetBy:
    case RangeRangeRelationship.OverlappedBy: {
      const overlapLength = c.index + c.deleteCount - s.index
      return new OperationPair(
        s.copy({index: c.index + c.insertValue.length, deleteCount: s.deleteCount - overlapLength}),
        c.copy({deleteCount: c.deleteCount - overlapLength})
      );
    }

    case RangeRangeRelationship.Starts:
    case RangeRangeRelationship.Finishes:
    case RangeRangeRelationship.ContainedBy:
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({deleteCount: c.deleteCount - s.deleteCount})
      );

    case RangeRangeRelationship.StartedBy:
      return new OperationPair(
        s.copy({index: s.index + c.insertValue.length, deleteCount: s.deleteCount - c.deleteCount}),
        c.copy({index: s.index, deleteCount: 0})
      );

    case RangeRangeRelationship.FinishedBy:
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - c.deleteCount}),
        c.copy({index: s.index, deleteCount: 0})
      );

    case RangeRangeRelationship.Contains:
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - c.deleteCount + c.insertValue.length}),
        c.copy({noOp: true})
      );

    case RangeRangeRelationship.EqualTo:
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({deleteCount: 0})
      );
  }
}

function transformSpliceInsert(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  if (c.index <= s.index) {
    return new OperationPair(
      s.copy({index: s.index + c.insertValue.length}),
      c
    );
  } else if (s.index + s.deleteCount > c.index) {
    return new OperationPair(
      s.copy({deleteCount: s.deleteCount + c.insertValue.length}),
      c.copy({noOp: true})
    );
  } else {
    return new OperationPair(
      s,
      c.copy({index: c.index - s.deleteCount + s.insertValue.length})
    );
  }
}

function transformSpliceRemove(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  const cStart = c.index;
  const cEnd = c.index + c.deleteCount;

  const sStart = s.index;
  const sEnd = s.index + s.deleteCount;

  const relationship = RangeRelationshipUtil.getRangeRangeRelationship(sStart, sEnd, cStart, cEnd);
  switch (relationship) {
    case RangeRangeRelationship.Precedes:
      return new OperationPair(
        s,
        c.copy({index: c.index - s.deleteCount + s.insertValue.length})
      );

    case RangeRangeRelationship.PrecededBy:
      return new OperationPair(
        s.copy({index: s.index - c.deleteCount}),
        c
      );

    case RangeRangeRelationship.Meets:
    case RangeRangeRelationship.Overlaps: {
      const overlapLength = s.index + s.deleteCount - c.index
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - overlapLength}),
        c.copy({index: s.index + s.insertValue.length, deleteCount: c.deleteCount - overlapLength})
      );
    }
    case RangeRangeRelationship.MetBy:
    case RangeRangeRelationship.OverlappedBy: {
      const overlapLength = c.index + c.deleteCount - s.index
      return new OperationPair(
        s.copy({index: c.index, deleteCount: s.deleteCount - overlapLength}),
        c.copy({deleteCount: c.deleteCount - overlapLength})
      );
    }
    case RangeRangeRelationship.Starts:
      return new OperationPair(
        s.copy({deleteCount: 0}),
        c.copy({index: c.index + s.insertValue.length, deleteCount: c.deleteCount - s.deleteCount})
      );

    case RangeRangeRelationship.Finishes:
      return new OperationPair(
        s.copy({index: c.index, deleteCount: 0}),
        c.copy({deleteCount: c.deleteCount - s.deleteCount})
      );

    case RangeRangeRelationship.ContainedBy:
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({deleteCount: c.deleteCount - s.deleteCount + s.insertValue.length})
      );

    case RangeRangeRelationship.StartedBy:
    case RangeRangeRelationship.FinishedBy:
    case RangeRangeRelationship.Contains:
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - c.deleteCount}),
        c.copy({deleteCount: 0})
      );

    case RangeRangeRelationship.EqualTo:
      return new OperationPair(
        s.copy({deleteCount: 0}),
        c.copy({noOp: true})
      );
  }
}

function transformSpliceSplice(s: StringSpliceOperation, c: StringSpliceOperation): OperationPair {
  const cStart = c.index
  const cEnd = c.index + c.deleteCount

  const sStart = s.index
  const sEnd = s.index + s.deleteCount

  const relationship = RangeRelationshipUtil.getRangeRangeRelationship(sStart, sEnd, cStart, cEnd);
  switch (relationship) {
    case RangeRangeRelationship.Precedes:
      return new OperationPair(
        s,
        c.copy({index: c.index - s.deleteCount + s.insertValue.length})
      );

    case RangeRangeRelationship.PrecededBy:
      // S-RR-2
      return new OperationPair(
        s.copy({index: s.index - c.deleteCount + s.insertValue.length}),
        c
      )

    case RangeRangeRelationship.Meets:
    case RangeRangeRelationship.Overlaps: {
      const overlapLength = s.index + s.deleteCount - c.index;
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - overlapLength}),
        c.copy({index: s.index + s.insertValue.length, deleteCount: c.deleteCount - overlapLength})
      )
    }
    case RangeRangeRelationship.MetBy:
    case RangeRangeRelationship.OverlappedBy: {
      const overlapLength = c.index + c.deleteCount - s.index
      return new OperationPair(
        s.copy({index: c.index + c.insertValue.length, deleteCount: s.deleteCount - overlapLength}),
        c.copy({deleteCount: c.deleteCount - overlapLength})
      );
    }

    case RangeRangeRelationship.Starts:
      return new OperationPair(
        s.copy({deleteCount: 0}),
        c.copy({index: c.index + s.insertValue.length, deleteCount: c.deleteCount - s.deleteCount})
      );

    case RangeRangeRelationship.ContainedBy:
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({deleteCount: c.deleteCount - s.deleteCount + s.insertValue.length})
      );

    case RangeRangeRelationship.Finishes:
      return new OperationPair(
        s.copy({index: c.index + c.insertValue.length, deleteCount: 0}),
        c.copy({deleteCount: c.deleteCount - s.deleteCount})
      );

    case RangeRangeRelationship.StartedBy:
      return new OperationPair(
        s.copy({index: s.index + c.insertValue.length, deleteCount: s.deleteCount - c.deleteCount}),
        c.copy({deleteCount: 0})
      );

    case RangeRangeRelationship.Contains:
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - c.deleteCount + c.insertValue.length}),
        c.copy({noOp: true})
      );

    case RangeRangeRelationship.FinishedBy:
      return new OperationPair(
        s.copy({deleteCount: s.deleteCount - c.deleteCount}),
        c.copy({deleteCount: 0, index: s.index + s.insertValue.length}),
      );

    case RangeRangeRelationship.EqualTo:
      return new OperationPair(
        s.copy({deleteCount: 0}),
        c.copy({index: c.index + s.insertValue.length, deleteCount: 0}),
      );
  }
}