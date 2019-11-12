/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";

/**
 * @hidden
 * @internal
 */
export const StringInsertInsertOTF: OperationTransformationFunction<StringInsertOperation, StringInsertOperation> =
  (s: StringInsertOperation, c: StringInsertOperation) => {
    if (s.index <= c.index) {
      // S-II-1 and S-II-2
      return new OperationPair(s, c.copy({index: c.index + s.value.length}));
    } else {
      // S-II-3
      return new OperationPair(s.copy({index: s.index + c.value.length}), c);
    }
  };
