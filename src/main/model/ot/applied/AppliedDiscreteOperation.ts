/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {AppliedOperation} from "./AppliedOperation";
import {DiscreteChange} from "../ops/operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class AppliedDiscreteOperation extends AppliedOperation implements DiscreteChange {
  protected constructor(type: string,
                        public readonly id: string,
                        public readonly noOp: boolean) {
    super(type);
  }
}
