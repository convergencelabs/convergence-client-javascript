import {HeartbeatHelper} from "./HeartbeatHelper";
import ConvergenceSocket from "./ConvergenceSocket";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {HandshakeResponse} from "../protocol/handhsake";
import {HandshakeRequest} from "../protocol/handhsake";
import MessageType from "../protocol/MessageType";
import {HeartbeatHandler} from "./HeartbeatHelper";
import {OutgoingProtocolNormalMessage} from "../protocol/protocol";
import {MessageSerializer} from "../protocol/MessageSerializer";
import {MessageEnvelope} from "../protocol/protocol";
import {IncomingProtocolResponseMessage} from "../protocol/protocol";
import {OutgoingProtocolRequestMessage} from "../protocol/protocol";
import {ProtocolMessage} from "../protocol/protocol";
import {ErrorMessage} from "../protocol/ErrorMessage";
import {ErrorMessageDeserializer} from "../protocol/ErrorMessage";
import {IncomingProtocolRequestMessage} from "../protocol/protocol";
import {IncomingProtocolNormalMessage} from "../protocol/protocol";
import {OutgoingProtocolResponseMessage} from "../protocol/protocol";
import OpCode from "./OpCode";
import EventEmitter from "../util/EventEmitter";

export class ProtocolConnection extends EventEmitter {

  static Events: any = {
    MESSAGE: "message",
    ERROR: "error",
    CLOSED: "close",
    DROPPED: "dropped"
  };

  private _heartbeatHelper: HeartbeatHelper;
  private _socket: ConvergenceSocket;
  private _protocolConfig: ProtocolConfiguration;
  private _nextRequestId: number = 0;
  private _requests: any;

  constructor(socket: ConvergenceSocket, protocolConfig: ProtocolConfiguration) {
    super();
    var self: ProtocolConnection = this;

    this._protocolConfig = protocolConfig;
    this._socket = socket;

    this._socket.on(ConvergenceSocket.Events.MESSAGE, (message: any) => {
      self.onSocketMessage(message);
    });

    this._socket.on(ConvergenceSocket.Events.ERROR, (error: string) => {
      self.onSocketError(error);
    });

    this._socket.on(ConvergenceSocket.Events.CLOSE, (reason: string) => {
      self.onSocketClosed(reason);
    });

    this._requests = {};
  }

  connect(): Q.Promise<void> {
    return this._socket.open();
  }

  handshake(reconnect: boolean, reconnectToken?: string, options?: any): Q.Promise<HandshakeResponse> {
    var request: HandshakeRequest = {
      reconnect: reconnect,
      reconnectToken: reconnectToken,
      options: options,
      type: MessageType.HANDSHAKE
    };

    var self: ProtocolConnection = this;

    return this.request(request).then(function (response: HandshakeResponse): HandshakeResponse {
      var heartbeatHandler: HeartbeatHandler = {
        sendPing(): void {
          self.onPing();
        },
        onTimeout(): void {
          self.abort("pong timeout");
        }
      };

      // todo handle protocol options that come back from server
      self._heartbeatHelper = new HeartbeatHelper(
        heartbeatHandler,
        self._protocolConfig.heartbeatConfig.pingInterval,
        self._protocolConfig.heartbeatConfig.pongTimeout);

      if (self._protocolConfig.heartbeatConfig.enabled) {
        self._heartbeatHelper.start();
      }

      return response;
    });
  }


  send(message: OutgoingProtocolNormalMessage): void {
    var type: string = message.type;
    var body: any = MessageSerializer.serialize(message);
    var envelope: MessageEnvelope = new MessageEnvelope(OpCode.NORMAL, undefined, type, body);
    this.sendMessage(envelope);
  }

  request(message: OutgoingProtocolRequestMessage): Q.Promise<IncomingProtocolResponseMessage> {
    var self: ProtocolConnection = this;
    var requestId: number = this._nextRequestId;
    this._nextRequestId++;

    var replyDeferred: Q.Deferred<IncomingProtocolResponseMessage> = Q.defer<IncomingProtocolResponseMessage>();

    var timeout: number = this._protocolConfig.defaultRequestTimeout;
    var timeoutTask: any = setTimeout(
      function (): void {
        var req: RequestRecord = self._requests[requestId];
        if (req) {
          req.replyDeferred.reject(new Error("Response timeout"));
        }
      },
      timeout);

    var type: string = message.type;
    var body: any = MessageSerializer.serialize(message);
    var sent: MessageEnvelope = new MessageEnvelope(OpCode.REQUEST, requestId, type, body);
    this.sendMessage(sent);

    this._requests[requestId] = <RequestRecord> {
      reqId: requestId,
      replyDeferred: replyDeferred,
      timeoutTask: timeoutTask,
      requestType: sent.type
    };

    return replyDeferred.promise;
  }

