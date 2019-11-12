/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

export class TestIdGenerator {
  private _id: number = 0;

  public id(): string {
    return "" + this._id++;
  }
}
