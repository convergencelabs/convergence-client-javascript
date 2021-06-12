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

import {
  IProtocolConnectionErrorEvent,
  IProtocolConnectionMessageEvent,
  ProtocolConnection,
  ReplyCallback
} from "./ProtocolConnection";
import ConvergenceSocket from "./ConvergenceSocket";
import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceDomain} from "../ConvergenceDomain";
import {Deferred} from "../util/Deferred";
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util";
import {Observable, Subscription} from "rxjs";
import {filter} from "rxjs/operators";
import {getOrDefaultBoolean, getOrDefaultObject, getOrDefaultString, toOptional} from "./ProtocolUtil";
import {toDomainUser} from "../identity/IdentityMessageUtils";
import {ConvergenceOptions} from "../ConvergenceOptions";
import {IUsernameAndPassword} from "../IUsernameAndPassword";
import {ConvergenceErrorCodes} from "../util/ConvergenceErrorCodes";
import {TypeChecker} from "../util/TypeChecker";
import {FallbackAuthCoordinator} from "./FallbackAuthCoordinator";
import {Logging} from "../util/log/Logging";
import {Logger} from "../util/log/Logger";
import {AuthenticationMethod, AuthenticationMethods} from "./AuthenticationMethod";

import {com} from "@convergence/convergence-proto";
import {RandomStringGenerator} from "../util/RandomStringGenerator";
import {Validation} from "../util/Validation";
import IConvergenceMessage =
    com.convergencelabs.convergence.proto.IConvergenceMessage;
import IPasswordAuthRequestData =
    com.convergencelabs.convergence.proto.core.ConnectionRequestMessage.IPasswordAuthRequestData;
import IJwtAuthRequestData =
    com.convergencelabs.convergence.proto.core.ConnectionRequestMessage.IJwtAuthRequestData;
import IReconnectTokenAuthRequestData =
    com.convergencelabs.convergence.proto.core.ConnectionRequestMessage.IReconnectTokenAuthRequestData;
import IAnonymousAuthRequestData =
    com.convergencelabs.convergence.proto.core.ConnectionRequestMessage.IAnonymousAuthRequestData;
import IConnectionRequestMessage = com.convergencelabs.convergence.proto.core.IConnectionRequestMessage;
import IConnectionResponseMessage = com.convergencelabs.convergence.proto.core.IConnectionResponseMessage;
import IConnectionSuccessData = com.convergencelabs.convergence.proto.core.ConnectionResponseMessage.IConnectionSuccessData;
import IConnectionFailureData = com.convergencelabs.convergence.proto.core.ConnectionResponseMessage.IConnectionFailureData;

/**
 * @hidden
 * @internal
 */
export class ConvergenceConnection extends ConvergenceEventEmitter<IConnectionEvent> {

  public static Events: any = {
    MESSAGE: "message",

    CONNECTION_SCHEDULED: "connection_scheduled",
    CONNECTING: "connecting",
    AUTHENTICATING: "authenticating",
    CONNECTED: "connected",
    CONNECTION_FAILED: "connection_failed",

    INTERRUPTED: "interrupted",
    DISCONNECTED: "disconnected",
    ERROR: "error"
  };

  private static readonly _SessionIdGenerator = new RandomStringGenerator(32, RandomStringGenerator.AlphaNumeric);

  private readonly _options: ConvergenceOptions;
  private readonly _session: ConvergenceSession;
  private readonly _logger: Logger = Logging.logger("connection");
  private readonly _url: string;

  private _connectionDeferred: Deferred<void>;
  private _connectionAttempts: number;
  private _connectionAttemptTask: any;
  private _connectionTimeoutTask: any;
  private _initialConnection: boolean;
  private _connectionRequestGenerator: (() => Promise<IConnectionRequestMessage>) | null;
  private _authMethod: AuthenticationMethod | null;
  private _connectionState: ConnectionState;
  private _protocolConnection: ProtocolConnection | null;

  private _namespace: string;
  private _domainId: string;
  private _protocolConnectionSubscription: Subscription | null;

