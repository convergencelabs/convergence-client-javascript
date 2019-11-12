/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
