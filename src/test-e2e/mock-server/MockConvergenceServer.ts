import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import AbstractReceiveAction from "./AbstractReceiveAction";
import AbstractSendAction from "./AbstractSendAction";
import MockServerAction from "./MockServerAction";
import SendResponseAction from "./SendResponseAction";
import {SendRequestAction} from "./SendRequestAction";
import {
  IReceiveResponseRecord,
  IReceiveRequestRecord,
  IReceiveRecord,
  ISendRecord,
  ISendRequestRecord,
  ISendResponseRecord
} from "./records";
import SendAction from "./SendAction";
import ReceiveResponseAction from "./ReceiveResponseAction";

import ReceiveRequestAction from "./ReceiveRequestAction";
import ReceiveAction from "./ReceiveAction";
import {AbstractDoneManager, CallbackDoneManager, IDoneManager, MochaDoneManager} from "./doneManager";
import { WebSocket, Server } from "mock-socket";


/* tslint:disable */
// This block of code is necessary to enable the mock socket framework in
// node.
declare var global: any;
if (typeof global['WebSocket'] === "undefined") {
  global['WebSocket'] = WebSocket;
}
/* tslint:enable */

/**
 * This is the main mock server class.
 */
export class MockConvergenceServer {
  private _url: string;
  private _doneManager: AbstractDoneManager;

  private _mockSocketServer: Server;
  private _serverSocket: WebSocket;

  private _actionId: number;
  private _actions: MockServerAction[];
  private _actionQueue: MockServerAction[];
  private _timeoutQueue: MockServerAction[];

  private _reqId: number;

  private _sendCallback: SendCallback;
  private _timeoutCallback: TimeoutCallback;
  private _completeCallback: CompleteCallback;

  private _currentReceiveAction: AbstractReceiveAction;

  private _debugging: boolean = false;

