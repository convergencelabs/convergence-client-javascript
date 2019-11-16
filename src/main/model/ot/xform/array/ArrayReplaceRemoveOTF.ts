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

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayReplaceRemoveOTF: OperationTransformationFunction<ArrayReplaceOperation, ArrayRemoveOperation> =
  (s: ArrayReplaceOperation, c: ArrayRemoveOperation) => {
    if (s.index < c.index) {
      // A-PR-1
      return new OperationPair(s, c);
    } else if (s.index === c.index) {
      // A-PR-2
      return new OperationPair(
        new ArrayInsertOperation(s.id, s.noOp, s.index, s.value),
        c.copy({noOp: true}));
    } else {
      // A-PR-3
      return new OperationPair(s.copy({index: s.index - 1}), c);
    }
  };
