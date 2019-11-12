/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectRemovePropertySetOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectSetOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectSetOperation) => {
    // O-RS-1
    return new OperationPair(s.copy({ noOp: true }), c);
  };
