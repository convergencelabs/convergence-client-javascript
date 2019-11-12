/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Change} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class Operation implements Change {
  protected constructor(public readonly type: string) {
  }

  public abstract copy(modifications: any): Operation;
}
