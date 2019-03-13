import {HeartbeatHelper, HeartbeatHandler} from "./HeartbeatHelper";
import ConvergenceSocket, {ISocketClosedEvent, ISocketErrorEvent, ISocketMessageEvent} from "./ConvergenceSocket";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {ConvergenceServerError, IConvergenceEvent, ConvergenceEventEmitter} from "../util/";
import {Deferred} from "../util/Deferred";
import {debugFlags} from "../Debug";
import {ConvergenceMessageIO} from "./ConvergenceMessageIO";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IErrorMessage = io.convergence.proto.IErrorMessage;
import IHandshakeResponseMessage = io.convergence.proto.IHandshakeResponseMessage;
import IHandshakeRequestMessage = io.convergence.proto.IHandshakeRequestMessage;

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
  private readonly _requests: any;

  constructor(socket: ConvergenceSocket, protocolConfig: ProtocolConfiguration) {
    super();

    this._protocolConfig = protocolConfig;
    this._socket = socket;

    this._socket.on(ConvergenceSocket.Events.MESSAGE, (event: ISocketMessageEvent) => {
      this.onSocketMessage(event.message);
    });

    this._socket.on(ConvergenceSocket.Events.ERROR, (event: ISocketErrorEvent) => {
      this.onSocketError(event.error);
    });

    this._socket.on(ConvergenceSocket.Events.CLOSE, (event: ISocketClosedEvent) => {
      this.onSocketClosed(event.reason);
    });

    this._requests = {};
  }

  public connect(): Promise<void> {
    return this._socket.open();
  }

  public handshake(reconnect: boolean, reconnectToken?: string): Promise<IHandshakeResponseMessage> {
    const handshakeRequest: IHandshakeRequestMessage = {
      reconnect,
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

  public request(message: IConvergenceMessage): Promise<IConvergenceMessage> {
    const reqId: number = this._nextRequestId;
    this._nextRequestId++;

    const replyDeferred: Deferred<IConvergenceMessage> = new Deferred<IConvergenceMessage>();

    const timeout: number = this._protocolConfig.defaultRequestTimeout;
    const timeoutTask: any = setTimeout(
      () => {
        const req: RequestRecord = this._requests[reqId];
        if (req) {
          req.replyDeferred.reject(new Error("Response timeout"));
        }
      },
      timeout);

    this._requests[reqId] = {reqId, replyDeferred, timeoutTask} as RequestRecord;

    this.sendMessage({...message, requestId: {value: reqId}});

    return replyDeferred.promise();
  }

  public abort(reason: string): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }

    if (this._socket.isOpen() || this._socket.isConnecting()) {
      this._socket.terminate(reason)
        .then(() => {
          // no-op
        })
        .catch((error) => {
          console.debug("Unable to terminate web socket connection: " + error.message);
        });
    }

    this.onSocketDropped();
  }

  public close(): Promise<void> {
    this.removeAllListeners();
    if (this._heartbeatHelper !== undefined && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }

    if (this._socket.isOpen()) {
      return this._socket.close();
    } else {
      return Promise.resolve();
    }
  }

  public sendMessage(message: IConvergenceMessage): void {
    if ((debugFlags.PROTOCOL_MESSAGES && !message.ping && !message.pong) || debugFlags.PROTOCOL_PINGS) {
      console.debug("SND: " + JSON.stringify(message));
    }

    try {
      const bytes = ConvergenceMessageIO.encode(message);
      this._socket.send(bytes);
    } catch (e) {
      this.onSocketError(e);
      throw e;
    }
  }

  private onSocketMessage(data: Uint8Array): void {
    const convergenceMessage: IConvergenceMessage = ConvergenceMessageIO.decode(data);

    if (this._protocolConfig.heartbeatConfig.enabled && this._heartbeatHelper) {
      this._heartbeatHelper.messageReceived();
    }

    if ((debugFlags.PROTOCOL_MESSAGES &&
      !convergenceMessage.ping &&
      !convergenceMessage.pong) ||
      debugFlags.PROTOCOL_PINGS) {
      console.debug("RCV: " + JSON.stringify(convergenceMessage));
    }

    if (convergenceMessage.ping) {
      this.onPing();
    } else if (convergenceMessage.pong) {
      // no-op
    } else if (convergenceMessage.requestId !== undefined) {
      this.onRequest(convergenceMessage);
    } else if (convergenceMessage.responseId !== undefined) {
      this.onReply(convergenceMessage);
    } else {
      this.onNormalMessage(convergenceMessage);
    }
  }

  private onSocketClosed(reason: string): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    const event: IProtocolConnectionClosedEvent = {name: ProtocolConnection.Events.CLOSED, reason};
    this._emitEvent(event);
  }

  private onSocketDropped(): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this._emitEvent({name: ProtocolConnection.Events.DROPPED});
  }

  private onSocketError(error: Error): void {
    const event: IProtocolConnectionErrorEvent = {name: ProtocolConnection.Events.ERROR, error};
    this._emitEvent(event);
  }

  private onNormalMessage(message: IConvergenceMessage): void {
    Promise.resolve().then(() => {
      const event: IProtocolConnectionMessageEvent = {
        name: "message",
        request: false,
        message
      };
      this._emitEvent(event);
    });
  }

  private onRequest(message: IConvergenceMessage): void {
    const requestId = message.requestId!.value || 0;
    const event: IProtocolConnectionMessageEvent = {
      name: "message",
      request: true,
      callback: new ReplyCallbackImpl(requestId, this),
      message
    };
    this._emitEvent(event);
  }

  private onReply(message: IConvergenceMessage): void {

    const requestId: number = message.responseId!.value || 0;

    const record: RequestRecord = this._requests[requestId];
    delete this._requests[requestId];

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

  private onPing(): void {
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
