import {
  ConvergenceConnection,
  IAuthenticatedEvent,
  IAuthenticatingEvent,
  IAuthenticationFailedEvent,
  IConnectionErrorEvent,
  IConnectionScheduledEvent
} from "./connection/ConvergenceConnection";
import {IConvergenceOptions} from "./IConvergenceOptions";
import {ConvergenceSession} from "./ConvergenceSession";
import {ModelService} from "./model/";
import {ActivityService} from "./activity/";
import {IdentityService} from "./identity/";
import {PresenceService} from "./presence/";
import {ChatService} from "./chat/";
import {ConvergenceEventEmitter, StringMap} from "./util/";
import {
  AuthenticatedEvent,
  AuthenticatingEvent,
  AuthenticationFailedEvent,
  ConnectedEvent,
  ConnectingEvent,
  ConnectionFailedEvent,
  ConnectionScheduledEvent,
  DisconnectedEvent,
  ErrorEvent,
  IConvergenceDomainEvent,
  InterruptedEvent
} from "./events/";
import {Validation} from "./util/Validation";
import {IdentityCache} from "./identity/IdentityCache";
import {ConvergenceOptions} from "./ConvergenceOptions";
import {IUsernameAndPassword} from "./IUsernameAndPassword";
import {getOrDefaultObject, protoValueToJson} from "./connection/ProtocolUtil";
import {mapObjectValues} from "./util/ObjectUtils";
import {StorageEngine} from "./storage/StorageEngine";
import {TypeChecker} from "./util/TypeChecker";

/**
 * This represents a single connection to a specific Domain in
 * Convergence. All interactions with the Domain start with this class, through
<<<<<<< HEAD
 * several "services" that provide the following functionality:
 *
 * - [[ModelService]]: Manage [models (data)](https://docs.convergence.io/guide/models/model-service.html)
 * - [[Identity Service]]: Manage [users and groups](https://docs.convergence.io/guide/identity/overview.html)
 * - [[ActivityService]]: Manage [activities](https://docs.convergence.io/guide/activities/overview.html)
 * - [[PresenceService]]: Manage [presence](https://docs.convergence.io/guide/presence/overview.html)
 * - [[ChatService]]: Create [chat](https://docs.convergence.io/guide/chat/overview.html)s and send and receive messages
=======
 * several "services" that provide access to:
 * - [Models (data)](https://docs.convergence.io/guide/models/model-service.html)
 * - [Users and Groups](https://docs.convergence.io/guide/identity/overview.html)
 * - [Activities](https://docs.convergence.io/guide/activities/overview.html)
 * - [Presence](https://docs.convergence.io/guide/presence/overview.html)
 * - [Chat](https://docs.convergence.io/guide/chat/overview.html)
>>>>>>> 9e5c8bdb8162feb63e80eed96ea39f7d2d1a5d12
 *
 * This object itself is the result of a successful connection and authentication
 * to a Convergence server via one of the [[Convergence]] connection methods.
 * Or, to begin working in an offline state, instantiate this class directly.
 *
 * See the [[Events]] section for all the possible events that could be emitted
 * from a domain.
 */
export class ConvergenceDomain extends ConvergenceEventEmitter<IConvergenceDomainEvent> {

