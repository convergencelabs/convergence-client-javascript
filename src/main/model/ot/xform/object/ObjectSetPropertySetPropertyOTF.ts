/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectSetPropertySetPropertyOTF: OperationTransformationFunction<ObjectSetPropertyOperation,
  ObjectSetPropertyOperation> =
  (s: ObjectSetPropertyOperation, c: ObjectSetPropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-TT-1
      return new OperationPair(s, c);
    } else if (s.value !== c.value) {
      // O-TT-2
      return new OperationPair(s, c.copy({ noOp: true }));
    } else {
      // O-TT-3
      return new OperationPair(s.copy({ noOp: true }), c.copy({ noOp: true }));
    }
  };
