/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";
import {StringInsertOperation} from "../../ops/StringInsertOperation";

/**
 * @hidden
 * @internal
 */
export const StringRemoveInsertOTF: OperationTransformationFunction<StringRemoveOperation, StringInsertOperation> =
  (s: StringRemoveOperation, c: StringInsertOperation) => {
    if (c.index <= s.index) {
      // S-RI-1 and S-RI-2
      return new OperationPair(s.copy({index: s.index + c.value.length}), c);
    } else if (c.index >= s.index + s.value.length) {
      // S-RI-5
      return new OperationPair(s, c.copy({index: c.index - s.value.length}));
    } else {
      // S-RI-3 and S-RI-4
      const offsetDelta: number = c.index - s.index;
      return new OperationPair(
        s.copy({
          value: s.value.substring(0, offsetDelta) +
          c.value +
          s.value.substring(offsetDelta, s.value.length)
        }),
        c.copy({noOp: true}));
    }
  };
