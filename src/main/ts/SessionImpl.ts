import ConvergenceConnection from "./connection/ConvergenceConnection";
import ConvergenceDomain from "./ConvergenceDomain";
import Session from "./Session";

export default class SessionImpl implements Session {

  private _domain: ConvergenceDomain;
  private _connection: ConvergenceConnection;
  private _sessionId: string;
  private _userame: string;
  private _authenticated: boolean;

  constructor(domain: ConvergenceDomain, connection: ConvergenceConnection, sessionId: string, username: string) {
    this._domain = domain;
    this._sessionId = sessionId;
    this._userame = username;
    this._connection = connection;
    this._authenticated = false;
  }

  /**
   * @return The ConvergenceDomain for this session
   */
  getConvergenceDomain(): ConvergenceDomain {
    return this._domain;
  }

  setSessionId(sessionId: string): void {
    this._sessionId = sessionId;
  }

  /**
   * @return The sessionId of the connected client
   */
  getSessionId(): string {
    return this._sessionId;
  }

  /**
   * @return The username of the authenticated client or null if not authenticated
   */
  getUsername(): string {
    return this._userame;
  }

  setUsername(username: string): void {
    this._userame = username;
  }

  /**
   * @return True if the client is connected to the domain
   */
  isConnected(): boolean {
    return this._connection.isConnected();
  }

  setAuthenticated(authenticated: boolean): void {
    this._authenticated = authenticated;
  }

  /**
   * @return True if the client is authenticated
   */
  isAuthenticated(): boolean {
    return this._authenticated;
  }
}
