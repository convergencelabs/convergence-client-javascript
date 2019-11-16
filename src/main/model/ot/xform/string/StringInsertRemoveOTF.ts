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

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";

/**
 * @hidden
 * @internal
 */
export const StringInsertRemoveOTF: OperationTransformationFunction<StringInsertOperation, StringRemoveOperation> =
  (s: StringInsertOperation, c: StringRemoveOperation) => {
    if (s.index <= c.index) {
      // S-IR-1 and S-IR-2
      return new OperationPair(s, c.copy({index: c.index + s.value.length}));
    } else if (s.index >= c.index + c.value.length) {
      // S-IR-5
      return new OperationPair(s.copy({index: s.index - c.value.length}), c);
    } else {
      // S-IR-3 and S-IR-4
      const offsetDelta: number = s.index - c.index;
      return new OperationPair(
        s.copy({noOp: true}),
        c.copy({
          value: c.value.substring(0, offsetDelta) +
          s.value +
          c.value.substring(offsetDelta, c.value.length)
        }));
    }
  };