  constructor(url: string, domain: ConvergenceDomain, options: ConvergenceOptions) {
    super();

    this._url = url.trim().toLowerCase();
    const urlExpression = /^(https?|wss?):\/{2}.+\/.+\/.+/g;

    if (!urlExpression.test(this._url)) {
      throw new Error(`Invalid domain connection url: ${this._url}`);
    }

    this._options = options;

    this._url = url;

    this._connectionAttempts = 0;
    this._connectionState = ConnectionState.DISCONNECTED;
    this._connectionTimeoutTask = null;
    this._connectionAttemptTask = null;
    this._initialConnection = true;
    this._protocolConnection = null;
    this._protocolConnectionSubscription = null;
    this._connectionRequestGenerator = null;
    this._authMethod = null;

    const initialSessionId = "offline:" + ConvergenceConnection._SessionIdGenerator.nextString();
    this._session = new ConvergenceSession(domain, this, null, initialSessionId, null);

    if (typeof window !== "undefined") {
      window.addEventListener("online", this._onWindowOnline);
    }
  }

  public url(): string {
    return this._url;
  }

  public session(): ConvergenceSession {
    return this._session;
  }

  public disconnect(): Promise<void> {
    this._connectionRequestGenerator = null;
    this._authMethod = null;

    if (this._connectionTimeoutTask !== null) {
      clearTimeout(this._connectionTimeoutTask);
      this._connectionTimeoutTask = null;
    }

    if (this._connectionAttemptTask !== null) {
      clearTimeout(this._connectionAttemptTask);
      this._connectionAttemptTask = null;
    }

    if (this._connectionDeferred !== null) {
      this._connectionDeferred.reject(new Error("Connection canceled by user"));
      this._connectionDeferred = null;
    }

    if (this._connectionState === ConnectionState.DISCONNECTED) {
      return Promise.reject(new Error("Connection is already disconnected."));
    } else {
      this._connectionState = ConnectionState.DISCONNECTING;
      this._initialConnection = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("online", this._onWindowOnline);
      }

      return this._protocolConnection.close().then(() => {
        this._protocolConnectionSubscription.unsubscribe();
        this._protocolConnection = null;
        this._protocolConnectionSubscription = null;
        this._handleDisconnected();
      });
    }
  }

  public reconnect(): Promise<void> {
    if (this._connectionState !== ConnectionState.INTERRUPTED &&
        this._connectionState !== ConnectionState.DISCONNECTED) {
      throw new Error("Can only call reconnect on an disconnected or interrupted connection.");
    }

    return this.connectWithReconnectToken(() => Promise.resolve(this._session.reconnectToken()))
        .then(() => undefined);
  }

  public isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }

  public isDisconnected(): boolean {
    return this._connectionState === ConnectionState.DISCONNECTED;
  }

  public send(message: IConvergenceMessage): void {
    this._protocolConnection.send(message);
  }

  public request(message: IConvergenceMessage, timeout?: number): Promise<IConvergenceMessage> {
    return this._protocolConnection.request(message, timeout);
  }

  public connectWithPassword(credentialsCallback: () => Promise<IUsernameAndPassword>): Promise<void> {
    this._authMethod = AuthenticationMethods.PASSWORD;
    const requestGenerator = () => {
      return credentialsCallback().then(credentials => {
        Validation.assertNonEmptyString(credentials.username, "username");
        Validation.assertNonEmptyString(credentials.password, "password");

        const password: IPasswordAuthRequestData = {
          username: credentials.username,
          password: credentials.password
        };
        return {password};
      });
    };

    return this._connect(requestGenerator);
  }

  public connectWithJwt(jwtCallback: () => Promise<string>): Promise<void> {
    this._authMethod = AuthenticationMethods.JWT;
    const requestGenerator = () => {
      return jwtCallback().then(token => {
        Validation.assertNonEmptyString(token, "jwt");
        const jwt: IJwtAuthRequestData = {jwt: token};
        return {jwt};
      });
    };
    return this._connect(requestGenerator);
  }

  public connectWithReconnectToken(tokenCallback: () => Promise<string>): Promise<void> {
    this._authMethod = AuthenticationMethods.RECONNECT;
    const requestGenerator = () => {
      return tokenCallback().then(token => {
        Validation.assertNonEmptyString(token, "token");
        const message: IReconnectTokenAuthRequestData = {token};
        return {reconnect: message};
      });
    };

    return this._connect(requestGenerator)
        .catch((e) => this._handleReconnectFailure(e))
  }

  private _handleReconnectFailure(e) {
    if (e instanceof ConvergenceError && e.code === ConvergenceErrorCodes.AUTHENTICATION_FAILED) {
      if (TypeChecker.isFunction(this._options.fallbackAuth)) {
        const authCoordinator = new FallbackAuthCoordinator();

        this._options.fallbackAuth(authCoordinator.challenge());
        if (!authCoordinator.isCompleted()) {
          return Promise.reject(new Error("You must call one of the auth challenge methods."));
        }

        authCoordinator.fulfilled().then(() => {
          if (authCoordinator.isPassword()) {
            const username = this.session().user().username;
            const password = authCoordinator.getPassword();
            return this.connectWithPassword(() => Promise.resolve({username, password}));
          } else if (authCoordinator.isJwt()) {
            return this.connectWithJwt(() => Promise.resolve(authCoordinator.getJwt()));
          } else if (authCoordinator.isAnonymous()) {
            return this.connectAnonymously(() => Promise.resolve(authCoordinator.getDisplayName()));
          } else if (authCoordinator.isCanceled()) {
            return Promise.reject(e);
          } else {
            return Promise.reject(e);
          }
        });
      } else {
        return Promise.resolve(e);
      }
    } else {
      return Promise.resolve(e);
    }
  }

  public connectAnonymously(displayNameCallback: () => Promise<string | undefined>): Promise<void> {
    this._authMethod = AuthenticationMethods.ANONYMOUS;
    const requestGenerator = () => {
      return displayNameCallback().then(displayName => {
        const message: IAnonymousAuthRequestData = {
          displayName: toOptional(displayName)
        };
        return {anonymous: message}
      });
    }

    return this._connect(requestGenerator)
  }

  public messages(): Observable<MessageEvent> {
    return this
        .events()
        .pipe(filter(e => e.name === "message")) as Observable<MessageEvent>;
  }

  private _connect(gen: () => Promise<IConnectionRequestMessage>): Promise<void> {
    this._connectionRequestGenerator = gen;
    if (this._connectionState === ConnectionState.CONNECTED) {
      return Promise.reject<void>(new ConvergenceError("already connected"));
    } else if (this._connectionState === ConnectionState.CONNECTING) {
      return Promise.reject<void>(new ConvergenceError("already connecting"));
    } else {
      // We are connected already so we can just send the request.
      return this._connectToServer();
    }
  }

  private _connectToServer(): Promise<void> {
    if (this._connectionState !== ConnectionState.DISCONNECTED &&
        this._connectionState !== ConnectionState.INTERRUPTED) {
      throw new Error("Can only call connect on a disconnected or interrupted connection.");
    }

    this._connectionAttempts = 0;
    this._connectionDeferred = new Deferred<void>();
    this._connectionState = ConnectionState.CONNECTING;

    this._attemptConnection();

    return this._connectionDeferred.promise();
  }

  private _attemptConnection(): void {
    if (this._connectionAttemptTask !== null) {
      clearTimeout(this._connectionAttemptTask);
      this._connectionAttemptTask = null;
    }

    this._connectionAttempts++;
    this._logger.debug(() => `Attempting to open web socket connection to: ${this._url}`);

    this._scheduleConnectionTimeout();

    this._emitEvent({name: ConvergenceConnection.Events.CONNECTING});

    this._protocolConnection = this._createProtocolConnection();

    this._openConnection();
  }

  private _openConnection() {
    this._protocolConnection
        .connect()
        .then(() => {
          this._clearConnectionTimeout();
          this._logger.debug("Server connection established.");

          this._initialConnection = false;

          return this._sendConnectionRequest();
        })
        .catch((e: Error) => {
          this._logger.debug(e.message);
          this._clearConnectionTimeout();

          const failedEvent: IConnectionFailedEvent = {
            name: ConvergenceConnection.Events.CONNECTION_FAILED,
            authMethod: this._authMethod,
            code: "server_connection_failed",
            details: e.message
          };
          this._emitEvent(failedEvent);
          if (!this._initialConnection || this._options.autoReconnectOnInitial) {
            this._scheduleConnection();
          } else {
            const message =
                `The initial connection to '${this._url}' failed, and 'reconnect.autoReconnectOnInitial' was set to false`;
            this._connectionDeferred.reject(new ConvergenceError(message, "initial_connection_failed"));
            this._handleDisconnected();
          }
        });
  }

  private _createProtocolConnection(): ProtocolConnection {
    const socket: ConvergenceSocket = new ConvergenceSocket(
        this._url,
        this._options.webSocketClass,
        this._options.webSocketFactory);

    const protocolConnection = new ProtocolConnection(
        socket,
        {
          defaultRequestTimeout: this._options.defaultRequestTimeout,
          heartbeatConfig: {
            enabled: this._options.heartbeatEnabled,
            pingInterval: this._options.pingInterval,
            pongTimeout: this._options.pongTimeout
          }
        });

    this._protocolConnectionSubscription = protocolConnection
        .events()
        .subscribe(e => {
          switch (e.name) {
            case ProtocolConnection.Events.ERROR: {
              const errorEvent = e as IProtocolConnectionErrorEvent;
              const event: IConnectionErrorEvent = {name: ConvergenceConnection.Events.ERROR, error: errorEvent.error};
              this._emitEvent(event);
              break;
            }

            case ProtocolConnection.Events.DROPPED: {
              this._handleInterrupted();
              break;
            }

            case ProtocolConnection.Events.CLOSED: {
              this._handleDisconnected();
              break;
            }

            case ProtocolConnection.Events.MESSAGE: {
              const messageEvent = e as IProtocolConnectionMessageEvent;
              const event: MessageEvent = {
                name: ConvergenceConnection.Events.MESSAGE,
                request: messageEvent.request,
                callback: messageEvent.callback,
                message: messageEvent.message
              };
              this._emitEvent(event);
              break;
            }
          }
        });

    return protocolConnection;
  }

  private async _sendConnectionRequest(): Promise<void> {
    const partialRequest = await this._connectionRequestGenerator();
    const connectionRequest = ConvergenceConnection._createConnectionRequest(partialRequest);

    const authenticatingEvent: IAuthenticatingEvent = {
      name: ConvergenceConnection.Events.AUTHENTICATING,
      method: this._authMethod
    };
    this._emitEvent(authenticatingEvent);

    const response: IConvergenceMessage = await this.request({connectionRequest})

    const connectionResponse: IConnectionResponseMessage = response.connectionResponse;
    if (connectionResponse.success) {
      return this._handleConnectionSuccess(connectionResponse.success)
    } else {
      return this._handleConnectionFailure(connectionResponse.failure, this._authMethod)
    }
  }

  private _handleConnectionSuccess(connectionSuccessData: IConnectionSuccessData): void {
    this._domainId = connectionSuccessData.domainId;
    this._namespace = connectionSuccessData.namespace;
    this._session._setUser(toDomainUser(connectionSuccessData.user));
    this._session._setSessionId(connectionSuccessData.sessionId);
    this._session._setReconnectToken(connectionSuccessData.reconnectToken);

    this._connectionState = ConnectionState.CONNECTED;

    const connectedEvent: IConnectedEvent = {
      name: ConvergenceConnection.Events.CONNECTED,
      state: getOrDefaultObject(connectionSuccessData.presenceState)
    };
    this._emitEvent(connectedEvent);

    this._connectionDeferred.resolve();
    this._connectionDeferred = null;

    // We reset the connection attempts to 0, so that when we get dropped
    // we will start with the first interval.
    this._connectionAttempts = 0;
  }

  private _handleConnectionFailure(failureData: IConnectionFailureData, method: AuthenticationMethod): void {
    this._clearConnectionTimeout();

    const {code, details, retryOk} = failureData;

    const connectionFailedEvent: IConnectionFailedEvent = {
      name: ConvergenceConnection.Events.CONNECTION_FAILED,
      authMethod: method,
      code: getOrDefaultString(code),
      details: getOrDefaultString(details)
    };
    this._emitEvent(connectionFailedEvent);

    this._protocolConnectionSubscription.unsubscribe();
    this._protocolConnection.close()
        .catch(e => this._logger.error("Error closing protocol connection after connection failure", e));

    this._protocolConnection = null;
    this._protocolConnectionSubscription = null;

    if (!getOrDefaultBoolean(retryOk)) {
      this._connectionDeferred.reject(new ConvergenceError(getOrDefaultString(details), getOrDefaultString(code)));
      this._handleDisconnected();
    } else if (!this._initialConnection || this._options.autoReconnectOnInitial) {
      this._scheduleConnection();
    } else {
      this._connectionRequestGenerator = null;
      this._authMethod = null;
      const message =
          `The initial connection to '${this._url}' failed, and 'reconnect.autoReconnectOnInitial' was set to false.`;
      this._connectionDeferred.reject(new ConvergenceError(message, getOrDefaultString(code)));
      this._handleDisconnected();
    }
  }

  private _onWindowOnline = (_: Event) => {
    this._logger.debug(() => `Browser connectivity changed, restarting connection schedule.`);

    if (this._connectionState === ConnectionState.CONNECTING) {
      this._connectionAttempts = 0;
      this._attemptConnection();
    }
  };

  private _scheduleConnectionTimeout = () => {
    // Clear any previous timout
    this._clearConnectionTimeout();
    const timeout = this._options.connectionTimeout * 1000;
    this._connectionTimeoutTask = setTimeout(this._onConnectionTimeout, timeout);
  };

  private _clearConnectionTimeout = () => {
    if (this._connectionTimeoutTask !== null) {
      clearTimeout(this._connectionTimeoutTask);
      this._connectionTimeoutTask = null;
    }
  };

  private _onConnectionTimeout = () => {
    this._protocolConnection
        .abort("connection timeout exceeded")
        .catch(e => this._logger.error("error aborting connection after a connection timeout", e));
  };

  private static _createConnectionRequest(partial: IConnectionRequestMessage): IConnectionRequestMessage {
    return {
      ...partial,
      client: "JavaScript",
      clientVersion: "CONVERGENCE_CLIENT_VERSION"
    }
  }

  private _scheduleConnection(): void {
    if (this._connectionState === ConnectionState.CONNECTING) {
      const idx = Math.min(this._connectionAttempts, this._options.reconnectIntervals.length - 1);
      const delay = this._options.reconnectIntervals[idx];
      this._logger.debug(() => `Scheduling web socket connection in ${delay} seconds.`);
      const event: IConnectionScheduledEvent = {name: ConvergenceConnection.Events.CONNECTION_SCHEDULED, delay};
      this._emitEvent(event);

      this._connectionAttemptTask = setTimeout(() => this._attemptConnection(), delay * 1000);
    }
  }

  private _handleDisconnected(): void {
    console.error("_handleDisconnected");
    if (this._connectionState !== ConnectionState.DISCONNECTED) {
      this._connectionState = ConnectionState.DISCONNECTED;
      this._emitEvent({name: ConvergenceConnection.Events.DISCONNECTED});
    }
  }

  private _handleInterrupted(): void {
    this._connectionState = ConnectionState.INTERRUPTED;
    this._emitEvent({name: ConvergenceConnection.Events.INTERRUPTED});
    if (this._options.autoReconnect && this._session.reconnectToken()) {
      this
          .reconnect()
          .catch(e => this._logger.error("Unexpected error reconnecting", e));
    }
  }
}

