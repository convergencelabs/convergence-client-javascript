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

import {HeartbeatHandler, HeartbeatHelper} from "./HeartbeatHelper";
import ConvergenceSocket, {ISocketClosedEvent, ISocketErrorEvent, ISocketMessageEvent} from "./ConvergenceSocket";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {ConvergenceError, ConvergenceEventEmitter, ConvergenceServerError, IConvergenceEvent} from "../util";
import {Deferred} from "../util/Deferred";
import {ConvergenceMessageIO} from "./ConvergenceMessageIO";
import {Logging} from "../util/log/Logging";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IErrorMessage = com.convergencelabs.convergence.proto.core.IErrorMessage;
import IHandshakeResponseMessage = com.convergencelabs.convergence.proto.core.IHandshakeResponseMessage;
import IHandshakeRequestMessage = com.convergencelabs.convergence.proto.core.IHandshakeRequestMessage;
import {ConvergenceErrorCodes} from "../util/ConvergenceErrorCodes";

/**
 * @hidden
 * @internal
 */
export interface IProtocolConnectionEvent extends IConvergenceEvent {

}

/**
 * @hidden
 * @internal
 */
export interface IProtocolConnectionClosedEvent extends IProtocolConnectionEvent {
  name: "closed";
  reason: string;
}

/**
 * @hidden
 * @internal
 */
export interface IProtocolConnectionErrorEvent extends IProtocolConnectionEvent {
  name: "error";
  error: Error;
}

/**
 * @hidden
 * @internal
 */
export interface IProtocolConnectionMessageEvent extends IProtocolConnectionEvent {
  name: "message";
  request: boolean;
  message: IConvergenceMessage;
  callback?: ReplyCallback;
}

/**
 * @hidden
 * @internal
 */
export class ProtocolConnection extends ConvergenceEventEmitter<IProtocolConnectionEvent> {

  public static Events: any = {
    MESSAGE: "message",
    ERROR: "error",
    CLOSED: "close",
    DROPPED: "dropped"
  };

  private _heartbeatHelper: HeartbeatHelper;
  private _socket: ConvergenceSocket;
  private _protocolConfig: ProtocolConfiguration;
  private _nextRequestId: number = 0;
  private readonly _requests: Map<number, any>;
  private _closeRequested: boolean = false;

  private _messageLogger = Logging.logger("protocol.messages");
  private _pingLogger = Logging.logger("protocol.ping");

  constructor(socket: ConvergenceSocket, protocolConfig: ProtocolConfiguration) {
    super();

    this._protocolConfig = protocolConfig;
    this._socket = socket;

    this._socket.on(ConvergenceSocket.Events.MESSAGE, (event: ISocketMessageEvent) => {
      this._onSocketMessage(event.message);
    });

    this._socket.on(ConvergenceSocket.Events.ERROR, (event: ISocketErrorEvent) => {
      this._onSocketError(event.error);
    });

    this._socket.on(ConvergenceSocket.Events.CLOSE, (event: ISocketClosedEvent) => {
      if (this._closeRequested) {
        this._onSocketClosed(event.reason);
      } else {
        this._onSocketDropped();
      }
    });

    this._requests = new Map();
  }

  public connect(): Promise<void> {
    return this._socket.open();
  }

  public handshake(reconnectToken?: string): Promise<IHandshakeResponseMessage> {
    const handshakeRequest: IHandshakeRequestMessage = {
      reconnectToken: reconnectToken !== undefined ? {value: reconnectToken} : null,
      client: "JavaScript",
      clientVersion: "CONVERGENCE_CLIENT_VERSION"
    };

    return this.request({handshakeRequest}).then((response: IConvergenceMessage) => {
      const message = response.handshakeResponse;

      const heartbeatHandler: HeartbeatHandler = {
        sendPing: () => {
          this.sendMessage({ping: {}});
        },
        onTimeout: () => {
          this.abort("pong timeout");
        }
      };

      // todo handle protocol options that come back from server
      this._heartbeatHelper = new HeartbeatHelper(
        heartbeatHandler,
        this._protocolConfig.heartbeatConfig.pingInterval,
        this._protocolConfig.heartbeatConfig.pongTimeout);

      if (this._protocolConfig.heartbeatConfig.enabled) {
        this._heartbeatHelper.start();
      }

      return message;
    });
  }

  public send(message: IConvergenceMessage): void {
    this.sendMessage(message);
  }

  /**
   * Sends a request message to the server and promises a response.
   *
   * @param message
   *   The request message to send.
   * @param timeout
   *   A timeout in seconds to wait for a response.
   */
  public request(message: IConvergenceMessage, timeout?: number): Promise<IConvergenceMessage> {
    const reqId: number = this._nextRequestId;
    this._nextRequestId++;

    const replyDeferred: Deferred<IConvergenceMessage> = new Deferred<IConvergenceMessage>();

    const requestTimeout = (timeout !== undefined ? timeout : this._protocolConfig.defaultRequestTimeout) * 1000;
    const timeoutTask: any = setTimeout(
      () => {
        const req: RequestRecord = this._requests.get(reqId);
        if (req) {
          req.replyDeferred.reject(new ConvergenceError(
            "A request timeout occurred.",
            ConvergenceErrorCodes.REQUEST_TIMEOUT,
            {message}));
        }
      },
      requestTimeout);

    this._requests.set(reqId, {reqId, replyDeferred, timeoutTask} as RequestRecord);

    this.sendMessage({...message, requestId: {value: reqId}});

    return replyDeferred.promise();
  }

