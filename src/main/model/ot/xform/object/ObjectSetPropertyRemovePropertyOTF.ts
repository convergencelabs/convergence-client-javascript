/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {OperationPair} from "../OperationPair";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";

/**
 * @hidden
 * @internal
 */
export const ObjectSetPropertyRemovePropertyOTF: OperationTransformationFunction<ObjectSetPropertyOperation,
  ObjectRemovePropertyOperation> =
  (s: ObjectSetPropertyOperation, c: ObjectRemovePropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-TR-1
      return new OperationPair(s, c);
    } else {
      // O-TR-2
      return new OperationPair(
        new ObjectAddPropertyOperation(s.id, s.noOp, s.prop, s.value),
        c.copy({ noOp: true }));
    }
  };
