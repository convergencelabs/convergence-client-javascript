
/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * @category Connection and Authentication
 */
export interface IWebSocketClass {
  prototype: WebSocket;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
  new(url: string, protocols?: string | string[]): WebSocket;
}
