import {HandshakeResponse} from "../protocol/handhsake";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {ProtocolConnection} from "./ProtocolConnection";
import Debug from "../Debug";
import ConvergenceSocket from "./ConvergenceSocket";
import {OutgoingProtocolMessage} from "../protocol/protocol";
import {OutgoingProtocolRequestMessage} from "../protocol/protocol";
import {IncomingProtocolResponseMessage} from "../protocol/protocol";
import EventEmitter from "../util/EventEmitter";
import SessionImpl from "../SessionImpl";
import ConvergenceDomain from "../ConvergenceDomain";
import Session from "../Session";
import {PasswordAuthRequest} from "../protocol/authentication";
import MessageType from "../protocol/MessageType";
import {TokenAuthRequest} from "../protocol/authentication";
import {AuthRequest} from "../protocol/authentication";
import {AuthenticationResponseMessage} from "../protocol/authentication";
import Deferred from "../util/Deferred";

export default class ConvergenceConnection extends EventEmitter {

  static Events: any = {
    CONNECTED: "connected",
    INTERRUPTED: "interrupted",
    RECONNECTED: "reconnected",
    DISCONNECTED: "disconnected",
    ERROR: "error"
  };

  private _session: SessionImpl;
  private _connectionDeferred: Deferred<HandshakeResponse>;
  private _connectionTimeout: number;  // seconds
  private _maxReconnectAttempts: number;
  private _connectionAttempts: number;
  private _connectionAttemptTask: number;
  private _connectionTimeoutTask: number;
  private _reconnectInterval: number; // seconds
  private _retryOnOpen: boolean;

  private _protocolConfig: ProtocolConfiguration;

  private _clientId: string;
  private _reconnectToken: string;

  private _connectionState: ConnectionState;

  private _protocolConnection: ProtocolConnection;
  private _url: string;

  /**
   *
   * @param url
   * @param connectionTimeout in seconds
   * @param maxReconnectAttempts -1 for unlimited
   * @param reconnectInterval in seconds
   * @param retryOnOpen
   */
  constructor(url: string,
              connectionTimeout: number,
              maxReconnectAttempts: number,
              reconnectInterval: number,
              retryOnOpen: boolean,
              domain: ConvergenceDomain) {
    super();
    this._url = url;

    this._connectionTimeout = connectionTimeout;
    this._maxReconnectAttempts = maxReconnectAttempts;
    this._reconnectInterval = reconnectInterval;
    this._retryOnOpen = retryOnOpen;

    this._connectionAttempts = 0;
    this._connectionState = ConnectionState.DISCONNECTED;

    // fixme
    this._protocolConfig = {
      defaultRequestTimeout: 1000,
      heartbeatConfig: {
        enabled: true,
        pingInterval: 5000,
        pongTimeout: 10000
      }
    };

    this._session = new SessionImpl(domain, this, null, null);
  }

  session(): Session {
    return this._session;
  }

  connect(): Promise<HandshakeResponse> {
    if (this._connectionState !== ConnectionState.DISCONNECTED) {
      throw new Error("Can only call connect on a disconnected connection.");
    }

    this._connectionAttempts = 0;
    this._connectionDeferred = new Deferred<HandshakeResponse>();
    this._connectionState = ConnectionState.CONNECTING;

    this.attemptConnection(false);

    return this._connectionDeferred.promise();
  }

  reconnect(): void {
    this._connectionAttempts = 0;
    this._connectionDeferred = new Deferred<HandshakeResponse>();
    this.attemptConnection(true);
  }

