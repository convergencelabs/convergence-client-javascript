export class ConvergenceServerError extends Error {
  /**
   * @internal
   */
  private readonly _code: string;

  /**
   * @internal
   */
  private readonly _details: {[key: string]: any};

  /**
   * @hidden
   * @internal
   */
  constructor(m: string, code: string, details: {[key: string]: any}) {
    super(m);

    this._code = code;
    this._details = details;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ConvergenceServerError.prototype);
  }

  public get code(): string {
    return this._code;
  }

  public get details(): {[key: string]: any} {
    return this._details;
  }
}
