/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberDeltaOperation} from "../../ops/NumberDeltaOperation";

/**
 * @hidden
 * @internal
 */
export const NumberAddAddOTF: OperationTransformationFunction<NumberDeltaOperation, NumberDeltaOperation> =
  (s: NumberDeltaOperation, c: NumberDeltaOperation) => {
    // N-AA-1
    return new OperationPair(s, c);
  };
