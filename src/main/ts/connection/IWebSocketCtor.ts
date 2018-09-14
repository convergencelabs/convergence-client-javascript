export interface IWebSocketCtor {
  prototype: WebSocket;
  readonly CLOSED: number;
  readonly CLOSING: number;
  readonly CONNECTING: number;
  readonly OPEN: number;
  new(url: string, protocols?: string | string[]): WebSocket;
}