  constructor(options: IMockServerOptions) {
    this._url = options.url;

    this._debugging = options.debugging || false;

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
      const index: number = this._timeoutQueue.indexOf(action);
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
  public url(): string {
    return this._url;
  }

  /**
   * Returns the done manager that tests should use to inform the mock server of
   * success or failure.
   * @returns {IDoneManager}
   */
  public doneManager(): IDoneManager {
    return this._doneManager;
  }

  public expect(body: any, timeout?: number): IReceiveRecord {
    const action: ReceiveAction = new ReceiveAction(
      this._actionId++,
      this._timeoutCallback,
      this._completeCallback,
      this._resolveMessageGenerator(body),
      timeout
    );

    this._registerAction(action);
    return action.record();
  }

  public expectRequest(body: any, timeout?: number): IReceiveRequestRecord {
    const action: ReceiveRequestAction = new ReceiveRequestAction(
      this._actionId++,
      this._timeoutCallback,
      this._completeCallback,
      this._resolveMessageGenerator(body),
      timeout
    );

    this._registerAction(action);
    return action.requestRecord();
  }

  public expectResponseTo(requestRecord: ISendRequestRecord, body: any, timeout?: number): IReceiveResponseRecord {
    const action: ReceiveResponseAction = new ReceiveResponseAction(
      this._actionId++,
      requestRecord,
      this._timeoutCallback,
      this._completeCallback,
      this._resolveMessageGenerator(body),
      timeout
    );

    this._registerAction(action);
    return action.responseRecord();
  }

  public send(message: any, timeout?: number): ISendRecord {
    const action: SendAction = new SendAction(
      this._actionId++,
      this._timeoutCallback,
      this._completeCallback,
      this._sendCallback,
      this._resolveMessageGenerator(message),
      timeout
    );

    this._registerAction(action);
    return action.sendRecord();
  }

  public sendRequest(message: any, timeout?: number): ISendRequestRecord {
    const action: SendRequestAction = new SendRequestAction(
      this._actionId++,
      this._reqId++,
      this._timeoutCallback,
      this._completeCallback,
      this._sendCallback,
      this._resolveMessageGenerator(message),
      timeout
    );

    this._registerAction(action);
    return action.sendRequestRecord();
  }

  public sendReplyTo(requestRecord: IReceiveRequestRecord, message: any, timeout?: number): ISendResponseRecord {
    const action: SendResponseAction = new SendResponseAction(
      this._actionId++,
      requestRecord,
      this._timeoutCallback,
      this._completeCallback,
      this._sendCallback,
      this._resolveMessageGenerator(message),
      timeout
    );

    this._registerAction(action);
    return action.sendResponseRecord();
  }

  public start(): void {
    if (this._mockSocketServer !== undefined) {
      throw new Error("MockConvergenceServer already started");
    }

    this._mockSocketServer = new Server(this._url);
    this._mockSocketServer.on("connection", (socket: any) => {
      this._serverSocket = socket;
      this._debug("Client connected to mock server");
      this._flushSendsAndWait();
      socket.on("message", (message: string) => {
        // this is needed to keep everything properly async.
        setTimeout(
          () => {
            this._handleMessage(message);
          },
          0);
      });

      socket.on("close", (code: number, reason: string) => {
        this._debug("Mock Server connection closed");
      });
    });
  }

  public stop(): void {
    if (this._mockSocketServer !== undefined) {
      this._mockSocketServer.close({code: 1000, reason: "", wasClean: true});
      this._mockSocketServer = undefined;
      this._serverSocket = undefined;

      this._actionQueue.forEach((action: MockServerAction) => {
        action.complete();
      });

      this._reqId = 0;
      this._actionId = 0;
      this._actionQueue = [];
      this._actions = [];
      this._timeoutQueue = [];
    }
  }

  public handshake(response?: any, timeout?: number): void {
    if (response === undefined) {
      response = {
        s: true,
        i: "1",
        k: "s",
        c: {},
        t: MessageType.HANDSHAKE_RESPONSE
      };
    }

    const requestRecord: IReceiveRequestRecord = this.expectRequest(
      {
        t: MessageType.HANDSHAKE_REQUEST,
        r: false
      },
      timeout);
    this.sendReplyTo(requestRecord, response);
  }

  public tokenAuth(token: string, response?: any, timeout?: number): void {
    if (response === undefined) {
      response = {
        s: true,
        u: "userId",
        t: MessageType.AUTHENTICATE_RESPONSE,
        p: []
      };
    }
    const requestRecord: IReceiveRequestRecord = this.expectRequest(
      {
        t: MessageType.TOKEN_AUTH_REQUEST,
        k: token
      },
      timeout);
    this.sendReplyTo(requestRecord, response);
  }

  private _registerAction(action: MockServerAction): void {
    this._actionQueue.push(action);
    this._actions.push(action);
    if (action.timeout() !== undefined) {
      this._timeoutQueue.push(action);
    }
  }

  private _resolveMessageGenerator(message: any): () => any {
    let messageGenerator: () => any;
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
    const envelope: any = JSON.parse(json);
    if (envelope.b.t === MessageType.PING) {
      this._serverSocket.send(JSON.stringify({b: {t: MessageType.PONG}}));
    } else {
      this._debug("Server Receive: " + json);

      if (this._currentReceiveAction === undefined) {
        this._doneManager.testFailure(new Error("Received a message, but was not expecting one"));
      }

      const action: AbstractReceiveAction = this._currentReceiveAction;
      this._currentReceiveAction = undefined;

      const success: boolean = action.processMessage(envelope, this._doneManager);
      if (success) {
        this._flushSendsAndWait();
      }
    }
  }

  private _flushSendsAndWait(): void {
    while (this._actionQueue.length > 0 && this._actionQueue[0] instanceof AbstractSendAction) {
      const sendAction: AbstractSendAction = this._actionQueue.shift() as AbstractSendAction;
      sendAction.execute();
    }

    if (this._actionQueue.length > 0) {
      this._currentReceiveAction = this._actionQueue.shift() as AbstractReceiveAction;
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
    const json: string = JSON.stringify(envelope);
    this._debug("Server Sending: " + json);
    this._serverSocket.send(json);
  }

  private _debug(msg: string): void {
    if (this._debugging) {
      console.log(msg);
    }
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

  debugging?: boolean;
}

export type SuccessCallback = () => void;
export type FailureCallback = (e: any) => void;

export type SendCallback = (envelope: any) => void;
export type TimeoutCallback = (message: string) => void;
export type CompleteCallback = (action: MockServerAction) => void;
