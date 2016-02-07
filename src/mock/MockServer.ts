import {MessageEnvelope} from "../main/ts/protocol/protocol";
import OpCode from "../main/ts/connection/OpCode";
import Deferred from "../main/ts/util/Deferred";
import MessageType from "../main/ts/protocol/MessageType";
import {HandshakeResponse} from "../main/ts/protocol/handhsake";

/* tslint:disable */
var mockSocket = require('mock-socket');
if (typeof global['WebSocket'] === "undefined") {
  global['WebSocket'] = mockSocket.WebSocket;
}
/* tslint:enable */

export default class MockServer {
  private _server: any;

  private _incoming: MessageEnvelope[];
  private _expects: ExpectRecord[];
  private _connection: any;

  private _reqId: number;

  constructor(url: string) {
    this._incoming = [];
    this._expects = [];
    this._reqId = 0;

    this._server = new mockSocket.Server(url);

    this._server.on("connection", (server: any, ws: any) => {
      this._connection = ws;

      server.on("message", (message: string) => {
        this._handleMessage(message);
      });

      server.on("close", (code: number, reason: string) => {
        console.log("Connection closed");
      });
    });
  }

  private _handleMessage(json: string): void {
    var parsed: any = JSON.parse(json);
    var envelope: MessageEnvelope = new MessageEnvelope(
      parsed.opCode,
      parsed.reqId,
      parsed.type,
      parsed.body);

    if (envelope.opCode === OpCode.PING) {
      this._connection.sendText(JSON.stringify({opCode: OpCode.PONG}));
    } else {
      if (this._expects.length === 0) {
        this._incoming.push(envelope);
      } else {
        var expect: ExpectRecord = this._expects.shift();
        clearTimeout(expect.timeout);
        if (expect.type === envelope.type) {
          expect.deferred.resolve(envelope);
        } else {
          expect.deferred.reject(new Error("Invalid message type"));
        }
      }
    }
  }

  handshake(timeout: number, response?: HandshakeResponse): Promise<MessageEnvelope> {

    if (response === undefined) {
      response = {
        success: true,
        clientId: "1",
        reconnectToken: "s",
        protocolConfig: {},
        type: MessageType.HANDSHAKE
      };
    }

    return this.expectMessage(timeout, MessageType.HANDSHAKE).then((request: MessageEnvelope) => {
      var body: any = {
        success: response.success,
        sessionId: response.clientId,
        reconnectToken: response.reconnectToken,
        protocolConfig: response.protocolConfig,
        error: response.error,
        retryOk: response.retryOk,
        type: MessageType.HANDSHAKE
      };

      this.sendReply(request.reqId, body);

      return request;
    });
  }

  sendNormal(type: string, body: any): void {
    var envelope: MessageEnvelope = new MessageEnvelope(
      OpCode.NORMAL,
      undefined,
      type,
      body
    );
    this._send(envelope);
  }

  sendRequest(type: string, body: any): void {
    var envelope: MessageEnvelope = new MessageEnvelope(
      OpCode.REQUEST,
      this._reqId++,
      type,
      body
    );
    this._send(envelope);
  }

  sendReply(reqId: number, body: any): void {
    var envelope: MessageEnvelope = new MessageEnvelope(
      OpCode.REPLY,
      reqId,
      undefined,
      body
    );
    this._send(envelope);
  }

  _send(envelope: MessageEnvelope): void {
    var json: string = JSON.stringify(envelope);
    console.log("Sending: " + json);
    this._server.send(json);
  }

  stop(): void {
    this._server.close();
    this._expects.forEach((expect: ExpectRecord) => {
      clearTimeout(expect.timeout);
    });
    this._expects = [];
  }

  expectMessage(timeout: number, type: string): Promise<MessageEnvelope> {
    if (this._incoming.length === 0) {
      var def: Deferred<MessageEnvelope> = new Deferred<MessageEnvelope>();
      var expect: ExpectRecord = {
        type: type,
        deferred: def,
        timeout: {}
      };

      setTimeout(
        () => {
          this._handleTimeout(expect);
        },
        timeout);

      this._expects.push(expect);
      return def.promise();
    } else {
      var message: MessageEnvelope = this._incoming.shift();
      if (message.type === type) {
        return Promise.resolve(message);
      } else {
        return Promise.reject(new Error("Wrong message type"));
      }
    }
  }

  private _handleTimeout(expect: ExpectRecord): void {
    expect.deferred.reject(new Error("Timeout waiting for: " + expect.type));
  }
}

interface ExpectRecord {
  type: string;
  deferred: Deferred<MessageEnvelope>;
  timeout: any;
}
