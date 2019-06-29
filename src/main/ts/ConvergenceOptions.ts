import {IConvergenceOptions} from "./IConvergenceOptions";
import {WebSocketFactory} from "./connection/WebSocketFactory";
import {IWebSocketClass} from "./connection/IWebSocketClass";

export class ConvergenceOptions {

  public static DEFAULT_CONNECTION_TIMEOUT = 5;
  public static DEFAULT_HANDSHAKE_TIMEOUT = 5;

  public static DEFAULT_AUTO_RECONNECT = true;
  public static DEFAULT_RECONNECT_INTERVALS = [0, 5, 10, 20, 30];

  public static DEFAULT_DEFAULT_REQUEST_TIMEOUT = 10;
  public static DEFAULT_HEARTBEAT_ENABLED = true;
  public static DEFAULT_PING_INTERVAL = 5;
  public static DEFAULT_PONG_TIMEOUT = 10;

  public static DEFAULT_WEBSOCKET_FACTORY = null;
  public static DEFAULT_WEBSOCKET_CONSTRUCTOR = null;

  public readonly connectionTimeout: number;
  public readonly handshakeTimeout: number;

  public readonly autoReconnect: boolean;
  public readonly reconnectIntervals: number[];

  public readonly fallbackAuth: "jwt" | "password" | null;
  public readonly passwordCallback: () => Promise<string> | null = null;
  public readonly jwtCallback: () => Promise<string> | null = null;

  public readonly defaultRequestTimeout: number;
  public readonly heartbeatEnabled: boolean;
  public readonly pingInterval: number;
  public readonly pongTimeout: number;

  public readonly webSocketFactory: WebSocketFactory | null;
  public readonly webSocketConstructor: IWebSocketClass | null;

  constructor(options: IConvergenceOptions) {
    const defaultConnectionOptions = {
      timeout: ConvergenceOptions.DEFAULT_CONNECTION_TIMEOUT,
      handshakeTimeout: ConvergenceOptions.DEFAULT_HANDSHAKE_TIMEOUT
    };
    const {timeout, handshakeTimeout} = {...defaultConnectionOptions, ...options.connection};

    this.connectionTimeout = timeout;
    this.handshakeTimeout = handshakeTimeout;

    const defaultReconnectOptions = {
      autoReconnect: ConvergenceOptions.DEFAULT_AUTO_RECONNECT,
      reconnectIntervals: ConvergenceOptions.DEFAULT_RECONNECT_INTERVALS,
      fallbackAuth: {jwt: null, password: null}
    };
    const {autoReconnect, reconnectIntervals, fallbackAuth} = {...defaultReconnectOptions, ...options.reconnect};

    this.autoReconnect = autoReconnect;
    this.reconnectIntervals = reconnectIntervals;
    this.fallbackAuth = null;
    if (typeof fallbackAuth.jwt === "function") {
      this.fallbackAuth = "jwt";
      this.jwtCallback = fallbackAuth.jwt;
    } else if (typeof fallbackAuth.password === "function") {
      this.fallbackAuth = "password";
      this.passwordCallback = fallbackAuth.password;
    }

    const defaultProtocolOptions = {
      defaultRequestTimeout: ConvergenceOptions.DEFAULT_DEFAULT_REQUEST_TIMEOUT,
      heartbeat: {
        enabled: ConvergenceOptions.DEFAULT_HEARTBEAT_ENABLED,
        pingInterval: ConvergenceOptions.DEFAULT_PING_INTERVAL,
        pongTimeout: ConvergenceOptions.DEFAULT_PONG_TIMEOUT
      }
    };
    const {defaultRequestTimeout, heartbeat} = {...defaultProtocolOptions, ...options.protocol};
    this.defaultRequestTimeout = defaultRequestTimeout;
    this.heartbeatEnabled = heartbeat.enabled !== undefined ?
      heartbeat.enabled : ConvergenceOptions.DEFAULT_HEARTBEAT_ENABLED;
    this.pingInterval = heartbeat.pingInterval !== undefined ?
      heartbeat.pingInterval : ConvergenceOptions.DEFAULT_PING_INTERVAL;
    this.pongTimeout = heartbeat.pongTimeout !== undefined ?
      heartbeat.pongTimeout : ConvergenceOptions.DEFAULT_PONG_TIMEOUT;

    const defaultWebSocketOptions = {
      factory: ConvergenceOptions.DEFAULT_WEBSOCKET_FACTORY,
      constructor: ConvergenceOptions.DEFAULT_WEBSOCKET_CONSTRUCTOR
    };
    const {factory, constructor} = {...defaultWebSocketOptions, ...options.webSocket};

    this.webSocketFactory = factory;
    this.webSocketConstructor = constructor;
  }
}
