/**
 * The [[IConvergenceOptions]] interface represents that options that can be set
 * within Convergence when connecting to a domain.
 */
export interface IConvergenceOptions {

  /**
   * The maximum time to wait in ms for a successful connection to be made.
   */
  connectionTimeout?: number;

  /**
   * The maximum number of times to reconnect, after which the connection will
   * fail.
   */
  maxReconnectAttempts?: number;

  /**
   * The time to wait between connection attempts.
   */
  reconnectInterval?: number;

  /**
   * Whether to attempt to reconnect when first connecting.
   * @default true
   */
  retryOnOpen?: boolean;

  /**
   * Defines the class / constructor that should be used to create WebSocket
   * objects. This is useful when operating in NodeJS where a library like
   * ws or isomorphic-ws can be used to provide a client side WebSocket API.
   */
  webSocketClass?: any;
}
