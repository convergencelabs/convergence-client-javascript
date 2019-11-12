/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
