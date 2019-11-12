/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectRemovePropertyAddPropertyOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectAddPropertyOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectAddPropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-RA-1
      return new OperationPair(s, c);
    } else {
      // O-RA-2
      throw new Error("Remove property and add property can not target the same property");
    }
  };
