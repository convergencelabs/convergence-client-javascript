import EventEmitter from "./util/EventEmitter";
import ConvergenceConnection from "./connection/ConvergenceConnection";
import SessionImpl from "./SessionImpl";
import MessageType from "./protocol/MessageType";
import {TokenAuthRequest} from "./protocol/authentication";
import Session from "./Session";
import ModelService from "./model/ModelService";
import {IncomingProtocolNormalMessage} from "./protocol/protocol";
import {IncomingProtocolRequestMessage} from "./protocol/protocol";
import {HandshakeResponse} from "./protocol/handhsake";
import {PasswordAuthRequest} from "./protocol/authentication";
import ReplyCallback = convergence.connection.ReplyCallback;
import {AuthRequest} from "./protocol/authentication";
import {AuthenticationResponseMessage} from "./protocol/authentication";
import ConvergenceConnectionListener from "./connection/ConvergenceConnection";

export default class ConvergenceDomain extends EventEmitter {

  private _modelService: ModelService;
  private _connection: ConvergenceConnection;
  private _session: SessionImpl;
  private _connectPromise: Q.Promise<HandshakeResponse>;

  /**
   * Constructs a new ConvergenceDomain using the default options.
   *
   * @param url
   *            The url of the convergence domain to connect to.
   */
  constructor(url: string) {
    super();

    // todo make this optional params
    this._connection = new ConvergenceConnection(url,
      5, // connection timeout in seconds
      -1, // max retries,
      1, // reconnection interval in seconds
      true, // retry on open
      {
        onConnected: function (): void {
        },
        onInterrupted: function (): void {
        },
        onReconnected: function (): void {
        },
        onDisconnected: function (): void {
        },
        onError: function (error: string): void {
        },
        onMessage: function (message: IncomingProtocolNormalMessage): void {
        },
        onRequest: function (message: IncomingProtocolRequestMessage, replyCallback: ReplyCallback): void {
        }
      }
    );

    this._session = new SessionImpl(this, this._connection, null, null);
    this._modelService = new ModelService(this._session);

    var self = this;
    this._connectPromise = this._connection.connect().then(function (response: HandshakeResponse): HandshakeResponse {
      self._session.setSessionId(response.clientId);
      return response;
    }).fail<HandshakeResponse>(function (reason: Error): Q.Promise<HandshakeResponse> {
      self._connection = null;
      console.debug("Error connecting to domain: " + reason);
      return this;
    });
  }

  /**
   * Authenticates the user with the given username and password.
   * @param {string} username - The username of the user
   * @param {string} password - The password of the user
   * @return {Q.Promise} A promise
   */
  authenticateWithPassword(username: string, password: string): Q.Promise<void> {
    var authRequest: PasswordAuthRequest = {
      type: MessageType.AUTHENTICATE,
      method: "password",
      username: username,
      password: password
    };
    return this._authenticate(authRequest);
  }

  /**
   * Authenticates the user with the given username.
   * @param {string} token - The identifier of the participant
   * @return {Q.Promise} A promise
   */
  authenticateWithToken(token: string): Q.Promise<void> {
    var authRequest: TokenAuthRequest = {
      type: MessageType.AUTHENTICATE,
      method: "token",
      token: token
    };
    return this._authenticate(authRequest);
  }

  isAuthenticated(): boolean {
    return false;
  }

  /**
   * Gets the session of the connected user.
   * @return {convergence.Session} The users session.
   */
  session(): Session {
    // TODO: implement this
    return null;
  }

  /**
   * Gets the ModelService
   */
  modelService(): ModelService {
    return this._modelService;
  }

  /**
   * Closes the connection to the server and disposes of the ConvergenceDomain
   */
  dispose(): void {
    this._connection.disconnect();
    this._connection = undefined;
  }

  /**
   * @returns {boolean} True if this ConvergenceDomain is disposed.
   */
  isDisposed(): boolean {
    return this._connection === undefined;
  }

  private _authenticate(authRequest: AuthRequest): Q.Promise<void> {
    if (this._session.isAuthenticated()) {
      // The user is only allowed to authenticate once.
      return Q.reject<void>(new Error("User already authenticated."));
    } else if (this._connection.isConnected()) {
      // We are connected already so we can just send the request.
      return this.sendAuthRequest(authRequest);
    } else if (this._connectPromise != null) {
      var self = this;
      // We are connecting so defer this until after we connect.
      return this._connectPromise.then(function () {
        return self.sendAuthRequest(authRequest);
      });
    } else {
      // We are not connecting and are not trying to connect.
      return Q.reject<void>(new Error("Must be connected or connecting to authenticate."));
    }
  }

  private sendAuthRequest(authRequest: AuthRequest): Q.Promise<void> {
    var self: ConvergenceDomain = this;
    return this._connection.request(authRequest).then(function (response: AuthenticationResponseMessage): void {
      if (response.success === true) {
        self._session.setUsername(response.username);
        return;
      } else {
        throw new Error("Authentication failed");
      }
    });
  }
}

export interface ConnectionListener extends ConvergenceConnectionListener {
  onConnected(): void;
  onInterrupted(): void;
  onReconnected(): void;
  onDisconnected(): void;
  onError(error: string): void;
  onMessage(message: IncomingProtocolNormalMessage): void;
  onRequest(message: IncomingProtocolRequestMessage, replyCallback: ReplyCallback): void;
}
