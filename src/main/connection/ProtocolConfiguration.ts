/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

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
