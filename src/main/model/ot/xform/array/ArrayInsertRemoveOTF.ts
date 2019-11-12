/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayInsertRemoveOTF: OperationTransformationFunction<ArrayInsertOperation, ArrayRemoveOperation> =
  (s: ArrayInsertOperation, c: ArrayRemoveOperation) => {
    if (s.index <= c.index) {
      // A-IR-1 and A-IR-2
      return new OperationPair(s, c.copy({index: c.index + 1}));
    } else {
      // A-IR-3
      return new OperationPair(s.copy({index: s.index - 1}), c);
    }
  };
