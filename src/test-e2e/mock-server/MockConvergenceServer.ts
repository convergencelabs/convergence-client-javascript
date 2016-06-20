import MessageType from "../../main/ts/connection/protocol/MessageType";
import AbstractReceiveAction from "./AbstractReceiveAction";
import AbstractSendAction from "./AbstractSendAction";
import {IReceiveRequestRecord} from "./records";
import MockServerAction from "./MockServerAction";
import {ISendResponseRecord} from "./records";
import SendResponseAction from "./SendResponseAction";
import {SendRequestAction} from "./SendRequestAction";
import {ISendRequestRecord} from "./records";
import {ISendRecord} from "./records";
import SendAction from "./SendAction";
import ReceiveResponseAction from "./ReceiveResponseAction";
import {IReceiveResponseRecord} from "./records";
import ReceiveRequestAction from "./ReceiveRequestAction";
import {IReceiveRecord} from "./records";
import ReceiveAction from "./ReceiveAction";
import {IDoneManager} from "./doneManager";
import {CallbackDoneManager} from "./doneManager";
import {MochaDoneManager} from "./doneManager";
import {AbstractDoneManager} from "./doneManager";

/* tslint:disable */
// This block of code is necessary to enable the mock socket framework in
// node.
var mockSocket = require('mock-socket');
if (typeof global['WebSocket'] === "undefined") {
  global['WebSocket'] = mockSocket.WebSocket;
}
/* tslint:enable */

/**
 * This is the main mock server class.
 */
export class MockConvergenceServer {
  private _url: string;
  private _doneManager: AbstractDoneManager;

  private _mockSocketServer: any;

  private _actionId: number;
  private _actions: MockServerAction[];
  private _actionQueue: MockServerAction[];
  private _timeoutQueue: MockServerAction[];

  private _reqId: number;

  private _sendCallback: SendCallback;
  private _timeoutCallback: TimeoutCallback;
  private _completeCallback: CompleteCallback;

  private _currentReceiveAction: AbstractReceiveAction;

  constructor(options: IMockServerOptions) {
    this._url = options.url;

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

    this._reqId = 0;
    this._actionId = 0;
    this._actionQueue = [];
    this._actions = [];
    this._timeoutQueue = [];

    this._sendCallback = (envelope: any) => {
      this._send(envelope);
    };

    this._timeoutCallback = (message: string) => {
      this.stop();
      this.doneManager().testFailure(new Error("Timeout waiting for: " + message));
    };

    this._completeCallback = (action: MockServerAction) => {
      var index: number = this._timeoutQueue.indexOf(action);
      if (index >= 0) {
        this._timeoutQueue.splice(index, 1);
      }
      this._checkDone();
    };

    if (options.autoHandshake) {
      this.handshake(options.handshakeResponse, options.handshakeTimeout);
    }

    if (options.autoTokenAuth) {
      this.tokenAuth(options.authExpectedToken, options.authResponse, options.authTimeout);
    }
  }

  /**
   * Returns the URL that the mock server is configured to "listen" on.
   * @returns {string}
   */
  url(): string {
    return this._url;
  }

  /**
   * Returns the done manager that tests should use to inform the mock server of
   * success or failure.
   * @returns {IDoneManager}
   */
  doneManager(): IDoneManager {
    return this._doneManager;
  }

  expect(body: any, timeout?: number): IReceiveRecord {
    var action: ReceiveAction = new ReceiveAction(
      this._actionId++,
      this._timeoutCallback,
      this._completeCallback,
      this._resolveMessageGenerator(body),
      timeout
    );

    this._registerActionAction(action);
    return action.record();
  }

  expectRequest(body: any, timeout?: number): IReceiveRequestRecord {
    var action: ReceiveRequestAction = new ReceiveRequestAction(
      this._actionId++,
      this._timeoutCallback,
      this._completeCallback,
      this._resolveMessageGenerator(body),
      timeout
    );

    this._registerActionAction(action);
    return action.requestRecord();
  }

  expectResponseTo(requestRecord: ISendRequestRecord, body: any, timeout?: number): IReceiveResponseRecord {
    var action: ReceiveResponseAction = new ReceiveResponseAction(
      this._actionId++,
      requestRecord,
      this._timeoutCallback,
      this._completeCallback,
      this._resolveMessageGenerator(body),
      timeout
    );

    this._registerActionAction(action);
    return action.responseRecord();
  }

  send(message: any, timeout?: number): ISendRecord {
    var action: SendAction = new SendAction(
      this._actionId++,
      this._timeoutCallback,
      this._completeCallback,
      this._sendCallback,
      this._resolveMessageGenerator(message),
      timeout
    );

    this._registerActionAction(action);
    return action.sendRecord();
  }

