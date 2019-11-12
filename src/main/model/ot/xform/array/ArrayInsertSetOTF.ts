/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";
import {ArraySetOperation} from "../../ops/ArraySetOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayInsertSetOTF: OperationTransformationFunction<ArrayInsertOperation, ArraySetOperation> =
  (s: ArrayInsertOperation, c: ArraySetOperation) => {
    // A-IS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
