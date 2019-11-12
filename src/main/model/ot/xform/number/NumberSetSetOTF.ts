/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberSetOperation} from "../../ops/NumberSetOperation";

/**
 * @hidden
 * @internal
 */
export const NumberSetSetOTF: OperationTransformationFunction<NumberSetOperation, NumberSetOperation> =
  (s: NumberSetOperation, c: NumberSetOperation) => {
    if (s.value === c.value) {
      // N-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // N-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  };
