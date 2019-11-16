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
import {EqualsUtil} from "../../../../util/EqualsUtil";

/**
 * @hidden
 * @internal
 */
export const ArrayReplaceReplaceOTF: OperationTransformationFunction<ArrayReplaceOperation, ArrayReplaceOperation> =
  (s: ArrayReplaceOperation, c: ArrayReplaceOperation) => {
    if (s.index !== c.index) {
      // A-PP-1
      return new OperationPair(s, c);
    } else if (!EqualsUtil.deepEquals(s.value, c.value)) {
      // A-PP-2
      return new OperationPair(s, c.copy({noOp: true}));
    } else {
      // A-PP-3
      return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
    }
  };