  /**
   * A list of all the events that could be emitted from a domain.
   */
  public static readonly Events = {
    /**
     * Emitted when the domain is scheduled to attempt to reconnect.
     * The actual emitted event is a [[ConnectionScheduledEvent]].
     *
     * @event [[ConnectionScheduledEvent]]
     */
    CONNECTION_SCHEDULED: ConnectionScheduledEvent.NAME,

    /**
     * Emitted when the domain is actively attempting to connect to the server.
     * The actual emitted event is a [[ConnectingEvent]].
     *
     * @event [[ConnectingEvent]]
     */
    CONNECTING: ConnectingEvent.NAME,

    /**
     * Emitted when the domain successfully (re)connected to the server.
     * The actual emitted event is a [[ConnectedEvent]].
     *
     * @event [[ConnectedEvent]]
     */
    CONNECTED: ConnectedEvent.NAME,

    /**
     * Emitted when a connection attempt failed. The actual emitted event is
     * a [[ConnectionFailedEvent]].
     *
     * @event [[ConnectionFailedEvent]]
     */
    CONNECTION_FAILED: ConnectionFailedEvent.NAME,

    /**
     * Emitted when the domain is actively attempting to authenticate.
     * The actual emitted event is an [[AuthenticatingEvent]].
     *
     * @event [[AuthenticatingEvent]]
     */
    AUTHENTICATING: AuthenticatingEvent.NAME,

    /**
     * Emitted when the domain successfully (re)authenticated.
     * The actual emitted event is an [[AuthenticatedEvent]].
     *
     * @event [[AuthenticatedEvent]]
     */
    AUTHENTICATED: AuthenticatedEvent.NAME,

    /**
     * Emitted when the domain attempted to (re)authenticate but failed.
     * The actual emitted event is an [[AuthenticationFailedEvent]].
     *
     * @event [[AuthenticationFailedEvent]]
     */
    AUTHENTICATION_FAILED: AuthenticationFailedEvent.NAME,

    /**
     * Emitted when the domain's connection was interrupted. This indicates that
     * the domain is in a state where it is currently disconnected, but is
     * automatically and continuously attempting to reconnect.
     *
     * The actual emitted event is an [[InterruptedEvent]].
     *
     * @event [[InterruptedEvent]]
     */
    INTERRUPTED: InterruptedEvent.NAME,

    /**
     * Emitted when the domain is currently disconnected and is not attempting
     * to automatically reconnect. The actual emitted event is a [[DisconnectedEvent]].
     *
     * @event [[DisconnectedEvent]]
     */
    DISCONNECTED: DisconnectedEvent.NAME,

    /**
     * Emitted when the domain encountered an unexpected error.
     * The actual emitted event is an [[ErrorEvent]].
     *
     * @event [[ErrorEvent]]
     */
    ERROR: ErrorEvent.NAME
  };

  /**
   * @hidden
   * @internal
   */
  private static _toPromiseCallback<T>(value?: T | (() => Promise<T>)): (() => Promise<T>) {
    if (value === undefined) {
      return () => Promise.resolve(undefined as T);
    } else {
      return typeof value === "function" ?
        value as (() => Promise<T>) :
        () => Promise.resolve(value as T);
    }
  }

  /**
   * @internal
   */
  private readonly _modelService: ModelService;

  /**
   * @internal
   */
  private readonly _identityService: IdentityService;

  /**
   * @internal
   */
  private readonly _activityService: ActivityService;

  /**
   * @internal
   */
  private readonly _presenceService: PresenceService;

  /**
   * @internal
   */
  private readonly _chatService: ChatService;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @internal
   */
  private readonly _namespace: string;

  /**
   * @internal
   */
  private readonly _domainId: string;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _storage: StorageEngine;

  /**
   * @internal
   */
  private readonly _options: ConvergenceOptions;

  /**
   * @internal
   */
  private _initialized: boolean;

  /**
   * @internal
   */
  private _disposed: boolean;

  /**
   * Constructs a new ConvergenceDomain using the default options.
   *
   * @param url
   *   The url of the convergence domain to connect to.
   * @param options
   *   Options that configure how the convergence domain is configured.
   */
  constructor(url: string, options?: IConvergenceOptions) {
    super();

    Validation.assertString(url, "url");

    const urlExpression = /^(https?|wss?):\/{2}(.+)\/(.+)\/(.+)/;

    const urlParts = urlExpression.exec(url.trim());
    if (!urlParts || urlParts.length !== 5) {
      throw new Error(`Invalid url: ${url}`);
    }

    this._namespace = urlParts[3];
    this._domainId = urlParts[4];

    this._options = new ConvergenceOptions(options || {});

    this._disposed = false;
    this._initialized = false;

    this._connection = new ConvergenceConnection(url, this, this._options);

    this._storage = new StorageEngine();

    this._identityCache = new IdentityCache(this._connection);
    this._modelService = new ModelService(this._connection, this._identityCache, this._storage);
    this._identityService = new IdentityService(this._connection);
    this._activityService = new ActivityService(this._connection, this._identityCache);
    // FIXME if we have a username we should construct a user, and potentially get from the cache.
    this._presenceService = new PresenceService(this._connection, this._identityCache, undefined);
    this._chatService = new ChatService(this._connection, this._identityCache);

    this._bindConnectionEvents();
  }

