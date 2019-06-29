export class CancellationToken {
  public static create(): CancellationToken {
    return new CancellationToken();
  }

  private _callback: (() => void) | null = null;

  public cancel(): void {
    if (this._callback === null) {
      throw new Error("The cancellation token must be bound before calling cancel.");
    }

    this._callback();
  }

  public isBound(): boolean {
    return this._callback !== null;
  }

  public _bind(callback: () => void): void {
    if (this._callback !== null) {
      throw new Error("The cancellation token was already bound");
    }
  }
}
