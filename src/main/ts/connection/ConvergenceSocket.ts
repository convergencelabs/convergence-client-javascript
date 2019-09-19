import {
  ConvergenceError,
  ConvergenceEventEmitter,
  IConvergenceEvent
} from "../util/";
import {Deferred} from "../util/Deferred";
import {IWebSocketClass} from "./IWebSocketClass";
import {WebSocketFactory} from "./WebSocketFactory";
import {Logging} from "../util/log/Logging";

/**
 * @hidden
 * @internal
 */
export interface IConvergenceSocketEvent extends IConvergenceEvent {

}

/**
 * @hidden
 * @internal
 */
export interface ISocketClosedEvent extends IConvergenceSocketEvent {
  name: "closed";
  reason: string;
}

/**
 * @hidden
 * @internal
 */
export interface ISocketErrorEvent extends IConvergenceSocketEvent {
  name: "error";
  error: Error;
}

/**
 * @hidden
 * @internal
 */
export interface ISocketMessageEvent extends IConvergenceSocketEvent {
  name: "message";
  message: Uint8Array;
}

/**
 * @hidden
 * @internal
 */
export default class ConvergenceSocket extends ConvergenceEventEmitter<IConvergenceSocketEvent> {

  public static Events: any = {
    MESSAGE: "message",
    ERROR: "error",
    CLOSE: "close"
  };

  private readonly _url: string;
  private _socket: WebSocket;
  private _openDeferred: Deferred<void>;
  private readonly _webSocketFactory: WebSocketFactory;
  private readonly _webSocketClass: IWebSocketClass;
  private readonly _logger = Logging.logger("socket");

  constructor(url: string,
              webSocketClass?: IWebSocketClass | null,
              webSocketFactory?: WebSocketFactory | null) {
    super();
    let tmp: string = url;
    tmp = tmp.replace(/https:/i, "wss:");
    tmp = tmp.replace(/http:/i, "ws:");
    this._url = tmp;
    this._socket = null;
    this._webSocketClass = webSocketClass !== null ? webSocketClass : WebSocket;
    this._webSocketFactory = webSocketFactory !== null ? webSocketFactory : (u) => new this._webSocketClass(u);
  }

  get url(): string {
    return this._url;
  }

  public open(): Promise<void> {
    this._openDeferred = new Deferred<void>();

    if (this._socket && this._socket.readyState === this._webSocketClass.CONNECTING) {
      throw new Error("Socket already in the process of opening.");
    } else if (this._socket && this._socket.readyState === this._webSocketClass.OPEN) {
      throw new Error("Can not call connect on a socket that is already connected.");
    } else if (this._socket && this._socket.readyState === this._webSocketClass.CLOSING) {
      throw new Error("Can not call connect on a socket that is in the process of closing.");
    } else {
      this._socket = this._webSocketFactory(this._url);
      this._socket.binaryType = "arraybuffer";
      this._attachToSocket(this._socket);
    }

    return this._openDeferred.promise();
  }

  public close(): void {
    this._doClose(true);
  }

  public terminate(reason: string): void {
    this._doClose(false, reason);
  }

  public isOpen(): boolean {
    return this._socket !== null && this._socket.readyState === this._webSocketClass.OPEN;
  }

  public isConnecting(): boolean {
    return this._socket === null || this._socket.readyState === this._webSocketClass.CONNECTING;
  }

  public isClosed(): boolean {
    return this._socket === null || this._socket.readyState === this._webSocketClass.CLOSED;
  }

  public send(message: any): void {
    if (!this.isOpen()) {
      throw new Error("Can't send messages because the WebSocket is not open.");
    }
    this._socket.send(message);
  }

