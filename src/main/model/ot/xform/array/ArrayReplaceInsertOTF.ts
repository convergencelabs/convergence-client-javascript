/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayReplaceInsertOTF: OperationTransformationFunction<ArrayReplaceOperation, ArrayInsertOperation> =
  (s: ArrayReplaceOperation, c: ArrayInsertOperation) => {
    if (s.index < c.index) {
      // A-PI-1
      return new OperationPair(s, c);
    } else {
      // A-PI-2 and A-PI-3
      return new OperationPair(s.copy({index: s.index + 1}), c);
    }
  };
