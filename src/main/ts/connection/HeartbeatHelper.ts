import {Logger, ConvergenceLogging} from "../util/";

/**
 * @hidden
 * @internal
 */
export interface HeartbeatHandler {
  sendPing(): void;

  onTimeout(): void;
}

/**
 * @hidden
 * @internal
 */
export class HeartbeatHelper {

  private _pingFuture: any;
  private _timeoutFuture: any;

  private readonly _handler: HeartbeatHandler;
  private _pingInterval: number;
  private _pongTimeout: number;
  private _started: boolean;
  private readonly _logger: Logger;

  constructor(handler: HeartbeatHandler, pingInterval: number, pongTimeout: number) {
    this._handler = handler;
    this._pingInterval = pingInterval;
    this._pongTimeout = pongTimeout;
    this._started = false;
    this._logger = ConvergenceLogging.logger("heartbeat");
  }

  public setPingInterval(pingInterval: number): void {
    this._pingInterval = pingInterval;
  }

  public getPingInterval(): number {
    return this._pingInterval;
  }

  public setPongTimeout(pongTimeout: number): void {
    this._pongTimeout = pongTimeout;
  }

  public getPongTimeout(): number {
    return this._pongTimeout;
  }

  public messageReceived(): void {
    if (this._started) {
      this.cancelPongTimeout();
      this.restartPingTimeout();
    }
  }

  public start(): void {
    if (this._handler == null) {
      throw new Error("Can't start the HeartbeatManager unless the callback is set.");
    }

    this._logger.debug(() =>
      "HeartbeatHelper started with Ping Interval " + this._pingInterval +
      " and Pong Timeout " + this._pongTimeout);

    this._started = true;
    this.messageReceived();
  }

  public stop(): void {
    this._started = false;
    this.stopPingTimer();
    this.cancelPongTimeout();

    this._logger.debug(() => "HeartbeatHelper stopped.");
  }

  get started(): boolean {
    return this._started;
  }

  get stopped(): boolean {
    return !this._started;
  }

  public dispose(): void {
    this.stop();
  }

  private sendPing(): void {
    this._handler.sendPing();
    this.schedulePongTimeout();
  }

  private schedulePongTimeout(): void {
    this._timeoutFuture = setTimeout(
      () => {
        this._handler.onTimeout();
      },
      this._pongTimeout * 1000);
  }

  private cancelPongTimeout(): void {
    if (this._timeoutFuture != null) {
      clearTimeout(this._timeoutFuture);
      this._timeoutFuture = null;
    }
  }

  private stopPingTimer(): void {
    if (this._pingFuture != null) {
      clearTimeout(this._pingFuture);
      this._pingFuture = null;
    }
  }

  private restartPingTimeout(): void {
    this.stopPingTimer();
    this._pingFuture = setTimeout(
      () => {
        this.sendPing();
      },
      this._pingInterval * 1000);
  }
}
