/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {AppliedOperation} from "./AppliedOperation";
import {DomainUser} from "../../../identity";

/**
 * @hidden
 * @internal
 */
export class ModelOperation {

  constructor(public readonly modelId: string,
              public readonly version: number,
              public readonly timestamp: Date,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly operation: AppliedOperation) {
    Object.freeze(this);
  }
}