  sendRequest(message: any, timeout?: number): ISendRequestRecord {
    var action: SendRequestAction = new SendRequestAction(
      this._actionId++,
      this._reqId++,
      this._timeoutCallback,
      this._completeCallback,
      this._sendCallback,
      this._resolveMessageGenerator(message),
      timeout
    );

    this._registerActionAction(action);
    return action.sendRequestRecord();
  }

  sendReplyTo(requestRecord: IReceiveRequestRecord, message: any, timeout?: number): ISendResponseRecord {
    var action: SendResponseAction = new SendResponseAction(
      this._actionId++,
      requestRecord,
      this._timeoutCallback,
      this._completeCallback,
      this._sendCallback,
      this._resolveMessageGenerator(message),
      timeout
    );

    this._registerActionAction(action);
    return action.sendResponseRecord();
  }

  start(): void {
    if (this._mockSocketServer !== undefined) {
      throw new Error("MockConvergenceServer already started");
    }

    this._mockSocketServer = new mockSocket.Server(this._url);
    this._mockSocketServer.on("connection", (server: any, ws: any) => {
      console.log("Client connected to mock server");
      this._flushSendsAndWait();
      server.on("message", (message: string) => {
        // this is needed to keep everything properly async.
        setTimeout(
          () => {
            this._handleMessage(message);
          },
          0);
      });

      server.on("close", (code: number, reason: string) => {
        console.log("Mock Server connection closed");
      });
    });
  }

  stop(): void {
    this._mockSocketServer.close();
    this._mockSocketServer = undefined;

    this._actionQueue.forEach((action: MockServerAction) => {
      action.complete();
    });

    this._reqId = 0;
    this._actionId = 0;
    this._actionQueue = [];
    this._actions = [];
    this._timeoutQueue = [];
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

    var requestRecord: IReceiveRequestRecord = this.expectRequest(
      {
        t: MessageType.HANDSHAKE_REQUEST,
        r: false
      },
      timeout);
    this.sendReplyTo(requestRecord, response);
  }

  tokenAuth(token: string, response?: any, timeout?: number): void {
    if (response === undefined) {
      response = {
        s: true,
        u: "userId",
        t: MessageType.AUTHENTICATE_RESPONSE
      };
    }
    var requestRecord: IReceiveRequestRecord = this.expectRequest(
      {
        t: MessageType.TOKEN_AUTH_REQUEST,
        k: token
      },
      timeout);
    this.sendReplyTo(requestRecord, response);
  }

  private _registerActionAction(action: MockServerAction): void {
    this._actionQueue.push(action);
    this._actions.push(action);
    if (action.timeout() !== undefined) {
      this._timeoutQueue.push(action);
    }
  }

  private _resolveMessageGenerator(message: any): () => any {
    var messageGenerator: () => any;
    if (typeof message !== "function") {
      messageGenerator = () => {
        return message;
      };
    } else {
      messageGenerator = message;
    }
    return messageGenerator;
  }

  private _handleMessage(json: string): void {
    var envelope: any = JSON.parse(json);
    if (envelope.b.t === MessageType.PING) {
      this._mockSocketServer.sendText(JSON.stringify({b: {t: MessageType.PONG}}));
    } else {
      console.log("Server Receive: " + json);

      if (this._currentReceiveAction === undefined) {
        this._doneManager.testFailure(new Error("Received a message, but was not expecting one"));
      }

      var action: AbstractReceiveAction = this._currentReceiveAction;
      this._currentReceiveAction = undefined;

      var success: boolean = action.processMessage(envelope, this._doneManager);
      if (success) {
        this._flushSendsAndWait();
      }
    }
  }

  private _flushSendsAndWait(): void {
    while (this._actionQueue.length > 0 && this._actionQueue[0] instanceof AbstractSendAction) {
      var sendAction: AbstractSendAction = <AbstractSendAction>this._actionQueue.shift();
      sendAction.execute();
    }

    if (this._actionQueue.length > 0) {
      this._currentReceiveAction = <AbstractReceiveAction> this._actionQueue.shift();
      this._currentReceiveAction.execute();
    }

    this._checkDone();
  }

  private _checkDone(): void {
    if (this._timeoutQueue.length === 0 && this._actionQueue.length === 0) {
      this._doneManager.serverDone();
    }
  }

  private _send(envelope: any): void {
    var json: string = JSON.stringify(envelope);
    console.log("Server Sending: " + json);
    this._mockSocketServer.send(json);
  }
}

export enum DoneType {
  MOCHA, CALLBACK
}

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
}

export type SuccessCallback = () => void;
export type FailureCallback = (e: any) => void;

export type SendCallback = (envelope: any) => void;
export type TimeoutCallback = (message: string) => void;
export type CompleteCallback = (action: MockServerAction) => void;
