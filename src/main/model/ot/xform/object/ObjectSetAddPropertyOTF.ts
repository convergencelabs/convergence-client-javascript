/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectSetAddPropertyOTF: OperationTransformationFunction<ObjectSetOperation, ObjectAddPropertyOperation> =
  (s: ObjectSetOperation, c: ObjectAddPropertyOperation) => {
    // O-SA-1
    return new OperationPair(s, c.copy({noOp: true}));
  };
