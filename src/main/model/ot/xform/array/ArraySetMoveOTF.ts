/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArraySetOperation} from "../../ops/ArraySetOperation";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";

/**
 * @hidden
 * @internal
 */
export const ArraySetMoveOTF: OperationTransformationFunction<ArraySetOperation, ArrayMoveOperation> =
  (s: ArraySetOperation, c: ArrayMoveOperation) => {
    // A-SM-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
