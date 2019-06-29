import {
  IProtocolConnectionErrorEvent,
  IProtocolConnectionMessageEvent,
  ProtocolConnection,
  ReplyCallback
} from "./ProtocolConnection";
import {debugFlags} from "../Debug";
import ConvergenceSocket from "./ConvergenceSocket";
import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceDomain} from "../ConvergenceDomain";
import {Deferred} from "../util/Deferred";
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util/";
import {Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IHandshakeResponseMessage = io.convergence.proto.IHandshakeResponseMessage;
import IPasswordAuthRequestMessage = io.convergence.proto.IPasswordAuthRequestMessage;
import IAuthenticationRequestMessage = io.convergence.proto.IAuthenticationRequestMessage;
import IJwtAuthRequestMessage = io.convergence.proto.IJwtAuthRequestMessage;
import IReconnectTokenAuthRequestMessage = io.convergence.proto.IReconnectTokenAuthRequestMessage;
import IAnonymousAuthRequestMessage = io.convergence.proto.IAnonymousAuthRequestMessage;
import IAuthenticationResponseMessage = io.convergence.proto.IAuthenticationResponseMessage;
import {toOptional} from "./ProtocolUtil";
import {toDomainUser} from "../identity/IdentityMessageUtils";
import {ConvergenceOptions} from "../ConvergenceOptions";

/**
 * @hidden
 * @internal
 */
export class ConvergenceConnection extends ConvergenceEventEmitter<IConnectionEvent> {

  public static Events: any = {
    MESSAGE: "message",

    CONNECTION_SCHEDULED: "connection_scheduled",
    CONNECTING: "connecting",
    CONNECTED: "connected",
    CONNECTION_FAILED: "connection_failed",

    AUTHENTICATING: "authenticating",
    AUTHENTICATED: "authenticated",
    AUTHENTICATION_FAILED: "authentication_failed",

    INTERRUPTED: "interrupted",
    DISCONNECTED: "disconnected",
    ERROR: "error"
  };

  private readonly _session: ConvergenceSession;
  private _authenticated: boolean;
  private _connectionDeferred: Deferred<IHandshakeResponseMessage>;
  private _connectionAttempts: number;
  private _connectionAttemptTask: any;
  private _connectionTimeoutTask: any;
  private _connectionState: ConnectionState;
  private _protocolConnection: ProtocolConnection;
  private readonly _url: string;
  private _options: ConvergenceOptions;

  /**
   *
   * @param url
   * @param domain
   */
  constructor(url: string, domain: ConvergenceDomain) {
    super();
    this._url = url;
    this._options = domain.options();

    this._authenticated = false;

    this._connectionAttempts = 0;
    this._connectionState = ConnectionState.DISCONNECTED;

    this._session = new ConvergenceSession(domain, this, null, null, null);
  }

  public url(): string {
    return this._url;
  }

  public session(): ConvergenceSession {
    return this._session;
  }

  public connect(): Promise<IHandshakeResponseMessage> {
    if (this._connectionState !== ConnectionState.DISCONNECTED &&
      this._connectionState !== ConnectionState.INTERRUPTED) {
      throw new Error("Can only call connect on a disconnected or interrupted connection.");
    }

    this._connectionAttempts = 0;
    this._connectionDeferred = new Deferred<IHandshakeResponseMessage>();
    this._connectionState = ConnectionState.CONNECTING;

    this._attemptConnection();

    return this._connectionDeferred.promise();
  }

  public disconnect(): Promise<void> {
    // todo we might not need this.  refactor.
    const deferred: Deferred<void> = new Deferred<void>();

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

    this._protocolConnection
      .close()
      .then(() => {
        this._handleDisconnected();
        deferred.resolve();
      })
      .catch((err: Error) => {
        this._handleInterrupted();
        deferred.reject(err);
      });

    return deferred.promise();
  }

  public reconnect(): Promise<void> {
    if (this._connectionState !== ConnectionState.INTERRUPTED) {
      throw new Error("Can only call reconnect on an interrupted connection.");
    }

    return this
      .connect()
      .then(() => this.authenticateWithReconnectToken(this._session.reconnectToken()))
      .then(() => {
        return;
      });
  }

  public connectNow(): void {
    if (this._connectionState !== ConnectionState.CONNECTING) {
      throw new Error("Can only call connectNow on an connecting connection.");
    }
  }

  public isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }

  public isAuthenticated(): boolean {
    return this._authenticated;
  }

  public send(message: IConvergenceMessage): void {
    this._protocolConnection.send(message);
  }

  public request(message: IConvergenceMessage, timeout?: number): Promise<IConvergenceMessage> {
    return this._protocolConnection.request(message, timeout);
  }

  public authenticateWithPassword(username: string, password: string): Promise<AuthResponse> {
    const message: IPasswordAuthRequestMessage = {
      username,
      password
    };
    return this._authenticate({password: message});
  }

  public authenticateWithJwt(jwt: string): Promise<AuthResponse> {
    const message: IJwtAuthRequestMessage = {jwt};
    return this._authenticate({jwt: message});
  }

  public authenticateWithReconnectToken(token: string): Promise<AuthResponse> {
    const message: IReconnectTokenAuthRequestMessage = {token};
    return this._authenticate({reconnect: message});
  }

  public authenticateAnonymously(displayName?: string): Promise<AuthResponse> {
    const message: IAnonymousAuthRequestMessage = {
      displayName: toOptional(displayName)
    };
    return this._authenticate({anonymous: message});
  }

  public messages(): Observable<MessageEvent> {
    return this
      .events()
      .pipe(filter(e => e.name === "message")) as Observable<MessageEvent>;
  }

  private _authenticate(authRequest: IAuthenticationRequestMessage): Promise<AuthResponse> {
    if (this._session.isAuthenticated()) {
      // The user is only allowed to authenticate once.
      return Promise.reject<AuthResponse>(new ConvergenceError("User already authenticated."));
    } else if (this.isConnected()) {
      // We are connected already so we can just send the request.
      return this._sendAuthRequest(authRequest);
    } else if (this._connectionDeferred != null) {
      // We are connecting so defer this until after we connect.
      return this._connectionDeferred.promise().then(() => {
        return this._sendAuthRequest(authRequest);
      });
    } else {
      // We are not connecting and are not trying to connect.
      return Promise.reject<AuthResponse>(
        new ConvergenceError("Must be connected or connecting to authenticate."));
    }
  }

  private _sendAuthRequest(authenticationRequest: IAuthenticationRequestMessage): Promise<AuthResponse> {
    let method = null;
    if (authenticationRequest.anonymous) {
      method = "anonymous";
    } else if (authenticationRequest.password) {
      method = "password";
    } else if (authenticationRequest.jwt) {
      method = "jwt";
    } else if (authenticationRequest.reconnect) {
      method = "reconnect";
    }

    const authenticatingEvent: IAuthenticatingEvent = {name: ConvergenceConnection.Events.AUTHENTICATING, method};
    this._emitEvent(authenticatingEvent);

    return this
      .request({authenticationRequest})
      .then((response: IConvergenceMessage) => {
        const authResponse: IAuthenticationResponseMessage = response.authenticationResponse;
        if (authResponse.success) {
          const authenticatedEvent: IAuthenticatedEvent = {name: ConvergenceConnection.Events.AUTHENTICATED, method};
          this._emitEvent(authenticatedEvent);

          const success = authResponse.success;
          this._session._setUser(toDomainUser(success.user));
          this._session._setSessionId(success.sessionId);
          this._session._setReconnectToken(success.reconnectToken);
          this._authenticated = true;
          const resp: AuthResponse = {
            state: success.presenceState
          };
          return Promise.resolve(resp);
        } else {
          const authenticationFailedEvent: IAuthenticationFailedEvent = {
            name: ConvergenceConnection.Events.AUTHENTICATION_FAILED,
            method
          };
          this._emitEvent(authenticationFailedEvent);
          return Promise.reject(new ConvergenceError("Authentication failed"));
        }
      });
  }

  private _attemptConnection(): void {
    this._connectionAttempts++;
    if (debugFlags.CONNECTION) {
      console.log("Attempting web socket connection.");
    }

    const timeoutTask = () => {
      this._protocolConnection.abort("connection timeout exceeded");
    };

    const timeout = this._options.connectionTimeout * 1000;
    this._connectionTimeoutTask = setTimeout(timeoutTask, timeout);

    this._emitEvent({name: ConvergenceConnection.Events.CONNECTING});

    const socket: ConvergenceSocket = new ConvergenceSocket(
      this._url,
      this._options.webSocketConstructor,
      this._options.webSocketFactory);
    this._protocolConnection = new ProtocolConnection(
      socket,
      {
        defaultRequestTimeout: this._options.defaultRequestTimeout,
        heartbeatConfig: {
          enabled: this._options.heartbeatEnabled,
          pingInterval: this._options.pingInterval,
          pongTimeout: this._options.pongTimeout
        }
      });

    this._protocolConnection
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

    this._protocolConnection
      .connect()
      .then(() => {
        if (debugFlags.CONNECTION) {
          console.log("Connection succeeded, handshaking.");
        }

        return this._protocolConnection
          .handshake()
          .then((handshakeResponse: IHandshakeResponseMessage) => {
            // We got a response so clear the timeout.
            clearTimeout(this._connectionTimeoutTask);

            if (handshakeResponse.success) {
              // We reset the connection attempts to 0, so that when we get dropped
              // we will start with the first interval.
              this._connectionAttempts = 0;

              this._connectionState = ConnectionState.CONNECTED;
              this._connectionDeferred.resolve(handshakeResponse);
              this._connectionDeferred = null;
              this._emitEvent({name: ConvergenceConnection.Events.CONNECTED});
            } else {
              this._emitEvent({name: ConvergenceConnection.Events.CONNECTION_FAILED});
              this._protocolConnection
                .close()
                .catch(error => console.error(error));

              if (handshakeResponse.retryOk) {
                this._scheduleConnection();
              } else {
                this._handleDisconnected();
                this._connectionDeferred.reject(
                  new ConvergenceError(handshakeResponse.error.details, handshakeResponse.error.code));
                this._connectionDeferred = null;
              }
            }
          })
          .catch((e: Error) => {
            console.error("Handshake failed: ", e);
            this._protocolConnection
              .close()
              .catch(error => console.error(error));
            this._protocolConnection = null;
            // This will cause the code to fall into the next catch.
            return Promise.reject(e);
          });
      })
      .catch((reason: Error) => {
        clearTimeout(this._connectionTimeoutTask);
        this._emitEvent({name: ConvergenceConnection.Events.CONNECTION_FAILED});
        this._scheduleConnection();
      });
  }

  private _scheduleConnection(): void {
    const idx = Math.min(this._connectionAttempts, this._options.reconnectIntervals.length - 1);
    const delay = this._options.reconnectIntervals[idx];
    if (debugFlags.CONNECTION) {
      console.log(`Scheduling web socket connection in ${delay} seconds.`);
    }
    const event: IConnectionScheduledEvent = {name: ConvergenceConnection.Events.CONNECTION_SCHEDULED, delay};
    this._emitEvent(event);
    this._connectionAttemptTask = setTimeout(() => this._attemptConnection(), delay * 1000);
  }

  private _handleDisconnected(): void {
    this._authenticated = false;
    this._connectionState = ConnectionState.DISCONNECTED;
    this._emitEvent({name: ConvergenceConnection.Events.DISCONNECTED});
  }

  private _handleInterrupted(): void {
    this._authenticated = false;
    this._connectionState = ConnectionState.INTERRUPTED;
    this._emitEvent({name: ConvergenceConnection.Events.INTERRUPTED});
    if (this._options.autoReconnect && this._session.reconnectToken()) {
      this
        .reconnect()
        .catch(e => console.log(e));
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
  method: string;
}

/**
 * @hidden
 * @internal
 */
export interface IAuthenticatedEvent extends IConnectionEvent {
  name: "authenticated";
  method: string;
}

/**
 * @hidden
 * @internal
 */
export interface IAuthenticationFailedEvent extends IConnectionEvent {
  name: "authenticationFailed";
  method: string;
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
export interface AuthResponse {
  state: { [key: string]: any };
}

/**
 * @hidden
 * @internal
 */
enum ConnectionState {
  DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
}
