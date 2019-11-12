/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
