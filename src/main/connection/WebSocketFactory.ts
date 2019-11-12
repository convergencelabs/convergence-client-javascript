/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * A factory function that returns a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 * bound to the provided [[ConvergenceDomain|domain]] URL.
 */
export type WebSocketFactory = (url: string) => WebSocket;
