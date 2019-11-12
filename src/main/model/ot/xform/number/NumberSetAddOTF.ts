/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberSetOperation} from "../../ops/NumberSetOperation";
import {NumberDeltaOperation} from "../../ops/NumberDeltaOperation";

/**
 * @hidden
 * @internal
 */
export const NumberSetAddOTF: OperationTransformationFunction<NumberSetOperation, NumberDeltaOperation> =
  (s: NumberSetOperation, c: NumberDeltaOperation) => {
    // N-SA-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
