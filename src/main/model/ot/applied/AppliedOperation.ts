/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Change} from "../ops/operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class AppliedOperation implements Change {
  protected constructor(public readonly type: string) {
  }

  public abstract inverse(): AppliedOperation;
}
