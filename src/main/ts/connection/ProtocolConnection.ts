import {HeartbeatHelper, HeartbeatHandler} from "./HeartbeatHelper";
import ConvergenceSocket, {ISocketClosedEvent, ISocketErrorEvent, ISocketMessageEvent} from "./ConvergenceSocket";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {HandshakeResponse, HandshakeRequest} from "./protocol/handhsake";
import {MessageType} from "./protocol/MessageType";
import {MessageSerializer} from "./protocol/MessageSerializer";
import {
  MessageEnvelope,
  IncomingProtocolResponseMessage,
  OutgoingProtocolNormalMessage,
  OutgoingProtocolResponseMessage,
  OutgoingProtocolRequestMessage
} from "./protocol/protocol";
import {ErrorMessage} from "./protocol/ErrorMessage";
import {ConvergenceServerError, IConvergenceEvent, ConvergenceEventEmitter} from "../util/";
import {Deferred} from "../util/Deferred";
import {debugFlags} from "../Debug";

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
  error: string;
}

/**
 * @hidden
 * @internal
 */
export interface IProtocolConnectionMessageEvent extends IProtocolConnectionEvent {
  name: "message";
  request: boolean;
  message: any;
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

  public handshake(reconnect: boolean, reconnectToken?: string): Promise<HandshakeResponse> {
    const request: HandshakeRequest = {
      type: MessageType.HANDSHAKE_REQUEST,
      reconnect,
      reconnectToken
    };

    return this.request(request).then((response: HandshakeResponse) => {
      const heartbeatHandler: HeartbeatHandler = {
        sendPing(): void {
          this.onPing();
        },
        onTimeout(): void {
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

      return response;
    });
  }

  public send(message: OutgoingProtocolNormalMessage): void {
    const envelope: MessageEnvelope = new MessageEnvelope(message);
    this.sendMessage(envelope);
  }

  public request(message: OutgoingProtocolRequestMessage): Promise<IncomingProtocolResponseMessage> {
    const reqId: number = this._nextRequestId;
    this._nextRequestId++;

    const replyDeferred: Deferred<IncomingProtocolResponseMessage> = new Deferred<IncomingProtocolResponseMessage>();

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

    this.sendMessage(new MessageEnvelope(message, reqId));

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

  public sendMessage(envelope: MessageEnvelope): void {
    if ((debugFlags.PROTOCOL_MESSAGES &&
      envelope.body.type !== MessageType.PING &&
      envelope.body.type !== MessageType.PONG) ||
      debugFlags.PROTOCOL_PINGS) {
      console.log("S: " + JSON.stringify(envelope));
    }
    const message: any = MessageSerializer.serialize(envelope);
    this._socket.send(message);
  }

  private onSocketMessage(message: any): void {
    const envelope: MessageEnvelope = MessageSerializer.deserialize(message);

    if (this._protocolConfig.heartbeatConfig.enabled && this._heartbeatHelper) {
      this._heartbeatHelper.messageReceived();
    }

    const type: MessageType = envelope.body.type;

    if ((debugFlags.PROTOCOL_MESSAGES &&
      type !== MessageType.PING &&
      type !== MessageType.PONG) ||
      debugFlags.PROTOCOL_PINGS) {
      console.log("R: " + JSON.stringify(envelope));
    }

    if (type === MessageType.PING) {
      this.onPing();
    } else if (type === MessageType.PONG) {
      // no-op
    } else if (envelope.requestId !== undefined) {
      this.onRequest(envelope);
    } else if (envelope.responseId !== undefined) {
      this.onReply(envelope);
    } else {
      this.onNormalMessage(envelope);
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
    // logger.debug("Socket dropped");
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this._emitEvent({name: ProtocolConnection.Events.DROPPED});
  }

  private onSocketError(error: string): void {
    const event: IProtocolConnectionErrorEvent = {name: ProtocolConnection.Events.ERROR, error};
    this._emitEvent(event);
  }

  private onNormalMessage(envelope: MessageEnvelope): void {
    setTimeout(() => {
      const event: IProtocolConnectionMessageEvent = {
        name: "message",
        request: false,
        message: envelope.body
      };
      this._emitEvent(event);
    }, 0);
  }

  private onRequest(envelope: MessageEnvelope): void {
    const event: IProtocolConnectionMessageEvent = {
      name: "message",
      request: true,
      callback: new ReplyCallbackImpl(envelope.requestId, this),
      message: envelope.body
    };
    this._emitEvent(event);
  }

  private onReply(envelope: MessageEnvelope): void {

    const requestId: number = envelope.responseId;

    const record: RequestRecord = this._requests[requestId];
    delete this._requests[requestId];

    if (record) {
      clearTimeout(record.timeoutTask);

      const type: MessageType = envelope.body.type;
      if (type === MessageType.ERROR) {
        const errorMessage: ErrorMessage = envelope.body as ErrorMessage;
        record.replyDeferred.reject(
          new ConvergenceServerError(errorMessage.message, errorMessage.code, errorMessage.details));
      } else {
        record.replyDeferred.resolve(envelope.body);
      }
    }
  }

  private onPing(): void {
    this.sendMessage(new MessageEnvelope({type: MessageType.PING}));
  }
}

/**
 * @hidden
 * @internal
 */
interface RequestRecord {
  reqId: number;
  replyDeferred: Deferred<IncomingProtocolResponseMessage>;
  timeoutTask: any;
}

/**
 * @hidden
 * @internal
 */
export interface ReplyCallback {
  reply(message: OutgoingProtocolResponseMessage): void;

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

  public reply(message: OutgoingProtocolResponseMessage): void {
    const envelope: MessageEnvelope = new MessageEnvelope(message, undefined, this._reqId);
    this._protocolConnection.sendMessage(envelope);
  }

  public unknownError(): void {
    this.unexpectedError("An unknown error has occurred");
  }

  public unexpectedError(message: string): void {
    this.expectedError("unknown", message);
  }

  public expectedError(code: string, message: string, details?: { [key: string]: any }): void {
    details = details || {};
    const errorMessage: ErrorMessage = {
      type: MessageType.ERROR,
      code,
      message,
      details
    };

    const envelope: MessageEnvelope = new MessageEnvelope(errorMessage, undefined, this._reqId);

    this._protocolConnection.sendMessage(envelope);
  }
}
