
/**
 * @module Connection and Authentication
 */
export interface IWebSocketClass {
  prototype: WebSocket;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
  new(url: string, protocols?: string | string[]): WebSocket;
}
