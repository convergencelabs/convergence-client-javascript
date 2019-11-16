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

/**
 * A [[CancellationToken]] is a utility class that allows the binding of a
 * cancel method to a method that returns a Promise. A CancellationToken must
 * be "bound" by passing it into a method that accepts one. The token must
 * be bound before calling cancel.
 *
 * @module Connection and Authentication
 */
export class CancellationToken {
  /**
   * Creates an unbound CancellationToken.
   *
   * @returns
   *   A new CancellationToken that must be bound.
   */
  public static create(): CancellationToken {
    return new CancellationToken();
  }

  /**
   * @internal
   * @hidden
   */
  private _callback: (() => void) | null = null;

  /**
   * @internal
   * @hidden
   */
  private _canceled: boolean = false;

  /**
   * Invokes the bound cancellation behavior.  This method will throw an
   * error if the CancellationToken is not bound.
   */
  public cancel(): void {
    if (this._callback === null) {
      throw new Error("The cancellation token must be bound before calling cancel.");
    }

    if (this._canceled) {
      throw new Error("The cancellation token has already been cancelled.");
    }

    this._callback();
    this._canceled = true;
  }

  /**
   * @returns
   *   True if the CancellationToken is bound, false otherwise.
   */
  public isBound(): boolean {
    return this._callback !== null;
  }

  /**
   * @internal
   * @private
   */
  public _bind(callback: () => void): void {
    if (typeof callback !== "function") {
      throw new Error("callback must be a function");
    }

    if (this._callback !== null) {
      throw new Error("The cancellation token was already bound");
    }

    this._callback = callback;
  }
}
