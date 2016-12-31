import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";

abstract class MockServerAction {
  protected _envelope: any;
  private _timer: any;

  constructor(protected _actionId: number,
              protected _timeoutCallback: TimeoutCallback,
              protected _completeCallback: CompleteCallback,
              protected _messageGenerator: () => any,
              private _timeout?: number) {
  }

  public timeout(): number {
    return this._timeout;
  }

  public actionId(): number {
    return this._actionId;
  }

  public complete(): void {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
    }
    this._completeCallback(this);
  }

  public envelope(): any {
    return this._envelope;
  }

  public execute(): void {
    if (this._timeout) {
      this._timer = setTimeout(
        () => {
          this._timeoutCallback(this._generateTimeoutMessage());
        },
        this._timeout
      );
    }
  }

  protected abstract _generateTimeoutMessage(): string;
}

export default MockServerAction;
