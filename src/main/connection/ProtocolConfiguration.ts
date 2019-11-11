/**
 * @hidden
 * @internal
 */
export interface ProtocolConfiguration {
  defaultRequestTimeout: number;
  heartbeatConfig: HeartbeatConfig;
}

/**
 * @hidden
 * @internal
 */
export interface HeartbeatConfig {
  enabled: boolean;
  pingInterval: number;
  pongTimeout: number;
}
