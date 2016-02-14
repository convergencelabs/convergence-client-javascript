export interface ProtocolConfiguration {
  defaultRequestTimeout: number;
  heartbeatConfig: HeartbeatConfig;
}

export interface HeartbeatConfig {
  enabled: boolean;
  pingInterval: number;
  pongTimeout: number;
}
