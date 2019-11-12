/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {ArraySetOperation} from "../../ops/ArraySetOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayMoveSetOTF: OperationTransformationFunction<ArrayMoveOperation, ArraySetOperation> =
  (s: ArrayMoveOperation, c: ArraySetOperation) => {
    // A-MS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
