/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayInsertInsertOTF: OperationTransformationFunction<ArrayInsertOperation, ArrayInsertOperation> =
  (s: ArrayInsertOperation, c: ArrayInsertOperation) => {
    if (s.index <= c.index) {
      // A-II-1 and A-II-2
      return new OperationPair(s, c.copy({index: c.index + 1}));
    } else {
      // A-II-3
      return new OperationPair(s.copy({index: s.index + 1}), c);
    }
  };
