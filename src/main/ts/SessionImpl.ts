import {ConvergenceConnection} from "./connection/ConvergenceConnection";
import {ConvergenceDomain} from "./ConvergenceDomain";
import {Session} from "./Session";

export class SessionImpl implements Session {

  private _domain: ConvergenceDomain;
  private _connection: ConvergenceConnection;
  private _sessionId: string;
  private _username: string;
  private _reconnectToken: string;
  private _authenticated: boolean;

  constructor(domain: ConvergenceDomain, connection: ConvergenceConnection,
              sessionId: string, username: string, reconnectToken: string) {
    this._domain = domain;
    this._sessionId = sessionId;
    this._username = username;
    this._reconnectToken = reconnectToken;
    this._connection = connection;
    this._authenticated = false;
  }

  /**
   * @return The ConvergenceDomain for this session
   */
  public domain(): ConvergenceDomain {
    return this._domain;
  }

  public _setSessionId(sessionId: string): void {
    this._sessionId = sessionId;
  }

  /**
   * @return The sessionId of the connected client
   */
  public sessionId(): string {
    return this._sessionId;
  }

  /**
   * @return The username of the authenticated client or null if not authenticated
   */
  public username(): string {
    return this._username;
  }

  public _setUsername(username: string): void {
    this._username = username;
  }

  /**
   * @return The reconnectToken for the authenticated client or null if not authenticated
   */
  public reconnectToken(): string {
    return this._reconnectToken;
  }

  public _setReconnectToken(reconnectToken: string): void {
    this._reconnectToken = reconnectToken;
  }

  /**
   * @return True if the client is connected to the domain
   */
  public isConnected(): boolean {
    return this._connection.isConnected();
  }

  public setAuthenticated(authenticated: boolean): void {
    this._authenticated = authenticated;
  }

  /**
   * @return True if the client is authenticated
   */
  public isAuthenticated(): boolean {
    return this._authenticated;
  }
}