  private attemptConnection(reconnect: boolean): void {
    var self: ConvergenceConnection = this;

    this._connectionAttempts++;

    if (reconnect) {
      if (Debug.flags.serverConnection) {
        console.log("Attempting reconnection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
      }
    } else {
      if (Debug.flags.serverConnection) {
        console.log("Attempting connection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
      }
    }

    var timeoutTask: Function = function (): void {
      console.log("connection timeout exceeded, terminating connection");
      self._protocolConnection.abort("connection timeout exceeded");
    };

    this._connectionTimeoutTask = setTimeout(timeoutTask, this._connectionTimeout * 1000);

    var socket: ConvergenceSocket = new ConvergenceSocket(this._url);
    this._protocolConnection = new ProtocolConnection(
      socket,
      this._protocolConfig);

    this._protocolConnection.on(ProtocolConnection.Events.ERROR, (error: string) =>
      this.emit(ConvergenceConnection.Events.ERROR, error));

    this._protocolConnection.on(ProtocolConnection.Events.DROPPED, () =>
      this.emit(ConvergenceConnection.Events.INTERRUPTED));

    this._protocolConnection.on(ProtocolConnection.Events.CLOSED, () =>
      this.emit(ConvergenceConnection.Events.DISCONNECTED));

    this._protocolConnection.on(ProtocolConnection.Events.MESSAGE, (message: any) =>
      this.emit(ConvergenceConnection.Events.MESSAGE, message));

    this._protocolConnection.connect().then(() => {
      if (Debug.flags.connection) {
        console.log("Connection succeeded, handshaking.");
      }

      self._protocolConnection.handshake(reconnect).then((handshakeResponse: HandshakeResponse) => {
        clearTimeout(self._connectionTimeoutTask);
        if (handshakeResponse.success) {
          self._connectionDeferred.resolve(handshakeResponse);
          self._connectionDeferred = null;
          self._clientId = handshakeResponse.clientId;
          self._session.setSessionId(handshakeResponse.clientId);
          self._reconnectToken = handshakeResponse.reconnectToken;
          if (reconnect) {
            self.emit(ConvergenceConnection.Events.RECONNECTED);
          } else {
            self.emit(ConvergenceConnection.Events.CONNECTED);
          }
        } else {
          // todo: Can we reuse this connection???
          self._protocolConnection.close();
          if ((reconnect || self._retryOnOpen) && handshakeResponse.retryOk) {
            // todo if this is a timeout, we would like to shorten
            // the reconnect interval by the timeout period.
            self.scheduleReconnect(self._reconnectInterval, reconnect);
          } else {
            self.emit(ConvergenceConnection.Events.DISCONNECTED);
            self._connectionDeferred.reject(new Error("Server rejected handshake request."));
            self._connectionDeferred = null;
          }
        }
      }).catch((e: Error) => {
        console.error("Handshake failed: ", e);
        self._protocolConnection.close();
        self._protocolConnection = null;
        self._connectionDeferred = null;
        clearTimeout(self._connectionTimeoutTask);
        self.scheduleReconnect(self._reconnectInterval, reconnect);
        self.emit(ConvergenceConnection.Events.DISCONNECTED);
      });
    }).catch((reason: Error) => {
      console.log("Connection failed: " + reason);
      clearTimeout(self._connectionTimeoutTask);
      if (reconnect || self._retryOnOpen) {
        self.scheduleReconnect(Math.max(self._reconnectInterval, 0), reconnect);
      } else {
        self._connectionDeferred.reject(reason);
        self._connectionDeferred = null;
        self.emit(ConvergenceConnection.Events.DISCONNECTED);
      }
    });
  }

  private scheduleReconnect(delay: number, reconnect: boolean): void {
    if (this._connectionAttempts < this._maxReconnectAttempts || this._maxReconnectAttempts < 0) {
      var self: ConvergenceConnection = this;
      var reconnectTask: Function = function (): void {
        self.attemptConnection(reconnect);
      };
      this._connectionAttemptTask = setTimeout(reconnectTask, delay * 1000);
    } else {
      this._connectionDeferred.reject(new Error("Maximum connection attempts exceeded"));
    }
  }

  disconnect(): Promise<void> {
    // todo we might not need this.  refactor.
    var deferred: Deferred<void> = new Deferred<void>();

    if (this._connectionTimeoutTask != null) {
      clearTimeout(this._connectionTimeoutTask);
      this._connectionTimeoutTask = null;
    }

    if (this._connectionAttemptTask != null) {
      clearTimeout(this._connectionAttemptTask);
      this._connectionAttemptTask = null;
    }

    if (this._connectionDeferred != null) {
      this._connectionDeferred.reject(new Error("Connection canceled by user"));
      this._connectionDeferred = null;
    }

    if (this._connectionState === ConnectionState.DISCONNECTED) {
      deferred.reject(new Error("Connection is already disconnected."));
    }

    this._connectionState = ConnectionState.DISCONNECTING;

    return this._protocolConnection.close().then(() => {
      this._connectionState = ConnectionState.DISCONNECTED;
    }).catch((reason: Error) => {
      this._connectionState = ConnectionState.INTERRUPTED;
    });
  }

  isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }

  send(message: OutgoingProtocolMessage): void {
    this._protocolConnection.send(message);
  }

  request(message: OutgoingProtocolRequestMessage): Promise<IncomingProtocolResponseMessage> {
    return this._protocolConnection.request(message);
  }

  /**
   * Authenticates the user with the given username and password.
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @return {Promise} A promise
   */
  authenticateWithPassword(username: string, password: string): Promise<void> {
    var authRequest: PasswordAuthRequest = {
      type: MessageType.AUTHENTICATE,
      method: "password",
      username: username,
      password: password
    };
    return this._authenticate(authRequest);
  }

  /**
   * Authenticates the user with the given username.
   * @param {string} token - The identifier of the participant
   * @return {Promise} A promise
   */
  authenticateWithToken(token: string): Promise<void> {
    var authRequest: TokenAuthRequest = {
      type: MessageType.AUTHENTICATE,
      method: "token",
      token: token
    };
    return this._authenticate(authRequest);
  }

  private _authenticate(authRequest: AuthRequest): Promise<void> {
    if (this._session.isAuthenticated()) {
      // The user is only allowed to authenticate once.
      return Promise.reject<void>(new Error("User already authenticated."));
    } else if (this.isConnected()) {
      // We are connected already so we can just send the request.
      return this._sendAuthRequest(authRequest);
    } else if (this._connectionDeferred != null) {
      var self: ConvergenceConnection = this;
      // We are connecting so defer this until after we connect.
      return this._connectionDeferred.promise().then(function (): Promise<void> {
        return self._sendAuthRequest(authRequest);
      });
    } else {
      // We are not connecting and are not trying to connect.
      return Promise.reject<void>(new Error("Must be connected or connecting to authenticate."));
    }
  }

  private _sendAuthRequest(authRequest: AuthRequest): Promise<void> {
    var self: ConvergenceConnection = this;
    return this.request(authRequest).then(function (response: AuthenticationResponseMessage): void {
      if (response.success === true) {
        self._session.setUsername(response.username);
        self._session.setAuthenticated(true);
        return;
      } else {
        throw new Error("Authentication failed");
      }
    });
  }
}

export enum ConnectionState {
  DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
}
