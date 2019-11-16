/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * The superclass of all errors within Convergence.
 */
export class ConvergenceError extends Error {

  /**
   * @internal
   */
  private readonly _code: string;

  /**
   * @internal
   */
  private readonly _details: { [key: string]: any };

  /**
   * @hidden
   * @internal
   */
  constructor(message: string, code?: string, details?: { [key: string]: any }) {
    super(message);

    this._code = code;
    this._details = details || {};

    this.name = "ConvergenceError";
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ConvergenceError.prototype);
  }

  public get code(): string {
    return this._code;
  }

  public get details(): { [key: string]: any } {
    return this._details;
  }
}
