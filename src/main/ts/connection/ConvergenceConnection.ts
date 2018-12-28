import {HandshakeResponse} from "./protocol/handhsake";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {
  IProtocolConnectionErrorEvent,
  IProtocolConnectionMessageEvent,
  ProtocolConnection,
  ReplyCallback
} from "./ProtocolConnection";
import {debugFlags} from "../Debug";
import ConvergenceSocket from "./ConvergenceSocket";
import {
  IncomingProtocolResponseMessage,
  OutgoingProtocolMessage,
  OutgoingProtocolRequestMessage
} from "./protocol/protocol";
import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceDomain} from "../ConvergenceDomain";
import {
  AuthenticationResponse,
  AuthRequest,
  AnonymousAuthRequest,
  ReconnectAuthRequest,
  PasswordAuthRequest,
  TokenAuthRequest
} from "./protocol/authentication";
import {MessageType} from "./protocol/MessageType";
import {Deferred} from "../util/Deferred";
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util/";
import {Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {IWebSocketClass} from "./IWebSocketClass";
import {WebSocketFactory} from "./WebSocketFactory";

/**
 * @hidden
 * @internal
 */
export class ConvergenceConnection extends ConvergenceEventEmitter<IConnectionEvent> {

  public static Events: any = {
    MESSAGE: "message",
    CONNECTED: "connected",
    INTERRUPTED: "interrupted",
    RECONNECTED: "reconnected",
    DISCONNECTED: "disconnected",
    ERROR: "error"
  };

  private readonly _session: ConvergenceSession;
  private _connectionDeferred: Deferred<HandshakeResponse>;
  private readonly _connectionTimeout: number;  // seconds
  private readonly _maxReconnectAttempts: number;
  private _connectionAttempts: number;
  private _connectionAttemptTask: any;
  private _connectionTimeoutTask: any;
  private readonly _reconnectInterval: number; // seconds
  private readonly _retryOnOpen: boolean;

  private readonly _protocolConfig: ProtocolConfiguration;

  private _connectionState: ConnectionState;

  private _protocolConnection: ProtocolConnection;
  private readonly _url: string;
  private readonly _webSocketFactory: WebSocketFactory | undefined;
  private readonly _webSocketClass: IWebSocketClass | undefined;

  /**
   *
   * @param url
   * @param connectionTimeout in seconds
   * @param maxReconnectAttempts -1 for unlimited
   * @param reconnectInterval in seconds
   * @param retryOnOpen
   * @param webSocketFactory
   * @param webSocketClass
   * @param domain
   */
  constructor(url: string,
              connectionTimeout: number,
              maxReconnectAttempts: number,
              reconnectInterval: number,
              retryOnOpen: boolean,
              webSocketFactory: WebSocketFactory | undefined,
              webSocketClass: IWebSocketClass | undefined,
              domain: ConvergenceDomain) {
    super();
    this._url = url;

    this._connectionTimeout = connectionTimeout;
    this._maxReconnectAttempts = maxReconnectAttempts;
    this._reconnectInterval = reconnectInterval;
    this._retryOnOpen = retryOnOpen;

    this._connectionAttempts = 0;
    this._connectionState = ConnectionState.DISCONNECTED;

    this._webSocketFactory = webSocketFactory;
    this._webSocketClass = webSocketClass;

    // fixme this should be configurable
    this._protocolConfig = {
      defaultRequestTimeout: 5000,
      heartbeatConfig: {
        enabled: true,
        pingInterval: 5000,
        pongTimeout: 10000
      }
    };

    this._session = new ConvergenceSession(domain, this, null, null, null);
  }

  public session(): ConvergenceSession {
    return this._session;
  }

  public connect(): Promise<HandshakeResponse> {
    if (this._connectionState !== ConnectionState.DISCONNECTED) {
      throw new Error("Can only call connect on a disconnected connection.");
    }

    this._connectionAttempts = 0;
    this._connectionDeferred = new Deferred<HandshakeResponse>();
    this._connectionState = ConnectionState.CONNECTING;

    this._attemptConnection(false);

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

  public isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }

  public send(message: OutgoingProtocolMessage): void {
    this._protocolConnection.send(message);
  }

  public request(message: OutgoingProtocolRequestMessage): Promise<IncomingProtocolResponseMessage> {
    return this._protocolConnection.request(message);
  }

  public authenticateWithPassword(username: string, password: string): Promise<AuthResponse> {
    const authRequest: PasswordAuthRequest = {
      type: MessageType.PASSWORD_AUTH_REQUEST,
      username,
      password
    };
    return this._authenticate(authRequest);
  }

  public authenticateWithToken(token: string): Promise<AuthResponse> {
    const authRequest: TokenAuthRequest = {
      type: MessageType.TOKEN_AUTH_REQUEST,
      token
    };
    return this._authenticate(authRequest);
  }

  public authenticateWithReconnectToken(token: string): Promise<AuthResponse> {
    const authRequest: ReconnectAuthRequest = {
      type: MessageType.RECONNECT_AUTH_REQUEST,
      token
    };
    return this._authenticate(authRequest);
  }

  public authenticateAnonymously(displayName?: string): Promise<AuthResponse> {
    const authRequest: AnonymousAuthRequest = {
      type: MessageType.ANONYMOUS_AUTH_REQUEST,
      displayName
    };
    return this._authenticate(authRequest);
  }

  public messages(eventFilter?: MessageType[]): Observable<MessageEvent> {
    if (typeof eventFilter === "undefined") {
      return this
        .events()
        .pipe(filter(e => e.name === "message")) as Observable<MessageEvent>;
    } else {
      const clonedFilter: MessageType[] = eventFilter.slice(0);
      return this
        .events()
        .pipe(
          filter(e => e.name === "message"),
          filter((m: MessageEvent) => {
            return clonedFilter.some(t => {
              return m.message.type === t;
            });
          })
        )as Observable<MessageEvent>;
    }
  }

  private _authenticate(authRequest: AuthRequest): Promise<AuthResponse> {
    if (this._session.isAuthenticated()) {
      // The user is only allowed to authenticate once.
      return Promise.reject<AuthResponse>(new Error("User already authenticated."));
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
      return Promise.reject<AuthResponse>(new Error("Must be connected or connecting to authenticate."));
    }
  }

  private _sendAuthRequest(authRequest: AuthRequest): Promise<AuthResponse> {
    return this.request(authRequest).then((response: AuthenticationResponse) => {
      if (response.success === true) {
        this._session._setUsername(response.username);
        this._session._setSessionId(response.sessionId);
        this._session._setReconnectToken(response.reconnectToken);
        this._session._setAuthenticated(true);
        const resp: AuthResponse = {
          state: response.state
        };
        return resp;
      } else {
        throw new Error("Authentication failed");
      }
    });
  }

  private _attemptConnection(reconnect: boolean): void {
    this._connectionAttempts++;

    if (reconnect) {
      if (debugFlags.CONNECTION) {
        console.log("Attempting reconnection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
      }
    } else {
      if (debugFlags.CONNECTION) {
        console.log("Attempting connection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
      }
    }

    const timeoutTask = () => {
      this._protocolConnection.abort("connection timeout exceeded");
    };

    this._connectionTimeoutTask = setTimeout(timeoutTask, this._connectionTimeout * 1000);

    const socket: ConvergenceSocket = new ConvergenceSocket(
      this._url,
      this._webSocketClass,
      this._webSocketFactory);
    this._protocolConnection = new ProtocolConnection(
      socket,
      this._protocolConfig);

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
            this._emitEvent({name: ConvergenceConnection.Events.INTERRUPTED});
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
              request: messageEvent.message,
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

        this._protocolConnection
          .handshake(reconnect)
          .then((handshakeResponse: HandshakeResponse) => {
            clearTimeout(this._connectionTimeoutTask);
            if (handshakeResponse.success) {
              this._connectionState = ConnectionState.CONNECTED;

              this._connectionDeferred.resolve(handshakeResponse);
              this._connectionDeferred = null;

              if (reconnect) {
                this._emitEvent({name: ConvergenceConnection.Events.RECONNECTED});
              } else {
                this._emitEvent({name: ConvergenceConnection.Events.CONNECTED});
              }
            } else {
              // todo: Can we reuse this connection???
              this._protocolConnection
                .close()
                .catch(error => console.error(error));

              if ((reconnect || this._retryOnOpen) && handshakeResponse.retryOk) {
                // todo if this is a timeout, we would like to shorten
                // the reconnect interval by the timeout period.
                this._scheduleReconnect(this._reconnectInterval, reconnect);
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
            clearTimeout(this._connectionTimeoutTask);
            this._scheduleReconnect(this._reconnectInterval, reconnect);
            this._handleDisconnected();
          });
      })
      .catch((reason: Error) => {
        clearTimeout(this._connectionTimeoutTask);
        if (reconnect || this._retryOnOpen) {
          this._scheduleReconnect(Math.max(this._reconnectInterval, 0), reconnect);
        } else {
          this._connectionDeferred.reject(reason);
          this._connectionDeferred = null;
          this._handleDisconnected();
        }
      });
  }

  private _scheduleReconnect(delay: number, reconnect: boolean): void {
    if (this._connectionAttempts < this._maxReconnectAttempts || this._maxReconnectAttempts < 0) {
      const reconnectTask = () => {
        this._attemptConnection(reconnect);
      };
      this._connectionAttemptTask = setTimeout(reconnectTask, delay * 1000);
    } else {
      this._connectionDeferred.reject(new Error("Maximum connection attempts exceeded"));
    }
  }

  private _handleDisconnected(): void {
    this._connectionState = ConnectionState.DISCONNECTED;
    this._emitEvent({name: ConvergenceConnection.Events.DISCONNECTED});
  }

  private _handleInterrupted(): void {
    this._connectionState = ConnectionState.INTERRUPTED;
    this._emitEvent({name: ConvergenceConnection.Events.INTERRUPTED});
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
export interface IConnectionClosedEvent extends IConnectionEvent {
  name: "closed";
}

/**
 * @hidden
 * @internal
 */
export interface IConnectionErrorEvent extends IConnectionEvent {
  name: "closed";
  error: string;
}

/**
 * @hidden
 * @internal
 */
export interface MessageEvent extends IConnectionEvent {
  name: "message";
  message: any; // Model Message??
  request: boolean;
  callback?: ReplyCallback;
}

/**
 * @hidden
 * @internal
 */
export interface AuthResponse {
  state: { [key: string]: void };
}

/**
 * @hidden
 * @internal
 */
enum ConnectionState {
  DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
}
