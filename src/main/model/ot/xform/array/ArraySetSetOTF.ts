/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArraySetOperation} from "../../ops/ArraySetOperation";
import {EqualsUtil} from "../../../../util/EqualsUtil";

/**
 * @hidden
 * @internal
 */
export const ArraySetSetOTF: OperationTransformationFunction<ArraySetOperation, ArraySetOperation> =
  (s: ArraySetOperation, c: ArraySetOperation) => {
    if (!EqualsUtil.deepEquals(s.value, c.value)) {
      // A-SS-1
      return new OperationPair(s, c.copy({noOp: true}));
    } else {
      // A-SS-2
      return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
    }
  };
