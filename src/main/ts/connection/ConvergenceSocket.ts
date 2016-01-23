module convergence.connection {
  export class ConvergenceSocket {

    private _listener: ConvergenceSocketListener;
    private _url: string;
    private _socket: WebSocket;
    private _openDeferred: Q.Deferred<void>;
    private _closeDeferred: Q.Deferred<void>;

    constructor(url: string) {
      var tmp: string = url;
      tmp = tmp.replace(/https:/i, "wss:");
      tmp = tmp.replace(/http:/i, "ws:");
      this._url = tmp;
    }

    onMessageReceived(encodedMessage: string): void {

    }

    open(): Q.Promise<void> {
      this._openDeferred = Q.defer<void>();

      if (this._socket && this._socket.readyState === WebSocket.CONNECTING) {
        throw new Error("Connection already in the process of opening.");
      } else if (this._socket && this._socket.readyState === WebSocket.OPEN) {
        throw new Error("Can not call connect on a client that is already connected.");
      } else if (this._socket && this._socket.readyState === WebSocket.CLOSING) {
        throw new Error("Can not call connect on a client that is in the process of closing.");
      } else {
        this._socket = new WebSocket(this._url);
        this.attachToSocket(this._socket);
      }

      return this._openDeferred.promise;
    }

    close(): Q.Promise<void> {
      return this.doClose(true);
    }

    terminate(reason: string): Q.Promise<void> {
      return this.doClose(false);
    }

    doClose(clean: boolean, reason?: string): Q.Promise<void> {
      var localDeferred: Q.Deferred<void> = Q.defer<void>();

      if (!this._socket || this._socket.readyState === WebSocket.CLOSED) {
        if (convergence.Debug.flags.socketConnection) {
          console.log("Can't close a closed Web Socket.");
        }
        localDeferred.reject("Can not call disconnect on a client that is not connected.");
      } else if (this._socket.readyState === WebSocket.CLOSING) {
        if (convergence.Debug.flags.socketConnection) {
          console.log("Attempted to close a WebSocket that was already closing.");
        }
        localDeferred.reject("Connection is already closing.");
      } else if (this._socket.readyState === WebSocket.CONNECTING) {
        if (convergence.Debug.flags.socketConnection) {
          console.log("Closing a connecting Web Socket.");
        }

        // Here we want to essentially abort the connection attempt.  We detach from
        // the socket first so that we won't get any more events and then close it.
        // since we will never hit the onclose method of this web socket we need
        // to clean up for ourselves.

        // TODO refactor these three lines which are duplicated in the onclose method.
        this.detachFromSocket(this._socket);
        this._socket.close();
        this._socket = null;

        var tmp: Q.Deferred<void> = this._openDeferred;
        this._openDeferred = null;

        tmp.reject(new Error("Web Socket connection aborted while opening"));
        localDeferred.resolve(null);
      } else {
        // The socket was open.  This is a normal request to close.
        // The deferred will be created here, but when we call socket.close()
        // below the onclose from the websocket will eventually clean up the
        // deferred and the socket.
        this._closeDeferred = localDeferred;
        try {
          if (clean) {
            if (convergence.Debug.flags.socketConnection) {
              console.log("Closing Web Socket normally.");
            }
            this._socket.close(1000);
          } else {
            if (convergence.Debug.flags.socketConnection) {
              console.log("Closing Web Socket abnormally.");
            }
            this._socket.close(4006, reason);
          }
        } catch (e) {
          console.error("error closing Web Socket connection.", e);
          this._closeDeferred.reject(e);
        } finally {
          // detatch from all events except close immediately.
          this.detachFromSocket(this._socket);
          this._socket = null;
        }
      }

      return localDeferred.promise;
    }

    isOpen(): boolean {
      return this._socket != null && this._socket.readyState === WebSocket.OPEN;
    }

    send(message: any): void {
      if (!this.isOpen()) {
        throw new Error("Can't send message while socket is not open.");
      }

      var encodedMessage: string = JSON.stringify(message);
      console.log(encodedMessage);
      this._socket.send(encodedMessage);
    }

    private detachFromSocket(socket: WebSocket): void {
      // We leave the on close because we still want to get that event.
      socket.onmessage = undefined;
      socket.onopen = undefined;
      socket.onerror = undefined;
    }

    private attachToSocket(socket: WebSocket): void {
      var self: ConvergenceSocket = this;
      socket.onmessage = function (evt: MessageEvent): void {
        try {
          console.log(evt.data);
          self.fireOnMessage(JSON.parse(evt.data));
        } catch (e) {
          console.error("Error processing Web Socket Message.", e);
        }
      };

      socket.onopen = function (evt: Event): void {
        if (self._openDeferred) {
          if (convergence.Debug.flags.socketConnection) {
            console.log("Web Socket connection opened");
          }
          try {
            self._openDeferred.resolve();
          } catch (e) {
            console.error("Error resolving WebSocket Open Promise.");
          }
          self._openDeferred = null;
        } else {
          // TODO what else to do here?
          self.fireOnError("Received onOpen event while in state: " + self._socket.readyState);
        }
      };

      socket.onerror = function (evt: Event): void {
        if (self._socket.readyState === WebSocket.CONNECTING) {
          // We don't want to handle errors during connection here, because
          // the close event will give us more information.
          if (convergence.Debug.flags.socketConnection) {
            console.log("Web Socket error.", evt);
          }
          try {
            // fixme get the error message
            self.fireOnError("error");
          } catch (e) {
            console.error("Error handling WebSocket error.", e);
          }
        }
      };

      socket.onclose = function (evt: CloseEvent): void {
        self.detachFromSocket(socket);
        socket.onclose = null;
        self._socket = null;
        try {
          if (self._openDeferred) {
            // if the connection deferred is no null, we MUST
            // have been in the process of connecting.  Therefore
            // we reject the promise, and then set it to null.
            if (convergence.Debug.flags.socketConnection) {
              console.log("Web Socket connection failed: ", evt);
            }
            self._openDeferred.reject("unable to connect");
            self._openDeferred = null;
          } else if (self._closeDeferred) {
            // if the connection deferred is no null, we MUST
            // have been in the process of closing.  Therefore
            // we resolve the promise.
            if (convergence.Debug.flags.socketConnection) {
              console.log("Web Socket onClose received while closing: ", evt);
            }
            self._closeDeferred.resolve();
            self._closeDeferred = null;
          } else {
            // We were just open, which means that we did not request this closure.
            // This means the other end terminated the connection.
            if (convergence.Debug.flags.socketConnection) {
              console.log("Web Socket connection unexpectedly closed: ", evt);
            }
            self.fireOnClose("unexpected Web Socket closure.");
          }
        } catch (e) {
          console.error("Error handling web socket close event.", e);
        }
      };
    }

    get url(): string {
      return this._url;
    }

    //
    // Events
    //
    set listener(listener: ConvergenceSocketListener) {
      this._listener = listener;
    }

    protected fireOnError(error: string): void {
      if (this._listener) {
        this._listener.onError(error);
      }
    }

    protected fireOnClose(reason: string): void {
      if (this._listener) {
        this._listener.onClose(reason);
      }
    }

    protected fireOnMessage(message: any): void {
      if (this._listener) {
        this._listener.onMessage(message);
      }
    }
  }
}
