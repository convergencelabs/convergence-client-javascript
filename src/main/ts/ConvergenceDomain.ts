import {ConvergenceConnection, AuthResponse, IConnectionErrorEvent} from "./connection/ConvergenceConnection";
import {IConvergenceOptions} from "./IConvergenceOptions";
import {ConvergenceSession} from "./ConvergenceSession";
import {ModelService} from "./model/";
import {ActivityService} from "./activity/";
import {IdentityService} from "./identity/";
import {PresenceService, UserPresence} from "./presence/";
import {ChatService} from "./chat/";
import {ConvergenceEventEmitter, StringMap} from "./util/";
import {
  ConnectionErrorEvent,
  IConvergenceDomainEvent,
  ConnectedEvent,
  InterruptedEvent,
  ReconnectedEvent,
  DisconnectedEvent
} from "./events/";
import {Validation} from "./util";
import {io} from "@convergence-internal/convergence-proto";
import {IdentityCache} from "./identity/IdentityCache";
import IHandshakeResponseMessage = io.convergence.proto.IHandshakeResponseMessage;

/**
 * This represents a single connection to a specific Domain in
 * Convergence. All interactions with the Domain start with this class, through
 * several "services" that provide access to
 * [Models (data)](https://docs.convergence.io/guide/models/model-service.html),
 * [Users and Groups](https://docs.convergence.io/guide/identity/overview.html),
 * [Activities](https://docs.convergence.io/guide/activities/overview.html),
 * [Presence](https://docs.convergence.io/guide/presence/overview.html), and
 * [Chat](https://docs.convergence.io/guide/chat/overview.html).
 *
 * This object itself is the result of a successful authentication to Convergence.
 */
export class ConvergenceDomain extends ConvergenceEventEmitter<IConvergenceDomainEvent> {

  public static readonly Events = {
    CONNECTED: ConnectedEvent.NAME,
    INTERRUPTED: InterruptedEvent.NAME,
    RECONNECTED: ReconnectedEvent.NAME,
    DISCONNECTED: DisconnectedEvent.NAME,
    ERROR: ConnectionErrorEvent.NAME
  };

  /**
   * @internal
   */
  private static readonly DefaultOptions: IConvergenceOptions = {
    connectionTimeout: 5,
    maxReconnectAttempts: -1,
    reconnectInterval: 5,
    retryOnOpen: true
  };

  /**
   * @internal
   */
  private _modelService: ModelService;

  /**
   * @internal
   */
  private _identityService: IdentityService;

  /**
   * @internal
   */
  private _activityService: ActivityService;

  /**
   * @internal
   */
  private _presenceService: PresenceService;

  /**
   * @internal
   */
  private _chatService: ChatService;

  /**
   * @internal
   */
  private _identityCache: IdentityCache;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private _options: IConvergenceOptions;

  /**
   * @internal
   */
  private _disposed: boolean;

  /**
   * @internal
   */
  private _id: string;

  /**
   * @internal
   */
  private _namespace: string;

