module convergence.connection {
  import OutgoingProtocolMessage = convergence.message.OutgoingProtocolMessage;
  import OutgoingProtocolRequestMessage = convergence.message.OutgoingProtocolRequestMessage;
  import IncomingProtocolResponseMessage = convergence.message.IncomingProtocolResponseMessage;
  import IncomingProtocolRequestMessage = convergence.message.IncomingProtocolRequestMessage;
  import IncomingProtocolNormalMessage = convergence.message.IncomingProtocolNormalMessage;
  import HandshakeResponse = convergence.message.HandshakeResponse;

  export class ConvergenceConnection {

    private _connectionDeferred: Q.Deferred<HandshakeResponse>;
    private _connectionTimeout: number;
    private _maxReconnectAttempts: number;
    private _connectionAttempts: number;
    private _connectionAttemptTask: number;
    private _connectionTimeoutTask: number;
    private _reconnectInterval: number;
    private _retryOnOpen: boolean;

    private _protocolConfig: ProtocolConfiguration;

    private _clientId: string;
    private _reconnectToken: string;

    private _connectionState: ConnectionState;

    private _protocolConnection: ProtocolConnection;
    private _listener: ConvergenceConnectionListener;
    private _url: string;
    private _eventHandler: ProtocolEventHandler;

    constructor(url: string,
                connectionTimeout: number,
                maxReconnectAttempts: number,
                reconnectInterval: number,
                retryOnOpen: boolean,
                listener: ConvergenceConnectionListener) {

      var self: ConvergenceConnection = this;

      this._url = url;

      this._connectionTimeout = connectionTimeout;
      this._maxReconnectAttempts = maxReconnectAttempts;
      this._reconnectInterval = reconnectInterval;
      this._retryOnOpen = retryOnOpen;

      this._connectionAttempts = 0;
      this._connectionState = ConnectionState.DISCONNECTED;
      this._listener = listener;

      // fixme
      this._protocolConfig = {
        defaultRequestTimeout: 1000,
        heartbeatConfig: {
          enabled: true,
          pingInterval: 5000,
          pongTimeout: 10000
        }
      };

      this._eventHandler = {
        onConnectionError: function (error: string): void {
          self._listener.onError(error);
        },
        onConnectionDropped: function (): void {
          self._listener.onInterrupted();
        },
        onConnectionClosed: function (): void {
          self._listener.onDisconnected();
        },
        onRequestReceived: function (message: IncomingProtocolRequestMessage, replyCallback: ReplyCallback): void {
          self._listener.onRequest(message, replyCallback);
        },
        onMessageMessage(message: IncomingProtocolNormalMessage): void {
          self._listener.onMessage(message);
        }
      };
    }

    connect(): Q.Promise<HandshakeResponse> {
      if (this._connectionState !== ConnectionState.DISCONNECTED) {
        throw new Error("Can only call connect on a disconnected connection.");
      }

      this._connectionAttempts = 0;
      this._connectionDeferred = Q.defer<HandshakeResponse>();
      this._connectionState = ConnectionState.CONNECTING;

      this.attemptConnection(false);

      return this._connectionDeferred.promise;
    }

    reconnect(): void {
      var self: ConvergenceConnection = this;

      this._connectionAttempts = 0;

      this._connectionDeferred = Q.defer<HandshakeResponse>();
      this._connectionDeferred.promise.then(function (result: any): void {
        self._connectionState = ConnectionState.CONNECTED;
        this._listener.onReconnected();
      }).fail(function (reason: Error): void {
        self._connectionState = ConnectionState.DISCONNECTED;
        this._listener.onDisconnected();
      });

      this.attemptConnection(true);
    }

