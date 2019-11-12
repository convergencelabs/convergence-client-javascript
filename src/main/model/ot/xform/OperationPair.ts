/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Operation} from "../ops/Operation";

/**
 * @hidden
 * @internal
 */
export class OperationPair {
  constructor(public serverOp: Operation, public clientOp: Operation) {
    Object.freeze(this);
  }
}
