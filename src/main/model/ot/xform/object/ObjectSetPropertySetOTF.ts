/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectSetPropertySetOTF: OperationTransformationFunction<ObjectSetPropertyOperation, ObjectSetOperation> =
  (s: ObjectSetPropertyOperation, c: ObjectSetOperation) => {
    // O-TS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };
