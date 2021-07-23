/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";

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
  private readonly _pingInterval: number;
  private readonly _pongTimeout: number;
  private _started: boolean;
  private readonly _logger: Logger;

  constructor(handler: HeartbeatHandler, pingInterval: number, pongTimeout: number) {
    this._handler = handler;
    this._pingInterval = pingInterval;
    this._pongTimeout = pongTimeout;
    this._started = false;
    this._logger = Logging.logger("heartbeat");
  }

  public messageReceived(): void {
    if (this._started) {
      this._cancelPongTimeout();
      this._restartPingTimeout();
    }
  }

  public start(): void {
    if (this._handler == null) {
      throw new Error("Can't start the HeartbeatManager unless the callback is set.");
    }

    this._logger.trace(() =>
      "HeartbeatHelper started with Ping Interval " + this._pingInterval +
      " and Pong Timeout " + this._pongTimeout);

    this._started = true;
    this.messageReceived();
  }

  public stop(): void {
    this._started = false;
    this._stopPingTimer();
    this._cancelPongTimeout();

    this._logger.trace(() => "HeartbeatHelper stopped.");
  }

  get started(): boolean {
    return this._started;
  }

  public dispose(): void {
    this.stop();
  }

  private _sendPing = () => {
    this._handler.sendPing();
    this._schedulePongTimeout();
  };

  private _schedulePongTimeout(): void {
    this._cancelPongTimeout();
    const timeoutMillis = this._pongTimeout * 1000;
    this._timeoutFuture = setTimeout(this._onTimeout, timeoutMillis);
  }

  private _cancelPongTimeout(): void {
    if (this._timeoutFuture !== null) {
      clearTimeout(this._timeoutFuture);
      this._timeoutFuture = null;
    }
  }

  private _stopPingTimer(): void {
    if (this._pingFuture !== null) {
      clearTimeout(this._pingFuture);
      this._pingFuture = null;
    }
  }

  private _restartPingTimeout(): void {
    this._stopPingTimer();
    const pingIntervalMillis = this._pingInterval * 1000;
    this._pingFuture = setTimeout(this._sendPing, pingIntervalMillis);
  }

  private _onTimeout = () => {
    this._logger.trace(() => "A pong timeout occurred");
    this._handler.onTimeout();
  }
}
