import {HeartbeatHelper} from "./HeartbeatHelper";
import ConvergenceSocket from "./ConvergenceSocket";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {HandshakeResponse} from "./protocol/handhsake";
import {HandshakeRequest} from "./protocol/handhsake";
import {MessageType} from "./protocol/MessageType";
import {HeartbeatHandler} from "./HeartbeatHelper";
import {OutgoingProtocolNormalMessage} from "./protocol/protocol";
import {MessageSerializer} from "./protocol/MessageSerializer";
import {MessageEnvelope} from "./protocol/protocol";
import {IncomingProtocolResponseMessage} from "./protocol/protocol";
import {OutgoingProtocolRequestMessage} from "./protocol/protocol";
import {ErrorMessage} from "./protocol/ErrorMessage";
import {OutgoingProtocolResponseMessage} from "./protocol/protocol";
import {EventEmitter} from "../util/EventEmitter";
import {Deferred} from "../util/Deferred";
import {debugFlags} from "../Debug";

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

    this._protocolConfig = protocolConfig;
    this._socket = socket;

    this._socket.on(ConvergenceSocket.Events.MESSAGE, (message: any) => {
      this.onSocketMessage(message);
    });

    this._socket.on(ConvergenceSocket.Events.ERROR, (error: string) => {
      this.onSocketError(error);
    });

    this._socket.on(ConvergenceSocket.Events.CLOSE, (reason: string) => {
      this.onSocketClosed(reason);
    });

    this._requests = {};
  }

  connect(): Promise<void> {
    return this._socket.open();
  }

  handshake(reconnect: boolean, reconnectToken?: string): Promise<HandshakeResponse> {
    var request: HandshakeRequest = {
      type: MessageType.HANDSHAKE_REQUEST,
      reconnect: reconnect,
      reconnectToken: reconnectToken
    };

    return this.request(request).then((response: HandshakeResponse) => {
      var heartbeatHandler: HeartbeatHandler = {
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

  send(message: OutgoingProtocolNormalMessage): void {
    var envelope: MessageEnvelope = new MessageEnvelope(message);
    this.sendMessage(envelope);
  }

  request(message: OutgoingProtocolRequestMessage): Promise<IncomingProtocolResponseMessage> {
    var self: ProtocolConnection = this;
    var requestId: number = this._nextRequestId;
    this._nextRequestId++;

    var replyDeferred: Deferred<IncomingProtocolResponseMessage> = new Deferred<IncomingProtocolResponseMessage>();

    var timeout: number = this._protocolConfig.defaultRequestTimeout;
    var timeoutTask: any = setTimeout(
      function (): void {
        var req: RequestRecord = self._requests[requestId];
        if (req) {
          req.replyDeferred.reject(new Error("Response timeout"));
        }
      },
      timeout);

    this._requests[requestId] = <RequestRecord> {
      reqId: requestId,
      replyDeferred: replyDeferred,
      timeoutTask: timeoutTask
    };

    this.sendMessage(new MessageEnvelope(message, requestId));

    return replyDeferred.promise();
  }

  abort(reason: string): void {
    if (this._heartbeatHelper && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    this._socket.terminate(reason);
    this.onSocketDropped();
  }

  close(): Promise<void> {
    this.removeAllListenersForAllEvents();
    if (this._heartbeatHelper !== undefined && this._heartbeatHelper.started) {
      this._heartbeatHelper.stop();
    }
    return this._socket.close();
  }

  sendMessage(envelope: MessageEnvelope): void {
    if ((debugFlags.protocol.messages &&
      envelope.body.type !== MessageType.PING &&
      envelope.body.type !== MessageType.PONG) ||
      debugFlags.protocol.pings) {
      console.log("S: " + JSON.stringify(envelope));
    }
    var message: any = MessageSerializer.serialize(envelope);
    this._socket.send(message);
  }

  private onSocketMessage(message: any): void {
    var envelope: MessageEnvelope = MessageSerializer.deserialize(message);

    if (this._protocolConfig.heartbeatConfig.enabled && this._heartbeatHelper) {
      this._heartbeatHelper.messageReceived();
    }

    var type: MessageType = envelope.body.type;

    if ((debugFlags.protocol.messages &&
      type !== MessageType.PING &&
      type !== MessageType.PONG) ||
      debugFlags.protocol.pings) {
      console.log("R: " + JSON.stringify(envelope));
    }

    if (type === MessageType.PING) {
      this.onPing();
    } else if (type === MessageType.PONG) {
      // TODO: Do we need to do anything here
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

  private onNormalMessage(envelope: MessageEnvelope): void {
    setTimeout(() => {
      this.emit(ProtocolConnection.Events.MESSAGE, {
        request: false,
        message: envelope.body
      });
    }, 0);
  }

  private onRequest(envelope: MessageEnvelope): void {
    this.emit(ProtocolConnection.Events.MESSAGE, {
      request: true,
      callback: new ReplyCallbackImpl(envelope.requestId, this),
      message: envelope.body
    });
  }

  private onReply(envelope: MessageEnvelope): void {

    var requestId: number = envelope.responseId;

    var record: RequestRecord = this._requests[requestId];
    delete this._requests[requestId];

    if (record) {
      clearTimeout(record.timeoutTask);

      var type: MessageType = envelope.body.type;
      if (type === MessageType.ERROR) {
        var errorMessage: ErrorMessage = <ErrorMessage> envelope.body;
        record.replyDeferred.reject(new Error(errorMessage.code + ": " + errorMessage.details));
      } else {
        record.replyDeferred.resolve(envelope.body);
      }
    }
  }

  private onPing(): void {
    this.sendMessage(new MessageEnvelope({type: MessageType.PING}));
  }
}

interface RequestRecord {
  reqId: number;
  replyDeferred: Deferred<IncomingProtocolResponseMessage>;
  timeoutTask: any;
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
    var envelope: MessageEnvelope = new MessageEnvelope(message, undefined, this._reqId);
    this._protocolConnection.sendMessage(envelope);
  }

  unknownError(): void {
    this.unexpectedError("An unknown error has occurred");
  }

  unexpectedError(details: string): void {
    this.expectedError("unknown", details);
  }

  expectedError(code: string, details: string): void {
    var errorMessage: ErrorMessage = {
      type: MessageType.ERROR,
      code: code,
      details: details
    };

    var envelope: MessageEnvelope = new MessageEnvelope(errorMessage, undefined, this._reqId);

    this._protocolConnection.sendMessage(envelope);
  }
}