  /**
   * @returns
   *   The url of the domain.
   */
  public url(): string {
    return this._connection.url();
  }

  /**
   * @returns
   *  The resolved options for this domain.
   */
  public options(): IConvergenceOptions {
    return this._options.getOptions();
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
    return this._domainId;
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
  public dispose(): void {
    this._disposed = true;
    if (this._modelService !== undefined) {
      this._modelService._dispose();
    }

    this._connection.disconnect();
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
   * Connects to a Convergence Domain using username / password authentication.
   *
   * @param credentials
   *   The username and password of the Convergence Domain User to connect as.
   *   The credentials can be supplied directly or can be supplied as a factory
   *   function that will return a promise to obtain them.
   *
   * @returns
   *   A Promise which will be resolved upon successful connection and authentication.
   */
  public connectWithPassword(credentials: IUsernameAndPassword | (() => Promise<IUsernameAndPassword>)): Promise<void> {
    const promiseCallback = ConvergenceDomain._toPromiseCallback(credentials);
    return this._connection
      .connect()
      .then(() => promiseCallback())
      .then((creds: IUsernameAndPassword) => {
        Validation.assertNonEmptyString(creds.username, "username");
        Validation.assertNonEmptyString(creds.password, "password");
        return this._authenticateWithPassword(creds);
      })
      .then(() => this._init(this._connection.session().user().username));
  }

  /**
   * Connects to a Convergence Domain using anonymous authentication.
   *
   * @param displayName
   *   The optional display name to use for the anonymous user.
   *   The display name can be supplied directly or can be supplied as a
   *   factory function that will return a promise to obtain it.
   *
   * @returns
   *   A Promise which will be resolved upon successful connection and authentication.
   */
  public connectAnonymously(displayName?: string | (() => Promise<string>)): Promise<void> {
    const promiseCallback = ConvergenceDomain._toPromiseCallback(displayName);
    return this._connection
      .connect()
      .then(() => promiseCallback())
      .then((d) => this._authenticateAnonymously(d))
      .then(() => this._init(this._connection.session().user().username));
  }

  /**
   * Connects to a Convergence Domain using a JSON Web Token (JWT) for
   * authentication.
   *
   * @param jwt
   *   A valid JSON Web Token (JWT) indicating the Domain User to connect as.
   *   The JWT can be supplied directly or can be supplied as a factory
   *   function that will return a promise to obtain it.
   *
   * @returns
   *   A Promise which will be resolved upon successful connection and authentication.
   */
  public connectWithJwt(jwt: string | (() => Promise<string>)): Promise<void> {
    const promiseCallback = ConvergenceDomain._toPromiseCallback(jwt);
    return this._connection
      .connect()
      .then(() => promiseCallback())
      .then((j: string) => {
        Validation.assertNonEmptyString(j, "jwt");
        return this._authenticateWithJwt(j);
      })
      .then(() => this._init(this._connection.session().user().username));
  }

  /**
   * Reconnects to the specified domain using a previously generated reconnect
   * token.
   *
   * @param token
   *   The reconnect token to use for authentication.
   *
   * @returns
   *   A Promise which will be resolved upon successful connection and authentication.
   */
  public reconnect(token?: string | (() => Promise<string>)): Promise<void> {
    token = token || this._connection.session().reconnectToken();
    if (!TypeChecker.isSet(token)) {
      return Promise.reject(new Error("No reconnect token was provided, and there is not one in memory"));
    } else {
      const promiseCallback = ConvergenceDomain._toPromiseCallback(token);
      return this._connection
        .connect()
        .then(() => promiseCallback())
        .then((t) => {
          Validation.assertNonEmptyString(t, "token");
          return this._authenticateWithReconnectToken(t);
        })
        .then(() => this._init(this._connection.session().user().username));
    }
  }

  public connectOffline(username?: string | (() => Promise<string>)): Promise<void> {
    const promiseCallback = ConvergenceDomain._toPromiseCallback(username);

    if (TypeChecker.isNotSet(username) && TypeChecker.isNotSet(this._options.offlineKey)) {
      throw new Error("An offline key or username must be provided in the options to connect offline.");
    }

    return promiseCallback().then(uname => {
      return this._init(uname);
    });
  }

  /**
   * Disconnects from the server.
   */
  public disconnect(): void {
    this._connection.disconnect();
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateWithPassword(credentials: IUsernameAndPassword): Promise<void> {
    return this._connection
      .authenticateWithPassword(credentials)
      .then(() => undefined);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateWithJwt(jwt: string): Promise<void> {
    return this._connection
      .authenticateWithJwt(jwt)
      .then(() => undefined);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateWithReconnectToken(token: string): Promise<void> {
    return this._connection
      .authenticateWithReconnectToken(token)
      .then(() => undefined);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _authenticateAnonymously(displayName?: string): Promise<void> {
    return this._connection
      .authenticateAnonymously(displayName)
      .then(() => undefined);
  }

  /**
   * @hidden
   * @private
   */
  private _bindConnectionEvents(): void {
    this._connection.on(ConvergenceConnection.Events.CONNECTING,
      () => this._emitEvent(new ConnectingEvent(this)));
    this._connection.on(ConvergenceConnection.Events.CONNECTED,
      () => this._emitEvent(new ConnectedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.CONNECTION_SCHEDULED,
      (e: IConnectionScheduledEvent) => this._emitEvent(new ConnectionScheduledEvent(this, e.delay)));
    this._connection.on(ConvergenceConnection.Events.CONNECTION_FAILED,
      () => this._emitEvent(new ConnectionFailedEvent(this)));

    this._connection.on(ConvergenceConnection.Events.AUTHENTICATING,
      (e: IAuthenticatingEvent) => this._emitEvent(new AuthenticatingEvent(this, e.method)));
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATED,
      (e: IAuthenticatedEvent) => {
        this._emitEvent(new AuthenticatedEvent(this, e.method));
        this._onAuthenticated(e);
      });
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATION_FAILED,
      (e: IAuthenticationFailedEvent) => this._emitEvent(new AuthenticationFailedEvent(this, e.method)));

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, () => {
      this._emitEvent(new InterruptedEvent(this));
    });
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, () => {
      this._emitEvent(new DisconnectedEvent(this));
    });

    this._connection.on(ConvergenceConnection.Events.ERROR,
      (evt: IConnectionErrorEvent) => this._emitEvent(new ErrorEvent(this, evt.error.message))
    );
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  private _init(username: string): Promise<void> {
    // FIXME perhaps this should take a user so we can tell the user type
    if (this._options.storageAdapter) {
      // FIXME do we need to make sure we are not an anonymous user here?
      this._storage.configure(this._options.storageAdapter);
      return this._storage.openStore(this._namespace, this._domainId, username, this._options.offlineKey)
        .then(() => {
          this._initialized = true;
        });
    } else {
      this._initialized = true;
      return Promise.resolve();
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  private _onAuthenticated(authEvent: IAuthenticatedEvent): void {
    const state = mapObjectValues(getOrDefaultObject(authEvent.state), protoValueToJson);
    this._presenceService._setInternalState(StringMap.objectToMap(state));
  }
}

Object.freeze(ConvergenceDomain.Events);
