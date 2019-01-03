import {debugFlags} from "../Debug";
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util/";
import {Deferred} from "../util/Deferred";
import {IWebSocketClass} from "./IWebSocketClass";
import {WebSocketFactory} from "./WebSocketFactory";

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
  private _closeDeferred: Deferred<void>;
  private readonly _webSocketFactory: WebSocketFactory;
  private readonly _webSocketClass: IWebSocketClass;

  constructor(url: string,
              webSocketClass?: IWebSocketClass,
              webSocketFactory?: WebSocketFactory) {
    super();
    let tmp: string = url;
    tmp = tmp.replace(/https:/i, "wss:");
    tmp = tmp.replace(/http:/i, "ws:");
    this._url = tmp;
    this._socket = null;
    this._webSocketClass = webSocketClass !== undefined ? webSocketClass : WebSocket;
    this._webSocketFactory = webSocketFactory !== undefined ? webSocketFactory : (u) => new this._webSocketClass(u);
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

  public close(): Promise<void> {
    return this._doClose(true);
  }

  public terminate(reason: string): Promise<void> {
    return this._doClose(false, reason);
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

  private _doClose(clean: boolean, reason?: string): Promise<void> {
    const localDeferred: Deferred<void> = new Deferred<void>();

    if (!this._socket || this._socket.readyState === this._webSocketClass.CLOSED) {
      if (debugFlags.SOCKET_CONNECTION) {
        console.log("Can't close a closed WebSocket.");
      }
      localDeferred.reject(new Error("Can not close on a WebSocket in the CLOSED state."));
    } else if (this._socket.readyState === this._webSocketClass.CLOSING) {
      if (debugFlags.SOCKET_CONNECTION) {
        console.log("Attempted to close a WebSocket that was already closing.");
      }
      localDeferred.reject(new Error("Connection is already closing."));
    } else if (this._socket.readyState === this._webSocketClass.CONNECTING) {
      if (debugFlags.SOCKET_CONNECTION) {
        console.log("Closing a connecting Web Socket.");
      }

      // Here we want to essentially abort the connection attempt.  We detach from
      // the socket first so that we won't get any more events and then close it.
      // since we will never hit the onclose method of this web socket we need
      // to clean up for ourselves.

      // TODO refactor these three lines which are duplicated in the onclose method.
      this._detachFromSocket(this._socket);
      this._socket.close();
      this._socket = null;

      if (this._openDeferred !== null) {
        const tmp: Deferred<void> = this._openDeferred;
        this._openDeferred = null;
        tmp.reject(new Error("Web Socket connection aborted while opening"));
      }

      localDeferred.resolve(null);
    } else {
      // The socket was open.  This is a normal request to close.
      // The deferred will be created here, but when we call socket.close()
      // below the onclose from the websocket will eventually clean up the
      // deferred and the socket.
      this._closeDeferred = localDeferred;
      try {
        if (clean) {
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Closing Web Socket normally.");
          }
          this._socket.close(1000);
        } else {
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Closing Web Socket abnormally.");
          }
          this._socket.close(4006, reason);
        }
      } catch (e) {
        console.error("Error closing Web Socket connection.", e);
        this._closeDeferred.reject(e);
      } finally {
        // detach from all events except close immediately.
        this._detachFromSocket(this._socket);
        this._socket = null;
      }
    }

    return localDeferred.promise();
  }

  private _detachFromSocket(socket: WebSocket): void {
    // We leave the on close because we still want to get that event.
    socket.onmessage = undefined;
    socket.onopen = undefined;
    socket.onerror = undefined;
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
        console.error(e);
      }
    };

    socket.onopen = (evt: Event) => {
      if (this._openDeferred) {
        if (debugFlags.SOCKET_CONNECTION) {
          console.log("Web Socket connection opened");
        }
        try {
          this._openDeferred.resolve();
        } catch (e) {
          console.log("Error resolving WebSocket Open Promise.");
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
        if (debugFlags.SOCKET_CONNECTION) {
          console.log("Web Socket error.", evt);
        }
        try {
          const event: ISocketErrorEvent = {
            name: ConvergenceSocket.Events.ERROR,
            error: new ConvergenceError("Unknown web socket error")
          };
          this._emitEvent(event);
        } catch (e) {
          console.error("Error handling WebSocket error.", e);
        }
      }
    };

    socket.onclose = (evt: CloseEvent) => {
      this._detachFromSocket(socket);
      socket.onclose = null;
      this._socket = null;
      try {
        if (this._openDeferred) {
          // if the connection deferred is no null, we MUST
          // have been in the process of connecting.  Therefore
          // we reject the promise, and then set it to null.
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Web Socket connection failed: ", evt);
          }

          this._openDeferred.reject(new Error(
            `Could not connect. The WebSocket closed while connecting: {code: ${evt.code}, reason: "${evt.reason}"}`));
          this._openDeferred = null;
        } else if (this._closeDeferred) {
          // if the connection deferred is no null, we MUST
          // have been in the process of closing.  Therefore
          // we resolve the promise.
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Web Socket onClose received while closing: ", evt);
          }
          this._closeDeferred.resolve();
          this._closeDeferred = null;
        } else {
          // We were just open, which means that we did not request this closure.
          // This means the other end terminated the connection.
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Web Socket connection unexpectedly closed: ", evt);
          }
          const event: ISocketClosedEvent = {
            name: ConvergenceSocket.Events.CLOSE,
            reason: "unexpected Web Socket closure."
          };
          this._emitEvent(event);
        }
      } catch (e) {
        console.log("Error handling web socket close event.", e);
      }
    };
  }
}
