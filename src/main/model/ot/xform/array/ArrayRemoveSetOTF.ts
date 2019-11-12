/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArraySetOperation} from "../../ops/ArraySetOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayRemoveSetOTF: OperationTransformationFunction<ArrayRemoveOperation, ArraySetOperation> =
  (s: ArrayRemoveOperation, c: ArraySetOperation) => {
    // A-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
