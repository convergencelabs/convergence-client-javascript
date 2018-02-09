export class ConvergenceError extends Error {

  private _code: string;
  private _details: { [key: string]: any };

  constructor(message: string, code?: string, details?: { [key: string]: any }) {
    super(message);

    this._code = code;
    this._details = details || {};

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
