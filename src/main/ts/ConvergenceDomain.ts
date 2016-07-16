import {ConvergenceConnection} from "./connection/ConvergenceConnection";
import Session from "./Session";
import ModelService from "./model/ModelService";
import {HandshakeResponse} from "./connection/protocol/handhsake";
import {debugFlags as flags} from "./Debug";
import {ConvergenceEventEmitter} from "./util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "./util/ConvergenceEvent";
import {ActivityService} from "./activity/ActivityService";
import {IdentityService} from "./identity/IdentityService";

export default class ConvergenceDomain extends ConvergenceEventEmitter {

  private static DefaultOptions: ConvergenceOptions = {
    connectionTimeout: 5,
    maxReconnectAttempts: -1,
    reconnectInterval: 5,
    retryOnOpen: true
  };

  static debugFlags: any = flags;

  static Events: any = {
    CONNECTED: "connected",
    INTERRUPTED: "interrupted",
    RECONNECTED: "reconnected",
    DISCONNECTED: "disconnected",
    ERROR: "error"
  };

  static connect(url: string, username: string, password: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    var domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithPassword(username, password);
    }).then((v) => {
      return domain;
    });
  }

  static connectWithToken(url: string, token: string, options?: ConvergenceOptions): Promise<ConvergenceDomain> {
    var domain: ConvergenceDomain = new ConvergenceDomain(url, options);
    return domain._connect().then((response) => {
      return domain._authenticateWithToken(token);
    }).then((v) => {
      return domain;
    });
  }

  private _modelService: ModelService;
  private _identityService: IdentityService;
  private _activityService: ActivityService;
  private _connection: ConvergenceConnection;
  private _options: ConvergenceOptions;

  /**
   * Constructs a new ConvergenceDomain using the default options.
   *
   * @param url
   *            The url of the convergence domain to connect to.
   */
  constructor(url: string, options?: ConvergenceOptions) {
    super();

    this._options = this._processOptions(options);

    // todo make this optional params
    this._connection = new ConvergenceConnection(
      url,
      this._options.connectionTimeout,
      this._options.maxReconnectAttempts,
      this._options.reconnectInterval,
      this._options.retryOnOpen,
      this
    );

    this._connection.on(ConvergenceConnection.Events.CONNECTED, () =>
      this.emitEvent({src: this, name: ConvergenceDomain.Events.CONNECTED}));

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, () =>
      this.emitEvent({src: this, name: ConvergenceDomain.Events.INTERRUPTED}));

    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, () =>
      this.emitEvent({src: this, name: ConvergenceDomain.Events.DISCONNECTED}));

    this._connection.on(ConvergenceConnection.Events.RECONNECTED, () =>
      this.emitEvent({src: this, name: ConvergenceDomain.Events.RECONNECTED}));

    this._connection.on(ConvergenceConnection.Events.ERROR, (error: string) => {
      var evt: ConvergenceErrorEvent = {src: this, name: ConvergenceDomain.Events.ERROR, error: error};
      this.emitEvent(evt);
    });

    this._modelService = new ModelService(this._connection);
    this._identityService = new IdentityService(this._connection);
    this._activityService = new ActivityService(this._connection);
  }

  // TODO seems like a jquery.extend approach here would be simpler.
  private _processOptions(options?: ConvergenceOptions): ConvergenceOptions {
    if (options === undefined) {
      options = ConvergenceDomain.DefaultOptions;
    } else {
      if (options.connectionTimeout === undefined) {
        options.connectionTimeout = ConvergenceDomain.DefaultOptions.connectionTimeout;
      }

      if (options.maxReconnectAttempts === undefined) {
        options.maxReconnectAttempts = ConvergenceDomain.DefaultOptions.maxReconnectAttempts;
      }

      if (options.reconnectInterval === undefined) {
        options.reconnectInterval = ConvergenceDomain.DefaultOptions.reconnectInterval;
      }

      if (options.retryOnOpen === undefined) {
        options.retryOnOpen = ConvergenceDomain.DefaultOptions.retryOnOpen;
      }
    }

    return options;
  }

  private _connect(): Promise<HandshakeResponse> {
    return this._connection.connect();
  }

  private _authenticateWithPassword(username: string, password: string): Promise<void> {
    return this._connection.authenticateWithPassword(username, password);
  }

  private _authenticateWithToken(token: string): Promise<void> {
    return this._connection.authenticateWithToken(token);
  }

  session(): Session {
    return this._connection.session();
  }

  modelService(): ModelService {
    return this._modelService;
  }

  identityService(): IdentityService {
    return this._identityService;
  }

  activityService(): ActivityService {
    return this._activityService;
  }

  dispose(): void {
    this._modelService._dispose();
    this._connection.disconnect();
    this._connection = undefined;
  }

  isDisposed(): boolean {
    return this._connection === undefined;
  }
}

interface ConvergenceErrorEvent extends ConvergenceEvent {
  error: string;
}
