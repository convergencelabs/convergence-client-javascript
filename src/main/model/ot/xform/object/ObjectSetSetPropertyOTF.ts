/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectSetSetPropertyOTF: OperationTransformationFunction<ObjectSetOperation, ObjectSetPropertyOperation> =
  (s: ObjectSetOperation, c: ObjectSetPropertyOperation) => {
    // O-ST-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