  private _doClose(clean: boolean, reason?: string): void {
    if (!this._socket || this._socket.readyState === this._webSocketClass.CLOSED) {
      this._logger.debug("Can't close a closed WebSocket.");
      throw new Error("Can not close on a WebSocket in the CLOSED state.");
    } else if (this._socket.readyState === this._webSocketClass.CLOSING) {
      this._logger.debug("Attempted to close a WebSocket that was already closing.");
      throw new Error("Connection is already closing.");
    } else {
      this._logger.debug("Closing a connecting Web Socket.");

      // The socket was open or opening.  This is a normal request to close.
      this._detachFromSocket(this._socket);
      const socket = this._socket;
      this._socket = null;

      if (clean) {
        this._logger.debug("Closing Web Socket normally.");
        socket.close(1000);
      } else {
        this._logger.debug("Closing Web Socket abnormally.");
        socket.close(4006, reason);
      }

      if (this._openDeferred !== null) {
        // Here we want to essentially abort the connection attempt.  We detach from
        // the socket first so that we won't get any more events and then close it.
        // since we will never hit the onclose method of this web socket we need
        // to clean up for ourselves.
        const tmp: Deferred<void> = this._openDeferred;
        this._openDeferred = null;
        tmp.reject(new Error("Web Socket connection closed while opening."));
      }

      const event: ISocketClosedEvent = {
        name: ConvergenceSocket.Events.CLOSE,
        reason: "close requested by client"
      };
      this._emitEvent(event);
    }
  }

  private _detachFromSocket(socket: WebSocket): void {
    socket.onmessage = undefined;
    socket.onopen = undefined;
    socket.onerror = undefined;
    socket.onclose = undefined;
  }

  private _attachToSocket(socket: WebSocket): void {
    socket.onmessage = (evt: MessageEvent) => {
      try {
        if (evt.data instanceof ArrayBuffer) {
          const buffer = new Uint8Array(evt.data);
          this._emitEvent({
            name: ConvergenceSocket.Events.MESSAGE,
            message: buffer
          } as ISocketMessageEvent);
        } else {
          throw new ConvergenceError("Convergence protocol does not accept text frames: " + evt.data);
        }
      } catch (e) {
        this._emitEvent({
          name: ConvergenceSocket.Events.ERROR,
          error: e
        } as ISocketErrorEvent);
        this._logger.error("Error handling  web socket frame", e);
      }
    };

    socket.onopen = (evt: Event) => {
      if (this._openDeferred) {
        this._logger.debug("Web Socket connection opened");
        try {
          this._openDeferred.resolve();
        } catch (e) {
          this._logger.error("Error resolving WebSocket Open Promise.", e);
        }
        this._openDeferred = null;
      } else {
        // TODO what else to do here?
        const event: ISocketErrorEvent = {
          name: ConvergenceSocket.Events.ERROR,
          error: new ConvergenceError("Received onOpen event while in state: " + this._socket.readyState)
        };
        this._emitEvent(event);
      }
    };

    socket.onerror = (evt: Event) => {
      if (this._socket === undefined || this._socket.readyState === this._webSocketClass.CONNECTING) {
        // We don't want to handle errors during connection here, because
        // the close event will give us more information.
        this._logger.debug("Web Socket error.");
        try {
          const event: ISocketErrorEvent = {
            name: ConvergenceSocket.Events.ERROR,
            error: new ConvergenceError("Unknown web socket error")
          };
          this._emitEvent(event);
        } catch (e) {
          this._logger.error("Error handling WebSocket error.", e);
        }
      }
    };

    socket.onclose = (evt: CloseEvent) => {
      this._logger.debug(() => `Web Socket close event: {code: ${evt.code}, reason: "${evt.reason}"}`);
      this._detachFromSocket(socket);
      this._socket = null;
      try {
        if (this._openDeferred) {
          // if the open deferred is not null, we MUST
          // have been in the process of connecting.  Therefore
          // we reject the promise, and then set it to null.
          this._logger.debug(() => `Web Socket connection failed: {code: ${evt.code}, reason: "${evt.reason}"}`);
          this._openDeferred.reject(new Error(
            `Could not connect. The WebSocket closed while connecting: {code: ${evt.code}, reason: "${evt.reason}"}`));
          this._openDeferred = null;
        } else {
          // We were just open, which means that we did not request this closure.
          // This means the other end terminated the connection.
          this._logger.debug(
            () => `Web Socket connection unexpectedly closed: {code: ${evt.code}, reason: "${evt.reason}"}`);
          const event: ISocketClosedEvent = {
            name: ConvergenceSocket.Events.CLOSE,
            reason: "unexpected Web Socket closure."
          };
          this._emitEvent(event);
        }
      } catch (e) {
        this._logger.error("Error handling web socket close event.", e);
      }
    };
  }
}
