/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
