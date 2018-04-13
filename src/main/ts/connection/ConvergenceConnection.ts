import {HandshakeResponse} from "./protocol/handhsake";
import {ProtocolConfiguration} from "./ProtocolConfiguration";
import {ProtocolConnection} from "./ProtocolConnection";
import {debugFlags} from "../Debug";
import ConvergenceSocket from "./ConvergenceSocket";
import {OutgoingProtocolMessage} from "./protocol/protocol";
import {OutgoingProtocolRequestMessage} from "./protocol/protocol";
import {IncomingProtocolResponseMessage} from "./protocol/protocol";
import {EventEmitter} from "../util/EventEmitter";
import {SessionImpl} from "../SessionImpl";
import {ConvergenceDomain} from "../ConvergenceDomain";
import {Session} from "../Session";
import {PasswordAuthRequest, AnonymousAuthRequest} from "./protocol/authentication";
import {MessageType} from "./protocol/MessageType";
import {TokenAuthRequest} from "./protocol/authentication";
import {AuthRequest} from "./protocol/authentication";
import {AuthenticationResponse} from "./protocol/authentication";
import {Deferred} from "../util/Deferred";
import {ReplyCallback} from "./ProtocolConnection";
import {EventKey} from "../util/EventEmitter";
import {Observable, Subject} from "rxjs/Rx";

export class ConvergenceConnection extends EventEmitter {

  public static Events: any = {
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

  private _connectionState: ConnectionState;

  private _protocolConnection: ProtocolConnection;
  private _url: string;
  private _messageEmitter: EventEmitter;
  private _messageSubject: Subject<MessageEvent>;

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
      defaultRequestTimeout: 5000,
      heartbeatConfig: {
        enabled: true,
        pingInterval: 5000,
        pongTimeout: 10000
      }
    };

    // todo migrate away from this.
    this._messageEmitter = new EventEmitter();
    this._messageSubject = new Subject();

    this._session = new SessionImpl(domain, this, null, null, null);
  }

  public session(): Session {
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
        this._connectionState = ConnectionState.DISCONNECTED;
        deferred.resolve();
      })
      .catch((err: Error) => {
        this._connectionState = ConnectionState.INTERRUPTED;
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
    const authRequest: ReconnectTokenAuthRequest = {
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

  public addMessageListener(type: EventKey, listener: (message: any) => void): void {
    this._messageEmitter.on(type, listener);
  }

  public addMultipleMessageListener(types: EventKey[], listener: (message: any) => void): void {
    types.forEach((type: string) => {
      this._messageEmitter.on(type, listener);
    });
  }

  public removeMessageListener(type: EventKey, listener: (message: any) => void): void {
    this._messageEmitter.off(type, listener);
  }

  public messages(eventFilter?: MessageType[]): Observable<MessageEvent> {
    if (typeof eventFilter === "undefined") {
      return this._messageSubject.asObservable();
    } else {
      const filter: MessageType[] = eventFilter.slice(0);
      return this._messageSubject.asObservable().filter(m => {
        return filter.some(t => {
          return m.message.type === t;
        });
      });
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
        this._session.setAuthenticated(true);
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

    const timeoutTask: Function = () => {
      this._protocolConnection.abort("connection timeout exceeded");
    };

    this._connectionTimeoutTask = setTimeout(timeoutTask, this._connectionTimeout * 1000);

    const socket: ConvergenceSocket = new ConvergenceSocket(this._url);
    this._protocolConnection = new ProtocolConnection(
      socket,
      this._protocolConfig);

    this._protocolConnection.on(ProtocolConnection.Events.ERROR, (error: string) =>
      this.emit(ConvergenceConnection.Events.ERROR, error));

    this._protocolConnection.on(ProtocolConnection.Events.DROPPED, () =>
      this.emit(ConvergenceConnection.Events.INTERRUPTED));

    this._protocolConnection.on(ProtocolConnection.Events.CLOSED, () =>
      this.emit(ConvergenceConnection.Events.DISCONNECTED));

    this._protocolConnection.on(ProtocolConnection.Events.MESSAGE, (event: MessageEvent) => {
      this._messageEmitter.emit(event.message.type, event);
      this._messageSubject.next(event);
    });

    this._protocolConnection.connect().then(() => {
      if (debugFlags.CONNECTION) {
        console.log("Connection succeeded, handshaking.");
      }

      this._protocolConnection.handshake(reconnect).then((handshakeResponse: HandshakeResponse) => {
        clearTimeout(this._connectionTimeoutTask);
        if (handshakeResponse.success) {
          this._connectionState = ConnectionState.CONNECTED;

          this._connectionDeferred.resolve(handshakeResponse);
          this._connectionDeferred = null;

          if (reconnect) {
            this.emit(ConvergenceConnection.Events.RECONNECTED);
          } else {
            this.emit(ConvergenceConnection.Events.CONNECTED);
          }
        } else {
          // todo: Can we reuse this connection???
          this._protocolConnection.close();
          if ((reconnect || this._retryOnOpen) && handshakeResponse.retryOk) {
            // todo if this is a timeout, we would like to shorten
            // the reconnect interval by the timeout period.
            this._scheduleReconnect(this._reconnectInterval, reconnect);
          } else {
            this.emit(ConvergenceConnection.Events.DISCONNECTED);
            this._connectionDeferred.reject(new Error("Server rejected handshake request."));
            this._connectionDeferred = null;
          }
        }
      }).catch((e: Error) => {
        console.error("Handshake failed: ", e);
        this._protocolConnection.close();
        this._protocolConnection = null;
        this._connectionDeferred = null;
        clearTimeout(this._connectionTimeoutTask);
        this._scheduleReconnect(this._reconnectInterval, reconnect);
        this.emit(ConvergenceConnection.Events.DISCONNECTED);
      });
    }).catch((reason: Error) => {
      console.error("Connection failed: ", reason);
      clearTimeout(this._connectionTimeoutTask);
      if (reconnect || this._retryOnOpen) {
        this._scheduleReconnect(Math.max(this._reconnectInterval, 0), reconnect);
      } else {
        this._connectionDeferred.reject(reason);
        this._connectionDeferred = null;
        this.emit(ConvergenceConnection.Events.DISCONNECTED);
      }
    });
  }

  private _scheduleReconnect(delay: number, reconnect: boolean): void {
    if (this._connectionAttempts < this._maxReconnectAttempts || this._maxReconnectAttempts < 0) {
      const reconnectTask: Function = () => {
        this._attemptConnection(reconnect);
      };
      this._connectionAttemptTask = setTimeout(reconnectTask, delay * 1000);
    } else {
      this._connectionDeferred.reject(new Error("Maximum connection attempts exceeded"));
    }
  }
}

export interface MessageEvent {
  message: any; // Model Message??
  request: boolean;
  callback?: ReplyCallback;
}

export interface AuthResponse {
  state: { [key: string]: void };
}

enum ConnectionState {
  DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
}
