import MessageType from "../../main/ts/connection/protocol/MessageType";
import {MessageEnvelope} from "../../main/ts/connection/protocol/protocol";
import EqualsUtil from "../../main/ts/util/EqualsUtil";

/* tslint:disable */
var mockSocket = require('mock-socket');
if (typeof global['WebSocket'] === "undefined") {
  global['WebSocket'] = mockSocket.WebSocket;
}
/* tslint:enable */

/**
 * Options to configure the behavior of the mock server.
 */
export interface IMockServerOptions {
  url: string;

  autoHandshake?: boolean;
  handshakeTimeout?: number;
  handshakeResponse?: any;

  autoTokenAuth?: boolean;
  authTimeout?: number;
  authResponse?: any;
  authExpectedToken?: string;

  doneType: DoneType;

  mochaDone?: MochaDone;

  successCallback?: SuccessCallback;
  failureCallback?: FailureCallback;

  immediateAutoWait?: boolean;
}

export enum DoneType {
  MOCHA, CALLBACK
}

export type SuccessCallback = () => void;
export type FailureCallback = (e: any) => void;

/**
 * This is the main mock server class.
 */
export class MockConvergenceServer {
  private _url: string;
  private _doneManager: AbstractDoneManager;

  private _mockSocketServer: any;
  private _connection: any;

  private _incomingMessageQueue: MessageEnvelope[];
  private _receiveExpectations: ReceiveExpectation[];

  private _reqId: number;

  private _autoWait: boolean;

  constructor(options: IMockServerOptions) {
    this._url = options.url;
    this._mockSocketServer = new mockSocket.Server(options.url);

    switch (options.doneType) {
      case DoneType.MOCHA:
        if (options.mochaDone === undefined) {
          throw new Error("Must specify 'mochaDone' for a doneType of 'mocha'");
        }
        this._doneManager = new MochaDoneManager(this, options.mochaDone);
        break;
      case DoneType.CALLBACK:
        if (options.successCallback === undefined || options.failureCallback === undefined) {
          throw new Error("Must specify both 'successCallback' and 'customOnFailure' for a doneType of 'custom'");
        }
        this._doneManager = new CallbackDoneManager(this, options.successCallback, options.failureCallback);
        break;
      default:
        throw new Error("Invalid 'doneType");
    }

    this._mockSocketServer.on("connection", (server: any, ws: any) => {
      console.log("Client connected to mock server");
      this._connection = ws;

      server.on("message", (message: string) => {
        // this is needed to keep everything properly async.
        setTimeout(
          () => {
            console.log("Server Receive: " + message);
            this._handleMessage(message);
          },
          0);
      });

      server.on("close", (code: number, reason: string) => {
        console.log("Mock Server connection closed");
      });
    });

    this._incomingMessageQueue = [];
    this._receiveExpectations = [];
    this._reqId = 0;

    this._autoWait = false;

    if (options.autoHandshake) {
      this.handshake(options.handshakeResponse, options.handshakeTimeout);
    }

    if (options.autoTokenAuth) {
      this.tokenAuth(options.authExpectedToken, options.authResponse, options.authTimeout);
    }

    if (options.immediateAutoWait) {
      this.autoWait();
    }
  }

  url(): string {
    return this._url;
  }

  doneManager(): IDoneManager {
    return this._doneManager;
  }

  private _findNextWaitingExpectation(): ReceiveExpectation {
    var expect: ReceiveExpectation;
    for (var i: number = 0; i < this._receiveExpectations.length; i++) {
      var tmp: ReceiveExpectation = this._receiveExpectations[i];
      if (tmp.timeout !== undefined) {
        expect = tmp;
        break;
      }
    }
    return expect;
  }

