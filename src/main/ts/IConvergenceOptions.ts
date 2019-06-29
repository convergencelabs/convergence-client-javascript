import {WebSocketFactory} from "./connection/WebSocketFactory";
import {IWebSocketClass} from "./connection/IWebSocketClass";

/**
 * The [[IConvergenceOptions]] interface represents that options that can be
 * set within Convergence when connecting to a domain.
 */
export interface IConvergenceOptions {

  /**
   * Options that configure the connection strategy.
   */
  connection?: {
    /**
     * The maximum time in seconds to wait for a successful web socket
     * connection to be made.
     */
    timeout?: number;

    /**
     * The maximum time in seconds to wait for a successful handshake to be
     * made after the web socket connection is successful.
     */
    handshakeTimeout?: number;
  };

  /**
   * Configures the behavior of the messaging protocol subsystem.
   */
  protocol?: {
    /**
     * The default timeout for a request to the server.
     */
    defaultRequestTimeout: number;

    /**
     * Configures the keep-alive heartbeat.
     */
    heartbeat?: {
      /**
       * Determines if the heartbeat is enabled.
       */
      enabled: boolean;

      /**
       * Configures how long the client will wait, in seconds after the last
       * message is received from the server before a ping will be sent.
       */
      pingInterval: number;

      /**
       * Specifies the time in seconds the client will wait for a response
       * from the server to a ping before considering the connection dead.
       */
      pongTimeout: number;
    };
  };

  /**
   * Options that configure how Convergence will reconnect when a connection is
   * lost.
   */
  reconnect?: {
    /**
     * Whether to automatically reconnect.  Default is true.
     */
    autoReconnect?: boolean;

    /**
     * The intervals to use between reconnects. This array will be sorted from
     * smallest to largest. When the largest interval is reached it will simply
     * be repeated.
     */
    reconnectIntervals?: number[];

    /**
     * The fallback authentication method to use when a reconnect token is
     * rejected. Only one of the following properties should be specified.
     */
    fallbackAuth?: {
      /**
       * Indicates the the fallback authentication should use password
       * authentication. The specified callback will be used to get the
       * password for password authentication when the reconnect token
       * is rejected.
       */
      password?: () => Promise<string>;

      /**
       * Indicates the the fallback authentication should use JWT
       * authentication. The specified callback will be used to get the
       * JWT for JWT authentication when the reconnect token is
       * rejected.
       */
      jwt?: () => Promise<string>;
    }
  };

  /**
   * Options that configure how Convergence will use WebSockets.
   */
  webSocket?: {
    /**
     * Defines the class / constructor that should be used to create WebSocket
     * objects. This is useful when operating in NodeJS where a library like
     * ws or isomorphic-ws can be used to provide a client side WebSocket API.
     */
    factory?: WebSocketFactory;

    /**
     * The constructor to use when creating a web socket. Essentially this is
     * class that should be used to represent the web socket.
     */
    constructor?: IWebSocketClass;
  };

  debug?: {
    connection: boolean;
  };
}
