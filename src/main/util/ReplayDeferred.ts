/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Deferred} from "./Deferred";
import {AbstractDeferred} from "./AbstractDeferred";

/**
 * @hidden
 * @internal
 */
export class ReplayDeferred<R> extends AbstractDeferred<R> {

  private readonly _deferreds: Array<Deferred<R>>;

  private _value: R | PromiseLike<R> | undefined;
  private _error: Error | undefined;

  constructor() {
    super();
    this._deferreds = [];
    this._value = undefined;
    this._error = undefined;
  }

  public resolve(value?: R | PromiseLike<R>): void {
    super.resolve(value);
    this._value = value;
    this._deferreds.forEach(d => d.resolve(value));
  }

  public reject(error: Error): void {
    super.reject(error);
    this._error = error;
    this._deferreds.forEach(d => d.reject(error));
  }

  public promise(): Promise<R> {
    if (this.isPending()) {
      const d = new Deferred<R>();
      this._deferreds.push(d);
      return d.promise();
    } else if (this.isRejected()) {
      return Promise.reject(this._error);
    } else {
      return Promise.resolve(this._value);
    }
  }
}
