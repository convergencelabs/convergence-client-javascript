/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayRemoveReplaceOTF: OperationTransformationFunction<ArrayRemoveOperation, ArrayReplaceOperation> =
  (s: ArrayRemoveOperation, c: ArrayReplaceOperation) => {
    if (s.index < c.index) {
      // A-RP-1
      return new OperationPair(s, c.copy({index: c.index - 1}));
    } else if (s.index === c.index) {
      // A-RP-2
      return new OperationPair(s.copy({noOp: true}), new ArrayInsertOperation(
        c.id, c.noOp, c.index, c.value));
    } else {
      // A-RP-3
      return new OperationPair(s, c);
    }
  };
