import {
  ConvergenceConnection,
  AuthResponse,
  IConnectionErrorEvent,
  IConnectionScheduledEvent, IAuthenticatingEvent, IAuthenticationFailedEvent
} from "./connection/ConvergenceConnection";
import {IConvergenceOptions} from "./IConvergenceOptions";
import {ConvergenceSession} from "./ConvergenceSession";
import {ModelService} from "./model/";
import {ActivityService} from "./activity/";
import {IdentityService} from "./identity/";
import {PresenceService, UserPresence} from "./presence/";
import {ChatService} from "./chat/";
import {ConvergenceError, ConvergenceEventEmitter, StringMap} from "./util/";
import {
  ErrorEvent,
  IConvergenceDomainEvent,
  ConnectedEvent,
  ConnectionScheduledEvent,
  ConnectingEvent,
  ConnectionFailedEvent,
  AuthenticatingEvent,
  AuthenticatedEvent,
  AuthenticationFailedEvent,
  InterruptedEvent,
  DisconnectedEvent
} from "./events/";
import {Validation} from "./util";
import {io} from "@convergence-internal/convergence-proto";
import {IdentityCache} from "./identity/IdentityCache";
import IHandshakeResponseMessage = io.convergence.proto.IHandshakeResponseMessage;
import {ConvergenceOptions} from "./ConvergenceOptions";
import {IUsernameAndPassword} from "./IUsernameAndPassword";

/**
 * The ConvergenceDomain represents a single connection to a specific
 * Convergence Domain. All interactions with the Domain can be achieve through
 * the ConvergenceDomain API. The ConvergenceDomain provides several "services"
 * that provide access to RealTimeModels, Users, Activities, Presence, and
 * Chat.
 */
export class ConvergenceDomain extends ConvergenceEventEmitter<IConvergenceDomainEvent> {

  public static readonly Events = {
    CONNECTION_SCHEDULED: ConnectionScheduledEvent.NAME,
    CONNECTING: ConnectingEvent.NAME,
    CONNECTED: ConnectedEvent.NAME,
    CONNECTION_FAILED: ConnectionFailedEvent.NAME,

    AUTHENTICATING: AuthenticatingEvent.NAME,
    AUTHENTICATED: AuthenticatedEvent.NAME,
    AUTHENTICATION_FAILED: AuthenticationFailedEvent.NAME,

    INTERRUPTED: InterruptedEvent.NAME,
    DISCONNECTED: DisconnectedEvent.NAME,

    ERROR: ErrorEvent.NAME
  };

  private static _toPromiseCallback<T>(value?: T | (() => Promise<T>)): (() => Promise<T>) {
    if (value === undefined) {
      return () => Promise.resolve(undefined as T);
    } else {
      const promiseCallback = typeof value === "function" ?
        value as (() => Promise<T>) :
        () => Promise.resolve(value as T);
      return promiseCallback;
    }
  }

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
  private readonly _options: ConvergenceOptions;

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

    this._options = new ConvergenceOptions(options || {});

    this._disposed = false;

    this._connection = new ConvergenceConnection(url, this);

    this._connection.on(ConvergenceConnection.Events.CONNECTED,
      () => this._emitEvent(new ConnectedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.CONNECTING,
      () => this._emitEvent(new ConnectingEvent(this)));
    this._connection.on(ConvergenceConnection.Events.CONNECTION_SCHEDULED,
      (e: IConnectionScheduledEvent) => this._emitEvent(new ConnectionScheduledEvent(this, e.delay)));
    this._connection.on(ConvergenceConnection.Events.CONNECTION_FAILED,
      () => this._emitEvent(new ConnectionFailedEvent(this)));

    this._connection.on(ConvergenceConnection.Events.AUTHENTICATING,
      (e: IAuthenticatingEvent) => this._emitEvent(new AuthenticatingEvent(this, e.method)));
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATED,
      (e: IAuthenticatingEvent) => this._emitEvent(new AuthenticatedEvent(this, e.method)));
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATION_FAILED,
      (e: IAuthenticationFailedEvent) => this._emitEvent(new AuthenticationFailedEvent(this, e.method)));

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED,
      () => this._emitEvent(new InterruptedEvent(this)));
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED,
      () => this._emitEvent(new DisconnectedEvent(this)));

    this._connection.on(ConvergenceConnection.Events.ERROR,
      (evt: IConnectionErrorEvent) => this._emitEvent(new ErrorEvent(this, evt.error.message))
    );
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
  public options(): ConvergenceOptions {
    return this._options;
  }

  /**
   * @returns
   *  The ConvergenceSession object for this domain.
   */
  public namespace(): string {
    return this._namespace;
  }

  /**
   * @returns
   *  The ConvergenceSession object for this domain.
   */
  public id(): string {
    return this._id;
  }

  /**
   * @returns
   *  The ConvergenceSession object for this domain.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Gets the ModelService, which is used for interacting with Real Time Models
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
   * domain users.
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
   * Gets the ActivityService, which is used for interacting with Activities.
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
   * Gets the PresenceService, which is used to gain insight into the presence
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
   * Gets the ChatService, which is used to send and receive chat messages.
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
    if (this._modelService !== undefined) {
      this._modelService._dispose();
    }
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
    return this
      ._connect()
      .then(() => {
        return promiseCallback();
      })
      .then((creds: IUsernameAndPassword) => {
        Validation.assertNonEmptyString(creds.username, "username");
        Validation.assertNonEmptyString(creds.password, "password");
        return this._authenticateWithPassword(creds.username, creds.password);
      });
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
    return this
      ._connect()
      .then(() => {
        return promiseCallback();
      })
      .then((d) => this._authenticateAnonymously(d));
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
    return this
      ._connect()
      .then(() => {
        return promiseCallback();
      })
      .then((j: string) => {
        Validation.assertNonEmptyString(j, "jwt");
        return this._authenticateWithJwt(j);
      });
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
  public reconnect(token: string): Promise<void> {
    Validation.assertNonEmptyString(token, "token");
    return this._connect().then(() => this._authenticateWithReconnectToken(token));
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
