export class Deferred<R> {

  private _promise: Promise<R>;
  private _resolve: (value?: R | PromiseLike<R>) => any;
  private _reject: (error: Error) => void;

  constructor() {
    this._promise = new Promise((resolve: (value?: R | PromiseLike<R>) => any, reject: (error: Error) => void) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public resolve(value?: R | PromiseLike<R>): void {
    this._resolve(value);
  }

  public reject(error: Error): void {
    this._reject(error);
  }

  public promise(): Promise<R> {
    return this._promise;
  }
}