  abort(reason: string): void {
    console.log("Aborting connection: " + reason);
    if (this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this._socket.terminate(reason);
    this.onSocketDropped();
  }

  close(): Q.Promise<void> {
    console.log("Closing connection");
    this.removeAllListenersForAllEvents();
    if (this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    return this._socket.close();
  }

  sendMessage(envelope: MessageEnvelope): void {
    this._socket.send(envelope);
  }

  private onSocketMessage(message: any): void {
    var envelope: MessageEnvelope = message;

    if (this._protocolConfig.heartbeatConfig.enabled && this._heartbeatHelper) {
      this._heartbeatHelper.messageReceived();
    }

    switch (envelope.opCode) {
      case OpCode.NORMAL:
        this.onNormalMessage(envelope);
        break;
      case OpCode.PING:
        this.onPing();
        break;
      case OpCode.PONG:
        break;
      case OpCode.REQUEST:
        this.onRequest(envelope);
        break;
      case OpCode.REPLY:
        this.onReply(envelope);
        break;
      default:
        this.handleInvalidMessage("Unexpected opCode: " + envelope.opCode);
    }
  }

  private onSocketClosed(reason: string): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this.emit(ProtocolConnection.Events.CLOSED, reason);
  }

  private onSocketDropped(): void {
    // logger.debug("Socket dropped");
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this.emit(ProtocolConnection.Events.DROPPED);
  }

  private onSocketError(error: string): void {
    this.emit(ProtocolConnection.Events.ERROR, error);
  }

  private onNormalMessage(envelope: any): void {
    var message: ProtocolMessage = MessageSerializer.deserialize(envelope.body, envelope.type);
    this.emit(ProtocolConnection.Events.MESSAGE, {
      request: false,
      message: message
    });
  }

  private onRequest(envelope: MessageEnvelope): void {
    var message: ProtocolMessage = MessageSerializer.deserialize(envelope.body, envelope.type);
    this.emit(ProtocolConnection.Events.MESSAGE, {
      request: true,
      callback: new ReplyCallbackImpl(envelope.reqId, this),
      message: message
    });
  }

  private onReply(envelope: MessageEnvelope): void {

    var requestId: number = envelope.reqId;

    var record: RequestRecord = this._requests[requestId];
    delete this._requests[requestId];

    if (record) {
      clearTimeout(record.timeoutTask);

      var type: string = envelope.type;
      if (type === "error") {
        var errorMessage: ErrorMessage = ErrorMessageDeserializer.deserialize(envelope.body);
        record.replyDeferred.reject(new Error(errorMessage.code + ": " + errorMessage.details));
      } else {
        var response: IncomingProtocolResponseMessage = MessageSerializer.deserialize(envelope.body, record.requestType);
        record.replyDeferred.resolve(response);
      }
    }
  }

  private onPing(): void {
    this.sendMessage(new MessageEnvelope(OpCode.PONG, undefined, undefined, undefined));
  }

  private handleInvalidMessage(error: string): void {
    console.error(error);
    this.abort(error);
    this.emit(ProtocolConnection.Events.ERROR, error);
  }
}

interface RequestRecord {
  reqId: number;
  replyDeferred: Q.Deferred<IncomingProtocolResponseMessage>;
  timeoutTask: any;
  requestType: string;
}

export interface ProtocolEventHandler {
  onConnectionError(error: string): void;
  onConnectionDropped(): void;
  onConnectionClosed(): void;
  onRequestReceived(message: IncomingProtocolRequestMessage, replyCallback: ReplyCallback): void;
  onMessageMessage(message: IncomingProtocolNormalMessage): void;
}

export interface ReplyCallback {
  reply(message: OutgoingProtocolResponseMessage): void;
  unknownError(): void;
  unexpectedError(details: String): void;
  expectedError(code: String, details: String): void;
}

class ReplyCallbackImpl implements ReplyCallback {
  private _reqId: number;
  private _protocolConnection: ProtocolConnection;

  constructor(reqId: number, protocolConnection: ProtocolConnection) {
    this._reqId = reqId;
    this._protocolConnection = protocolConnection;
  }

  reply(message: OutgoingProtocolResponseMessage): void {
    var envelope: MessageEnvelope = new MessageEnvelope(
      OpCode.REPLY,
      this._reqId,
      undefined,
      message);

    this._protocolConnection.sendMessage(envelope);
  }

  unknownError(): void {
    this.unexpectedError("An unknown error has occurred");
  }

  unexpectedError(details: string): void {
    this.expectedError("unknown", details);
  }

  expectedError(code: string, details: string): void {
    var errorMessage: any = {
      code: code,
      details: details
    };

    var envelope: MessageEnvelope = new MessageEnvelope(
      OpCode.REPLY,
      this._reqId,
      MessageType.ERROR,
      errorMessage);

    this._protocolConnection.sendMessage(envelope);
  }
}
