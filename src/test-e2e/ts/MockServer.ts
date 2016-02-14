/* tslint:disable */
import MessageType from "../../main/ts/protocol/MessageType";
import {MessageEnvelope} from "../../main/ts/protocol/protocol";
import EqualsUtil from "../../main/ts/util/EqualsUtil";
import {HandshakeResponse} from "../../main/ts/protocol/handhsake";
var mockSocket = require('mock-socket');
if (typeof global['WebSocket'] === "undefined") {
  global['WebSocket'] = mockSocket.WebSocket;
}
/* tslint:enable */

export class MockServer {
  private _doneManager: AbstractDoneManager;

  private _mockSocketServer: any;
  private _connection: any;

  private _incoming: MessageEnvelope[];
  private _expects: Expectation[];

  private _reqId: number;

  private _autoWait: boolean;

  constructor(options: IMockServerOptions) {
    this._mockSocketServer = new mockSocket.Server(options.url);

    switch (options.doneType) {
      case DoneType.MOCHA:
        if (options.mochaDone === undefined) {
          throw new Error("Must specify 'mochaDone' for a doneType of 'mocha'");
        }
        this._doneManager = new MochaDoneManager(options.mochaDone);
        break;
      case DoneType.CALLBACK:
        if (options.successCallback === undefined || options.failureCallback === undefined) {
          throw new Error("Must specify both 'successCallback' and 'customOnFailure' for a doneType of 'custom'");
        }
        this._doneManager = new CallbackDoneManager(options.successCallback, options.failureCallback);
        break;
      default:
        throw new Error("Invalid 'doneType");
    }

    this._mockSocketServer.on("connection", (server: any, ws: any) => {
      this._connection = ws;

      server.on("message", (message: string) => {
        console.log("Server Receive: " + message);
        this._handleMessage(message);
      });

      server.on("close", (code: number, reason: string) => {
        console.log("Connection closed");
      });
    });

    this._incoming = [];
    this._expects = [];
    this._reqId = 0;

    this._autoWait = false;
  }

  doneManager(): IDoneManager {
    return this._doneManager;
  }

  private _findNextWaitingExpectation(): Expectation {
    var expect: Expectation;
    for (var i: number = 0; i < this._expects.length; i++) {
      var tmp: Expectation = this._expects[i];
      if (tmp.timeout !== undefined) {
        expect = tmp;
        break;
      }
    }
    return expect;
  }

  waitForNext(): void {
    var expect: Expectation = this._findNextWaitingExpectation();

    if (expect === undefined) {
      this._doneManager.testFailure(new Error("Cannot wait for next because no more  expectations have timeouts"));
    } else if (expect.timer !== undefined) {
      this._doneManager.testFailure(new Error("Cannot call wait when the most recent expectation is already waiting"));
    } else {
      var t: any = setTimeout(
        () => {
          this._handleTimeout();
        },
        expect.timeout);
      expect.timer = t;
    }
  }

  autoWait(): void {
    this._autoWait = true;
    this.waitForNext();
  }

  expect(body: any, timeout?: number): IExpectationCallbacks {
    return this._expectMessage(
      {
        inclination: MessageInclination.Normal,
        type: body.t,
        body: body
      },
      timeout);
  }

  expectRequest(body: any, timeout?: number): IExpectationCallbacks {
    return this._expectMessage(
      {
        inclination: MessageInclination.Request,
        type: body.t,
        body: body
      },
      timeout);
  }

  expectResponse(body: any, timeout?: number): IExpectationCallbacks {
    return this._expectMessage(
      {
        inclination: MessageInclination.Response,
        type: body.t,
        body: body
      },
      timeout);
  }

  send(type: string, body: any): void {
    var envelope: any = {
      b: body
    };
    this._send(envelope);
  }

  sendRequest(type: string, body: any): void {
    var envelope: any = {
      b: body,
      q: this._reqId++
    };
    this._send(envelope);
  }

  sendReply(reqId: number, body: any): void {
    var envelope: any = {
      b: body,
      p: reqId
    };
    this._send(envelope);
  }

  private _expectMessage(messageExpectation: MessageExpectation, timeout?: number): IExpectationCallbacks {
    var expectation: Expectation = {
      timeout: timeout,
      inclination: messageExpectation.inclination,
      type: messageExpectation.type,
      body: messageExpectation.body,
      callbacks: new ExpectationCallbacks(this)
    };

    return this._expect(expectation);
  }

  private _expect(expectation: Expectation): IExpectationCallbacks {
    if (this._incoming.length === 0) {
      this._expects.push(expectation);
    } else {
      var message: MessageEnvelope = this._incoming.shift();
      this._processMessage(expectation, message);
    }
    return expectation.callbacks;
  }

  private _handleTimeout(): void {
    var expectation: Expectation = this._expects[0];
    this._doneManager.testFailure(new Error("Timeout waiting for: " + MessageType[expectation.type]));
    this.stop();
  }

  stop(): void {
    this._mockSocketServer.close();
    this._expects.forEach((expectation: Expectation) => {
      clearTimeout(expectation.timer);
    });
    this._expects = [];
  }