/**
 * @hidden
 * @internal
 */
export interface IConnectionEvent extends IConvergenceEvent {

}

/**
 * @hidden
 * @internal
 */
export interface IConnectionErrorEvent extends IConnectionEvent {
  name: "error";
  error: Error;
}

/**
 * @hidden
 * @internal
 */
export interface IAuthenticatingEvent extends IConnectionEvent {
  name: "authenticating";
  method: AuthenticationMethod;
}

/**
 * @hidden
 * @internal
 */
export interface IConnectedEvent extends IConnectionEvent {
  name: "connected";
  state: { [key: string]: any };
}

/**
 * @hidden
 * @internal
 */
export interface IConnectionFailedEvent extends IConnectionEvent {
  name: "connection_failed";
  authMethod: AuthenticationMethod;
  code: string;
  details?: string;
}

/**
 * @hidden
 * @internal
 */
export interface IConnectionScheduledEvent extends IConnectionEvent {
  name: "connection_scheduled";
  delay: number;
}

/**
 * @hidden
 * @internal
 */
export interface MessageEvent extends IConnectionEvent {
  name: "message";
  message: IConvergenceMessage; // Model Message??
  request: boolean;
  callback?: ReplyCallback;
}

/**
 * @hidden
 * @internal
 */
enum ConnectionState {
  DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
}