  /**
   * Constructs a new ConvergenceDomain using the default options.
   *
   * @hidden
   * @internal
   *
   * @param url
   *   The url of the convergence domain to connect to.
   * @param options
   *   Options that configure how the convergence domain is configured.
   */
  constructor(url: string, options?: IConvergenceOptions) {
    super();

    if (!Validation.nonEmptyString(url)) {
      throw new Error("The Convergence connection url must be provided.");
    }

    this._options = options === undefined ?
      ConvergenceDomain.DefaultOptions :
      {...ConvergenceDomain.DefaultOptions, ...options};

    this._disposed = false;

    // todo make this optional params
    this._connection = new ConvergenceConnection(
      url,
      this._options.connectionTimeout,
      this._options.maxReconnectAttempts,
      this._options.reconnectInterval,
      this._options.retryOnOpen,
      this._options.webSocketFactory,
      this._options.webSocketClass,
      this
    );

    this._connection.on(ConvergenceConnection.Events.CONNECTED, () => this._emitEvent(new ConnectedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, () => this._emitEvent(new InterruptedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, () => this._emitEvent(new DisconnectedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.RECONNECTED, () => this._emitEvent(new ReconnectedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.ERROR, (evt: IConnectionErrorEvent) =>
      this._emitEvent(new ConnectionErrorEvent(this, evt.error.message))
    );
  }

  /**
   * @returns The namespace of this domain.
   */
  public namespace(): string {
    return this._namespace;
  }

  /**
   * @returns The unique ID of this domain.
   */
  public id(): string {
    return this._id;
  }

  /**
   * @returns The ConvergenceSession attached to this domain.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Gets the ModelService, which is used for interacting with
   * [Real Time Models](https://docs.convergence.io/guide/models/overview.html).
   *
   * ```typescript
   * const modelService = domain.models();
   * ```
   *
   * @return
   *   The ModelService for this ConvergenceDomain.
   */
  public models(): ModelService {
    return this._modelService;
  }

  /**
   * Gets the IdentityService, which is used for obtaining information about
   * [Users](https://docs.convergence.io/guide/identity/overview.html).
   *
   * ```typescript
   * const identityService = domain.identity();
   * ```
   *
   * @return
   *   The IdentityService for this ConvergenceDomain.
   */
  public identity(): IdentityService {
    return this._identityService;
  }

  /**
   * Gets the ActivityService, which is used for interacting with
   * [Activities](https://docs.convergence.io/guide/activities/overview.html).
   *
   * ```typescript
   * const activityService = domain.activities();
   * ```
   *
   * @return
   *   The ActivityService from this ConvergenceDomain.
   */
  public activities(): ActivityService {
    return this._activityService;
  }

  /**
   * Gets the PresenceService, which is used to gain insight into the
   * [presence](https://docs.convergence.io/guide/presence/overview.html)
   * of Domain Users.
   *
   * @example
   * ```typescript
   *
   * const presenceService = domain.presence();
   * ```
   *
   * @return
   *   The PresenceService for this ConvergenceDomain.
   */
  public presence(): PresenceService {
    return this._presenceService;
  }

  /**
   * Gets the ChatService, which is used to send and receive
   * [chat messages](https://docs.convergence.io/guide/chat/overview.html).
   *
   * @example
   * ```typescript
   *
   * const chatService = domain.chat();
   * ```
   *
   * @return
   *   The ChatService for this ConvergenceDomain.
   */
  public chat(): ChatService {
    return this._chatService;
  }

  /**
   * Disconnects from the server and releases all resources this domain is
   * using. After calling dispose(), the domain will no longer be usable.
   *
   * @example
   * ```typescript
   *
   * domain.dispose()
   *   .then(() => console.log("disposed!"))
   *   .catch(e => console.error(e));
   * ```
   *
   * @return
   *   A promise that is resolved when the ConvergenceDomain is disposed.
   */
  public dispose(): Promise<void> {
    this._disposed = true;
    this._modelService._dispose();
    return this._connection.disconnect();
  }

  /**
   * Determines if this domain is disposed.
   *
   * @return
   *   True if the domain is disposed; false otherwise.
   */
  public isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateWithPassword(username: string, password: string): Promise<void> {
    return this._connection.authenticateWithPassword(username, password).then(m => this._init(m));
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateWithJwt(jwt: string): Promise<void> {
    return this._connection.authenticateWithJwt(jwt).then(m => this._init(m));
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateWithReconnectToken(token: string): Promise<void> {
    return this._connection.authenticateWithReconnectToken(token).then(m => this._init(m));
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateAnonymously(displayName?: string): Promise<void> {
    return this._connection.authenticateAnonymously(displayName).then(m => this._init(m));
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _connect(): Promise<void> {
    return this._connection.connect()
      .then((response: IHandshakeResponseMessage) => {
        this._namespace = response.namespace;
        this._id = response.id;
        return;
      });
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  private _init(m: AuthResponse): void {
    const session: ConvergenceSession = this._connection.session();
    const presenceState: Map<string, any> = StringMap.objectToMap(m.state || {});
    const initialPresence: UserPresence = new UserPresence(session.user(), true, presenceState);
    this._identityCache = new IdentityCache(this._connection);
    this._modelService = new ModelService(this._connection, this._identityCache);
    this._identityService = new IdentityService(this._connection);
    this._activityService = new ActivityService(this._connection, this._identityCache);
    this._presenceService = new PresenceService(this._connection, initialPresence, this._identityCache);
    this._chatService = new ChatService(this._connection, this._identityCache);
  }
}

Object.freeze(ConvergenceDomain.Events);