  handshake(response?: any, timeout?: number): void {
    if (response === undefined) {
      response = {
        s: true,
        i: "1",
        k: "s",
        c: {},
        t: MessageType.HANDSHAKE_RESPONSE
      };
    }
    this.expectRequest({t: MessageType.HANDSHAKE_REQUEST, r: false}, timeout).thenReply(response);
  }

  private _handleMessage(json: string): void {
    var envelope: any = JSON.parse(json);
    if (envelope.b.t === MessageType.PING) {
      this._mockSocketServer.sendText(JSON.stringify({b: {t: MessageType.PONG}}));
    } else {
      if (this._expects.length === 0) {
        this._incoming.push(envelope);
      } else {
        var expectation: Expectation = this._expects.shift();
        setTimeout(
          () => {
            this._processMessage(expectation, envelope);
          },
          0);
      }
    }
  }

  private _processMessage(expectation: Expectation, envelope: any): void {
    if (expectation.inclination === MessageInclination.Normal && (envelope.q !== undefined || envelope.p !== undefined)) {
      this._doneManager.testFailure(new Error("Normal messages must not have a request or response id set"));
    } else if (expectation.inclination === MessageInclination.Request && (envelope.q === undefined || envelope.p !== undefined)) {
      this._doneManager.testFailure(new Error("Request messages must have a request id and no response id set"));
    } else if (expectation.inclination === MessageInclination.Response && (envelope.q !== undefined || envelope.p === undefined)) {
      this._doneManager.testFailure(new Error("Response messages must have a response id and no request id set"));
    } else if (expectation.type !== undefined && envelope.b.t !== expectation.type) {
      this._doneManager.testFailure(new Error(`Expected type '${expectation.type}, but received '${envelope.body.type}'.`));
    } else if (expectation.body !== undefined && !EqualsUtil.deepEquals(envelope.b, expectation.body)) {
      this._doneManager.testFailure(new Error(
        `Expected body '${JSON.stringify(expectation.body)}, but received '${JSON.stringify(envelope.b)}'.`));
    }

    if (expectation.timer !== undefined) {
      clearTimeout(expectation.timer);
      if (this._autoWait && this._expects.length !== 0) {
        this.waitForNext();
      }
    }

    try {
      expectation.callbacks.resolve(envelope);
    } catch (e) {
      this._doneManager.testFailure(e);
    }

    if (this._expects.length === 0) {
      this._doneManager.serverDone();
    }
  }

  private _send(envelope: any): void {
    var json: string = JSON.stringify(envelope);
    console.log("Server Sending: " + json);
    this._mockSocketServer.send(json);
  }
}

export interface IExpectationCallbacks {
  thenReply(message: any): void;
  thenCall(callback: (envelope: MessageEnvelope) => void): void;
}

class ExpectationCallbacks {
  private _replyMessage: any;
  private _thenCallback: any;

  constructor(private _mockServer: MockServer) {
  }

  thenReply(message: any): void {
    this._replyMessage = message;
  }

  thenCall(callback: (expectedMessage: any) => void): void {
    this._thenCallback = callback;
  }

  resolve(expectedMessage: any): void {
    if (this._thenCallback !== undefined) {
      this._thenCallback(expectedMessage);
    }

    if (this._replyMessage !== undefined) {
      this._mockServer.sendReply(expectedMessage.q, this._replyMessage);
    }
  }
}

abstract class AbstractDoneManager implements IDoneManager {
  private _serverExpectationsMet: boolean;
  private _resolved: boolean;

  constructor() {
    this._serverExpectationsMet = false;
    this._resolved = false;
  }

  testSuccess(): void {
    if (!this._resolved) {
      if (!this._serverExpectationsMet) {
        this.testFailure(new Error("Test completed without meeting all server expectations."));
      } else {
        this._resolved = true;
        this._onSuccess();
      }
    }
  }

  testFailure(error?: Error): void {
    if (!this._resolved) {
      this._resolved = true;
      this._onFailure(error);
    }
  }

  serverDone(): void {
    this._serverExpectationsMet = true;
  }

  protected abstract _onSuccess(): void;

  protected abstract _onFailure(error: Error): void;
}

class CallbackDoneManager extends AbstractDoneManager {

  constructor(private _successCallback: () => void, private _errorCallback: (error: Error) => void) {
    super();
  }

  protected _onSuccess(): void {
    this._successCallback();
  }

  protected _onFailure(error: Error): void {
    this._errorCallback(error);
  }
}

class MochaDoneManager extends CallbackDoneManager {
  constructor(_mochaDone: MochaDone) {
    super(_mochaDone, _mochaDone);
  }
}

export interface IDoneManager {
  testSuccess(): void;
  testFailure(error?: Error): void;
}


export enum DoneType {
  MOCHA, CALLBACK
}

export interface IMockServerOptions {
  url: string;
  doneType: DoneType;
  mochaDone?: MochaDone;
  successCallback?: () => void;
  failureCallback?: (error: Error) => void;
}

interface MessageExpectation {
  inclination: MessageInclination;
  type?: MessageType;
  body?: any;
}

interface Expectation {
  inclination: MessageInclination;
  type?: MessageType;
  body?: any;
  timeout?: number;
  timer?: any;
  callbacks: ExpectationCallbacks;
}

enum MessageInclination {
  Normal, Request, Response
}

