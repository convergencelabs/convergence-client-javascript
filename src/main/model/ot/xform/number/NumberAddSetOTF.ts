/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberDeltaOperation} from "../../ops/NumberDeltaOperation";
import {NumberSetOperation} from "../../ops/NumberSetOperation";

/**
 * @hidden
 * @internal
 */
export const NumberAddSetOTF: OperationTransformationFunction<NumberDeltaOperation, NumberSetOperation> =
  (s: NumberDeltaOperation, c: NumberSetOperation) => {
    // N-AS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
