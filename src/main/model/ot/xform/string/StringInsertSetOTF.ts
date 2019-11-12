/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";
import {StringSetOperation} from "../../ops/StringSetOperation";

/**
 * @hidden
 * @internal
 */
export const StringInsertSetOTF: OperationTransformationFunction<StringInsertOperation, StringSetOperation> =
  (s: StringInsertOperation, c: StringSetOperation) => {
    // S-IS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
