/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DiscreteOperation} from "../ops/DiscreteOperation";
import {OperationPair} from "./OperationPair";

/**
 * @hidden
 * @internal
 */
export type OperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation> =
  (s: S, c: C) => OperationPair;
