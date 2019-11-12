/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export class TestIdGenerator {
  private _id: number = 0;

  public id(): string {
    return "" + this._id++;
  }
}