  public abort(reason: string): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }

    if (this._socket.isOpen() || this._socket.isConnecting()) {
      this._socket.terminate(reason);
    }

    this._onSocketDropped();
  }

  public close(): void {
    this._closeRequested = true;
    this.removeAllListeners();
    if (this._heartbeatHelper !== undefined && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }

    this._socket.close();
  }

  public sendMessage(message: IConvergenceMessage): void {
    const logger = !message.ping && !message.pong ? this._messageLogger : this._pingLogger;
    logger.debug(() => "SND: " + JSON.stringify(message));

    try {
      const bytes = ConvergenceMessageIO.encode(message);
      this._socket.send(bytes);
    } catch (e) {
      this._onSocketError(e);
      throw e;
    }
  }

  private _onSocketMessage(data: Uint8Array): void {
    const convergenceMessage: IConvergenceMessage = ConvergenceMessageIO.decode(data);

    if (this._protocolConfig.heartbeatConfig.enabled && this._heartbeatHelper) {
      this._heartbeatHelper.messageReceived();
    }

    const logger = !convergenceMessage.ping && !convergenceMessage.pong ? this._messageLogger : this._pingLogger;
    logger.debug(() => "RCV: " + JSON.stringify(convergenceMessage));

    if (convergenceMessage.ping) {
      this._onPing();
    } else if (convergenceMessage.pong) {
      // no-op
    } else if (convergenceMessage.requestId !== undefined) {
      this._onRequest(convergenceMessage);
    } else if (convergenceMessage.responseId !== undefined) {
      this._onReply(convergenceMessage);
    } else {
      this._onNormalMessage(convergenceMessage);
    }
  }

  private _onSocketClosed(reason: string): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    const event: IProtocolConnectionClosedEvent = {name: ProtocolConnection.Events.CLOSED, reason};
    this._emitEvent(event);
  }

  private _onSocketDropped(): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this._emitEvent({name: ProtocolConnection.Events.DROPPED});
  }

  private _onSocketError(error: Error): void {
    const event: IProtocolConnectionErrorEvent = {name: ProtocolConnection.Events.ERROR, error};
    this._emitEvent(event);
  }

  private _onNormalMessage(message: IConvergenceMessage): void {
    Promise.resolve().then(() => {
      const event: IProtocolConnectionMessageEvent = {
        name: "message",
        request: false,
        message
      };
      this._emitEvent(event);
    });
  }

  private _onRequest(message: IConvergenceMessage): void {
    const requestId = message.requestId!.value || 0;
    const event: IProtocolConnectionMessageEvent = {
      name: "message",
      request: true,
      callback: new ReplyCallbackImpl(requestId, this),
      message
    };
    this._emitEvent(event);
  }

  private _onReply(message: IConvergenceMessage): void {
    const requestId: number = message.responseId!.value || 0;
    const record: RequestRecord = this._requests.get(requestId);
    this._requests.delete(requestId);

    if (record) {
      clearTimeout(record.timeoutTask);
      if (message.error) {
        const errorMessage: IErrorMessage = message.error;
        record.replyDeferred.reject(
          new ConvergenceServerError(errorMessage.message, errorMessage.code, errorMessage.details));
      } else {
        record.replyDeferred.resolve(message);
      }
    }
  }

  private _onPing(): void {
    this.sendMessage({pong: {}});
  }
}

/**
 * @hidden
 * @internal
 */
interface RequestRecord {
  reqId: number;
  replyDeferred: Deferred<IConvergenceMessage>;
  timeoutTask: any;
}

/**
 * @hidden
 * @internal
 */
export interface ReplyCallback {
  reply(message: IConvergenceMessage): void;

  unknownError(): void;

  unexpectedError(details: string): void;

  expectedError(code: string, details: string): void;
}

/**
 * @hidden
 * @internal
 */
class ReplyCallbackImpl implements ReplyCallback {
  private readonly _reqId: number;
  private readonly _protocolConnection: ProtocolConnection;

  constructor(reqId: number, protocolConnection: ProtocolConnection) {
    this._reqId = reqId;
    this._protocolConnection = protocolConnection;
  }

  public reply(message: IConvergenceMessage): void {
    this._protocolConnection.sendMessage({...message, responseId: {value: this._reqId}});
  }

  public unknownError(): void {
    this.unexpectedError("An unknown error has occurred");
  }

  public unexpectedError(message: string): void {
    this.expectedError("unknown", message);
  }

  public expectedError(code: string, message: string, details?: { [key: string]: any }): void {
    details = details || {};
    const error: IErrorMessage = {
      code,
      message,
      details
    };

    this._protocolConnection.sendMessage({error, responseId: {value: this._reqId}});
  }
}
