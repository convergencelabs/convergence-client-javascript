/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
