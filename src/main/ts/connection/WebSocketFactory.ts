/**
 * A factory function that returns a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
 * bound to the provided [[ConvergenceDomain|domain]] URL.
 *
 * @module Connection and Authentication
 */
export type WebSocketFactory = (url: string) => WebSocket;
