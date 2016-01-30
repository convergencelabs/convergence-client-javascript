module convergence {

  'use strict';

  import ConvergenceConnection = convergence.connection.ConvergenceConnection;
  import Session = convergence.Session;

  class SessionImpl implements Session {

    private _domain: ConvergenceDomain;
    private _connection: ConvergenceConnection;
    private _sessionId: string;
    private _userame: string;

    constructor(domain: ConvergenceDomain, connection: ConvergenceConnection, sessionId: string, username: string) {
      this._domain = domain;
      this._sessionId = sessionId;
      this._userame = username;
      this._connection = connection;
    }

    /**
     * @return The ConvergenceDomain for this session
     */
    getConvergenceDomain(): ConvergenceDomain {
      return this._domain;
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

    /**
     * @return True if the client is connected to the domain
     */
    isConnected(): boolean {
      return this._connection.isConnected();
    }

    /**
     * @return True if the client is authenticated
     */
    isAuthenticated(): boolean {
      return this._domain.isAuthenticated();
    }
  }
}
