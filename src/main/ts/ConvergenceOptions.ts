/**
 * The ConvergenceOptions interface represents that options that can be set
 * within Convergence when connecting to a domain.
 */
export interface ConvergenceOptions {

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
}
