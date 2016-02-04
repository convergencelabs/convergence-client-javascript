import EventEmitter from "./util/EventEmitter";
import ConvergenceConnection from "./connection/ConvergenceConnection";
import Session from "./Session";
import ModelService from "./model/ModelService";
import {HandshakeResponse} from "./protocol/handhsake";

export default class ConvergenceDomain extends EventEmitter {

  static Events: any = {
    CONNECTED: "connected",
    INTERRUPTED: "interrupted",
    RECONNECTED: "reconnected",
    DISCONNECTED: "disconnected"
  };

  private _modelService: ModelService;
  private _connection: ConvergenceConnection;
  private _connectPromise: Promise<HandshakeResponse>;

  /**
   * Constructs a new ConvergenceDomain using the default options.
   *
   * @param url
   *            The url of the convergence domain to connect to.
   */
  constructor(url: string) {
    super();

    var self: ConvergenceDomain = this;

    // todo make this optional params
    this._connection = new ConvergenceConnection(
      url,
      5, // connection timeout in seconds
      -1, // max retries,
      1, // reconnection interval in seconds
      true,
      this
    );

    this._connection.on(ConvergenceConnection.Events.CONNECTED, () =>
      this.emit(ConvergenceDomain.Events.CONNECTED));

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, () =>
      this.emit(ConvergenceDomain.Events.INTERRUPTED));

    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, () =>
      this.emit(ConvergenceDomain.Events.DISCONNECTED));

    this._connection.on(ConvergenceConnection.Events.RECONNECTED, () =>
      this.emit(ConvergenceDomain.Events.RECONNECTED));

    this._connection.on(ConvergenceConnection.Events.ERROR, () => {
      // todo what to do?
    });

    this._modelService = new ModelService(this._connection);

    this._connectPromise = this._connection.connect().then(function (response: HandshakeResponse): HandshakeResponse {
      return response;
    }).catch<HandshakeResponse>(function (reason: Error): Promise<HandshakeResponse> {
      self._connection = null;
      console.log("Error connecting to domain: " + reason);
      return this;
    });
  }

  authenticateWithPassword(username: string, password: string): Promise<void> {
    return this._connection.authenticateWithPassword(username, password);
  }

  authenticateWithToken(token: string): Promise<void> {
    return this._connection.authenticateWithToken(token);
  }

  isAuthenticated(): boolean {
    return this._connection.session().isAuthenticated();
  }

  /**
   * Gets the session of the connected user.
   * @return The users session.
   */
  session(): Session {
    return this._connection.session();
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
}
