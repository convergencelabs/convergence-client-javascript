/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {BooleanSetOperation} from "../../ops/BooleanSetOperation";

/**
 * @hidden
 * @internal
 */
export const BooleanSetSetOTF: OperationTransformationFunction<BooleanSetOperation, BooleanSetOperation> =
  (s: BooleanSetOperation, c: BooleanSetOperation) => {
    if (s.value === c.value) {
      // B-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // B-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  };
