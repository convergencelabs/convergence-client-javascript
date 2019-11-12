/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringSetOperation} from "../../ops/StringSetOperation";

/**
 * @hidden
 * @internal
 */
export const StringSetSetOTF: OperationTransformationFunction<StringSetOperation, StringSetOperation> =
  (s: StringSetOperation, c: StringSetOperation) => {
    if (s.value === c.value) {
      // S-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // S-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  };
