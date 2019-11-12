/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";
import {StringSetOperation} from "../../ops/StringSetOperation";

/**
 * @hidden
 * @internal
 */
export const StringRemoveSetOTF: OperationTransformationFunction<StringRemoveOperation, StringSetOperation> =
  (s: StringRemoveOperation, c: StringSetOperation) => {
    // S-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
