export interface HeartbeatHandler {
  sendPing(): void;
  onTimeout(): void;
}

export class HeartbeatHelper {

  private _pingFuture: any;
  private _timeoutFuture: any;

  private _handler: HeartbeatHandler;
  private _pingInterval: number;
  private _pongTimeout: number;
  private _started: boolean;
  private _debugFlags: any;

  constructor(handler: HeartbeatHandler, pingInterval: number, pongTimeout: number) {
    this._handler = handler;
    this._pingInterval = pingInterval;
    this._pongTimeout = pongTimeout;
    this._debugFlags = {}; // fixme
    this._started = false;
  }

  setPingInterval(pingInterval: number): void {
    this._pingInterval = pingInterval;
  }

  getPingInterval(): number {
    return this._pingInterval;
  }

  setPongTimeout(pongTimeout: number): void {
    this._pongTimeout = pongTimeout;
  }

  getPongTimeout(): number {
    return this._pongTimeout;
  }

  messageReceived(): void {
    if (this._started) {
      this.cancelPongTimeout();
      this.restartPingTimeout();
    }
  }

  start(): void {
    if (this._handler == null) {
      throw "Can't start the HeartbeatManager unless the callback is set.";
    }

    if (this._debugFlags.heartbeatHelper) {
      console.log(
        "HeartbeatHelper started with Ping Interval " + this._pingInterval +
        " and Pong Timeout " + this._pongTimeout);
    }

    this._started = true;
    this.messageReceived();
  }

  stop(): void {
    this._started = false;
    this.stopPingTimer();
    this.cancelPongTimeout();

    if (this._debugFlags.heartbeatHelper) {
      console.log("HeartbeatHelper stopped.");
    }
  }

  get started(): boolean {
    return this._started;
  }

  get stopped(): boolean {
    return !this._started;
  }

  dispose(): void {
    this.stop();
  }

  private sendPing(): void {
    this._handler.sendPing();
    this.schedulePongTimeout();
  }

  private schedulePongTimeout(): void {
    var self: HeartbeatHelper = this;
    this._timeoutFuture = setTimeout(
      function (): void {
        self._handler.onTimeout();
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
    var self: HeartbeatHelper = this;
    this._pingFuture = setTimeout(
      function (): void {
        self.sendPing();
      },
      this._pingInterval * 1000);
  }
}
