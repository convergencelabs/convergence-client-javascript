/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringSetOperation} from "../../ops/StringSetOperation";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";

/**
 * @hidden
 * @internal
 */
export const StringSetRemoveOTF: OperationTransformationFunction<StringSetOperation, StringRemoveOperation> =
  (s: StringSetOperation, c: StringRemoveOperation) => {
    // S-SR-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