  waitForNext(): void {
    var expect: ReceiveExpectation = this._findNextWaitingExpectation();

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

  expect(body: any, timeout?: number): IReceiveExpectationCallbacks {
    return this._expectMessage(
      {
        inclination: MessageInclination.Normal,
        type: body.t,
        body: body
      },
      timeout);
  }

  expectRequest(body: any, timeout?: number): IReceiveExpectationCallbacks {
    return this._expectMessage(
      {
        inclination: MessageInclination.Request,
        type: body.t,
        body: body
      },
      timeout);
  }

  expectResponse(body: any, timeout?: number): IReceiveExpectationCallbacks {
    return this._expectMessage(
      {
        inclination: MessageInclination.Response,
        type: body.t,
        body: body
      },
      timeout);
  }

  send(body: any, timeout?: number): ISendExpectationCallback {
    var envelope: any = {
      b: body
    };

    this._send(envelope);

    return new SendExpectationCallback(this, timeout, body);
  }

  sendRequest(body: any, timeout?: number): ISendExpectationCallback {
    var envelope: any = {
      b: body,
      q: this._reqId++
    };

    this._send(envelope);

    return new SendExpectationCallback(this, timeout, body);
  }

  sendReply(reqId: number, body: any, timeout?: number): ISendExpectationCallback {
    var envelope: any = {
      b: body,
      p: reqId
    };

    this._send(envelope);

    return new SendExpectationCallback(this, timeout, body);
  }

  private _expectMessage(messageExpectation: MessageExpectation, timeout?: number): IReceiveExpectationCallbacks {
    var expectation: ReceiveExpectation = {
      timeout: timeout,
      inclination: messageExpectation.inclination,
      type: messageExpectation.type,
      body: messageExpectation.body,
      callbacks: new ReceiveExpectationCallbacks(this)
    };

    if (this._incomingMessageQueue.length === 0) {
      this._receiveExpectations.push(expectation);
    } else {
      var message: MessageEnvelope = this._incomingMessageQueue.shift();
      this._processMessage(expectation, message);
    }
    return expectation.callbacks;
  }

  private _handleTimeout(): void {
    var expectation: ReceiveExpectation = this._receiveExpectations[0];
    this._doneManager.testFailure(new Error("Timeout waiting for: " + MessageType[expectation.type]));
    this.stop();
  }

  stop(): void {
    this._mockSocketServer.close();
    this._receiveExpectations.forEach((expectation: ReceiveExpectation) => {
      clearTimeout(expectation.timer);
    });
    this._receiveExpectations = [];
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

  tokenAuth(token: string, response?: any, timeout?: number): void {
    if (response === undefined) {
      response = {
        s: true,
        u: "userId",
        t: MessageType.AUTHENTICATE_RESPONSE
      };
    }
    this.expectRequest({t: MessageType.TOKEN_AUTH_REQUEST, k: token}, timeout).thenReply(response);
  }

  private _handleMessage(json: string): void {
    var envelope: any = JSON.parse(json);
    if (envelope.b.t === MessageType.PING) {
      this._mockSocketServer.sendText(JSON.stringify({b: {t: MessageType.PONG}}));
    } else {
      if (this._receiveExpectations.length === 0) {
        this._incomingMessageQueue.push(envelope);
      } else {
        var expectation: ReceiveExpectation = this._receiveExpectations.shift();
        setTimeout(
          () => {
            this._processMessage(expectation, envelope);
          },
          0);
      }
    }
  }

  private _processMessage(expectation: ReceiveExpectation, envelope: any): void {
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
      if (this._autoWait && this._receiveExpectations.length !== 0) {
        this.waitForNext();
      }
    }

    try {
      expectation.callbacks.resolve(envelope);
    } catch (e) {
      this._doneManager.testFailure(e);
    }

    if (this._receiveExpectations.length === 0) {
      this._doneManager.serverDone();
    }
  }

  private _send(envelope: any): void {
    var json: string = JSON.stringify(envelope);
    console.log("Server Sending: " + json);
    this._mockSocketServer.send(json);
  }
}

/**
 * The interface returned by incoming message expectations.  Allows consumers to
 * dictate the behavior when a message is received
 */
export interface IReceiveExpectationCallbacks {
  thenReply(message: any): void;
  thenCall(callback: (envelope: MessageEnvelope) => void): void;
}

/**
 * Internal implementation of the IReceiveExpectationCallbacks interface.
 */
class ReceiveExpectationCallbacks {
  private _replyMessage: any;
  private _thenCallback: any;

  constructor(private _mockServer: MockConvergenceServer) {
  }

  thenReply(message: any): void {
    this._replyMessage = message;
  }

  thenCall(callback: (expectedMessage: any) => void): void {
    this._thenCallback = callback;
  }

  resolve(expectedMessage: any): void {
    setTimeout(
      () => {
        if (this._thenCallback !== undefined) {
          this._thenCallback(expectedMessage);
        }

        if (this._replyMessage !== undefined) {
          this._mockServer.sendReply(expectedMessage.q, this._replyMessage);
        }
      },
      0);
  }
}

/**
 * Interface returned by the send methods that allow consumers to
 * acknowledge that the send message was correctly processed.
 */
export interface ISendExpectationCallback {
  acknowledgeReception(): void;
}

class SendExpectationCallback implements ISendExpectationCallback {
  private _timer: any;

  constructor(private _server: MockConvergenceServer, timeout: number, private _message: any) {
    if (timeout !== undefined) {
      this._timer = setTimeout(
        () => {
          this._timer = undefined;
          _server.stop();
          _server.doneManager().testFailure(
            new Error("A message sent by the mock server was not acknowledged within the specified timeout: " +
              JSON.stringify(_message))
          );
        },
        timeout);
    }
  }

  acknowledgeReception(): void {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }
}

/**
 * Exposes methods so the calling test framework can indicate success or failure
 * of tests in a consistent manner.
 */
export interface IDoneManager {
  testSuccess(): void;
  testFailure(error?: Error): void;
}

abstract class AbstractDoneManager implements IDoneManager {
  private _serverExpectationsMet: boolean;
  private _resolved: boolean;

  constructor(private _mockServer: MockConvergenceServer) {
    this._serverExpectationsMet = false;
    this._resolved = false;
  }

  testSuccess(): void {
    if (!this._resolved) {
      if (!this._serverExpectationsMet) {
        this.testFailure(new Error("Test completed without meeting all server expectations."));
      } else {
        this._resolved = true;
        this._mockServer.stop();
        this._onSuccess();
      }
    }
  }

  testFailure(error?: Error): void {
    if (!this._resolved) {
      this._resolved = true;
      this._mockServer.stop();
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

  constructor(_mockServer: MockConvergenceServer, private _successCallback: () => void, private _errorCallback: (error: Error) => void) {
    super(_mockServer);
  }

  protected _onSuccess(): void {
    this._successCallback();
  }

  protected _onFailure(error: Error): void {
    this._errorCallback(error);
  }
}

class MochaDoneManager extends CallbackDoneManager {
  constructor(_mockServer: MockConvergenceServer, _mochaDone: MochaDone) {
    super(_mockServer, _mochaDone, _mochaDone);
  }
}


interface MessageExpectation {
  inclination: MessageInclination;
  type?: MessageType;
  body?: any;
}

interface ReceiveExpectation {
  inclination: MessageInclination;
  type?: MessageType;
  body?: any;
  timeout?: number;
  timer?: any;
  callbacks: ReceiveExpectationCallbacks;
}

enum MessageInclination {
  Normal, Request, Response
}
