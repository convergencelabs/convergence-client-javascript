/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * @hidden
 * @internal
 */
export class Deferred<R> {

  private readonly _promise: Promise<R>;
  private _resolve: (value?: R | PromiseLike<R>) => any;
  private _reject: (error: Error) => void;

  private _rejected: boolean;
  private _resolved: boolean;

  constructor() {
    this._promise = new Promise((resolve: (value?: R | PromiseLike<R>) => any, reject: (error: Error) => void) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    this._rejected = false;
    this._resolved = false;
  }

  public isPending(): boolean {
    return this._resolved || this._rejected;
  }

  public isRejected(): boolean {
    return this._rejected;
  }

  public isResolved(): boolean {
    return this._resolved;
  }

  public resolve(value?: R | PromiseLike<R>): void {
    this._rejected = false;
    this._resolved = true;
    this._resolve(value);
  }

  public reject(error: Error): void {
    this._rejected = true;
    this._resolved = false;
    this._reject(error);
  }

  public resolveFromPromise(p: Promise<R>): void {
    p.then((r: R) => this.resolve(r)).catch((e: Error) => this.reject(e));
  }

  public promise(): Promise<R> {
    return this._promise;
  }
}
