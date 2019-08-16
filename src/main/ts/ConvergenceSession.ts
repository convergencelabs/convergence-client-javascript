import {ConvergenceConnection} from "./connection/ConvergenceConnection";
import {ConvergenceDomain} from "./ConvergenceDomain";
import {DomainUser} from "./identity";

/**
 * This represents connection state information for a
 * particular connection to a specific domain.  It is tied to the client device
 * rather than the user, so a single user could potentially have multiple sessions
 * open at a time.
 */
export class ConvergenceSession {

  /**
   * @hidden
   * @internal
   */
  private readonly _domain: ConvergenceDomain;

  /**
   * @hidden
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  private _sessionId: string;

  /**
   * @hidden
   * @internal
   */
  private _user: DomainUser;

  /**
   * @hidden
   * @internal
   */
  private _reconnectToken: string;

  /**
   * @hidden
   * @internal
   */
  private _authenticated: boolean;

  /**
   * @hidden
   * @internal
   */
  constructor(domain: ConvergenceDomain,
              connection: ConvergenceConnection,
              user: DomainUser,
              sessionId: string,
              reconnectToken: string) {
    this._domain = domain;
    this._sessionId = sessionId;
    this._user = user;
    this._reconnectToken = reconnectToken;
    this._connection = connection;
    this._authenticated = false;
  }

  /**
   * @returns The ConvergenceDomain for this session
   */
  public domain(): ConvergenceDomain {
    return this._domain;
  }

  /**
   * @returns The sessionId of the connected client
   */
  public sessionId(): string {
    return this._sessionId;
  }

  /**
   * @returns The user associated with the authenticated client or null if not authenticated
   */
  public user(): DomainUser {
    return this._user;
  }

  /**
   * @returns The reconnectToken for the authenticated client or null if not authenticated
   */
  public reconnectToken(): string {
    return this._reconnectToken;
  }

  /**
   * @returns True if the client is authenticated
   */
  public isAuthenticated(): boolean {
    return this._authenticated;
  }

  /**
   * @returns True if the client is connected to the domain
   */
  public isConnected(): boolean {
    return this._connection.isConnected();
  }

  /**
   * @hidden
   * @internal
   */
  public _setAuthenticated(authenticated: boolean): void {
    this._authenticated = authenticated;
  }

  /**
   * @hidden
   * @internal
   */
  public _setSessionId(sessionId: string): void {
    this._sessionId = sessionId;
  }

  /**
   * @hidden
   * @internal
   */
  public _setUser(user: DomainUser): void {
    this._user = user;
  }

  /**
   * @hidden
   * @internal
   */
  public _setReconnectToken(reconnectToken: string): void {
    this._reconnectToken = reconnectToken;
  }

}
