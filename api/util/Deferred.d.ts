export declare class Deferred<R> {
  private _promise;
  private _resolve;
  private _reject;

  constructor();

  resolve(value?: R | PromiseLike<R>): void;

  reject(error: Error): void;

  promise(): Promise<R>;
}
