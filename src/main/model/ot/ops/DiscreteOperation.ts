/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Operation} from "./Operation";
import {DiscreteChange} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class DiscreteOperation extends Operation implements DiscreteChange {
  protected constructor(type: string,
                        public readonly id: string,
                        public readonly noOp: boolean) {
    super(type);
  }
}