    private attemptConnection(reconnect: boolean): void {
      var self: ConvergenceConnection = this;

      this._connectionAttempts++;

      if (reconnect) {
        if (convergence.Debug.flags.serverConnection) {
          console.log("Attempting reconnection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
        }
      } else {
        if (convergence.Debug.flags.serverConnection) {
          console.log("Attempting connection %d of %d.", this._connectionAttempts, this._maxReconnectAttempts);
        }
      }

      var timeoutTask: Function = function (): void {
        console.log("connection timeout exceeded, terminating connection");
        self._protocolConnection.abort("connection timeout exceeded");
      };

      this._connectionTimeoutTask = setTimeout(timeoutTask, this._connectionTimeout * 1000);

      var socket: ConvergenceSocket = new ConvergenceSocket(this._url);
      this._protocolConnection = new ProtocolConnection(
        socket,
        this._protocolConfig,
        this._eventHandler);

      this._protocolConnection.connect().then(function (): void {
        if (convergence.Debug.flags.connection) {
          console.log("Connection succeeded, handshaking.");
        }

        self._protocolConnection.handshake(reconnect).then(function (handshakeResponse: HandshakeResponse): void {
          if (handshakeResponse.success) {
            self._connectionDeferred.resolve(handshakeResponse);
          } else {
            // todo: Can we reuse this connection???
            self._protocolConnection.close();
            clearTimeout(self._connectionTimeoutTask);
            if ((reconnect || self._retryOnOpen) && handshakeResponse.retryOk) {
              // todo if this is a timeout, we would like to shorten
              // the reconnect interval by the timeout period.
              self.scheduleReconnect(self._reconnectInterval, reconnect);
            } else {
              self._connectionDeferred.reject(new Error("Server rejected handshake request."));
            }
          }
        }).fail(function (e: Error): void {
          console.error("Handshake failed: ", e);
          self._protocolConnection.close();
          self._protocolConnection = null;
          clearTimeout(self._connectionTimeoutTask);
          self.scheduleReconnect(self._reconnectInterval, reconnect);
        });
      }).fail(function (reason: Error): void {
        console.log("Connection failed: " + reason);
        clearTimeout(self._connectionTimeoutTask);
        if (self.reconnect || self._retryOnOpen) {
          self.scheduleReconnect(Math.max(self._reconnectInterval, 0), reconnect);
        } else {
          self._connectionDeferred.reject(reason);
        }
      }).progress(function (progress: any): void {
        self._connectionDeferred.notify(progress);
      });
    }

    private scheduleReconnect(delay: number, reconnect: boolean): void {
      if (this._connectionAttempts < this._maxReconnectAttempts || this._maxReconnectAttempts < 0) {
        var self: ConvergenceConnection = this;
        var reconnectTask: Function = function (): void {
          self.attemptConnection(reconnect);
        };
        this._connectionAttemptTask = setTimeout(reconnectTask, delay * 1000);
      } else {
        this._connectionDeferred.reject(new Error("Maximum connection attempts exceeded"));
      }
    }

    disconnect(): Q.Promise<void> {
      // todo we might not need this.  refactor.
      var deferred: Q.Deferred<void> = Q.defer<void>();
      var self: ConvergenceConnection = this;

      if (this._connectionTimeoutTask != null) {
        clearTimeout(this._connectionTimeoutTask);
        this._connectionTimeoutTask = null;
      }

      if (this._connectionAttemptTask != null) {
        clearTimeout(this._connectionAttemptTask);
        this._connectionAttemptTask = null;
      }

      if (this._connectionDeferred != null) {
        if (this._connectionDeferred.promise.isPending()) {
          this._connectionDeferred.reject("Connection canceled by user");
        }
        this._connectionDeferred = null;
      }

      if (this._connectionState === ConnectionState.DISCONNECTED) {
        deferred.reject("Connection is already disconnected.");
      }

      this._connectionState = ConnectionState.DISCONNECTING;

      return this._protocolConnection.close().then(function (): void {
        self._connectionState = ConnectionState.DISCONNECTED;
      }).fail(function (reason: Error): void {
        self._connectionState = ConnectionState.INTERRUPTED;
      });
    }

    isConnected(): boolean {
      return this._connectionState === ConnectionState.CONNECTED;
    }

    send(message: OutgoingProtocolMessage): void {
      this._protocolConnection.send(message);
    }

    request(message: OutgoingProtocolRequestMessage): Q.Promise<IncomingProtocolResponseMessage> {
      return this._protocolConnection.request(message);
    }

    private handshake(reconnect: boolean): Q.Promise<HandshakeResponse> {
      var self: ConvergenceConnection = this;
      var promise: Q.Promise<HandshakeResponse>;
      if (reconnect) {
        promise = this._protocolConnection.handshake(reconnect);
      } else {
        promise = this._protocolConnection.handshake(reconnect, this._reconnectToken, {});
      }

      return promise.then(function (response: HandshakeResponse): HandshakeResponse {
        self._clientId = response.clientId;
        self._reconnectToken = response.reconnectToken;
        self._connectionState = ConnectionState.CONNECTED;
        return response;
      });
    }
  }

  export interface ConvergenceConnectionListener {
    onConnected(): void;
    onInterrupted(): void;
    onReconnected(): void;
    onDisconnected(): void;
    onError(error: string): void;
    onMessage(message: IncomingProtocolNormalMessage): void;
    onRequest(message: IncomingProtocolRequestMessage, replyCallback: ReplyCallback): void;
  }

  export enum ConnectionState {
    DISCONNECTED, CONNECTING, CONNECTED, INTERRUPTED, DISCONNECTING
  }
}
