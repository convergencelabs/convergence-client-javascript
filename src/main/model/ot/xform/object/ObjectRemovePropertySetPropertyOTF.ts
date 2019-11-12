/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {OperationPair} from "../OperationPair";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";

/**
 * @hidden
 * @internal
 */
export const ObjectRemovePropertySetPropertyOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectSetPropertyOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectSetPropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-RT-1
      return new OperationPair(s, c);
    } else {
      // O-RT-2
      return new OperationPair(
        s.copy({ noOp: true }),
        new ObjectAddPropertyOperation(c.id, c.noOp, c.prop, c.value));
    }
  };
