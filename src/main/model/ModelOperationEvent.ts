/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DiscreteChange} from "./ot/ops/operationChanges";
import {DomainUser} from "../identity";

/**
 * @hidden
 * @internal
 */
export class ModelOperationEvent {
  /**
   * Constructs a new ModelOperationEvent.
   * @hidden
   * @internal
   */
  constructor(public sessionId: string,
              public user: DomainUser,
              public version: number,
              public timestamp: Date,
              public operation: DiscreteChange) {

    Object.freeze(this);
  }
}
