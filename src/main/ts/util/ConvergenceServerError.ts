export class ConvergenceServerError extends Error {
  private _code: string;
  private _details: {[key: string]: any};

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
