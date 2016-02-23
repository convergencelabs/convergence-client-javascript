import {TimeoutCallback} from "./MockConvergenceServer";
import {CompleteCallback} from "./MockConvergenceServer";

abstract class MockServerAction {
  private _timer: any;
  protected _envelope: any;

  constructor(protected _actionId: number,
              protected _timeoutCallback: TimeoutCallback,
              protected _completeCallback: CompleteCallback,
              protected _messageGenerator: () => any,
              private _timeout?: number) {
  }

  timeout(): number {
    return this._timeout;
  }

  actionId(): number {
    return this._actionId;
  }

  complete(): void {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
    }
    this._completeCallback(this);
  }

  envelope(): any {
    return this._envelope;
  }

  execute(): void {
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
